import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const testRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const readSrc = (p) => readFileSync(join(testRoot, p), "utf8");

// Inline mirrors of web/src/lib/tutor-commands.ts and
// web/src/lib/tutor-command-actions.ts for zero-build node --test
// verification (no TS imports in tests).

function normalizeTranscript(transcript) {
  return transcript.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

const SAMPLE_SLUGS = [
  "python-home",
  "python-intro",
  "python-variables",
  "python-variables-names",
  "python-strings",
  "python-strings-methods",
  "python-lists",
  "python-for-loops",
  "python-while-loops",
  "python-if-else",
  "python-conditions",
  "python-functions",
  "python-classes",
  "python-file-handling",
];

const TOPIC_STOPWORDS = new Set([
  "open", "kholo", "khol", "show", "lesson", "topic", "chapter", "please",
  "karo", "mujhe", "the", "a", "an", "to", "go", "seekho", "sikhao",
  "padhao", "padhna", "teach", "me", "explain", "start", "about", "par",
  "pe", "ka", "ki", "ke", "wala", "wali", "hai", "kya", "batao", "samjhao",
  "python", "aur", "ya", "ek",
]);

const TOPIC_ALIASES = {
  loops: "python-for-loops",
  loop: "python-for-loops",
  "if else": "python-if-else",
  oops: "python-classes",
  home: "python-home",
};

function stem(word) {
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function slugWords(slug) {
  return slug.split("-").filter((w) => w !== "python" && w !== "challenges" && w !== "exercises");
}

function matchLearnTopic(text, slugs = SAMPLE_SLUGS) {
  const normalized = normalizeTranscript(text);
  for (const [phrase, slug] of Object.entries(TOPIC_ALIASES)) {
    if (normalized.includes(phrase) && slugs.includes(slug)) return slug;
  }
  const query = normalized.split(" ").filter((w) => w && !TOPIC_STOPWORDS.has(w));
  if (query.length === 0) return null;
  let best = null;
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
  if (!allHit && bestScore < 4) return null;
  return best;
}

function parseDuration(text) {
  const m = /(\d+)\s*(?:minutes?|minute|min)\s*(?:(\d+)\s*(?:seconds?|second|sec))?/.exec(text);
  if (m) return Number(m[1]) * 60 + (m[2] ? Number(m[2]) : 0);
  const s = /(\d+)\s*(?:seconds?|second|sec)/.exec(text);
  if (s) return Number(s[1]);
  return null;
}

function parseSeekTo(text) {
  const dur = parseDuration(text);
  if (dur !== null) return dur;
  const m = /(?:go to|seek to|jump to)\s+(\d+)\s+(\d{1,2})\s*$/.exec(text);
  if (m && Number(m[2]) < 60) return Number(m[1]) * 60 + Number(m[2]);
  return null;
}

const NAV_ROUTES = [
  { route: "home", words: ["home", "homepage", "home page", "landing"] },
  { route: "learn", words: ["learn", "lessons", "tutorial", "tutorials", "seekho"] },
  { route: "courses", words: ["courses", "video courses", "course"] },
  { route: "editor", words: ["editor", "code editor", "code"] },
  { route: "settings", words: ["settings", "setting"] },
  { route: "modules", words: ["modules", "module"] },
  { route: "logic-builder", words: ["logic builder", "logic-builder"] },
  { route: "offline", words: ["offline", "saved lessons", "downloads"] },
];

function matchCreatorSlug(normalized) {
  if (/\bharry\b|code with harry/.test(normalized)) return "codewithharry";
  if (/\bmosh\b|code with mosh/.test(normalized)) return "code-with-mosh";
  if (/apna college|\bapna\b/.test(normalized)) return "apna-college";
  return null;
}

function matchVoiceCommand(text, ctx = {}) {
  const normalized = normalizeTranscript(text);
  if (!normalized) return null;
  const onLearn = (ctx.pathname ?? "").startsWith("/learn/");
  const onCourses = (ctx.pathname ?? "").startsWith("/courses/");
  const onEditor = (ctx.pathname ?? "").startsWith("/editor");

  const destructive =
    /\bdelete\b|\bremove\b.*\b(repo|account|file)\b|sign out|log ?out|logout|push to github|deploy|buy|purchase|subscribe/.exec(normalized);
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

  if (/\blight mode\b|\blight theme\b/.test(normalized)) return { type: "theme", theme: "light" };
  if (/\bdark mode\b|\bdark theme\b/.test(normalized)) return { type: "theme", theme: "dark" };

  if (/(go to|seek to|jump to)/.test(normalized)) {
    const to = parseSeekTo(normalized);
    if (to !== null) return { type: "video-seek-to", seconds: to };
  }

  const creator = matchCreatorSlug(normalized);
  if (creator && /^(?:go to|open|kholo|chalo|le chalo|show|play|chalao)/.test(normalized)) {
    return { type: "navigate", route: creator };
  }
  const navMatch = /^(?:go to|go|open|kholo|chalo|le chalo|show|jaye|jane)\s+(.+)$/.exec(normalized);
  const navTarget = (navMatch ? navMatch[1] : normalized)
    .replace(/^the\s+/, "")
    .replace(/\s+(kholo|khol|open)$/, "");
  for (const { route, words } of NAV_ROUTES) {
    if (
      words.some((w) => navTarget === w || (Boolean(navMatch) && navTarget.startsWith(`${w} `)))
    ) {
      return { type: "navigate", route };
    }
  }

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

  const teachMatch = /^(?:teach|sikhao|padhao)(?: me)?\s+(.+)$/.exec(normalized);
  const openMatch = /^(?:open|kholo|show|start)\s+(.+?)(?:\s+(?:lesson|topic|chapter))?$/.exec(normalized);
  const trailingOpen = /^(.+?)\s+(kholo|khol|sikhao|padhao)$/.exec(normalized);
  const lessonQuery = teachMatch?.[1] ?? openMatch?.[1] ?? trailingOpen?.[1] ?? null;
  if (lessonQuery) {
    const slug = matchLearnTopic(lessonQuery);
    if (slug) return { type: "open-lesson", slug };
  }
  const bareLesson = /^(.+?)\s+(lesson|topic)$/.exec(normalized);
  if (bareLesson) {
    const slug = matchLearnTopic(bareLesson[1]);
    if (slug) return { type: "open-lesson", slug };
  }

  const dayMatch = /\bplay\b.*\bday\s*#?\s*(\d+)\b/.exec(normalized);
  if (dayMatch) return { type: "video-play-index", index: Number(dayMatch[1]) - 1 };
  const numMatch = /\bplay\b.*\bvideo\s+(\d+)\b/.exec(normalized);
  if (numMatch) return { type: "video-play-index", index: Number(numMatch[1]) - 1 };
  const playTitle = /^(?:play|chalao|chalu karo)\s+(.+)$/.exec(normalized);
  if (playTitle) {
    const rest = playTitle[1].replace(/\b(the|a|video|wala|wali)\b/g, "").trim();
    if (rest && !/^(video|it|yeh|ye)$/.test(rest)) {
      return { type: "video-play-title", query: rest };
    }
  }

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

  if (/\b(next|agla|agli)\b.*\bvideo\b/.test(normalized)) return { type: "video-next" };
  if (/\b(previous|pichla|pichli)\b.*\bvideo\b/.test(normalized)) return { type: "video-prev" };

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
    const parts = openFile[1].trim().split(/\s+/);
    const exts = ["py", "txt", "md", "json", "js", "ts", "html", "css"];
    const hasExt = parts.length >= 2 && exts.includes(parts[parts.length - 1]);
    if (onEditor || hasExt) {
      let name;
      if (hasExt) {
        const filtered = parts.filter((p) => p !== "dot");
        name = `${filtered.slice(0, -1).join("")}.${filtered[filtered.length - 1]}`;
      } else {
        name = openFile[1].trim().replace(/\s+/g, "");
      }
      if (name) return { type: "editor-open-file", name };
    }
  }

  // Go back / forward first — "go back" contains "back", which the
  // seek check below would otherwise swallow.
  if (/\bgo back\b|\bwapas jao\b|\bback jao\b|\bprevious page\b/.test(normalized)) {
    return { type: "go-back" };
  }
  if (/\bgo forward\b|\bforward page\b/.test(normalized)) {
    return { type: "go-forward" };
  }

  const seekFwd = /\b(forward|aage badho|aage|skip ahead|fast forward)\b/.exec(normalized);
  const seekBack = /\b(back|rewind|peeche|pichhe)\b/.exec(normalized);
  if (seekFwd || seekBack) {
    const dur = parseDuration(normalized);
    const seconds = dur ?? 10;
    if (seekBack && !seekFwd) return { type: "video-seek", seconds: -seconds };
    if (seekFwd) return { type: "video-seek", seconds };
  }

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

function lessonDisplayName(slug) {
  const words = slug.split("-").filter((w) => w !== "python");
  if (words.length === 0) return "Python home";
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

// ---- Executor mirror (stub env, no DOM) ----

const NAV_PATHS = {
  home: "/",
  learn: "/learn/python-home",
  courses: "/courses",
  editor: "/editor",
  settings: "/settings",
  modules: "/modules",
  "logic-builder": "/logic-builder",
  offline: "/offline",
  codewithharry: "/courses/codewithharry",
  "code-with-mosh": "/courses/code-with-mosh",
  "apna-college": "/courses/apna-college",
};

function formatSeconds(seconds) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} seconds`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${m} minute${m === 1 ? "" : "s"}` : `${m} minute${m === 1 ? "" : "s"} ${rest} seconds`;
}

async function executeVoiceCommand(cmd, env, ctx = {}) {
  const onLearn = (ctx.pathname ?? "").startsWith("/learn/");
  const onCourses = (ctx.pathname ?? "").startsWith("/courses/");
  const onEditor = (ctx.pathname ?? "").startsWith("/editor");
  switch (cmd.type) {
    case "navigate":
      env.navigate(NAV_PATHS[cmd.route] ?? "/");
      return `Opening ${cmd.route === "home" ? "home" : cmd.route.replaceAll("-", " ")}.`;
    case "open-lesson": {
      if (ctx.topicSlug === cmd.slug) return "You are already on this lesson.";
      env.navigate(`/learn/${cmd.slug}`);
      return `Opening ${lessonDisplayName(cmd.slug)}.`;
    }
    case "lesson-next":
    case "lesson-prev": {
      if (!onLearn || !ctx.topicSlug) return "Open a lesson first, then say next lesson.";
      const idx = SAMPLE_SLUGS.indexOf(ctx.topicSlug);
      if (idx < 0) return "Open a lesson first, then say next lesson.";
      const next = cmd.type === "lesson-next" ? idx + 1 : idx - 1;
      if (next < 0) return "This is the first lesson.";
      if (next >= SAMPLE_SLUGS.length) return "This is the last lesson.";
      const slug = SAMPLE_SLUGS[next];
      env.navigate(`/learn/${slug}`);
      return `${cmd.type === "lesson-next" ? "Next" : "Previous"} lesson: ${lessonDisplayName(slug)}.`;
    }
    case "video-play": {
      const video = env.findVideo();
      if (!video) return "There is no video playing on this page.";
      try {
        await video.play();
      } catch {
        return "The video could not start. Tap the play button once, then try again.";
      }
      return "Playing the video.";
    }
    case "video-pause": {
      const video = env.findVideo();
      if (!video) return "There is no video playing on this page.";
      video.pause();
      return "Video paused.";
    }
    case "video-seek": {
      const video = env.findVideo();
      if (!video) {
        env.scrollBy(cmd.seconds > 0 ? env.viewportHeight * 0.8 : -env.viewportHeight * 0.8);
        return "No video is playing, so I scrolled instead.";
      }
      const target = Math.min(
        Math.max(0, video.currentTime + cmd.seconds),
        Number.isFinite(video.duration) && video.duration > 0 ? video.duration : video.currentTime + cmd.seconds
      );
      video.currentTime = target;
      return cmd.seconds >= 0
        ? `Skipped ahead ${formatSeconds(cmd.seconds)}.`
        : `Went back ${formatSeconds(-cmd.seconds)}.`;
    }
    case "video-seek-to": {
      const video = env.findVideo();
      if (!video) return "There is no video on this page to seek in.";
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.min(cmd.seconds, video.duration);
      } else {
        video.currentTime = cmd.seconds;
      }
      return `Jumped to ${formatSeconds(cmd.seconds)}.`;
    }
    case "video-next":
    case "video-prev": {
      const done = await env.dispatchVideo({ action: cmd.type === "video-next" ? "next" : "prev" });
      if (!done) return "Open a course video first, then say next video.";
      if (done.atEnd) return cmd.type === "video-next" ? "That is the last video." : "That is the first video.";
      return `Playing ${typeof done.title === "string" ? done.title : "the next video"}.`;
    }
    case "video-play-index": {
      const done = await env.dispatchVideo({ action: "play-index", index: cmd.index });
      if (!done) {
        if (!onCourses) return "Open a course first, then tell me the video number.";
        return "That video number does not exist in this course.";
      }
      if (done.atEnd) return "That video number does not exist in this course.";
      return `Playing ${typeof done.title === "string" ? done.title : `video ${cmd.index + 1}`}.`;
    }
    case "video-play-title": {
      const target = await env.resolveVideoTarget(cmd.query);
      if (!target) return `I could not find a video called ${cmd.query}.`;
      if (ctx.pathname === target.route) {
        const done = await env.dispatchVideo({ action: "play-index", index: target.index });
        if (!done) return "Open a course video first.";
        return `Playing ${target.title}.`;
      }
      env.setPendingVideoIndex(target.index);
      env.navigate(target.route);
      return `Opening ${target.title}.`;
    }
    case "editor-run": {
      if (!onEditor) return "Open the code editor first, then say run the code.";
      const done = await env.dispatchEditor({ action: "run" });
      if (!done) return "The editor did not answer. Try tapping Run once.";
      if (done.busy) return "The code is already running.";
      return "Running your code.";
    }
    case "editor-save": {
      if (!onEditor) return "Open the code editor first, then say save.";
      const done = await env.dispatchEditor({ action: "save" });
      if (!done) return "The editor did not answer. Try saving from the File menu.";
      return "File saved.";
    }
    case "editor-open-file": {
      if (!onEditor) {
        env.setPendingOpenFile(cmd.name);
        env.navigate("/editor");
        return `Opening ${cmd.name} in the editor.`;
      }
      const done = await env.dispatchEditor({ action: "open-file", name: cmd.name });
      if (!done) return "The editor did not answer. Try opening the file from the Explorer.";
      if (!done.ok) return `I could not find a file called ${cmd.name}.`;
      return `Opened ${typeof done.path === "string" ? done.path : cmd.name}.`;
    }
    case "tutor-open":
      env.setTutorOpen(true);
      return "Tutor opened.";
    case "tutor-close":
      env.setTutorOpen(false);
      return "Tutor closed.";
    case "scroll":
      if (cmd.direction === "top") {
        env.scrollTo("top");
        return "Scrolled to the top.";
      }
      if (cmd.direction === "bottom") {
        env.scrollTo("bottom");
        return "Scrolled to the bottom.";
      }
      env.scrollBy(cmd.direction === "up" ? -env.viewportHeight * 0.8 : env.viewportHeight * 0.8);
      return cmd.direction === "up" ? "Scrolled up." : "Scrolled down.";
    case "go-back":
      env.goBack();
      return "Going back.";
    case "go-forward":
      env.goForward();
      return "Going forward.";
    case "theme":
      env.setTheme(cmd.theme);
      return cmd.theme === "dark" ? "Dark mode on." : "Light mode on.";
    case "refused":
      return "I can't do that by voice — please do it on screen.";
    default:
      throw new Error(`unknown command ${cmd.type}`);
  }
}

