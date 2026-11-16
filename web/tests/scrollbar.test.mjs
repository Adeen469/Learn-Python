import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(webDir, "src/app/globals.css"), "utf8");

describe("modern scrollbars (globals.css)", () => {
  test("slim white pill in a subtle groove (Chromium/Safari)", () => {
    assert.ok(css.includes("*::-webkit-scrollbar"), "must style the scrollbar");
    assert.ok(css.includes("width: 8px"), "scrollbar must be slim (8px)");
    assert.ok(css.includes("*::-webkit-scrollbar-track"), "must style the track");
    assert.ok(
      css.includes("background: rgba(255, 255, 255, 0.05)"),
      "track must be a faint groove, not invisible or solid"
    );
    assert.ok(css.includes("*::-webkit-scrollbar-thumb"), "must style the thumb");
    assert.ok(css.includes("border-radius: 999px"), "thumb must be a rounded pill");
    assert.ok(css.includes("background-clip: padding-box"), "thumb must float inside the track");
    assert.ok(
      css.includes("background-color: rgba(255, 255, 255, 0.45)"),
      "thumb must rest faint white (theme accent), not grey"
    );
    assert.ok(
      css.includes("*:hover::-webkit-scrollbar-thumb"),
      "thumb must reveal solid on hover over the scroll area"
    );
    assert.ok(
      css.includes("*::-webkit-scrollbar-thumb:hover"),
      "thumb must have a hover state"
    );
  });

  test("same treatment for Firefox + dark native controls", () => {
    assert.ok(css.includes("scrollbar-width: thin"), "Firefox must get a thin scrollbar");
    assert.ok(
      css.includes("scrollbar-color: rgba(255, 255, 255, 0.45) rgba(255, 255, 255, 0.05)"),
      "Firefox thumb must be faint white in a faint groove"
    );
    assert.ok(css.includes("color-scheme: dark"), "native controls must render dark");
  });

  test("Monaco (code editor) thumb is the same pill shape", () => {
    assert.ok(
      css.includes(".monaco-scrollable-element > .scrollbar > .slider"),
      "must round Monaco's own scrollbar thumb"
    );
    assert.ok(css.includes("border-radius: 999px"), "Monaco thumb must be a pill");
  });
});

describe("code editor scrollbar matches the theme (editor/page.tsx)", () => {
  const editor = readFileSync(join(webDir, "src/app/editor/page.tsx"), "utf8");

  test("lp-dark theme carries the white-pill scrollbar colors", () => {
    assert.ok(editor.includes('"lp-dark"'), "editor must use the lp-dark theme");
    assert.ok(editor.includes("defineTheme"), "theme must be defined via defineTheme");
    assert.ok(
      editor.includes('"scrollbarSliderBackground": "#ffffff73"'),
      "Monaco thumb must rest faint white (0.45)"
    );
    assert.ok(
      editor.includes('"scrollbarSliderHoverBackground": "#ffffffe6"'),
      "Monaco thumb must go near-solid white on hover"
    );
    assert.ok(
      editor.includes('"scrollbarSliderActiveBackground": "#ffffff"'),
      "Monaco thumb must go solid white while dragging"
    );
  });

  test("Monaco scrollbar is slim with no shadows", () => {
    assert.ok(editor.includes("verticalScrollbarSize: 8"), "vertical scrollbar must be 8px");
    assert.ok(editor.includes("horizontalScrollbarSize: 8"), "horizontal scrollbar must be 8px");
    assert.ok(editor.includes("useShadows: false"), "Monaco scrollbar must not cast shadows");
  });
});
