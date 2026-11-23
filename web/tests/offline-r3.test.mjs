// Round-3 client/offline fixes (offline-r3). Static checks over
// the offline lib + VideoPlayer + migration 011, plus small
// behavioural mirrors of the pure logic. Every test pins the old
// working behaviour AND the new secure behaviour.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(web, p), "utf8");

// ---------------------------------------------------------------------------
// R3-M3: narrowed sign-out purge (prefix scan, no local-only data loss)
// ---------------------------------------------------------------------------

test("R3-M3: sign-out purges account-tied keys by prefix scan", () => {
  const lib = read("src/lib/offline-downloads.ts");
  assert.ok(lib.includes('const PURGE_KEY_PREFIXES = ["lp_open_repo_", "lp_github_", "lp_coverage_"]'), "the purge must scan the three account-tied prefixes");
  assert.ok(lib.includes("function purgePrefixedUserData"), "the purge must have a prefix-scan helper");
  assert.ok(lib.includes("localStorage.key(i)"), "the scan must walk every localStorage key");
  assert.ok(lib.includes("k.startsWith(p)"), "the scan must match by prefix");
  assert.ok(
    lib.indexOf("purgePrefixedUserData();") < lib.indexOf("for (const key of OFFLINE_USER_DATA_KEYS)"),
    "the prefix scan must run as part of clearOfflineUserData"
  );
  // The legacy token key is covered by the lp_github_ prefix.
  assert.ok(lib.includes("lp_github_token"), "the legacy token key must be named as covered");
});

test("R3-M3: the purge does NOT delete local-only user work", () => {
  const lib = read("src/lib/offline-downloads.ts");
  // Check the fixed list itself (not the explanatory comment below
  // it): none of these keys may be purged — they have no server
  // copy, so purging them is data loss.
  const listStart = lib.indexOf("export const OFFLINE_USER_DATA_KEYS");
  const listEnd = lib.indexOf("];", listStart);
  const list = lib.slice(listStart, listEnd);
  for (const k of [
    '"lp_progress_v1"',
    '"lp_learn_completed"',
    '"lp_completed_lessons"',
    '"lp_last_visited"',
    '"lp_streak_restores"',
    '"lp_workspace_tree"',
    '"lp_workspace_tree_backup"',
    '"lp_virtual_files"',
  ]) {
    assert.ok(!list.includes(k), `the purge list must not contain ${k}`);
  }
  // The reason must be recorded in code, not just the report.
  const note = lib.slice(listEnd, lib.indexOf("export async function clearOfflineUserData", listEnd));
  assert.ok(note.includes("Deliberately NOT purged"), "the exclusion must be explained in code");
  assert.ok(note.includes("data loss"), "the exclusion must say why");
  // Old behaviour still holds: AI chats, the saved-video index and
  // warm state ARE purged, and all three caches are deleted.
  for (const k of ['"lp_ai_chats"', '"lp_ai_current_chat"', "SAVED_VIDEOS_KEY", "WARM_PROGRESS_KEY", "DELETED_LESSONS_KEY", "DOWNLOAD_OFFER_KEY"]) {
    assert.ok(list.includes(k), `the purge list must still contain ${k}`);
  }
  assert.ok(lib.includes("caches.delete(PAGES_CACHE)"), "the pages cache must still be deleted");
  assert.ok(lib.includes("caches.delete(DATA_CACHE)"), "the data cache must still be deleted");
  assert.ok(lib.includes("caches.delete(VIDEO_CACHE)"), "the videos cache must still be deleted");
  // Device preferences still survive sign-out.
  assert.ok(!list.includes('"lp_theme"'), "theme must survive sign-out");
  assert.ok(!list.includes('"lp_language"'), "language must survive sign-out");
  assert.ok(!list.includes("WIFI_ONLY_KEY"), "Wi-Fi toggle must survive sign-out");
});

// ---------------------------------------------------------------------------
// R3-L17: warmer byte cap
// ---------------------------------------------------------------------------

