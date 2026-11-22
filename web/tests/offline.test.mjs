import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const web = join(repoRoot, "web");

const sw = () => readFileSync(join(web, "public", "sw.js"), "utf8");

test("offline service worker exists at public/sw.js", () => {
  assert.ok(existsSync(join(web, "public", "sw.js")));
});

test("service worker never caches video streams", () => {
  const src = sw();
  // /api/video/* requests pass straight through before any respondWith.
  assert.ok(src.includes('startsWith("/api/video/")'));
  // The videos cache belongs to VideoPlayer's Save Offline flow only —
  // the worker must never open, read, or delete it.
  assert.ok(!src.includes("lp-offline-videos-v1"));
  // ...and never caches the ~90MB Pyodide runtime either.
  assert.ok(src.includes('startsWith("/pyodide/")'));
});

test("service worker precaches the app shell", () => {
  const src = sw();
  for (const url of [
    '"/"',
    '"/learn/python-home"',
    '"/courses"',
    '"/offline"',
    '"/lp-logo.png"',
    '"/icon.png"',
  ]) {
    assert.ok(src.includes(url), `precache must include ${url}`);
  }
});

test("service worker serves navigations network-first with cache fallback", () => {
  const src = sw();
  assert.ok(src.includes('request.mode === "navigate"'));
  assert.ok(src.includes('caches.match("/offline")'));
  // Lesson catalog API + static chunks are cached; everything else
  // (auth, AI, GitHub, RSC payloads) stays network-only.
  assert.ok(src.includes('"/api/lessons"'));
  assert.ok(src.includes('"/_next/static/"'));
});

test("service worker skips non-GET and cross-origin requests", () => {
  const src = sw();
  assert.ok(src.includes('request.method !== "GET"'));
  assert.ok(src.includes("url.origin !== self.location.origin"));
});

test("service worker deletes old versioned caches on activate", () => {
  const src = sw();
  assert.ok(src.includes('"activate"'));
  assert.ok(src.includes("caches.delete"));
  assert.ok(src.includes('startsWith(PREFIX)'));
  assert.ok(src.includes('const PREFIX = "lp-sw-"'));
  // Versioned names, so a new deploy doesn't serve a stale shell.
  assert.ok(src.includes("lp-sw-"));
  assert.ok(src.includes("VERSION"));
});

test("service worker registration is guarded to the live website", () => {
  const reg = readFileSync(
    join(web, "src", "components", "OfflineRegister.tsx"),
    "utf8",
  );
  // Never inside the Tauri desktop app.
  assert.ok(reg.includes("isTauri()"));
  // Only on https (localhost allowed: secure context, offline testing).
  assert.ok(reg.includes('"https:"'));
  assert.ok(reg.includes("localhost"));
  // Never throws on browsers without service-worker support.
  assert.ok(reg.includes('"serviceWorker" in navigator'));
  assert.ok(reg.includes(".catch(() => undefined)"));
  const layout = readFileSync(join(web, "src", "app", "layout.tsx"), "utf8");
  assert.ok(layout.includes("<OfflineRegister />"));
});

test("offline fallback page exists and links back", () => {
  const page = join(web, "src", "app", "offline", "page.tsx");
  assert.ok(existsSync(page));
  const src = readFileSync(page, "utf8");
  assert.ok(src.includes("offline"));
  assert.ok(src.includes('href="/learn/python-home"'));
  assert.ok(src.includes('href="/"'));
});

test("session check falls back to the last-known user when offline", () => {
  const src = readFileSync(join(web, "src", "lib", "auth-client.ts"), "utf8");
  assert.ok(src.includes("lp_last_user"));
  // Stored on a successful check, cleared on 401 and on sign-out.
  assert.ok(src.includes("storeLastUser(user)"));
  assert.ok(src.includes("clearLastUser()"));
  // A failed fetch resolves to the stored user instead of rejecting.
  assert.ok(src.includes(".catch(() => readLastUser())"));
});

const downloads = () =>
  readFileSync(join(web, "src", "lib", "offline-downloads.ts"), "utf8");
const player = () =>
  readFileSync(join(web, "src", "components", "VideoPlayer.tsx"), "utf8");

