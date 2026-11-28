import assert from "node:assert/strict";
import test from "node:test";

// Per-user progress sync — tests import the real modules (the repo
// already does this for editor utils: node 24 strips types).
import {
  bucketsFromRanges,
  clampRanges,
  dailySeconds,
  mergeActiveDates,
  mergeCompletedIds,
  mergeDailyProgress,
  mergeLessonProgress,
  mergeRanges,
  rangeWatchedSeconds,
  rangesFromBuckets,
} from "../src/lib/progress.ts";
import {
  createDebouncedSaver,
  loadServerProgress,
  mergeSnapshots,
  parseServerSnapshot,
  readLocalSnapshot,
  saveServerProgress,
  toWirePayload,
  writeLocalSnapshot,
} from "../src/lib/progress-sync.ts";
import {
  fetchServerProgress as fetchServerProgressFromStore,
  filterQualifiedCredited,
  saveServerProgress as saveServerProgressToStore,
  validateProgressPayload,
} from "../src/lib/progress-server.ts";

const LESSONS = [
  { id: "python-day-001", durationSeconds: 710 },
  { id: "python-day-002", durationSeconds: 600 },
];

const TODAY = new Date().toISOString().slice(0, 10);

/** Tiny in-memory localStorage stand-in. */
function fakeStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
    dump: () => Object.fromEntries(map),
  };
}

test("rangesFromBuckets coalesces consecutive seconds and sorts", () => {
  assert.deepEqual(rangesFromBuckets([5, 1, 2, 3, 9, 8, 2]), [
    [1, 3],
    [5, 5],
    [8, 9],
  ]);
  assert.deepEqual(rangesFromBuckets([]), []);
  assert.deepEqual(rangesFromBuckets([0]), [[0, 0]]);
  assert.deepEqual(rangesFromBuckets([1, -2, 2.5, "3", 3]), [[1, 1], [3, 3]]);
});

test("mergeRanges unions overlapping and adjacent ranges", () => {
  assert.deepEqual(mergeRanges([[0, 100]], [[50, 200]]), [[0, 200]]);
  assert.deepEqual(mergeRanges([[0, 10]], [[11, 20]]), [[0, 20]]);
  assert.deepEqual(mergeRanges([[0, 10]], [[30, 40]]), [[0, 10], [30, 40]]);
  assert.deepEqual(mergeRanges([], [[5, 5]]), [[5, 5]]);
});

test("rangeWatchedSeconds and bucketsFromRanges round-trip", () => {
  assert.equal(rangeWatchedSeconds([[0, 99], [200, 299]]), 200);
  assert.equal(rangeWatchedSeconds([]), 0);
  assert.deepEqual(bucketsFromRanges([[0, 2], [5, 5]]), [0, 1, 2, 5]);
  const buckets = [0, 1, 2, 3, 10, 11, 12];
  assert.deepEqual(bucketsFromRanges(rangesFromBuckets(buckets)), buckets);
});

test("clampRanges drops malformed pairs and clamps to the video length", () => {
  assert.deepEqual(clampRanges([[0, 800]], 710), [[0, 710]]);
  assert.deepEqual(clampRanges([[-5, 10]], 710), [[0, 10]]);
  assert.deepEqual(clampRanges([[50, 40]], 710), []);
  assert.deepEqual(clampRanges([["a", 10], [0, 5]], 710), [[0, 5]]);
  assert.deepEqual(clampRanges("nope", 710), []);
});

