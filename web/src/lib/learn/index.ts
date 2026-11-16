// Merges the per-section Learn content files into one lookup.
// Tutorial files export `TUTORIALS: LearnTutorial[]` for their topics;
// reference files export `REFERENCES: LearnReference[]`. This file
// only combines them, so writers never touch it.

import type { LearnReference, LearnTutorial } from "./types";
import { TUTORIALS as BASICS } from "./learn-basics";
import { TUTORIALS as FUNCTIONS_ADVANCED } from "./learn-functions-advanced";
import { TUTORIALS as CLASSES } from "./learn-classes";
import { TUTORIALS as FILE_MODULES } from "./learn-file-modules";
import { TUTORIALS as MATPLOTLIB } from "./learn-matplotlib";
import { TUTORIALS as ML } from "./learn-ml";
import { TUTORIALS as DSA } from "./learn-dsa";
import { TUTORIALS as DATABASES } from "./learn-databases";
import { REFERENCES as BUILTINS } from "./ref-builtins";
import { REFERENCES as STRING_METHODS } from "./ref-string-methods";
import { REFERENCES as COLLECTION_METHODS } from "./ref-collection-methods";
import { REFERENCES as FILE_KEYWORDS } from "./ref-file-keywords";
import { REFERENCES as MODULES } from "./ref-modules";

export type { LearnReference, LearnTutorial, TutorialBlock } from "./types";

export const ALL_TUTORIALS: LearnTutorial[] = [
  ...BASICS,
  ...FUNCTIONS_ADVANCED,
  ...CLASSES,
  ...FILE_MODULES,
  ...MATPLOTLIB,
  ...ML,
  ...DSA,
  ...DATABASES,
].sort((a, b) => a.slug.localeCompare(b.slug));

export const ALL_REFERENCES: LearnReference[] = [
  ...BUILTINS,
  ...STRING_METHODS,
  ...COLLECTION_METHODS,
  ...FILE_KEYWORDS,
  ...MODULES,
].sort((a, b) => a.slug.localeCompare(b.slug));

const TUTORIAL_BY_SLUG = new Map<string, LearnTutorial>(
  ALL_TUTORIALS.map((t) => [t.slug, t])
);
const REFERENCE_BY_SLUG = new Map<string, LearnReference>(
  ALL_REFERENCES.map((r) => [r.slug, r])
);

/** Full written tutorial for a topic slug, or null when not written yet. */
export function getLearnTutorial(slug: string): LearnTutorial | null {
  return TUTORIAL_BY_SLUG.get(slug) ?? null;
}

/** Short reference entry for a slug, or null when not written yet. */
export function getLearnReference(slug: string): LearnReference | null {
  return REFERENCE_BY_SLUG.get(slug) ?? null;
}

export function tutorialCount(): number {
  return ALL_TUTORIALS.length;
}

export function referenceCount(): number {
  return ALL_REFERENCES.length;
}