test("Wi-Fi only toggle defaults ON and gates warming", () => {
  const src = downloads();
  assert.ok(src.includes("WIFI_ONLY_KEY"));
  // Default ON: only an explicit "false" turns it off.
  assert.ok(src.includes('!== "false"'));
  // maybeWarmLessons refuses when the toggle is off.
  assert.ok(src.includes("if (!isWifiOnlyEnabled()) return null;"));
});

test("warming skips cached lessons and uses the SW pages cache", () => {
  const src = downloads();
  // The job matches every URL against the cache first, then saves
  // only the missing ones — page AND its static chunks, via the
  // shared helper (a bare cache.add would leave the page unstyled
  // offline).
  assert.ok(src.includes(".match(u)"));
  assert.ok(src.includes("savePageOffline(url)"));
  // Same caches the service worker reads: the lib holds the literal
  // names, sw.js builds them from VERSION — they must agree (the
  // literals below are lp-sw-v1-pages / lp-sw-v1-static, VERSION
  // is "v1").
  assert.ok(src.includes('"lp-sw-v1-pages"'));
  assert.ok(src.includes('"lp-sw-v1-static"'));
  assert.ok(sw().includes("lp-sw-${VERSION}-pages"));
  assert.ok(sw().includes("lp-sw-${VERSION}-static"));
  assert.ok(sw().includes('const VERSION = "v1"'));
  // Progress persists so the job resumes across reloads.
  assert.ok(src.includes("WARM_PROGRESS_KEY"));
  assert.ok(src.includes("readWarmProgress"));
});

test("warming needs a signed-in user and a good connection", () => {
  const src = downloads();
  assert.ok(src.includes("fetchSessionUser"));
  assert.ok(src.includes("connectionAllowsWarming"));
  assert.ok(src.includes("saveData"));
  assert.ok(src.includes('"4g"'));
  // The honest limit is written in the code, not just the report.
  assert.ok(src.includes("cannot truly detect Wi-Fi"));
});

test("lessons warm after sign-in, never in Tauri", () => {
  const warmer = readFileSync(
    join(web, "src", "components", "OfflineWarmer.tsx"),
    "utf8",
  );
  assert.ok(warmer.includes("maybeWarmLessons"));
  assert.ok(warmer.includes("isTauri()"));
  const layout = readFileSync(join(web, "src", "app", "layout.tsx"), "utf8");
  assert.ok(layout.includes("<OfflineWarmer />"));
});

test("selecting a video does NOT auto-save it offline", () => {
  const src = player();
  // No auto-save: selecting a video must not start a download on its
  // own — the user taps Save Offline. The load-source effect only
  // checks the cache and plays the stream.
  assert.ok(!src.includes("handleSaveOffline(true)"));
  assert.ok(!src.includes("auto = false"));
  // Manual save still exists and swaps to the cached file.
  assert.ok(src.includes("onClick={() => void handleSaveOffline()}"));
});

test("settings + courses pages are warmed for offline", () => {
  const src = downloads();
  // The playlist page fell back to /offline: client-side navigation
  // never caches a page's HTML, and the lessons warmer only covered
  // /learn/*. The app pages warm the same way (HTML + chunks).
  assert.ok(src.includes("warmAppPages"));
  assert.ok(src.includes("maybeWarmAppPages"));
  assert.ok(src.includes('"/settings"'));
  assert.ok(src.includes('"/courses"'));
  // Playlist + one-shot pages come from the catalog, loaded on
  // demand so the shared layout chunk stays lean.
  assert.ok(src.includes("@/lib/courses/data"));
  assert.ok(src.includes("COURSE_CREATORS"));
  assert.ok(src.includes("playlistListId"));
  assert.ok(src.includes("/one-shots"));
  // Same gates as lessons (online, Wi-Fi, signed in) but NOT the
  // first-sign-in Yes/No — Maalik ordered these pages cached.
  assert.ok(src.includes("isWifiOnlyEnabled()"));
  assert.ok(src.includes("fetchSessionUser"));
  const warmer = readFileSync(
    join(web, "src", "components", "OfflineWarmer.tsx"),
    "utf8",
  );
  assert.ok(warmer.includes("maybeWarmAppPages"));
  const settings = readFileSync(
    join(web, "src", "app", "settings", "page.tsx"),
    "utf8",
  );
  assert.ok(settings.includes("maybeWarmAppPages"));
});