function stubEnv(overrides = {}) {
  const calls = [];
  const video = {
    paused: true,
    currentTime: 100,
    duration: 600,
    played: false,
    playCalls: 0,
    async play() {
      this.playCalls += 1;
      this.paused = false;
    },
    pause() {
      this.paused = true;
    },
  };
  return {
    calls,
    video,
    navigate: (path) => calls.push(["navigate", path]),
    goBack: () => calls.push(["goBack"]),
    goForward: () => calls.push(["goForward"]),
    scrollBy: (dy) => calls.push(["scrollBy", dy]),
    scrollTo: (position) => calls.push(["scrollTo", position]),
    viewportHeight: 800,
    setTutorOpen: (open) => calls.push(["setTutorOpen", open]),
    setTheme: (theme) => calls.push(["setTheme", theme]),
    findVideo: () => (overrides.noVideo ? null : video),
    dispatchEditor: async (detail) => {
      calls.push(["dispatchEditor", detail]);
      return "editorDone" in overrides ? overrides.editorDone : { ok: true };
    },
    dispatchVideo: async (detail) => {
      calls.push(["dispatchVideo", detail]);
      return "videoDone" in overrides ? overrides.videoDone : { ok: true, title: "Day 2 video" };
    },
    setPendingVideoIndex: (index) => calls.push(["setPendingVideoIndex", index]),
    setPendingOpenFile: (name) => calls.push(["setPendingOpenFile", name]),
    resolveVideoTarget: async (query) => overrides.videoTarget ?? null,
  };
}

