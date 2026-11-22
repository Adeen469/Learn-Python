// Per-lesson Learn content — loads ONE chunk per lookup, never
// the whole corpus.
//
// Tutorial files export `TUTORIALS: LearnTutorial[]` for their
// topics; reference files export `REFERENCES: LearnReference[]`.
// Nothing here statically imports them: each chunk is fetched with
// a dynamic import() the first time a slug inside it is requested,
// then cached. The lesson page only ever needs one lesson, so it
// only ever downloads one chunk.
//
// Slug -> chunk comes from the sidebar, which the lesson page and
// sidebar already import (zero new bundle weight): every sidebar
// topic carries its sectionId + groupTitle, and every sidebar group
// lives in exactly one corpus file (verified by
// tests/learn-content.test.mjs — a topic added to a new group, or a
// group moved to another file, fails that test instead of silently
// resolving to the wrong chunk). Most sections map 1:1 to a chunk;
// the two split sections (python-tutorial, python-reference) are
// resolved per group in GROUP_CHUNK below.

import type { LearnReference, LearnTutorial } from "./types";
import { ALL_LEARN_TOPICS } from "./sidebar";

export type { LearnReference, LearnTutorial, TutorialBlock } from "./types";

type TutorialChunkId =
  | "learn-basics"
  | "learn-functions-advanced"
  | "learn-classes"
  | "learn-file-modules"
  | "learn-matplotlib"
  | "learn-ml"
  | "learn-dsa"
  | "learn-databases";

type ReferenceChunkId =
  | "ref-builtins"
  | "ref-string-methods"
  | "ref-collection-methods"
  | "ref-file-keywords"
  | "ref-modules";

type ChunkId = TutorialChunkId | ReferenceChunkId;

const TUTORIAL_CHUNKS: ReadonlySet<ChunkId> = new Set<TutorialChunkId>([
  "learn-basics",
  "learn-functions-advanced",
  "learn-classes",
  "learn-file-modules",
  "learn-matplotlib",
  "learn-ml",
  "learn-dsa",
  "learn-databases",
]);

// Chunk for a whole section, unless the topic's group overrides it.
const SECTION_CHUNK: Record<string, ChunkId> = {
  "python-tutorial": "learn-basics",
  "python-classes": "learn-classes",
  "file-handling": "learn-file-modules",
  "python-modules": "learn-file-modules",
  "python-matplotlib": "learn-matplotlib",
  "machine-learning": "learn-ml",
  "python-dsa": "learn-dsa",
  "python-mysql": "learn-databases",
  "python-mongodb": "learn-databases",
  "python-cert": "learn-file-modules",
  "python-how-to": "learn-file-modules",
  "python-examples": "learn-file-modules",
  "python-reference": "ref-file-keywords",
  "module-reference": "ref-modules",
};

// Groups that live in a different chunk than their section default.
// Keyed by "sectionId::groupTitle" so a group title reused in
// another section can never resolve to the wrong chunk.
const GROUP_CHUNK: Record<string, ChunkId> = {
  // python-tutorial past "Python For Loops" lives in the advanced file.
  "python-tutorial::Python Functions": "learn-functions-advanced",
  "python-tutorial::Python Range": "learn-functions-advanced",
  "python-tutorial::Python Arrays": "learn-functions-advanced",
  "python-tutorial::Python Iterators": "learn-functions-advanced",
  "python-tutorial::Python Modules": "learn-functions-advanced",
  "python-tutorial::Python Dates": "learn-functions-advanced",
  "python-tutorial::Python Math": "learn-functions-advanced",
  "python-tutorial::Python JSON": "learn-functions-advanced",
  "python-tutorial::Python RegEx": "learn-functions-advanced",
  "python-tutorial::Python PIP": "learn-functions-advanced",
  "python-tutorial::Python Try...Except": "learn-functions-advanced",
  "python-tutorial::Python String Formatting": "learn-functions-advanced",
  "python-tutorial::Python None": "learn-functions-advanced",
  "python-tutorial::Python User Input": "learn-functions-advanced",
  "python-tutorial::Python VirtualEnv": "learn-functions-advanced",
  // python-reference splits across the four reference files.
  "python-reference::Python Built-in Functions": "ref-builtins",
  "python-reference::Python String Methods": "ref-string-methods",
  "python-reference::Python List Methods": "ref-collection-methods",
  "python-reference::Python Dictionary Methods": "ref-collection-methods",
  "python-reference::Python Tuple Methods": "ref-collection-methods",
  "python-reference::Python Set Methods": "ref-collection-methods",
};

