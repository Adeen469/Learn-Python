// Tutorial/reference translation overlays — loader + merge.
//
// Chunk files are owned by the per-language translators; this file
// only imports and merges them. Each chunk exports
// `TRANSLATIONS: TutorialTranslations` (tutorials) or
// `TRANSLATIONS: ReferenceTranslations` (references).
//
// English is the source language, so there are no `en` chunks:
// getTutorialTranslations("en") / getReferenceTranslations("en")
// return empty maps and every lookup falls back to English.
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

import { TRANSLATIONS as hi_roman_tutorials_basics_1 } from "./hi-roman/tutorials-basics-1";
import { TRANSLATIONS as hi_roman_tutorials_basics_2 } from "./hi-roman/tutorials-basics-2";
import { TRANSLATIONS as hi_roman_tutorials_functions_matplotlib } from "./hi-roman/tutorials-functions-matplotlib";
import { TRANSLATIONS as hi_roman_tutorials_classes_filemodules } from "./hi-roman/tutorials-classes-filemodules";
import { TRANSLATIONS as hi_roman_tutorials_ml_databases_dsa } from "./hi-roman/tutorials-ml-databases-dsa";
import { TRANSLATIONS as hi_roman_references_modules } from "./hi-roman/references-modules";
import { TRANSLATIONS as hi_roman_references_others } from "./hi-roman/references-others";

import { TRANSLATIONS as ur_roman_tutorials_basics_1 } from "./ur-roman/tutorials-basics-1";
import { TRANSLATIONS as ur_roman_tutorials_basics_2 } from "./ur-roman/tutorials-basics-2";
import { TRANSLATIONS as ur_roman_tutorials_functions_matplotlib } from "./ur-roman/tutorials-functions-matplotlib";
import { TRANSLATIONS as ur_roman_tutorials_classes_filemodules } from "./ur-roman/tutorials-classes-filemodules";
import { TRANSLATIONS as ur_roman_tutorials_ml_databases_dsa } from "./ur-roman/tutorials-ml-databases-dsa";
import { TRANSLATIONS as ur_roman_references_modules } from "./ur-roman/references-modules";
import { TRANSLATIONS as ur_roman_references_others } from "./ur-roman/references-others";

import { TRANSLATIONS as fr_tutorials_basics_1 } from "./fr/tutorials-basics-1";
import { TRANSLATIONS as fr_tutorials_basics_2 } from "./fr/tutorials-basics-2";
import { TRANSLATIONS as fr_tutorials_functions_matplotlib } from "./fr/tutorials-functions-matplotlib";
import { TRANSLATIONS as fr_tutorials_classes_filemodules } from "./fr/tutorials-classes-filemodules";
import { TRANSLATIONS as fr_tutorials_ml_databases_dsa } from "./fr/tutorials-ml-databases-dsa";
import { TRANSLATIONS as fr_references_modules } from "./fr/references-modules";
import { TRANSLATIONS as fr_references_others } from "./fr/references-others";

import { TRANSLATIONS as ja_tutorials_basics_1 } from "./ja/tutorials-basics-1";
import { TRANSLATIONS as ja_tutorials_basics_2 } from "./ja/tutorials-basics-2";
import { TRANSLATIONS as ja_tutorials_functions_matplotlib } from "./ja/tutorials-functions-matplotlib";
import { TRANSLATIONS as ja_tutorials_classes_filemodules } from "./ja/tutorials-classes-filemodules";
import { TRANSLATIONS as ja_tutorials_ml_databases_dsa } from "./ja/tutorials-ml-databases-dsa";
import { TRANSLATIONS as ja_references_modules } from "./ja/references-modules";
import { TRANSLATIONS as ja_references_others } from "./ja/references-others";

import { TRANSLATIONS as ko_tutorials_basics_1 } from "./ko/tutorials-basics-1";
import { TRANSLATIONS as ko_tutorials_basics_2 } from "./ko/tutorials-basics-2";
import { TRANSLATIONS as ko_tutorials_functions_matplotlib } from "./ko/tutorials-functions-matplotlib";
import { TRANSLATIONS as ko_tutorials_classes_filemodules } from "./ko/tutorials-classes-filemodules";
import { TRANSLATIONS as ko_tutorials_ml_databases_dsa } from "./ko/tutorials-ml-databases-dsa";
import { TRANSLATIONS as ko_references_modules } from "./ko/references-modules";
import { TRANSLATIONS as ko_references_others } from "./ko/references-others";

