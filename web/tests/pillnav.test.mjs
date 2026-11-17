import assert from "node:assert";
import { describe, test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

// PillNav (React Bits), vendored flat in src/components/ like the other
// React Bits components. It renders the desktop top navbar's centre links
// (Learn / Video Courses / Code Editor) as a glass pill bar. No extra
// dependency — the animation runs on the Web Animations API + rAF. The
// mobile bottom tab bar is a different pattern and stays as it is.

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

  test("the desktop navbar uses PillNav for its three links, mobile bar untouched", () => {
    const navbar = read("src/components/AppNavbar.tsx");
    assert.ok(navbar.includes('from "@/components/PillNav"'), "the navbar must import PillNav");
    assert.ok(navbar.includes("<PillNav"), "the navbar must render PillNav");
    assert.ok(navbar.includes('itemStyle="plain"'), "the nav must use plain items");
    assert.ok(navbar.includes('hoverEffect="fill"'), "the nav must use the fill hover effect");
    assert.ok(navbar.includes('indicator="dot"'), "the nav must mark the page with a dot");
    assert.ok(navbar.includes('collapse="never"'), "the nav must never fold — mobile uses the bottom bar");
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
    assert.ok(navbar.includes("fixed bottom-0"), "the mobile bottom tab bar must stay");
    assert.ok(navbar.includes("ProfileMenuItems"), "the profile dropdown must stay");
  });
});
