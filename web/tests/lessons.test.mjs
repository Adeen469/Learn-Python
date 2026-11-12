import assert from "node:assert/strict";
import test from "node:test";

// Inline pure helpers mirroring src/lib/lessons.ts for zero-build
// node --test verification (row -> Lesson mapping, slug validation,
// and the seed-fallback decision copied verbatim).
// NOTE: video URLs here are fake placeholders — mapping logic does not
// validate the URL pattern, so no real share links are needed.

function isValidLessonSlug(slug) {
  return typeof slug === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(slug);
}

function parseQuiz(value) {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const questions = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return undefined;
    if (typeof item.question !== "string" || !item.question) return undefined;
    if (
      !Array.isArray(item.options) ||
      item.options.length < 2 ||
      !item.options.every((o) => typeof o === "string" && o)
    ) {
      return undefined;
    }
    if (
      typeof item.answer !== "number" ||
      !Number.isInteger(item.answer) ||
      item.answer < 0 ||
      item.answer >= item.options.length
    ) {
      return undefined;
    }
    questions.push({
      question: item.question,
      options: item.options,
      answer: item.answer,
    });
  }
  return questions;
}

function mapLessonRow(row) {
  if (!isValidLessonSlug(row.slug)) return null;

  const provider =
    row.video_provider === "drive"
      ? "drive"
      : row.video_provider === "mega"
        ? "mega"
        : null;
  if (!provider) return null;

  // Empty video URL is allowed — the lesson is "coming soon" and the
  // video route 503s it; the row must NOT be dropped.
  const videoUrl = typeof row.video_url === "string" ? row.video_url : "";

  const moduleTitle =
    typeof row.modules?.title === "string" && row.modules.title
      ? row.modules.title
      : "Untitled Module";
  const courseTitle =
    typeof row.modules?.courses?.title === "string" && row.modules.courses.title
      ? row.modules.courses.title
      : "Untitled Course";

  const duration = Number(row.duration_seconds);
  const quiz = parseQuiz(row.quiz);
  return {
    id: row.slug,
    title: typeof row.title === "string" && row.title ? row.title : row.slug,
    moduleTitle,
    courseTitle,
    durationSeconds:
      Number.isFinite(duration) && duration >= 0 ? Math.floor(duration) : 0,
    videoUrl,
    videoSource: provider,
    notes: typeof row.notes_markdown === "string" ? row.notes_markdown : "",
    ...(quiz ? { quiz } : {}),
  };
}

function shouldFallBackToSeed(outcome) {
  return !outcome.configured || outcome.error || outcome.rowCount === 0;
}

const fullRow = {
  slug: "sample-mega-01",
  title: "Sample Lecture",
  duration_seconds: 315,
  notes_markdown: "Some notes.",
  video_provider: "mega",
  video_url: "https://example.invalid/file/abc#key",
  order_index: 0,
  modules: {
    title: "Module 1: Getting Started",
    courses: { title: "LP Foundation", is_published: true },
  },
};

test("maps a full Supabase row to a Lesson, id from slug", () => {
  const lesson = mapLessonRow(fullRow);
  assert.deepEqual(lesson, {
    id: "sample-mega-01",
    title: "Sample Lecture",
    moduleTitle: "Module 1: Getting Started",
    courseTitle: "LP Foundation",
    durationSeconds: 315,
    videoUrl: "https://example.invalid/file/abc#key",
    videoSource: "mega",
    notes: "Some notes.",
  });
});

test("maps a drive row to videoSource drive", () => {
  const lesson = mapLessonRow({
    ...fullRow,
    slug: "drive-test-01",
    video_provider: "drive",
    video_url: "drive-file-id-0123456789",
  });
  assert.equal(lesson.videoSource, "drive");
  assert.equal(lesson.videoUrl, "drive-file-id-0123456789");
});

