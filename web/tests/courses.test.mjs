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
  assert.equal(ids.length, 4, `expected 4 playlists, got ${ids.length}`);
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

test("MEGA-mapped videos: 100-day course + 39 uploaded (Apna, Mosh, one-shots)", () => {
  const all = [...data.matchAll(/megaLessonId: "([^"]+)"/g)].map((m) => m[1]);
  // 100 (100-day) + 9 Apna lectures + 3 Apna one-shots + 5 CWH one-shots
  // + 22 Mosh = 139. The 129-video CWH playlist has no MEGA files yet,
  // so it stays YouTube-only until Maalik uploads it.
  assert.equal(all.length, 139, `expected 139 MEGA-mapped videos, got ${all.length}`);
  assert.equal(new Set(all).size, all.length, "MEGA lesson ids must be unique");
  const rest = all.filter((id) => !id.startsWith("python-day-"));
  assert.equal(rest.length, 39, `expected 39 non-100-day MEGA mappings, got ${rest.length}`);
  for (const id of rest) {
    assert.ok(
      /^(apna-lecture-\d{2}|apna-oneshot-\d{2}|cwh-oneshot-\d{2}|mosh-\d{3})$/.test(id),
      `unexpected MEGA lesson id ${id}`
    );
  }
});

test("every MEGA lesson id resolves to a catalog lesson with a MEGA link", () => {
  const catalog = read(join(webDir, "src/lib/catalog.ts"));
  const all = [...data.matchAll(/megaLessonId: "([^"]+)"/g)].map((m) => m[1]);
  for (const id of all) {
    const re = new RegExp(
      `id: "${id}",\\s*\\n\\s*title: "(?:[^"\\\\]|\\\\.)*",\\s*\\n\\s*moduleTitle: "(?:[^"\\\\]|\\\\.)*",\\s*\\n\\s*courseTitle: "(?:[^"\\\\]|\\\\.)*",\\s*\\n\\s*durationSeconds: \\d+,\\s*\\n\\s*videoUrl: "(?:https://mega\\.nz/file/|https://mega\\.nz/folder/[A-Za-z0-9_-]{8}#[A-Za-z0-9_-]{22,43}/file/)[^"]+",\\s*\\n\\s*videoSource: "mega",`
    );
    assert.ok(re.test(catalog), `catalog lesson ${id} missing or not a MEGA lesson`);
  }
});

test("total video count is 268", () => {
  // One `videoId:` per video object, plus one in the interface.
  const count = (data.match(/videoId:/g) || []).length - 1;
  assert.equal(count, 268);
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
  // The player page is full width with no max-w cap (Maalik's order 2026-11-19).
  assert.ok(!player.includes("max-w-6xl"), "the player page must not cap the width at max-w-6xl");
  assert.ok(
    player.includes("youtube-nocookie.com/embed/"),
    "player must embed YouTube for videos with no MEGA link yet"
  );
  assert.ok(
    player.includes("t.player.youtubeFallbackNote"),
    "player must label the YouTube fallback"
  );
  assert.ok(player.includes("t.player.todayProgress"), "player must keep Today's Progress");
  assert.ok(player.includes("t.player.courseLessonsHeading"), "player must keep the lessons list");
});

test("a dead thumbnail or avatar never shows a broken-image icon", () => {
  const creator = read(creatorPath);
  assert.ok(creator.includes("thumbFailed"), "the playlist card must track a failed thumbnail");
  assert.ok(
    creator.includes("onError={() => setThumbFailed(true)}"),
    "a failed thumbnail must fall back to the Play placeholder"
  );
  assert.ok(creator.includes("avatarFailed"), "the channel picture must track a failed avatar");
  assert.ok(
    creator.includes("onError={() => setAvatarFailed(true)}"),
    "a failed avatar must fall back to the initial letter"
  );
  // The hub card is a ChromaGrid card now, so the avatar fallback
  // lives in ChromaGrid: a dead image swaps to the initial letter.
  const grid = read("src/components/ChromaGrid.tsx");
  assert.ok(grid.includes("failedImages"), "the Chroma card must track a failed image too");
  assert.ok(
    grid.includes("onError={() => markImageFailed(index)}"),
    "a failed Chroma image must fall back to the initial letter too"
  );
  assert.ok(grid.includes("charAt(0)"), "the fallback must be the item's initial letter");
});

