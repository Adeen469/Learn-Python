// Entry flag: a lightweight localStorage stand-in for login.
//
// There is NO login system yet — "entered" just means the guest pressed
// "Start learning" on the landing page. Real Google sign-in will replace
// this flag with a session check later; keep the key names stable so that
// migration is a one-line swap inside isEntered().
//
// The read/write functions are injected so the helpers stay pure and
// unit-testable (mirrors the pattern in progress.ts).

export const ENTERED_KEY = "lp_entered_v1";
export const ROADMAP_SEEN_KEY = "lp_roadmap_seen";
export const ACTIVE_LESSON_KEY = "lp_active_lesson";

// Fired when the roadmap should open (first entry, or from the profile
// dropdown). AppNavbar listens for it and renders the Roadmap overlay.
export const ROADMAP_OPEN_EVENT = "lp:open-roadmap";

// Fired with the lesson id (event.detail) when a roadmap lesson is picked.
export const LESSON_SELECT_EVENT = "lp:select-lesson";

type ReadFn = (key: string) => string | null;
type WriteFn = (key: string, value: string) => void;

export function isEntered(read: ReadFn): boolean {
  try {
    return read(ENTERED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markEntered(write: WriteFn): void {
  try {
    write(ENTERED_KEY, "1");
  } catch {
    // Private mode: entry just doesn't persist.
  }
}

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
