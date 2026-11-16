// Streak restore: when a streak breaks, the user has 24 hours to bring it
// back, at most 3 times per calendar month. Per-browser state, like the
// rest of progress — restores live under lp_streak_restores as ISO
// timestamps, and a restore marks the missed day active in lp_progress_v1.
//
// How a break works (dates are local YYYY-MM-DD keys):
// - The streak is alive while today or yesterday is active. It breaks the
//   morning after a missed day: last active Nov 14, missed Nov 15, so the
//   break lands at Nov 16 00:00 and the restore window runs Nov 16 00:00
//   → Nov 17 00:00 (24h). On Nov 15 itself the streak is still saveable
//   by watching something, so no restore is offered.
// - Restoring fills in the missed day (Nov 15), so the run ends there
//   again and the streak number comes back as it was.

import { computeStreak, todayKey } from "./progress";

export const RESTORE_KEY = "lp_streak_restores";
export const MAX_RESTORES_PER_MONTH = 3;
export const RESTORE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Shift a YYYY-MM-DD key by N days (local dates). */
export function addDaysKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const next = new Date(y, m - 1, d);
  next.setDate(next.getDate() + days);
  const yy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, "0");
  const dd = String(next.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** The newest active day, or null when the user has never been active. */
export function lastActiveDate(activeDates: string[]): string | null {
  if (activeDates.length === 0) return null;
  return [...activeDates].sort().at(-1) ?? null;
}

/** Local midnight (ms) at the start of a YYYY-MM-DD day. */
export function dayStartMs(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

/** How many restores were used in the calendar month containing `today`. */
export function restoresThisMonth(restores: string[], today = todayKey()): number {
  const month = today.slice(0, 7); // YYYY-MM
  return restores.filter((iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return ym === month;
  }).length;
}

export type RestoreState =
  | { status: "none" }
  | {
      status: "available";
      brokenStreak: number;
      missedDay: string;
      deadlineMs: number;
      restoresUsed: number;
    }
  | {
      status: "expired";
      brokenStreak: number;
      missedDay: string;
      deadlineMs: number;
      restoresUsed: number;
    }
  | {
      status: "limit";
      brokenStreak: number;
      missedDay: string;
      deadlineMs: number;
      restoresUsed: number;
    };

/**
 * Where the user stands on restoring a broken streak.
 * `nowMs` is Date.now() at the moment of the check.
 */
export function getRestoreState(
  activeDates: string[],
  today: string,
  nowMs: number,
  restores: string[]
): RestoreState {
  const last = lastActiveDate(activeDates);
  if (!last) return { status: "none" };
  // Streak alive while today or yesterday is active.
  if (computeStreak(activeDates, today) > 0) return { status: "none" };
  const brokenStreak = computeStreak(activeDates, last);
  if (brokenStreak <= 0) return { status: "none" };
  const missedDay = addDaysKey(last, 1);
  const deadlineMs = dayStartMs(addDaysKey(last, 3));
  const restoresUsed = restoresThisMonth(restores, today);
  const base = { brokenStreak, missedDay, deadlineMs, restoresUsed };
  if (nowMs >= deadlineMs) return { status: "expired", ...base };
  if (restoresUsed >= MAX_RESTORES_PER_MONTH) return { status: "limit", ...base };
  return { status: "available", ...base };
}

/** Split the time left until `deadlineMs` into clock units for the countdown. */
export function splitCountdown(
  deadlineMs: number,
  nowMs: number
): { hours: number; minutes: number; seconds: number } {
  const remaining = Math.max(0, deadlineMs - nowMs);
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** Read the stored restore timestamps (ISO strings), tolerating bad data. */
export function loadRestores(read: (key: string) => string | null): string[] {
  try {
    const raw = read(RESTORE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}