test("mergeLessonProgress unions coverage and recomputes the 95% rule", () => {
  // Device A watched the first half, device B the second half of a
  // 710s lesson: together they complete it (355 + 355 = 710 >= 95%).
  const merged = mergeLessonProgress(
    { ranges: [[0, 354]], testPassed: false, completed: false },
    { ranges: [[355, 709]], testPassed: true, completed: false },
    710
  );
  assert.deepEqual(merged.ranges, [[0, 709]]);
  assert.equal(merged.watchedSeconds, 710);
  assert.equal(merged.completed, true);
  assert.equal(merged.testPassed, true);

  const half = mergeLessonProgress(
    { ranges: [[0, 354]], testPassed: false, completed: false },
    { ranges: [], testPassed: false, completed: false },
    710
  );
  assert.equal(half.completed, false);
  assert.equal(half.watchedSeconds, 355);
});

test("mergeLessonProgress never trusts a stored completed flag when the duration is known", () => {
  const forged = mergeLessonProgress(
    { ranges: [[0, 70]], testPassed: false, completed: true },
    { ranges: [], testPassed: false, completed: true },
    710
  );
  assert.equal(forged.completed, false);
  // Exactly 95% qualifies (675 of 710 = 95.07%).
  assert.equal(
    mergeLessonProgress({ ranges: [[0, 674]], testPassed: false }, { ranges: [], testPassed: false }, 710)
      .completed,
    true
  );
  // 94.9% does not (674 of 710 is 94.9% — one second short).
  assert.equal(
    mergeLessonProgress({ ranges: [[0, 673]], testPassed: false }, { ranges: [], testPassed: false }, 710)
      .completed,
    false
  );
});

test("mergeLessonProgress falls back to OR of completed flags with no known duration", () => {
  // A bare YouTube id has no catalog duration: completion is the OR.
  const merged = mergeLessonProgress(
    { ranges: [[0, 100]], testPassed: false, completed: true },
    { ranges: [[50, 200]], testPassed: false, completed: false },
    0
  );
  assert.deepEqual(merged.ranges, [[0, 200]]);
  assert.equal(merged.completed, true);
  const neither = mergeLessonProgress(
    { ranges: [[0, 100]], testPassed: false, completed: false },
    { ranges: [], testPassed: false, completed: false },
    0
  );
  assert.equal(neither.completed, false);
});

test("mergeDailyProgress unions credited lessons without double-counting", () => {
  const local = {
    date: TODAY,
    goalMinutes: 30,
    credited: [{ lessonId: "python-day-001", seconds: 710 }],
  };
  const server = {
    date: TODAY,
    goalMinutes: 45,
    credited: [
      { lessonId: "python-day-001", seconds: 700 },
      { lessonId: "python-day-002", seconds: 600 },
    ],
  };
  const merged = mergeDailyProgress(local, server);
  assert.equal(merged.date, TODAY);
  assert.equal(merged.goalMinutes, 45); // server's goal wins on load
  assert.deepEqual(merged.credited, [
    { lessonId: "python-day-001", seconds: 710 },
    { lessonId: "python-day-002", seconds: 600 },
  ]);
  assert.equal(dailySeconds(merged.credited), 1310);
  assert.equal(dailySeconds([]), 0);
});

test("mergeDailyProgress ignores a server row for another date", () => {
  const local = { date: TODAY, goalMinutes: 30, credited: [] };
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  assert.equal(mergeDailyProgress(local, { date: yesterday, goalMinutes: 45, credited: [] }), null);
  assert.equal(mergeDailyProgress(local, null), null);
});

test("mergeActiveDates and mergeCompletedIds union and cap", () => {
  assert.deepEqual(mergeActiveDates(["2026-11-10"], ["2026-11-11", "2026-11-10"]), [
    "2026-11-10",
    "2026-11-11",
  ]);
  assert.deepEqual(mergeCompletedIds(["python-home", "python-intro"], ["python-intro", "python-lists"]), [
    "python-home",
    "python-intro",
    "python-lists",
  ]);
});

test("filterQualifiedCredited drops credits for unqualified lessons", () => {
  const credited = [
    { lessonId: "python-day-001", seconds: 710 },
    { lessonId: "python-day-002", seconds: 600 },
  ];
  const kept = filterQualifiedCredited(credited, (id) => id === "python-day-001");
  assert.deepEqual(kept, [{ lessonId: "python-day-001", seconds: 710 }]);
  assert.deepEqual(filterQualifiedCredited(credited, () => false), []);
});

