// Tutorial/reference translation overlays — types only.
// Translators own the chunk files (see ./index.ts); this file defines
// the shape they must follow. Code blocks are NEVER translated: only
// heading/para/list/note/tip blocks appear in `blocks`, keyed by the
// 0-based index of the block in the English `blocks` array.

export interface TranslatedTutorial {
  title?: string;
  intro?: string;
  blocks?: Record<number, { text?: string; items?: string[] }>;
  summary?: string[];
  practice?: string[];
}

export type TutorialTranslations = Record<string, TranslatedTutorial>;

export interface TranslatedReference {
  title?: string;
  description?: string;
}

export type ReferenceTranslations = Record<string, TranslatedReference>;
