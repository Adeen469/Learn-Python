// Static checks over the Learn content (topic tutorials + reference
// entries). Mirrors the old tutorials-content suite, but for the
// W3Schools-style topic structure: every sidebar topic must have
// exactly one content entry, and every entry must be complete.
// Fully static (reads the .ts files as text) — no TS import needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const learnDir = join(webDir, "src/lib/learn");

const TUTORIAL_FILES = [
  "learn-basics.ts",
  "learn-functions-advanced.ts",
  "learn-classes.ts",
  "learn-file-modules.ts",
  "learn-matplotlib.ts",
  "learn-ml.ts",
  "learn-dsa.ts",
  "learn-databases.ts",
];
const REFERENCE_FILES = [
  "ref-builtins.ts",
  "ref-string-methods.ts",
  "ref-collection-methods.ts",
  "ref-file-keywords.ts",
  "ref-modules.ts",
];

function read(name) {
  return readFileSync(join(learnDir, name), "utf8");
}

/** Slugs declared in a file, in order. */
function slugsIn(text) {
  return [...text.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

/** Split a content file into one chunk per entry (each starts at `slug:`). */
function entriesIn(text) {
  const parts = text.split(/(?=slug:\s*")/);
  return parts.filter((p) => /slug:\s*"/.test(p));
}

test("all Learn content files exist", () => {
  for (const f of [...TUTORIAL_FILES, ...REFERENCE_FILES, "sidebar.ts", "types.ts", "index.ts"]) {
    assert.ok(existsSync(join(learnDir, f)), `missing ${f}`);
  }
});

test("every sidebar topic has exactly one content entry", () => {
  const sidebarSlugs = slugsIn(read("sidebar.ts"));
  assert.equal(new Set(sidebarSlugs).size, 812, "sidebar must list 812 unique topics");
  const tutorialSlugs = TUTORIAL_FILES.flatMap((f) => slugsIn(read(f)));
  const referenceSlugs = REFERENCE_FILES.flatMap((f) => slugsIn(read(f)));
  assert.equal(tutorialSlugs.length, 268, `expected 268 tutorials, got ${tutorialSlugs.length}`);
  assert.equal(referenceSlugs.length, 544, `expected 544 references, got ${referenceSlugs.length}`);
  assert.equal(new Set(tutorialSlugs).size, 268, "duplicate tutorial slug");
  assert.equal(new Set(referenceSlugs).size, 544, "duplicate reference slug");
  const inSidebar = new Set(sidebarSlugs);
  for (const s of [...tutorialSlugs, ...referenceSlugs]) {
    assert.ok(inSidebar.has(s), `content slug not in sidebar: ${s}`);
  }
  const overlap = tutorialSlugs.filter((s) => new Set(referenceSlugs).has(s));
  assert.deepEqual(overlap, [], `slugs in both: ${overlap.join(", ")}`);
  const covered = new Set([...tutorialSlugs, ...referenceSlugs]);
  const missing = sidebarSlugs.filter((s) => !covered.has(s));
  assert.deepEqual(missing, [], `topics without content: ${missing.slice(0, 10).join(", ")}`);
});

test("every tutorial is complete", () => {
  for (const f of TUTORIAL_FILES) {
    for (const entry of entriesIn(read(f))) {
      const slug = entry.match(/slug:\s*"([^"]+)"/)[1];
      assert.ok(/intro:\s*"/.test(entry), `${slug}: no intro`);
      const codeBlocks = (entry.match(/type:\s*"code"/g) || []).length;
      const outputs = (entry.match(/output:\s*["`]/g) || []).length;
      assert.ok(codeBlocks >= 2, `${slug}: only ${codeBlocks} code blocks`);
      assert.ok(outputs >= codeBlocks, `${slug}: ${codeBlocks} code blocks but ${outputs} outputs`);
      assert.ok(/practice:\s*\[/.test(entry), `${slug}: no practice`);
      assert.ok(/summary:\s*\[/.test(entry), `${slug}: no summary`);
      assert.ok(!/type:\s*"code"[^}]*output:\s*undefined/.test(entry), `${slug}: undefined output`);
    }
  }
});

test("every reference entry is complete", () => {
  for (const f of REFERENCE_FILES) {
    for (const entry of entriesIn(read(f))) {
      const slug = entry.match(/slug:\s*"([^"]+)"/)[1];
      assert.ok(/description:\s*"/.test(entry), `${slug}: no description`);
      assert.ok(/exampleCode:\s*`/.test(entry), `${slug}: no example code`);
    }
  }
});

test("no placeholders in Learn content", () => {
  for (const f of [...TUTORIAL_FILES, ...REFERENCE_FILES]) {
    const text = read(f);
    assert.ok(!/\bTODO\b/.test(text), `${f}: contains TODO`);
    assert.ok(!/coming soon/i.test(text), `${f}: contains 'coming soon'`);
    assert.ok(!/lorem ipsum/i.test(text), `${f}: contains lorem ipsum`);
  }
});
