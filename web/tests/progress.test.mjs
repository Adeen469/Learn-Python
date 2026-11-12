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
    return { date: today, seconds: 0, goalMinutes: state.goalMinutes, activeDates: state.activeDates };
  }
  return state;
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
