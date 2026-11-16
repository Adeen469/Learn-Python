// Static checks over the written tutorial content files
// (web/src/lib/tutorials/stage-*.ts). The files are TypeScript, so
// these tests read them as text instead of importing them — the
// production build type-checks them, and these checks cover the
// things types cannot: every day 1-100 present exactly once, every
// lesson complete, every code example carrying its exact output.

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "lib",
  "tutorials"
);

const stageFiles = readdirSync(dir)
  .filter((f) => /^stage-.*\.ts$/.test(f))
  .sort();

test("six stage files exist", () => {
  assert.deepEqual(stageFiles, [
    "stage-advanced.ts",
    "stage-basics.ts",
    "stage-data.ts",
    "stage-functions.ts",
    "stage-intermediate.ts",
    "stage-oop.ts",
  ]);
});

function readStage(file) {
  return readFileSync(join(dir, file), "utf8");
}

test("days 1-100 are covered exactly once", () => {
  const days = [];
  for (const file of stageFiles) {
    const text = readStage(file);
    assert.match(text, /export const TUTORIALS: LessonTutorial\[\]/);
    for (const m of text.matchAll(/^\s*day: (\d+),$/gm)) {
      days.push(Number(m[1]));
    }
  }
  days.sort((a, b) => a - b);
  assert.equal(days.length, 100);
  assert.deepEqual(days, Array.from({ length: 100 }, (_, i) => i + 1));
});

test("every lesson has intro, blocks, practice and summary", () => {
  for (const file of stageFiles) {
    const text = readStage(file);
    // Fields may wrap onto the next line, so match the key only.
    const intros = (text.match(/^\s*intro:/gm) || []).length;
    const practices = (text.match(/^\s*practice:/gm) || []).length;
    const summaries = (text.match(/^\s*summary:/gm) || []).length;
    const days = (text.match(/^\s*day: \d+,$/gm) || []).length;
    assert.equal(intros, days, `${file}: every lesson needs an intro`);
    assert.equal(practices, days, `${file}: every lesson needs practice`);
    assert.equal(summaries, days, `${file}: every lesson needs a summary`);
    assert.ok(days > 0, `${file} must not be empty`);
  }
});

test("every code example carries its output and no placeholders", () => {
  for (const file of stageFiles) {
    const text = readStage(file);
    // Placeholders only: a literal "todo list" lesson or the
    // jsonplaceholder.typicode.com/todos URL are real content, so
    // only the uppercase TODO marker counts as a placeholder.
    assert.doesNotMatch(text, /coming soon|lorem ipsum|\bTODO\b/);
    const codeBlocks = (text.match(/type: "code"/g) || []).length;
    // `output:` may sit mid-line (inline code blocks), so do not
    // anchor it to the line start.
    const outputs = (text.match(/output:\s*[`"]/g) || []).length;
    assert.ok(codeBlocks >= 2, `${file} needs code examples`);
    assert.equal(
      outputs,
      codeBlocks,
      `${file}: every code example needs its exact output`
    );
  }
});
