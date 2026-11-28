import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

// Guards for the dynamic SEO routes (read from disk, no build needed)
// so a deleted or half-edited file fails `npm test` before it ships.
// robots/sitemap are app/robots.ts + app/sitemap.ts now — the old
// static public/robots.txt + public/sitemap.xml pointed at a dead Fly
// host and must stay deleted, or crawlers get two conflicting answers.

const SITE = "https://learnpythonprogram.vercel.app";

const robots = readFileSync(new URL("../src/app/robots.ts", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const learnLayout = readFileSync(
  new URL("../src/app/learn/[slug]/layout.tsx", import.meta.url),
  "utf8",
);
const site = readFileSync(new URL("../src/lib/site.ts", import.meta.url), "utf8");
const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");

test("no stale static robots.txt / sitemap.xml in public/", () => {
  assert.equal(existsSync(new URL("../public/robots.txt", import.meta.url)), false);
  assert.equal(existsSync(new URL("../public/sitemap.xml", import.meta.url)), false);
});

test("site origin is the live Vercel domain, never a Fly host", () => {
  assert.ok(site.includes(`SITE_URL = "${SITE}"`));
  assert.ok(!site.includes("fly.dev"));
  assert.ok(!robots.includes("fly.dev"));
  assert.ok(!sitemap.includes("fly.dev"));
  assert.ok(!layout.includes("fly.dev"));
});

test("robots.ts allows all crawlers, blocks internal routes, points at the sitemap", () => {
  assert.match(robots, /userAgent: "\*"/);
  assert.match(robots, /allow: "\/"/);
  for (const blocked of ["/api/", "/_next/", "/auth/", "/courses"]) {
    assert.ok(robots.includes(`"${blocked}"`), `robots must disallow ${blocked}`);
  }
  assert.ok(robots.includes("`${SITE_URL}/sitemap.xml`"));
});

test("sitemap.ts enumerates every lesson; gated course pages stay out", () => {
  assert.ok(sitemap.includes("ALL_LEARN_TOPICS"), "sitemap must list every learn topic");
  assert.ok(sitemap.includes("/learn/${t.slug}"), "lesson URLs must be /learn/[slug]");
  assert.ok(sitemap.includes("priority: 1.0"), "homepage must be priority 1.0");
  // /courses is sign-in gated: Googlebot cannot reach it, so no
  // course URL may be listed (the hub stays as a static route only).
  assert.ok(!sitemap.includes("COURSE_CREATORS"), "sitemap must not list course creators");
  assert.ok(!sitemap.includes("playlistListId"), "sitemap must not list playlists");
  assert.ok(!sitemap.includes("/courses/${"), "sitemap must not list course sub-pages");
});

test("root layout carries the canonical home title + metadataBase", () => {
  assert.ok(layout.includes('metadataBase: new URL(SITE_URL)'));
  assert.ok(layout.includes("LP — Learn & Practice Python Offline | Interactive Python Course"));
  assert.ok(layout.includes('alternates: { canonical: "/" }'));
  assert.ok(layout.includes("application/ld+json"), "home JSON-LD must be present");
  assert.ok(!layout.includes("CodeWithHarry"), "landing metadata must not name a creator");
  assert.ok(!layout.includes("100 days"), "landing metadata must not mention 100 days");
});

test("lesson layout has per-lesson metadata + TechArticle JSON-LD", () => {
  assert.ok(learnLayout.includes("generateMetadata"));
  assert.ok(learnLayout.includes("Interactive Lesson & Offline Practice | LP"));
  assert.ok(learnLayout.includes('canonical: `/learn/${slug}`'));
  assert.ok(learnLayout.includes('"@type": "TechArticle"'));
  assert.ok(learnLayout.includes('programmingLanguage: "Python"'));
  assert.ok(learnLayout.includes("isAccessibleForFree: true"));
  assert.ok(learnLayout.includes('"@type": "BreadcrumbList"'));
});

test("llms.txt indexes every lesson", () => {
  assert.ok(llms.startsWith("# Learn Python (LP)"));
  assert.ok(llms.includes("offline"));
  const links = [...llms.matchAll(/\(<https:\/\/learnpythonprogram\.vercel\.app\/learn\/([^>]+)>\)/g)];
  assert.equal(links.length, 812, `expected 812 lesson links, got ${links.length}`);
  assert.equal(new Set(links.map((m) => m[1])).size, 812, "lesson links must be unique");
});
