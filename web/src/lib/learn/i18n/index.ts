// Tutorial/reference translation overlays — loader + merge.
//
// Chunk files are owned by the per-language translators; this file
// only loads and merges them. Each chunk exports
// `TRANSLATIONS: TutorialTranslations` (tutorials) or
// `TRANSLATIONS: ReferenceTranslations` (references).
//
// English is the source language, so there are no `en` chunks:
// getTutorialTranslations("en") / getReferenceTranslations("en")
// return empty maps and every lookup falls back to English.
//
// LAZY: no chunk is statically imported — a language's 7 chunks are
// fetched with dynamic import() only when loadTranslations(lang) runs
// (the LanguageProvider does this when the language becomes active),
// then merged once and cached. Until they arrive, the sync getters
// below return {} and every lookup falls back to English, exactly as
// it did before the language was selected. A failed load leaves the
// cache empty (English fallback) and retries on the next call.
//
// `blocks` overlays are keyed by 0-based block index; code blocks
// are never translated and never appear in an overlay.

import type { LearnReference, LearnTutorial } from "../types";
import type {
  ReferenceTranslations,
  TranslatedReference,
  TranslatedTutorial,
  TutorialTranslations,
} from "./types";

type Lang =
  | "hi-roman"
  | "fr"
  | "ja"
  | "ko"
  | "es"
  | "de"
  | "pt"
  | "ru"
  | "ar"
  | "zh"
  | "en";

type NonEnglishLang = Exclude<Lang, "en">;

interface LanguageOverlays {
  tutorials: TutorialTranslations;
  references: ReferenceTranslations;
}

/**
 * Merge a language's explicit chunk imports into one overlay pair.
 * The imports stay explicit (one import() per chunk file) so the
 * bundler can split each chunk into its own lazy chunk — a computed
 * import path would defeat that.
 */
async function mergeLanguage(
  tutorialChunks: Promise<{ TRANSLATIONS: TutorialTranslations }>[],
  referenceChunks: Promise<{ TRANSLATIONS: ReferenceTranslations }>[]
): Promise<LanguageOverlays> {
  const [tutorials, references] = await Promise.all([
    Promise.all(tutorialChunks).then((chunks) =>
      Object.assign({}, ...chunks.map((c) => c.TRANSLATIONS))
    ),
    Promise.all(referenceChunks).then((chunks) =>
      Object.assign({}, ...chunks.map((c) => c.TRANSLATIONS))
    ),
  ]);
  return { tutorials, references };
}

const LOADERS: Record<NonEnglishLang, () => Promise<LanguageOverlays>> = {
  "hi-roman": () =>
    mergeLanguage(
      [
        import("./hi-roman/tutorials-basics-1"),
        import("./hi-roman/tutorials-basics-2"),
        import("./hi-roman/tutorials-functions-matplotlib"),
        import("./hi-roman/tutorials-classes-filemodules"),
        import("./hi-roman/tutorials-ml-databases-dsa"),
      ],
      [
        import("./hi-roman/references-modules"),
        import("./hi-roman/references-others"),
      ]
    ),
  fr: () =>
    mergeLanguage(
      [
        import("./fr/tutorials-basics-1"),
        import("./fr/tutorials-basics-2"),
        import("./fr/tutorials-functions-matplotlib"),
        import("./fr/tutorials-classes-filemodules"),
        import("./fr/tutorials-ml-databases-dsa"),
      ],
      [import("./fr/references-modules"), import("./fr/references-others")]
    ),
  ja: () =>
    mergeLanguage(
      [
        import("./ja/tutorials-basics-1"),
        import("./ja/tutorials-basics-2"),
        import("./ja/tutorials-functions-matplotlib"),
        import("./ja/tutorials-classes-filemodules"),
        import("./ja/tutorials-ml-databases-dsa"),
      ],
      [import("./ja/references-modules"), import("./ja/references-others")]
    ),
  ko: () =>
    mergeLanguage(
      [
        import("./ko/tutorials-basics-1"),
        import("./ko/tutorials-basics-2"),
        import("./ko/tutorials-functions-matplotlib"),
        import("./ko/tutorials-classes-filemodules"),
        import("./ko/tutorials-ml-databases-dsa"),
      ],
      [import("./ko/references-modules"), import("./ko/references-others")]
    ),
  es: () =>
    mergeLanguage(
      [
        import("./es/tutorials-basics-1"),
        import("./es/tutorials-basics-2"),
        import("./es/tutorials-functions-matplotlib"),
        import("./es/tutorials-classes-filemodules"),
        import("./es/tutorials-ml-databases-dsa"),
      ],
      [import("./es/references-modules"), import("./es/references-others")]
    ),
  de: () =>
    mergeLanguage(
      [
        import("./de/tutorials-basics-1"),
        import("./de/tutorials-basics-2"),
        import("./de/tutorials-functions-matplotlib"),
        import("./de/tutorials-classes-filemodules"),
        import("./de/tutorials-ml-databases-dsa"),
      ],
      [import("./de/references-modules"), import("./de/references-others")]
    ),
  pt: () =>
    mergeLanguage(
      [
        import("./pt/tutorials-basics-1"),
        import("./pt/tutorials-basics-2"),
        import("./pt/tutorials-functions-matplotlib"),
        import("./pt/tutorials-classes-filemodules"),
        import("./pt/tutorials-ml-databases-dsa"),
      ],
      [import("./pt/references-modules"), import("./pt/references-others")]
    ),
  ru: () =>
    mergeLanguage(
      [
        import("./ru/tutorials-basics-1"),
        import("./ru/tutorials-basics-2"),
        import("./ru/tutorials-functions-matplotlib"),
        import("./ru/tutorials-classes-filemodules"),
        import("./ru/tutorials-ml-databases-dsa"),
      ],
      [import("./ru/references-modules"), import("./ru/references-others")]
    ),
  ar: () =>
    mergeLanguage(
      [
        import("./ar/tutorials-basics-1"),
        import("./ar/tutorials-basics-2"),
        import("./ar/tutorials-functions-matplotlib"),
        import("./ar/tutorials-classes-filemodules"),
        import("./ar/tutorials-ml-databases-dsa"),
      ],
      [import("./ar/references-modules"), import("./ar/references-others")]
    ),
  zh: () =>
    mergeLanguage(
      [
        import("./zh/tutorials-basics-1"),
        import("./zh/tutorials-basics-2"),
        import("./zh/tutorials-functions-matplotlib"),
        import("./zh/tutorials-classes-filemodules"),
        import("./zh/tutorials-ml-databases-dsa"),
      ],
      [import("./zh/references-modules"), import("./zh/references-others")]
    ),
};

