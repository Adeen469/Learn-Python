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
const dailyBytes = new Map();
function chargeDailyBytes(ip, chunkLength) {
  const day = new Date().toISOString().slice(0, 10);
  const entry = dailyBytes.get(ip);
  if (!entry || entry.day !== day) {
    dailyBytes.set(ip, { day, bytes: chunkLength });
  } else {
    if (entry.bytes + chunkLength > VIDEO_DAILY_BYTE_CAP) return false;
    entry.bytes += chunkLength;
  }
  return true;
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

test("H7/M13/M21: video route source carries the fixes", () => {
  const src = read("src/app/api/video/[lessonId]/route.ts");
  // H7: no-Range requests are capped to the first chunk, and bytes are
  // charged to a per-IP daily cap (429 past it).
  assert.ok(src.includes("NO_RANGE_CHUNK_BYTES"), "missing no-Range chunk cap");
  assert.ok(src.includes("effectiveRangeHeader(rangeHeader)"), "route must use the effective Range header");
  assert.ok(src.includes("VIDEO_DAILY_BYTE_CAP"), "missing daily byte cap");
  assert.ok(src.includes("chargeDailyBytes(getClientIp(req), result.chunkLength)"), "bytes must be charged per chunk");
  assert.ok(src.includes("secondsUntilMidnightUtc()"), "cap 429 must Retry-After until midnight");
  // M13: no raw upstream error ever reaches the client.
  assert.ok(!src.includes("err.message"), "route must never return err.message");
  const generic = (src.match(/Unable to load video stream/g) || []).length;
  assert.ok(generic >= 5, `expected >=5 generic error bodies, got ${generic}`);
  // M21: allowlisted Content-Type plus inline + nosniff on the response.
  assert.ok(src.includes("sanitizeVideoMimeType(result.mimeType)"), "Content-Type must go through the allowlist");
  assert.ok(src.includes('"Content-Disposition": "inline"'), "missing Content-Disposition: inline");
  assert.ok(src.includes('"X-Content-Type-Options": "nosniff"'), "missing X-Content-Type-Options: nosniff");
});
