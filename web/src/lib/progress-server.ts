// Server-only per-user progress store (Supabase).
// The app has NO Supabase Auth — users sign in with Google via the app's
// own HMAC session, so progress rows are keyed by the verified session
// email (lowercased), never by auth.users(id). The user_progress table
// from 001_initial_schema.sql references auth.users and is NOT used.
//
// Access uses the SERVICE-ROLE key through getSupabaseAdmin(): the tables
// have RLS ON with ZERO policies (migration 014), so the public anon key
// can read/write NOTHING — only the service role (which bypasses RLS)
// reaches them, through the session-gated /api/progress route. If the
// key is missing, the route answers 503 before ever calling here, and
// the app keeps working on localStorage-only.
//
// Nothing in this file is imported by client code.

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  clampRanges,
  coverageFraction,
  dailySeconds,
  mergeCompletedIds,
  mergeDailyProgress,
  mergeLessonProgress,
  mergeRanges,
  qualifiesForCredit,
  rangeWatchedSeconds,
  type CreditedLessonWire,
  type DailyProgressWire,
  type LessonProgressWire,
  type ServerProgressSnapshot,
} from "./progress.ts";

// Same one-line rule as isValidLessonSlug in ./lessons — inlined here
// so this server module does not drag the whole lessons module (and
// its Supabase/catalog imports) into the node --test import graph.
function isValidLessonSlug(slug: unknown): slug is string {
  return typeof slug === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(slug);
}

export interface KnownLesson {
  id: string;
  durationSeconds: number;
}

const MAX_LESSON_ENTRIES = 500;
const MAX_CREDITED_ENTRIES = 200;
const MAX_ACTIVE_DATES = 365;
const MAX_COMPLETED_IDS = 1000;
/** Clamp for a lesson with no known duration (a bare YouTube id). */
const UNKNOWN_DURATION_CAP = 86400;

function isValidDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Server-local today (UTC). Client dates may be up to ~6h ahead (IST). */
function serverTodayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function dateWithin(value: string, daysBack: number, daysForward: number): boolean {
  const today = serverTodayKey();
  const [ty, tm, td] = today.split("-").map(Number);
  const base = Date.UTC(ty, tm - 1, td);
  const [y, m, d] = value.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d);
  const diffDays = Math.round((t - base) / 86_400_000);
  return diffDays >= -daysBack && diffDays <= daysForward;
}

function parseStoredRanges(value: unknown): [number, number][] {
  if (!Array.isArray(value)) return [];
  return clampRanges(value, 1_000_000);
}

function parseStoredCredited(value: unknown): CreditedLessonWire[] {
  if (!Array.isArray(value)) return [];
  const out: CreditedLessonWire[] = [];
  for (const item of value.slice(0, MAX_CREDITED_ENTRIES)) {
    if (typeof item !== "object" || item === null) continue;
    const c = item as Record<string, unknown>;
    if (typeof c.lessonId !== "string" || !isValidLessonSlug(c.lessonId)) continue;
    if (typeof c.seconds !== "number" || !Number.isFinite(c.seconds) || c.seconds < 0) continue;
    out.push({ lessonId: c.lessonId, seconds: Math.floor(c.seconds) });
  }
  return out;
}

export interface ValidatedProgressPayload {
  lessons: LessonProgressWire[];
  daily: DailyProgressWire | null;
  activeDates: string[];
  /** Manually completed text lessons (lp_learn_completed). */
  completedIds: string[];
}

export type ValidateProgressResult =
  | { ok: true; payload: ValidatedProgressPayload }
  | { ok: false; error: string };

/**
 * Strictly validate + sanitize a POST /api/progress body. Lesson ids must
 * be slug-shaped; known lessons (catalog + course videos) get their
 * ranges clamped to the real duration, unknown ones (a bare YouTube id,
 * not in any catalog) to 24h — never trusted blindly, never rejected
 * for not being catalogued. Text-lesson completions must be known
 * learn slugs when the caller passes the set. The daily total is
 * RECOMPUTED from the credited list (the client's `seconds` field is
 * ignored) and each credited entry is capped at its lesson's duration.
 * A malformed shape is a 400; out-of-range values are clamped or
 * dropped, never trusted.
 */
