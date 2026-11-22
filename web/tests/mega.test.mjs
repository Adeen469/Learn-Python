import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Inline pure helpers for zero-build node --test verification
// (mirrors src/lib/mega.ts: a MEGA video URL is either a standalone file
// link or a file inside a shared folder — a folder member has no working
// bare file link, so the folder form is the only valid address for it.)
const MEGA_FILE_URL_RE = /^https:\/\/mega\.nz\/file\/([A-Za-z0-9_-]{8})#([A-Za-z0-9_-]{22,43})$/;
const MEGA_FOLDER_FILE_URL_RE =
  /^https:\/\/mega\.nz\/folder\/([A-Za-z0-9_-]{8})#([A-Za-z0-9_-]{22,43})\/file\/([A-Za-z0-9_-]{8})$/;

function isValidMegaFileUrl(url) {
  return MEGA_FILE_URL_RE.test(url) || MEGA_FOLDER_FILE_URL_RE.test(url);
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

test("MEGA URL validator accepts valid share links and rejects SSRF URLs", () => {
  assert.equal(
    isValidMegaFileUrl("https://mega.nz/file/pcQB0LQK#0ogh7nPPNB-hoYC_Y5GzfVZOfr5sNSmBsjVhx92CpIA"),
    true
  );
  // A file inside a shared folder: folder form, not a bare file handle.
  assert.equal(
    isValidMegaFileUrl("https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/8ZoEhBIT"),
    true
  );
  assert.equal(
    isValidMegaFileUrl("https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg"),
    false
  ); // bare folder link names no file
  assert.equal(isValidMegaFileUrl("http://169.254.169.254/latest/meta-data"), false);
  assert.equal(isValidMegaFileUrl("https://mega.nz/file/pcQB0LQK"), false);
});

test("HTTP Range parser handles open-ended, bounded, suffix, and invalid ranges", () => {
  assert.deepEqual(parseHttpRange("bytes=0-1023", 5000), { start: 0, end: 1023 });
  assert.deepEqual(parseHttpRange("bytes=1000-", 5000), { start: 1000, end: 4999 });
  assert.deepEqual(parseHttpRange("bytes=-500", 5000), { start: 4500, end: 4999 });
  assert.equal(parseHttpRange("bytes=6000-7000", 5000), null);
  assert.equal(parseHttpRange("bytes=invalid", 5000), null);
});


test("L11: MEGA file cache is capped and evicts oldest first", () => {
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "src/lib/mega.ts"), "utf8");
  assert.ok(src.includes("const FILE_CACHE_MAX = 500;"), "file cache needs a 500-entry cap");
  assert.ok(src.includes("while (fileCache.size > FILE_CACHE_MAX)"), "file cache must evict oldest when over the cap");
});
