import assert from "node:assert/strict";
import test from "node:test";

// Inline pure helpers for zero-build node --test verification
// (mirrors web/src/lib/roadmap.ts)

const ROADMAP_STAGES = [
  { id: "basics", title: "Basics", startDay: 1, endDay: 19 },
  { id: "functions", title: "Functions & Collections", startDay: 20, endDay: 30 },
  { id: "data", title: "Data Structures & Errors", startDay: 31, endDay: 39 },
  { id: "intermediate", title: "Intermediate Python", startDay: 40, endDay: 55 },
  { id: "oop", title: "Object-Oriented Programming", startDay: 56, endDay: 83 },
  { id: "advanced", title: "Advanced & Projects", startDay: 84, endDay: 100 },
];

function dayNumberOf(lesson) {
  const m = /^python-day-(\d+)$/.exec(lesson.id);
  return m ? parseInt(m[1], 10) : null;
}

function extrasOf(lessons) {
  return lessons.filter((l) => l.id.startsWith("python-extra-"));
}

function buildRoadmapStages(lessons, completedIds) {
  return ROADMAP_STAGES.map((def) => {
    const stageLessons = lessons.filter((l) => {
      const d = dayNumberOf(l);
      return d !== null && d >= def.startDay && d <= def.endDay;
    });
    const completedCount = stageLessons.filter((l) => completedIds.includes(l.id)).length;
    const percent =
      stageLessons.length === 0
        ? 0
        : Math.round((completedCount / stageLessons.length) * 100);
    const nextLesson = stageLessons.find((l) => !completedIds.includes(l.id)) ?? null;
    return { ...def, lessons: stageLessons, completedCount, percent, nextLesson };
  });
}

function makeLessons() {
  const lessons = [];
  for (let day = 1; day <= 100; day += 1) {
    lessons.push({
      id: `python-day-${String(day).padStart(3, "0")}`,
      title: `Day ${day}`,
      moduleTitle: "100 Days of Code",
      courseTitle: "Python for Beginners (Full Course)",
      durationSeconds: 600,
      videoUrl: "",
      videoSource: "mega",
      notes: "",
    });
  }
  lessons.push(
    { id: "python-extra-001", title: "Crash", durationSeconds: 900, videoUrl: "", videoSource: "mega" },
    { id: "python-extra-002", title: "Roadmap", durationSeconds: 700, videoUrl: "", videoSource: "mega" },
    { id: "python-extra-003", title: "Full course", durationSeconds: 39000, videoUrl: "", videoSource: "mega" }
  );
  return lessons;
}

test("100 day-lessons split into 6 stages with the honest day ranges", () => {
  const stages = buildRoadmapStages(makeLessons(), []);
  assert.equal(stages.length, 6);
  assert.deepEqual(
    stages.map((s) => s.lessons.length),
    [19, 11, 9, 16, 28, 17]
  );
  assert.equal(stages.reduce((n, s) => n + s.lessons.length, 0), 100);
  // Stage boundaries follow the titles: Day 20 is Functions, Day 56 is OOP.
  assert.equal(stages[1].lessons[0].id, "python-day-020");
  assert.equal(stages[4].lessons[0].id, "python-day-056");
  assert.equal(stages[5].lessons.at(-1).id, "python-day-100");
});

test("extras are kept out of the stages", () => {
  const lessons = makeLessons();
  assert.equal(extrasOf(lessons).length, 3);
  const stages = buildRoadmapStages(lessons, []);
  assert.equal(stages.reduce((n, s) => n + s.lessons.length, 0), 100);
});

test("percent and next lesson follow the completed ids", () => {
  const lessons = makeLessons();
  const done = ["python-day-001", "python-day-002", "python-day-020"];
  const stages = buildRoadmapStages(lessons, done);
  const basics = stages[0];
  assert.equal(basics.completedCount, 2);
  assert.equal(basics.percent, Math.round((2 / 19) * 100));
  assert.equal(basics.nextLesson.id, "python-day-003");
  const functions = stages[1];
  assert.equal(functions.completedCount, 1);
  assert.equal(functions.nextLesson.id, "python-day-021");
});

test("a fully completed stage has 100% and no next lesson", () => {
  const lessons = makeLessons();
  const done = [];
  for (let day = 31; day <= 39; day += 1) done.push(`python-day-${String(day).padStart(3, "0")}`);
  const stages = buildRoadmapStages(lessons, done);
  assert.equal(stages[2].percent, 100);
  assert.equal(stages[2].nextLesson, null);
  assert.equal(stages[0].percent, 0);
  assert.equal(stages[0].nextLesson.id, "python-day-001");
});

test("dayNumberOf returns null for extras and unknown ids", () => {
  assert.equal(dayNumberOf({ id: "python-extra-001" }), null);
  assert.equal(dayNumberOf({ id: "something-else" }), null);
  assert.equal(dayNumberOf({ id: "python-day-042" }), 42);
});
