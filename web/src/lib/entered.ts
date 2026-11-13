// Entry/roadmap helpers.
//
// The old localStorage entry flag (lp_entered_v1) is GONE — entry is now
// decided by the real Google session (GET /api/auth/me, see
// web/src/lib/auth-client.ts). What remains here is per-device UI state:
// whether the animated roadmap has auto-shown, and which lesson the
// roadmap picked. No session data lives in localStorage, ever.
//
// The read/write functions are injected so the helpers stay pure and
// unit-testable (mirrors the pattern in progress.ts).

export const ROADMAP_SEEN_KEY = "lp_roadmap_seen";
export const ACTIVE_LESSON_KEY = "lp_active_lesson";

// Fired when the roadmap should open (first entry, or from the profile
// dropdown). AppNavbar listens for it and renders the Roadmap overlay.
export const ROADMAP_OPEN_EVENT = "lp:open-roadmap";

// Fired with the lesson id (event.detail) when a roadmap lesson is picked.
export const LESSON_SELECT_EVENT = "lp:select-lesson";

type ReadFn = (key: string) => string | null;
type WriteFn = (key: string, value: string) => void;

export function hasSeenRoadmap(read: ReadFn): boolean {
  try {
    return read(ROADMAP_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markRoadmapSeen(write: WriteFn): void {
  try {
    write(ROADMAP_SEEN_KEY, "1");
  } catch {
    // Private mode: the roadmap may auto-show again next visit.
  }
}

export function readActiveLessonId(read: ReadFn): string | null {
  try {
    return read(ACTIVE_LESSON_KEY);
  } catch {
    return null;
  }
}

export function clearActiveLessonId(remove: (key: string) => void): void {
  try {
    remove(ACTIVE_LESSON_KEY);
  } catch {
    // Ignore.
  }
}