export function validateProgressPayload(
  body: unknown,
  knownLessons: KnownLesson[],
  learnSlugs?: ReadonlySet<string>
): ValidateProgressResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;
  const durations = new Map(knownLessons.map((l) => [l.id, l.durationSeconds]));

  const lessons: LessonProgressWire[] = [];
  if (b.lessons !== undefined) {
    if (!Array.isArray(b.lessons) || b.lessons.length > MAX_LESSON_ENTRIES) {
      return { ok: false, error: `lessons must be an array of at most ${MAX_LESSON_ENTRIES} entries.` };
    }
    for (const entry of b.lessons) {
      if (typeof entry !== "object" || entry === null) {
        return { ok: false, error: "Each lesson entry must be an object." };
      }
      const e = entry as Record<string, unknown>;
      if (typeof e.lessonId !== "string" || !isValidLessonSlug(e.lessonId)) {
        return { ok: false, error: "Each lesson entry needs a valid lessonId." };
      }
      if (typeof e.testPassed !== "boolean") {
        return { ok: false, error: "Each lesson entry needs a boolean testPassed." };
      }
      const duration = durations.get(e.lessonId);
      lessons.push({
        lessonId: e.lessonId,
        ranges: clampRanges(
          e.ranges,
          duration !== undefined ? Math.floor(duration) : UNKNOWN_DURATION_CAP
        ),
        testPassed: e.testPassed,
        completed: e.completed === true,
      });
    }
  }

  let daily: DailyProgressWire | null = null;
  if (b.daily !== undefined && b.daily !== null) {
    if (typeof b.daily !== "object") {
      return { ok: false, error: "daily must be an object or null." };
    }
    const d = b.daily as Record<string, unknown>;
    if (!isValidDateKey(d.date) || !dateWithin(d.date as string, 2, 1)) {
      return { ok: false, error: "daily.date must be a recent valid date." };
    }
    if (
      typeof d.goalMinutes !== "number" ||
      !Number.isInteger(d.goalMinutes) ||
      d.goalMinutes < 1 ||
      d.goalMinutes > 600
    ) {
      return { ok: false, error: "daily.goalMinutes must be an integer between 1 and 600." };
    }
    if (!Array.isArray(d.credited) || d.credited.length > MAX_CREDITED_ENTRIES) {
      return { ok: false, error: "daily.credited must be an array of at most 200 entries." };
    }
    const credited: CreditedLessonWire[] = [];
    for (const item of d.credited) {
      if (typeof item !== "object" || item === null) {
        return { ok: false, error: "Each credited entry must be an object." };
      }
      const c = item as Record<string, unknown>;
      if (typeof c.lessonId !== "string" || !isValidLessonSlug(c.lessonId)) {
        return { ok: false, error: "Each credited entry needs a valid lessonId." };
      }
      if (typeof c.seconds !== "number" || !Number.isFinite(c.seconds) || c.seconds < 0) {
        return { ok: false, error: "Each credited entry needs non-negative seconds." };
      }
      // A lesson can never credit more than its own length.
      const duration = durations.get(c.lessonId);
      credited.push({
        lessonId: c.lessonId,
        seconds: Math.min(
          Math.floor(c.seconds),
          duration !== undefined ? Math.floor(duration) : UNKNOWN_DURATION_CAP
        ),
      });
    }
    daily = { date: d.date as string, goalMinutes: d.goalMinutes, credited };
  }

  const activeDates: string[] = [];
  if (b.activeDates !== undefined) {
    if (!Array.isArray(b.activeDates) || b.activeDates.length > MAX_ACTIVE_DATES) {
      return { ok: false, error: "activeDates must be an array of at most 365 dates." };
    }
    for (const date of b.activeDates) {
      if (!isValidDateKey(date) || !dateWithin(date, 365, 1)) {
        return { ok: false, error: "activeDates must be valid dates within the last year." };
      }
      if (!activeDates.includes(date)) activeDates.push(date);
    }
  }

  const completedIds: string[] = [];
  if (b.completedIds !== undefined) {
    if (!Array.isArray(b.completedIds) || b.completedIds.length > MAX_COMPLETED_IDS) {
      return { ok: false, error: `completedIds must be an array of at most ${MAX_COMPLETED_IDS} entries.` };
    }
    for (const id of b.completedIds) {
      if (typeof id !== "string" || !isValidLessonSlug(id)) {
        return { ok: false, error: "Each completedId must be a valid lesson slug." };
      }
      if (learnSlugs && !learnSlugs.has(id)) {
        return { ok: false, error: "Each completedId must be a known lesson slug." };
      }
      if (!completedIds.includes(id)) completedIds.push(id);
    }
  }

  return {
    ok: true,
    payload: { lessons, daily, activeDates: activeDates.sort(), completedIds: completedIds.sort() },
  };
}