// ---- Matcher tests ----

test("navigation: EN + Hinglish", () => {
  assert.deepEqual(matchVoiceCommand("go home"), { type: "navigate", route: "home" });
  assert.deepEqual(matchVoiceCommand("courses kholo"), { type: "navigate", route: "courses" });
  assert.deepEqual(matchVoiceCommand("open the editor"), { type: "navigate", route: "editor" });
  assert.deepEqual(matchVoiceCommand("open settings"), { type: "navigate", route: "settings" });
  assert.deepEqual(matchVoiceCommand("go to learn"), { type: "navigate", route: "learn" });
  assert.deepEqual(matchVoiceCommand("open code with harry"), { type: "navigate", route: "codewithharry" });
  assert.deepEqual(matchVoiceCommand("play code with harry"), { type: "navigate", route: "codewithharry" });
  assert.deepEqual(matchVoiceCommand("modules"), { type: "navigate", route: "modules" });
  assert.deepEqual(matchVoiceCommand("offline"), { type: "navigate", route: "offline" });
});

test("destructive actions are refused, never executed", () => {
  assert.deepEqual(matchVoiceCommand("delete my repo"), { type: "refused", action: "deleting" });
  assert.deepEqual(matchVoiceCommand("delete this file"), { type: "refused", action: "deleting" });
  assert.deepEqual(matchVoiceCommand("sign out"), { type: "refused", action: "signing out" });
  assert.deepEqual(matchVoiceCommand("push to github"), { type: "refused", action: "pushing to GitHub" });
});