import { TRANSLATIONS as es_tutorials_basics_1 } from "./es/tutorials-basics-1";
import { TRANSLATIONS as es_tutorials_basics_2 } from "./es/tutorials-basics-2";
import { TRANSLATIONS as es_tutorials_functions_matplotlib } from "./es/tutorials-functions-matplotlib";
import { TRANSLATIONS as es_tutorials_classes_filemodules } from "./es/tutorials-classes-filemodules";
import { TRANSLATIONS as es_tutorials_ml_databases_dsa } from "./es/tutorials-ml-databases-dsa";
import { TRANSLATIONS as es_references_modules } from "./es/references-modules";
import { TRANSLATIONS as es_references_others } from "./es/references-others";

import { TRANSLATIONS as de_tutorials_basics_1 } from "./de/tutorials-basics-1";
import { TRANSLATIONS as de_tutorials_basics_2 } from "./de/tutorials-basics-2";
import { TRANSLATIONS as de_tutorials_functions_matplotlib } from "./de/tutorials-functions-matplotlib";
import { TRANSLATIONS as de_tutorials_classes_filemodules } from "./de/tutorials-classes-filemodules";
import { TRANSLATIONS as de_tutorials_ml_databases_dsa } from "./de/tutorials-ml-databases-dsa";
import { TRANSLATIONS as de_references_modules } from "./de/references-modules";
import { TRANSLATIONS as de_references_others } from "./de/references-others";

import { TRANSLATIONS as pt_tutorials_basics_1 } from "./pt/tutorials-basics-1";
import { TRANSLATIONS as pt_tutorials_basics_2 } from "./pt/tutorials-basics-2";
import { TRANSLATIONS as pt_tutorials_functions_matplotlib } from "./pt/tutorials-functions-matplotlib";
import { TRANSLATIONS as pt_tutorials_classes_filemodules } from "./pt/tutorials-classes-filemodules";
import { TRANSLATIONS as pt_tutorials_ml_databases_dsa } from "./pt/tutorials-ml-databases-dsa";
import { TRANSLATIONS as pt_references_modules } from "./pt/references-modules";
import { TRANSLATIONS as pt_references_others } from "./pt/references-others";

import { TRANSLATIONS as ru_tutorials_basics_1 } from "./ru/tutorials-basics-1";
import { TRANSLATIONS as ru_tutorials_basics_2 } from "./ru/tutorials-basics-2";
import { TRANSLATIONS as ru_tutorials_functions_matplotlib } from "./ru/tutorials-functions-matplotlib";
import { TRANSLATIONS as ru_tutorials_classes_filemodules } from "./ru/tutorials-classes-filemodules";
import { TRANSLATIONS as ru_tutorials_ml_databases_dsa } from "./ru/tutorials-ml-databases-dsa";
import { TRANSLATIONS as ru_references_modules } from "./ru/references-modules";
import { TRANSLATIONS as ru_references_others } from "./ru/references-others";

import { TRANSLATIONS as ar_tutorials_basics_1 } from "./ar/tutorials-basics-1";
import { TRANSLATIONS as ar_tutorials_basics_2 } from "./ar/tutorials-basics-2";
import { TRANSLATIONS as ar_tutorials_functions_matplotlib } from "./ar/tutorials-functions-matplotlib";
import { TRANSLATIONS as ar_tutorials_classes_filemodules } from "./ar/tutorials-classes-filemodules";
import { TRANSLATIONS as ar_tutorials_ml_databases_dsa } from "./ar/tutorials-ml-databases-dsa";
import { TRANSLATIONS as ar_references_modules } from "./ar/references-modules";
import { TRANSLATIONS as ar_references_others } from "./ar/references-others";

import { TRANSLATIONS as zh_tutorials_basics_1 } from "./zh/tutorials-basics-1";
import { TRANSLATIONS as zh_tutorials_basics_2 } from "./zh/tutorials-basics-2";
import { TRANSLATIONS as zh_tutorials_functions_matplotlib } from "./zh/tutorials-functions-matplotlib";
import { TRANSLATIONS as zh_tutorials_classes_filemodules } from "./zh/tutorials-classes-filemodules";
import { TRANSLATIONS as zh_tutorials_ml_databases_dsa } from "./zh/tutorials-ml-databases-dsa";
import { TRANSLATIONS as zh_references_modules } from "./zh/references-modules";
import { TRANSLATIONS as zh_references_others } from "./zh/references-others";

