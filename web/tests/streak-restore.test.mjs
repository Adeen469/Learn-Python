import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(webDir, rel), "utf8");

// Inline mirror of src/lib/streak-restore.ts + the streak rule in
// src/lib/progress.ts, so the restore spec is pinned by real date math
// (the app modules are TS, so the tests mirror them here).
function addDaysKey(key, days) {
  const [y, m, d] = key.split("-").map(Number);
  const next = new Date(y, m - 1, d);
  next.setDate(next.getDate() + days);
  const pad = (n) => String(n).padStart(2, "0");
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
}
function dayStartMs(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}
function computeStreak(activeDates, today) {
  const set = new Set(activeDates);
  let cursor = today;
  if (!set.has(cursor)) cursor = addDaysKey(cursor, -1);
  let s = 0;
  while (set.has(cursor)) {
    s += 1;
    cursor = addDaysKey(cursor, -1);
  }
  return s;
}
function getRestoreState(activeDates, today, nowMs, restores) {
  const last = [...activeDates].sort().at(-1) ?? null;
  if (!last) return { status: "none" };
  if (computeStreak(activeDates, today) > 0) return { status: "none" };
  const brokenStreak = computeStreak(activeDates, last);
  if (brokenStreak <= 0) return { status: "none" };
  const missedDay = addDaysKey(last, 1);
  const deadlineMs = dayStartMs(addDaysKey(last, 3));
  const month = today.slice(0, 7);
  const restoresUsed = restores.filter((iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === month;
  }).length;
  const base = { brokenStreak, missedDay, deadlineMs, restoresUsed };
  if (nowMs >= deadlineMs) return { status: "expired", ...base };
  if (restoresUsed >= 3) return { status: "limit", ...base };
  return { status: "available", ...base };
}
function splitCountdown(deadlineMs, nowMs) {
  const remaining = Math.max(0, deadlineMs - nowMs);
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}
// 12 consecutive active days ending 2026-11-14 (Nov 3..14).
function twelveDayRun() {
  const days = [];
  for (let i = 0; i < 12; i += 1) days.push(addDaysKey("2026-11-14", -i));
  return days.sort();
}
const NOON_NOV_16 = dayStartMs("2026-11-16") + 12 * 3600 * 1000;

