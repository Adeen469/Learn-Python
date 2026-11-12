export interface Lesson {
  id: string;
  title: string;
  moduleTitle: string;
  courseTitle: string;
  durationSeconds: number;
  videoUrl: string;
  notes: string;
}

// Seed lesson using your test MEGA file until Supabase env vars are connected.
const SEED_LESSONS: Lesson[] = [
  {
    id: "sample-mega-01",
    title: "Sample Lecture (MEGA Stream + Offline Test)",
    moduleTitle: "Module 1: Getting Started",
    courseTitle: "LP Foundation",
    durationSeconds: 315,
    videoUrl: "https://mega.nz/file/pcQB0LQK#0ogh7nPPNB-hoYC_Y5GzfVZOfr5sNSmBsjVhx92CpIA",
    notes: "Streamed and decrypted on the fly from MEGA. Click 'Save Offline' to cache inside the app.",
  },
];

export function getLessons(): Lesson[] {
  return SEED_LESSONS;
}

export function getLessonById(lessonId: string): Lesson | null {
  return SEED_LESSONS.find((l) => l.id === lessonId) ?? null;
}