test("tutor open/close and theme", () => {
  assert.deepEqual(matchVoiceCommand("open the tutor"), { type: "tutor-open" });
  assert.deepEqual(matchVoiceCommand("close the tutor"), { type: "tutor-close" });
  assert.deepEqual(matchVoiceCommand("tutor band karo"), { type: "tutor-close" });
  assert.deepEqual(matchVoiceCommand("switch to dark mode"), { type: "theme", theme: "dark" });
  assert.deepEqual(matchVoiceCommand("light mode"), { type: "theme", theme: "light" });
});

test("lessons: open by topic words + aliases", () => {
  assert.deepEqual(matchVoiceCommand("open strings lesson"), { type: "open-lesson", slug: "python-strings" });
  assert.deepEqual(matchVoiceCommand("open string methods"), { type: "open-lesson", slug: "python-strings-methods" });
  assert.deepEqual(matchVoiceCommand("teach me loops"), { type: "open-lesson", slug: "python-for-loops" });
  assert.deepEqual(matchVoiceCommand("strings lesson"), { type: "open-lesson", slug: "python-strings" });
  assert.deepEqual(matchVoiceCommand("variables kholo"), { type: "open-lesson", slug: "python-variables" });
  assert.deepEqual(matchVoiceCommand("if else sikhao"), { type: "open-lesson", slug: "python-if-else" });
});

