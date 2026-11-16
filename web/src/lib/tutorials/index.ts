// Merges the per-stage tutorial content files into one lookup.
// Stage files export `TUTORIALS: LessonTutorial[]` for their days;
// this file only combines them, so writers never touch it.

import type { LessonTutorial } from "./types";
import { TUTORIALS as BASICS } from "./stage-basics";
import { TUTORIALS as FUNCTIONS } from "./stage-functions";
import { TUTORIALS as DATA } from "./stage-data";
import { TUTORIALS as INTERMEDIATE } from "./stage-intermediate";
import { TUTORIALS as OOP } from "./stage-oop";
import { TUTORIALS as ADVANCED } from "./stage-advanced";

export type { LessonTutorial, TutorialBlock } from "./types";

export const ALL_TUTORIALS: LessonTutorial[] = [
  ...BASICS,
  ...FUNCTIONS,
  ...DATA,
  ...INTERMEDIATE,
  ...OOP,
  ...ADVANCED,
].sort((a, b) => a.day - b.day);

const BY_DAY = new Map<number, LessonTutorial>(
  ALL_TUTORIALS.map((t) => [t.day, t])
);

/** Full text tutorial for a day (1-100), or null when not written yet. */
export function getTutorial(day: number): LessonTutorial | null {
  return BY_DAY.get(day) ?? null;
}

/** How many of the 100 lessons have written tutorials. */
export function tutorialCount(): number {
  return ALL_TUTORIALS.length;
}
