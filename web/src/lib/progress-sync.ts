// Client-side per-user progress sync.
// LocalStorage stays the offline cache and the source of truth while
// signed out. When a session exists, the ProgressSync component loads
// the server copy once (merging it into local state — union, nothing
// ever lost) and saves the local state back to the server, debounced.
// Any server failure (not configured, table missing, network) is
// silent: the app keeps working locally, and the next save retries.
//
// Imported only by client components — never by server code.

import {
  bucketsFromRanges,
  clampRanges,
  coverageFraction,
  dailySeconds,
  loadProgress,
  mergeActiveDates,
  mergeCompletedIds,
  mergeDailyProgress,
  mergeLessonProgress,
  qualifiesForCredit,
  rangesFromBuckets,
  rangeWatchedSeconds,
  type CoverageRange,
  type CreditedLessonWire,
  type DailyProgressWire,
  type LessonProgressWire,
  type ProgressState,
  type ServerProgressSnapshot,
} from "./progress.ts";

export const PROGRESS_SYNCED_EVENT = "lp-progress-synced";
export const COMPLETED_LESSONS_KEY = "lp_completed_lessons";
export const LEARN_COMPLETED_KEY = "lp_learn_completed";
export const TEST_PASSED_KEY = "lp_test_passed";

const SAVE_DEBOUNCE_MS = 10_000;

export interface LocalProgressSnapshot {
  progress: ProgressState;
  completedLessonIds: string[];
  /** Manually completed text lessons (learn pages). */
  learnCompletedIds: string[];
  testPassedLessonIds: string[];
  /** lessonId -> coverage ranges (from the lp_coverage_<id> buckets). */
  coverage: Record<string, CoverageRange[]>;
}

export interface LessonDuration {
  id: string;
  durationSeconds: number;
}

type ReadFn = (key: string) => string | null;
type WriteFn = (key: string, value: string) => void;

function coverageKey(id: string): string {
  return `lp_coverage_${id}`;
}

