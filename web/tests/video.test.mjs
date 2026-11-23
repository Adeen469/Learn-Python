import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

// Inline pure helpers for zero-build node --test verification
// (mirrors web/src/app/api/video/[lessonId]/route.ts).

// M21: only video/audio MIME types pass through; anything else is video/mp4.
function sanitizeVideoMimeType(mimeType) {
  return /^(video|audio)\//.test(mimeType) ? mimeType : "video/mp4";
}

// H7: a request with no Range header gets only the first 1 MiB chunk.
const NO_RANGE_CHUNK_BYTES = 1_048_576;
function effectiveRangeHeader(rangeHeader) {
  return rangeHeader ?? `bytes=0-${NO_RANGE_CHUNK_BYTES - 1}`;
}

// H7: per-IP daily byte cap (1 GB per UTC day), in-memory.
const VIDEO_DAILY_BYTE_CAP = 1_000_000_000;
// R2-L15: an unknown IP gets a much smaller shared budget.
const VIDEO_DAILY_BYTE_CAP_UNKNOWN_IP = 100_000_000;
const dailyBytes = new Map();
function chargeDailyBytes(ip, chunkLength, cap = VIDEO_DAILY_BYTE_CAP) {
  const day = new Date().toISOString().slice(0, 10);
  const entry = dailyBytes.get(ip);
  if (!entry || entry.day !== day) {
    dailyBytes.set(ip, { day, bytes: chunkLength });
  } else {
    if (entry.bytes + chunkLength > cap) return false;
    entry.bytes += chunkLength;
  }
  return true;
}

// R2-H1: the most bytes a Range request can draw, without knowing
// the file size (mirror of expectedChunkBytes in the route).
const MAX_VIDEO_CHUNK_BYTES = 4 * 1024 * 1024;
function expectedChunkBytes(rangeHeader) {
  if (!rangeHeader) return NO_RANGE_CHUNK_BYTES;
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return null;
  const [, startStr, endStr] = match;
  if (!startStr && !endStr) return null;
  if (startStr && endStr) {
    const len = Number(endStr) - Number(startStr) + 1;
    if (!Number.isFinite(len) || len <= 0) return null;
    return Math.min(len, MAX_VIDEO_CHUNK_BYTES);
  }
  if (startStr) return MAX_VIDEO_CHUNK_BYTES;
  return Math.min(Number(endStr), MAX_VIDEO_CHUNK_BYTES);
}

test("M21: video MIME allowlist passes video/audio through, falls back otherwise", () => {
  assert.equal(sanitizeVideoMimeType("video/mp4"), "video/mp4");
  assert.equal(sanitizeVideoMimeType("video/webm"), "video/webm");
  assert.equal(sanitizeVideoMimeType("audio/mpeg"), "audio/mpeg");
  assert.equal(sanitizeVideoMimeType("audio/mp4"), "audio/mp4");
  assert.equal(sanitizeVideoMimeType("text/html"), "video/mp4");
  assert.equal(sanitizeVideoMimeType("application/octet-stream"), "video/mp4");
  assert.equal(sanitizeVideoMimeType(""), "video/mp4");
  assert.equal(sanitizeVideoMimeType("video"), "video/mp4");
});

test("H7: a request with no Range header gets only the first 1 MiB chunk", () => {
  assert.equal(effectiveRangeHeader(null), "bytes=0-1048575");
  assert.equal(effectiveRangeHeader("bytes=0-1023"), "bytes=0-1023");
  assert.equal(effectiveRangeHeader("bytes=1048576-"), "bytes=1048576-");
  assert.equal(effectiveRangeHeader("bytes=-500"), "bytes=-500");
});

test("H7: per-IP daily byte cap accumulates and blocks past 1 GB", () => {
  const ip = `test-ip-${Date.now()}`;
  assert.equal(chargeDailyBytes(ip, 500_000_000), true);
  assert.equal(chargeDailyBytes(ip, 499_000_000), true);
  assert.equal(chargeDailyBytes(ip, 2_000_000), false);
  // A different IP has its own budget.
  assert.equal(chargeDailyBytes(`${ip}-other`, 1_000_000_000), true);
  assert.equal(chargeDailyBytes(`${ip}-other`, 1), false);
});

