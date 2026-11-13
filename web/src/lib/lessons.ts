// Server-only Supabase-backed lesson catalog.
// Lessons live in Supabase (courses -> modules -> lessons); the hardcoded
// SEED_LESSONS from catalog.ts are the fallback when Supabase is not
// configured, unreachable, or returns no usable rows. Nothing here is
// imported by client code — the browser reads /api/lessons instead.

import { createClient } from "@supabase/supabase-js";
import { getLessons, type Lesson, type QuizQuestion } from "./catalog";

export type LessonSource = "supabase" | "seed";

export interface FetchLessonsResult {
  lessons: Lesson[];
  source: LessonSource;
}

const CACHE_TTL_MS = 60_000;

let cached: { result: FetchLessonsResult; fetchedAt: number } | null = null;

/** True when both Supabase env vars are present (values never logged). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Lesson ids are the Supabase slugs: 1-64 chars, alphanumerics plus - _. */
export function isValidLessonSlug(slug: unknown): slug is string {
  return typeof slug === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(slug);
}

// Raw Supabase row shape for the lessons query below (embedded module ->
// course join). Fields may be missing/null when a join finds nothing.
export interface LessonRow {
  slug?: unknown;
  title?: unknown;
  duration_seconds?: unknown;
  notes_markdown?: unknown;
  video_provider?: unknown;
  video_url?: unknown;
  quiz?: unknown;
  order_index?: unknown;
  modules?: { title?: unknown; courses?: { title?: unknown } | null } | null;
}

/**
 * Validate a quiz value from the DB (jsonb). Returns the questions when the
 * shape is exactly {question, options[], answer} per item, else undefined
 * (a lesson without a valid quiz simply has no test).
 */
export function parseQuiz(value: unknown): QuizQuestion[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const questions: QuizQuestion[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return undefined;
    const q = item as Record<string, unknown>;
    if (typeof q.question !== "string" || !q.question) return undefined;
    if (
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      !q.options.every((o) => typeof o === "string" && o)
    ) {
      return undefined;
    }
    if (
      typeof q.answer !== "number" ||
      !Number.isInteger(q.answer) ||
      q.answer < 0 ||
      q.answer >= q.options.length
    ) {
      return undefined;
    }
    questions.push({
      question: q.question,
      options: q.options as string[],
      answer: q.answer,
    });
  }
  return questions;
}

/**
 * Map one Supabase row to the app Lesson shape. Returns null for rows that
 * cannot be used (bad/missing slug, unknown provider). An empty video URL
 * is allowed — the lesson is "coming soon" and the video route 503s it.
 * Missing module/course titles fall back to generic labels instead of
 * dropping the lesson.
 */
export function mapLessonRow(row: LessonRow): Lesson | null {
  if (!isValidLessonSlug(row.slug)) return null;

  const provider = row.video_provider === "drive" ? "drive" : row.video_provider === "mega" ? "mega" : null;
  if (!provider) return null;

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
    durationSeconds: Number.isFinite(duration) && duration >= 0 ? Math.floor(duration) : 0,
    videoUrl,
    videoSource: provider,
    notes: typeof row.notes_markdown === "string" ? row.notes_markdown : "",
    ...(quiz ? { quiz } : {}),
  };
}

/** Decide whether to fall back to the seed catalog for a fetch outcome. */
export function shouldFallBackToSeed(outcome: {
  configured: boolean;
  error: boolean;
  rowCount: number;
}): boolean {
  return !outcome.configured || outcome.error || outcome.rowCount === 0;
}

function seedResult(): FetchLessonsResult {
  return { lessons: getLessons(), source: "seed" };
}

/**
 * Fetch published lessons from Supabase (one query, modules + courses
 * joined so titles come along). Result is cached in memory for 60s.
 * On ANY failure — env missing, network error, query error, zero usable
 * rows — logs one warning and returns the seed catalog instead.
 */
export async function fetchLessons(): Promise<FetchLessonsResult> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.result;
  }

  if (!isSupabaseConfigured()) {
    console.warn(
      "[lessons] Supabase env vars missing — falling back to seed lessons"
    );
    const result = seedResult();
    cached = { result, fetchedAt: Date.now() };
    return result;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );

    const { data, error } = await supabase
      .from("lessons")
      .select(
        "slug, title, duration_seconds, notes_markdown, video_provider, video_url, quiz, order_index, modules ( title, courses ( title, is_published ) )"
      )
      .order("order_index", { ascending: true });

    if (error) throw new Error(`Supabase lessons query failed: ${error.message}`);

    const rows = (data ?? []) as unknown as LessonRow[];
    // Published-only filter applied here (not in the query) so a missing
    // is_published flag never hides a lesson by accident: rows without an
    // explicit false are treated as published.
    const lessons = rows
      .filter((row) => {
        const published = (row.modules as { courses?: { is_published?: unknown } | null } | null)
          ?.courses?.is_published;
        return published !== false;
      })
      .map(mapLessonRow)
      .filter((lesson): lesson is Lesson => lesson !== null);

    if (lessons.length === 0) {
      console.warn(
        "[lessons] Supabase returned no usable lessons — falling back to seed lessons"
      );
      const result = seedResult();
      cached = { result, fetchedAt: Date.now() };
      return result;
    }

    const result: FetchLessonsResult = { lessons, source: "supabase" };
    cached = { result, fetchedAt: Date.now() };
    return result;
  } catch (err) {
    console.warn(
      "[lessons] Supabase fetch failed — falling back to seed lessons:",
      err instanceof Error ? err.message : String(err)
    );
    const result = seedResult();
    cached = { result, fetchedAt: Date.now() };
    return result;
  }
}

export async function fetchLessonById(id: string): Promise<Lesson | null> {
  const { lessons } = await fetchLessons();
  return lessons.find((lesson) => lesson.id === id) ?? null;
}

/** Test helper: clear the in-memory cache. */
export function resetLessonsCache(): void {
  cached = null;
}