test("R3-L17: the warmer stops at a 200 MB storage cap", () => {
  const lib = read("src/lib/offline-downloads.ts");
  assert.ok(lib.includes("WARM_STORAGE_CAP_BYTES = 200 * 1024 * 1024"), "the cap must be 200 MB");
  assert.ok(lib.includes("navigator.storage"), "the cap must use the storage estimate");
  assert.ok(lib.includes(".estimate"), "the cap must read usage from estimate()");
  assert.ok(lib.includes("export async function storageWithinWarmCap"), "the cap check must be a helper");
  assert.ok(lib.includes("usage < WARM_STORAGE_CAP_BYTES"), "warming must stop once usage reaches the cap");
  // Both warmers check the cap per batch.
  assert.ok((lib.match(/if \(\!\(await storageWithinWarmCap\(\)\)\) break;/g) || []).length >= 2, "both warmers must check the cap per batch");
  // Silent cap only: no visible Settings UI is added for it.
  const settings = read("src/app/settings/page.tsx");
  assert.ok(!settings.includes("WARM_STORAGE_CAP_BYTES"), "Settings must not surface the cap");
  assert.ok(!settings.includes("storageWithinWarmCap"), "Settings must not call the cap check");
  // Old behaviour: the Wi-Fi-only toggle and connection gates stay.
  assert.ok(lib.includes("isWifiOnlyEnabled()"), "the Wi-Fi toggle gate must stay");
  assert.ok(lib.includes("connectionAllowsWarming()"), "the connection gate must stay");
});

// ---------------------------------------------------------------------------
// R3-L18: purge saved videos when the app loads with no valid session
// ---------------------------------------------------------------------------

test("R3-L18: app load with no valid session purges the video cache", () => {
  const lib = read("src/lib/offline-downloads.ts");
  assert.ok(lib.includes("export async function purgeSavedVideos"), "there must be a video-purge helper");
  assert.ok(lib.includes("await caches.delete(VIDEO_CACHE)"), "the purge must delete the videos cache");
  // Both warmers run the check on app load (via OfflineWarmer) and
  // purge when the session check returns no user.
  for (const fn of ["maybeWarmLessons", "maybeWarmAppPages"]) {
    const start = lib.indexOf(`export async function ${fn}`);
    const end = lib.indexOf("export async function", start + 10);
    const body = lib.slice(start, end === -1 ? undefined : end);
    assert.ok(body.includes("fetchSessionUser"), `${fn} must still check the session`);
    assert.ok(body.includes("purgeSavedVideos"), `${fn} must purge videos when there is no session`);
  }
  // The session check runs BEFORE the Wi-Fi/connection gates, so
  // the purge is not gated on the user having said Yes — but AFTER
  // the online gate, so an offline load never wipes videos the
  // user needs right now.
  const lessons = lib.slice(lib.indexOf("export async function maybeWarmLessons"));
  assert.ok(lessons.indexOf("!navigator.onLine") < lessons.indexOf("fetchSessionUser"), "offline must short-circuit before the session check");
  assert.ok(lessons.indexOf("fetchSessionUser") < lessons.indexOf("isWifiOnlyEnabled"), "the session check must come before the Wi-Fi gate");
  // No NEW network call: the warmer reuses the cached session
  // promise from auth-client.
  assert.ok(lib.includes("fetchSessionUser().catch(() => null)"), "the session check must reuse the cached promise");
});

// ---------------------------------------------------------------------------
// R3-M4: Save Offline downloads the whole video
// ---------------------------------------------------------------------------

test("R3-M4: Save Offline downloads in sequential Range requests until Content-Range reports complete", () => {
  const src = read("src/components/VideoPlayer.tsx");
  const start = src.indexOf("async function handleSaveOffline()");
  const end = src.indexOf("async function handleRemoveOffline", start);
  const fn = src.slice(start, end);
  // Range requests clamped to the server's 4 MiB window.
  assert.ok(fn.includes("headers: { Range:"), "the download must send Range headers");
  assert.ok(fn.includes("bytes=${start}-${end}"), "each request must ask for the next window");
  assert.ok(fn.includes("4 * 1024 * 1024"), "the window must be the server's 4 MiB clamp");
  // The total comes from Content-Range, not Content-Length (the
  // route clamps the window, so Content-Length is just this chunk).
  assert.ok(fn.includes('res.headers.get("Content-Range")'), "the total must come from Content-Range");
  assert.ok(fn.includes('const m = /^bytes'), "Content-Range must be parsed with a strict regex");
  assert.ok(fn.includes("chunkStart !== start"), "a chunk starting at the wrong offset must fail");
  // The loop runs until the assembled size equals the total.
  assert.ok(fn.includes("while (total === -1 || received < total)"), "the loop must run until complete");
  // A short chunk or a size mismatch fails visibly and caches nothing.
  assert.ok(fn.includes("chunkReceived !== chunkEnd - chunkStart + 1"), "a short chunk must fail");
  assert.ok(fn.includes("received !== total"), "a size mismatch must fail");
  assert.ok(fn.includes("Saved video is incomplete"), "a size mismatch must say so visibly");
  assert.ok(fn.indexOf("received !== total") < fn.indexOf("cache.put"), "the size check must run before caching");
  // No plain no-Range fetch remains in the save flow.
  assert.ok(!fn.includes("const res = await fetch(streamUrl);"), "the save must not fetch with no Range header");
  // Old behaviour: an already-saved video is just marked, and the
  // saved index + playback swap still happen on success.
  assert.ok(fn.includes("cache.match(streamUrl)"), "an already-saved video must still be detected");
  assert.ok(fn.includes("noteSavedVideo(lessonId"), "a saved video must still be indexed");
  assert.ok(fn.includes("setIsSavedOffline(true)"), "playback must still swap to the saved file");
});