describe("streak restore — lib (src/lib/streak-restore.ts)", () => {
  test("lib carries the 24h window, 3-per-month cap and the restore helpers", () => {
    const lib = read("src/lib/streak-restore.ts");
    assert.ok(lib.includes('RESTORE_KEY = "lp_streak_restores"'), "restores must persist under lp_streak_restores");
    assert.ok(lib.includes("MAX_RESTORES_PER_MONTH = 3"), "cap must be 3 restores per month");
    assert.ok(lib.includes("RESTORE_WINDOW_MS = 24 * 60 * 60 * 1000"), "window must be 24 hours");
    for (const fn of ["getRestoreState", "splitCountdown", "loadRestores", "addDaysKey", "lastActiveDate", "restoresThisMonth"]) {
      assert.ok(lib.includes(`export function ${fn}`), `lib must export ${fn}`);
    }
    assert.ok(lib.includes("computeStreak"), "restore state must reuse the streak rule");
  });

  test("a streak broken yesterday is restorable today, for 24h from the break", () => {
    const state = getRestoreState(twelveDayRun(), "2026-11-16", NOON_NOV_16, []);
    assert.equal(state.status, "available");
    assert.equal(state.brokenStreak, 12);
    assert.equal(state.missedDay, "2026-11-15");
    assert.equal(state.deadlineMs, dayStartMs("2026-11-17"));
    assert.equal(state.restoresUsed, 0);
  });

  test("on the missed day itself the streak is still saveable — no restore offered", () => {
    const state = getRestoreState(twelveDayRun(), "2026-11-15", dayStartMs("2026-11-15") + 20 * 3600 * 1000, []);
    assert.equal(state.status, "none");
  });

  test("once the 24h window passes the restore expires", () => {
    const state = getRestoreState(twelveDayRun(), "2026-11-17", dayStartMs("2026-11-17") + 1000, []);
    assert.equal(state.status, "expired");
    assert.equal(state.brokenStreak, 12);
  });

  test("3 restores in the same month block a 4th; last month's restores don't count", () => {
    const thisMonth = [
      "2026-11-02T10:00:00.000Z",
      "2026-11-05T10:00:00.000Z",
      "2026-11-09T10:00:00.000Z",
    ];
    const limited = getRestoreState(twelveDayRun(), "2026-11-16", NOON_NOV_16, thisMonth);
    assert.equal(limited.status, "limit");
    assert.equal(limited.restoresUsed, 3);
    const lastMonth = [
      "2026-10-28T10:00:00.000Z",
      "2026-10-29T10:00:00.000Z",
      "2026-10-30T10:00:00.000Z",
    ];
    const ok = getRestoreState(twelveDayRun(), "2026-11-16", NOON_NOV_16, lastMonth);
    assert.equal(ok.status, "available");
    assert.equal(ok.restoresUsed, 0);
  });

  test("no activity ever means nothing to restore; an alive streak means none either", () => {
    assert.equal(getRestoreState([], "2026-11-16", NOON_NOV_16, []).status, "none");
    const alive = [...twelveDayRun(), "2026-11-16"];
    assert.equal(getRestoreState(alive, "2026-11-16", NOON_NOV_16, []).status, "none");
  });

  test("filling in the missed day brings the streak back — and the restored day extends it by one", () => {
    const restored = [...twelveDayRun(), "2026-11-15"].sort();
    assert.equal(computeStreak(restored, "2026-11-16"), 13);
  });

  test("countdown splits the time left into clock units", () => {
    const deadline = dayStartMs("2026-11-17");
    assert.deepEqual(splitCountdown(deadline, deadline - (5 * 3600 + 49 * 60 + 31) * 1000), { hours: 5, minutes: 49, seconds: 31 });
    assert.deepEqual(splitCountdown(deadline, deadline - 24 * 3600 * 1000), { hours: 24, minutes: 0, seconds: 0 });
    assert.deepEqual(splitCountdown(deadline, deadline - 90 * 1000), { hours: 0, minutes: 1, seconds: 30 });
    assert.deepEqual(splitCountdown(deadline, deadline + 1000), { hours: 0, minutes: 0, seconds: 0 });
  });
});

describe("streak restore — settings page wiring", () => {
  test("page offers the restore with a Counter countdown and a 3-per-month note", () => {
    const page = read("src/app/settings/page.tsx");
    assert.ok(page.includes("streak-restore"), "page must use the streak-restore lib");
    assert.ok(page.includes("getRestoreState"), "page must read the restore state");
    assert.ok(page.includes("splitCountdown"), "page must split the countdown");
    assert.ok(page.includes("handleRestore"), "page must offer a restore action");
    assert.ok(page.includes("markActive"), "restore must mark the missed day active");
    assert.ok(page.includes("Streak broken"), "page must name the broken streak");
    assert.ok(page.includes("restores used this month"), "page must show the monthly restore count");
    assert.ok(page.includes("MAX_RESTORES_PER_MONTH"), "page must show the 3-per-month cap");
    assert.ok(page.includes("24-hour restore window"), "page must explain the expired window");
    assert.ok(page.includes("No restores left"), "page must cover the monthly limit");
  });

  test("countdown is three odometer Counters (hrs/min/sec), zero-padded", () => {
    const page = read("src/app/settings/page.tsx");
    assert.ok(page.includes("CountdownUnit"), "page must render countdown units");
    assert.ok(page.includes("minDigits={2}"), "countdown digits must be zero-padded like a clock");
    assert.ok(page.includes("intro={false}"), "countdown must skip the intro spin so it reads at a glance");
    assert.ok(page.includes('label="hrs"'), "countdown must label hours");
    assert.ok(page.includes('label="min"'), "countdown must label minutes");
    assert.ok(page.includes('label="sec"'), "countdown must label seconds");
    assert.ok(page.includes("setInterval"), "countdown must tick every second");
    assert.ok(page.includes("Streak restored"), "page must confirm a restore");
    assert.ok(page.includes("initialProgress"), "streak must load in the initial state, not only in an effect");
  });
});