/**
 * Keep only the credited entries whose lesson actually qualified (>=95%
 * watched). A credited lesson that never reached 95% is dropped — the
 * daily total is derived from this list, so this is what stops a forged
 * or stale credit from inflating the goal.
 */
export function filterQualifiedCredited(
  credited: CreditedLessonWire[],
  isCompleted: (lessonId: string) => boolean
): CreditedLessonWire[] {
  return credited.filter((c) => isCompleted(c.lessonId));
}
/**
 * Read the user's server progress. Returns null on ANY failure (not
 * configured, table missing, network/query error) — the caller treats
 * null as "no server progress" and stays local-only. Never throws.
 *
 * A stored row with empty ranges and is_completed=true is a manually
 * completed text lesson, so it comes back as a completedId, not a
 * coverage row.
 */
export async function fetchServerProgress(
  client: SupabaseClient,
  email: string
): Promise<ServerProgressSnapshot | null> {
  try {
    const [lessonRes, dailyRes] = await Promise.all([
      client
        .from("lp_user_progress")
        .select("lesson_id, coverage_ranges, is_completed, test_passed")
        .eq("user_email", email),
      client
        .from("lp_user_daily")
        .select("log_date, seconds, goal_minutes, credited")
        .eq("user_email", email)
        .order("log_date", { ascending: false })
        .limit(MAX_ACTIVE_DATES),
    ]);
    if (lessonRes.error) throw new Error(lessonRes.error.message);
    if (dailyRes.error) throw new Error(dailyRes.error.message);

    const lessons: LessonProgressWire[] = [];
    const completedIds: string[] = [];
    for (const row of (lessonRes.data ?? []) as Record<string, unknown>[]) {
      if (typeof row.lesson_id !== "string" || !isValidLessonSlug(row.lesson_id)) continue;
      const ranges = parseStoredRanges(row.coverage_ranges);
      const completed = row.is_completed === true;
      const testPassed = row.test_passed === true;
      if (ranges.length === 0 && completed && !testPassed) {
        completedIds.push(row.lesson_id);
      } else {
        lessons.push({ lessonId: row.lesson_id, ranges, testPassed, completed });
      }
    }

    const dailyRows: DailyProgressWire[] = [];
    const activeDates: string[] = [];
    for (const row of (dailyRes.data ?? []) as Record<string, unknown>[]) {
      if (!isValidDateKey(row.log_date)) continue;
      activeDates.push(row.log_date);
      if (dailyRows.length >= 3) continue;
      if (
        typeof row.goal_minutes !== "number" ||
        !Number.isInteger(row.goal_minutes) ||
        row.goal_minutes < 1
      ) {
        continue;
      }
      dailyRows.push({
        date: row.log_date,
        goalMinutes: row.goal_minutes,
        credited: parseStoredCredited(row.credited),
      });
    }

    return {
      lessons,
      dailyRows,
      activeDates: activeDates.sort().reverse(),
      completedIds: completedIds.sort(),
    };
  } catch (err) {
    console.warn(
      "[progress] server fetch failed — staying local-only:",
      err instanceof Error ? err.message : String(err)
    );
    return null;
  }
}

