import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Static-file guards for the SEO files in web/public: robots.txt must
// point crawlers at the sitemap, and sitemap.xml must list every
// top-level route. These are read from disk (no build needed) so a
// deleted or half-edited file fails `npm test` before it ships.

const SITE = "https://learn-python-programming.fly.dev";
const ROUTES = ["/", "/editor", "/modules", "/github"];

const robots = readFileSync(new URL("../public/robots.txt", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");

test("robots.txt allows all crawlers and points at the sitemap", () => {
  assert.match(robots, /^User-agent: \*/m);
  assert.match(robots, /^Allow: \//m);
  assert.ok(robots.includes(`Sitemap: ${SITE}/sitemap.xml`));
});

test("sitemap.xml lists every top-level route", () => {
  assert.ok(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(sitemap.includes("<urlset"));
  for (const route of ROUTES) {
    assert.ok(
      sitemap.includes(`<loc>${SITE}${route}</loc>`),
      `sitemap is missing ${SITE}${route}`
    );
  }
  // Every listed URL belongs to this site — no stray or relative locs.
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  assert.equal(locs.length, ROUTES.length);
  for (const loc of locs) {
    assert.ok(loc.startsWith(`${SITE}/`));
  }
});
