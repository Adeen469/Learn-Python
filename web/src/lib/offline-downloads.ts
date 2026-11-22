// Auto-offline downloads: warm every lesson page into the service
// worker's pages cache after sign-in, and keep an index of videos
// saved offline. Cache API + localStorage only, no new dependency.
//
// HONEST LIMIT: web pages cannot truly detect Wi-Fi vs mobile data —
// no browser API exposes it. The "Wi-Fi only" toggle below is a user
// promise (default ON): warming only starts when the toggle is on AND
// the connection heuristic (navigator.connection) says the link looks
// like unmetered broadband. It can be wrong in both directions: a
// phone on Wi-Fi with a poor signal may read as cellular, and a fast
// cellular link may read as broadband. The toggle, not the heuristic,
// is the real gate — turning it off stops all automatic downloads.

import { ALL_LEARN_TOPICS } from "@/lib/learn/sidebar";
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
// Same cache VideoPlayer's Save Offline flow uses (tested).
export const VIDEO_CACHE = "lp-offline-videos-v1";

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
  const total = ALL_LEARN_TOPICS.length;
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

// Start warming when every gate passes: online, toggle on, the
// connection looks like broadband, the user is signed in, and not
// everything is already cached. Safe to call on mount, on "online",
// on focus, or right after the toggle flips — a second call while a
// run is in flight is a no-op.
export async function maybeWarmLessons(): Promise<WarmProgress | null> {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  if (warming) return readWarmProgress();
  if (!navigator.onLine) return null;
  if (!isWifiOnlyEnabled()) return null;
  if (!connectionAllowsWarming()) return null;
  const p = readWarmProgress();
  if (p.state === "done" && p.done >= p.total) return p;
  const user = await fetchSessionUser().catch(() => null);
  if (!user) return null;
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
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const html = await res.text();
    const pages = await caches.open(PAGES_CACHE);
    await pages.put(
      url,
      new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
    );
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

// Warm every lesson page into the SW's pages cache, skipping pages
// already cached (the cache itself is the progress record, so the job
// resumes across reloads). Runs in small batches so the page stays
// responsive; a failed fetch is skipped and retried next session.
export async function warmLessons(): Promise<WarmProgress> {
  if (warming) return readWarmProgress();
  if (typeof window === "undefined" || !("caches" in window))
    return readWarmProgress();
  warming = true;
  const urls = ALL_LEARN_TOPICS.map((t) => `/learn/${t.slug}`);
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
      (_, i) => !cached[i] && !deleted.has(ALL_LEARN_TOPICS[i].slug),
    );
    progress.done = done;
    writeWarmProgress(progress);
    emitWarm(progress);
    for (let i = 0; i < pending.length; i += WARM_BATCH) {
      if (!navigator.onLine) {
        progress.state = "waiting";
        break;
      }
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
  const total = ALL_LEARN_TOPICS.length;
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
        ALL_LEARN_TOPICS.map((t) => cache.delete(`/learn/${t.slug}`)),
      );
    }
  } catch {
    // The blocklist + offer flag below still stick.
  }
  writeDeletedLessons(ALL_LEARN_TOPICS.map((t) => t.slug));
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