test("validateProgressPayload accepts a well-formed payload", () => {
  const result = validateProgressPayload(
    {
      lessons: [{ lessonId: "python-day-001", ranges: [[0, 709]], testPassed: false, completed: true }],
      daily: {
        date: TODAY,
        goalMinutes: 30,
        credited: [{ lessonId: "python-day-001", seconds: 710 }],
      },
      activeDates: [TODAY],
      completedIds: ["python-home"],
    },
    LESSONS,
    new Set(["python-home", "python-intro"])
  );
  assert.equal(result.ok, true);
  assert.deepEqual(result.payload.lessons, [
    { lessonId: "python-day-001", ranges: [[0, 709]], testPassed: false, completed: true },
  ]);
  assert.deepEqual(result.payload.completedIds, ["python-home"]);
  // A client-sent `seconds` total is ignored — the server recomputes it.
  assert.equal("seconds" in (result.payload.daily ?? {}), false);
});

test("validateProgressPayload rejects junk", () => {
  assert.equal(validateProgressPayload(null, LESSONS).ok, false);
  assert.equal(validateProgressPayload("nope", LESSONS).ok, false);
  assert.equal(
    validateProgressPayload(
      { lessons: [{ lessonId: "bad id!", ranges: [], testPassed: false }] },
      LESSONS
    ).ok,
    false
  );
  assert.equal(
    validateProgressPayload(
      { lessons: [{ lessonId: "python-day-001", ranges: [], testPassed: "yes" }] },
      LESSONS
    ).ok,
    false
  );
  assert.equal(
    validateProgressPayload(
      {
        lessons: Array.from({ length: 501 }, () => ({
          lessonId: "python-day-001",
          ranges: [],
          testPassed: false,
        })),
      },
      LESSONS
    ).ok,
    false
  );
  assert.equal(
    validateProgressPayload({ daily: { date: "2020-01-01", goalMinutes: 30, credited: [] } }, LESSONS)
      .ok,
    false
  );
  assert.equal(
    validateProgressPayload({ daily: { date: TODAY, goalMinutes: 0, credited: [] } }, LESSONS).ok,
    false
  );
  assert.equal(
    validateProgressPayload(
      { daily: { date: TODAY, goalMinutes: 30, credited: [{ lessonId: "bad id!", seconds: 1 }] } },
      LESSONS
    ).ok,
    false
  );
  assert.equal(validateProgressPayload({ activeDates: ["not-a-date"] }, LESSONS).ok, false);
  assert.equal(
    validateProgressPayload({ completedIds: ["python-nope"] }, LESSONS, new Set(["python-home"])).ok,
    false
  );
});

test("validateProgressPayload clamps ranges and credited seconds to the lesson length", () => {
  const result = validateProgressPayload(
    {
      lessons: [{ lessonId: "python-day-001", ranges: [[0, 5000]], testPassed: false }],
      daily: {
        date: TODAY,
        goalMinutes: 30,
        credited: [{ lessonId: "python-day-001", seconds: 99999 }],
      },
    },
    LESSONS
  );
  assert.equal(result.ok, true);
  assert.deepEqual(result.payload.lessons[0].ranges, [[0, 710]]);
  assert.equal(result.payload.daily.credited[0].seconds, 710);
});

test("validateProgressPayload accepts an unknown-duration id, clamped to 24h", () => {
  // A bare YouTube id is not in any catalog — it still syncs, clamped.
  const result = validateProgressPayload(
    { lessons: [{ lessonId: "dQw4w9WgXcQ", ranges: [[0, 200000]], testPassed: false }] },
    LESSONS
  );
  assert.equal(result.ok, true);
  assert.deepEqual(result.payload.lessons[0].ranges, [[0, 86400]]);
});

