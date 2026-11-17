import assert from "node:assert";
import { describe, test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

// RotatingText (React Bits), vendored flat in src/components/ like the other
// React Bits components, used for the rotating online/offline word in the
// landing page headline. Depends on the `motion` package (motion/react).

describe("rotating text install", () => {
  test("component and css are vendored", () => {
    assert.ok(existsSync(path.join(root, "src/components/RotatingText.tsx")), "RotatingText.tsx must exist");
    assert.ok(existsSync(path.join(root, "src/components/RotatingText.css")), "RotatingText.css must exist");
    const component = read("src/components/RotatingText.tsx");
    assert.ok(component.includes("export default RotatingText"), "RotatingText must be the default export");
    assert.ok(component.includes("import './RotatingText.css'"), "the component must import its CSS");
    assert.ok(component.includes("from 'motion/react'"), "the component must use motion/react");
    const css = read("src/components/RotatingText.css");
    assert.ok(css.includes(".text-rotate"), "CSS must define .text-rotate");
    assert.ok(css.includes(".text-rotate-highlight"), "CSS must define the highlight block");
  });

  test("the landing headline rotates online then offline", () => {
    const landing = read("src/components/LandingPage.tsx");
    assert.ok(landing.includes('from "@/components/RotatingText"'), "landing must import RotatingText");
    assert.ok(landing.includes("<RotatingText"), "the headline must render RotatingText");
    assert.ok(landing.includes('texts={["online", "offline"]}'), "the rotating texts must be online then offline");
    assert.ok(landing.includes("highlight={true}"), "the rotating word must sit on a highlight block");
    assert.ok(!landing.includes("Learn Python, online or off."), "the old headline must be gone");
  });
});
