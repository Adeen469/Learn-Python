// Fetch English captions (.vtt) for every MEGA-streamed course video and
// save them under web/public/captions/<videoId>.en.vtt, where the
// VideoPlayer's <track> reads them from.
//
// Why yt-dlp: YouTube's public timedtext endpoint returns empty bodies
// for these videos (the signed caption URLs need a proof-of-origin
// token), and the captions.download API needs OAuth. yt-dlp generates
// the token and downloads the "en" track (manual captions first, then
// auto-generated) that the player response lists for each video.
//
// YouTube rate-limits caption downloads per IP (HTTP 429) — the script
// sleeps between videos and retries each one, and skips videos whose
// captions already exist. Re-run it later if a batch gets 429'd.
//
// Usage:
//   node scripts/fetch-captions.mjs [--limit N] [--only VIDEO_ID]
//   node scripts/fetch-captions.mjs --only 7wnove7K-ZQ
//
// Requires yt-dlp on PATH (pip install yt-dlp, or a venv) and node for
// its JS runtime (yt-dlp --js-runtimes).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = join(root, "src/lib/courses/data.ts");
const outDir = join(root, "public/captions");
mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const limit = (limitIdx >= 0 ? Number(args[limitIdx + 1]) : 0) || 0;
const onlyIdx = args.indexOf("--only");
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

// One-line catalog entries: { title, videoId, durationSeconds, megaLessonId }.
// Only videos with a MEGA link use the <video> player (the rest play in
// a YouTube embed, which already has its own CC button).
const videoIds = [];
for (const line of readFileSync(dataPath, "utf8").split("\n")) {
  if (!line.includes("megaLessonId")) continue;
  const m = line.match(/videoId:\s*"([^"]+)"/);
  if (m && !videoIds.includes(m[1])) videoIds.push(m[1]);
}

const targets = only ? videoIds.filter((id) => id === only) : videoIds;
const list = limit > 0 ? targets.slice(0, limit) : targets;
console.log(`MEGA videos with a YouTube id: ${videoIds.length}; fetching: ${list.length}`);

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
let done = 0;
let failed = 0;
for (const [i, id] of list.entries()) {
  const out = join(outDir, `${id}.en.vtt`);
  if (existsSync(out)) {
    done += 1;
    continue;
  }
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt += 1) {
    try {
      execFileSync(
        "yt-dlp",
        [
          "--js-runtimes",
          `node:${process.execPath}`,
          "--write-subs",
          "--write-auto-subs",
          "--sub-langs",
          "en",
          "--skip-download",
          "--sub-format",
          "vtt",
          "--retries",
          "2",
          "--sleep-interval",
          "2",
          "--max-sleep-interval",
          "5",
          "-o",
          join(outDir, "%(id)s"),
          `https://www.youtube.com/watch?v=${id}`,
        ],
        { stdio: "pipe", timeout: 120_000 },
      );
      ok = existsSync(out);
    } catch {
      ok = false;
    }
    if (!ok && attempt < 3) sleep(10_000);
  }
  if (ok) {
    done += 1;
    console.log(`[${i + 1}/${list.length}] ${id}: saved`);
  } else {
    failed += 1;
    console.log(`[${i + 1}/${list.length}] ${id}: FAILED (rate-limited or no English captions)`);
  }
  sleep(2000);
}

console.log(`\nDone: ${done} saved, ${failed} failed. Files in ${outDir}:`);
console.log(readdirSync(outDir).filter((f) => f.endsWith(".vtt")).length, "vtt files");
