"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Map, X } from "lucide-react";
import { ROADMAP_STAGES, roadmapTopicHref, type RoadmapTopic } from "@/lib/roadmap";

// Same key the /learn pages use for completed tutorials.
const LEARN_COMPLETED_KEY = "lp_learn_completed";

function formatTotalMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function TopicRow({
  topic,
  isDone,
  onNavigate,
}: {
  topic: RoadmapTopic;
  isDone: boolean;
  onNavigate: () => void;
}) {
  return (
    <li className="relative pl-9">
      <span
        className={`absolute left-[7px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border ${
          isDone ? "border-white bg-white" : "border-neutral-600 bg-neutral-950"
        }`}
      />
      <Link
        href={roadmapTopicHref(topic)}
        onClick={onNavigate}
        className="group flex items-center gap-2 rounded-lg border border-neutral-800 bg-black px-3 py-2.5 text-left transition hover:border-neutral-600"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            {isDone ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
            ) : null}
            <span className="truncate text-sm font-medium text-white">{topic.title}</span>
          </span>
          <span className="mt-0.5 block truncate text-xs text-neutral-500">
            {topic.blurb}
          </span>
          <span className="mt-1 block text-[11px] text-neutral-500">
            {topic.difficulty} • {topic.estimatedMinutes} min
            {topic.learnSlug ? "" : " • Video Courses"}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-600 transition group-hover:text-white" />
      </Link>
    </li>
  );
}

/**
 * The Python roadmap as a modal: a muted vertical timeline rail —
 * stages down the left, one row per topic. Clicking a topic opens
 * its tutorial (and closes the modal). Done states come from the
 * /learn pages' own completion store.
 *
 * onClose is the real close (X / Escape): the navbar may show the
 * first-time hint over the still-open modal instead of closing it.
 * onNavigate is a topic click: the modal just goes away quietly.
 */
export function RoadmapModal({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: () => void;
}) {
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LEARN_COMPLETED_KEY);
      if (saved) setCompletedSlugs(JSON.parse(saved));
    } catch {
      // Ignore corrupt saved data.
    }
  }, []);

  // Escape closes the modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const totalTopics = ROADMAP_STAGES.reduce((n, s) => n + s.topics.length, 0);
  const totalMinutes = ROADMAP_STAGES.reduce(
    (n, s) => n + s.topics.reduce((m, t) => m + t.estimatedMinutes, 0),
    0
  );
  const doneCount = ROADMAP_STAGES.reduce(
    (n, s) =>
      n +
      s.topics.filter((t) => t.learnSlug && completedSlugs.includes(t.learnSlug)).length,
    0
  );
  const pct = totalTopics === 0 ? 0 : Math.round((doneCount / totalTopics) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Python roadmap"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-neutral-800 bg-neutral-950 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-neutral-800 px-5 py-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <Map className="h-5 w-5 shrink-0 text-white" />
              Your Python Roadmap
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              {totalTopics} topics • about {formatTotalMinutes(totalMinutes)} • follow it
              top to bottom
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close roadmap"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-neutral-800 px-5 py-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>
              {doneCount} of {totalTopics} done
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {ROADMAP_STAGES.map((stage) => (
            <section key={stage.id} className="mb-6 last:mb-0">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {stage.title}
              </h3>
              <ul className="relative space-y-2 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-neutral-800">
                {stage.topics.map((topic) => (
                  <TopicRow
                    key={topic.id}
                    topic={topic}
                    isDone={!!topic.learnSlug && completedSlugs.includes(topic.learnSlug)}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Shown when the roadmap is closed the first time — over the
 * still-open roadmap, before it goes away. Dismissing it closes
 * the roadmap too, and it never appears again.
 */
export function RoadmapHint({ onGotIt }: { onGotIt: () => void }) {
  // Escape dismisses the hint (and with it, the roadmap behind it).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onGotIt();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onGotIt]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Roadmap saved"
    >
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <h3 className="flex items-center gap-2 text-base font-semibold text-white">
          <Map className="h-5 w-5 shrink-0 text-white" />
          Roadmap saved for later
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          Next time you can preview the roadmap from the profile dropdown.
        </p>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onGotIt}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
