import assert from "node:assert";
import { describe, test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

// StarBorder (React Bits), vendored flat in src/components/ like the other
// React Bits components (Counter, AnimatedList, ElasticSlider), used on
// the landing page's Get started button.

describe("star border install", () => {
  test("component and css are vendored", () => {
    assert.ok(existsSync(path.join(root, "src/components/StarBorder.tsx")), "StarBorder.tsx must exist");
    assert.ok(existsSync(path.join(root, "src/components/StarBorder.css")), "StarBorder.css must exist");
    const component = read("src/components/StarBorder.tsx");
    assert.ok(component.includes("export default StarBorder"), "StarBorder must be the default export");
    assert.ok(component.includes("import './StarBorder.css'"), "the component must import its CSS");
    const css = read("src/components/StarBorder.css");
    assert.ok(css.includes(".star-border"), "CSS must define .star-border");
    assert.ok(css.includes(".star-border__light"), "CSS must define the light canvas");
  });

  test("the landing page's Get started button is a StarBorder link to /auth/email", () => {
    const landing = read("src/components/LandingPage.tsx");
    assert.ok(landing.includes('from "@/components/StarBorder"'), "landing must import StarBorder");
    assert.ok(landing.includes("<StarBorder"), "Get started must render StarBorder");
    assert.ok(landing.includes('as="a"'), "StarBorder must render as a link");
    assert.ok(landing.includes('href="/auth/email"'), "Get started must link to the login/register page");
    assert.ok(landing.includes("Get started"), "the button must still say Get started");
    assert.ok(landing.includes('<div className="mt-12">'), "Get started must sit lower with clean breathing room above it");
    assert.ok(!landing.includes("rounded-xl bg-white px-6 py-3"), "the old plain white hero button must be gone");
  });
});
