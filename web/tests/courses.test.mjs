// Static checks over the Video Courses redesign (creator cards ->
// playlist cards -> player). Fully static (reads the .ts/.tsx files
// as text) — no TS import needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = join(webDir, "src/lib/courses/data.ts");
const data = readFileSync(dataPath, "utf8");

const hubPath = join(webDir, "src/app/courses/page.tsx");
const creatorPath = join(webDir, "src/app/courses/[slug]/page.tsx");
const playerPath = join(webDir, "src/app/courses/[slug]/[collection]/page.tsx");

function read(p) {
  return readFileSync(p, "utf8");
}

/** Creator names, in file order. */
function creatorNames(text) {
  return [...text.matchAll(/^\s+name: "([^"]+)",$/gm)].map((m) => m[1]);
}

test("creator order is CodeWithHarry, Code With Mosh, Apna College", () => {
  assert.deepEqual(creatorNames(data), [
    "CodeWithHarry",
    "Code With Mosh",
    "Apna College",
  ]);
});

test("every creator has slug, handle, avatar, subscribers, language", () => {
  for (const field of ["slug", "handle", "avatarUrl", "subscribers", "language"]) {
    const count = (data.match(new RegExp(`^\\s+${field}: "`, "gm")) || []).length;
    assert.equal(count, 3, `${field} should appear once per creator, got ${count}`);
  }
  for (const avatar of [...data.matchAll(/avatarUrl: "([^"]+)"/g)].map((m) => m[1])) {
    assert.ok(
      avatar.startsWith("https://yt3.googleusercontent.com/"),
      `avatar must be a YouTube channel picture, got ${avatar}`
    );
  }
});

test("no channel link anywhere: no channelUrl in data or courses pages", () => {
  assert.ok(!data.includes("channelUrl"), "data.ts must not carry a channel URL");
  for (const p of [hubPath, creatorPath, playerPath]) {
    const text = read(p);
    assert.ok(!text.includes("youtube.com"), `${p} must not link to YouTube`);
    assert.ok(!text.includes("channelUrl"), `${p} must not use a channel URL`);
  }
});

test("playlist list ids are unique and do not collide with one-shots", () => {
  const ids = [...data.matchAll(/playlist\?list=([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
  assert.equal(ids.length, 3, `expected 3 playlists, got ${ids.length}`);
  assert.equal(new Set(ids).size, ids.length, "playlist ids must be unique");
  assert.ok(!ids.includes("one-shots"), "one-shots route must not collide");
});

test("Harry 100-day playlist: 100 videos, MEGA lesson ids in order", () => {
  const start = data.indexOf('title: "Python for Beginners (Full Course)');
  const end = data.indexOf("\n        ],", start);
  const block = data.slice(start, end);
  const lessons = [...block.matchAll(/megaLessonId: "(python-day-\d{3})"/g)].map((m) => m[1]);
  assert.equal(lessons.length, 100, `expected 100 MEGA-mapped videos, got ${lessons.length}`);
  lessons.forEach((id, i) => {
    assert.equal(id, `python-day-${String(i + 1).padStart(3, "0")}`);
  });
});

test("no other video carries a MEGA lesson id", () => {
  const all = [...data.matchAll(/megaLessonId: "([^"]+)"/g)].map((m) => m[1]);
  assert.equal(all.length, 100, `only the 100-day course may map to MEGA, got ${all.length}`);
});

test("total video count is 259", () => {
  // One `videoId:` per video object, plus one in the interface.
  const count = (data.match(/videoId:/g) || []).length - 1;
  assert.equal(count, 259);
});

test("creator and player routes exist and use the MEGA player", () => {
  assert.ok(existsSync(creatorPath), "creator page missing");
  assert.ok(existsSync(playerPath), "player page missing");
  const creator = read(creatorPath);
  assert.ok(creator.includes("/courses/${creator.slug}/"), "creator page must link to collections");
  assert.ok(creator.includes("one-shots"), "creator page must offer the one-shots card");
  const player = read(playerPath);
  assert.ok(player.includes("VideoPlayer"), "player must use the VideoPlayer");
  assert.ok(player.includes("megaLessonId"), "player must stream via the MEGA lesson id");
  assert.ok(
    player.includes("youtube-nocookie.com/embed/"),
    "player must embed YouTube for videos with no MEGA link yet"
  );
  assert.ok(
    player.includes("Playing from YouTube"),
    "player must label the YouTube fallback"
  );
  assert.ok(player.includes("Today&apos;s Progress"), "player must keep Today's Progress");
  assert.ok(player.includes("Course Lessons"), "player must keep the lessons list");
});

test("video lengths read h:m:s once past an hour, m:ss below", () => {
  const player = read(playerPath);
  assert.ok(
    player.includes('if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`'),
    "formatDuration must use h:m:s for videos >= 1h (not 374:07)"
  );
});

test("CSP allows YouTube embeds (frame-src)", () => {
  const config = read(join(webDir, "next.config.ts"));
  assert.ok(
    config.includes("frame-src https://www.youtube-nocookie.com"),
    "CSP frame-src must allow the YouTube nocookie embed"
  );
});

test("video route allows the full Hobby duration for slow streams", () => {
  const videoRoute = read(
    join(webDir, "src/app/api/video/[lessonId]/route.ts")
  );
  assert.ok(
    videoRoute.includes("export const maxDuration = 60"),
    "video route must export maxDuration = 60 (Vercel Hobby cap)"
  );
});
