import assert from "node:assert/strict";
import test from "node:test";

// Inline pure helpers for zero-build node --test verification
// (mirrors web/src/lib/entered.ts)

const ENTERED_KEY = "lp_entered_v1";
const ROADMAP_SEEN_KEY = "lp_roadmap_seen";
const ACTIVE_LESSON_KEY = "lp_active_lesson";

function isEntered(read) {
  try {
    return read(ENTERED_KEY) === "1";
  } catch {
    return false;
  }
}

function markEntered(write) {
  try {
    write(ENTERED_KEY, "1");
  } catch {
    // Private mode: entry just doesn't persist.
  }
}

function hasSeenRoadmap(read) {
  try {
    return read(ROADMAP_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markRoadmapSeen(write) {
  try {
    write(ROADMAP_SEEN_KEY, "1");
  } catch {
    // Private mode: the roadmap may auto-show again next visit.
  }
}

function readActiveLessonId(read) {
  try {
    return read(ACTIVE_LESSON_KEY);
  } catch {
    return null;
  }
}

function clearActiveLessonId(remove) {
  try {
    remove(ACTIVE_LESSON_KEY);
  } catch {
    // Ignore.
  }
}

function fakeStore(initial = {}) {
  const store = { ...initial };
  return {
    read: (key) => (key in store ? store[key] : null),
    write: (key, value) => {
      store[key] = value;
    },
    remove: (key) => {
      delete store[key];
    },
    snapshot: () => ({ ...store }),
  };
}

test("guest is not entered until the flag is set", () => {
  const s = fakeStore();
  assert.equal(isEntered(s.read), false);
  markEntered(s.write);
  assert.equal(isEntered(s.read), true);
  assert.equal(s.snapshot()[ENTERED_KEY], "1");
});

test("roadmap seen flag gates the first-entry auto-show", () => {
  const s = fakeStore();
  assert.equal(hasSeenRoadmap(s.read), false);
  markRoadmapSeen(s.write);
  assert.equal(hasSeenRoadmap(s.read), true);
});

test("active lesson id round-trips and clears", () => {
  const s = fakeStore();
  assert.equal(readActiveLessonId(s.read), null);
  s.write(ACTIVE_LESSON_KEY, "python-day-042");
  assert.equal(readActiveLessonId(s.read), "python-day-042");
  clearActiveLessonId(s.remove);
  assert.equal(readActiveLessonId(s.read), null);
});

test("a throwing store fails closed, never throws", () => {
  const throwing = {
    read: () => {
      throw new Error("denied");
    },
    write: () => {
      throw new Error("denied");
    },
    remove: () => {
      throw new Error("denied");
    },
  };
  assert.equal(isEntered(throwing.read), false);
  assert.equal(hasSeenRoadmap(throwing.read), false);
  assert.equal(readActiveLessonId(throwing.read), null);
  assert.doesNotThrow(() => markEntered(throwing.write));
  assert.doesNotThrow(() => markRoadmapSeen(throwing.write));
  assert.doesNotThrow(() => clearActiveLessonId(throwing.remove));
});