test("lessons: next/previous, explicit and contextual", () => {
  assert.deepEqual(matchVoiceCommand("next lesson"), { type: "lesson-next" });
  assert.deepEqual(matchVoiceCommand("agli lesson"), { type: "lesson-next" });
  assert.deepEqual(matchVoiceCommand("previous lesson"), { type: "lesson-prev" });
  assert.deepEqual(matchVoiceCommand("next", { pathname: "/learn/python-strings" }), { type: "lesson-next" });
  assert.deepEqual(matchVoiceCommand("next", { pathname: "/courses/codewithharry/abc" }), { type: "video-next" });
  assert.equal(matchVoiceCommand("next", { pathname: "/" }), null);
});

test("video: play/pause/seek", () => {
  assert.deepEqual(matchVoiceCommand("play the video"), { type: "video-play" });
  assert.deepEqual(matchVoiceCommand("video chalao"), { type: "video-play" });
  assert.deepEqual(matchVoiceCommand("pause the video"), { type: "video-pause" });
  assert.deepEqual(matchVoiceCommand("video roko"), { type: "video-pause" });
  assert.deepEqual(matchVoiceCommand("forward 30 seconds"), { type: "video-seek", seconds: 30 });
  assert.deepEqual(matchVoiceCommand("aage badho"), { type: "video-seek", seconds: 10 });
  assert.deepEqual(matchVoiceCommand("rewind 10 seconds"), { type: "video-seek", seconds: -10 });
  assert.deepEqual(matchVoiceCommand("go to 2 minutes"), { type: "video-seek-to", seconds: 120 });
  assert.deepEqual(matchVoiceCommand("seek to 1 minute 30 seconds"), { type: "video-seek-to", seconds: 90 });
  assert.deepEqual(matchVoiceCommand("next video"), { type: "video-next" });
  assert.deepEqual(matchVoiceCommand("play day 5"), { type: "video-play-index", index: 4 });
  assert.deepEqual(matchVoiceCommand("play video 3"), { type: "video-play-index", index: 2 });
  assert.deepEqual(matchVoiceCommand("play modules and pip"), { type: "video-play-title", query: "modules and pip" });
});

