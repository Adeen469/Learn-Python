import assert from "node:assert";
import { describe, test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

// PillNav (React Bits), vendored flat in src/components/ like the other
// React Bits components. It renders the navbar links (Learn / Video Courses
// / Code Editor) as a glass pill bar — in the desktop top bar and as a
// floating dock on mobile, with the profile circle beside it. No extra
// dependency — the animation runs on the Web Animations API + rAF.

describe("pill nav install", () => {
  test("component and css are vendored", () => {
    assert.ok(existsSync(path.join(root, "src/components/PillNav.tsx")), "PillNav.tsx must exist");
    assert.ok(existsSync(path.join(root, "src/components/PillNav.css")), "PillNav.css must exist");
    const component = read("src/components/PillNav.tsx");
    assert.ok(component.includes("export default PillNav"), "PillNav must be the default export");
    assert.ok(component.includes("import './PillNav.css'"), "the component must import its CSS");
    assert.ok(!component.includes("framer-motion"), "PillNav must not need framer-motion");
    assert.ok(!component.includes("from 'motion'"), "PillNav must not need motion");
    assert.ok(!component.includes("from 'gsap'"), "PillNav must not need gsap");
    const css = read("src/components/PillNav.css");
    assert.ok(css.includes(".pill-nav"), "CSS must define .pill-nav");
    assert.ok(css.includes(".pill-nav__dot"), "CSS must define the active dot");
  });

  test("the desktop navbar uses PillNav for its three links", () => {
    const navbar = read("src/components/AppNavbar.tsx");
    assert.ok(navbar.includes('from "@/components/PillNav"'), "the navbar must import PillNav");
    assert.strictEqual(
      navbar.split("<PillNav").length - 1,
      2,
      "PillNav must render twice — desktop top bar and mobile bottom dock",
    );
    assert.ok(navbar.includes('itemStyle="plain"'), "the nav must use plain items");
    assert.ok(navbar.includes('hoverEffect="fill"'), "the nav must use the fill hover effect");
    assert.ok(navbar.includes('indicator="dot"'), "the nav must mark the page with a dot");
    assert.ok(navbar.includes('collapse="never"'), "the nav must never fold — mobile uses the bottom dock");
    assert.ok(navbar.includes("linkComponent={Link}"), "the nav must route through Next Link");
    assert.ok(navbar.includes('theme="dark"'), "the nav must stay dark like the header");
    assert.ok(
      navbar.includes('pathname.startsWith("/learn")'),
      "the active item must follow the current route",
    );
    assert.ok(
      !navbar.includes("hidden items-center justify-center gap-1 md:flex"),
      "the old plain centre links must be gone",
    );
    assert.ok(navbar.includes("ProfileMenuItems"), "the profile dropdown must stay");
  });

  test("the mobile bottom bar is the same PillNav as a floating dock", () => {
    const navbar = read("src/components/AppNavbar.tsx");
    assert.ok(!navbar.includes("grid grid-cols-4"), "the old four-column tab bar must be gone");
    assert.ok(!navbar.includes("fixed bottom-0"), "the old full-width bottom bar must be gone");
    assert.ok(navbar.includes("fixed bottom-3"), "the mobile dock must float above the bottom edge");
    assert.ok(navbar.includes('size="md"'), "the mobile dock must use the bigger md size");
    assert.ok(
      navbar.includes('"--pn-h": "48px"'),
      "the mobile dock bar must be 48px tall, not the short 36px",
    );
    assert.ok(
      navbar.includes('"--pn-x": "14px"'),
      "the mobile dock must use wider item padding for its bigger icons",
    );
    assert.ok(navbar.includes("h-11 w-11"), "the profile circle beside the dock must match its height");
    assert.ok(navbar.includes("data-profile-trigger"), "the profile circle must stay beside the dock");
    assert.ok(navbar.includes("absolute bottom-full right-0"), "the profile menu must open upward");
  });

  test("the header shows only the bigger logo, no wordmark", () => {
    const navbar = read("src/components/AppNavbar.tsx");
    assert.ok(
      !navbar.includes("whitespace-nowrap text-sm font-semibold tracking-tight text-white"),
      "the old LP / Learn Python wordmark span must stay gone",
    );
    assert.ok(
      !navbar.includes('font-bold text-white">L</span>'),
      "the Learn Python wordmark must be gone — Maalik picked streak + Continue instead",
    );
    assert.ok(navbar.includes("width={48}"), "the logo must be bigger than before (48px)");
    assert.ok(navbar.includes("h-12 w-12"), "the logo must render at 48px");
    assert.ok(navbar.includes('src="/lp-logo.png"'), "the logo image must stay");
  });

  test("the nav is icon-only, with the label as a hover tooltip", () => {
    const component = read("src/components/PillNav.tsx");
    assert.ok(
      component.includes('<span className={LABEL}>{item.label}</span>'),
      "the label must sit in its own span so CSS can hide it",
    );
    assert.ok(component.includes("pill-nav__tip"), "each bar item must carry a tooltip span");
    assert.ok(
      component.includes('<span className={TIP} aria-hidden="true">'),
      "the tooltip must hold the label and stay out of the accessibility tree",
    );
    const css = read("src/components/PillNav.css");
    assert.ok(
      css.includes(".pill-nav__bar .pill-nav__label"),
      "the bar must visually hide its inline labels (panel rows keep theirs)",
    );
    assert.ok(css.includes(".pill-nav__tip"), "CSS must style the tooltip");
    assert.ok(
      css.includes(".pill-nav__slot:hover .pill-nav__tip"),
      "the tooltip must appear when its item is hovered",
    );
    assert.ok(
      css.includes(".pill-nav--dock .pill-nav__tip"),
      "the mobile dock tooltip must open upward, not off the bottom of the screen",
    );
    assert.ok(css.includes("@media (hover: none)"), "touch screens must never see a tooltip");
    assert.ok(css.includes("width: 1.3em"), "icons must be slightly bigger now they stand alone");
    const navbar = read("src/components/AppNavbar.tsx");
    assert.ok(
      navbar.includes('className="pill-nav--dock"'),
      "the mobile dock must carry the dock class for its upward tooltip",
    );
  });

  test("the mobile header shows streak + Continue top-right, desktop unchanged", () => {
    const navbar = read("src/components/AppNavbar.tsx");
    // Maalik picked these two from the five-idea preview (2026-11-18):
    // streak chip + Continue, mobile only, on the right side.
    assert.ok(navbar.includes("Flame"), "the streak chip must use the Flame icon");
    assert.ok(navbar.includes("computeStreak"), "the streak must come from the real progress record");
    assert.ok(navbar.includes("Continue"), "the Continue button must be there");
    assert.ok(navbar.includes("LEARN_SECTIONS"), "Continue must find the next uncompleted topic");
    assert.ok(
      navbar.includes("flex items-center gap-2 md:hidden"),
      "streak + Continue must sit in a mobile-only wrapper on the right",
    );
    assert.ok(
      navbar.includes("grid-cols-[1fr_auto]") && navbar.includes("md:grid-cols-[1fr_auto_1fr]"),
      "mobile must be a 2-zone grid (logo left, chips right) — the centre cell is hidden on mobile, so a 3-zone grid would park the chips in the middle",
    );
    // The three he dropped must be gone.
    assert.ok(!navbar.includes("progressPercent"), "the goal ring must be gone");
    assert.ok(!navbar.includes("strokeDasharray"), "the goal ring SVG must be gone");
    assert.ok(!navbar.includes("/ 100"), "the Day counter must be gone");
    assert.ok(!navbar.includes("lp_completed_lessons"), "the Day counter must not read video lessons");
    // Desktop is exactly as it was: the plain 3-zone grid, no chips.
    assert.ok(
      navbar.includes("grid-cols-[1fr_auto_1fr]"),
      "the desktop header must keep its 3-zone grid",
    );
  });
});
