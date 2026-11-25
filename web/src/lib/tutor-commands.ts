// Voice site-control commands for the Virtual Tutor.
// Pure matching — mirrored by tests/virtual-tutor-commands.test.mjs.
// The tutor hears a question; this module decides whether it is a
// site-control command (navigate, lesson, video, editor, scroll…)
// instead of a question for the AI. Matching runs on a normalised
// transcript (see tutor-wake.normalizeTranscript), so Hinglish
// phrasings match too — "home page kholo", "video chalao",
// "code chalao", "agli lesson".
//
// Safety: destructive actions (delete, sign out, push, purchase)
// NEVER run on voice. They match as { type: "refused" } and the
// tutor answers that they need to be done on screen.

import { LEARN_TOPIC_SLUGS } from "@/lib/learn/topic-slugs";
import { normalizeTranscript } from "@/lib/tutor-wake";

// Window events the owning pages listen for. The tutor dispatches;
// the editor page and the course player page answer with the
// matching *-done event (or nothing, when they are not mounted —
// the dispatcher treats the timeout as "not on that page").
export const VOICE_EDITOR_EVENT = "lp-voice-editor";
export const VOICE_EDITOR_DONE_EVENT = "lp-voice-editor-done";
export const VOICE_VIDEO_EVENT = "lp-voice-video";
export const VOICE_VIDEO_DONE_EVENT = "lp-voice-video-done";
// sessionStorage keys for cross-page commands: navigate first, the
// target page consumes the pending action on mount.
export const PENDING_VIDEO_INDEX_KEY = "lp_voice_video_index";
export const PENDING_OPEN_FILE_KEY = "lp_voice_open_file";

export type VoiceCommand =
  | { type: "navigate"; route: "home" | "learn" | "courses" | "editor" | "settings" | "modules" | "logic-builder" | "offline" | "codewithharry" | "code-with-mosh" | "apna-college" }
  | { type: "open-lesson"; slug: string }
  | { type: "lesson-next" }
  | { type: "lesson-prev" }
  | { type: "video-play" }
  | { type: "video-pause" }
  | { type: "video-seek"; seconds: number }
  | { type: "video-seek-to"; seconds: number }
  | { type: "video-next" }
  | { type: "video-prev" }
  | { type: "video-play-index"; index: number }
  | { type: "video-play-title"; query: string }
  | { type: "editor-run" }
  | { type: "editor-save" }
  | { type: "editor-open-file"; name: string }
  | { type: "tutor-open" }
  | { type: "tutor-close" }
  | { type: "scroll"; direction: "up" | "down" | "top" | "bottom" }
  | { type: "go-back" }
  | { type: "go-forward" }
  | { type: "theme"; theme: "dark" | "light" }
  | { type: "refused"; action: string };

export interface VoiceCommandContext {
  pathname?: string;
  topicSlug?: string;
}

// Words that carry no topic meaning — stripped before matching a
// spoken phrase against Learn topic slugs.
const TOPIC_STOPWORDS = new Set([
  "open", "kholo", "khol", "show", "lesson", "topic", "chapter", "please",
  "karo", "mujhe", "the", "a", "an", "to", "go", "seekho", "sikhao",
  "padhao", "padhna", "teach", "me", "explain", "start", "about", "par",
  "pe", "ka", "ki", "ke", "wala", "wali", "hai", "kya", "batao", "samjhao",
  "python", "aur", "ya", "ek",
]);

// Concepts whose everyday name differs from the slug words.
const TOPIC_ALIASES: Record<string, string> = {
  loops: "python-for-loops",
  loop: "python-for-loops",
  "if else": "python-if-else",
  oops: "python-classes",
  home: "python-home",
};

