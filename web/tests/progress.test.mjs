import assert from "node:assert/strict";
import test from "node:test";

// Inline pure helpers for zero-build node --test verification
// (mirrors web/src/lib/progress.ts)

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function previousDayKey(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const prev = new Date(y, m - 1, d);
  prev.setDate(prev.getDate() - 1);
  return todayKey(prev);
}

function computeStreak(activeDates, today = todayKey()) {
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

function progressPercent(seconds, goalMinutes) {
  if (goalMinutes <= 0) return 0;
  return Math.min(100, Math.round((seconds / (goalMinutes * 60)) * 100));
}

function rollover(state, today) {
  if (state.date !== today) {
    return { date: today, seconds: 0, goalMinutes: state.goalMinutes, activeDates: state.activeDates, creditedLessonIds: [] };
  }
  return state;
}

const WATCH_QUALIFY_FRACTION = 0.95;

function coverageFraction(watchedSeconds, durationSeconds) {
  if (!(durationSeconds > 0) || !(watchedSeconds > 0)) return 0;
  return Math.min(1, watchedSeconds / durationSeconds);
}

function qualifiesForCredit(fraction) {
  return fraction >= WATCH_QUALIFY_FRACTION;
}

function markActive(state, dateKey = state.date) {
  if (state.activeDates.includes(dateKey)) return state;
  return { ...state, activeDates: [...state.activeDates, dateKey].sort().slice(-365) };
}

function creditLessonWatch(state, lessonId, seconds) {
  if (!(seconds > 0)) return state;
  if (state.creditedLessonIds.includes(lessonId)) return state;
  return markActive({
    ...state,
    seconds: state.seconds + seconds,
    creditedLessonIds: [...state.creditedLessonIds, lessonId],
  });
}

test("streak counts consecutive active days ending today", () => {
  assert.equal(computeStreak(["2026-11-11", "2026-11-12", "2026-11-13"], "2026-11-13"), 3);
  assert.equal(computeStreak(["2026-11-11", "2026-11-13"], "2026-11-13"), 1);
  assert.equal(computeStreak([], "2026-11-13"), 0);
});

test("streak falls back to yesterday when today has no activity yet", () => {
  assert.equal(computeStreak(["2026-11-11", "2026-11-12"], "2026-11-13"), 2);
  assert.equal(computeStreak(["2026-11-10", "2026-11-12"], "2026-11-13"), 1);
});

test("streak handles month boundaries", () => {
  assert.equal(computeStreak(["2026-10-31", "2026-11-01"], "2026-11-01"), 2);
});

test("day rollover resets seconds but keeps goal and history", () => {
  const next = rollover(
    { date: "2026-11-12", seconds: 1800, goalMinutes: 45, activeDates: ["2026-11-12"] },
    "2026-11-13"
  );
  assert.equal(next.date, "2026-11-13");
  assert.equal(next.seconds, 0);
  assert.equal(next.goalMinutes, 45);
  assert.deepEqual(next.activeDates, ["2026-11-12"]);
  const same = rollover(
    { date: "2026-11-13", seconds: 600, goalMinutes: 30, activeDates: ["2026-11-13"] },
    "2026-11-13"
  );
  assert.equal(same.seconds, 600);
});

test("progress percent caps at 100 and rounds", () => {
  assert.equal(progressPercent(0, 30), 0);
  assert.equal(progressPercent(900, 30), 50);
  assert.equal(progressPercent(1800, 30), 100);
  assert.equal(progressPercent(3600, 30), 100);
  assert.equal(progressPercent(0, 0), 0);
});

test("95% rule: coverage fraction and qualification boundary", () => {
  assert.equal(coverageFraction(0, 315), 0);
  assert.equal(coverageFraction(300, 0), 0);
  assert.equal(coverageFraction(315, 315), 1);
  // 299/315 = 94.9% -> not enough; 300/315 = 95.2% -> qualifies.
  assert.equal(qualifiesForCredit(coverageFraction(299, 315)), false);
  assert.equal(qualifiesForCredit(coverageFraction(300, 315)), true);
  assert.equal(qualifiesForCredit(coverageFraction(93, 93)), true);
});

test("lesson minutes are credited once per lesson per day", () => {
  const start = { date: "2026-11-13", seconds: 0, goalMinutes: 30, activeDates: [], creditedLessonIds: [] };
  const once = creditLessonWatch(start, "sample-mega-01", 300);
  assert.equal(once.seconds, 300);
  assert.deepEqual(once.creditedLessonIds, ["sample-mega-01"]);
  assert.deepEqual(once.activeDates, ["2026-11-13"]);
  const twice = creditLessonWatch(once, "sample-mega-01", 300);
  assert.equal(twice.seconds, 300);
  assert.deepEqual(twice.creditedLessonIds, ["sample-mega-01"]);
  const other = creditLessonWatch(once, "sample-mega-02", 90);
  assert.equal(other.seconds, 390);
  assert.deepEqual(other.creditedLessonIds, ["sample-mega-01", "sample-mega-02"]);
  assert.equal(creditLessonWatch(once, "sample-mega-02", 0).seconds, 300);
});

test("day rollover resets credited lessons but keeps history", () => {
  const next = rollover(
    { date: "2026-11-12", seconds: 300, goalMinutes: 30, activeDates: ["2026-11-12"], creditedLessonIds: ["sample-mega-01"] },
    "2026-11-13"
  );
  assert.equal(next.seconds, 0);
  assert.deepEqual(next.creditedLessonIds, []);
  assert.deepEqual(next.activeDates, ["2026-11-12"]);
});

function contiguousCap(watchedSeconds) {
  const set = new Set(watchedSeconds);
  let cap = 0;
  while (set.has(cap)) cap += 1;
  return cap;
}

test("no-skip frontier is the first unwatched second from the start", () => {
  assert.equal(contiguousCap([]), 0);
  assert.equal(contiguousCap([0, 1, 2]), 3);
  assert.equal(contiguousCap([0, 1, 2, 5, 6]), 3);
  assert.equal(contiguousCap([1, 2, 3]), 0);
  const first300 = Array.from({ length: 300 }, (_, i) => i);
  assert.equal(contiguousCap(first300), 300);
});