function readIdList(read: ReadFn, key: string): string[] {
  try {
    const raw = read(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function readCoverage(read: ReadFn, lessonId: string): CoverageRange[] {
  try {
    const raw = read(coverageKey(lessonId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const buckets = parsed.filter(
      (n): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0
    );
    return rangesFromBuckets(buckets);
  } catch {
    return [];
  }
}

/** Read the whole local progress state (localStorage) into one snapshot. */
export function readLocalSnapshot(
  read: ReadFn,
  lessons: LessonDuration[],
  today: string
): LocalProgressSnapshot {
  const progress = loadProgress(read, today);
  const coverage: Record<string, CoverageRange[]> = {};
  for (const lesson of lessons) {
    const ranges = readCoverage(read, lesson.id);
    if (ranges.length > 0) coverage[lesson.id] = ranges;
  }
  return {
    progress,
    completedLessonIds: readIdList(read, COMPLETED_LESSONS_KEY),
    learnCompletedIds: readIdList(read, LEARN_COMPLETED_KEY),
    testPassedLessonIds: readIdList(read, TEST_PASSED_KEY),
    coverage,
  };
}

/** Write a snapshot back to localStorage (the offline cache). */
export function writeLocalSnapshot(
  write: WriteFn,
  remove: (key: string) => void,
  snapshot: LocalProgressSnapshot,
  lessons: LessonDuration[]
): void {
  write("lp_progress_v1", JSON.stringify(snapshot.progress));
  write(COMPLETED_LESSONS_KEY, JSON.stringify(snapshot.completedLessonIds));
  write(LEARN_COMPLETED_KEY, JSON.stringify(snapshot.learnCompletedIds));
  write(TEST_PASSED_KEY, JSON.stringify(snapshot.testPassedLessonIds));
  for (const lesson of lessons) {
    const ranges = snapshot.coverage[lesson.id];
    if (ranges && ranges.length > 0) {
      write(coverageKey(lesson.id), JSON.stringify(bucketsFromRanges(ranges)));
    } else {
      remove(coverageKey(lesson.id));
    }
  }
  // Coverage for ids outside the known list (e.g. a removed video) is
  // kept as-is on the server and merged back on the next load — the
  // write above only touches keys for known lessons.
}

/**
 * Build the local day's wire record from a ProgressState. The local state
 * stores credited lesson IDS only; the credited seconds for each id are
 * estimated from that lesson's current coverage (the seconds that were
 * credited when it qualified — coverage can only have grown since, so
 * the estimate is within 5% of one lesson, merge-path only).
 */
export function localDailyWire(
  progress: ProgressState,
  coverageSecondsByLesson: Record<string, number>
): DailyProgressWire {
  return {
    date: progress.date,
    goalMinutes: progress.goalMinutes,
    credited: progress.creditedLessonIds.map((lessonId) => ({
      lessonId,
      seconds: coverageSecondsByLesson[lessonId] ?? 0,
    })),
  };
}

function coverageSeconds(coverage: Record<string, CoverageRange[]>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, ranges] of Object.entries(coverage)) {
    out[id] = rangeWatchedSeconds(ranges);
  }
  return out;
}

/**
 * Merge a server snapshot into the local snapshot. Lessons: union of
 * coverage, completion recomputed at 95% where the duration is known
 * (OR of both sides' flags where it is not), test-passed OR. Text
 * lessons: union of completed ids. Today: the credited lists union
 * (per-lesson seconds take the max), the server's goal wins, active
 * dates union. Nothing is ever dropped — a lesson completed or
 * credited on either side stays completed/credited.
 */
export function mergeSnapshots(
  local: LocalProgressSnapshot,
  server: ServerProgressSnapshot,
  lessons: LessonDuration[]
): LocalProgressSnapshot {
  const durations = new Map(lessons.map((l) => [l.id, l.durationSeconds]));
  const serverLessons = new Map(server.lessons.map((l) => [l.lessonId, l]));

  // Union of ids: known lessons, local coverage, and server rows — a
  // video id with no known duration still merges its ranges.
  const ids = new Set<string>([
    ...durations.keys(),
    ...Object.keys(local.coverage),
    ...serverLessons.keys(),
  ]);

  const coverage: Record<string, CoverageRange[]> = {};
  const completed = new Set(local.completedLessonIds);
  const testPassed = new Set(local.testPassedLessonIds);

  for (const id of ids) {
    const duration = durations.get(id) ?? 0;
    const localRanges = local.coverage[id] ?? [];
    const serverLesson = serverLessons.get(id);
    const merged = mergeLessonProgress(
      {
        ranges: localRanges,
        testPassed: testPassed.has(id),
        completed: completed.has(id),
      },
      {
        ranges: serverLesson?.ranges ?? [],
        testPassed: serverLesson?.testPassed ?? false,
        completed: serverLesson?.completed ?? false,
      },
      duration
    );
    if (merged.ranges.length > 0) coverage[id] = merged.ranges;
    if (merged.completed) completed.add(id);
    if (merged.testPassed) testPassed.add(id);
  }

  const mergedCoverageSeconds = coverageSeconds(coverage);
  const localDaily = localDailyWire(local.progress, mergedCoverageSeconds);
  const serverDaily =
    server.dailyRows.find((row) => row.date === local.progress.date) ?? null;
  const mergedDaily = mergeDailyProgress(localDaily, serverDaily);
  // A lesson this merge itself completes was never credited on either
  // side (neither device reached 95% alone): credit it to today with
  // its merged watched seconds, so finishing a lesson across two
  // devices still counts toward today's goal. Only completions that
  // are NEW from this merge count — a lesson completed long ago (on
  // either side's list already) is never re-credited to today.
  const alreadyCredited = new Set((mergedDaily?.credited ?? []).map((c) => c.lessonId));
  const extraCredited: CreditedLessonWire[] = [];
  for (const id of completed) {
    if (alreadyCredited.has(id)) continue;
    if (local.completedLessonIds.includes(id)) continue;
    if (serverLessons.get(id)?.completed === true) continue;
    const watched = mergedCoverageSeconds[id] ?? 0;
    if (watched <= 0) continue;
    const duration = durations.get(id) ?? 0;
    if (duration > 0 && !qualifiesForCredit(coverageFraction(watched, duration))) continue;
    extraCredited.push({
      lessonId: id,
      seconds: duration > 0 ? Math.min(watched, duration) : watched,
    });
  }
  const finalDaily =
    extraCredited.length > 0
      ? {
          date: local.progress.date,
          goalMinutes: mergedDaily?.goalMinutes ?? local.progress.goalMinutes,
          credited: [...(mergedDaily?.credited ?? []), ...extraCredited].sort((a, b) =>
            a.lessonId.localeCompare(b.lessonId)
          ),
        }
      : mergedDaily;
  const progress: ProgressState = finalDaily
    ? {
        ...local.progress,
        goalMinutes: finalDaily.goalMinutes,
        seconds: dailySeconds(finalDaily.credited),
        activeDates: mergeActiveDates(local.progress.activeDates, server.activeDates),
        creditedLessonIds: finalDaily.credited.map((c) => c.lessonId),
      }
    : {
        ...local.progress,
        activeDates: mergeActiveDates(local.progress.activeDates, server.activeDates),
      };

  return {
    progress,
    completedLessonIds: [...completed].sort(),
    learnCompletedIds: mergeCompletedIds(local.learnCompletedIds, server.completedIds ?? []),
    testPassedLessonIds: [...testPassed].sort(),
    coverage,
  };
}

/** Wire payload for POST /api/progress, built from a local snapshot. */
export function toWirePayload(snapshot: LocalProgressSnapshot): {
  lessons: LessonProgressWire[];
  daily: DailyProgressWire;
  activeDates: string[];
  completedIds: string[];
} {
  const coverageSecs = coverageSeconds(snapshot.coverage);
  return {
    lessons: Object.entries(snapshot.coverage).map(([lessonId, ranges]) => ({
      lessonId,
      ranges,
      testPassed: snapshot.testPassedLessonIds.includes(lessonId),
      completed: snapshot.completedLessonIds.includes(lessonId),
    })),
    daily: localDailyWire(snapshot.progress, coverageSecs),
    activeDates: snapshot.progress.activeDates,
    completedIds: snapshot.learnCompletedIds,
  };
}

/** Loosely validate a GET /api/progress body — malformed entries are dropped. */
export function parseServerSnapshot(body: unknown): ServerProgressSnapshot | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (b.synced !== true) return null;
  if (!Array.isArray(b.lessons) || !Array.isArray(b.dailyRows) || !Array.isArray(b.activeDates)) {
    return null;
  }
  const lessons: LessonProgressWire[] = [];
  for (const entry of b.lessons) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.lessonId !== "string" || !e.lessonId) continue;
    if (!Array.isArray(e.ranges)) continue;
    const ranges: CoverageRange[] = [];
    let valid = true;
    for (const pair of e.ranges) {
      if (
        !Array.isArray(pair) ||
        pair.length !== 2 ||
        !Number.isInteger(pair[0]) ||
        !Number.isInteger(pair[1]) ||
        pair[0] < 0 ||
        pair[1] < pair[0]
      ) {
        valid = false;
        break;
      }
      ranges.push([pair[0], pair[1]]);
    }
    if (!valid) continue;
    lessons.push({
      lessonId: e.lessonId,
      ranges,
      testPassed: e.testPassed === true,
      completed: e.completed === true,
    });
  }
  const dailyRows: DailyProgressWire[] = [];
  for (const entry of b.dailyRows) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) continue;
    if (typeof e.goalMinutes !== "number" || !Number.isInteger(e.goalMinutes)) continue;
    if (!Array.isArray(e.credited)) continue;
    const credited: CreditedLessonWire[] = [];
    let valid = true;
    for (const c of e.credited) {
      if (typeof c !== "object" || c === null) {
        valid = false;
        break;
      }
      const item = c as Record<string, unknown>;
      if (typeof item.lessonId !== "string" || typeof item.seconds !== "number") {
        valid = false;
        break;
      }
      credited.push({ lessonId: item.lessonId, seconds: Math.floor(item.seconds) });
    }
    if (!valid) continue;
    dailyRows.push({ date: e.date, goalMinutes: e.goalMinutes, credited });
  }
  const activeDates = (b.activeDates as unknown[]).filter(
    (d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)
  );
  const completedIds = Array.isArray(b.completedIds)
    ? (b.completedIds as unknown[]).filter(
        (d): d is string => typeof d === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(d)
      )
    : [];
  return { lessons, dailyRows, activeDates, completedIds };
}

