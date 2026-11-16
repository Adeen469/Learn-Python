// Learn content types — topic-based tutorials (W3Schools-style sidebar),
// NOT day-based. One entry per sidebar topic, keyed by slug.

export type TutorialBlock =
  | { type: "heading"; text: string }
  | { type: "para"; text: string }
  | { type: "code"; code: string; output?: string; title?: string }
  | { type: "list"; items: string[] }
  | { type: "note"; text: string }
  | { type: "tip"; text: string };

export interface LearnTutorial {
  slug: string;
  title: string;
  intro: string;
  blocks: TutorialBlock[];
  /** 3 hands-on tasks for the reader to try in the editor. */
  practice: string[];
  /** 3-5 takeaway lines. */
  summary: string[];
}

/**
 * Short reference entry — for the Python Reference and Module
 * Reference sections. One signature, one short description, one
 * small example. Never a full tutorial.
 */
export interface LearnReference {
  slug: string;
  title: string;
  /** e.g. "abs(x)" or "str.upper()" — empty when there is no signature. */
  signature: string;
  description: string;
  exampleCode: string;
  exampleOutput?: string;
}
