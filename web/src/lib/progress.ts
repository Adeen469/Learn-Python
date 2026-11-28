// Real daily progress tracking (client-side, localStorage).
// One shared record so the home page and the navbar always agree:
//   lp_progress_v1 = { date, seconds, goalMinutes, activeDates }
// - seconds counts ACTUAL video watch time (reported by VideoPlayer),
//   never a flat bonus for pressing a button.
// - The record resets when the calendar day changes, so "today" is real.
// - activeDates remembers every day with activity; the streak is the run
//   of consecutive active days ending today (or yesterday, if today has
//   no activity yet).

export interface ProgressState {
  date: string; // YYYY-MM-DD, local date
  seconds: number; // actual seconds watched today
  goalMinutes: number;
  activeDates: string[]; // YYYY-MM-DD, newest last
  creditedLessonIds: string[]; // lessons whose minutes are already credited today
}

export const PROGRESS_KEY = "lp_progress_v1";
export const PROGRESS_UPDATED_EVENT = "lp-progress-updated";

// A lesson counts toward completion and today's progress only once 95% of
// its unique content has actually been watched (seeks don't count, rewatches
// of the same seconds don't count twice).
export const WATCH_QUALIFY_FRACTION = 0.95;

export function coverageFraction(watchedSeconds: number, durationSeconds: number): number {
  if (!(durationSeconds > 0) || !(watchedSeconds > 0)) return 0;
  return Math.min(1, watchedSeconds / durationSeconds);
}

export function qualifiesForCredit(fraction: number): boolean {
  return fraction >= WATCH_QUALIFY_FRACTION;
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function previousDayKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const prev = new Date(y, m - 1, d);
  prev.setDate(prev.getDate() - 1);
  return todayKey(prev);
}

export function emptyProgress(dateKey: string, goalMinutes = 30): ProgressState {
  return { date: dateKey, seconds: 0, goalMinutes, activeDates: [], creditedLessonIds: [] };
}

function isValidProgress(value: unknown): value is ProgressState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.date) &&
    typeof v.seconds === "number" &&
    Number.isFinite(v.seconds) &&
    v.seconds >= 0 &&
    typeof v.goalMinutes === "number" &&
    Number.isFinite(v.goalMinutes) &&
    v.goalMinutes > 0 &&
    Array.isArray(v.activeDates) &&
    v.activeDates.every((d) => typeof d === "string") &&
    // creditedLessonIds was added later — older records don't have it.
    (v.creditedLessonIds === undefined ||
      (Array.isArray(v.creditedLessonIds) &&
        v.creditedLessonIds.every((d) => typeof d === "string")))
  );
}

function normalizeProgress(parsed: ProgressState): ProgressState {
  return {
    date: parsed.date,
    seconds: parsed.seconds,
    goalMinutes: parsed.goalMinutes,
    activeDates: parsed.activeDates,
    creditedLessonIds: parsed.creditedLessonIds ?? [],
  };
}

export function loadProgress(
  read: (key: string) => string | null,
  today = todayKey()
): ProgressState {
  try {
    const raw = read(PROGRESS_KEY);
    if (!raw) return emptyProgress(today);
    const parsed: unknown = JSON.parse(raw);
    if (!isValidProgress(parsed)) return emptyProgress(today);
    const state = normalizeProgress(parsed);
    if (state.date !== today) {
      // New day: keep the goal + history, reset today's seconds. Lessons can
      // be credited again today (re-watching counts toward the new day).
      return {
        date: today,
        seconds: 0,
        goalMinutes: state.goalMinutes,
        activeDates: state.activeDates,
        creditedLessonIds: [],
      };
    }
    return state;
  } catch {
    return emptyProgress(today);
  }
}

export function markActive(state: ProgressState, dateKey = state.date): ProgressState {
  if (state.activeDates.includes(dateKey)) return state;
  const activeDates = [...state.activeDates, dateKey].sort().slice(-365);
  return { ...state, activeDates };
}

export function addWatchSeconds(state: ProgressState, seconds: number): ProgressState {
  if (!(seconds > 0)) return state;
  return markActive({ ...state, seconds: state.seconds + seconds });
}

/**
 * Credits a lesson's watched minutes toward today — once per lesson per day.
 * A second call for the same lesson on the same day is a no-op, so a lesson
 * can never inflate the daily goal by being re-opened or re-watched.
 */