test("video download shows a visible progress bar while saving", () => {
  const src = player();
  assert.ok(src.includes("isDownloading"));
  assert.ok(src.includes("downloadProgress"));
  // A thin bar whose width follows the download progress.
  assert.ok(src.includes("Math.max(downloadProgress, 2)"));
  assert.ok(src.includes("h-1 overflow-hidden rounded-full"));
  assert.ok(src.includes("t.player.savingPct(downloadProgress)"));
});

test("saved videos are listed and deletable in Settings", () => {
  const src = downloads();
  assert.ok(src.includes("noteSavedVideo"));
  assert.ok(src.includes("forgetSavedVideo"));
  assert.ok(src.includes("getSavedVideos"));
  assert.ok(src.includes("removeSavedVideo"));
  const settings = readFileSync(
    join(web, "src", "app", "settings", "page.tsx"),
    "utf8",
  );
  assert.ok(settings.includes("t.offline.savedVideos"));
  assert.ok(settings.includes("t.offline.removeSaved"));
  assert.ok(settings.includes("handleRemoveSaved"));
  // The player records a save and forgets a removal.
  const p = player();
  assert.ok(p.includes("noteSavedVideo(lessonId, videoTitle(videoId, title))"));
  assert.ok(p.includes("forgetSavedVideo(lessonId)"));
});

test("offline i18n keys exist in the type and every language", () => {
  const type = readFileSync(
    join(web, "src", "lib", "i18n", "index.tsx"),
    "utf8",
  );
  const keys = [
    "heading",
    "wifiOnly",
    "wifiOnlyHint",
    "lessonsLabel",
    "lessons",
    "lessonsReady",
    "lessonsDownloading",
    "lessonsWaiting",
    "savedVideos",
    "noSavedVideos",
    "removeSaved",
    "savedLessons",
    "deleteAll",
    "confirmDeleteAll",
    "downloadAgain",
    "noSavedLessons",
    "askTitle",
    "askBody",
    "askYes",
    "askNo",
    "askWaitingWifi",
    "askGotIt",
    "saveLesson",
    "lessonSaved",
    "savingLesson",
    "saveFailed",
    "hardRefreshTip",
    "offlineBanner",
  ];
  for (const k of keys)
    assert.ok(type.includes(`${k}:`), `type must have offline.${k}`);
  for (const lang of [
    "en",
    "hi-roman",
    "fr",
    "ja",
    "ko",
    "es",
    "de",
    "pt",
    "ru",
    "ar",
    "zh",
  ]) {
    const src = readFileSync(
      join(web, "src", "lib", "i18n", `${lang}.ts`),
      "utf8",
    );
    for (const k of keys)
      assert.ok(
        src.includes(`${k}:`),
        `${lang} must have offline.${k}`,
      );
  }
});

test("first-sign-in popup asks a real question: Yes and No are equal choices", () => {
  const src = readFileSync(
    join(web, "src", "components", "OfflineDownloadPopup.tsx"),
    "utf8",
  );
  // A real question with two clear choices, side by side, same size.
  assert.ok(src.includes("t.offline.askTitle"));
  assert.ok(src.includes("t.offline.askBody(ALL_LEARN_TOPICS.length)"));
  assert.ok(src.includes("t.offline.askYes"));
  assert.ok(src.includes("t.offline.askNo"));
  assert.ok(
    src.includes("grid-cols-2"),
    "both choices share one row, equally sized",
  );
  // No X / Escape escape hatch: answering is the only way out.
  const lucide = src.match(/import \{([^}]*)\} from "lucide-react"/);
  assert.ok(
    lucide &&
      lucide[1].split(",").map((s) => s.trim()).sort().join() ===
        "Download,Wifi",
    "no X icon imported for the popup",
  );
  assert.ok(!src.includes("keydown"), "no Escape dismissal");
  // Yes starts the warming job in the background (the Wi-Fi gate
  // is checked synchronously first, so the popup closes at once
  // instead of waiting for 812 pages to download).
  assert.ok(src.includes("void maybeWarmLessons()"));
  assert.ok(src.includes("connectionAllowsWarming()"));
  assert.ok(src.includes("isWifiOnlyEnabled()"));
  // If the gate blocks the start, the popup says so instead of
  // silently doing nothing.
  assert.ok(src.includes("t.offline.askWaitingWifi"));
});