test("R2-H1: the pre-fetch charge uses the clamped window, never the whole file", () => {
  // Bounded ranges charge exactly; open-ended/suffix charge at
  // most 4 MiB; no Range charges the first 1 MiB chunk.
  assert.equal(expectedChunkBytes("bytes=0-1023"), 1024);
  assert.equal(expectedChunkBytes("bytes=0-"), MAX_VIDEO_CHUNK_BYTES);
  assert.equal(expectedChunkBytes("bytes=1048576-"), MAX_VIDEO_CHUNK_BYTES);
  assert.equal(expectedChunkBytes("bytes=-500"), 500);
  assert.equal(expectedChunkBytes("bytes=-10485760"), MAX_VIDEO_CHUNK_BYTES);
  assert.equal(expectedChunkBytes(null), NO_RANGE_CHUNK_BYTES);
  // Syntactically invalid ranges charge nothing (they 416).
  assert.equal(expectedChunkBytes("bytes=invalid"), null);
  assert.equal(expectedChunkBytes("bytes=-"), null);
  assert.equal(expectedChunkBytes("bytes=500-100"), null);
});

test("R2-L15: an unknown IP gets the smaller shared byte cap", () => {
  const ip = `unknown-${Date.now()}`;
  assert.equal(chargeDailyBytes(ip, 50_000_000, VIDEO_DAILY_BYTE_CAP_UNKNOWN_IP), true);
  assert.equal(chargeDailyBytes(ip, 49_000_000, VIDEO_DAILY_BYTE_CAP_UNKNOWN_IP), true);
  assert.equal(chargeDailyBytes(ip, 2_000_000, VIDEO_DAILY_BYTE_CAP_UNKNOWN_IP), false);
  // The same bytes fit fine under the full 1 GB cap.
  assert.equal(chargeDailyBytes(`${ip}-known`, 500_000_000, VIDEO_DAILY_BYTE_CAP), true);
});

test("H7/M13/M21: video route source carries the fixes", () => {
  const src = read("src/app/api/video/[lessonId]/route.ts");
  // H7: no-Range requests are capped to the first chunk, and bytes are
  // charged to a per-IP daily cap (429 past it).
  assert.ok(src.includes("NO_RANGE_CHUNK_BYTES"), "missing no-Range chunk cap");
  assert.ok(src.includes("effectiveRangeHeader(rangeHeader)"), "route must use the effective Range header");
  assert.ok(src.includes("VIDEO_DAILY_BYTE_CAP"), "missing daily byte cap");
  assert.ok(src.includes("secondsUntilMidnightUtc()"), "cap 429 must Retry-After until midnight");
  // R2-H1: the cap is charged BEFORE the upstream fetch, from the
  // clamped window — an over-cap request costs no MEGA/Drive call.
  assert.ok(src.includes("expectedChunkBytes(rangeHeader)"), "route must size the charge from the Range before fetching");
  assert.ok(
    src.indexOf("chargeDailyBytes(") < src.indexOf("openMegaStream("),
    "bytes must be charged BEFORE the upstream fetch"
  );
  assert.ok(
    src.indexOf("chargeDailyBytes(") < src.indexOf("openDriveStream("),
    "bytes must be charged BEFORE the upstream fetch (Drive leg too)"
  );
  assert.ok(!src.includes("chargeDailyBytes(getClientIp(req), result.chunkLength)"), "no post-fetch charge may remain");
  // R2-L15: an unknown IP gets the smaller shared budget, logged once.
  assert.ok(src.includes("VIDEO_DAILY_BYTE_CAP_UNKNOWN_IP"), "missing smaller unknown-IP byte cap");
  assert.ok(src.includes("video_unknown_ip"), "an unknown client IP must be logged");
  // R2-L26: one status (502) for every upstream failure — no
  // per-code 404/503/422 split that leaks Drive config state.
  assert.ok(!src.includes('err.code === "NOT_FOUND"'), "Drive NOT_FOUND must not map to its own status anymore");
  assert.ok(!src.includes('err.code === "NOT_CONFIGURED"'), "Drive NOT_CONFIGURED must not map to its own status anymore");
  assert.ok(!src.includes('err.code === "KEY_INVALID"'), "Drive KEY_INVALID must not map to its own status anymore");
  // M13: no raw upstream error ever reaches the client.
  assert.ok(!src.includes("err.message"), "route must never return err.message");
  const generic = (src.match(/Unable to load video stream/g) || []).length;
  assert.ok(generic >= 1, `expected the generic error body, got ${generic}`);
  // M21: allowlisted Content-Type plus inline + nosniff on the response.
  assert.ok(src.includes("sanitizeVideoMimeType(result.mimeType)"), "Content-Type must go through the allowlist");
  assert.ok(src.includes('"Content-Disposition": "inline"'), "missing Content-Disposition: inline");
  assert.ok(src.includes('"X-Content-Type-Options": "nosniff"'), "missing X-Content-Type-Options: nosniff");
});