export function creditLessonWatch(
  state: ProgressState,
  lessonId: string,
  seconds: number
): ProgressState {
  if (!(seconds > 0)) return state;
  if (state.creditedLessonIds.includes(lessonId)) return state;
  return markActive({
    ...state,
    seconds: state.seconds + seconds,
    creditedLessonIds: [...state.creditedLessonIds, lessonId],
  });
}

export function withGoal(state: ProgressState, goalMinutes: number): ProgressState {
  if (!(goalMinutes > 0)) return state;
  return { ...state, goalMinutes };
}

/** Consecutive active days ending today (or yesterday if today is inactive). */
export function computeStreak(activeDates: string[], today = todayKey()): number {
  const set = new Set(activeDates);
  let cursor = today;
  if (!set.has(cursor)) cursor = previousDayKey(cursor);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = previousDayKey(cursor);
  }
  return streak;
}

export function progressPercent(state: ProgressState): number {
  if (state.goalMinutes <= 0) return 0;
  return Math.min(100, Math.round((state.seconds / (state.goalMinutes * 60)) * 100));
}

export function wholeMinutes(seconds: number): number {
  return Math.floor(seconds / 60);
}

// ---------------------------------------------------------------------------
// Per-user progress sync (server-side, Supabase).
//
// The local record above stays the offline cache; the server copy is keyed
// by the signed-in user's email and is the shared truth across devices.
// Coverage travels as RANGES ([start, end] inclusive integer seconds)
// instead of per-second buckets: a 10-hour lesson is a handful of pairs,
// not ~39k numbers. Ranges merge exactly (union), so two devices that
// watched different halves combine to the true total — and a lesson
// completed on either device stays completed.
// ---------------------------------------------------------------------------

export type CoverageRange = [number, number];

/** One lesson's syncable state (wire format, shared client <-> server). */
export interface LessonProgressWire {
  lessonId: string;
  ranges: CoverageRange[];
  testPassed: boolean;
  /**
   * Client-computed at save time (coverage >=95% when the duration is
   * known). The server stores it as a hint; the client recomputes
   * completion on merge whenever the duration is known, so a stored
   * `true` with <95% coverage is corrected, never trusted. For lessons
   * with no known duration (e.g. a bare YouTube id) the merged value
   * is the OR of both sides' flags.
   */
  completed: boolean;
}

/** One lesson credited toward a day, with the exact seconds credited. */
export interface CreditedLessonWire {
  lessonId: string;
  seconds: number;
}

/** One day's aggregate (wire format). Daily seconds are the SUM of the
 *  credited lessons' seconds — never a free counter — so merging two
 *  devices can never double-count a lesson. */
export interface DailyProgressWire {
  date: string; // YYYY-MM-DD
  goalMinutes: number;
  credited: CreditedLessonWire[];
}

/** What GET /api/progress returns. `dailyRows` carries the last few days
 *  so the client can pick the row matching its own local date. */
export interface ServerProgressSnapshot {
  lessons: LessonProgressWire[];
  dailyRows: DailyProgressWire[];
  activeDates: string[]; // every date with server-side activity, newest last
  /** Manually completed text lessons (lp_learn_completed) — no coverage. */
  completedIds: string[];
}

/** Collapse a set of watched second-buckets into sorted, coalesced ranges. */
export function rangesFromBuckets(buckets: Iterable<number>): CoverageRange[] {
  const sorted = [...new Set(buckets)]
    .filter((n) => Number.isInteger(n) && n >= 0)
    .sort((a, b) => a - b);
  const ranges: CoverageRange[] = [];
  for (const n of sorted) {
    const last = ranges[ranges.length - 1];
    if (last && n <= last[1] + 1) {
      if (n > last[1]) last[1] = n;
    } else {
      ranges.push([n, n]);
    }
  }
  return ranges;
}

/** Union of two range sets (sorted, overlapping/adjacent coalesced). */
export function mergeRanges(a: CoverageRange[], b: CoverageRange[]): CoverageRange[] {
  const all = [...a, ...b]
    .filter(
      (pair): pair is CoverageRange =>
        Array.isArray(pair) &&
        pair.length === 2 &&
        Number.isInteger(pair[0]) &&
        Number.isInteger(pair[1]) &&
        pair[0] >= 0 &&
        pair[1] >= pair[0]
    )
    .sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const out: CoverageRange[] = [];
  for (const [s, e] of all) {
    const last = out[out.length - 1];
    if (last && s <= last[1] + 1) {
      if (e > last[1]) last[1] = e;
    } else {
      out.push([s, e]);
    }
  }
  return out;
}

