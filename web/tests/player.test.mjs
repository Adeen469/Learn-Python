// Static checks over the course player corrections (2026-11-18):
// the playing video's real status in the lesson list, the ring
// following it, speed/download/quality in the control bar, auto-hide
// controls, autoplay to the next lesson, and English captions.
// Fully static (reads the .ts/.tsx files as text) — no TS import needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(webDir, rel), "utf8").replace(/\r\n/g, "\n");
const playerPage = () => read("src/app/courses/[slug]/[collection]/page.tsx");
const player = () => read("src/components/VideoPlayer.tsx");
const animatedList = () => read("src/components/AnimatedList.tsx");

test("the lesson list shows Playing for the video that is playing", () => {
  const page = playerPage();
  assert.ok(page.includes("onPlayStateChange={handlePlayStateChange}"), "the page must learn the play state from the player");
  assert.ok(page.includes("const [isPlaying, setIsPlaying] = useState(false)"), "the page must track whether the video is playing");
  assert.ok(page.includes("setIsPlaying(playing)"), "the play-state handler must update isPlaying");
  assert.ok(page.includes('description: locked'), "locked videos must have their own list status first");
  assert.ok(page.includes("? t.course.playingLabel"), "the list status must have a Playing branch");
  assert.ok(page.includes('"Playing"'), "the playing video must say Playing, not Not started");
  assert.ok(page.includes("const playing = index === activeIndex && isPlaying"), "Playing must mean the active video is actually playing");
  const vp = player();
  assert.ok(vp.includes("onPlayStateChangeRef.current?.(true)"), "the player must report play");
  assert.ok(vp.includes("onPlayStateChangeRef.current?.(false)"), "the player must report pause/end");
});

test("a partly watched video shows Watched X% instead of Not started", () => {
  const page = playerPage();
  assert.ok(page.includes("storedCoveragePct"), "the page must read stored coverage for the list");
  assert.ok(page.includes("lp_coverage_"), "stored coverage must come from the player's lp_coverage_ keys");
  assert.ok(page.includes("t.common.watchedPct(pct)"), "a partly watched row must show its %");
  assert.ok(page.includes("t.common.notStarted"), "an untouched video must still say Not started");
});

test("the list ring follows the playing video and returns to it on mouse leave", () => {
  const list = animatedList();
  assert.ok(list.includes("selectedIndex?:"), "AnimatedList must accept a controlled selectedIndex");
  assert.ok(
    list.includes("if (selectedIndex !== undefined) setSelected(selectedIndex)"),
    "the ring must follow the controlled index when it changes",
  );
  assert.ok(
    list.includes("settingsRef.current.selectedIndex"),
    "leaving the list must restore the ring to the controlled (playing) item",
  );
  const page = playerPage();
  assert.ok(page.includes("selectedIndex={activeIndex}"), "the player page must control the ring with the active video");
});

test("the control bar has speed and quality in a settings menu", () => {
  const vp = player();
  assert.ok(vp.includes("PLAYBACK_RATES"), "the player must offer playback speeds");
  for (const rate of ["0.5", "0.75", "1.25", "1.5", "2"]) {
    assert.ok(vp.includes(rate), `speed ${rate}x must be offered`);
  }
  assert.ok(vp.includes("video.playbackRate = playbackRate"), "the chosen speed must reach the video element");
  assert.ok(vp.includes("t.player.playbackSpeed"), "the settings menu must have a speed section");
  assert.ok(vp.includes("t.player.quality"), "the settings menu must have a quality section");
  assert.ok(vp.includes("video.videoHeight"), "the quality must come from the file's real resolution");
  assert.ok(vp.includes("t.player.qualityNote"), "the menu must say there is only one stream");
  assert.ok(vp.includes("t.player.settingsLabel"), "the gear button must name what it holds");
});

test("the control bar has a download button", () => {
  const vp = player();
  assert.ok(vp.includes("handleDownload"), "the player must have a download action");
  assert.ok(vp.includes("t.player.downloadVideo"), "the bar must carry a Download button");
  assert.ok(vp.includes("a.download = name"), "the download must name the file after the lesson");
  assert.ok(vp.includes('.mp4'), "the downloaded file must be an .mp4");
  assert.ok(vp.includes("!isOnline && !isSavedOffline"), "download must be disabled when offline with nothing saved");
});

