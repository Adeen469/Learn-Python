// Bundled content — generated from the web catalog by
// scripts/generate-content.mjs (re-run after any web catalog edit).
// Nothing here is fetched at runtime: the app works with no account
// and no setup.
import content from "../assets/content.json";

export type TutorialBlock =
  | { type: "heading"; text: string }
  | { type: "para"; text: string }
  | { type: "code"; code: string; output?: string; title?: string }
  | { type: "list"; items: string[] }
  | { type: "note"; text: string }
  | { type: "tip"; text: string };

export interface Tutorial {
  slug: string;
  title: string;
  intro: string;
  blocks: TutorialBlock[];
  practice: string[];
  summary: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface VideoLesson {
  id: string;
  title: string;
  moduleTitle: string;
  courseTitle: string;
  durationSeconds: number;
  videoUrl: string;
  videoSource: "mega" | "drive";
  notes: string;
  quiz?: QuizQuestion[];
}

export interface CourseVideo {
  title: string;
  videoId: string;
  durationSeconds?: number;
  megaLessonId?: string;
}

export interface CoursePlaylist {
  title: string;
  url: string;
  videos: CourseVideo[];
}

export interface CourseCreator {
  name: string;
  slug: string;
  tagline: string;
  handle: string;
  avatarUrl: string;
  subscribers: string;
  language: string;
  playlists: CoursePlaylist[];
  oneShots: CourseVideo[];
}

const data = content as {
  tutorials: Tutorial[];
  videoLessons: VideoLesson[];
  creators: CourseCreator[];
};

export const TUTORIALS = data.tutorials;
export const VIDEO_LESSONS = data.videoLessons;
export const CREATORS = data.creators;

const tutorialBySlug = new Map(TUTORIALS.map((t) => [t.slug, t]));
const lessonById = new Map(VIDEO_LESSONS.map((l) => [l.id, l]));

export const getTutorial = (slug: string) => tutorialBySlug.get(slug);
export const getVideoLesson = (id: string) => lessonById.get(id);
export const getCreator = (slug: string) =>
  CREATORS.find((c) => c.slug === slug);

export const allVideos: CourseVideo[] = CREATORS.flatMap((c) => [
  ...c.playlists.flatMap((p) => p.videos),
  ...c.oneShots,
]);
export const playableVideos = allVideos.filter((v) => v.megaLessonId);

// A MEGA share link cannot play directly, so videos stream through
// the website's own video endpoint — the same one the website uses.
// It is public (rate-limited, no sign-in) and serves the MEGA/Drive
// file with Range support, which is what expo-video needs.
export const VIDEO_API = "https://learnpythonprogram.vercel.app/api/video";
export const streamUrl = (lessonId: string) => `${VIDEO_API}/${lessonId}`;

export function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
