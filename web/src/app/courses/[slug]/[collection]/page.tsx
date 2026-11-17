"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowLeft, CheckCircle2, Circle, Play } from "lucide-react";
import { fetchSessionUser } from "@/lib/auth-client";
import { AppNavbar } from "@/components/AppNavbar";
import { VideoPlayer } from "@/components/VideoPlayer";
import AnimatedList, { type AnimatedListEntry } from "@/components/AnimatedList";
import {
  THEME_CHANGED_EVENT,
  getStoredTheme,
  type Theme,
} from "@/lib/theme";
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
 * The AnimatedList's built-in dark theme is a purple-grey; these
 * overrides keep the list in the app's own black/neutral palette.
 * (Light mode uses the component's built-in light theme as-is.)
 */
const AL_DARK_OVERRIDES = {
  "--al-frame": "rgba(10, 10, 10, 0.95)",
  "--al-frame-edge": "rgba(255, 255, 255, 0.08)",
  "--al-frame-highlight": "rgba(255, 255, 255, 0.05)",
  "--al-frame-shadow": "none",
  "--al-tile": "linear-gradient(180deg, #171717 0%, #0a0a0a 100%)",
  "--al-tile-edge": "rgba(255, 255, 255, 0.07)",
  "--al-tile-highlight": "rgba(255, 255, 255, 0.06)",
  "--al-tile-shadow": "0 4px 10px -4px rgba(0, 0, 0, 0.7)",
  "--al-well": "rgba(255, 255, 255, 0.08)",
  "--al-ink": "#ffffff",
  "--al-muted": "rgba(255, 255, 255, 0.55)",
  "--al-thumb": "rgba(255, 255, 255, 0.16)",
  "--al-ring": "rgba(255, 255, 255, 0.7)",
  "--al-ring-fill": "rgba(255, 255, 255, 0.04)",
} as CSSProperties;

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
  const [theme, setTheme] = useState<Theme>("dark");

  // The lessons list follows the app theme (same pattern as the editor).
  useEffect(() => {
    setTheme(getStoredTheme());
    const sync = () => setTheme(getStoredTheme());
    window.addEventListener(THEME_CHANGED_EVENT, sync);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, sync);
  }, []);

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

  // The Mark Complete / Watched % button for the active video. It used
  // to live in a title card under the player; that card made the page
  // scroll, so the button now sits in the player's footer row (next to
  // Save Offline for MEGA videos, in the same row under the YouTube
  // embed otherwise).
  const completionButton = (
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
  );

  // The video list, as React Bits AnimatedList entries — same rows as
  // before (Play icon, title, duration, status), now springing into
  // view with a gliding selection ring.
  const listItems: AnimatedListEntry[] = videos.map((video) => {
    const done = completedIds.includes(completionId(video));
    return {
      id: completionId(video),
      icon: <Play className="h-4 w-4" />,
      title: video.title,
      description: done ? "Completed" : "Not started",
      meta: formatDuration(video.durationSeconds),
    };
  });

  return (
    // The page itself never scrolls — it is exactly one viewport tall
    // and the content scrolls inside the container below (with its
    // scrollbar hidden, so no page sidebar ever shows). On desktop the
    // content fits, so this changes nothing visible; on narrow screens
    // the stacked video + cards scroll inside instead of the page.
    <div className="h-dvh bg-black text-white flex flex-col overflow-hidden pb-20 md:pb-0">
      <AppNavbar />
      <div className="mx-auto max-w-6xl px-4 py-6 w-full flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                completionButton={completionButton}
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
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 px-4 py-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-medium text-white">
                      {activeVideo.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      Playing from YouTube — MEGA link coming soon
                    </p>
                  </div>
                  <div className="flex items-center gap-2">{completionButton}</div>
                </div>
              </div>
            )}
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
              <div className="mt-3">
                <AnimatedList
                  items={listItems}
                  initialSelectedIndex={activeIndex}
                  onItemSelect={(_item, index) => {
                    setActiveIndex(index);
                    setActiveCoverage({ fraction: 0, seconds: 0 });
                  }}
                  frame={false}
                  width="100%"
                  // Exactly 4 rows visible: 4 tiles + 3 gaps (256px) +
                  // the list's own 6px top/bottom padding (12px).
                  // Gradients off — with only 4 rows the bottom fade
                  // would dim the 4th row and make it look cut off;
                  // the scrollbar still shows there's more below.
                  maxHeight={268}
                  showGradients={false}
                  radius={12}
                  gap={8}
                  theme={theme}
                  style={theme === "dark" ? AL_DARK_OVERRIDES : undefined}
                />
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