test("popup shows once: the answered flag gates it, and No starts nothing", () => {
  const lib = readFileSync(
    join(web, "src", "lib", "offline-downloads.ts"),
    "utf8",
  );
  assert.ok(lib.includes('DOWNLOAD_OFFER_KEY = "lp_offline_download_asked"'));
  assert.ok(lib.includes("getDownloadOfferAnswer"));
  assert.ok(lib.includes("markDownloadOfferAnswered"));
  const popup = readFileSync(
    join(web, "src", "components", "OfflineDownloadPopup.tsx"),
    "utf8",
  );
  // Both answers persist the flag.
  assert.ok(popup.includes('markDownloadOfferAnswered("yes")'));
  assert.ok(popup.includes('markDownloadOfferAnswered("no")'));
  // The No handler starts nothing: no warming call in its body.
  const noStart = popup.indexOf("function handleNo()");
  assert.ok(noStart > -1);
  const noEnd = popup.indexOf("}", popup.indexOf("onClose();", noStart));
  assert.ok(
    !popup.slice(noStart, noEnd).includes("maybeWarmLessons"),
    "No must not start any download",
  );
  // The navbar only opens the popup while the question is unanswered.
  const nav = readFileSync(
    join(web, "src", "components", "AppNavbar.tsx"),
    "utf8",
  );
  assert.ok(nav.includes("getDownloadOfferAnswer() !== null"));
  assert.ok(nav.includes("maybeShowDownloadPopup"));
});

test("popup follows the roadmap close, or the first sign-in when the roadmap doesn't show", () => {
  const nav = readFileSync(
    join(web, "src", "components", "AppNavbar.tsx"),
    "utf8",
  );
  // Main path: the roadmap's first-close hint is dismissed, then
  // the download question appears.
  const gotIt = nav.indexOf("function handleRoadmapHintGotIt()");
  assert.ok(gotIt > -1);
  assert.ok(
    nav.slice(gotIt, gotIt + 400).includes("maybeShowDownloadPopup()"),
  );
  // Fallback: the roadmap already showed (or was suppressed) when
  // the user signs in — ask the question anyway, once.
  const effect = nav.indexOf("localStorage.getItem(ROADMAP_SEEN_KEY)");
  assert.ok(effect > -1);
  assert.ok(
    nav.slice(effect, effect + 900).includes("maybeShowDownloadPopup()"),
  );
  assert.ok(nav.includes("<OfflineDownloadPopup"));
});

test("background warmer waits for a Yes answer to the download question", () => {
  const lib = readFileSync(
    join(web, "src", "lib", "offline-downloads.ts"),
    "utf8",
  );
  assert.ok(lib.includes("maybeWarmLessonsAuto"));
  assert.ok(lib.includes('getDownloadOfferAnswer() !== "yes"'));
  const warmer = readFileSync(
    join(web, "src", "components", "OfflineWarmer.tsx"),
    "utf8",
  );
  assert.ok(warmer.includes("maybeWarmLessonsAuto()"));
  assert.ok(
    !warmer.includes("maybeWarmLessons()"),
    "the warmer must not call the explicit start",
  );
});

test("per-lesson breadcrumb button saves that one lesson offline", () => {
  const btn = readFileSync(
    join(web, "src", "components", "LessonOfflineButton.tsx"),
    "utf8",
  );
  // Writes the lesson page straight into the SW's pages cache —
  // the same cache the warming job uses, so it works even when the
  // bulk download never ran. The save goes through the shared
  // helper, so the page's CSS/JS chunks land in the static cache
  // with it (a bare cache.add would leave the page unstyled offline).
  assert.ok(btn.includes("PAGES_CACHE"));
  assert.ok(btn.includes("savePageOffline(`/learn/${slug}`)"));
  // Visible saved state once cached.
  assert.ok(btn.includes("t.offline.lessonSaved"));
  assert.ok(btn.includes("t.offline.saveLesson"));
  assert.ok(btn.includes("t.offline.savingLesson"));
  // The bulk job saving this lesson while the page is open flips
  // the button to Saved.
  assert.ok(btn.includes("WARM_EVENT"));
  const page = readFileSync(
    join(web, "src", "app", "learn", "[slug]", "page.tsx"),
    "utf8",
  );
  assert.ok(page.includes("<LessonOfflineButton slug={slug} />"));
  // It sits in the breadcrumb row, next to the section › title.
  const nav = page.indexOf(
    '<nav className="flex flex-wrap items-center justify-between gap-3">',
  );
  assert.ok(nav > -1);
  assert.ok(
    page
      .slice(nav, nav + 1200)
      .includes("<LessonOfflineButton slug={slug} />"),
  );
});

