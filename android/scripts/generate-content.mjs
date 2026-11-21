// Regenerates android/assets/content.json from the web catalog.
// Run from android/: node scripts/generate-content.mjs
// No new dependencies: it compiles the three TS sources with the
// TypeScript compiler already in devDependencies, requires the
// output, and writes plain JSON. Re-run after any web catalog edit.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const webLib = join(root, "..", "web", "src", "lib");
const outDir = join(root, "assets");
const tmp = mkdtempSync(join(tmpdir(), "lp-content-"));

try {
  execFileSync(
    "npx",
    [
      "tsc",
      join(webLib, "catalog.ts"),
      join(webLib, "learn", "index.ts"),
      join(webLib, "learn", "sidebar.ts"),
      join(webLib, "courses", "data.ts"),
      "--ignoreConfig",
      "--outDir", tmp,
      "--module", "commonjs",
      "--target", "es2020",
      "--moduleResolution", "bundler",
      "--esModuleInterop",
      "--skipLibCheck",
    ],
    { cwd: root, stdio: "inherit" }
  );
  const require = createRequire(import.meta.url);
  const catalog = require(join(tmp, "catalog.js"));
  const learn = require(join(tmp, "learn", "index.js"));
  const sidebar = require(join(tmp, "learn", "sidebar.js"));
  const courses = require(join(tmp, "courses", "data.js"));

  // Tutorials in curriculum order (the website sidebar), not
  // alphabetical — a learner starts at Python HOME, not Django.
  const order = new Map(sidebar.ALL_LEARN_TOPICS.map((t, i) => [t.slug, i]));
  const tutorials = [...learn.ALL_TUTORIALS].sort(
    (a, b) => (order.get(a.slug) ?? 9999) - (order.get(b.slug) ?? 9999)
  );
  const videoLessons = catalog.getLessons();
  const creators = courses.COURSE_CREATORS;
  const videos = creators.flatMap((c) => [
    ...c.playlists.flatMap((p) => p.videos),
    ...c.oneShots,
  ]);
  const withMega = videos.filter((v) => v.megaLessonId).length;

  const content = {
    generatedAt: new Date().toISOString(),
    tutorials,
    videoLessons,
    creators,
  };
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "content.json"), JSON.stringify(content));
  console.log(`tutorials: ${tutorials.length}`);
  console.log(`video lessons (catalog): ${videoLessons.length}`);
  console.log(`creators: ${creators.length}`);
  console.log(`videos: ${videos.length} (${withMega} with a MEGA link)`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