test("read/write/merge snapshots round-trip across devices", () => {
  // Device A: watched the first half of day-001 — not qualified, so
  // nothing credited yet — and completed the python-home text lesson.
  const storeA = fakeStorage({
    lp_progress_v1: JSON.stringify({
      date: TODAY,
      seconds: 0,
      goalMinutes: 30,
      activeDates: [TODAY],
      creditedLessonIds: [],
    }),
    "lp_coverage_python-day-001": JSON.stringify(Array.from({ length: 355 }, (_, i) => i)),
    lp_learn_completed: JSON.stringify(["python-home"]),
    lp_completed_lessons: JSON.stringify([]),
  });
  const localA = readLocalSnapshot(storeA.getItem, LESSONS, TODAY);
  assert.deepEqual(localA.coverage["python-day-001"], [[0, 354]]);
  assert.deepEqual(localA.learnCompletedIds, ["python-home"]);

  // Device B (the server copy): the second half, also unqualified, and
  // the python-intro text lesson.
  const server = {
    lessons: [
      { lessonId: "python-day-001", ranges: [[355, 709]], testPassed: false, completed: false },
    ],
    dailyRows: [{ date: TODAY, goalMinutes: 45, credited: [] }],
    activeDates: [TODAY],
    completedIds: ["python-intro"],
  };
  const merged = mergeSnapshots(localA, server, LESSONS);
  // Union of halves completes the lesson (710s >= 95%).
  assert.deepEqual(merged.coverage["python-day-001"], [[0, 709]]);
  assert.deepEqual(merged.completedLessonIds, ["python-day-001"]);
  assert.deepEqual(merged.learnCompletedIds, ["python-home", "python-intro"]);
  assert.equal(merged.progress.goalMinutes, 45); // server goal wins on load
  // The merge itself completed the lesson, so it is credited to today
  // with its merged watched seconds — neither half alone qualified.
  assert.equal(merged.progress.seconds, 710);
  assert.deepEqual(merged.progress.creditedLessonIds, ["python-day-001"]);

  // Write back and re-read: the merged state survives.
  const storeB = fakeStorage();
  writeLocalSnapshot(storeB.setItem, storeB.removeItem, merged, LESSONS);
  const reRead = readLocalSnapshot(storeB.getItem, LESSONS, TODAY);
  assert.deepEqual(reRead.coverage["python-day-001"], [[0, 709]]);
  assert.deepEqual(reRead.learnCompletedIds, ["python-home", "python-intro"]);
  assert.deepEqual(reRead.completedLessonIds, ["python-day-001"]);
  assert.equal(reRead.progress.seconds, 710);

  // Wire payload survives a JSON round-trip through parseServerSnapshot.
  const wire = toWirePayload(merged);
  const parsed = parseServerSnapshot({
    synced: true,
    lessons: wire.lessons,
    dailyRows: [wire.daily],
    activeDates: wire.activeDates,
    completedIds: wire.completedIds,
  });
  assert.notEqual(parsed, null);
  assert.deepEqual(parsed.completedIds, ["python-home", "python-intro"]);
  assert.equal(parsed.lessons[0].completed, true);
});

test("mergeSnapshots never re-credits a lesson completed long ago", () => {
  const store = fakeStorage({
    lp_progress_v1: JSON.stringify({
      date: TODAY,
      seconds: 0,
      goalMinutes: 30,
      activeDates: [TODAY],
      creditedLessonIds: [],
    }),
    "lp_coverage_python-day-001": JSON.stringify(Array.from({ length: 710 }, (_, i) => i)),
    lp_learn_completed: JSON.stringify([]),
    lp_completed_lessons: JSON.stringify(["python-day-001"]),
  });
  const local = readLocalSnapshot(store.getItem, LESSONS, TODAY);
  const merged = mergeSnapshots(
    local,
    { lessons: [], dailyRows: [], activeDates: [], completedIds: [] },
    LESSONS
  );
  assert.deepEqual(merged.completedLessonIds, ["python-day-001"]);
  assert.equal(merged.progress.seconds, 0); // completed last week — not today's minutes
  assert.deepEqual(merged.progress.creditedLessonIds, []);
});

