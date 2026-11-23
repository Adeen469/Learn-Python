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

test("session check never falls back to a stored user when offline", () => {
  const src = readFileSync(join(web, "src", "lib", "auth-client.ts"), "utf8");
  // L16: no identity is stored in localStorage at all — a failed
  // /api/auth/me check resolves to null, so offline the app shows
  // the signed-out state instead of opening gated pages as the
  // previous user on a shared device. The only lp_last_user
  // reference left is the legacy cleanup on sign-out.
  assert.ok(!src.includes("LAST_USER_KEY"), "no last-user key constant may remain");
  assert.ok(!src.includes("readLastUser"), "no stored-user fallback may remain");
  assert.ok(!src.includes("storeLastUser"), "no stored-user write may remain");
  assert.ok(!src.includes("clearLastUser"), "no stored-user clear helper may remain");
  assert.ok(src.includes(".catch(() => null)"), "a failed check must resolve to null");
  // Sign-out still drops any stale copy left by older versions.
  assert.ok(src.includes('localStorage.removeItem("lp_last_user")'));
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

test("courses pages are warmed for offline, settings is NOT", () => {
  const src = downloads();
  // /settings renders the signed-in user's streak/progress, so a
  // cached copy would serve the previous user's data offline on a
  // shared device (R2-M16) — the warmer must never save it.
  const warmFn = src.slice(src.indexOf("export async function warmAppPages"));
  assert.ok(!warmFn.includes('"/settings"'), "warmer must not list /settings");
  assert.ok(!warmFn.includes("'/settings'"), "warmer must not list /settings");
  assert.ok(src.includes("warmAppPages"));
  assert.ok(src.includes("maybeWarmAppPages"));
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
  assert.ok(src.includes("t.offline.askBody(LEARN_TOPIC_COUNT)"));
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
    src.includes("(_, i) => !cached[i] && !deleted.has(LEARN_TOPIC_SLUGS[i])"),
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

test("saving a page offline preserves the original response headers", () => {
  const src = downloads();
  // One helper, used by the warmer and the breadcrumb button.
  assert.ok(src.includes("export async function savePageOffline"));
  // The page HTML goes into the pages cache AS FETCHED (res.clone):
  // rebuilding a Response dropped CSP, X-Frame-Options and HSTS, so
  // a cached page served offline ran with no CSP at all (R2-M16).
  assert.ok(src.includes("const toCache = res.clone();"));
  assert.ok(src.includes("await pages.put(url, toCache);"));
  assert.ok(!src.includes("new Response(html"), "must not rebuild the Response");
  assert.ok(!src.includes('"Content-Type": "text/html'), "must not set headers by hand");
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
  // Authed / session-scoped pages are never saved, even when asked
  // directly — the warmer and the breadcrumb button share this gate.
  assert.ok(src.includes("export function isOfflineCacheableUrl"));
  assert.ok(src.includes("if (!isOfflineCacheableUrl(url)) return false;"));
  for (const p of ['"/auth/"', '"/github"', '"/editor"', '"/settings"']) {
    assert.ok(src.includes(p), `guard must list ${p}`);
  }
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
  assert.ok(src.includes("!deleted.has(LEARN_TOPIC_SLUGS[i])"));
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
    src.includes("writeDeletedLessons([...LEARN_TOPIC_SLUGS])"),
  );
  // Downloading again un-blocks everything, answers Yes, and runs
  // the download directly — NOT through maybeWarmLessons, whose
  // Wi-Fi-only toggle and connection gates silently killed an
  // explicit tap (2026-11-23 re-download bug).
  assert.ok(src.includes("export async function downloadLessonsAgain"));
  assert.ok(src.includes("clearDeletedLessons()"));
  assert.ok(src.includes('markDownloadOfferAnswered("yes")'));
  const again = src.slice(
    src.indexOf("export async function downloadLessonsAgain"),
    src.indexOf("// Saved-videos index"),
  );
  assert.ok(again.includes("return warmLessons();"));
  assert.ok(!again.includes("maybeWarmLessons"));
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

test("service worker never caches authed pages, even when visited", () => {
  const src = sw();
  // /auth/*, /github, /editor, /settings HTML must never land in
  // the pages cache (R2-M16): a cached copy served offline would
  // show the previous user's data on a shared device.
  assert.ok(src.includes("isNoCacheNav"));
  for (const p of [
    'startsWith("/auth/")',
    '"/github"',
    '"/editor"',
    '"/settings"',
  ]) {
    assert.ok(src.includes(p), `navigate guard must list ${p}`);
  }
  // The guard gates BOTH directions: no cache.put on a fresh fetch,
  // and no serving a copy an older worker cached — offline it falls
  // back to /offline instead.
  const nav = src.slice(src.indexOf("async function navigate"));
  assert.ok(nav.includes("if (res.ok && !noCache)"));
  assert.ok(nav.includes("if (!noCache)"));
  assert.ok(nav.includes('caches.match("/offline")'));
});

test("sign-out purges the previous user's offline footprint", () => {
  const auth = readFileSync(
    join(web, "src", "lib", "auth-client.ts"),
    "utf8",
  );
  // signOut wires the purge in (dynamic import: offline-downloads
  // imports auth-client, so a static import would be a cycle).
  assert.ok(auth.includes("clearOfflineUserData"));
  assert.ok(auth.includes('await import('));
  assert.ok(auth.includes('"@/lib/offline-downloads"'));
  const lib = downloads();
  assert.ok(lib.includes("export async function clearOfflineUserData"));
  // The purge drops all three user-data caches — pages, data AND
  // the videos cache (the SW itself never touches the videos cache;
  // the purge lives in the page, not the worker).
  assert.ok(lib.includes("caches.delete(PAGES_CACHE)"));
  assert.ok(lib.includes("caches.delete(DATA_CACHE)"));
  assert.ok(lib.includes("caches.delete(VIDEO_CACHE)"));
  // ...and clears the user-data keys: every lp_ai_* key plus the
  // saved-video index + warm state. Scoped to the purge-list slice —
  // a whole-file check would also match the explanatory comment that
  // names the keys the purge deliberately KEEPS.
  const purgeList = lib.slice(
    lib.indexOf("export const OFFLINE_USER_DATA_KEYS"),
    lib.indexOf("];", lib.indexOf("export const OFFLINE_USER_DATA_KEYS")),
  );
  for (const k of [
    '"lp_ai_byok"',
    '"lp_ai_chats"',
    '"lp_ai_current_chat"',
    '"lp_ai_active_skills"',
    '"lp_ai_custom_skills"',
    '"lp_ai_selector_models"',
    "SAVED_VIDEOS_KEY",
    "WARM_PROGRESS_KEY",
    "DELETED_LESSONS_KEY",
    "DOWNLOAD_OFFER_KEY",
  ]) {
    assert.ok(purgeList.includes(k), `purge must clear ${k}`);
  }
  // Progress / streak are local-only user work with no server copy,
  // so the purge deliberately KEEPS them (R3-M3 adjudication) — they
  // must not be in the purge list.
  for (const k of [
    '"lp_completed_lessons"',
    '"lp_learn_completed"',
    '"lp_last_visited"',
    '"lp_streak_restores"',
  ]) {
    assert.ok(!purgeList.includes(k), `purge must keep ${k} (local-only user work)`);
  }
  // Account-tied, re-derivable keys the fixed list cannot name are
  // purged by prefix scan instead (R3-M3).
  assert.ok(lib.includes('PURGE_KEY_PREFIXES = ["lp_open_repo_", "lp_github_", "lp_coverage_"]'), "purge must scan the open-repo, github and coverage prefixes");
  assert.ok(lib.includes("purgePrefixedUserData()"), "clearOfflineUserData must run the prefix scan");
  // Device preferences stay: theme, language, volume and the
  // Wi-Fi-only toggle are not user data.
  const purge = lib.slice(lib.indexOf("export const OFFLINE_USER_DATA_KEYS"));
  assert.ok(!purge.includes('"lp_theme"'), "theme must survive sign-out");
  assert.ok(!purge.includes('"lp_language"'), "language must survive sign-out");
  assert.ok(!purge.includes("WIFI_ONLY_KEY"), "Wi-Fi toggle must survive sign-out");
  // Best-effort: the purge never throws, so sign-out still proceeds.
  assert.ok(lib.includes("export async function clearOfflineUserData"));
  assert.ok(
    purge.includes("} catch {"),
    "cache deletes must be guarded",
  );
  // The data cache name agrees with sw.js, like pages/static do.
  assert.ok(lib.includes('"lp-sw-v1-data"'));
  assert.ok(sw().includes("lp-sw-${VERSION}-data"));
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

test("explicit download bypasses the auto gates and says why it stopped", () => {
  const src = downloads();
  const again = src.slice(
    src.indexOf("export async function downloadLessonsAgain"),
    src.indexOf("// Saved-videos index"),
  );
  // An explicit tap calls warmLessons() directly — no
  // maybeWarmLessons, so the Wi-Fi-only toggle and the connection
  // heuristic cannot silently kill a download the user asked for.
  assert.ok(again.includes("return warmLessons();"));
  assert.ok(!again.includes("maybeWarmLessons"));
  assert.ok(!again.includes("isWifiOnlyEnabled"));
  assert.ok(!again.includes("connectionAllowsWarming"));
  // The real blocks stay: offline, and no signed-in session (which
  // also purges the previous user's saved videos).
  assert.ok(again.includes("navigator.onLine"));
  assert.ok(again.includes("fetchSessionUser"));
  assert.ok(again.includes("purgeSavedVideos()"));
  // ...and each one travels back as a reason instead of null.
  assert.ok(again.includes('blockedReason: "offline"'));
  assert.ok(again.includes('blockedReason: "signed-out"'));
  // The storage cap still stops a run, but says so — and only when
  // the run actually stopped short.
  const warm = src.slice(
    src.indexOf("export async function warmLessons()"),
    src.indexOf("// App pages for offline"),
  );
  assert.ok(warm.includes('progress.blockedReason = "storage-full"'));
  assert.ok(warm.includes("done < total"));
  assert.ok(warm.includes('progress.state !== "waiting"'));
  assert.ok(warm.includes("!(await storageWithinWarmCap())"));
  // No stored-"done" gate on the explicit path: warmLessons counts
  // what is really cached before deciding anything is done.
  assert.ok(warm.includes("const cached = await Promise.all"));
  // Settings shows the reason under the button.
  const settings = readFileSync(
    join(web, "src", "app", "settings", "page.tsx"),
    "utf8",
  );
  assert.ok(settings.includes("downloadNote"));
  assert.ok(settings.includes("t.offline.downloadBlockedOffline"));
  assert.ok(settings.includes("t.offline.downloadBlockedSignedOut"));
  assert.ok(settings.includes("t.offline.downloadBlockedStorage"));
  // ...and the strings exist in every language (English is the
  // source of truth; the type requires all three everywhere).
  const index = readFileSync(
    join(web, "src", "lib", "i18n", "index.tsx"),
    "utf8",
  );
  for (const key of [
    "downloadBlockedOffline",
    "downloadBlockedSignedOut",
    "downloadBlockedStorage",
  ]) {
    assert.ok(index.includes(`${key}: string;`), `type must list ${key}`);
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
      const bundle = readFileSync(
        join(web, "src", "lib", "i18n", `${lang}.ts`),
        "utf8",
      );
      assert.ok(bundle.includes(`${key}:`), `${lang} must translate ${key}`);
    }
  }
});