test("controls auto-hide 2.5s after the last mouse move and return on movement", () => {
  const vp = player();
  assert.ok(vp.includes("CONTROLS_HIDE_MS = 2500"), "the hide delay must be 2.5s");
  assert.ok(vp.includes("showControls"), "the bar must track its visibility");
  assert.ok(vp.includes("onMouseMove={handlePointerActivity}"), "mouse movement must bring the controls back");
  assert.ok(vp.includes("onMouseEnter={handlePointerActivity}"), "entering the player must show the controls");
  assert.ok(vp.includes('showControls ? "opacity-100" : "opacity-0"'), "hidden controls must fade out");
  assert.ok(vp.includes("pointer-events-none absolute inset-x-0 bottom-0"), "the control bar must never catch clicks on the video");
  assert.ok(vp.includes("cursor-none"), "the cursor must hide with the controls");
  assert.ok(vp.includes("if (paused || settingsOpen) return"), "the bar must never hide while paused or while a menu is open");
});

test("autoplay advances to the next lesson when a video ends", () => {
  const page = playerPage();
  assert.ok(page.includes('localStorage.getItem("lp_autoplay")'), "autoplay must survive reloads");
  assert.ok(page.includes("handleVideoEnded"), "the page must handle the video ending");
  assert.ok(page.includes("setActiveIndex(nextIndex)"), "ending must move to the next lesson");
  assert.ok(page.includes("if (!autoplay) return"), "ending must stay put when autoplay is off");
  assert.ok(page.includes("autoplay={autoplay}"), "the player must get the autoplay setting");
  assert.ok(page.includes('?autoplay=${autoplay ? 1 : 0}'), "the YouTube fallback must autoplay too");
  const vp = player();
  assert.ok(vp.includes("autoPlay={autoplay}"), "the video element must attempt autoplay");
  assert.ok(vp.includes("onEndedRef.current?.()"), "the player must tell the page when the video ends");
  // The toggle lives in the settings menu (above the speed section),
  // not in the footer.
  assert.ok(vp.includes("Autoplay"), "the settings menu must carry the autoplay toggle");
  assert.ok(
    vp.indexOf("Autoplay") < vp.indexOf("Playback speed"),
    "autoplay must sit at the top of the settings menu",
  );
  assert.ok(vp.includes('aria-pressed={autoplay}'), "the toggle must show its state");
  assert.ok(
    !vp.includes("inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition"),
    "the footer autoplay button must be gone",
  );
});

test("English captions: the CC button only shows when a .vtt file exists", () => {
  const vp = player();
  assert.ok(vp.includes("captionsAvailable"), "the player must check whether captions exist");
  assert.ok(vp.includes("`/captions/${videoId}.en.vtt`"), "captions must be the English .vtt named after the video");
  assert.ok(vp.includes('kind="captions"'), "the video must carry a captions track");
  assert.ok(vp.includes('label="English"'), "the track must be labelled English");
  assert.ok(vp.includes("track.mode"), "the toggle must switch the track on and off");
  assert.ok(vp.includes('localStorage.getItem(CAPTIONS_KEY)'), "the caption choice must survive reloads");
  assert.ok(vp.includes("Captions"), "the bar must carry a CC button when captions exist");
  assert.ok(
    existsSync(join(webDir, "scripts/fetch-captions.mjs")),
    "the script that fetches the .vtt files must exist",
  );
  const script = read("scripts/fetch-captions.mjs");
  assert.ok(
    script.includes('if (!line.includes("megaLessonId")) continue;'),
    "only MEGA videos need local tracks; YouTube embeds provide their own captions",
  );
  assert.ok(script.includes("videoId:"), "the script must collect every videoId in the catalog");
  assert.ok(script.includes("--write-auto-subs"), "the script must fetch auto-generated subs too");
  assert.ok(script.includes('"en"'), "the script must fetch the English track");
  assert.ok(script.includes("public/captions"), "the script must save into public/captions");
});

test("Volume slider: opens on tap, not just on hover", () => {
  const vp = player();
  assert.ok(vp.includes("volumeOpen"), "the slider must have a tap-open state");
  assert.ok(vp.includes("handleSpeakerClick"), "tapping the speaker must open the slider before muting");
  assert.ok(vp.includes("volumeExpanded"), "the slider width must follow hover or tap, not CSS hover alone");
  assert.ok(!vp.includes("group-hover/vol"), "the slider must not be hover-only — hover does not exist on touch");
  assert.ok(vp.includes("volumeGroupRef"), "an outside tap must close the slider");
  assert.ok(vp.includes("pointerdown"), "the outside-tap close must listen for pointerdown");
});

