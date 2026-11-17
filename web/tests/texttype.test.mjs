import assert from "node:assert";
import { describe, test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

// TextType (React Bits), vendored flat in src/components/ like the other
// React Bits components, used for the typed online/offline word in the
// landing page headline. Depends on the `gsap` package. It replaced
// RotatingText (deleted, motion dep removed with it).

describe("text type install", () => {
  test("component and css are vendored", () => {
    assert.ok(existsSync(path.join(root, "src/components/TextType.tsx")), "TextType.tsx must exist");
    assert.ok(existsSync(path.join(root, "src/components/TextType.css")), "TextType.css must exist");
    const component = read("src/components/TextType.tsx");
    assert.ok(component.includes("export default TextType"), "TextType must be the default export");
    assert.ok(component.includes("import './TextType.css'"), "the component must import its CSS");
    assert.ok(component.includes("from 'gsap'"), "the component must use gsap");
    const css = read("src/components/TextType.css");
    assert.ok(css.includes(".text-type"), "CSS must define .text-type");
    assert.ok(css.includes(".text-type__cursor"), "CSS must define the cursor");
  });

  test("the landing headline types online then offline, and RotatingText is gone", () => {
    const landing = read("src/components/LandingPage.tsx");
    assert.ok(landing.includes('from "@/components/TextType"'), "landing must import TextType");
    assert.ok(landing.includes("<TextType"), "the headline must render TextType");
    assert.ok(landing.includes('text={["online", "offline"]}'), "the typed words must be online then offline");
    assert.ok(landing.includes('cursorStyle="bar"'), "the cursor must be a bar");
    assert.ok(landing.includes("mistakes={0}"), "the typed word must never make a typo");
    assert.ok(!landing.includes("mistakes={0.2}"), "no typo rate may remain");
    assert.ok(!landing.includes("RotatingText"), "RotatingText must not be used anymore");
    assert.ok(!existsSync(path.join(root, "src/components/RotatingText.tsx")), "RotatingText.tsx must be deleted");
    assert.ok(!existsSync(path.join(root, "src/components/RotatingText.css")), "RotatingText.css must be deleted");
    assert.ok(!existsSync(path.join(root, "tests/rotating-text.test.mjs")), "rotating-text.test.mjs must be deleted");
  });
});