test("video lengths read h:m:s once past an hour, m:ss below", () => {
  // Durations now come from the shared i18n formatter, not a local
  // formatDuration in the player page.
  const i18n = read("src/lib/i18n/en.ts");
  assert.ok(
    i18n.includes('return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`'),
    "the shared duration must use h:m:s for videos >= 1h (not 374:07)"
  );
  const page = read(playerPath);
  assert.ok(
    page.includes("t.common.duration(video.durationSeconds)"),
    "the list must show durations through the shared formatter"
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

test("creator accents live in data.ts and both pages import them", () => {
  assert.ok(
    data.includes("export const CREATOR_ACCENTS"),
    "data.ts must export CREATOR_ACCENTS (single source of truth)"
  );
  const hub = read(hubPath);
  const creator = read(creatorPath);
  assert.ok(hub.includes("CREATOR_ACCENTS"), "the hub must import CREATOR_ACCENTS from data.ts");
  assert.ok(!hub.includes('codewithharry: "#ff8a4c"'), "the hub must not keep its own accent copy");
  assert.ok(creator.includes("CREATOR_ACCENTS"), "the creator page must use the same accents");
  for (const [key, colour] of [["codewithharry", "#ff8a4c"], ['"code-with-mosh"', "#3fb8ff"], ['"apna-college"', "#ffd23f"]]) {
    assert.ok(data.includes(`${key}: "${colour}"`), `data.ts must map ${key} to ${colour}`);
  }
});

test("creator page redesign — header, cards and progress", () => {
  const creator = read(creatorPath);
  // Header: a bigger picture with the creator's own accent ring, and a
  // stats row (collections, videos, total time) instead of one grey line.
  assert.ok(creator.includes("h-24 w-24"), "the header avatar must be 96px, not 80px");
  assert.ok(
    creator.includes('style={{ backgroundColor: accent }}'),
    "the avatar must wear a solid ring in the creator's accent colour"
  );
  assert.ok(creator.includes("t.coursesPage.countCourses(collectionCount)"), "the header must show the course count");
  assert.ok(creator.includes("t.courses.countVideos(totalVideos)"), "the header must show the video count");
  assert.ok(creator.includes("t.common.durationTotal(totalSeconds)"), "the header must show the total watch time");
  // Container: w-full is load-bearing (flex-col parent + mx-auto shrink-wraps it);
  // the container is full width with no max-w cap (Maalik's order 2026-11-19).
  assert.ok(creator.includes('className="w-full px-4 py-8 sm:py-10"'), "the creator container must be full width");
  assert.ok(!creator.includes("max-w-4xl"), "the creator container must not cap the width at max-w-4xl");
  // Cards: the thumbnail zooms on hover and a play button fades in,
  // so the card reads as watchable; the card lifts slightly.
  assert.ok(creator.includes("group-hover:scale-105"), "the thumbnail must zoom on hover");
  assert.ok(creator.includes("group-hover:opacity-100"), "a play button must fade in on hover");
  assert.ok(creator.includes("hover:-translate-y-1"), "the card must lift on hover");
  // Progress: each card shows how much of that collection is watched,
  // read from the same localStorage key the player writes.
  assert.ok(creator.includes('localStorage.getItem("lp_completed_lessons")'), "the page must read the player's completed list");
  assert.ok(creator.includes("video.megaLessonId ?? video.videoId"), "progress must match the player's completion id");
  assert.ok(creator.includes("doneCount"), "each card must receive its watched count");
  assert.ok(creator.includes("t.common.watchedPct(pct)"), "the card must show the watched percentage");
  assert.ok(creator.includes("width: `${pct}%`"), "the progress bar must fill to the watched percentage");
});

test("creator cards are black-and-white at rest and tilt, like the hub", () => {
  const creator = read(creatorPath);
  // The thumbnail is grayscale until the card is hovered, when the
  // colour returns (the same reveal the hub's Chroma cards do).
  assert.ok(
    creator.includes("grayscale transition"),
    "the thumbnail must be grayscale at rest"
  );
  assert.ok(
    creator.includes("group-hover:grayscale-0"),
    "the thumbnail must return to colour on hover"
  );
  // The whole card tilts toward the cursor, using the same Tilt
  // component as the hub (default strength 8).
  assert.ok(
    creator.includes('import Tilt from "@/components/Tilt"'),
    "the creator page must import the Tilt component"
  );
  assert.ok(creator.includes("<Tilt"), "each card must be wrapped in a Tilt");
  assert.ok(creator.includes("</Tilt>"), "the Tilt wrapper must close around the card");
  assert.ok(
    creator.includes("className=\"h-full\""),
    "the card link must fill the Tilt wrapper so rows stay equal height"
  );
  // The accent progress bar stays coloured on the grey card, so the
  // watched fraction still reads at a glance.
  assert.ok(
    creator.includes("style={{ width: `${pct}%`, backgroundColor: accent }}"),
    "the progress bar must keep the creator's accent colour"
  );
});

test("hub creator cards carry the same bottom-right arrow as the creator page", () => {
  const hub = read(hubPath);
  assert.ok(
    hub.includes('import { ChevronRight, MonitorPlay } from "lucide-react"'),
    "the hub must import ChevronRight"
  );
  assert.ok(
    hub.includes("<ChevronRight"),
    "each hub card's footer must render a ChevronRight"
  );
  assert.ok(
    hub.includes('className="ml-auto h-4 w-4 shrink-0"'),
    "the arrow must sit at the footer's right end (ml-auto)"
  );
  // The creator page's card has the same cue in its meta row.
  const creator = read(creatorPath);
  assert.ok(
    creator.includes("<ChevronRight"),
    "the creator page card must keep its bottom-right arrow too"
  );
});

test("the card arrow pulses (grows and shrinks) while its card is hovered", () => {
  // The keyframes live in globals.css so both pages share them.
  const globals = read(join(webDir, "src/app/globals.css"));
  assert.ok(globals.includes("@keyframes arrow-pulse"), "globals.css must define the arrow-pulse keyframes");
  assert.ok(globals.includes("transform: scale(1.35)"), "the pulse must grow the arrow to 1.35x at its peak");
  // Hub: the Chroma card's hover drives the arrow inside its details
  // footer, and only when the user has not asked for reduced motion.
  const gridCss = read(join(webDir, "src/components/ChromaGrid.css"));
  assert.ok(
    gridCss.includes(".chroma-card:hover .chroma-details svg"),
    "the hub card's hover must target the arrow in its details footer"
  );
  assert.ok(
    gridCss.includes("animation: arrow-pulse 0.9s ease-in-out infinite"),
    "the hub arrow must pulse 0.9s, ease-in-out, while hovered"
  );
  assert.ok(
    gridCss.includes("@media (prefers-reduced-motion: no-preference)"),
    "the hub arrow pulse must respect reduced-motion"
  );
  // Creator page: the card is a `group`, so the same pulse runs on
  // group-hover, again only when motion is safe.
  const creator = read(creatorPath);
  assert.ok(
    creator.includes("motion-safe:group-hover:animate-[arrow-pulse_0.9s_ease-in-out_infinite]"),
    "the creator card's arrow must pulse on card hover (motion-safe)"
  );
});