test("editor: run/save/open file", () => {
  assert.deepEqual(matchVoiceCommand("run the code"), { type: "editor-run" });
  assert.deepEqual(matchVoiceCommand("code chalao"), { type: "editor-run" });
  assert.deepEqual(matchVoiceCommand("run", { pathname: "/editor" }), { type: "editor-run" });
  assert.deepEqual(matchVoiceCommand("save the file"), { type: "editor-save" });
  assert.deepEqual(matchVoiceCommand("open main.py", { pathname: "/editor" }), { type: "editor-open-file", name: "main.py" });
  assert.deepEqual(matchVoiceCommand("open utils", { pathname: "/editor" }), { type: "editor-open-file", name: "utils" });
});

test("scroll/back/forward and non-commands fall through to the AI", () => {
  assert.deepEqual(matchVoiceCommand("scroll down"), { type: "scroll", direction: "down" });
  assert.deepEqual(matchVoiceCommand("scroll to top"), { type: "scroll", direction: "top" });
  assert.deepEqual(matchVoiceCommand("go back"), { type: "go-back" });
  assert.deepEqual(matchVoiceCommand("go forward"), { type: "go-forward" });
  assert.equal(matchVoiceCommand("what is a variable?"), null);
  assert.equal(matchVoiceCommand("explain strings"), null);
  assert.equal(matchVoiceCommand("what is a background in python?"), null);
  assert.equal(matchVoiceCommand("how do I print in python"), null);
});

