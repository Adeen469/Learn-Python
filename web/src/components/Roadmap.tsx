"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Map, Play, X } from "lucide-react";
import { getLessons, type Lesson } from "@/lib/catalog";
import {
  EXTRA_ROLES,
  buildRoadmapStages,
  completedStageCount,
  currentStage,
  extrasOf,
  type RoadmapStage,
} from "@/lib/roadmap";

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface RoadmapProps {
  onClose: () => void;
  onSelectLesson: (lesson: Lesson) => void;
}

export function Roadmap({ onClose, onSelectLesson }: RoadmapProps) {
  const [lessons, setLessons] = useState<Lesson[]>(() => getLessons());
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  // First incomplete stage starts expanded; the rest start collapsed.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
  const extras = extrasOf(lessons);
  const totalDone = stages.reduce((n, s) => n + s.completedCount, 0);
  const totalLessons = stages.reduce((n, s) => n + s.lessons.length, 0);
  const overallPct = totalLessons === 0 ? 0 : Math.round((totalDone / totalLessons) * 100);
  // Completion is stage-by-stage: the learner completes stages, not the
  // whole course at once. The current stage is the first incomplete one.
  const current = currentStage(stages);
  const stagesDone = completedStageCount(stages);

  // Expand the first incomplete stage once the stages are known.
  useEffect(() => {
    setExpanded((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const firstOpen = stages.find((s) => s.nextLesson !== null) ?? stages[0];
      if (!firstOpen) return prev;
      return { [firstOpen.id]: true };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages.length]);

  function toggleStage(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function renderLessonRow(lesson: Lesson, index: number) {
    const isDone = completedIds.includes(lesson.id);
    return (
      <li key={lesson.id}>
        <button
          type="button"
          onClick={() => onSelectLesson(lesson)}
          className="flex w-full items-center gap-3 rounded-lg border border-neutral-800 bg-black px-3 py-2 text-left transition hover:border-neutral-600"
        >
          <span className="w-7 shrink-0 text-center font-mono text-[11px] text-neutral-500">
            {index + 1}
          </span>
          {isDone ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
          ) : (
            <Play className="h-4 w-4 shrink-0 text-neutral-400" />
          )}
          <span className="min-w-0 flex-1 truncate text-sm text-white">
            {lesson.title}
          </span>
          <span className="shrink-0 text-xs text-neutral-500">
            {formatDuration(lesson.durationSeconds)}
            {isDone ? " • Done" : ""}
          </span>
        </button>
      </li>
    );
  }

  function renderStage(stage: RoadmapStage, index: number) {
    const isOpen = !!expanded[stage.id];
    const isCurrent = current !== null && current.id === stage.id;
    return (
      <section
        key={stage.id}
        className={`animate-roadmap-stage rounded-xl border bg-neutral-950 ${
          isCurrent ? "border-white/70" : "border-neutral-800"
        }`}
        style={{ animationDelay: `${index * 90}ms` }}
      >
        <button
          type="button"
          onClick={() => toggleStage(stage.id)}
          aria-expanded={isOpen}
          className="flex w-full items-start justify-between gap-3 p-4 text-left"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Stage {index + 1} • Day {stage.startDay}–{stage.endDay} • {stage.lessons.length} lessons
              {isCurrent ? " • Current stage" : ""}
            </p>
            <h3 className="mt-1 flex flex-wrap items-center gap-2 text-base font-semibold text-white">
              {stage.title}
              {stage.complete && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                  <CheckCircle2 className="h-3 w-3" /> Complete
                </span>
              )}
            </h3>
            <p className="mt-0.5 text-xs text-neutral-400">{stage.subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs font-semibold text-white">{stage.percent}%</span>
            <ChevronDown
              className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        <div className="px-4 pb-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="animate-roadmap-bar h-full rounded-full bg-white"
              style={{ width: `${stage.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            {stage.completedCount}/{stage.lessons.length} complete
            {stage.nextLesson ? (
              <>
                {" • "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLesson(stage.nextLesson!);
                  }}
                  className="font-medium text-white underline underline-offset-2 hover:text-neutral-200"
                >
                  Next: {stage.nextLesson.title}
                </button>
              </>
            ) : (
              " • Stage complete"
            )}
          </p>

          {isOpen && (
            <ul className="mt-3 space-y-1.5">{stage.lessons.map(renderLessonRow)}</ul>
          )}
        </div>
      </section>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Python learning roadmap"
      className="animate-roadmap-overlay fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur"
    >
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              <Map className="h-4 w-4 text-white" /> Your roadmap
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              100 days, 6 stages.
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-400">
              From your first print() to real projects. Pick any lesson — nothing
              is locked — and the roadmap keeps track of where you are.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close roadmap"
            className="shrink-0 rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Overall progress — stages, not the course at once */}
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-300">Overall progress</span>
            <span className="font-semibold text-white">
              {stagesDone}/{stages.length} stages complete • {totalDone}/{totalLessons} lessons • {overallPct}%
            </span>
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">
            You complete the course stage by stage
            {current ? ` — you are on ${current.title}.` : " — every stage is complete."}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="animate-roadmap-bar h-full rounded-full bg-white"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Stages */}
        <div className="mt-4 space-y-3">{stages.map(renderStage)}</div>

        {/* Extras */}
        {extras.length > 0 && (
          <section className="animate-roadmap-stage mt-6" style={{ animationDelay: `${stages.length * 90}ms` }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Extras — shortcuts, not a stage
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {extras.map((lesson) => {
                const role = EXTRA_ROLES[lesson.id];
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onSelectLesson(lesson)}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-left transition hover:border-neutral-600"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                      {role?.role ?? "Extra"}
                    </p>
                    <p className="mt-1.5 text-sm font-medium leading-snug text-white">
                      {lesson.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
                      {role?.blurb ?? ""}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">
                      {formatDuration(lesson.durationSeconds)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200 transition"
          >
            Start learning
          </button>
          <p className="mt-2 text-xs text-neutral-500">
            You can reopen this roadmap anytime from the profile menu.
          </p>
        </div>
      </div>
    </div>
  );
}
