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