// ---- Executor tests ----

test("executor: navigate + lesson next/prev", async () => {
  const env = stubEnv();
  assert.equal(
    await executeVoiceCommand({ type: "navigate", route: "courses" }, env, {}),
    "Opening courses."
  );
  assert.deepEqual(env.calls[0], ["navigate", "/courses"]);
  const env2 = stubEnv();
  assert.equal(
    await executeVoiceCommand({ type: "lesson-next" }, env2, { pathname: "/learn/python-strings", topicSlug: "python-strings" }),
    "Next lesson: Strings Methods."
  );
  assert.deepEqual(env2.calls[0], ["navigate", "/learn/python-strings-methods"]);
  const env3 = stubEnv();
  assert.equal(
    await executeVoiceCommand({ type: "lesson-prev" }, env3, { pathname: "/learn/python-home", topicSlug: "python-home" }),
    "This is the first lesson."
  );
  assert.equal(
    await executeVoiceCommand({ type: "lesson-next" }, stubEnv(), { pathname: "/courses" }),
    "Open a lesson first, then say next lesson."
  );
});

test("executor: video play/pause/seek with and without a video", async () => {
  const env = stubEnv();
  assert.equal(await executeVoiceCommand({ type: "video-play" }, env, {}), "Playing the video.");
  assert.equal(env.video.playCalls, 1);
  assert.equal(await executeVoiceCommand({ type: "video-pause" }, env, {}), "Video paused.");
  assert.equal(env.video.paused, true);
  assert.equal(
    await executeVoiceCommand({ type: "video-seek", seconds: 30 }, env, {}),
    "Skipped ahead 30 seconds."
  );
  assert.equal(env.video.currentTime, 130);
  assert.equal(
    await executeVoiceCommand({ type: "video-seek-to", seconds: 120 }, env, {}),
    "Jumped to 2 minutes."
  );
  assert.equal(env.video.currentTime, 120);
  const noVideo = stubEnv({ noVideo: true });
  assert.equal(await executeVoiceCommand({ type: "video-play" }, noVideo, {}), "There is no video playing on this page.");
  assert.equal(
    await executeVoiceCommand({ type: "video-seek", seconds: 10 }, noVideo, {}),
    "No video is playing, so I scrolled instead."
  );
  assert.deepEqual(noVideo.calls[0], ["scrollBy", 640]);
});

test("executor: video next/prev and play-by-title", async () => {
  const env = stubEnv();
  assert.equal(await executeVoiceCommand({ type: "video-next" }, env, {}), "Playing Day 2 video.");
  assert.deepEqual(env.calls[0], ["dispatchVideo", { action: "next" }]);
  const missing = stubEnv({ videoDone: null });
  assert.equal(
    await executeVoiceCommand({ type: "video-next" }, missing, {}),
    "Open a course video first, then say next video."
  );
  const atEnd = stubEnv({ videoDone: { ok: false, atEnd: true } });
  assert.equal(await executeVoiceCommand({ type: "video-next" }, atEnd, {}), "That is the last video.");
  const titled = stubEnv({
    videoTarget: { route: "/courses/codewithharry/PL123", index: 4, title: "Day 5 video", creator: "CodeWithHarry" },
  });
  assert.equal(
    await executeVoiceCommand({ type: "video-play-title", query: "day 5" }, titled, { pathname: "/" }),
    "Opening Day 5 video."
  );
  assert.deepEqual(titled.calls[0], ["setPendingVideoIndex", 4]);
  assert.deepEqual(titled.calls[1], ["navigate", "/courses/codewithharry/PL123"]);
  const noTitle = stubEnv({ videoTarget: null });
  assert.equal(
    await executeVoiceCommand({ type: "video-play-title", query: "nosuchvideo" }, noTitle, {}),
    "I could not find a video called nosuchvideo."
  );
});

