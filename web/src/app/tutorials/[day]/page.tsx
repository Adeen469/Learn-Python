"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Code2,
  Copy,
  Lightbulb,
  Play,
  StickyNote,
} from "lucide-react";
import { fetchSessionUser } from "@/lib/auth-client";
import { getLessons, type Lesson } from "@/lib/catalog";
import { ACTIVE_LESSON_KEY } from "@/lib/entered";
import { dayNumberOf } from "@/lib/roadmap";
import { getTutorial, type TutorialBlock } from "@/lib/tutorials/index";
import { VideoPlayer } from "@/components/VideoPlayer";

const COMPLETED_KEY = "lp_completed_lessons";

function readCompleted(): string[] {
  try {
    const saved = localStorage.getItem(COMPLETED_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
}

function CodeBlock({ code, output, title }: { code: string; output?: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — the code is still visible to type out.
    }
  }
  return (
    <figure className="overflow-hidden rounded-xl border border-neutral-800 bg-black">
      <figcaption className="flex items-center justify-between gap-2 border-b border-neutral-800/70 bg-neutral-950 px-4 py-2">
        <span className="min-w-0 truncate text-xs font-medium text-neutral-400">
          {title ?? "Example"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-800 px-2.5 py-1 text-[11px] font-medium text-neutral-300 transition hover:border-neutral-600 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-neutral-100">
        <code>{code}</code>
      </pre>
      {output !== undefined && (
        <div className="border-t border-neutral-800/70 bg-neutral-950 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Output
          </p>
          <pre className="mt-1 overflow-x-auto font-mono text-[13px] leading-relaxed text-emerald-300/90">
            <code>{output}</code>
          </pre>
        </div>
      )}
    </figure>
  );
}

function renderBlock(block: TutorialBlock, index: number) {
  switch (block.type) {
    case "heading":
      return (
        <h2
          key={index}
          className="animate-tutorials-in mt-8 text-xl font-bold tracking-tight text-white first:mt-0"
          style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
        >
          {block.text}
        </h2>
      );
    case "para":
      return (
        <p key={index} className="mt-3 text-[15px] leading-relaxed text-neutral-300">
          {block.text}
        </p>
      );
    case "code":
      return (
        <div key={index} className="mt-4">
          <CodeBlock code={block.code} output={block.output} title={block.title} />
        </div>
      );
    case "list":
      return (
        <ul key={index} className="mt-3 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-neutral-300">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "note":
      return (
        <aside
          key={index}
          className="mt-4 flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3"
        >
          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/90" />
          <p className="text-sm leading-relaxed text-neutral-200">
            <span className="font-semibold text-amber-200">Note: </span>
            {block.text}
          </p>
        </aside>
      );
    case "tip":
      return (
        <aside
          key={index}
          className="mt-4 flex gap-3 rounded-xl border border-sky-500/25 bg-sky-500/5 px-4 py-3"
        >
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-sky-300/90" />
          <p className="text-sm leading-relaxed text-neutral-200">
            <span className="font-semibold text-sky-200">Tip: </span>
            {block.text}
          </p>
        </aside>
      );
  }
}

/**
 * One text tutorial. Text first — the written lesson is the main
 * content; the video sits below it as a supplement, then practice
 * and the quiz link. Same auth gate as the editor.
 */
export default function TutorialLessonPage() {
  const params = useParams();
  const router = useRouter();
  const day = Number(params.day);
  const [checked, setChecked] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>(() => getLessons());
  const [completedIds, setCompletedIds] = useState<string[]>([]);

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
    setCompletedIds(readCompleted());
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

  const lesson = useMemo(
    () => lessons.find((l) => dayNumberOf(l) === day) ?? null,
    [lessons, day]
  );
  const tutorial = getTutorial(day);
  const isDone = lesson ? completedIds.includes(lesson.id) : false;

  function toggleComplete() {
    if (!lesson) return;
    const next = isDone
      ? readCompleted().filter((id) => id !== lesson.id)
      : [...readCompleted(), lesson.id];
    try {
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
    } catch {
      // Ignore.
    }
    setCompletedIds(next);
  }

  function openQuiz() {
    if (!lesson) return;
    try {
      localStorage.setItem(ACTIVE_LESSON_KEY, lesson.id);
    } catch {
      // Ignore.
    }
    router.push("/");
  }

  if (!checked) return null;
  if (!Number.isFinite(day) || day < 1 || day > 100 || !lesson) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-white">Tutorial not found</p>
        <p className="mt-2 text-sm text-neutral-400">
          Days run from 1 to 100. Pick a lesson from the tutorials list.
        </p>
        <Link
          href="/tutorials"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" /> All tutorials
        </Link>
      </div>
    );
  }

  const prevDay = day > 1 ? day - 1 : null;
  const nextDay = day < 100 ? day + 1 : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav className="animate-tutorials-in flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/tutorials" className="transition hover:text-white">
          Tutorials
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-neutral-300">Day {day}</span>
      </nav>

      <header className="animate-tutorials-in mt-4" style={{ animationDelay: "50ms" }}>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {tutorial?.title ?? lesson.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-400 sm:text-base">
          {tutorial?.intro ??
            "Read the lesson below, try the examples in the editor, then watch the video if you want the full walkthrough."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleComplete}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              isDone
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "bg-white text-black hover:bg-neutral-200"
            }`}
          >
            {isDone ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Completed
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Mark as complete
              </>
            )}
          </button>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-600 hover:text-white"
          >
            <Code2 className="h-4 w-4" /> Try it in the editor
          </Link>
        </div>
      </header>

      {/* Written lesson */}
      <div className="mt-8">
        {tutorial ? (
          tutorial.blocks.map((block, i) => renderBlock(block, i))
        ) : (
          <p className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-relaxed text-neutral-400">
            The written tutorial for this lesson is being prepared. Watch
            the video below for now — the text version will appear here
            once it is ready.
          </p>
        )}
      </div>

      {/* Summary + practice */}
      {tutorial && (
        <section className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="text-base font-bold text-white">Summary</h2>
          <ul className="mt-3 space-y-2">
            {tutorial.summary.map((line, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-neutral-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/90" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-base font-bold text-white">Practice</h3>
          <ol className="mt-3 space-y-2">
            {tutorial.practice.map((task, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-neutral-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-700 font-mono text-[11px] text-neutral-300">
                  {i + 1}
                </span>
                <span>{task}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-neutral-500">
            Try each task in the Code Editor — reading is not enough, typing
            it yourself is what makes it stick.
          </p>
        </section>
      )}

      {/* Video supplement */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-base font-bold text-white">
          <Play className="h-4 w-4 text-neutral-400" /> Watch the video
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          The full walkthrough for Day {day} — watch it after reading, or
          when a part of the text needs seeing in action.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-800">
          <VideoPlayer lessonId={lesson.id} title={lesson.title} />
        </div>
      </section>

      {/* Quiz */}
      {lesson.quiz && lesson.quiz.length > 0 && (
        <section className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <ClipboardList className="h-4 w-4 text-neutral-400" /> Test yourself
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              {lesson.quiz.length} questions on this lesson. Passing earns a
              badge — and nothing is gated either way.
            </p>
          </div>
          <button
            type="button"
            onClick={openQuiz}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
          >
            Take the quiz
          </button>
        </section>
      )}

      {/* Prev / next */}
      <nav className="mt-10 grid grid-cols-2 gap-3">
        {prevDay ? (
          <Link
            href={`/tutorials/${prevDay}`}
            className="group rounded-2xl border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-600"
          >
            <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
              <ChevronLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
              Previous
            </span>
            <span className="mt-1.5 block text-sm font-semibold text-white">
              Day {prevDay}: {getTutorial(prevDay)?.title ?? "Previous lesson"}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {nextDay ? (
          <Link
            href={`/tutorials/${nextDay}`}
            className="group rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-right transition hover:border-neutral-600"
          >
            <span className="flex items-center justify-end gap-1 text-xs font-medium text-neutral-500">
              Next
              <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1.5 block text-sm font-semibold text-white">
              Day {nextDay}: {getTutorial(nextDay)?.title ?? "Next lesson"}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-neutral-600">
        <BookOpenText className="h-3.5 w-3.5" />
        <Link href="/tutorials" className="transition hover:text-neutral-300">
          Back to all tutorials
        </Link>
        <ArrowRight className="h-3.5 w-3.5" />
      </p>
    </article>
  );
}
