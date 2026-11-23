// Auto-offline downloads: warm every lesson page into the service
// worker's pages cache after sign-in, and keep an index of videos
// saved offline. The Settings page and the whole Courses tree are
// warmed the same way (warmAppPages) — client-side navigation never
// caches a page's HTML, so without it a playlist page falls back to
// /offline. Cache API + localStorage only, no new dependency.
//
// HONEST LIMIT: web pages cannot truly detect Wi-Fi vs mobile data —
// no browser API exposes it. The "Wi-Fi only" toggle below is a user
// promise (default ON): warming only starts when the toggle is on AND
// the connection heuristic (navigator.connection) says the link looks
// like unmetered broadband. It can be wrong in both directions: a
// phone on Wi-Fi with a poor signal may read as cellular, and a fast
// cellular link may read as broadband. The toggle, not the heuristic,
// is the real gate — turning it off stops all automatic downloads.

// LAZY lesson index: this module is in the shared layout chunk
// (OfflineWarmer) and the navbar, so it must NOT statically import
// the full sidebar tree (53KB of sections/groups/titles for all 812
// topics) — that shipped the whole tree on every page. What the
// warmer needs is only the ordered SLUGS, which live in the small
// ./learn/topic-slugs.ts list (~17KB, no titles). The full tree
// (titles for the Settings saved-lessons list) loads with a dynamic
// import() inside getSavedLessons only, when that list actually
// renders. Same pattern as the courses catalog in warmAppPages below.
import { LEARN_TOPIC_SLUGS } from "@/lib/learn/topic-slugs";
import { fetchSessionUser } from "@/lib/auth-client";

export const WIFI_ONLY_KEY = "lp_offline_wifi_only";
export const WARM_PROGRESS_KEY = "lp_offline_warm_progress";
export const SAVED_VIDEOS_KEY = "lp_offline_saved_videos";
// The first-sign-in question ("lessons download karna hai ya nahi?").
// Stores the ANSWER — "yes" or "no" — so the popup asks exactly
// once. "yes" means the background warmer may run on its own; "no"
// means it never auto-starts (the user can still start a download
// later from Settings or a lesson page). Unanswered (null) also
// means the warmer waits — the popup is the decision point.
export const DOWNLOAD_OFFER_KEY = "lp_offline_download_asked";
// Slugs the user deleted in Settings. The warmer skips them, so a
// deleted lesson is not silently re-downloaded on the next run.
export const DELETED_LESSONS_KEY = "lp_offline_deleted_lessons";
export const WARM_EVENT = "lp-offline-warm";
// Must match VERSION + PAGES in public/sw.js (tested).
export const PAGES_CACHE = "lp-sw-v1-pages";
// Must match VERSION + STATIC in public/sw.js (tested).
export const STATIC_CACHE = "lp-sw-v1-static";
// Must match VERSION + DATA in public/sw.js (tested).
export const DATA_CACHE = "lp-sw-v1-data";
// Same cache VideoPlayer's Save Offline flow uses (tested).
export const VIDEO_CACHE = "lp-offline-videos-v1";

// Paths whose HTML must never be cached offline (R2-M16) — same
// list as sw.js navigate(): authed / session-scoped pages. A cached
// /settings page served offline would render the previous user's
// streak/progress on a shared device.
export function isOfflineCacheableUrl(url: string): boolean {
  let pathname = url;
  try {
    pathname = new URL(url, "http://localhost").pathname;
  } catch {
    // Unparseable — treat the raw string as the path.
  }
  return !(
    pathname.startsWith("/auth/") ||
    pathname === "/github" ||
    pathname.startsWith("/github/") ||
    pathname === "/editor" ||
    pathname.startsWith("/editor/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/")
  );
}

export type WarmState = "idle" | "warming" | "waiting" | "done";

export interface WarmProgress {
  done: number;
  total: number;
  state: WarmState;
}

export interface SavedVideo {
  lessonId: string;
  title: string;
  savedAt: string;
}

const WARM_BATCH = 4;

function storageGet(key: string): string | null {
  try {
    return typeof window === "undefined"
      ? null
      : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    if (typeof window !== "undefined")
      window.localStorage.setItem(key, value);
  } catch {
    // Private mode etc. — progress just won't persist.
  }
}