test("parseServerSnapshot drops malformed entries instead of failing", () => {
  assert.equal(parseServerSnapshot(null), null);
  assert.equal(parseServerSnapshot({ synced: false }), null);
  const parsed = parseServerSnapshot({
    synced: true,
    lessons: [
      { lessonId: "python-day-001", ranges: [[0, 10]], testPassed: false },
      { lessonId: "bad", ranges: "nope" },
      { lessonId: 42, ranges: [] },
    ],
    dailyRows: [{ date: TODAY, goalMinutes: 30, credited: [] }],
    activeDates: [TODAY, "junk"],
    completedIds: ["python-home", 7],
  });
  assert.equal(parsed.lessons.length, 1);
  assert.deepEqual(parsed.activeDates, [TODAY]);
  assert.deepEqual(parsed.completedIds, ["python-home"]);
});

test("load/saveServerProgress fail soft without a server", async () => {
  // No /api/progress in the node test env — both resolve, never throw.
  assert.equal(await loadServerProgress(), null);
  const local = readLocalSnapshot(() => null, LESSONS, TODAY);
  assert.equal(await saveServerProgress(local), false);
});

test("createDebouncedSaver debounces, flushes and cancels", async () => {
  let calls = 0;
  const saver = createDebouncedSaver(() => {
    calls += 1;
  }, 10);
  saver.schedule();
  saver.schedule();
  saver.schedule();
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(calls, 1);
  saver.schedule();
  saver.flush();
  assert.equal(calls, 2);
  saver.schedule();
  saver.cancel();
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(calls, 2);
});

/** In-memory Supabase stand-in: enough of the query builder for the store fns. */
function fakeSupabase() {
  const tables = { lp_user_progress: [], lp_user_daily: [] };
  class Query {
    constructor(table) {
      this.table = table;
      this.filters = [];
      this.orderCol = null;
      this.asc = true;
      this.limitN = null;
    }
    select() {
      return this;
    }
    eq(col, val) {
      this.filters.push([col, val]);
      return this;
    }
    order(col, { ascending }) {
      this.orderCol = col;
      this.asc = ascending;
      return this;
    }
    limit(n) {
      this.limitN = n;
      return this;
    }
    rows() {
      let rows = tables[this.table].filter((r) =>
        this.filters.every(([c, v]) => r[c] === v)
      );
      if (this.orderCol) {
        rows = [...rows].sort((a, b) =>
          this.asc
            ? a[this.orderCol] < b[this.orderCol]
              ? -1
              : 1
            : a[this.orderCol] > b[this.orderCol]
              ? -1
              : 1
        );
      }
      if (this.limitN !== null) rows = rows.slice(0, this.limitN);
      return rows;
    }
    async maybeSingle() {
      const rows = this.rows();
      return { data: rows[0] ?? null, error: null };
    }
    async upsert(rows, { onConflict, ignoreDuplicates } = {}) {
      // Supabase accepts a single row object or an array of rows.
      const list = Array.isArray(rows) ? rows : [rows];
      const keys = onConflict ? onConflict.split(",") : [];
      for (const row of list) {
        const idx = tables[this.table].findIndex((r) => keys.every((k) => r[k] === row[k]));
        if (idx >= 0) {
          if (!ignoreDuplicates) tables[this.table][idx] = { ...tables[this.table][idx], ...row };
        } else {
          tables[this.table].push({ ...row });
        }
      }
      return { error: null };
    }
    then(resolve, reject) {
      try {
        resolve({ data: this.rows(), error: null });
      } catch (err) {
        reject(err);
      }
    }
  }
  return { from: (table) => new Query(table) };
}