test("R3-M4 mirror: the Range loop assembles a whole video and rejects a truncated one", async () => {
  const CHUNK = 4 * 1024 * 1024;
  const TOTAL = 37 * 1024 * 1024 + 12345; // ~37 MB, not a multiple of the window
  // Fake server: clamps every Range to the 4 MiB window, answers
  // Content-Range like the real video route.
  const serve = (range) => {
    const m = /^bytes=(\d+)-(\d+)$/.exec(range);
    const start = Number(m[1]);
    const end = Math.min(Number(m[2]), start + CHUNK - 1, TOTAL - 1);
    if (start >= TOTAL) return { status: 416, range: `bytes */${TOTAL}`, bytes: 0 };
    return { status: 206, range: `bytes ${start}-${end}/${TOTAL}`, bytes: end - start + 1 };
  };
  // Mirror of handleSaveOffline's loop.
  const download = (serveFn) => {
    let received = 0;
    let total = -1;
    let start = 0;
    let requests = 0;
    while (total === -1 || received < total) {
      const end = total === -1 ? start + CHUNK - 1 : Math.min(start + CHUNK - 1, total - 1);
      const res = serveFn(`bytes=${start}-${end}`);
      requests++;
      if (res.status !== 206) throw new Error(`download failed (${res.status})`);
      const m = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(res.range);
      if (!m) throw new Error("no content-range");
      const [cs, ce, ct] = [Number(m[1]), Number(m[2]), Number(m[3])];
      if (cs !== start || ce < cs || ct <= 0) throw new Error("bad range");
      if (total === -1) total = ct;
      else if (ct !== total) throw new Error("total changed");
      if (res.bytes !== ce - cs + 1) throw new Error("short chunk");
      received += res.bytes;
      start = ce + 1;
    }
    if (received !== total) throw new Error(`incomplete (${received} of ${total})`);
    return { received, total, requests };
  };
  const ok = download(serve);
  assert.equal(ok.received, TOTAL);
  assert.equal(ok.total, TOTAL);
  assert.equal(ok.requests, 10, "a ~37 MB video needs 10 windows of 4 MiB");
  // The old no-Range behaviour saved only the first 1 MiB.
  const old = serve("bytes=0-1048575");
  assert.equal(old.bytes, 1024 * 1024, "one no-Range fetch is only the first 1 MiB");
  // A server that shortens the last chunk is caught, not cached.
  const short = (range) => {
    const res = serve(range);
    if (res.bytes > 1000) res.bytes -= 1000; // truncated body, honest headers
    return res;
  };
  assert.throws(() => download(short), /short chunk|incomplete/);
});

// ---------------------------------------------------------------------------
// R3-M5: lessons RLS migration
// ---------------------------------------------------------------------------

test("R3-M5: migration 011 enables RLS with published-only SELECT, guarded to be a no-op", () => {
  const rel = "supabase/migrations/011_lessons_published_rls.sql";
  assert.ok(existsSync(join(web, rel)), "migration 011 must exist");
  const sql = read(rel);
  // RLS on the lessons/courses tables (and modules, the join table).
  assert.ok(sql.includes("alter table public.lessons enable row level security"), "RLS must be enabled on lessons");
  assert.ok(sql.includes("alter table public.courses enable row level security"), "RLS must be enabled on courses");
  assert.ok(sql.includes("is_published is true"), "the SELECT policy must be published-only");
  // Guarded: a policy is created only when its table/columns exist,
  // and RLS is enabled only once the policy exists — otherwise the
  // table keeps working as before instead of returning zero rows.
  assert.ok(sql.includes("pg_policies"), "the migration must check pg_policies before creating/enabling");
  assert.ok(sql.includes("information_schema"), "the migration must discover the schema before assuming it");
  assert.ok(sql.includes("raise notice"), "a skipped policy must say so in the output");
  // Idempotent: re-running changes nothing.
  assert.ok(sql.includes("not exists"), "re-running must be a no-op");
  // The Maalik step is recorded in the file itself.
  assert.ok(sql.includes("MAALIK STEP"), "the file must say Maalik runs and verifies it");
  assert.ok(sql.includes("NOT tested against a live DB"), "the file must say it was not live-tested");
});