function storageRemove(key: string): void {
  try {
    if (typeof window !== "undefined")
      window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

export type DownloadOfferAnswer = "yes" | "no";

export function getDownloadOfferAnswer(): DownloadOfferAnswer | null {
  const v = storageGet(DOWNLOAD_OFFER_KEY);
  return v === "yes" || v === "no" ? v : null;
}

export function markDownloadOfferAnswered(
  answer: DownloadOfferAnswer,
): void {
  storageSet(DOWNLOAD_OFFER_KEY, answer);
}

// Wi-Fi only toggle. Default ON: nothing is stored yet, and an
// explicit "false" is the only way to turn it off.
export function isWifiOnlyEnabled(): boolean {
  return storageGet(WIFI_ONLY_KEY) !== "false";
}

export function setWifiOnlyEnabled(enabled: boolean): void {
  storageSet(WIFI_ONLY_KEY, enabled ? "true" : "false");
}

// Connection heuristic from navigator.connection (Chrome/Android
// only — everywhere else it is undefined and the toggle alone
// decides). Never warm on a data-saver connection or a slow link.
export function connectionAllowsWarming(): boolean {
  if (typeof navigator === "undefined") return true;
  const conn = (
    navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        saveData?: boolean;
        downlink?: number;
      };
    }
  ).connection;
  if (!conn) return true;
  if (conn.saveData) return false;
  if (conn.effectiveType && conn.effectiveType !== "4g") return false;
  if (typeof conn.downlink === "number" && conn.downlink < 1.5)
    return false;
  return true;
}

export function readWarmProgress(): WarmProgress {
  const total = LEARN_TOPIC_SLUGS.length;
  try {
    const raw = storageGet(WARM_PROGRESS_KEY);
    if (!raw) return { done: 0, total, state: "idle" };
    const p = JSON.parse(raw) as Partial<WarmProgress>;
    if (typeof p.done !== "number") return { done: 0, total, state: "idle" };
    return {
      done: Math.min(p.done, total),
      total,
      state: p.state === "done" ? "done" : "idle",
    };
  } catch {
    return { done: 0, total, state: "idle" };
  }
}

function writeWarmProgress(p: WarmProgress): void {
  storageSet(WARM_PROGRESS_KEY, JSON.stringify(p));
}

export function emitWarm(p: WarmProgress): void {
  try {
    if (typeof window !== "undefined")
      window.dispatchEvent(new CustomEvent(WARM_EVENT, { detail: p }));
  } catch {
    // Ignore.
  }
}

let warming = false;

// Start warming when every gate passes: online, signed in, the
// toggle on, the connection looks like broadband, and not
// everything is already cached. Safe to call on mount, on "online",
// on focus, or right after the toggle flips — a second call while a
// run is in flight is a no-op.
//
// R3-L18: the session check runs FIRST (after the online gate):
// with no valid session the previous user's saved videos are
// purged, so a signed-out / expired / revoked session cannot keep
// playing them offline. This is the same session check the warmer
// already runs on every app load (OfflineWarmer) — fetchSessionUser
// is a cached promise, so no new network call. Offline is excluded
// above, so a null here while online means no session, not no
// network — and the videos are re-downloadable anyway.
export async function maybeWarmLessons(): Promise<WarmProgress | null> {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  if (warming) return readWarmProgress();
  if (!navigator.onLine) return null;
  const user = await fetchSessionUser().catch(() => null);
  if (!user) {
    await purgeSavedVideos();
    return null;
  }
  if (!isWifiOnlyEnabled()) return null;
  if (!connectionAllowsWarming()) return null;
  const p = readWarmProgress();
  if (p.state === "done" && p.done >= p.total) return p;
  return warmLessons();
}

// Automatic warming (OfflineWarmer on mount / online / focus):
// only when the user already said Yes to the first-sign-in
// question. An unanswered or No answer means no background job —
// the popup asks first, and a No is respected until the user
// starts a download themselves (Settings toggle or popup Yes).
export async function maybeWarmLessonsAuto(): Promise<WarmProgress | null> {
  if (getDownloadOfferAnswer() !== "yes") return null;
  return maybeWarmLessons();
}

