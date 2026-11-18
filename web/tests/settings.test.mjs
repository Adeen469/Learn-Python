import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(webDir, rel), "utf8");

describe("settings page (/settings)", () => {
  test("page shows today's goal, streak, and a theme toggle", () => {
    const page = read("src/app/settings/page.tsx");
    const en = read("src/lib/i18n/en.ts");
    assert.ok(page.includes("Settings"), "page must be titled Settings");
    // The section labels moved to i18n (en.ts settings/settingsPage);
    // the page must render the keys and the English values must read
    // what the user actually sees.
    assert.ok(page.includes("t.settingsPage.todaySection"), "page must render the today section");
    assert.ok(page.includes("t.settings.dailyGoal"), "page must show today's goal");
    assert.ok(en.includes('todaySection: "Today"'), "the today section must read Today");
    assert.ok(en.includes('dailyGoal: "Daily goal"'), "the goal label must read Daily goal");
    assert.ok(page.includes("t.settings.streak"), "page must render the streak label");
    assert.ok(en.includes('streak: "Streak"'), "page must show the streak");
    assert.ok(page.includes("wholeMinutes"), "goal must come from progress");
    assert.ok(page.includes("computeStreak"), "streak must come from progress");
    assert.ok(page.includes("t.settings.theme"), "page must render the theme label");
    assert.ok(en.includes('theme: "Theme"'), "page must have a theme section");
    assert.ok(page.includes("t.settings.themeDark"), "theme toggle must offer Dark");
    assert.ok(en.includes('themeDark: "Dark"'), "the dark option must read Dark");
    assert.ok(page.includes("t.settings.themeLight"), "theme toggle must offer Light");
    assert.ok(en.includes('themeLight: "Light"'), "the light option must read Light");
    assert.ok(page.includes("aria-pressed"), "toggle must mark the active theme");
    assert.ok(page.includes("AppNavbar"), "page must render the navbar");
    assert.ok(page.includes("applyTheme"), "toggle must apply the theme");
  });
});

describe("navbar: streak chip in mobile header, nav centred, settings in the menu", () => {
  test("the streak chip is back in the mobile header; the goal stays in Settings", () => {
    // Maalik picked streak + Continue from the five-idea preview
    // (2026-11-18). The goal ring was dropped, so the goal stays in
    // Settings only — the old "pills gone" call stands for the goal.
    const nav = read("src/components/AppNavbar.tsx");
    assert.ok(nav.includes("computeStreak"), "the mobile header must show the streak chip");
    assert.ok(nav.includes("Flame"), "the streak chip must use the Flame icon");
    assert.ok(!nav.includes("progressPercent"), "the goal ring must be gone — goal stays in Settings");
    assert.ok(!nav.includes("wholeMinutes"), "the navbar must not render the goal pill");
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

  test("profile menu links to the settings page (no modal)", () => {
    const nav = read("src/components/AppNavbar.tsx");
    assert.ok(nav.includes("Settings"), "profile menu must offer Settings");
    assert.ok(
      nav.includes('href="/settings"'),
      "settings must link to the /settings page"
    );
    assert.ok(
      !nav.includes("SettingsModal"),
      "navbar must not mount a settings modal anymore"
    );
    assert.ok(
      !nav.includes("settingsOpen"),
      "navbar must not keep settings-modal state"
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
