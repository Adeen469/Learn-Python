import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Inline pure helpers for zero-build node --test verification
const DRIVE_FILE_ID_RE = /^[A-Za-z0-9_-]{10,64}$/;

function isValidDriveFileId(fileId) {
  return DRIVE_FILE_ID_RE.test(fileId);
}

function parseHttpRange(rangeHeader, totalSize) {
  if (!rangeHeader || totalSize <= 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return null;
  const [, startStr, endStr] = match;
  if (!startStr && !endStr) return null;

  let start = startStr ? Number.parseInt(startStr, 10) : 0;
  let end = endStr ? Number.parseInt(endStr, 10) : totalSize - 1;
  if (!startStr && endStr) {
    const suffixLen = Number.parseInt(endStr, 10);
    start = Math.max(0, totalSize - suffixLen);
    end = totalSize - 1;
  }
  if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || start > end || start >= totalSize) {
    return null;
  }
  return { start, end: Math.min(end, totalSize - 1) };
}

test("Drive file ID validator accepts real-looking IDs and rejects URLs/paths", () => {
  assert.equal(isValidDriveFileId("1aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789"), true);
  assert.equal(isValidDriveFileId("1aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789-_"), true);
  assert.equal(isValidDriveFileId("https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789/view"), false);
  assert.equal(isValidDriveFileId("../etc/passwd"), false);
  assert.equal(isValidDriveFileId("short"), false);
  assert.equal(isValidDriveFileId(""), false);
});

test("HTTP Range parser handles open-ended, bounded, suffix, and invalid ranges", () => {
  assert.deepEqual(parseHttpRange("bytes=0-1023", 5000), { start: 0, end: 1023 });
  assert.deepEqual(parseHttpRange("bytes=1000-", 5000), { start: 1000, end: 4999 });
  assert.deepEqual(parseHttpRange("bytes=-500", 5000), { start: 4500, end: 4999 });
  assert.equal(parseHttpRange("bytes=6000-7000", 5000), null);
  assert.equal(parseHttpRange("bytes=invalid", 5000), null);
});

test("L19: Drive API key is sent as a header, never in the URL query", () => {
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "src/lib/drive.ts"), "utf8");
  assert.ok(!src.includes("?key="), "API key must not appear in a URL query string");
  assert.ok(!src.includes("key=${"), "API key must not be interpolated into a URL");
  const headerUses = (src.match(/"X-Goog-Api-Key": apiKey/g) || []).length;
  assert.equal(headerUses, 2, `expected the key header on both fetches (meta + media), got ${headerUses}`);
});

test("L11: Drive metadata cache is capped and evicts oldest first", () => {
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "src/lib/drive.ts"), "utf8");
  assert.ok(src.includes("const META_CACHE_MAX = 500;"), "meta cache needs a 500-entry cap");
  assert.ok(src.includes("while (metaCache.size > META_CACHE_MAX)"), "meta cache must evict oldest when over the cap");
});