// Save one page offline WITH the CSS/JS it needs. A page alone
// renders unstyled offline — its chunks live in /_next/static/
// and nothing fetches them until the page is actually visited
// online. Asset failures never fail the page save, and assets
// already cached are skipped (every lesson shares the same chunks).
const STATIC_URLS = /\/_next\/static\/[^\s"'\)]+/g;

export async function savePageOffline(url: string): Promise<boolean> {
  // Authed / session-scoped pages are never cached (R2-M16).
  if (!isOfflineCacheableUrl(url)) return false;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    // Cache the response AS FETCHED (res.clone()), not a rebuilt
    // Response: rebuilding dropped CSP, X-Frame-Options and HSTS,
    // so a cached page served offline ran with no CSP at all. The
    // clone keeps the original headers; res.text() below reads the
    // other half of the tee for the chunk scan.
    const toCache = res.clone();
    const html = await res.text();
    const pages = await caches.open(PAGES_CACHE);
    await pages.put(url, toCache);
    const assets = [...new Set(html.match(STATIC_URLS) ?? [])];
    if (assets.length === 0) return true;
    const statics = await caches.open(STATIC_CACHE);
    const missing = (
      await Promise.all(
        assets.map(async (a) =>
          (await statics.match(a).catch(() => null)) ? null : a,
        ),
      )
    ).filter((a): a is string => a !== null);
    await Promise.all(
      missing.map((a) => statics.add(a).catch(() => undefined)),
    );
    return true;
  } catch {
    return false;
  }
}

// Total byte cap for the warmer (R3-L17): warming stops once
// origin storage reaches 200 MB — 169 lesson pages + shared chunks
// + the Courses tree had no stop condition besides completion, and
// low-storage devices just kept growing. Silent by design: warming
// simply stops, with no visible Settings UI (surfacing "storage
// full" needs Maalik's word). When estimate() is unavailable the
// cap cannot be enforced and warming proceeds, as before.
export const WARM_STORAGE_CAP_BYTES = 200 * 1024 * 1024;

export async function storageWithinWarmCap(): Promise<boolean> {
  try {
    if (typeof navigator === "undefined") return true;
    const estimate = navigator.storage?.estimate;
    if (typeof estimate !== "function") return true;
    const { usage } = await estimate.call(navigator.storage);
    if (typeof usage !== "number") return true;
    return usage < WARM_STORAGE_CAP_BYTES;
  } catch {
    return true;
  }
}

// Warm every lesson page into the SW's pages cache, skipping pages
// already cached (the cache itself is the progress record, so the job
// resumes across reloads). Runs in small batches so the page stays
// responsive; a failed fetch is skipped and retried next session.
// R3-L17: the total byte cap below stops each batch once origin
// storage reaches it — unbounded warming filled low-storage
// devices with no stop condition besides completion.
export async function warmLessons(): Promise<WarmProgress> {
  if (warming) return readWarmProgress();
  if (typeof window === "undefined" || !("caches" in window))
    return readWarmProgress();
  warming = true;
  const urls = LEARN_TOPIC_SLUGS.map((slug) => `/learn/${slug}`);
  const total = urls.length;
  const progress: WarmProgress = { done: 0, total, state: "warming" };
  try {
    const cache = await caches.open(PAGES_CACHE);
    // Count what is really cached first, so lessons saved one by
    // one (breadcrumb button) show up in the total and are never
    // double-counted — only still-missing pages are fetched below.
    const cached = await Promise.all(
      urls.map((u) =>
        cache
          .match(u)
          .then((r) => !!r)
          .catch(() => false),
      ),
    );
    let done = cached.filter(Boolean).length;
    const deleted = new Set(getDeletedLessons());
    const pending = urls.filter(
      (_, i) => !cached[i] && !deleted.has(LEARN_TOPIC_SLUGS[i]),
    );
    progress.done = done;
    writeWarmProgress(progress);
    emitWarm(progress);
    for (let i = 0; i < pending.length; i += WARM_BATCH) {
      if (!navigator.onLine) {
        progress.state = "waiting";
        break;
      }
      // R3-L17: stop warming at the byte cap (checked per batch).
      if (!(await storageWithinWarmCap())) break;
      const batch = pending.slice(i, i + WARM_BATCH);
      const results = await Promise.all(batch.map((url) => savePageOffline(url)));
      done += results.filter(Boolean).length;
      progress.done = done;
      writeWarmProgress(progress);
      emitWarm(progress);
    }
    if (done >= total) {
      progress.state = "done";
      progress.done = total;
      writeWarmProgress(progress);
      emitWarm(progress);
    }
  } finally {
    warming = false;
  }
  return progress;
}

