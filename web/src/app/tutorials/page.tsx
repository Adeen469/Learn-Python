"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  Clock,
  Play,
  Search,
} from "lucide-react";
import { fetchSessionUser } from "@/lib/auth-client";
import { getLessons, type Lesson } from "@/lib/catalog";
import {
  ROADMAP_STAGES,
  buildRoadmapStages,
  dayNumberOf,
} from "@/lib/roadmap";
import { getTutorial } from "@/lib/tutorials/index";

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Tutorials hub — the main learning surface now. Text first, like
 * W3Schools / GeeksforGeeks: every lesson is a written tutorial with
 * examples you can read and try, and the video sits inside the
 * lesson page as a supplement. Guests never see this page — the
 * same gate as the editor sends them back to the landing page.
 */
export default function TutorialsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>(() => getLessons());
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
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
  }, [router]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lp_completed_lessons");
      if (saved) setCompletedIds(JSON.parse(saved));
    } catch {
      // Ignore corrupt saved data.
    }
    let cancelled = false;
    fetch("/api/lessons")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.lessons) || data.lessons.length === 0) return;
        setLessons(data.lessons as Lesson[]);
      })
      .catch(() => {
        // Silent fallback: the seed list stays.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stages = buildRoadmapStages(lessons, completedIds);
  const totalDone = stages.reduce((n, s) => n + s.completedCount, 0);
  const totalLessons = stages.reduce((n, s) => n + s.lessons.length, 0);
  const overallPct =
    totalLessons === 0 ? 0 : Math.round((totalDone / totalLessons) * 100);
  const nextLesson =
    stages.flatMap((s) => s.lessons).find((l) => !completedIds.includes(l.id)) ??
    null;

  const q = query.trim().toLowerCase();
  const visibleStages = useMemo(() => {
    if (!q) return stages;
    return stages
      .map((stage) => ({
        ...stage,
        lessons: stage.lessons.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            (getTutorial(dayNumberOf(l) ?? 0)?.title ?? "")
              .toLowerCase()
              .includes(q)
        ),
      }))
      .filter((stage) => stage.lessons.length > 0);
  }, [stages, q]);

  if (!checked) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <header className="animate-tutorials-in">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
          <BookOpenText className="h-4 w-4 text-neutral-400" />
          Python tutorials
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Learn Python, one topic at a time<span className="text-[#d9a05b]">.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
          Every lesson is a written tutorial first — clear explanation,
          runnable examples, and practice — with the video inside the
          lesson when you want to watch it too. Pick any topic; nothing
          is locked.
        </p>
      </header>

      {/* Search */}
      <div className="animate-tutorials-in mt-6" style={{ animationDelay: "60ms" }}>
        <label className="relative block">
          <span className="sr-only">Search tutorials</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics — try “loops”, “dictionary”, “classes”…"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 outline-none transition focus:border-neutral-600"
          />
        </label>
      </div>

      {/* Progress + continue */}
      <div
        className="animate-tutorials-in mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 sm:p-5"
        style={{ animationDelay: "120ms" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-neutral-400">
              Your progress
            </p>
            <p className="mt-1 text-sm font-semibold text-white tabular-nums">
              {totalDone}/{totalLessons} lessons • {overallPct}%
            </p>
          </div>
          {nextLesson && (
            <Link
              href={`/tutorials/${dayNumberOf(nextLesson) ?? 1}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              <Play className="h-4 w-4" />
              Continue: Day {dayNumberOf(nextLesson)}
            </Link>
          )}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800/80">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-700 ease-out"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Stages */}
      {visibleStages.length === 0 && (
        <p className="mt-10 text-center text-sm text-neutral-500">
          No tutorials match “{query}”. Try another topic.
        </p>
      )}
      {visibleStages.map((stage, stageIndex) => (
        <section
          key={stage.id}
          className="animate-tutorials-in mt-10"
          style={{ animationDelay: `${160 + stageIndex * 60}ms` }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                Stage {ROADMAP_STAGES.findIndex((s) => s.id === stage.id) + 1} • Day{" "}
                {stage.startDay}–{stage.endDay}
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                {stage.title}
              </h2>
              <p className="mt-0.5 text-sm text-neutral-400">{stage.subtitle}</p>
            </div>
            <span
              className="text-xs font-semibold tabular-nums"
              style={{ color: stage.color.text }}
            >
              {stage.completedCount}/{stage.lessons.length} • {stage.percent}%
            </span>
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-neutral-800/80">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${stage.percent}%`,
                background: `linear-gradient(90deg, ${stage.color.from}, ${stage.color.to})`,
              }}
            />
          </div>

          <ol className="mt-4 divide-y divide-neutral-800/70 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            {stage.lessons.map((lesson) => {
              const day = dayNumberOf(lesson) ?? 0;
              const tutorial = getTutorial(day);
              const isDone = completedIds.includes(lesson.id);
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/tutorials/${day}`}
                    className="group flex items-center gap-3 px-4 py-3 transition hover:bg-neutral-900"
                  >
                    <span className="w-8 shrink-0 text-center font-mono text-xs text-neutral-500 tabular-nums">
                      {day}
                    </span>
                    {isDone ? (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0"
                        style={{ color: stage.color.text }}
                      />
                    ) : (
                      <BookOpenText className="h-4 w-4 shrink-0 text-neutral-500 transition group-hover:text-neutral-300" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">
                        {tutorial?.title ?? lesson.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(lesson.durationSeconds)}
                        </span>
                        {lesson.videoUrl && <span>• Video inside</span>}
                        {isDone && <span>• Done</span>}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-neutral-600 transition group-hover:translate-x-0.5 group-hover:text-neutral-300" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