const CHUNK_BY_SLUG = new Map<string, ChunkId>();
for (const t of ALL_LEARN_TOPICS) {
  const chunk =
    GROUP_CHUNK[`${t.sectionId}::${t.groupTitle}`] ?? SECTION_CHUNK[t.sectionId];
  if (chunk) CHUNK_BY_SLUG.set(t.slug, chunk);
}

const TUTORIAL_LOADERS: Record<TutorialChunkId, () => Promise<LearnTutorial[]>> = {
  "learn-basics": async () => (await import("./learn-basics")).TUTORIALS,
  "learn-functions-advanced": async () =>
    (await import("./learn-functions-advanced")).TUTORIALS,
  "learn-classes": async () => (await import("./learn-classes")).TUTORIALS,
  "learn-file-modules": async () =>
    (await import("./learn-file-modules")).TUTORIALS,
  "learn-matplotlib": async () =>
    (await import("./learn-matplotlib")).TUTORIALS,
  "learn-ml": async () => (await import("./learn-ml")).TUTORIALS,
  "learn-dsa": async () => (await import("./learn-dsa")).TUTORIALS,
  "learn-databases": async () => (await import("./learn-databases")).TUTORIALS,
};

const REFERENCE_LOADERS: Record<ReferenceChunkId, () => Promise<LearnReference[]>> = {
  "ref-builtins": async () => (await import("./ref-builtins")).REFERENCES,
  "ref-string-methods": async () =>
    (await import("./ref-string-methods")).REFERENCES,
  "ref-collection-methods": async () =>
    (await import("./ref-collection-methods")).REFERENCES,
  "ref-file-keywords": async () =>
    (await import("./ref-file-keywords")).REFERENCES,
  "ref-modules": async () => (await import("./ref-modules")).REFERENCES,
};

// One in-flight / resolved load per chunk; a failed load is
// forgotten so the next lookup retries instead of caching the error.
const chunkCache = new Map<ChunkId, Promise<LearnTutorial[] | LearnReference[]>>();

function loadChunk(chunk: ChunkId): Promise<LearnTutorial[] | LearnReference[]> {
  let pending = chunkCache.get(chunk);
  if (!pending) {
    pending = TUTORIAL_CHUNKS.has(chunk)
      ? TUTORIAL_LOADERS[chunk as TutorialChunkId]()
      : REFERENCE_LOADERS[chunk as ReferenceChunkId]();
    pending.catch(() => {
      chunkCache.delete(chunk);
    });
    chunkCache.set(chunk, pending);
  }
  return pending;
}

/** Full written tutorial for a topic slug, or null when not written yet. */
export async function getLearnTutorial(slug: string): Promise<LearnTutorial | null> {
  const chunk = CHUNK_BY_SLUG.get(slug);
  if (!chunk || !TUTORIAL_CHUNKS.has(chunk)) return null;
  const entries = (await loadChunk(chunk)) as LearnTutorial[];
  return entries.find((t) => t.slug === slug) ?? null;
}

/** Short reference entry for a slug, or null when not written yet. */
export async function getLearnReference(slug: string): Promise<LearnReference | null> {
  const chunk = CHUNK_BY_SLUG.get(slug);
  if (!chunk || TUTORIAL_CHUNKS.has(chunk)) return null;
  const entries = (await loadChunk(chunk)) as LearnReference[];
  return entries.find((r) => r.slug === slug) ?? null;
}

// Counts without loading the corpus: the corpus files are the source
// of truth and tests/learn-content.test.mjs recounts their slugs on
// every run, so these constants cannot drift silently. Update them
// (and that test's expectations) together when content is added.
const TUTORIAL_COUNT = 268;
const REFERENCE_COUNT = 544;

export function tutorialCount(): number {
  return TUTORIAL_COUNT;
}

export function referenceCount(): number {
  return REFERENCE_COUNT;
}
