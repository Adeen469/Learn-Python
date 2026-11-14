"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, CheckCircle2, ChevronDown, Map, Play, X } from "lucide-react";
import { getLessons, type Lesson } from "@/lib/catalog";
import {
  EXTRA_ROLES,
  ROADMAP_STAGES,
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

/** Per-stage CSS variables, consumed by the timeline's color classes. */
function stageVars(stage: RoadmapStage): CSSProperties {
  return {
    "--sc-from": stage.color.from,
    "--sc-to": stage.color.to,
    "--sc-soft": stage.color.soft,
    "--sc-text": stage.color.text,
  } as CSSProperties;
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
  // Local progress is read from localStorage on mount; the first
  // incomplete stage is chosen only once that read has landed, so the
  // roadmap opens on the current stage — not on stage 1.
  const [progressLoaded, setProgressLoaded] = useState(false);
  const autoExpandedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lp_completed_lessons");
      if (saved) setCompletedIds(JSON.parse(saved));
    } catch {
      // Ignore corrupt saved data.
    }
    setProgressLoaded(true);
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

  // Expand the first incomplete stage once the stages are known and the
  // saved progress has been read.
  useEffect(() => {
    if (!progressLoaded || autoExpandedRef.current) return;
    autoExpandedRef.current = true;
    const firstOpen = stages.find((s) => s.nextLesson !== null) ?? stages[0];
    if (!firstOpen) return;
    setExpanded({ [firstOpen.id]: true });
  }, [progressLoaded, stages]);

  function toggleStage(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function renderLessonRow(lesson: Lesson, index: number, stage: RoadmapStage, isOpen: boolean) {
    const isDone = completedIds.includes(lesson.id);
    return (
      <li
        key={lesson.id}
        className={isOpen ? "animate-roadmap-lesson" : undefined}
        style={isOpen ? { animationDelay: `${index * 25}ms` } : undefined}
      >
        <button
          type="button"
          onClick={() => onSelectLesson(lesson)}
          className="roadmap-lesson flex w-full items-center gap-3 rounded-lg border border-neutral-800 bg-black px-3 py-2 text-left"
        >
          <span className="w-7 shrink-0 text-center font-mono text-[11px] text-neutral-500">
            {index + 1}
          </span>
          {isDone ? (
            <CheckCircle2
              className="h-4 w-4 shrink-0"
              style={{ color: stage.color.text }}
            />
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
    const { from, to, text } = stage.color;
    return (
      <section
        key={stage.id}
        className="roadmap-row animate-roadmap-stage relative rounded-2xl"
        style={{ ...stageVars(stage), animationDelay: `${index * 70}ms` }}
      >
        <div className="grid grid-cols-[40px_1fr] gap-4 py-4">
          {/* Node pinned to the timeline spine */}
          <div className="relative z-10 flex justify-center">
            <span
              className="roadmap-node relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
              style={{
                borderColor: stage.complete || isCurrent ? from : "#404040",
                color: stage.complete || isCurrent ? text : "#737373",
                background: stage.complete
                  ? `linear-gradient(135deg, ${from}, ${to})`
                  : "#000000",
              }}
            >
              {stage.complete ? (
                <Check className="h-4 w-4 text-black" />
              ) : (
                index + 1
              )}
              {isCurrent && !stage.complete && (
                <span
                  aria-hidden
                  className="animate-roadmap-pulse absolute inset-0 rounded-full border"
                  style={{ borderColor: from }}
                />
              )}
            </span>
          </div>

          {/* Stage content */}
          <div className="min-w-0 pr-2">
            <button
              type="button"
              onClick={() => toggleStage(stage.id)}
              aria-expanded={isOpen}
              className="flex w-full items-start gap-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  Stage {index + 1} • Day {stage.startDay}–{stage.endDay} • {stage.lessons.length} lessons
                </p>
                <h3 className="mt-1 flex flex-wrap items-center gap-2 text-base font-semibold text-white">
                  {stage.title}
                  {isCurrent && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ borderColor: from, color: text }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: text }}
                      />
                      Current
                    </span>
                  )}
                  {stage.complete && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ borderColor: from, color: text }}
                    >
                      <Check className="h-3 w-3" /> Complete
                    </span>
                  )}
                </h3>
                <p className="mt-0.5 text-xs text-neutral-400">{stage.subtitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                <span className="text-xs font-semibold tabular-nums" style={{ color: text }}>
                  {stage.percent}%
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-neutral-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-neutral-800/80">
              <div
                className="animate-roadmap-bar roadmap-bar-fill h-full rounded-full"
                style={{
                  width: `${stage.percent}%`,
                  background: `linear-gradient(90deg, ${from}, ${to})`,
                }}
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
                    className="font-medium underline underline-offset-2 hover:opacity-80"
                    style={{ color: text }}
                  >
                    Next: {stage.nextLesson.title}
                  </button>
                </>
              ) : (
                " • Stage complete"
              )}
            </p>

            {/* Smooth expand / collapse */}
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <ul className="mt-3 space-y-1.5">
                  {stage.lessons.map((lesson, i) => renderLessonRow(lesson, i, stage, isOpen))}
                </ul>
              </div>
            </div>
          </div>
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
      <div className="animate-roadmap-panel mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
              <Map className="h-4 w-4 text-neutral-400" /> Your roadmap
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              100 days, 6 stages<span className="text-[#d9a05b]">.</span>
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
            className="shrink-0 rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-400 transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Overall progress — a thin line, not a card */}
        <div className="mt-8 border-t border-neutral-800/70 pt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-400">Overall progress</span>
            <span className="font-semibold tabular-nums text-white">
              {stagesDone}/{stages.length} stages • {totalDone}/{totalLessons} lessons • {overallPct}%
            </span>
          </div>
          <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-neutral-800/80">
            <div
              className="animate-roadmap-bar h-full rounded-full bg-white"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            You complete the course stage by stage
            {current ? ` — you are on ${current.title}.` : " — every stage is complete."}
          </p>
        </div>

        {/* Timeline: one spine, six nodes */}
        <div className="relative mt-6">
          <div
            aria-hidden
            className="absolute bottom-9 left-[19px] top-9 w-px bg-neutral-800"
          >
            <div
              className="w-px bg-neutral-200 transition-[height] duration-1000 ease-out"
              style={{ height: `${overallPct}%` }}
            />
          </div>
          {stages.map(renderStage)}
        </div>

        {/* Extras */}
        {extras.length > 0 && (
          <section className="animate-roadmap-stage mt-8" style={{ animationDelay: `${stages.length * 70}ms` }}>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
              Extras — shortcuts, not a stage
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {extras.map((lesson, i) => {
                const role = EXTRA_ROLES[lesson.id];
                const color = ROADMAP_STAGES[i % ROADMAP_STAGES.length].color;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onSelectLesson(lesson)}
                    className="roadmap-extra rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-left"
                  >
                    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: color.from }}
                      />
                      <span style={{ color: color.text }}>{role?.role ?? "Extra"}</span>
                    </p>
                    <p className="mt-2 text-sm font-medium leading-snug text-white">
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
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
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
