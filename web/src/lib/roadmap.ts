// Roadmap stages for the 100-day course.
//
// The day ranges are derived from the ACTUAL lesson titles in catalog.ts
// (read 2026-11-13), not guessed:
//   Day 1-19: intro, first program, variables, strings, if-else, loops
//   Day 20-30: functions, lists, tuples, f-strings, recursion
//   Day 31-39: sets, dictionaries, exception handling
//   Day 40-55: modules, file IO, lambda, map/filter/reduce
//   Day 56-83: classes, inheritance, decorators, dunder methods
//   Day 84-100: requests, generators, regex, asyncio, threading,
//     multiprocessing, final projects
// If the catalog order ever changes, update the ranges here to match.

import type { Lesson } from "./catalog";

export interface StageColor {
  /** Gradient stops for accents, progress bars and badges. */
  from: string;
  to: string;
  /** Soft translucent tint for card glows and hover states. */
  soft: string;
  /** Solid color for small text accents (on the dark background). */
  text: string;
}

export interface RoadmapStageDef {
  id: string;
  title: string;
  subtitle: string;
  startDay: number;
  endDay: number;
  /** One distinct color per stage — the roadmap's color theme. */
  color: StageColor;
}

export interface RoadmapStage extends RoadmapStageDef {
  lessons: Lesson[];
  completedCount: number;
  percent: number;
  /** True when EVERY lesson in the stage is completed (95% watched). */
  complete: boolean;
  /** First uncompleted lesson in the stage, or null when all are done. */
  nextLesson: Lesson | null;
}

export const ROADMAP_STAGES: RoadmapStageDef[] = [
  {
    id: "basics",
    title: "Basics",
    subtitle: "Intro, variables, strings, conditionals & loops",
    startDay: 1,
    endDay: 19,
    color: { from: "#7aa2f7", to: "#5b7fd4", soft: "rgba(122,162,247,0.10)", text: "#a8c3f7" },
  },
  {
    id: "functions",
    title: "Functions & Collections",
    subtitle: "Functions, lists, tuples, f-strings & recursion",
    startDay: 20,
    endDay: 30,
    color: { from: "#7ec8a9", to: "#4e9c7c", soft: "rgba(126,200,169,0.10)", text: "#a5d8c0" },
  },
  {
    id: "data",
    title: "Data Structures & Errors",
    subtitle: "Sets, dictionaries & exception handling",
    startDay: 31,
    endDay: 39,
    color: { from: "#d9a05b", to: "#b57e3a", soft: "rgba(217,160,91,0.10)", text: "#e8c491" },
  },
  {
    id: "intermediate",
    title: "Intermediate Python",
    subtitle: "Modules, file IO, lambda & map/filter/reduce",
    startDay: 40,
    endDay: 55,
    color: { from: "#b49ae0", to: "#8b6cc0", soft: "rgba(180,154,224,0.10)", text: "#cdbcf0" },
  },
  {
    id: "oop",
    title: "Object-Oriented Programming",
    subtitle: "Classes, inheritance, decorators & dunder methods",
    startDay: 56,
    endDay: 83,
    color: { from: "#e08ba0", to: "#c06a80", soft: "rgba(224,139,160,0.10)", text: "#f0b3c2" },
  },
  {
    id: "advanced",
    title: "Advanced & Projects",
    subtitle: "Requests, generators, regex, asyncio & final projects",
    startDay: 84,
    endDay: 100,
    color: { from: "#6fc3c9", to: "#4a9aa0", soft: "rgba(111,195,201,0.10)", text: "#9ed6da" },
  },
];

// What each extra video is for (ids from catalog.ts).
export const EXTRA_ROLES: Record<string, { role: string; blurb: string }> = {
  "python-extra-001": {
    role: "Quick start",
    blurb: "The whole course in 15 minutes — watch this first for the big picture.",
  },
  "python-extra-002": {
    role: "How to learn",
    blurb: "The full roadmap from zero to expert — how the 100 days fit together.",
  },
  "python-extra-003": {
    role: "Alternate path",
    blurb: "The complete 11-hour course — a second way through the same topics.",
  },
};

/** Day number for a 100-day lesson (python-day-001..100), null otherwise. */
export function dayNumberOf(lesson: Lesson): number | null {
  const m = /^python-day-(\d+)$/.exec(lesson.id);
  return m ? parseInt(m[1], 10) : null;
}

/** The 3 extra videos (python-extra-001..003), in catalog order. */
export function extrasOf(lessons: Lesson[]): Lesson[] {
  return lessons.filter((l) => l.id.startsWith("python-extra-"));
}

export function buildRoadmapStages(
  lessons: Lesson[],
  completedIds: string[]
): RoadmapStage[] {
  return ROADMAP_STAGES.map((def) => {
    const stageLessons = lessons.filter((l) => {
      const d = dayNumberOf(l);
      return d !== null && d >= def.startDay && d <= def.endDay;
    });
    const completedCount = stageLessons.filter((l) =>
      completedIds.includes(l.id)
    ).length;
    const percent =
      stageLessons.length === 0
        ? 0
        : Math.round((completedCount / stageLessons.length) * 100);
    const nextLesson =
      stageLessons.find((l) => !completedIds.includes(l.id)) ?? null;
    // A stage is complete only when it has lessons AND all of them are
    // done. Completion is stage-by-stage — there is no single "course
    // complete" gate; the course is finished one stage at a time.
    const complete =
      stageLessons.length > 0 && completedCount === stageLessons.length;
    return {
      ...def,
      lessons: stageLessons,
      completedCount,
      percent,
      complete,
      nextLesson,
    };
  });
}

/**
 * The current stage: the FIRST incomplete stage (the one the learner is
 * working through now). Null when every stage is complete. Extras never
 * count — they are shortcuts, not a stage.
 */
export function currentStage(stages: RoadmapStage[]): RoadmapStage | null {
  return stages.find((s) => !s.complete) ?? null;
}

/** How many of the 6 stages are complete. */
export function completedStageCount(stages: RoadmapStage[]): number {
  return stages.filter((s) => s.complete).length;
}