test("warm progress counts what is really cached, never double-counts", () => {
  const src = readFileSync(
    join(web, "src", "lib", "offline-downloads.ts"),
    "utf8",
  );
  // The job counts cache matches first (so a lesson saved from its
  // breadcrumb already counts), then fetches only the missing pages.
  assert.ok(src.includes(".match(u)"));
  assert.ok(src.includes("urls.map((u)"));
  assert.ok(
    src.includes("const pending = urls.filter("),
  );
  // ...skipping pages already cached AND pages the user deleted
  // (the blocklist), so a delete is never silently undone.
  assert.ok(src.includes("const deleted = new Set(getDeletedLessons())"));
  assert.ok(
    src.includes("(_, i) => !cached[i] && !deleted.has(ALL_LEARN_TOPICS[i].slug)"),
  );
  assert.ok(
    src.includes("for (let i = 0; i < pending.length; i += WARM_BATCH)"),
  );
});

test("Settings toggle still starts a download after a No (explicit action)", () => {
  const settings = readFileSync(
    join(web, "src", "app", "settings", "page.tsx"),
    "utf8",
  );
  // Flipping Wi-Fi on is an explicit user action: it calls the
  // explicit start, not the auto gate that respects a No.
  const toggle = settings.indexOf("function handleWifiToggle");
  assert.ok(toggle > -1);
  assert.ok(
    settings.slice(toggle, toggle + 300).includes("maybeWarmLessons()"),
  );
  assert.ok(
    !settings
      .slice(toggle, toggle + 300)
      .includes("maybeWarmLessonsAuto"),
  );
});

test("saving a page offline also caches its static chunks", () => {
  const src = downloads();
  // One helper, used by the warmer and the breadcrumb button.
  assert.ok(src.includes("export async function savePageOffline"));
  // The page HTML goes into the pages cache...
  assert.ok(src.includes("new Response(html"));
  assert.ok(src.includes('"Content-Type": "text/html'));
  // ...and every /_next/static/ URL it references goes into the
  // static cache (deduplicated — the same chunk appears many times
  // in one page).
  assert.ok(src.includes("const STATIC_URLS = /"));
  assert.ok(src.includes("html.match(STATIC_URLS)"));
  assert.ok(src.includes("STATIC_CACHE"));
  assert.ok(src.includes("new Set("));
  // Assets already cached are skipped (all lessons share chunks),
  // and a failed asset never fails the page save.
  assert.ok(src.includes("statics.match(a)"));
  assert.ok(src.includes("statics.add(a).catch(() => undefined)"));
});

test("service worker precache caches each page's static chunks", () => {
  const src = sw();
  // The install step parses each precached page for its chunks.
  assert.ok(src.includes("precachePage"));
  assert.ok(src.includes("html.match("));
  assert.ok(src.includes("new Set("));
  // Chunks land in the static cache, next to the pages cache.
  assert.ok(src.includes("caches.open(STATIC)"));
  assert.ok(src.includes("statics.add(a)"));
  // Already-cached chunks are skipped; a failed chunk never fails
  // the page (and only HTML pages are parsed — images skip it).
  assert.ok(src.includes("statics.match(a)"));
  assert.ok(src.includes("text/html"));
  assert.ok(src.includes(".catch(() => undefined)"));
});

