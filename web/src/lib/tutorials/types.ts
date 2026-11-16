// Text tutorials for the 100-day Python course — the written,
// W3Schools / GeeksforGeeks-style companion to the video lessons.
// The tutorials are now the MAIN learning surface: each lesson page
// teaches the topic in text first (explanation + runnable examples),
// with the video kept as a supplement below.
//
// Content lives in one file per roadmap stage
// (stage-basics.ts, stage-functions.ts, stage-data.ts,
// stage-intermediate.ts, stage-oop.ts, stage-advanced.ts) so six
// writers can work on them in parallel without merge conflicts.
// This file only defines the shape and merges them.

/** One renderable chunk of a lesson. Plain data — no JSX here, so
 *  the content files stay easy to write and review. */
export type TutorialBlock =
  | {
      type: "heading";
      /** Section heading, e.g. "What is a variable?" */
      text: string;
    }
  | {
      type: "para";
      /** One short paragraph, plain English, no markdown. */
      text: string;
    }
  | {
      type: "code";
      /** A short, complete, runnable Python 3 example. */
      code: string;
      /** Exact stdout of running the code above. Must match the code. */
      output?: string;
      /** Optional caption shown above the example. */
      title?: string;
    }
  | {
      type: "list";
      /** Short bullet points, each one idea. */
      items: string[];
    }
  | {
      type: "note";
      /** "Note:" callout — a gotcha or an important detail. */
      text: string;
    }
  | {
      type: "tip";
      /** "Tip:" callout — a handy shortcut or best practice. */
      text: string;
    };

export interface LessonTutorial {
  /** Day number, 1-100. Matches the lesson id `python-day-NNN`. */
  day: number;
  /** Short topic name, e.g. "Variables in Python". */
  title: string;
  /** 1-2 sentences: what this lesson teaches and why it matters. */
  intro: string;
  /** The lesson body, in reading order. */
  blocks: TutorialBlock[];
  /** 3 short practice tasks the reader can try in the editor. */
  practice: string[];
  /** 3-5 one-line takeaways. */
  summary: string[];
}

export type { LessonTutorial as Tutorial };
