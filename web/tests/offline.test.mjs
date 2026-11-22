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
  // The job matches every URL against the cache first, then adds
  // only the missing ones.
  assert.ok(src.includes(".match(u)"));
  assert.ok(src.includes("cache.add(url)"));
  // Same cache the service worker reads for navigations: the lib
  // holds the literal name, sw.js builds it from VERSION — they must
  // agree (the literal below is lp-sw-v1-pages, VERSION is "v1").
  assert.ok(src.includes('"lp-sw-v1-pages"'));
  assert.ok(sw().includes("lp-sw-${VERSION}-pages"));
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

test("selecting a video auto-saves it offline", () => {
  const src = player();
  // Auto-save fires from the load-source effect on a cache miss.
  assert.ok(src.includes("void handleSaveOffline(true)"));
  assert.ok(src.includes("navigator.onLine"));
  // Manual save still exists and swaps to the cached file.
  assert.ok(src.includes("onClick={() => void handleSaveOffline()}"));
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
    "lessonsReady",
    "lessonsDownloading",
    "lessonsWaiting",
    "savedVideos",
    "noSavedVideos",
    "removeSaved",
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
  // bulk download never ran.
  assert.ok(btn.includes("PAGES_CACHE"));
  assert.ok(btn.includes("cache.add(`/learn/${slug}`)"));
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
    src.includes("const pending = urls.filter((_, i) => !cached[i])"),
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