test("saved lessons open in a drill-down view with breadcrumbs and are deletable one by one", () => {
  const src = downloads();
  // The list shows what is REALLY cached (cache.match per lesson,
  // like the warmer counts), in curriculum order, with the
  // breadcrumb parts — section title + lesson title.
  assert.ok(src.includes("export async function getSavedLessons"));
  assert.ok(src.includes(".match(`/learn/${t.slug}`)"));
  assert.ok(src.includes("sectionTitle: t.sectionTitle"));
  assert.ok(src.includes("title: t.title"));
  // Deleting one lesson removes only its HTML from the pages cache.
  assert.ok(src.includes("export async function removeSavedLesson"));
  assert.ok(src.includes("cache.delete(`/learn/${slug}`)"));
  // The shared static chunks stay — deleting them would break every
  // other saved lesson (and the shell pages).
  assert.ok(!src.includes("statics.delete"));
  const settings = readFileSync(
    join(web, "src", "app", "settings", "page.tsx"),
    "utf8",
  );
  // Drill-down, mirroring the editor's AI Settings card: the
  // "Offline lessons" row is a tappable entry that opens the lessons
  // view, and the back arrow returns to the overview.
  assert.ok(settings.includes("lessonsOpen"));
  assert.ok(settings.includes("setLessonsOpen(true)"));
  assert.ok(settings.includes("setLessonsOpen(false)"));
  assert.ok(settings.includes("ArrowLeft"));
  assert.ok(settings.includes("ChevronRight"));
  // Breadcrumb at the top of the view: "Offline > Lessons", with
  // the parent name a button back to the overview.
  assert.ok(settings.includes("t.offline.heading"));
  assert.ok(settings.includes('{" > "}'));
  assert.ok(settings.includes("t.offline.lessons"));
  // The list and both deletes live INSIDE the lessons view — the
  // overview shows only the entry row (count + progress bar).
  assert.ok(
    settings.indexOf("lessonsOpen ? (") <
      settings.indexOf("t.offline.savedLessons"),
    "list must be inside the drill-down view",
  );
  assert.ok(
    settings.indexOf("t.offline.savedLessons") <
      settings.indexOf("setLessonsOpen(true)"),
    "entry row lives in the overview, after the view",
  );
  assert.ok(settings.includes("t.offline.savedLessons"));
  assert.ok(settings.includes("getSavedLessons()"));
  assert.ok(settings.includes("handleRemoveLesson"));
  assert.ok(settings.includes("removeSavedLesson(slug)"));
  // Each row shows the breadcrumb trail, same as the lesson page:
  // section, then lesson title.
  assert.ok(settings.includes("{l.sectionTitle} ›"));
  assert.ok(settings.includes("{l.title}"));
  // A long list scrolls instead of stretching the page.
  assert.ok(settings.includes("max-h-72"));
  assert.ok(settings.includes("overflow-y-auto"));
  // The count + progress bar follow the delete (progress is
  // recomputed from the real cache and broadcast).
  assert.ok(src.includes("syncWarmProgress"));
  assert.ok(src.includes("export async function syncWarmProgress"));
  // ...and only broadcast when something changed, so a listener
  // that refreshes on the event cannot loop.
  assert.ok(src.includes("current.done !== p.done"));
  assert.ok(settings.includes("syncWarmProgress()"));
});

test("deleted lessons are not re-warmed until the user saves them again", () => {
  const src = downloads();
  // A blocklist in localStorage, not a flag the warmer ignores.
  assert.ok(src.includes('DELETED_LESSONS_KEY = "lp_offline_deleted_lessons"'));
  assert.ok(src.includes("export function getDeletedLessons"));
  assert.ok(src.includes("export function addDeletedLesson"));
  assert.ok(src.includes("export function removeDeletedLesson"));
  assert.ok(src.includes("export function clearDeletedLessons"));
  // The warmer skips blocklisted slugs even when they are missing
  // from the cache — otherwise a delete would silently undo itself.
  assert.ok(src.includes("const deleted = new Set(getDeletedLessons())"));
  assert.ok(src.includes("!deleted.has(ALL_LEARN_TOPICS[i].slug)"));
  // Deleting a lesson blocklists it; re-saving it from its lesson
  // page un-blocks it.
  assert.ok(src.includes("addDeletedLesson(slug)"));
  const btn = readFileSync(
    join(web, "src", "components", "LessonOfflineButton.tsx"),
    "utf8",
  );
  assert.ok(btn.includes("removeDeletedLesson(slug)"));
});