test("saveServerProgress then fetchServerProgress round-trips through a fake store", async () => {
  const client = fakeSupabase();
  const email = "maalik@example.com";
  const payload = {
    lessons: [
      { lessonId: "python-day-001", ranges: [[0, 709]], testPassed: false, completed: true },
      { lessonId: "python-day-002", ranges: [[0, 299]], testPassed: false, completed: false },
    ],
    daily: {
      date: TODAY,
      goalMinutes: 30,
      credited: [{ lessonId: "python-day-001", seconds: 710 }],
    },
    activeDates: [TODAY],
    completedIds: ["python-home"],
  };
  assert.equal(await saveServerProgressToStore(client, email, payload, LESSONS), true);
  const snap = await fetchServerProgressFromStore(client, email);
  assert.notEqual(snap, null);
  const byId = new Map(snap.lessons.map((l) => [l.lessonId, l]));
  assert.equal(byId.get("python-day-001").completed, true);
  assert.equal(byId.get("python-day-002").completed, false);
  // Only the qualified lesson stays credited; the daily total is its seconds.
  assert.deepEqual(snap.dailyRows[0].credited, [{ lessonId: "python-day-001", seconds: 710 }]);
  assert.deepEqual(snap.activeDates, [TODAY]);
  // The manually completed text lesson comes back as a completedId.
  assert.deepEqual(snap.completedIds, ["python-home"]);
  // Another user sees nothing.
  const other = await fetchServerProgressFromStore(client, "someone-else@example.com");
  assert.deepEqual(other.lessons, []);
  assert.deepEqual(other.completedIds, []);
});

test("two devices saving halves merge on the server without double-counting", async () => {
  const client = fakeSupabase();
  const email = "maalik@example.com";
  const saveHalf = (ranges) =>
    saveServerProgressToStore(
      client,
      email,
      {
        lessons: [
          { lessonId: "python-day-001", ranges, testPassed: false, completed: false },
        ],
        daily: {
          date: TODAY,
          goalMinutes: 30,
          credited: [{ lessonId: "python-day-001", seconds: 355 }],
        },
        activeDates: [TODAY],
        completedIds: [],
      },
      LESSONS
    );
  assert.equal(await saveHalf([[0, 354]]), true);
  assert.equal(await saveHalf([[355, 709]]), true);
  const snap = await fetchServerProgressFromStore(client, email);
  assert.deepEqual(snap.lessons[0].ranges, [[0, 709]]);
  assert.equal(snap.lessons[0].completed, true);
  // Device B only credited its own 355s, but this save is what completed
  // the lesson — the server bumps the credit to the full merged 710s.
  assert.deepEqual(snap.dailyRows[0].credited, [{ lessonId: "python-day-001", seconds: 710 }]);
  const local = readLocalSnapshot(() => null, LESSONS, TODAY);
  const merged = mergeSnapshots(local, snap, LESSONS);
  assert.equal(merged.progress.seconds, 710);
  const back = validateProgressPayload(toWirePayload(merged), LESSONS);
  assert.equal(back.ok, true);
  assert.equal(await saveServerProgressToStore(client, email, back.payload, LESSONS), true);
  const snap2 = await fetchServerProgressFromStore(client, email);
  assert.deepEqual(snap2.dailyRows[0].credited, [{ lessonId: "python-day-001", seconds: 710 }]);
});

test("fetchServerProgress returns null and saveServerProgress false when the store errors", async () => {
  const broken = {
    from: () => {
      throw new Error("boom");
    },
  };
  assert.equal(await fetchServerProgressFromStore(broken, "a@b.c"), null);
  assert.equal(
    await saveServerProgressToStore(
      broken,
      "a@b.c",
      { lessons: [], daily: null, activeDates: [], completedIds: [] },
      LESSONS
    ),
    false
  );
});
