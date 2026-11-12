export interface Lesson {
  id: string;
  title: string;
  moduleTitle: string;
  courseTitle: string;
  durationSeconds: number;
  videoUrl: string;
  videoSource: "mega" | "drive";
  notes: string;
}

// HOW TO ADD A VIDEO
// MEGA: upload to MEGA, copy the share link, add an entry here with
// videoSource "mega" and videoUrl set to the full share link.
// DRIVE: in Drive, share the file as Anyone with the link, copy the
// file ID from the share URL, add an entry with videoSource "drive"
// and videoUrl set to the file ID only (not the full URL).
// After adding an entry, push to main and trigger a Fly deploy —
// lessons are still hardcoded here, not in Supabase yet.

// Seed lesson using your test MEGA file until Supabase env vars are connected.
const SEED_LESSONS: Lesson[] = [
  {
    id: "sample-mega-01",
    title: "Sample Lecture (MEGA Stream + Offline Test)",
    moduleTitle: "Module 1: Getting Started",
    courseTitle: "LP Foundation",
    durationSeconds: 315,
    videoUrl: "https://mega.nz/file/pcQB0LQK#0ogh7nPPNB-hoYC_Y5GzfVZOfr5sNSmBsjVhx92CpIA",
    videoSource: "mega",
    notes: "Streamed and decrypted on the fly from MEGA. Click 'Save Offline' to cache inside the app.",
  },
  {
    id: "sample-mega-02",
    title: "Research",
    moduleTitle: "Module 2: Getting Started",
    courseTitle: "LP Foundation",
    durationSeconds: 315,
    videoUrl: "https://mega.nz/file/QYBHBKzD#BHk9whe7PvZd57NlKUYV_QmUs76jGbrN-nQCafBCEE4",
    videoSource: "mega",
    notes: "Streamed and decrypted on the fly from MEGA. Click 'Save Offline' to cache inside the app.",
  },
  {
    id: "drive-test-01",
    title: "Drive Test Video",
    moduleTitle: "Module 1: Getting Started",
    courseTitle: "LP Foundation",
    durationSeconds: 0,
    videoUrl: "dBJFwpXJwPpp8-4DKlRprezVXLc4ErmS",
    videoSource: "drive",
    notes: "Test video streamed from Google Drive.",
  },
];

export function getLessons(): Lesson[] {
  return SEED_LESSONS;
}

export function getLessonById(lessonId: string): Lesson | null {
  return SEED_LESSONS.find((l) => l.id === lessonId) ?? null;
}