test("executor: editor run/save/open-file", async () => {
  const env = stubEnv();
  assert.equal(
    await executeVoiceCommand({ type: "editor-run" }, env, { pathname: "/editor" }),
    "Running your code."
  );
  assert.deepEqual(env.calls[0], ["dispatchEditor", { action: "run" }]);
  assert.equal(
    await executeVoiceCommand({ type: "editor-run" }, stubEnv(), { pathname: "/" }),
    "Open the code editor first, then say run the code."
  );
  const busy = stubEnv({ editorDone: { ok: true, busy: true } });
  assert.equal(
    await executeVoiceCommand({ type: "editor-run" }, busy, { pathname: "/editor" }),
    "The code is already running."
  );
  const env2 = stubEnv();
  assert.equal(
    await executeVoiceCommand({ type: "editor-save" }, env2, { pathname: "/editor" }),
    "File saved."
  );
  const env3 = stubEnv();
  assert.equal(
    await executeVoiceCommand({ type: "editor-open-file", name: "main.py" }, env3, { pathname: "/courses" }),
    "Opening main.py in the editor."
  );
  assert.deepEqual(env3.calls[0], ["setPendingOpenFile", "main.py"]);
  assert.deepEqual(env3.calls[1], ["navigate", "/editor"]);
  const missing = stubEnv({ editorDone: { ok: false } });
  assert.equal(
    await executeVoiceCommand({ type: "editor-open-file", name: "nope.py" }, missing, { pathname: "/editor" }),
    "I could not find a file called nope.py."
  );
});

test("executor: tutor/theme/scroll/refused", async () => {
  const env = stubEnv();
  assert.equal(await executeVoiceCommand({ type: "tutor-close" }, env, {}), "Tutor closed.");
  assert.deepEqual(env.calls[0], ["setTutorOpen", false]);
  assert.equal(await executeVoiceCommand({ type: "theme", theme: "dark" }, env, {}), "Dark mode on.");
  assert.deepEqual(env.calls[1], ["setTheme", "dark"]);
  assert.equal(await executeVoiceCommand({ type: "scroll", direction: "down" }, env, {}), "Scrolled down.");
  assert.equal(await executeVoiceCommand({ type: "go-back" }, env, {}), "Going back.");
  assert.equal(
    await executeVoiceCommand({ type: "refused", action: "deleting" }, env, {}),
    "I can't do that by voice — please do it on screen."
  );
});

// ---- Source-consistency: the wiring exists in the real files ----

test("source: tutor + pages are wired to the command modules", () => {
  const commands = readSrc("src/lib/tutor-commands.ts");
  assert.match(commands, /VOICE_EDITOR_EVENT = "lp-voice-editor"/);
  assert.match(commands, /VOICE_VIDEO_EVENT = "lp-voice-video"/);
  assert.match(commands, /type: "refused"/);
  const actions = readSrc("src/lib/tutor-command-actions.ts");
  assert.match(actions, /export async function executeVoiceCommand/);
  assert.match(actions, /resolveVideoTarget/);
  const tutor = readSrc("src/components/VirtualTutor.tsx");
  assert.match(tutor, /matchVoiceCommand\(question/);
  assert.match(tutor, /executeVoiceCommand\(/);
  const editor = readSrc("src/app/editor/page.tsx");
  assert.match(editor, /VOICE_EDITOR_EVENT/);
  assert.match(editor, /PENDING_OPEN_FILE_KEY/);
  const player = readSrc("src/app/courses/[slug]/[collection]/page.tsx");
  assert.match(player, /VOICE_VIDEO_EVENT/);
  assert.match(player, /PENDING_VIDEO_INDEX_KEY/);
});
