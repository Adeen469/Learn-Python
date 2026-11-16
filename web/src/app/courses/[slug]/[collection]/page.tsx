"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Play } from "lucide-react";
import { fetchSessionUser } from "@/lib/auth-client";
import { AppNavbar } from "@/components/AppNavbar";
import { VideoPlayer } from "@/components/VideoPlayer";
import {
  PROGRESS_KEY,
  PROGRESS_UPDATED_EVENT,
  WATCH_QUALIFY_FRACTION,
  creditLessonWatch,
  loadProgress,
  markActive,
  progressPercent,
  wholeMinutes,
  withGoal,
  type ProgressState,
} from "@/lib/progress";
import {
  COURSE_CREATORS,
  playlistListId,
  type CourseVideo,
} from "@/lib/courses/data";

function formatDuration(totalSeconds?: number): string {
  if (totalSeconds === undefined) return "";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  // Video lengths read h:m:s once they pass an hour (6:14:07, not
  // 374:07); shorter ones stay m:ss (11:50). Totals elsewhere read
  // "nh nm" (17h 57m).
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * The key a watched video is completed under. A video with a MEGA
 * lesson shares its id with the matching lesson, so completing it
 * here also completes that lesson.
 */
function completionId(video: CourseVideo): string {
  return video.megaLessonId ?? video.videoId;
}

/**
 * Course player — the old course UI: video + Today's Progress +
 * lesson list. Videos play from MEGA/Drive through
 * /api/video/[lessonId]; a video with no MEGA link yet shows the
 * coming-soon box. Same auth gate as the hub.
 */
export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ slug: string; collection: string }>;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [route, setRoute] = useState<{ slug: string; collection: string } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressState>(() =>
    loadProgress((key) => (typeof localStorage === "undefined" ? null : localStorage.getItem(key)))
  );
  const [activeCoverage, setActiveCoverage] = useState({ fraction: 0, seconds: 0 });

  useEffect(() => {
    let cancelled = false;
    params.then((p) => {
      if (!cancelled) setRoute(p);
    });
    fetchSessionUser().then((user) => {
      if (cancelled) return;
      if (!user) {
        router.replace("/");
        return;
      }
      setChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  useEffect(() => {
    const savedCompleted = localStorage.getItem("lp_completed_lessons");
    if (savedCompleted) {
      try {
        setCompletedIds(JSON.parse(savedCompleted));
      } catch {
        // Ignore corrupt saved data.
      }
    }
    const loaded = loadProgress((key) => localStorage.getItem(key));
    setProgress(loaded);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(loaded));
  }, []);

  if (!checked || route === null) return null;

  const creator = COURSE_CREATORS.find((c) => c.slug === route.slug);
  if (!creator) {
    router.replace("/courses");
    return null;
  }

  const isOneShots = route.collection === "one-shots";
  const playlist = isOneShots
    ? null
    : creator.playlists.find((p) => playlistListId(p.url) === route.collection);
  if (!isOneShots && !playlist) {
    router.replace(`/courses/${creator.slug}`);
    return null;
  }

  const collectionTitle = isOneShots
    ? "One-shot videos on Python"
    : (playlist?.title ?? "");
  const videos: CourseVideo[] = isOneShots ? creator.oneShots : (playlist?.videos ?? []);
  const activeVideo = videos[Math.min(activeIndex, Math.max(0, videos.length - 1))];
  if (!activeVideo) {
    router.replace(`/courses/${creator.slug}`);
    return null;
  }

  function updateProgress(fn: (prev: ProgressState) => ProgressState) {
    setProgress((prev) => {
      const next = fn(prev);
      if (next === prev) return prev;
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
      return next;
    });
  }

  function markVideoComplete(id: string) {
    setCompletedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("lp_completed_lessons", JSON.stringify(next));
      return next;
    });
    updateProgress((prev) => markActive(prev));
  }

  function qualifyVideo(id: string, coveredSeconds: number) {
    updateProgress((prev) => creditLessonWatch(prev, id, coveredSeconds));
    markVideoComplete(id);
  }

  function handleVideoQualified(coveredSeconds: number) {
    qualifyVideo(completionId(activeVideo), coveredSeconds);
  }

  const goalPct = progressPercent(progress);
  const isDone = completedIds.includes(completionId(activeVideo));
  // YouTube videos can't report watch coverage, so their Mark Complete
  // button is manual (always enabled); MEGA videos need 95% watched.
  const isYouTube = !activeVideo.megaLessonId;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0">
      <AppNavbar />
      <div className="mx-auto max-w-6xl px-4 py-6 w-full flex-1">
        <Link
          href={`/courses/${creator.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> {creator.name}
        </Link>

        <main className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Video Player & title */}
          <section className="space-y-4 lg:col-span-2">
            {activeVideo.megaLessonId ? (
              <VideoPlayer
                lessonId={activeVideo.megaLessonId}
                title={activeVideo.title}
                onWatchCoverage={(fraction, seconds) =>
                  setActiveCoverage({ fraction, seconds })
                }
                onLessonQualified={handleVideoQualified}
              />
            ) : (
              // No MEGA/Drive link yet: play from YouTube for now.
              // Maalik will replace these with MEGA/Drive links when
              // he has them (then megaLessonId is set and the
              // VideoPlayer above takes over). Watch time can't be
              // measured inside the embed, so Mark Complete below is
              // manual for these videos.
              <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
                <div className="border-t border-neutral-800 px-4 py-3">
                  <h2 className="truncate text-sm font-medium text-white">
                    {activeVideo.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Playing from YouTube — MEGA link coming soon
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs uppercase tracking-wider text-neutral-500">
                    {creator.name} • {collectionTitle}
                  </p>
                  <h1 className="mt-1 text-lg font-semibold text-white">
                    {activeVideo.title}
                  </h1>
                </div>
                <div className="flex shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      qualifyVideo(completionId(activeVideo), activeCoverage.seconds)
                    }
                    disabled={
                      !isDone &&
                      !isYouTube &&
                      activeCoverage.fraction < WATCH_QUALIFY_FRACTION
                    }
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-neutral-900"
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-white" /> Completed
                      </>
                    ) : isYouTube ||
                      activeCoverage.fraction >= WATCH_QUALIFY_FRACTION ? (
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
                  onChange={(e) =>
                    updateProgress((prev) => withGoal(prev, Number(e.target.value)))
                  }
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
                {videos.map((video, i) => {
                  const active = i === activeIndex;
                  const done = completedIds.includes(completionId(video));
                  return (
                    <li key={video.videoId}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveIndex(i);
                          setActiveCoverage({ fraction: 0, seconds: 0 });
                        }}
                        className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
                          active
                            ? "border-white bg-neutral-900"
                            : "border-neutral-800 bg-black hover:border-neutral-700"
                        }`}
                      >
                        <Play className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {video.title}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {formatDuration(video.durationSeconds)} •{" "}
                            {done ? "Completed" : "Not started"}
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
      </div>
    </div>
  );
}