// App pages for offline (the whole Courses tree — NOT /settings:
// it renders the signed-in user's streak/progress, so a cached copy
// would serve the previous user's data offline on a shared device,
// R2-M16). Maalik's order, 2026-11-22: a playlist page still showed
// "You're offline" because client-side navigation never caches a
// page's HTML — the SW only caches full document navigations, and
// the lessons warmer only covered /learn/*. These pages are saved the
// same way (savePageOffline: HTML + its /_next/static/ chunks),
// under the same gates (online, Wi-Fi-only toggle, broadband,
// signed in) — but NOT the first-sign-in Yes/No answer: that
// question was about the 812 lessons, and Maalik explicitly ordered
// these pages cached. The cache itself is the record, so a second
// call is a no-op once everything is cached. Runs from
// OfflineWarmer and from the Settings Wi-Fi toggle.
let warmingAppPages = false;

export async function maybeWarmAppPages(): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window)) return false;
  if (warmingAppPages) return false;
  if (!navigator.onLine) return false;
  // R3-L18: same session check + video purge as maybeWarmLessons
  // (no valid session on app load purges the saved videos). This
  // runs on every app load via OfflineWarmer with no download-offer
  // gate, so the purge is not gated on the user having said Yes.
  const user = await fetchSessionUser().catch(() => null);
  if (!user) {
    await purgeSavedVideos();
    return false;
  }
  if (!isWifiOnlyEnabled()) return false;
  if (!connectionAllowsWarming()) return false;
  return warmAppPages();
}

export async function warmAppPages(): Promise<boolean> {
  if (warmingAppPages) return false;
  if (typeof window === "undefined" || !("caches" in window)) return false;
  warmingAppPages = true;
  try {
    // The courses catalog is ~47KB — dynamic-import it so the
    // warmer never bloats the shared layout chunk; it loads only
    // when a warm actually runs.
    const { COURSE_CREATORS, playlistListId } = await import(
      "@/lib/courses/data"
    );
    const urls = ["/courses"];
    for (const c of COURSE_CREATORS) {
      urls.push(`/courses/${c.slug}`);
      for (const p of c.playlists)
        urls.push(`/courses/${c.slug}/${playlistListId(p.url)}`);
      if (c.oneShots.length > 0) urls.push(`/courses/${c.slug}/one-shots`);
    }
    const cache = await caches.open(PAGES_CACHE);
    const missing: string[] = [];
    for (const u of urls) {
      const hit = await cache.match(u).catch(() => null);
      if (!hit) missing.push(u);
    }
    for (let i = 0; i < missing.length; i += WARM_BATCH) {
      if (!navigator.onLine) break;
      // R3-L17: stop warming at the byte cap (checked per batch).
      if (!(await storageWithinWarmCap())) break;
      await Promise.all(
        missing.slice(i, i + WARM_BATCH).map((u) => savePageOffline(u)),
      );
    }
    return true;
  } catch {
    return false;
  } finally {
    warmingAppPages = false;
  }
}

