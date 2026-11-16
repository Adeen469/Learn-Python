import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(webDir, rel), "utf8");

describe("settings modal (profile dropdown)", () => {
  test("modal shows today's goal, streak, and a theme toggle", () => {
    const modal = read("src/components/SettingsModal.tsx");
    assert.ok(modal.includes("Settings"), "modal must be titled Settings");
    assert.ok(modal.includes("Today&apos;s goal"), "modal must show today's goal");
    assert.ok(modal.includes("Streak"), "modal must show the streak");
    assert.ok(modal.includes("wholeMinutes"), "goal must come from progress");
    assert.ok(modal.includes("computeStreak"), "streak must come from progress");
    assert.ok(modal.includes("Theme"), "modal must have a theme section");
    assert.ok(modal.includes("Dark"), "theme toggle must offer Dark");
    assert.ok(modal.includes("Light"), "theme toggle must offer Light");
    assert.ok(modal.includes("aria-pressed"), "toggle must mark the active theme");
    assert.ok(modal.includes('aria-label="Close settings"'), "modal must have a Close button");
  });
});

describe("navbar: stats moved out, nav centred, settings in the menu", () => {
  test("the goal/streak pills are gone from the navbar", () => {
    const nav = read("src/components/AppNavbar.tsx");
    assert.ok(!nav.includes("computeStreak"), "navbar must not render the streak pill");
    assert.ok(!nav.includes("wholeMinutes"), "navbar must not render the goal pill");
    assert.ok(!nav.includes("d streak</span>"), "navbar must not show a streak pill");
    assert.ok(!nav.includes("Flame"), "navbar must not import the Flame pill icon");
    assert.ok(!nav.includes("Target"), "navbar must not import the Target pill icon");
  });

  test("the three nav buttons sit centred", () => {
    const nav = read("src/components/AppNavbar.tsx");
    assert.ok(
      nav.includes("grid-cols-[1fr_auto_1fr]"),
      "header must be a 3-zone grid so the nav can sit dead centre"
    );
    assert.ok(
      nav.includes("justify-center"),
      "the nav must centre itself in the middle zone"
    );
  });

  test("profile menu has a Settings item that opens the modal", () => {
    const nav = read("src/components/AppNavbar.tsx");
    assert.ok(nav.includes("Settings"), "profile menu must offer Settings");
    assert.ok(nav.includes("onSettings"), "menu must take an onSettings handler");
    assert.ok(nav.includes("SettingsModal"), "navbar must mount the settings modal");
    assert.ok(
      nav.includes("onSettings={() => setSettingsOpen(true)}"),
      "settings item must open the modal"
    );
    assert.ok(
      nav.includes("theme={theme}"),
      "modal must receive the current theme"
    );
    assert.ok(
      nav.includes("onThemeChange={handleThemeChange}"),
      "modal must receive the theme toggle handler"
    );
  });
});

describe("theme (lib/theme.ts + layout + globals)", () => {
  test("theme is persisted and applied via a light class + event", () => {
    const lib = read("src/lib/theme.ts");
    assert.ok(lib.includes('THEME_KEY = "lp_theme"'), "theme must persist under lp_theme");
    assert.ok(lib.includes("getStoredTheme"), "must read the stored theme");
    assert.ok(lib.includes("applyTheme"), "must apply the theme");
    assert.ok(
      lib.includes('classList.toggle("light"'),
      "applying light must toggle the light class on <html>"
    );
    assert.ok(lib.includes("THEME_CHANGED_EVENT"), "theme changes must notify listeners");
    const layout = read("src/app/layout.tsx");
    assert.ok(
      layout.includes('localStorage.getItem("lp_theme")==="light"'),
      "layout must apply the saved theme before first paint"
    );
  });

  test("light mode flips the main dark surfaces (globals.css)", () => {
    const css = read("src/app/globals.css");
    assert.ok(css.includes("html.light"), "globals must carry light-mode overrides");
    assert.ok(css.includes("color-scheme: light"), "light mode must use a light color scheme");
    assert.ok(
      css.includes("html.light .bg-black"),
      "light mode must flip black surfaces to white"
    );
    assert.ok(
      css.includes("html.light .text-white"),
      "light mode must flip white text to black"
    );
    assert.ok(
      css.includes('html.light img[src="/lp-logo.png"]'),
      "the black-tile logo must invert in light mode"
    );
    assert.ok(
      css.includes("html.light *::-webkit-scrollbar-thumb"),
      "light mode must restyle the scrollbar thumb"
    );
  });

  test("Monaco follows the theme (editor/page.tsx)", () => {
    const editor = read("src/app/editor/page.tsx");
    assert.ok(editor.includes('"lp-light"'), "editor must define an lp-light theme");
    assert.ok(
      editor.includes('"scrollbarSliderBackground": "#00000073"'),
      "light Monaco thumb must be a dark pill"
    );
    assert.ok(
      editor.includes("THEME_CHANGED_EVENT"),
      "editor must follow theme changes live"
    );
    assert.ok(editor.includes("editorTheme"), "editor must switch theme from state");
  });
});