test("bulk delete stops the auto-warmer, confirms twice, and can be undone", () => {
  const src = downloads();
  // Clearing all lessons deletes every lesson HTML, blocklists all
  // slugs, and answers the first-sign-in question "no" — so the
  // background warmer does not start again on its own.
  assert.ok(src.includes("export async function clearAllSavedLessons"));
  assert.ok(src.includes('markDownloadOfferAnswered("no")'));
  assert.ok(
    src.includes("writeDeletedLessons(ALL_LEARN_TOPICS.map((t) => t.slug))"),
  );
  // Downloading again un-blocks everything, answers Yes, and runs
  // the explicit start (the same path the Wi-Fi toggle uses).
  assert.ok(src.includes("export async function downloadLessonsAgain"));
  assert.ok(src.includes("clearDeletedLessons()"));
  assert.ok(src.includes('markDownloadOfferAnswered("yes")'));
  assert.ok(src.includes("return maybeWarmLessons();"));
  const settings = readFileSync(
    join(web, "src", "app", "settings", "page.tsx"),
    "utf8",
  );
  // Two taps for 812 lessons: the first arms the confirm, the
  // second deletes. Cancel backs out.
  assert.ok(settings.includes("confirmClear"));
  assert.ok(settings.includes("setConfirmClear(true)"));
  assert.ok(settings.includes("t.offline.confirmDeleteAll"));
  assert.ok(settings.includes("t.offline.deleteAll"));
  assert.ok(settings.includes("t.common.cancel"));
  assert.ok(settings.includes("handleClearAllLessons"));
  // After the wipe the empty list offers the way back.
  assert.ok(settings.includes("t.offline.noSavedLessons"));
  assert.ok(settings.includes("t.offline.downloadAgain"));
  assert.ok(settings.includes("handleDownloadAgain"));
  // The re-download button shows processing at once and cannot be
  // double-tapped: busy state, spinner, live % label, disabled.
  assert.ok(settings.includes("reDownloading"));
  assert.ok(settings.includes("setReDownloading(true)"));
  assert.ok(settings.includes("Loader2"));
  assert.ok(settings.includes("disabled={reDownloading}"));
  assert.ok(settings.includes("t.offline.lessonsDownloading(warmPct)"));
});

test("offline hints: Settings hard-refresh tip and an offline-only banner on every page", () => {
  const settings = readFileSync(
    join(web, "src", "app", "settings", "page.tsx"),
    "utf8",
  );
  // Under the Wi-Fi toggle in the Offline section.
  assert.ok(settings.includes("t.offline.hardRefreshTip"));
  const banner = readFileSync(
    join(web, "src", "components", "OfflineBanner.tsx"),
    "utf8",
  );
  // Only while offline: initial state from navigator.onLine, and
  // online/offline listeners that clear it when back online.
  assert.ok(banner.includes("navigator.onLine"));
  assert.ok(banner.includes('"online"'));
  assert.ok(banner.includes('"offline"'));
  assert.ok(banner.includes("if (!offline) return null;"));
  assert.ok(banner.includes("t.offline.offlineBanner"));
  // Sticky at the top so it never scrolls away, and it publishes
  // its own height so the sticky navbar and sidebar stick below it.
  assert.ok(banner.includes("sticky top-0 z-40"));
  assert.ok(banner.includes("--offline-banner-h"));
  assert.ok(banner.includes("ResizeObserver"));
  assert.ok(banner.includes("offsetHeight"));
  assert.ok(banner.includes("removeProperty(\"--offline-banner-h\")"));
  const navbar = readFileSync(
    join(web, "src", "components", "AppNavbar.tsx"),
    "utf8",
  );
  assert.ok(navbar.includes("top-[var(--offline-banner-h,0px)]"));
  const sidebar = readFileSync(
    join(web, "src", "components", "LearnSidebar.tsx"),
    "utf8",
  );
  assert.ok(sidebar.includes("top-[calc(69px+var(--offline-banner-h,0px))]"));
  assert.ok(
    sidebar.includes("h-[calc(100vh-69px-var(--offline-banner-h,0px))]")
  );
  // Mounted in the root layout, next to the other offline pieces.
  const layout = readFileSync(join(web, "src", "app", "layout.tsx"), "utf8");
  assert.ok(layout.includes("OfflineBanner"));
  assert.ok(layout.includes("<OfflineBanner />"));
});