function stem(word: string): string {
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function slugWords(slug: string): string[] {
  return slug
    .split("-")
    .filter((w) => w !== "python" && w !== "challenges" && w !== "exercises");
}

// Best Learn topic for a spoken phrase, or null. Scores slug words
// against the phrase's content words; ties go to the earliest topic
// in curriculum order. Aliases win over scoring.
export function matchLearnTopic(
  text: string,
  slugs: readonly string[] = LEARN_TOPIC_SLUGS
): string | null {
  const normalized = normalizeTranscript(text);
  for (const [phrase, slug] of Object.entries(TOPIC_ALIASES)) {
    if (normalized.includes(phrase) && slugs.includes(slug)) return slug;
  }
  const query = normalized
    .split(" ")
    .filter((w) => w && !TOPIC_STOPWORDS.has(w));
  if (query.length === 0) return null;
  let best: string | null = null;
  let bestScore = 0;
  for (const slug of slugs) {
    const words = slugWords(slug).map(stem);
    let score = 0;
    for (const q of query) {
      const sq = stem(q);
      if (words.includes(sq)) score += 2;
      else if (words.some((w) => w.startsWith(sq) || sq.startsWith(w))) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = slug;
    }
  }
  if (!best || bestScore < 2) return null;
  const words = slugWords(best).map(stem);
  const allHit = query.every((q) => {
    const sq = stem(q);
    return words.includes(sq) || words.some((w) => w.startsWith(sq) || sq.startsWith(w));
  });
  // Every word must hit the winner, unless the score is decisive
  // (e.g. "string methods" hits python-strings-methods on both).
  if (!allHit && bestScore < 4) return null;
  return best;
}

// "2 minutes 30 seconds" / "90 seconds" / "2 minutes" -> seconds.
function parseDuration(text: string): number | null {
  const m = /(\d+)\s*(?:minutes?|minute|min)\s*(?:(\d+)\s*(?:seconds?|second|sec))?/.exec(text);
  if (m) return Number(m[1]) * 60 + (m[2] ? Number(m[2]) : 0);
  const s = /(\d+)\s*(?:seconds?|second|sec)/.exec(text);
  if (s) return Number(s[1]);
  return null;
}

function parseSeekTo(text: string): number | null {
  // "go to 2 minutes 30 seconds" / "seek to 90 seconds".
  const dur = parseDuration(text);
  if (dur !== null) return dur;
  // "go to 2 30" — the colon is stripped by normalisation.
  const m = /(?:go to|seek to|jump to)\s+(\d+)\s+(\d{1,2})\s*$/.exec(text);
  if (m && Number(m[2]) < 60) return Number(m[1]) * 60 + Number(m[2]);
  return null;
}

const NAV_ROUTES = [  { route: "home", words: ["home", "homepage", "home page", "landing"] },
  { route: "learn", words: ["learn", "lessons", "tutorial", "tutorials", "seekho"] },
  { route: "courses", words: ["courses", "video courses", "course"] },
  { route: "editor", words: ["editor", "code editor", "code"] },
  { route: "settings", words: ["settings", "setting"] },
  { route: "modules", words: ["modules", "module"] },
  { route: "logic-builder", words: ["logic builder", "logic-builder"] },
  { route: "offline", words: ["offline", "saved lessons", "downloads"] },
] as const;

// Course creator named in the text, if any. Spoken names come
// without spaces too ("codewithharry", "cwh"), so match those.
export function matchCreatorSlug(
  normalized: string
): "codewithharry" | "code-with-mosh" | "apna-college" | null {
  if (/\bharry\b|code with harry|codewithharry|\bcwh\b/.test(normalized)) return "codewithharry";
  if (/\bmosh\b|code with mosh|codewithmosh/.test(normalized)) return "code-with-mosh";
  if (/apna college|apnacollege|\bapna\b/.test(normalized)) return "apna-college";
  return null;
}

export function matchVoiceCommand(
  text: string,
  ctx: VoiceCommandContext = {}
): VoiceCommand | null {
  const normalized = normalizeTranscript(text);
  if (!normalized) return null;
  const onLearn = (ctx.pathname ?? "").startsWith("/learn/");
  const onCourses = (ctx.pathname ?? "").startsWith("/courses/");
  const onEditor = (ctx.pathname ?? "").startsWith("/editor");

  // 1. Destructive actions never run on voice.
  const destructive =
    /\bdelete\b|\bremove\b.*\b(repo|account|file)\b|sign out|log ?out|logout|push to github|deploy|buy|purchase|subscribe/.exec(
      normalized
    );
  if (destructive) {
    const action = /sign out|log ?out|logout/.test(normalized)
      ? "signing out"
      : /push|deploy/.test(normalized)
        ? "pushing to GitHub"
        : /buy|purchase|subscribe/.test(normalized)
          ? "buying something"
          : "deleting";
    return { type: "refused", action };
  }

  // 2. Tutor panel itself. An explicit "open tutor" is allowed —
  // only the wake word is barred from opening the card (manifest-129).
  if (
    /\b(close|band karo|close karo)\b.*\b(tutor|panel|card)\b/.test(normalized) ||
    /\b(tutor|panel|card)\b.*\b(close|band karo|close karo)\b/.test(normalized)
  ) {
    return { type: "tutor-close" };
  }
  if (
    /\b(open|kholo)\b.*\b(tutor|panel|card)\b/.test(normalized) ||
    /\b(tutor|panel|card)\b.*\b(open|kholo)\b/.test(normalized)
  ) {
    return { type: "tutor-open" };
  }

  // 3. Theme.
  if (/\blight mode\b|\blight theme\b/.test(normalized)) return { type: "theme", theme: "light" };
  if (/\bdark mode\b|\bdark theme\b/.test(normalized)) return { type: "theme", theme: "dark" };

  // 4. Seek to a time ("go to 2 minutes", "seek to 1 minute 30 seconds").
  if (/(go to|seek to|jump to)/.test(normalized)) {
    const to = parseSeekTo(normalized);
    if (to !== null) return { type: "video-seek-to", seconds: to };
  }

  // 4b. Course day — "open codewithharry 100 days of python day 43",
  // "cwh day 43", "open day 43" on a course page. A day number with
  // a named creator or course is a video title lookup, not a lesson
  // — and it must run BEFORE the creator-navigate step below, or
  // "open codewithharry … day 43" would only open the creator page.
  // A bare "play day 5" (no creator, no course words, not on a
  // course page) still falls through to step 8 and plays the Nth
  // video of the current course.
  const dayNumber = /\bday\s*#?\s*(\d+)\b/.exec(normalized);
  if (dayNumber) {
    const dayIndex = Number(dayNumber[1]) - 1;
    if (
      matchCreatorSlug(normalized) !== null ||
      /\b100 days\b|\bdays of python\b|\b100days\b/.test(normalized)
    ) {
      return { type: "video-play-title", query: normalized };
    }
    if (
      onCourses &&
      /^(?:open|play|kholo|chalao|chalu karo|show|start|day)\b/.test(normalized)
    ) {
      return { type: "video-play-index", index: dayIndex };
    }
  }

  // 5. Navigation — "go home", "courses kholo", or the bare section name.
  const creator = matchCreatorSlug(normalized);
  if (creator && /^(?:go to|open|kholo|chalo|le chalo|show|play|chalao)/.test(normalized)) {
    return { type: "navigate", route: creator };
  }
  const navMatch = /^(?:go to|go|open|kholo|chalo|le chalo|show|jaye|jane)\s+(.+)$/.exec(normalized);
  // Hinglish puts the verb last ("courses kholo") — strip it too.
  const navTarget = (navMatch ? navMatch[1] : normalized)
    .replace(/^the\s+/, "")
    .replace(/\s+(kholo|khol|open)$/, "");
  for (const { route, words } of NAV_ROUTES) {
    // A bare utterance must name the section exactly ("courses");
    // a verb-led one may carry a trailing word ("open code editor").
    // Otherwise "code chalao" would navigate to the editor instead
    // of running the code.
    if (
      words.some((w) => navTarget === w || (Boolean(navMatch) && navTarget.startsWith(`${w} `)))
    ) {
      return { type: "navigate", route };
    }
  }
  // Trailing-verb creator name ("cwh kholo", "harry kholo") — the
  // verb was stripped above, so check the bare name too.
  const creatorTarget = matchCreatorSlug(navTarget);
  if (
    creatorTarget &&
    (Boolean(navMatch) || /^(cwh|harry|mosh|apna)$/.test(navTarget))
  ) {
    return { type: "navigate", route: creatorTarget };
  }

  // 6. Lesson next / previous — explicit, or bare "next" in context.
  if (/\b(next|agla|agli|agle)\b.*\b(lesson|topic|chapter)\b/.test(normalized)) {
    return { type: "lesson-next" };
  }
  if (/\b(previous|pichla|pichli|pehle)\b.*\b(lesson|topic|chapter)\b/.test(normalized)) {
    return { type: "lesson-prev" };
  }
  if (/^(next|agla|agli|agle|aage)$/.test(normalized)) {
    if (onLearn) return { type: "lesson-next" };
    if (onCourses) return { type: "video-next" };
  }
  if (/^(previous|pichla|pichli|peeche)$/.test(normalized)) {
    if (onLearn) return { type: "lesson-prev" };
    if (onCourses) return { type: "video-prev" };
  }

  // 7. Open a lesson — "open strings lesson", "teach me loops".
  const teachMatch = /^(?:teach|sikhao|padhao)(?: me)?\s+(.+)$/.exec(normalized);
  const openMatch = /^(?:open|kholo|show|start)\s+(.+?)(?:\s+(?:lesson|topic|chapter))?$/.exec(normalized);
  const trailingOpen = /^(.+?)\s+(kholo|khol|sikhao|padhao)$/.exec(normalized);
  const lessonQuery = teachMatch?.[1] ?? openMatch?.[1] ?? trailingOpen?.[1] ?? null;
  if (lessonQuery) {
    const slug = matchLearnTopic(lessonQuery);
    if (slug) return { type: "open-lesson", slug };
  }
  // Bare "<topic> lesson" with no verb.
  const bareLesson = /^(.+?)\s+(lesson|topic)$/.exec(normalized);
  if (bareLesson) {
    const slug = matchLearnTopic(bareLesson[1]);
    if (slug) return { type: "open-lesson", slug };
  }

  // 8. Video by number / title — "play day 5", "play video 3".
  const dayMatch = /\bplay\b.*\bday\s*#?\s*(\d+)\b/.exec(normalized);
  if (dayMatch) {
    return { type: "video-play-index", index: Number(dayMatch[1]) - 1, };
  }
  const numMatch = /\bplay\b.*\bvideo\s+(\d+)\b/.exec(normalized);
  if (numMatch) {
    return { type: "video-play-index", index: Number(numMatch[1]) - 1 };
  }
  const playTitle = /^(?:play|chalao|chalu karo)\s+(.+)$/.exec(normalized);
  if (playTitle) {
    const rest = playTitle[1].replace(/\b(the|a|video|wala|wali)\b/g, "").trim();
    if (rest && !/^(video|it|yeh|ye)$/.test(rest)) {
      return { type: "video-play-title", query: rest };
    }
  }

  // 9. Video play / pause.
  if (/\b(pause|roko|ruk jao|ruk ja|stop the video|video roko)\b/.test(normalized)) {
    return { type: "video-pause" };
  }
  if (
    /\b(play|resume|start the video|video play)\b/.test(normalized) ||
    (/\bvideo\b/.test(normalized) && /\b(chalao|chalu karo)\b/.test(normalized))
  ) {
    return { type: "video-play" };
  }
  if (onCourses && /^(play|chalao|chalu karo)$/.test(normalized)) {
    return { type: "video-play" };
  }

  // 10. Video next / previous (explicit).
  if (/\b(next|agla|agli)\b.*\bvideo\b/.test(normalized)) return { type: "video-next" };
  if (/\b(previous|pichla|pichli)\b.*\bvideo\b/.test(normalized)) return { type: "video-prev" };

  // 11. Editor — run / save / open file.
  if (
    /\b(run|execute|chalao)\b.*\b(code|program|file)\b/.test(normalized) ||
    /\b(code|program)\b.*\b(run|execute|chalao)\b/.test(normalized)
  ) {
    return { type: "editor-run" };
  }
  if (onEditor && /^(run|chalao|chalu karo)$/.test(normalized)) {
    return { type: "editor-run" };
  }
  if (/\bsave\b/.test(normalized)) {
    return { type: "editor-save" };
  }
  const openFile = /^(?:open|kholo)\s+(?:file\s+)?(.+?)(?:\s+file)?$/.exec(normalized);
  if (openFile) {
    // Normalisation strips the dot ("main.py" -> "main py"), so an
    // extension is a trailing word, not ".py".
    const parts = openFile[1].trim().split(/\s+/);
    const exts = ["py", "txt", "md", "json", "js", "ts", "html", "css"];
    const hasExt = parts.length >= 2 && exts.includes(parts[parts.length - 1]);
    if (onEditor || hasExt) {
      let name: string;
      if (hasExt) {
        const filtered = parts.filter((p) => p !== "dot");
        name = `${filtered.slice(0, -1).join("")}.${filtered[filtered.length - 1]}`;
      } else {
        name = openFile[1].trim().replace(/\s+/g, "");
      }
      if (name) return { type: "editor-open-file", name };
    }
  }

  // 12. Go back / forward first — "go back" contains "back", which
  // the seek check below would otherwise swallow.
  if (/\bgo back\b|\bwapas jao\b|\bback jao\b|\bprevious page\b/.test(normalized)) {
    return { type: "go-back" };
  }
  if (/\bgo forward\b|\bforward page\b/.test(normalized)) {
    return { type: "go-forward" };
  }

  // 13. Seek forward / back.
  const seekFwd = /\b(forward|aage badho|aage|skip ahead|fast forward)\b/.exec(normalized);
  const seekBack = /\b(back|rewind|peeche|pichhe)\b/.exec(normalized);
  if (seekFwd || seekBack) {
    const dur = parseDuration(normalized);
    const seconds = dur ?? 10;
    if (seekBack && !seekFwd) return { type: "video-seek", seconds: -seconds };
    if (seekFwd) return { type: "video-seek", seconds };
  }

  // 14. Scroll.
  if (/\bscroll to top\b|\btop pe jao\b|\bupar jao\b.*\btop\b/.test(normalized)) {
    return { type: "scroll", direction: "top" };
  }
  if (/\bscroll to bottom\b|\bneeche jao\b.*\bbottom\b/.test(normalized)) {
    return { type: "scroll", direction: "bottom" };
  }
  if (/\bscroll (up|upar)\b/.test(normalized)) return { type: "scroll", direction: "up" };
  if (/\bscroll (down|neeche)\b/.test(normalized)) return { type: "scroll", direction: "down" };

  return null;
}

// Human name for a Learn slug, for spoken confirmations.
export function lessonDisplayName(slug: string): string {
  const words = slug.split("-").filter((w) => w !== "python");
  if (words.length === 0) return "Python home";
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}
