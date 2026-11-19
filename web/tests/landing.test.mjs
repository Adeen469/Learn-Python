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
    const en = read("src/lib/i18n/en.ts");
    // The hero strings moved to i18n (en.ts landing.*); the component
    // must render those keys, and the English values must say what
    // the user actually sees.
    assert.ok(landing.includes("t.landing.heroTitle"), "hero must render the hero title key");
    assert.ok(en.includes('heroTitle: "Learn Python programming,"'), "hero must lead with Learn Python programming");
    assert.ok(landing.includes("<TextType"), "the headline must render TextType");
    assert.ok(landing.includes("text={[t.landing.heroWordOnline, t.landing.heroWordOffline]}"), "the typed words must be online then offline");
    assert.ok(en.includes('heroWordOnline: "online"'), "the first typed word must be online");
    assert.ok(en.includes('heroWordOffline: "offline"'), "the second typed word must be offline");
    assert.ok(landing.includes('as="span"'), "the typed word must flow inline on the same line");
    assert.ok(landing.includes("mt-5 max-w-4xl text-3xl"), "the headline must be wide enough for one line on desktop and wrap cleanly on mobile");
    assert.ok(!landing.includes("RotatingText"), "the old rotating word must be gone");
    assert.ok(!landing.includes("online or off"), "the headline must say offline, not off");
    assert.ok(landing.includes('{ value: "812", label: t.landing.statTopics }'), "stats must show 812 topics");
    assert.ok(landing.includes('{ value: "268", label: t.landing.statVideos }'), "stats must show 268 videos");
    assert.ok(landing.includes('{ value: "6", label: t.landing.statStages }'), "stats must keep the 6 roadmap stages");
    assert.ok(en.includes('statTopics: "topics"'), "the topics stat label must read topics");
    assert.ok(en.includes('statVideos: "videos"'), "the videos stat label must read videos");
    assert.ok(en.includes('statStages: "stages"'), "the stages stat label must read stages");
  });

  test("no pill above the hero and no wordmark text beside the logo", () => {
    const landing = read("src/components/LandingPage.tsx");
    assert.ok(!landing.includes("812 topics • 268 videos • Code editor"), "the stats pill must be gone");
    assert.ok(!landing.includes("rounded-full border border-neutral-800"), "no pill styling may remain");
    assert.ok(!landing.includes('LP <span className="text-xs font-normal text-neutral-500">Learn Python</span>'), "the header wordmark text must be gone");
  });

  test("login/register has a clear entry — Get started and Sign in both go to /auth/email", () => {
    const landing = read("src/components/LandingPage.tsx");
    const en = read("src/lib/i18n/en.ts");
    assert.ok(landing.includes("t.landing.getStarted"), "hero must render the Get started key");
    assert.ok(en.includes('getStarted: "Get started"'), "hero must have a Get started button");
    assert.ok(landing.includes('href="/auth/email"'), "the buttons must link to the login/register page");
    assert.ok(!landing.includes('href="/api/auth/google"'), "the landing page must not link straight to Google — the login page offers both");
  });

  test("the feature cards cover offline videos, offline tutorials, AI and GitHub", () => {
    const landing = read("src/components/LandingPage.tsx");
    const en = read("src/lib/i18n/en.ts");
    // Card titles moved to i18n; the component must render the keys
    // and the English values must say what the user actually sees.
    assert.ok(landing.includes("t.landing.featureVideosTitle"), "the videos card must render its title key");
    assert.ok(en.includes('featureVideosTitle: "Videos, online & offline"'), "videos must be sold as online + offline");
    assert.ok(landing.includes("t.landing.featureTutorialsTitle"), "the tutorials card must render its title key");
    assert.ok(en.includes('featureTutorialsTitle: "Tutorials, offline too"'), "tutorials must be sold as offline too");
    assert.ok(landing.includes("t.lesson.askTutor"), "the AI tutor must be on the page");
    assert.ok(en.includes('askTutor: "Ask AI Tutor"'), "the AI tutor card must be titled Ask AI Tutor");
    assert.ok(landing.includes("t.landing.featureGithubTitle"), "the GitHub card must render its title key");
    assert.ok(en.includes('featureGithubTitle: "GitHub, built in"'), "GitHub integration must be on the page");
    assert.ok(landing.includes("t.editor.title"), "the code editor card must render its title key");
    assert.ok(en.includes('title: "Code Editor"'), "the code editor must stay on the page");
    assert.ok(landing.includes("t.landing.featureGoalsTitle"), "the goals card must render its title key");
    assert.ok(en.includes('featureGoalsTitle: "Daily goals & streaks"'), "streaks must stay on the page");
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

describe("landing page — Get Started uses SpecularButton", () => {
  test("the hero Get Started button is a SpecularButton with the specified props", () => {
    const landing = read("src/components/LandingPage.tsx");
    assert.ok(landing.includes('import SpecularButton from "@/components/SpecularButton";'), "LandingPage must import SpecularButton");
    assert.ok(landing.includes("<SpecularButton"), "the Get Started button must be a SpecularButton");
    assert.ok(!landing.includes("<StarBorder"), "StarBorder must no longer be the Get Started button");
    for (const prop of [
      'size="lg"',
      "radius={18}",
      'tint="#ffffff"',
      "tintOpacity={0}",
      'textColor="#f5f5f5"',
      'lineColor="#ffffff"',
      'baseColor="#000000"',
      "intensity={0.55}",
      "idleIntensity={0}",
      "shineSize={0}",
      "shineFade={79}",
      "thickness={0.5}",
      "glow={1}",
      "followMouse",
      "proximity={250}",
    ]) {
      assert.ok(landing.includes(prop), `SpecularButton must carry ${prop}`);
    }
    assert.ok(
      landing.includes('onClick={() => router.push("/auth/email")}'),
      "Get Started must still navigate to /auth/email on click"
    );
    assert.ok(landing.includes("{t.landing.getStarted}"), "the label must stay the i18n Get Started string");
  });
});

describe("Logic Builder — Coming Soon page", () => {
  test("the /logic-builder page exists, is a Coming Soon placeholder, and the navbar links it between Courses and Code Editor", () => {
    const page = read("src/app/logic-builder/page.tsx");
    assert.ok(page.includes("AppNavbar"), "the Logic Builder page must render the app navbar");
    assert.ok(page.includes('router.replace("/")'), "guests must be redirected to the landing page");
    assert.ok(page.includes("t.logicBuilder.comingSoon"), "the page must show the Coming Soon heading");
    assert.ok(page.includes("t.logicBuilder.notifyText"), "the page must show the email-notify sentence");
    assert.ok(page.includes("Blocks"), "the page must use the Blocks icon");
    const navbar = read("src/components/AppNavbar.tsx");
    assert.ok(navbar.includes('href: "/logic-builder"'), "the navbar must link to /logic-builder");
    assert.ok(navbar.includes("t.tabs.logicBuilder"), "the navbar label must come from i18n");
    const coursesIdx = navbar.indexOf('href: "/courses"');
    const logicIdx = navbar.indexOf('href: "/logic-builder"');
    const editorIdx = navbar.indexOf('href: "/editor"');
    assert.ok(coursesIdx > 0 && logicIdx > coursesIdx && editorIdx > logicIdx, "Logic Builder must sit between Courses and Code Editor in the navbar");
    assert.ok(navbar.includes('pathname.startsWith("/logic-builder")'), "the navbar must highlight Logic Builder as active on its page");
    // i18n: the keys must exist in the type and all 11 languages.
    const index = read("src/lib/i18n/index.tsx");
    assert.ok(index.includes("logicBuilder: string;"), "the Strings type must have tabs.logicBuilder");
    assert.ok(index.includes("comingSoon: string;"), "the Strings type must have logicBuilder.comingSoon");
    assert.ok(index.includes("notifyText: string;"), "the Strings type must have logicBuilder.notifyText");
    for (const lang of ["en", "hi-roman", "fr", "ja", "ko", "es", "de", "pt", "ru", "ar", "zh"]) {
      const s = read(`src/lib/i18n/${lang}.ts`);
      assert.ok(s.includes('logicBuilder: "Logic Builder"'), `${lang} must have the Logic Builder nav label`);
      assert.ok(s.includes("comingSoon:"), `${lang} must have logicBuilder.comingSoon`);
      assert.ok(s.includes("notifyText:"), `${lang} must have logicBuilder.notifyText`);
    }
    const en = read("src/lib/i18n/en.ts");
    assert.ok(en.includes('comingSoon: "Coming Soon"'), "the English heading must be 'Coming Soon'");
    assert.ok(
      en.includes("we'll let you know by email"),
      "the English sentence must be the improvised mail line, not the raw 'we will mail you'"
    );
  });
});
