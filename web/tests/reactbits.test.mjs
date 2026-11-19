import assert from "node:assert";
import { describe, test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

// React Bits components, installed as source via the shadcn registry
// (npx shadcn@latest add @react-bits/...): Counter for the streak,
// AnimatedList for the video list, ElasticSlider for player volume.

describe("react bits install", () => {
  test("the first six components are vendored with no motion dep; gsap exists only for TextType", () => {
    for (const file of [
      "src/components/Counter.tsx",
      "src/components/AnimatedList.tsx",
      "src/components/ElasticSlider.tsx",
      "src/components/StarBorder.tsx",
      "src/components/TextType.tsx",
      "src/components/PillNav.tsx",
    ]) {
      assert.ok(existsSync(path.join(root, file)), `${file} must exist`);
      const src = read(file);
      assert.ok(!src.includes("framer-motion"), `${file} must not need framer-motion`);
      assert.ok(!src.includes("from 'motion'"), `${file} must not need motion`);
    }
    const pkg = JSON.parse(read("package.json"));
    assert.ok(!pkg.dependencies["framer-motion"], "no framer-motion dependency");
    assert.ok(!pkg.dependencies["motion"], "no motion dependency — RotatingText was replaced by TextType");
    assert.ok(pkg.dependencies["gsap"], "gsap is required by TextType");
    assert.ok(
      read("src/components/TextType.tsx").includes("from 'gsap'"),
      "TextType must import gsap",
    );
  });

  test("animated list root className keeps its spaces (upstream typo fixed)", () => {
    const src = read("src/components/AnimatedList.tsx");
    assert.ok(
      !src.includes(".replace(/\\s+/g, '')"),
      "the upstream .replace(/\\s+/g, '') that glued every class together must stay fixed"
    );
    assert.ok(
      src.includes(".replace(/\\s+/g, ' ')"),
      "root className must collapse whitespace to single spaces"
    );
  });
});

describe("counter — streaks", () => {
  test("settings page shows the streak as a big odometer counter, like the React Bits demo", () => {
    const page = read("src/app/settings/page.tsx");
    assert.ok(page.includes('from "@/components/Counter"'), "page must import Counter");
    assert.ok(page.includes("<Counter value={streak}"), "streak must render through Counter");
    assert.ok(page.includes("fontSize={56}"), "counter must be large and prominent like the demo, not row-sized");
    assert.ok(page.includes("fontWeight={600}"), "counter must be semibold like the demo");
    assert.ok(page.includes("t.profile.statStreakLabel"), "counter must carry a day-streak label");
    assert.ok(!page.includes("fontSize={14}"), "the old small inline counter must be gone");
    assert.ok(!page.includes("{streak}d streak"), "plain streak text must be gone");
  });
});

describe("animated list — video list", () => {
  test("player page renders Course Lessons through AnimatedList", () => {
    const page = read("src/app/courses/[slug]/[collection]/page.tsx");
    assert.ok(
      page.includes('from "@/components/AnimatedList"'),
      "player must import AnimatedList"
    );
    assert.ok(page.includes("<AnimatedList"), "lessons must render through AnimatedList");
    assert.ok(page.includes("initialSelectedIndex={activeIndex}"), "selection must start on the active video");
    assert.ok(page.includes("onItemSelect"), "selecting a row must change the video");
    assert.ok(page.includes("setActiveIndex(index)"), "selection must set the active video");
    assert.ok(!page.includes("<ul className=\"mt-3 space-y-2\">"), "plain lessons <ul> must be gone");
  });

  test("list entries carry the same info as the old rows", () => {
    const page = read("src/app/courses/[slug]/[collection]/page.tsx");
    assert.ok(page.includes("listItems"), "player must map videos to list entries");
    // The status is richer now: Playing for the video that is playing,
    // Watched % for a partly watched one, Completed, else Not started.
    assert.ok(page.includes("t.course.playingLabel"), "entries must show the playing video");
    assert.ok(page.includes("t.common.completed"), "entries must show completion status");
    assert.ok(page.includes("t.common.watchedPct(pct)"), "entries must show partial watch progress");
    assert.ok(page.includes("t.common.notStarted"), "entries must show the untouched state");
    assert.ok(page.includes("t.common.duration(video.durationSeconds)"), "entries must show the duration");
  });

  test("list follows the app theme and stays in the app palette", () => {
    const page = read("src/app/courses/[slug]/[collection]/page.tsx");
    assert.ok(page.includes("theme={theme}"), "list must receive the app theme");
    assert.ok(page.includes("AL_DARK_OVERRIDES"), "dark theme must be overridden to the app palette");
    assert.ok(page.includes("getStoredTheme()"), "theme must come from the app theme store");
    assert.ok(page.includes("THEME_CHANGED_EVENT"), "list must follow theme changes");
  });
});

describe("elastic slider — one video control bar", () => {
  test("player uses a custom bar, not native controls", () => {
    const player = read("src/components/VideoPlayer.tsx");
    assert.ok(
      !/^\s*controls$/m.test(player),
      "video must not use native controls — the custom bar replaces them"
    );
    assert.ok(player.includes("togglePlay"), "bar must offer play/pause");
    assert.ok(player.includes("requestFullscreen"), "bar must offer fullscreen");
    assert.ok(player.includes("formatTime(currentTime)"), "bar must show the time");
  });

  test("seek bar and volume slider live in the same bar", () => {
    const player = read("src/components/VideoPlayer.tsx");
    assert.ok(player.includes("ariaLabel={t.player.seekLabel}"), "bar must have a seek slider");
    assert.ok(player.includes("ariaLabel={t.player.volumeLabel}"), "bar must have a volume slider");
    assert.ok(player.includes("value={currentTime}"), "seek must follow playback");
    assert.ok(player.includes("maxValue={duration"), "seek must span the duration");
    assert.ok(player.includes("onChange={handleSeek}"), "seek must move the video");
    assert.ok(player.includes("value={volume}"), "volume slider must be controlled by volume state");
    assert.ok(player.includes("onChange={handleVolumeChange}"), "volume slider must drive the volume");
  });

  test("volume slider opens on hover or on a tap of the speaker", () => {
    const player = read("src/components/VideoPlayer.tsx");
    assert.ok(player.includes("volumeExpanded"), "the slider width must follow hover or tap, not CSS hover alone");
    assert.ok(player.includes("setVolumeHovered(true)"), "hovering the speaker must open the slider");
    assert.ok(player.includes("handleSpeakerClick"), "tapping the speaker must open the slider on touch");
    assert.ok(!player.includes("group-hover/vol"), "the slider must not be hover-only — hover does not exist on touch");
    assert.ok(
      player.includes("w-0 overflow-hidden opacity-0"),
      "volume slider must start collapsed and invisible"
    );
    assert.ok(player.includes("video.volume = v / 100"), "slider must set the element volume");
    assert.ok(player.includes("volumechange"), "player must sync when volume changes elsewhere");
    assert.ok(player.includes("lp_volume"), "volume must persist per browser");
  });

  test("elastic slider stretches to its container (seek bar is full-width)", () => {
    const slider = read("src/components/ElasticSlider.tsx");
    assert.ok(
      slider.includes("flex w-full"),
      "vendored slider root must follow its container width, not the demo's fixed w-48"
    );
  });

  test("elastic slider className merge must join with a space (seek bar needs pointer-events-auto)", () => {
    const slider = read("src/components/ElasticSlider.tsx");
    assert.ok(
      slider.includes("[ROOT, className].filter(Boolean).join(' ')"),
      "the root className must join ROOT and the caller's className with a space — join('') glued them into one dead token (w-autopointer-events-auto) so the seek bar inherited pointer-events:none from the control bar and no drag or tap could seek"
    );
    assert.ok(
      !slider.includes("[ROOT, className].filter(Boolean).join('')"),
      "the empty-string join must be gone"
    );
    const player = read("src/components/VideoPlayer.tsx");
    assert.ok(
      player.includes('className="pointer-events-auto"'),
      "the seek slider must re-enable pointer events inside the pointer-events-none control bar"
    );
  });
});

describe("player page — no title card, button in the player footer, short scrollable list", () => {
  test("the title card under the player is gone", () => {
    const page = read("src/app/courses/[slug]/[collection]/page.tsx");
    assert.ok(!page.includes("collectionTitle"), "the playlist/title card and its data must be gone");
    assert.ok(!page.includes("text-lg font-semibold text-white"), "the card's big video title must be gone");
    assert.ok(!page.includes("uppercase tracking-wider text-neutral-500"), "the card's playlist line must be gone");
  });

  test("the Mark Complete / Watched button moved into the player's footer row", () => {
    const page = read("src/app/courses/[slug]/[collection]/page.tsx");
    assert.ok(page.includes("const completionButton = ("), "the button must be one shared element");
    assert.ok(page.includes("t.common.watchedPct"), "the button must still show the watched %");
    assert.ok(page.includes("Math.round(activeCoverage.fraction * 100)"), "the watched % must come from coverage");
    assert.ok(page.includes("t.lesson.markComplete"), "the button must still offer Mark Complete");
    assert.ok(page.includes("completionButton={completionButton}"), "MEGA videos must get the button in the player footer");
    assert.ok(page.includes("{completionButton}</div>"), "YouTube videos must get the button in their footer row");
    const player = read("src/components/VideoPlayer.tsx");
    assert.ok(player.includes("completionButton?: ReactNode"), "VideoPlayer must accept the button as a slot");
    const slotAt = player.indexOf("{completionButton}");
    assert.ok(
      slotAt > 0 && player.indexOf("t.lesson.saveOffline", slotAt) > slotAt,
      "the button must sit in the footer before Save Offline"
    );
  });

  test("the lesson list shows exactly 4 rows and scrolls inside itself", () => {
    const page = read("src/app/courses/[slug]/[collection]/page.tsx");
    assert.ok(page.includes("maxHeight={268}"), "the list must fit exactly 4 rows (tiles + its own padding)");
    assert.ok(page.includes("showGradients={false}"), "the bottom fade must not dim the 4th row");
    assert.ok(!page.includes("maxHeight={480}"), "the old 7-row list must be gone");
    assert.ok(!page.includes("maxHeight={320}"), "no half-cut 5th row may peek in");
  });

  test("the page itself never scrolls — no page sidebar on any screen", () => {
    const page = read("src/app/courses/[slug]/[collection]/page.tsx");
    assert.ok(page.includes("h-dvh"), "the page must be exactly one viewport tall");
    assert.ok(page.includes("overflow-hidden"), "the page must not scroll itself");
    assert.ok(!page.includes("min-h-screen"), "the old growing page must be gone");
    assert.ok(page.includes("overflow-y-auto"), "the content must scroll inside its container");
    assert.ok(page.includes("[scrollbar-width:none]"), "the container must hide its scrollbar (Firefox)");
    assert.ok(page.includes("[&::-webkit-scrollbar]:hidden"), "the container must hide its scrollbar (Chrome)");
  });
});