// Slugs the user deleted in Settings. The warmer skips them, so a
// deleted lesson is not silently re-downloaded the next time the
// auto-warmer runs.
export function getDeletedLessons(): string[] {
  try {
    const raw = storageGet(DELETED_LESSONS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return [...new Set(arr.filter((s): s is string => typeof s === "string"))];
  } catch {
    return [];
  }
}

function writeDeletedLessons(slugs: string[]): void {
  storageSet(DELETED_LESSONS_KEY, JSON.stringify([...new Set(slugs)]));
}

export function addDeletedLesson(slug: string): void {
  writeDeletedLessons([...getDeletedLessons(), slug]);
}

export function removeDeletedLesson(slug: string): void {
  writeDeletedLessons(getDeletedLessons().filter((s) => s !== slug));
}

export function clearDeletedLessons(): void {
  storageRemove(DELETED_LESSONS_KEY);
}

export interface SavedLesson {
  slug: string;
  sectionTitle: string;
  title: string;
}

// Lessons that are REALLY in the pages cache, in curriculum order,
// with the breadcrumb parts for the Settings list.
export async function getSavedLessons(): Promise<SavedLesson[]> {
  if (typeof window === "undefined" || !("caches" in window)) return [];
  try {
    // LAZY: the full tree (section + lesson titles for the Settings
    // list) loads only here, when the list actually renders — the
    // warmer above needs slugs only and never pays for it. Dynamic
    // imports are cached by the module loader, so repeated calls
    // do not re-fetch the chunk.
    const { ALL_LEARN_TOPICS } = await import("@/lib/learn/sidebar");
    const cache = await caches.open(PAGES_CACHE);
    const hits = await Promise.all(
      ALL_LEARN_TOPICS.map((t) =>
        cache
          .match(`/learn/${t.slug}`)
          .then((r) => !!r)
          .catch(() => false),
      ),
    );
    return ALL_LEARN_TOPICS.filter((_, i) => hits[i]).map((t) => ({
      slug: t.slug,
      sectionTitle: t.sectionTitle,
      title: t.title,
    }));
  } catch {
    return [];
  }
}

// Recompute warm progress from what is really cached (after a
// delete, or on a Settings visit where lessons were cached by
// visiting rather than by the warmer) and broadcast it, so the
// Settings count + progress bar stay true without another warming
// run. Emits only when something actually changed, so a listener
// that refreshes on the event cannot loop.
export async function syncWarmProgress(): Promise<WarmProgress> {
  const saved = await getSavedLessons();
  const total = LEARN_TOPIC_SLUGS.length;
  const p: WarmProgress = {
    done: saved.length,
    total,
    state: saved.length >= total ? "done" : "idle",
  };
  const current = readWarmProgress();
  if (current.done !== p.done || current.state !== p.state) {
    writeWarmProgress(p);
    emitWarm(p);
  }
  return p;
}

// Delete ONE saved lesson: its HTML only. The static chunks are
// shared by every lesson and the shell pages, so they stay —
// deleting them would break every other saved lesson.
export async function removeSavedLesson(slug: string): Promise<void> {
  try {
    if (typeof window !== "undefined" && "caches" in window) {
      const cache = await caches.open(PAGES_CACHE);
      await cache.delete(`/learn/${slug}`);
    }
  } catch {
    // The blocklist below still sticks.
  }
  addDeletedLesson(slug);
  await syncWarmProgress();
}

// Delete ALL saved lessons. The offer answer goes to "no" so the
// background warmer does not start again on its own, and every slug
// lands on the blocklist, so even an explicit start skips them
// until the user taps "Download lessons again".
export async function clearAllSavedLessons(): Promise<void> {
  try {
    if (typeof window !== "undefined" && "caches" in window) {
      const cache = await caches.open(PAGES_CACHE);
      await Promise.all(
        LEARN_TOPIC_SLUGS.map((slug) => cache.delete(`/learn/${slug}`)),
      );
    }
  } catch {
    // The blocklist + offer flag below still stick.
  }
  writeDeletedLessons([...LEARN_TOPIC_SLUGS]);
  markDownloadOfferAnswered("no");
  await syncWarmProgress();
}

// Download lessons again after a bulk delete: un-block everything,
// answer Yes, and run the explicit start.
export async function downloadLessonsAgain(): Promise<WarmProgress | null> {
  clearDeletedLessons();
  markDownloadOfferAnswered("yes");
  return maybeWarmLessons();
}

// Saved-videos index (localStorage). The cache is the source of
// truth; the index only carries titles for the Settings list.
export function listSavedVideoIndex(): SavedVideo[] {
  try {
    const raw = storageGet(SAVED_VIDEOS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (v): v is SavedVideo =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as SavedVideo).lessonId === "string" &&
        typeof (v as SavedVideo).title === "string",
    );
  } catch {
    return [];
  }
}

export function noteSavedVideo(lessonId: string, title: string): void {
  const list = listSavedVideoIndex().filter((v) => v.lessonId !== lessonId);
  list.unshift({ lessonId, title, savedAt: new Date().toISOString() });
  storageSet(SAVED_VIDEOS_KEY, JSON.stringify(list));
}

export function forgetSavedVideo(lessonId: string): void {
  const list = listSavedVideoIndex().filter((v) => v.lessonId !== lessonId);
  storageSet(SAVED_VIDEOS_KEY, JSON.stringify(list));
}