/**
 * Save the user's progress, merging with what the server already holds
 * (so two devices saving in turn can never wipe each other's progress).
 * Credited entries are kept only for lessons whose merged coverage is
 * actually >=95% — a credited lesson that never qualified is dropped.
 * The daily goal is last-write-wins (the incoming value is the latest
 * the user set on any device); everything else is a union. Returns
 * false on ANY failure (caller keeps local-only). Never throws.
 */
export async function saveServerProgress(
  client: SupabaseClient,
  email: string,
  payload: ValidatedProgressPayload,
  knownLessons: KnownLesson[]
): Promise<boolean> {
  const durations = new Map(knownLessons.map((l) => [l.id, l.durationSeconds]));
  try {
    // Merge lesson rows with the stored ones (union of coverage).
    const stored = await client
      .from("lp_user_progress")
      .select("lesson_id, coverage_ranges, is_completed, test_passed")
      .eq("user_email", email);
    if (stored.error) throw new Error(stored.error.message);
    const storedById = new Map<
      string,
      { ranges: [number, number][]; testPassed: boolean; completed: boolean }
    >();
    for (const row of (stored.data ?? []) as Record<string, unknown>[]) {
      if (typeof row.lesson_id !== "string" || !isValidLessonSlug(row.lesson_id)) continue;
      storedById.set(row.lesson_id, {
        ranges: parseStoredRanges(row.coverage_ranges),
        testPassed: row.test_passed === true,
        completed: row.is_completed === true,
      });
    }

    const lessonUpserts: Record<string, unknown>[] = [];
    const mergedById = new Map<string, ReturnType<typeof mergeLessonProgress>>();
    for (const incoming of payload.lessons) {
      const duration = durations.get(incoming.lessonId) ?? 0;
      const storedRow = storedById.get(incoming.lessonId) ?? {
        ranges: [],
        testPassed: false,
        completed: false,
      };
      const merged = mergeLessonProgress(
        { ranges: incoming.ranges, testPassed: incoming.testPassed, completed: incoming.completed },
        storedRow,
        duration
      );
      mergedById.set(incoming.lessonId, merged);
      lessonUpserts.push({
        user_email: email,
        lesson_id: incoming.lessonId,
        coverage_ranges: merged.ranges,
        watched_seconds: merged.watchedSeconds,
        is_completed: merged.completed,
        test_passed: merged.testPassed,
        updated_at: new Date().toISOString(),
      });
    }
    // Manually completed text lessons: rows with no coverage, completed.
    // Union with what the server already holds for the same ids.
    for (const id of payload.completedIds) {
      if (mergedById.has(id)) continue;
      const storedRow = storedById.get(id);
      if (storedRow && storedRow.ranges.length > 0) continue; // a video row — not a text completion
      lessonUpserts.push({
        user_email: email,
        lesson_id: id,
        coverage_ranges: [],
        watched_seconds: 0,
        is_completed: true,
        test_passed: storedRow?.testPassed ?? false,
        updated_at: new Date().toISOString(),
      });
    }
    if (lessonUpserts.length > 0) {
      const res = await client
        .from("lp_user_progress")
        .upsert(lessonUpserts, { onConflict: "user_email,lesson_id" });
      if (res.error) throw new Error(res.error.message);
    }

    // Merge the daily row for the incoming date with the stored one.
    if (payload.daily) {
      const incoming = payload.daily;
      const storedDaily = await client
        .from("lp_user_daily")
        .select("goal_minutes, credited")
        .eq("user_email", email)
        .eq("log_date", incoming.date)
        .maybeSingle();
      if (storedDaily.error) throw new Error(storedDaily.error.message);
      const storedRow = storedDaily.data as Record<string, unknown> | null;
      const storedCredited =
        storedRow && typeof storedRow.goal_minutes === "number"
          ? {
              date: incoming.date,
              goalMinutes: storedRow.goal_minutes,
              credited: parseStoredCredited(storedRow.credited),
            }
          : null;
      const mergedDaily = mergeDailyProgress(incoming, storedRow ? storedCredited : null);
      // A credited lesson only counts when its merged coverage is >=95%
      // (merged rows from this save, else the stored row).
      // Merged watched seconds per lesson, and which lessons THIS save
      // newly completes (stored incomplete, merged complete): a credited
      // entry for one of those is bumped to its full merged watched
      // seconds — two devices finishing a lesson between them credit
      // the whole lesson, not just the second device's half. A lesson
      // completed by an earlier save is never bumped (no re-crediting
      // old completions to today).
      const completedById = new Map<string, boolean>();
      const watchedSecondsById = new Map<string, number>();
      const newlyCompletedById = new Set<string>();
      for (const [id, merged] of mergedById) {
        completedById.set(id, merged.completed);
        watchedSecondsById.set(id, merged.watchedSeconds);
        if (merged.completed && !(storedById.get(id)?.completed ?? false)) {
          newlyCompletedById.add(id);
        }
      }
      for (const [id, storedLesson] of storedById) {
        if (completedById.has(id)) continue;
        const duration = durations.get(id) ?? 0;
        const seconds = rangeWatchedSeconds(
          clampRanges(storedLesson.ranges, duration > 0 ? Math.floor(duration) : UNKNOWN_DURATION_CAP)
        );
        watchedSecondsById.set(id, seconds);
        completedById.set(
          id,
          duration > 0
            ? qualifiesForCredit(coverageFraction(seconds, duration))
            : storedLesson.completed
        );
      }
      const qualifiedCredited = filterQualifiedCredited(
        (mergedDaily ?? incoming).credited,
        (id) => completedById.get(id) === true
      ).map((c) => {
        if (!newlyCompletedById.has(c.lessonId)) return c;
        const duration = durations.get(c.lessonId);
        const watched = watchedSecondsById.get(c.lessonId) ?? c.seconds;
        return {
          lessonId: c.lessonId,
          seconds:
            duration !== undefined
              ? Math.min(watched, Math.floor(duration))
              : Math.min(watched, UNKNOWN_DURATION_CAP),
        };
      });
      const finalDaily: DailyProgressWire = {
        date: incoming.date,
        goalMinutes: incoming.goalMinutes,
        credited: qualifiedCredited,
      };
      const res = await client.from("lp_user_daily").upsert(
        {
          user_email: email,
          log_date: finalDaily.date,
          seconds: dailySeconds(finalDaily.credited),
          goal_minutes: finalDaily.goalMinutes,
          credited: finalDaily.credited,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_email,log_date" }
      );
      if (res.error) throw new Error(res.error.message);
    }

    // Backfill streak history: ensure a daily row exists for every active
    // date the client knows (insert-or-ignore — never overwrites).
    if (payload.activeDates.length > 0) {
      const rows = payload.activeDates.map((date) => ({
        user_email: email,
        log_date: date,
        seconds: 0,
        goal_minutes: 30,
        credited: [],
        updated_at: new Date().toISOString(),
      }));
      const res = await client
        .from("lp_user_daily")
        .upsert(rows, { onConflict: "user_email,log_date", ignoreDuplicates: true });
      if (res.error) throw new Error(res.error.message);
    }

    return true;
  } catch (err) {
    console.warn(
      "[progress] server save failed — keeping local-only:",
      err instanceof Error ? err.message : String(err)
    );
    return false;
  }
}
