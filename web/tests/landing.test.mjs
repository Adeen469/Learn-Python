import assert from "node:assert";
import { describe, test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

// Landing page: no 100-days framing, no creator name, and no mention of
// where the videos come from — the page sells the platform (offline
// videos + tutorials, secure sign-in), not a single course.

describe("landing page — no 100-days, no creator, no video source", () => {
  test("nothing on the landing page names a course, a creator, or a video source", () => {
    const landing = read("src/components/LandingPage.tsx");
    for (const banned of [
      "100 day",
      "100-day",
      "100days",
      "CodeWithHarry",
      "Code With Harry",
      "YouTube",
      "youtube",
      "Hindi",
    ]) {
      assert.ok(!landing.includes(banned), `landing page must not mention "${banned}"`);
    }
  });

  test("the hero types Learn Python programming, online then offline, with real content numbers", () => {
    const landing = read("src/components/LandingPage.tsx");
    assert.ok(landing.includes("Learn Python programming,"), "hero must lead with Learn Python programming");
    assert.ok(landing.includes("<TextType"), "the headline must render TextType");
    assert.ok(landing.includes('text={["online", "offline"]}'), "the typed words must be online then offline");
    assert.ok(landing.includes('as="span"'), "the typed word must flow inline on the same line");
    assert.ok(landing.includes("mt-5 max-w-4xl text-3xl"), "the headline must be wide enough for one line on desktop and wrap cleanly on mobile");
    assert.ok(!landing.includes("RotatingText"), "the old rotating word must be gone");
    assert.ok(!landing.includes("online or off"), "the headline must say offline, not off");
    assert.ok(landing.includes('{ value: "812", label: "topics" }'), "stats must show 812 topics");
    assert.ok(landing.includes('{ value: "259", label: "videos" }'), "stats must show 259 videos");
    assert.ok(landing.includes('{ value: "6", label: "stages" }'), "stats must keep the 6 roadmap stages");
  });

  test("no pill above the hero and no wordmark text beside the logo", () => {
    const landing = read("src/components/LandingPage.tsx");
    assert.ok(!landing.includes("812 topics • 259 videos • Code editor"), "the stats pill must be gone");
    assert.ok(!landing.includes("rounded-full border border-neutral-800"), "no pill styling may remain");
    assert.ok(!landing.includes('LP <span className="text-xs font-normal text-neutral-500">Learn Python</span>'), "the header wordmark text must be gone");
  });

  test("login/register has a clear entry — Get started and Sign in both go to /auth/email", () => {
    const landing = read("src/components/LandingPage.tsx");
    assert.ok(landing.includes("Get started"), "hero must have a Get started button");
    assert.ok(landing.includes('href="/auth/email"'), "the buttons must link to the login/register page");
    assert.ok(!landing.includes('href="/api/auth/google"'), "the landing page must not link straight to Google — the login page offers both");
  });

  test("the feature cards cover offline videos, offline tutorials, AI and GitHub", () => {
    const landing = read("src/components/LandingPage.tsx");
    assert.ok(landing.includes("Videos, online & offline"), "videos must be sold as online + offline");
    assert.ok(landing.includes("Tutorials, offline too"), "tutorials must be sold as offline too");
    assert.ok(landing.includes("Ask the AI tutor"), "the AI tutor must be on the page");
    assert.ok(landing.includes("GitHub, built in"), "GitHub integration must be on the page");
    assert.ok(landing.includes("Code editor"), "the code editor must stay on the page");
    assert.ok(landing.includes("Daily goals & streaks"), "streaks must stay on the page");
  });

  test("auth is NOT sold as a landing-page card — it is built as real sign-in", () => {
    const landing = read("src/components/LandingPage.tsx");
    for (const notACard of [
      "Email sign-in with OTP",
      "Forgot your password?",
      "Google Authenticator",
      "two-factor authentication",
      "Account security",
    ]) {
      assert.ok(!landing.includes(notACard), `landing page must not sell auth as a card: "${notACard}"`);
    }
  });
});