test("Keyboard shortcuts: Space plays/pauses, arrows seek 10 seconds", () => {
  const vp = player();
  assert.ok(vp.includes("tabIndex={0}"), "the player must be focusable for keyboard shortcuts");
  assert.ok(vp.includes("onKeyDown={handlePlayerKeyDown}"), "the player must handle keys");
  assert.ok(vp.includes('e.key === " "'), "Space must toggle play/pause");
  assert.ok(vp.includes('e.key === "ArrowRight"'), "right arrow must seek forward");
  assert.ok(vp.includes('e.key === "ArrowLeft"'), "left arrow must seek backward");
  assert.ok(vp.includes("seekBy(10)"), "right arrow must seek 10 seconds forward");
  assert.ok(vp.includes("seekBy(-10)"), "left arrow must seek 10 seconds back");
  assert.ok(vp.includes("e.target !== e.currentTarget"), "keys must only act when the player itself has focus, not a button inside it");
  assert.ok(!vp.includes("t.player.keyboardHint"), "the keyboard hint line is hidden — it must not be rendered under the video");
});

test("Keyboard volume: ArrowUp raises volume, ArrowDown lowers it", () => {
  const vp = player();
  assert.ok(vp.includes('e.key === "ArrowUp"'), "up arrow must change volume");
  assert.ok(vp.includes('e.key === "ArrowDown"'), "down arrow must change volume");
  assert.ok(vp.includes("handleVolumeChange(volume + 5)"), "up arrow must raise volume by 5");
  assert.ok(vp.includes("handleVolumeChange(volume - 5)"), "down arrow must lower volume by 5");
  assert.ok(vp.includes("showVolumeSliderBriefly"), "volume keys must briefly show the volume slider");
  const en = read("src/lib/i18n/en.ts");
  assert.ok(en.includes("↑ ↓ — volume"), "the (hidden) keyboard hint text must mention the volume keys");
});

test("Loading state: a spinner + Loading text shows while the stream loads or re-buffers", () => {
  const vp = player();
  assert.ok(vp.includes("isLoading"), "the player must track a loading state");
  assert.ok(vp.includes('setIsLoading(true)'), "the spinner must start on when a lesson loads");
  assert.ok(vp.includes('"waiting"'), "the spinner must show when playback stalls on buffering");
  assert.ok(vp.includes('"playing"'), "the spinner must hide once playback starts");
  assert.ok(vp.includes('"canplay"'), "the spinner must hide once the video can play");
  assert.ok(vp.includes('"loadstart"'), "the spinner must show when a new load begins");
  assert.ok(vp.includes("t.common.loading"), "the spinner must label itself Loading in the user's language");
  assert.ok(vp.includes("animate-spin"), "the loading indicator must spin");
  assert.ok(vp.includes("pointer-events-none"), "the spinner must not block taps on the video");
});

test("Paused state: the lesson list says Paused when the video is stopped mid-way", () => {
  const page = playerPage();
  assert.ok(page.includes("hasPlayed"), "the page must remember whether the video has started");
  assert.ok(page.includes("t.course.pausedLabel"), "the list must show a Paused label");
  assert.ok(page.includes("hasPlayed && !isPlaying"), "Paused must mean started but not playing");
  assert.ok(page.includes("setHasPlayed(false)"), "picking another lesson must reset the played state");
  const en = read("src/lib/i18n/en.ts");
  assert.ok(en.includes('pausedLabel: "Paused"'), "the Paused label must exist in English");
});

test("Double-tap seek: two quick taps on a video half seek 10 seconds (touch only)", () => {
  const vp = player();
  assert.ok(vp.includes("handleVideoTouchEnd"), "the video must handle touch end for double-tap");
  assert.ok(vp.includes("DOUBLE_TAP_MS"), "a double-tap window must be defined");
  assert.ok(vp.includes('seekBy(dir === "back" ? -10 : 10)'), "double-tap left rewinds, right forwards 10s");
  assert.ok(vp.includes("seekFeedback"), "a visible 10s badge must show where the double-tap landed");
  assert.ok(vp.includes("onClick={handleVideoClick}"), "the video click must not double-toggle after a touch tap");
  assert.ok(vp.includes("preventDefault"), "the touch handler must suppress the synthetic click");
  assert.ok(vp.includes("pointer-events-none absolute inset-x-0 bottom-0"), "the control bar must not block taps on the video");
  assert.ok(vp.includes('className="pointer-events-auto"'), "the seek bar must stay tappable above the pass-through bar");
  assert.ok(vp.includes("pointer-events-auto mt-1 flex items-center gap-2"), "the control buttons must stay tappable above the pass-through bar");
});