test("missing module falls back to Untitled Module", () => {
  const lesson = mapLessonRow({ ...fullRow, modules: null });
  assert.equal(lesson.moduleTitle, "Untitled Module");
  assert.equal(lesson.courseTitle, "Untitled Course");
});

test("missing course falls back to Untitled Course, keeps module title", () => {
  const lesson = mapLessonRow({
    ...fullRow,
    modules: { title: "Module 2: Getting Started", courses: null },
  });
  assert.equal(lesson.moduleTitle, "Module 2: Getting Started");
  assert.equal(lesson.courseTitle, "Untitled Course");
});

test("missing title falls back to the slug", () => {
  const lesson = mapLessonRow({ ...fullRow, title: null });
  assert.equal(lesson.title, "sample-mega-01");
});

test("rejects rows with a missing, invalid, or too-long slug", () => {
  assert.equal(mapLessonRow({ ...fullRow, slug: undefined }), null);
  assert.equal(mapLessonRow({ ...fullRow, slug: "" }), null);
  assert.equal(mapLessonRow({ ...fullRow, slug: "bad slug!" }), null);
  assert.equal(mapLessonRow({ ...fullRow, slug: "x".repeat(65) }), null);
  assert.equal(mapLessonRow({ ...fullRow, slug: "ok-slug_01" }).id, "ok-slug_01");
});

test("rejects unknown providers but keeps rows with an empty video URL", () => {
  assert.equal(mapLessonRow({ ...fullRow, video_provider: "youtube" }), null);
  assert.equal(mapLessonRow({ ...fullRow, video_provider: null }), null);
  // Empty URL = "coming soon" lesson, still listed; the video route 503s it.
  const comingSoon = mapLessonRow({ ...fullRow, video_url: "" });
  assert.equal(comingSoon.videoUrl, "");
  assert.equal(comingSoon.id, "sample-mega-01");
  assert.equal(mapLessonRow({ ...fullRow, video_url: undefined }).videoUrl, "");
});

test("passes a valid quiz through and drops invalid ones", () => {
  const quiz = [
    { question: "Q1?", options: ["a", "b"], answer: 1 },
    { question: "Q2?", options: ["x", "y", "z"], answer: 0 },
  ];
  assert.deepEqual(mapLessonRow({ ...fullRow, quiz }).quiz, quiz);
  assert.equal(mapLessonRow({ ...fullRow, quiz: null }).quiz, undefined);
  assert.equal(mapLessonRow({ ...fullRow, quiz: "not-an-array" }).quiz, undefined);
  assert.equal(
    mapLessonRow({
      ...fullRow,
      quiz: [{ question: "Q?", options: ["a", "b"], answer: 5 }],
    }).quiz,
    undefined
  );
  assert.equal(
    mapLessonRow({
      ...fullRow,
      quiz: [{ question: "Q?", options: ["only-one"], answer: 0 }],
    }).quiz,
    undefined
  );
});

test("bad durations become 0 instead of NaN/negative", () => {
  assert.equal(mapLessonRow({ ...fullRow, duration_seconds: -5 }).durationSeconds, 0);
  assert.equal(mapLessonRow({ ...fullRow, duration_seconds: "abc" }).durationSeconds, 0);
  assert.equal(mapLessonRow({ ...fullRow, duration_seconds: 93.7 }).durationSeconds, 93);
});

test("falls back to seed when env is missing, on error, or on empty result", () => {
  assert.equal(
    shouldFallBackToSeed({ configured: false, error: false, rowCount: 3 }),
    true
  );
  assert.equal(
    shouldFallBackToSeed({ configured: true, error: true, rowCount: 0 }),
    true
  );
  assert.equal(
    shouldFallBackToSeed({ configured: true, error: false, rowCount: 0 }),
    true
  );
});

test("does not fall back when configured and rows are usable", () => {
  assert.equal(
    shouldFallBackToSeed({ configured: true, error: false, rowCount: 3 }),
    false
  );
});