// Saved videos that really exist in the videos cache, in index order.
export async function getSavedVideos(): Promise<SavedVideo[]> {
  const index = listSavedVideoIndex();
  if (index.length === 0) return [];
  try {
    if (typeof window === "undefined" || !("caches" in window))
      return index;
    const cache = await caches.open(VIDEO_CACHE);
    const keys = await cache.keys();
    const saved = new Set(
      keys.map((r) => r.url.split("/api/video/")[1]).filter(Boolean),
    );
    return index.filter((v) => saved.has(v.lessonId));
  } catch {
    return index;
  }
}

// Delete one saved video from the cache and the index.
export async function removeSavedVideo(lessonId: string): Promise<void> {
  try {
    if (typeof window !== "undefined" && "caches" in window) {
      const cache = await caches.open(VIDEO_CACHE);
      await cache.delete(`/api/video/${lessonId}`);
    }
  } catch {
    // The index is still cleared below.
  }
  forgetSavedVideo(lessonId);
}

// Delete ALL saved videos + their index (R3-L18): called when the
// app loads with no valid session, so a signed-out / expired /
// revoked user's videos do not keep playing offline on a shared
// device. Videos are re-downloadable, so this never destroys
// irreplaceable work — unlike the workspace/progress keys below,
// which the sign-out purge deliberately keeps.
export async function purgeSavedVideos(): Promise<void> {
  try {
    if (typeof window !== "undefined" && "caches" in window) {
      await caches.delete(VIDEO_CACHE);
    }
  } catch {
    // The index below is still cleared.
  }
  storageRemove(SAVED_VIDEOS_KEY);
}

// Sign-out purge (R2-M16): on a shared device the next user must
// not inherit the previous user's offline videos, AI chats or
// saved-video index. Deletes the pages/data/video caches and clears
// the user-data keys below. Device preferences (theme, language,
// volume, Wi-Fi-only toggle) stay — they are not user data. Called
// from signOut() in auth-client.ts; best-effort, never throws.
// NOT a "clear all offline data" UI action — that would be a new
// Settings button and needs Maalik's word (left NOT-DONE).
export const OFFLINE_USER_DATA_KEYS = [
  // AI chats + legacy BYOK leftovers (any lp_ai_* key is user data).
  "lp_ai_byok",
  "lp_ai_chats",
  "lp_ai_current_chat",
  "lp_ai_active_skills",
  "lp_ai_custom_skills",
  "lp_ai_selector_models",
  // Offline state: saved-video index, warm progress, blocklist,
  // first-sign-in answer.
  SAVED_VIDEOS_KEY,
  WARM_PROGRESS_KEY,
  DELETED_LESSONS_KEY,
  DOWNLOAD_OFFER_KEY,
];

// Account-tied, re-derivable keys the fixed list cannot name
// (R3-M3): one lp_coverage_<lesson> key per watched video,
// lp_open_repo_<...> (the repo open in the editor), lp_github_<...>
// (favourites, …) and the legacy lp_github_token (covered by the
// lp_github_ prefix). Purged by prefix scan below.
//
// Deliberately NOT purged — local-only user work with NO server
// copy, so purging is data loss: lp_workspace_tree,
// lp_workspace_tree_backup, lp_virtual_files (the user's code +
// staged commit files), lp_progress_v1, lp_learn_completed,
// lp_completed_lessons, lp_last_visited, and streak keys
// (lp_streak_restores). Progress survives sign-out on a shared
// device; that is the accepted trade-off for not deleting the
// user's own work.
const PURGE_KEY_PREFIXES = ["lp_open_repo_", "lp_github_", "lp_coverage_"];

function purgePrefixedUserData(): void {
  try {
    if (typeof window === "undefined") return;
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k) keys.push(k);
    }
    for (const k of keys) {
      if (PURGE_KEY_PREFIXES.some((p) => k.startsWith(p))) {
        window.localStorage.removeItem(k);
      }
    }
  } catch {
    // Best-effort: the fixed list above is already gone.
  }
}

export async function clearOfflineUserData(): Promise<void> {
  purgePrefixedUserData();
  for (const key of OFFLINE_USER_DATA_KEYS) storageRemove(key);
  try {
    if (typeof window !== "undefined" && "caches" in window) {
      await Promise.all([
        caches.delete(PAGES_CACHE),
        caches.delete(DATA_CACHE),
        caches.delete(VIDEO_CACHE),
      ]);
    }
  } catch {
    // Best-effort: the keys above are already gone.
  }
}
