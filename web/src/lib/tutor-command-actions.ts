// Executes voice site-control commands matched by tutor-commands.ts.
// The environment is injected (router, DOM, events) so the dispatcher
// is unit-testable in node with stubs — the component builds the real
// env from useRouter/window/document. Every action answers with a
// short spoken confirmation; actions that cannot run where the user
// is say so instead of pretending.

import { LEARN_TOPIC_SLUGS } from "@/lib/learn/topic-slugs";
import {
  PENDING_OPEN_FILE_KEY,
  PENDING_VIDEO_INDEX_KEY,
  VOICE_EDITOR_DONE_EVENT,
  VOICE_EDITOR_EVENT,
  VOICE_VIDEO_DONE_EVENT,
  VOICE_VIDEO_EVENT,
  lessonDisplayName,
  type VoiceCommand,
} from "@/lib/tutor-commands";
import { normalizeTranscript } from "@/lib/tutor-wake";

export interface VoiceVideoElement {
  paused: boolean;
  currentTime: number;
  duration: number;
  play(): Promise<void> | void;
  pause(): void;
}

export interface CommandEnv {
  navigate(path: string): void;
  goBack(): void;
  goForward(): void;
  scrollBy(dy: number): void;
  scrollTo(position: "top" | "bottom"): void;
  viewportHeight: number;
  setTutorOpen(open: boolean): void;
  setTheme(theme: "dark" | "light"): void;
  findVideo(): VoiceVideoElement | null;
  dispatchEditor(detail: Record<string, unknown>): Promise<Record<string, unknown> | null>;
  dispatchVideo(detail: Record<string, unknown>): Promise<Record<string, unknown> | null>;
  setPendingVideoIndex(index: number): void;
  setPendingOpenFile(name: string): void;
  resolveVideoTarget(query: string): Promise<VideoTarget | null>;
}

export interface VideoTarget {
  route: string;
  index: number;
  title: string;
  creator: string;
}

type CourseData = {
  COURSE_CREATORS: Array<{
    name: string;
    slug: string;
    playlists: Array<{ url: string; videos: Array<{ title: string; videoId: string }> }>;
    oneShots: Array<{ title: string; videoId: string }>;
  }>;
  playlistListId(url: string): string;
};

// Finds a course video by spoken title — "day 5", "modules and pip".
// Course data (50KB) loads lazily, only for title lookups.
export async function resolveVideoTarget(
  query: string,
  loadData: () => Promise<CourseData> = () =>
    import("@/lib/courses/data") as unknown as Promise<CourseData>
): Promise<VideoTarget | null> {
  const data = await loadData();
  const q = normalizeTranscript(query);
  const flat: VideoTarget[] = [];
  for (const creator of data.COURSE_CREATORS) {
    for (const playlist of creator.playlists) {
      playlist.videos.forEach((video, index) => {
        flat.push({
          route: `/courses/${creator.slug}/${data.playlistListId(playlist.url)}`,
          index,
          title: video.title,
          creator: creator.name,
        });
      });
    }
    creator.oneShots.forEach((video, index) => {
      flat.push({
        route: `/courses/${creator.slug}/one-shots`,
        index,
        title: video.title,
        creator: creator.name,
      });
    });
  }
  const creatorHit = data.COURSE_CREATORS.find((c) =>
    q.includes(c.slug.replace(/-/g, "")) || q.replace(/\s+/g, "").includes(c.slug.replace(/-/g, "")) ||
    // Spoken shorthand: "cwh" is CodeWithHarry.
    (c.slug === "codewithharry" && /\bcwh\b/.test(q))
  );
  const pool = creatorHit
    ? flat.filter((f) => f.creator === creatorHit.name)
    : flat;
  const day = /day\s+(\d+)/.exec(q);
  if (day) {
    const hit = pool.find((f) =>
      new RegExp(`\\bday ${Number(day[1])}\\b`).test(normalizeTranscript(f.title))
    );
    if (hit) return hit;
  }
  const stop = new Set(["the", "a", "an", "video", "play", "chalao", "please", "python", "tutorial"]);
  const words = q.split(" ").filter((w) => w && !stop.has(w));
  if (words.length === 0) return null;
  let best: VideoTarget | null = null;
  let bestScore = 0;
  for (const target of pool) {
    const title = normalizeTranscript(target.title);
    let score = 0;
    for (const w of words) {
      if (title.includes(w)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = target;
    }
  }
  return bestScore >= 2 ? best : null;
}

const NAV_PATHS: Record<string, string> = {
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

function formatSeconds(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} seconds`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${m} minute${m === 1 ? "" : "s"}` : `${m} minute${m === 1 ? "" : "s"} ${rest} seconds`;
}

// Dispatch a window event and wait for the owning page's *-done
// reply. Null means no page answered (not on that page).
export function dispatchAndWait(
  eventName: string,
  doneName: string,
  detail: Record<string, unknown>,
  timeoutMs = 1200
): Promise<Record<string, unknown> | null> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener(doneName, onDone);
      resolve(null);
    }, timeoutMs);
    const onDone = (event: Event) => {
      window.clearTimeout(timer);
      window.removeEventListener(doneName, onDone);
      const detailValue = (event as CustomEvent).detail;
      resolve(
        typeof detailValue === "object" && detailValue !== null
          ? (detailValue as Record<string, unknown>)
          : null
      );
    };
    window.addEventListener(doneName, onDone);
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  });
}