type Lang =
  | "hi-roman"
  | "ur-roman"
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

const TUTORIALS: Record<Exclude<Lang, "en">, TutorialTranslations> = {
  "hi-roman": { ...hi_roman_tutorials_basics_1, ...hi_roman_tutorials_basics_2, ...hi_roman_tutorials_functions_matplotlib, ...hi_roman_tutorials_classes_filemodules, ...hi_roman_tutorials_ml_databases_dsa },
  "ur-roman": { ...ur_roman_tutorials_basics_1, ...ur_roman_tutorials_basics_2, ...ur_roman_tutorials_functions_matplotlib, ...ur_roman_tutorials_classes_filemodules, ...ur_roman_tutorials_ml_databases_dsa },
  "fr": { ...fr_tutorials_basics_1, ...fr_tutorials_basics_2, ...fr_tutorials_functions_matplotlib, ...fr_tutorials_classes_filemodules, ...fr_tutorials_ml_databases_dsa },
  "ja": { ...ja_tutorials_basics_1, ...ja_tutorials_basics_2, ...ja_tutorials_functions_matplotlib, ...ja_tutorials_classes_filemodules, ...ja_tutorials_ml_databases_dsa },
  "ko": { ...ko_tutorials_basics_1, ...ko_tutorials_basics_2, ...ko_tutorials_functions_matplotlib, ...ko_tutorials_classes_filemodules, ...ko_tutorials_ml_databases_dsa },
  "es": { ...es_tutorials_basics_1, ...es_tutorials_basics_2, ...es_tutorials_functions_matplotlib, ...es_tutorials_classes_filemodules, ...es_tutorials_ml_databases_dsa },
  "de": { ...de_tutorials_basics_1, ...de_tutorials_basics_2, ...de_tutorials_functions_matplotlib, ...de_tutorials_classes_filemodules, ...de_tutorials_ml_databases_dsa },
  "pt": { ...pt_tutorials_basics_1, ...pt_tutorials_basics_2, ...pt_tutorials_functions_matplotlib, ...pt_tutorials_classes_filemodules, ...pt_tutorials_ml_databases_dsa },
  "ru": { ...ru_tutorials_basics_1, ...ru_tutorials_basics_2, ...ru_tutorials_functions_matplotlib, ...ru_tutorials_classes_filemodules, ...ru_tutorials_ml_databases_dsa },
  "ar": { ...ar_tutorials_basics_1, ...ar_tutorials_basics_2, ...ar_tutorials_functions_matplotlib, ...ar_tutorials_classes_filemodules, ...ar_tutorials_ml_databases_dsa },
  "zh": { ...zh_tutorials_basics_1, ...zh_tutorials_basics_2, ...zh_tutorials_functions_matplotlib, ...zh_tutorials_classes_filemodules, ...zh_tutorials_ml_databases_dsa },
};

const REFERENCES: Record<Exclude<Lang, "en">, ReferenceTranslations> = {
  "hi-roman": { ...hi_roman_references_modules, ...hi_roman_references_others },
  "ur-roman": { ...ur_roman_references_modules, ...ur_roman_references_others },
  "fr": { ...fr_references_modules, ...fr_references_others },
  "ja": { ...ja_references_modules, ...ja_references_others },
  "ko": { ...ko_references_modules, ...ko_references_others },
  "es": { ...es_references_modules, ...es_references_others },
  "de": { ...de_references_modules, ...de_references_others },
  "pt": { ...pt_references_modules, ...pt_references_others },
  "ru": { ...ru_references_modules, ...ru_references_others },
  "ar": { ...ar_references_modules, ...ar_references_others },
  "zh": { ...zh_references_modules, ...zh_references_others },
};

/** Merged tutorial overlays for a language ({} for English). */
export function getTutorialTranslations(lang: string): TutorialTranslations {
  if (lang === "en") return {};
  return TUTORIALS[lang as Exclude<Lang, "en">] ?? {};
}

/** Merged reference overlays for a language ({} for English). */
export function getReferenceTranslations(lang: string): ReferenceTranslations {
  if (lang === "en") return {};
  return REFERENCES[lang as Exclude<Lang, "en">] ?? {};
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