// Merged overlays per language, once loaded. Empty until
// loadTranslations(lang) resolves — the sync getters below read
// this, so lookups fall back to English while a language loads.
const tutorialCache: Partial<Record<NonEnglishLang, TutorialTranslations>> = {};
const referenceCache: Partial<Record<NonEnglishLang, ReferenceTranslations>> = {};
const loadingCache = new Map<NonEnglishLang, Promise<void>>();

/**
 * Load (once, cached) a language's tutorial + reference overlays.
 * English is a no-op; unknown codes resolve without loading
 * anything. A failed load is forgotten so the next call retries,
 * and the sync getters keep returning {} (English) meanwhile.
 */
export function loadTranslations(lang: string): Promise<void> {
  if (lang === "en" || !(lang in LOADERS)) return Promise.resolve();
  const code = lang as NonEnglishLang;
  let pending = loadingCache.get(code);
  if (!pending) {
    pending = LOADERS[code]().then(({ tutorials, references }) => {
      tutorialCache[code] = tutorials;
      referenceCache[code] = references;
    });
    pending.catch(() => {
      loadingCache.delete(code);
    });
    loadingCache.set(code, pending);
  }
  return pending;
}

/** Merged tutorial overlays for a language ({} for English, or while loading). */
export function getTutorialTranslations(lang: string): TutorialTranslations {
  if (lang === "en") return {};
  return tutorialCache[lang as NonEnglishLang] ?? {};
}

/** Merged reference overlays for a language ({} for English, or while loading). */
export function getReferenceTranslations(lang: string): ReferenceTranslations {
  if (lang === "en") return {};
  return referenceCache[lang as NonEnglishLang] ?? {};
}

/**
 * Localised copy of a tutorial: title/intro/prose blocks/summary/
 * practice replaced from the overlay, code blocks kept verbatim in
 * English. Any missing field falls back to the English original.
 * Pass no overlay (or undefined) to get the tutorial unchanged.
 */
export function localizeTutorial(
  t: LearnTutorial,
  tr?: TranslatedTutorial
): LearnTutorial {
  if (!tr) return t;
  return {
    ...t,
    title: tr.title ?? t.title,
    intro: tr.intro ?? t.intro,
    blocks: t.blocks.map((b, i) => {
      const tb = tr.blocks?.[i];
      if (!tb || b.type === "code") return b;
      if (b.type === "list") {
        return tb.items !== undefined ? { ...b, items: tb.items } : b;
      }
      return tb.text !== undefined ? { ...b, text: tb.text } : b;
    }),
    summary: tr.summary ?? t.summary,
    practice: tr.practice ?? t.practice,
  };
}

/**
 * Localised copy of a reference entry: title/description replaced
 * from the overlay, signature and example code kept verbatim in
 * English. Any missing field falls back to the English original.
 */
export function localizeReference(
  r: LearnReference,
  tr?: TranslatedReference
): LearnReference {
  if (!tr) return r;
  return {
    ...r,
    title: tr.title ?? r.title,
    description: tr.description ?? r.description,
  };
}