/** GET /api/progress — null on ANY failure (not configured, offline, bad shape). */
export async function loadServerProgress(): Promise<ServerProgressSnapshot | null> {
  try {
    const res = await fetch("/api/progress", { credentials: "same-origin" });
    if (!res.ok) return null;
    const body: unknown = await res.json().catch(() => null);
    return parseServerSnapshot(body);
  } catch {
    return null;
  }
}

/** POST /api/progress — false on ANY failure (the local copy stays truth). */
export async function saveServerProgress(
  snapshot: LocalProgressSnapshot
): Promise<boolean> {
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toWirePayload(snapshot)),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** POST with keepalive for pagehide/unload — best effort, never throws. */
export function saveServerProgressKeepalive(snapshot: LocalProgressSnapshot): void {
  try {
    fetch("/api/progress", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toWirePayload(snapshot)),
      keepalive: true,
    }).catch(() => {
      // Best effort only — the local copy is the fallback.
    });
  } catch {
    // Best effort only.
  }
}

/** Debounced saver: at most one server save per 10s, plus a manual flush. */
export function createDebouncedSaver(
  save: () => void,
  delayMs = SAVE_DEBOUNCE_MS
): {
  schedule: (immediate?: boolean) => void;
  flush: () => void;
  cancel: () => void;
} {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    schedule(immediate = false) {
      if (timer) clearTimeout(timer);
      if (immediate) {
        save();
        return;
      }
      timer = setTimeout(() => {
        timer = null;
        save();
      }, delayMs);
    },
    flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      save();
    },
    cancel() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}
