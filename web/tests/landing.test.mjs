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

  test("the hero sells learning online or off, with real content numbers", () => {
    const landing = read("src/components/LandingPage.tsx");
    assert.ok(landing.includes("Learn Python, online or off."), "hero must lead with online-or-offline learning");
    assert.ok(landing.includes("812 topics"), "pill must show the real topic count");
    assert.ok(landing.includes("259 videos"), "pill must show the real video count");
    assert.ok(landing.includes('{ value: "812", label: "topics" }'), "stats must show 812 topics");
    assert.ok(landing.includes('{ value: "259", label: "videos" }'), "stats must show 259 videos");
    assert.ok(landing.includes('{ value: "6", label: "stages" }'), "stats must keep the 6 roadmap stages");
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