/** Total unique seconds covered by a set of ranges. */
export function rangeWatchedSeconds(ranges: CoverageRange[]): number {
  let total = 0;
  for (const [s, e] of ranges) total += e - s + 1;
  return total;
}

/** Expand ranges back into per-second buckets (for the local player cache). */
export function bucketsFromRanges(ranges: CoverageRange[]): number[] {
  const out: number[] = [];
  for (const [s, e] of ranges) {
    for (let n = s; n <= e; n += 1) out.push(n);
  }
  return out;
}

/**
 * Sanitize ranges: drop malformed pairs, clamp to [0, maxSecond],
 * coalesce. `maxSecond` is the lesson's floored duration — a bucket past
 * the end of the video can never have been watched.
 */
export function clampRanges(ranges: unknown, maxSecond: number): CoverageRange[] {
  if (!Array.isArray(ranges)) return [];
  if (ranges.length > 500) return [];
  const cleaned: CoverageRange[] = [];
  for (const pair of ranges) {
    if (!Array.isArray(pair) || pair.length !== 2) continue;
    const [s, e] = pair;
    if (!Number.isInteger(s) || !Number.isInteger(e)) continue;
    const start = Math.max(0, s);
    const end = Math.min(Math.max(0, Math.floor(maxSecond)), e);
    if (start > end) continue;
    cleaned.push([start, end]);
  }
  return mergeRanges(cleaned, []);
}

export interface MergedLessonProgress {
  ranges: CoverageRange[];
  watchedSeconds: number;
  completed: boolean;
  testPassed: boolean;
}

/**
 * Merge one lesson's local + server progress. Coverage is the union;
 * completion is RECOMPUTED from the 95% rule against the real duration
 * (a stored `completed: true` with <95% coverage is corrected, never
 * trusted); test-passed is an OR. When no duration is known (a bare
 * YouTube id with no catalog entry) there is nothing to recompute
 * against, so completion is the OR of both sides' flags instead.
 */
export function mergeLessonProgress(
  local: { ranges: CoverageRange[]; testPassed: boolean; completed?: boolean },
  server: { ranges: CoverageRange[]; testPassed: boolean; completed?: boolean },
  durationSeconds: number
): MergedLessonProgress {
  const cap = durationSeconds > 0 ? Math.floor(durationSeconds) : 86400;
  const ranges = mergeRanges(
    clampRanges(local.ranges, cap),
    clampRanges(server.ranges, cap)
  );
  const watchedSeconds = rangeWatchedSeconds(ranges);
  return {
    ranges,
    watchedSeconds,
    completed:
      durationSeconds > 0
        ? qualifiesForCredit(coverageFraction(watchedSeconds, durationSeconds))
        : Boolean(local.completed || server.completed),
    testPassed: local.testPassed || server.testPassed,
  };
}

/** Sum of the credited lessons' seconds — the day's total, by definition. */
export function dailySeconds(credited: CreditedLessonWire[]): number {
  return credited.reduce((sum, c) => sum + c.seconds, 0);
}

/**
 * Merge one day's local + server aggregate. Both must be for the same date
 * (the caller only merges the server row matching the local date). The
 * credited list is the union by lesson; per-lesson seconds take the MAX
 * (the lesson's credited seconds can only grow as coverage grows). The
 * server's goal wins — it is the last value the user set on any device.
 * Returns null when there is no server row for this date.
 */
export function mergeDailyProgress(
  local: DailyProgressWire,
  server: DailyProgressWire | null
): DailyProgressWire | null {
  if (!server || server.date !== local.date) return null;
  const byId = new Map<string, number>();
  for (const c of local.credited) byId.set(c.lessonId, c.seconds);
  for (const c of server.credited) {
    byId.set(c.lessonId, Math.max(byId.get(c.lessonId) ?? 0, c.seconds));
  }
  const credited = [...byId.entries()]
    .map(([lessonId, seconds]) => ({ lessonId, seconds }))
    .sort((a, b) => a.lessonId.localeCompare(b.lessonId));
  return { date: local.date, goalMinutes: server.goalMinutes, credited };
}

/** Union of two active-date lists, newest last, capped at 365 days. */
export function mergeActiveDates(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])].sort().slice(-365);
}

/** Union of two manually-completed text-lesson lists, capped at 1000. */
export function mergeCompletedIds(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])].sort().slice(0, 1000);
}
