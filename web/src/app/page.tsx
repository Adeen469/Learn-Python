"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, CheckCircle2, Circle, Flame, Play, Target } from "lucide-react";
import { getLessons, type Lesson } from "@/lib/catalog";
import {
  PROGRESS_KEY,
  PROGRESS_UPDATED_EVENT,
  WATCH_QUALIFY_FRACTION,
  creditLessonWatch,
  emptyProgress,
  loadProgress,
  markActive,
  progressPercent,
  todayKey,
  wholeMinutes,
  withGoal,
  type ProgressState,
} from "@/lib/progress";
import { SplashScreen } from "@/components/SplashScreen";
import { VideoPlayer } from "@/components/VideoPlayer";
import { QuizModal } from "@/components/QuizModal";
import { AppNavbar } from "@/components/AppNavbar";
import { LandingPage } from "@/components/LandingPage";
import {
  ACTIVE_LESSON_KEY,
  LESSON_SELECT_EVENT,
  ROADMAP_OPEN_EVENT,
  clearActiveLessonId,
  hasSeenRoadmap,
  markRoadmapSeen,
  readActiveLessonId,
} from "@/lib/entered";
import { fetchSessionUser, type SessionUser } from "@/lib/auth-client";

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function HomePage() {
  // Seed list first (instant render, works offline); replaced by the
  // Supabase list from /api/lessons on mount when that fetch succeeds.
  const [lessons, setLessons] = useState<Lesson[]>(() => getLessons());
  const activeLessonIdRef = useRef<string>(lessons[0].id);
  const [activeLesson, setActiveLesson] = useState<Lesson>(lessons[0]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [testPassedIds, setTestPassedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressState>(() => emptyProgress(todayKey()));
  const [activeCoverage, setActiveCoverage] = useState({ fraction: 0, seconds: 0 });
  const [showQuiz, setShowQuiz] = useState(false);

  // Auth gate: the app is decided by the real Google session
  // (GET /api/auth/me), not a local flag. `checked` is false until the
  // first session check resolves — brief splash, no content flash.
  const [auth, setAuth] = useState<{ checked: boolean; user: SessionUser | null }>({
    checked: false,
    user: null,
  });
  const [pendingRoadmap, setPendingRoadmap] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSessionUser().then((user) => {
      if (cancelled) return;
      setAuth({ checked: true, user });
      // First sign-in on this device: the animated roadmap opens on top
      // of the course. It must not auto-show again after closing
      // (lp_roadmap_seen).
      if (user && !hasSeenRoadmap((key) => localStorage.getItem(key))) {
        markRoadmapSeen((key, value) => localStorage.setItem(key, value));
        setPendingRoadmap(true);
      }
    });
    // A lesson picked in the roadmap (on any page) selects it here.
    const pick = readActiveLessonId((key) => localStorage.getItem(key));
    if (pick) {
      const found = getLessons().find((l) => l.id === pick);
      if (found) {
        activeLessonIdRef.current = found.id;
        setActiveLesson(found);
        setActiveCoverage({ fraction: 0, seconds: 0 });
      }
      clearActiveLessonId((key) => localStorage.removeItem(key));
    }
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const found = getLessons().find((l) => l.id === id);
      if (found) {
        setActiveLesson(found);
        setActiveCoverage({ fraction: 0, seconds: 0 });
      }
    };
    window.addEventListener(LESSON_SELECT_EVENT, onSelect);
    return () => {
      cancelled = true;
      window.removeEventListener(LESSON_SELECT_EVENT, onSelect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire the roadmap-open event after the course (and AppNavbar, which
  // listens for it) has rendered following sign-in.
  useEffect(() => {
    if (auth.user && pendingRoadmap) {
      setPendingRoadmap(false);
      window.dispatchEvent(new Event(ROADMAP_OPEN_EVENT));
    }
  }, [auth.user, pendingRoadmap]);

  useEffect(() => {
    const savedCompleted = localStorage.getItem("lp_completed_lessons");
    if (savedCompleted) {
      try {
        setCompletedIds(JSON.parse(savedCompleted));
      } catch {
        // Ignore corrupt saved data.
      }
    }
    const savedTests = localStorage.getItem("lp_test_passed");
    if (savedTests) {
      try {
        const parsed: unknown = JSON.parse(savedTests);
        if (Array.isArray(parsed)) {
          setTestPassedIds(parsed.filter((v) => typeof v === "string"));
        }
      } catch {
        // Ignore corrupt saved data.
      }
    }
    // Load today's progress (resets automatically on a new calendar day)
    // and drop the old inflated minute counter, if present.
    const loaded = loadProgress((key) => localStorage.getItem(key));
    setProgress(loaded);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(loaded));
    localStorage.removeItem("lp_minutes_today");
  }, []);

  // Keep the ref in sync so the lessons fetch below reads the current id.
  useEffect(() => {
    activeLessonIdRef.current = activeLesson.id;
  });

  // Load the lesson list from Supabase via /api/lessons. On success the
  // list is replaced (the active lesson is kept if its id still exists,
  // refreshed to the server copy; otherwise the first lesson is selected).
  // On failure the seed list stays on screen — silent fallback.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/lessons")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.lessons) || data.lessons.length === 0) return;
        const fetched = data.lessons as Lesson[];
        setLessons(fetched);
        const current = fetched.find((l) => l.id === activeLessonIdRef.current);
        if (current) {
          setActiveLesson(current);
        } else {
          setActiveLesson(fetched[0]);
          setActiveCoverage({ fraction: 0, seconds: 0 });
        }
      })
      .catch(() => {
        // Silent fallback: the seed list stays on screen.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function updateProgress(fn: (prev: ProgressState) => ProgressState) {
    setProgress((prev) => {
      const next = fn(prev);
      if (next === prev) return prev;
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
      return next;
    });
  }

  function handleWatchCoverage(fraction: number, coveredSeconds: number) {
    setActiveCoverage({ fraction, seconds: coveredSeconds });
  }

  // 95% rule: a lesson is completed and credited only once 95% of it has
  // actually been watched. Credit is once per lesson per day (guarded in
  // the progress lib), so re-opening a finished lesson never inflates today.
  function qualifyLesson(lessonId: string, coveredSeconds: number) {
    updateProgress((prev) => creditLessonWatch(prev, lessonId, coveredSeconds));
    markLessonComplete(lessonId);
  }

  function handleLessonQualified(coveredSeconds: number) {
    qualifyLesson(activeLesson.id, coveredSeconds);
  }

  function markLessonComplete(lessonId: string) {
    setCompletedIds((prev) => {
      if (prev.includes(lessonId)) return prev;
      const next = [...prev, lessonId];
      localStorage.setItem("lp_completed_lessons", JSON.stringify(next));
      return next;
    });
    // Completing a lesson counts as activity for the streak, but adds no
    // watch minutes — minutes come only from actual playback.
    updateProgress((prev) => markActive(prev));
  }

  // Passing a lesson's test earns a "Test passed" badge. It does NOT
  // credit watch minutes — today's progress only counts minutes actually
  // watched. It does count as activity for the streak.
  function handleTestPass(lessonId: string) {
    setTestPassedIds((prev) => {
      if (prev.includes(lessonId)) return prev;
      const next = [...prev, lessonId];
      localStorage.setItem("lp_test_passed", JSON.stringify(next));
      return next;
    });
    updateProgress((prev) => markActive(prev));
  }

  const goalPct = progressPercent(progress);

  // Session not yet checked — brief splash, no content flash.
  if (!auth.checked) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <SplashScreen />
      </div>
    );
  }

  // Guests see ONLY the landing page — no course, no app navigation.
  if (!auth.user) {
    return <LandingPage />;
  }

  return (
    // pb-20 clears the mobile bottom nav bar (md:pb-0: PC has no bottom bar).
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0">
      <SplashScreen />
      <AppNavbar />

      {/* Main Content */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-3 flex-1 w-full">
        {/* Left: Video Player & Notes */}
        <section className="space-y-4 lg:col-span-2">
          {activeLesson.videoUrl ? (
            <VideoPlayer
              lessonId={activeLesson.id}
              title={activeLesson.title}
              onWatchCoverage={handleWatchCoverage}
              onLessonQualified={handleLessonQualified}
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-6 text-center">
              <p className="text-sm font-medium text-white">Video coming soon</p>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-neutral-400">
                This lesson hasn&apos;t been uploaded to MEGA yet. Check back soon — more
                videos are added regularly.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs uppercase tracking-wider text-neutral-500">
                  {activeLesson.courseTitle} • {activeLesson.moduleTitle}
                </p>
                <h1 className="mt-1 text-lg font-semibold text-white">
                  {activeLesson.title}
                </h1>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                {activeLesson.quiz && activeLesson.quiz.length > 0 && !completedIds.includes(activeLesson.id) && (
                  <button
                    type="button"
                    onClick={() => setShowQuiz(true)}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition"
                  >
                    Take test
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => qualifyLesson(activeLesson.id, activeCoverage.seconds)}
                  disabled={
                    !completedIds.includes(activeLesson.id) &&
                    activeCoverage.fraction < WATCH_QUALIFY_FRACTION
                  }
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-neutral-900"
                >
                  {completedIds.includes(activeLesson.id) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-white" /> Completed
                    </>
                  ) : activeCoverage.fraction >= WATCH_QUALIFY_FRACTION ? (
                    <>
                      <Circle className="h-4 w-4 text-neutral-400" /> Mark Complete
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 text-neutral-400" /> Watched{" "}
                      {Math.round(activeCoverage.fraction * 100)}%
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              {activeLesson.notes}
            </p>
            {testPassedIds.includes(activeLesson.id) && !completedIds.includes(activeLesson.id) && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-green-400">
                <BadgeCheck className="h-4 w-4" /> Test passed
              </p>
            )}
          </div>
        </section>

        {/* Right: Daily Goal Card & Lessons List */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-300">Today&apos;s Progress</span>
              <span className="font-semibold text-white">{goalPct}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              {wholeMinutes(progress.seconds)} min watched of {progress.goalMinutes} min goal
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
              <span>Target (min/day)</span>
              <select
                value={progress.goalMinutes}
                onChange={(e) => updateProgress((prev) => withGoal(prev, Number(e.target.value)))}
                className="rounded border border-neutral-800 bg-black px-2 py-1 text-xs text-white"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Course Lessons
            </h3>
            <ul className="mt-3 space-y-2">
              {lessons.map((lesson) => {
                const isActive = lesson.id === activeLesson.id;
                const isDone = completedIds.includes(lesson.id);
                const isTestPassed = testPassedIds.includes(lesson.id);
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLesson(lesson);
                        setActiveCoverage({ fraction: 0, seconds: 0 });
                      }}
                      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
                        isActive
                          ? "border-white bg-neutral-900"
                          : "border-neutral-800 bg-black hover:border-neutral-700"
                      }`}
                    >
                      <Play className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {lesson.title}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {formatDuration(lesson.durationSeconds)} •{" "}
                          {isDone ? "Completed" : isTestPassed ? "Test passed" : "Not started"}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </main>
      {showQuiz && activeLesson.quiz && activeLesson.quiz.length > 0 && (
        <QuizModal
          lesson={activeLesson}
          onClose={() => setShowQuiz(false)}
          onPass={handleTestPass}
        />
      )}
    </div>
  );
}

