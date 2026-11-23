import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

// Inline pure helpers mirroring src/lib/lessons.ts for zero-build
// node --test verification (row -> Lesson mapping, slug validation,
// and the seed-fallback decision copied verbatim).
// NOTE: video URLs here are real-shaped placeholders — mapping logic
// validates the URL against the provider's pattern (MEGA share link
// for mega, bare Drive file ID for drive), so a fake host fails.

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

const MEGA_FILE_URL_RE = /^https:\/\/mega\.nz\/file\/([A-Za-z0-9_-]{8})#([A-Za-z0-9_-]{22,43})$/;
const MEGA_FOLDER_FILE_URL_RE =
  /^https:\/\/mega\.nz\/folder\/([A-Za-z0-9_-]{8})#([A-Za-z0-9_-]{22,43})\/file\/([A-Za-z0-9_-]{8})$/;
const DRIVE_FILE_ID_RE = /^[A-Za-z0-9_-]{10,64}$/;

function isValidMegaFileUrl(url) {
  return MEGA_FILE_URL_RE.test(url) || MEGA_FOLDER_FILE_URL_RE.test(url);
}

function isValidDriveFileId(fileId) {
  return DRIVE_FILE_ID_RE.test(fileId);
}

function isCoursePublished(course) {
  return course?.is_published === true;
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
  // video route 503s it; the row must NOT be dropped. A non-empty URL
  // that fails the provider's pattern is treated as no video.
  const rawVideoUrl = typeof row.video_url === "string" ? row.video_url : "";
  const videoUrl =
    rawVideoUrl === "" ||
    (provider === "mega"
      ? isValidMegaFileUrl(rawVideoUrl)
      : isValidDriveFileId(rawVideoUrl))
      ? rawVideoUrl
      : "";

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
  return !outcome.configured;
}

const fullRow = {
  slug: "sample-mega-01",
  title: "Sample Lecture",
  duration_seconds: 315,
  notes_markdown: "Some notes.",
  video_provider: "mega",
  video_url: "https://mega.nz/file/AbCdEfGh#0123456789abcdefghijklm",
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
    videoUrl: "https://mega.nz/file/AbCdEfGh#0123456789abcdefghijklm",
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

test("a video URL that fails the provider pattern becomes empty, lesson stays listed", () => {
  // Wrong host / malformed MEGA link: not dropped, just no video.
  const badMega = mapLessonRow({ ...fullRow, video_url: "https://example.invalid/file/abc#key" });
  assert.equal(badMega.id, "sample-mega-01");
  assert.equal(badMega.videoUrl, "");
  const notAUrl = mapLessonRow({ ...fullRow, video_url: "not a url" });
  assert.equal(notAUrl.videoUrl, "");
  // A folder-form MEGA link is valid and passes through.
  const folder = mapLessonRow({
    ...fullRow,
    video_url: "https://mega.nz/folder/AbCdEfGh#0123456789abcdefghijklm/file/XyZ12345",
  });
  assert.equal(folder.videoUrl, "https://mega.nz/folder/AbCdEfGh#0123456789abcdefghijklm/file/XyZ12345");
  // Drive rows carry a bare file ID: a URL or bad characters fail.
  const badDrive = mapLessonRow({
    ...fullRow,
    video_provider: "drive",
    video_url: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view",
  });
  assert.equal(badDrive.id, "sample-mega-01");
  assert.equal(badDrive.videoUrl, "");
  const shortDrive = mapLessonRow({ ...fullRow, video_provider: "drive", video_url: "abc" });
  assert.equal(shortDrive.videoUrl, "");
});

test("published is strict: only is_published === true counts", () => {
  assert.equal(isCoursePublished({ is_published: true }), true);
  assert.equal(isCoursePublished({ is_published: false }), false);
  // A missing flag is UNPUBLISHED — a draft must never leak because
  // the flag was forgotten (the old `!== false` treated this as
  // published).
  assert.equal(isCoursePublished({}), false);
  assert.equal(isCoursePublished({ is_published: undefined }), false);
  assert.equal(isCoursePublished({ is_published: null }), false);
  assert.equal(isCoursePublished({ is_published: "true" }), false);
  assert.equal(isCoursePublished(null), false);
  assert.equal(isCoursePublished(undefined), false);
});

test("the source uses the strict published check and validates video URLs", () => {
  const src = readFileSync(
    new URL("../src/lib/lessons.ts", import.meta.url),
    "utf8"
  );
  assert.ok(src.includes("is_published === true"), "published must be strict");
  assert.ok(!src.includes("published !== false"), "the old fail-open filter must be gone");
  assert.ok(src.includes("isValidMegaFileUrl"), "mega URLs must be validated");
  assert.ok(src.includes("isValidDriveFileId"), "drive IDs must be validated");
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

test("falls back to seed ONLY when Supabase was never configured", () => {
  assert.equal(
    shouldFallBackToSeed({ configured: false, error: false, rowCount: 3 }),
    true
  );
  assert.equal(
    shouldFallBackToSeed({ configured: false, error: true, rowCount: 0 }),
    true
  );
});

test("does NOT fall back to seed on error or empty rows when configured", () => {
  // R2-M17: serving seed on a configured error or on zero usable
  // rows defeats an is_published takedown (unpublish everything
  // and the seed catalog still serves) and resurrects deleted
  // lessons during an outage — those cases return empty instead.
  assert.equal(
    shouldFallBackToSeed({ configured: true, error: true, rowCount: 0 }),
    false
  );
  assert.equal(
    shouldFallBackToSeed({ configured: true, error: false, rowCount: 0 }),
    false
  );
});

test("R2-M17: a configured failure returns empty, not seed, and the route drops source", () => {
  const src = readFileSync(
    new URL("../src/lib/lessons.ts", import.meta.url),
    "utf8"
  );
  // Seed is served from exactly one place (the unconfigured path):
  // the definition plus a single call.
  assert.equal((src.match(/seedResult\(\)/g) || []).length, 2, "seed must be served only when unconfigured");
  assert.ok(src.includes('lessons: [], source: "supabase"'), "a configured failure must return an empty list");
  assert.ok(src.includes("console.error("), "a configured failure must log at error level");
  assert.ok(src.includes("returning an empty list, not seed"), "the failure path must say it returns empty, not seed");
  const route = readFileSync(
    new URL("../src/app/api/lessons/route.ts", import.meta.url),
    "utf8"
  );
  assert.ok(route.includes("status: 503"), "an empty lesson list must answer 503");
  assert.ok(!route.includes("lessons, source"), "the public body must not carry source");
  assert.ok(route.includes("NextResponse.json({ lessons: page, total, limit, offset })"), "the body must carry the page plus total/limit/offset (R3-L13)");
  assert.ok(route.includes("parsePagination"), "lessons must paginate instead of dumping the whole catalog");
});

test("does not fall back when configured and rows are usable", () => {
  assert.equal(
    shouldFallBackToSeed({ configured: true, error: false, rowCount: 3 }),
    false
  );
});