export function realCommandEnv(overrides: Partial<CommandEnv> = {}): CommandEnv {
  const base: CommandEnv = {
    navigate: (path) => {
      window.location.assign(path);
    },
    goBack: () => window.history.back(),
    goForward: () => window.history.forward(),
    scrollBy: (dy) => window.scrollBy({ top: dy, behavior: "smooth" }),
    scrollTo: (position) =>
      window.scrollTo({ top: position === "top" ? 0 : document.body.scrollHeight, behavior: "smooth" }),
    viewportHeight: typeof window !== "undefined" ? window.innerHeight : 800,
    setTutorOpen: () => {},
    setTheme: () => {},
    findVideo: () => document.querySelector("video") as VoiceVideoElement | null,
    dispatchEditor: (detail) => dispatchAndWait(VOICE_EDITOR_EVENT, VOICE_EDITOR_DONE_EVENT, detail),
    dispatchVideo: (detail) => dispatchAndWait(VOICE_VIDEO_EVENT, VOICE_VIDEO_DONE_EVENT, detail),
    setPendingVideoIndex: (index) => {
      try {
        sessionStorage.setItem(PENDING_VIDEO_INDEX_KEY, String(index));
      } catch {
        // Private mode — the page just starts at the first video.
      }
    },
    setPendingOpenFile: (name) => {
      try {
        sessionStorage.setItem(PENDING_OPEN_FILE_KEY, name);
      } catch {
        // Private mode — the editor just opens as usual.
      }
    },
    resolveVideoTarget: (query) => resolveVideoTarget(query),
  };
  return { ...base, ...overrides };
}

export interface CommandContext {
  pathname?: string;
  topicSlug?: string;
}

export async function executeVoiceCommand(
  cmd: VoiceCommand,
  env: CommandEnv,
  ctx: CommandContext = {}
): Promise<string> {
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
      const idx = LEARN_TOPIC_SLUGS.indexOf(ctx.topicSlug);
      if (idx < 0) return "Open a lesson first, then say next lesson.";
      const next = cmd.type === "lesson-next" ? idx + 1 : idx - 1;
      if (next < 0) return "This is the first lesson.";
      if (next >= LEARN_TOPIC_SLUGS.length) return "This is the last lesson.";
      const slug = LEARN_TOPIC_SLUGS[next];
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
      const done = await env.dispatchVideo({
        action: cmd.type === "video-next" ? "next" : "prev",
      });
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
  }
}
