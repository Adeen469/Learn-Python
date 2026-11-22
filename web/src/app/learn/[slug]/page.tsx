"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  Lightbulb,
  StickyNote,
} from "lucide-react";
import { ALL_LEARN_TOPICS, getLearnTopic } from "@/lib/learn/sidebar";
import {
  getLearnReference,
  getLearnTutorial,
  type LearnReference,
  type LearnTutorial,
  type TutorialBlock,
} from "@/lib/learn/index";
import {
  getReferenceTranslations,
  getTutorialTranslations,
  localizeReference,
  localizeTutorial,
} from "@/lib/learn/i18n";
import { useLanguage, type Strings } from "@/lib/i18n";
import { highlightPython } from "@/lib/python-highlight";
import { TextSelectionToolbar } from "@/components/TextSelectionToolbar";
import { LessonOfflineButton } from "@/components/LessonOfflineButton";

const COMPLETED_KEY = "lp_learn_completed";
const LAST_VISITED_KEY = "lp_last_visited";

// The lesson the user was on before this one: read on arrival, then
// record this visit. The value is frozen for this page (the state
// below), so the Resume button keeps pointing at where the user came
// from instead of vanishing the moment this page is recorded.
function readLastVisited(): string | null {
  try {
    return localStorage.getItem(LAST_VISITED_KEY);
  } catch {
    return null;
  }
}

function readCompleted(): string[] {
  try {
    const saved = localStorage.getItem(COMPLETED_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
}

// Section titles live in `sidebar.section*` (keyed by section id).
function sectionTitle(t: Strings, sectionId: string, fallback: string): string {
  switch (sectionId) {
    case "python-tutorial":
      return t.sidebar.sectionPythonTutorial;
    case "python-classes":
      return t.sidebar.sectionPythonClasses;
    case "file-handling":
      return t.sidebar.sectionFileHandling;
    case "python-modules":
      return t.sidebar.sectionPythonModules;
    case "python-matplotlib":
      return t.sidebar.sectionPythonMatplotlib;
    case "machine-learning":
      return t.sidebar.sectionMachineLearning;
    case "python-dsa":
      return t.sidebar.sectionPythonDsa;
    case "python-mysql":
      return t.sidebar.sectionPythonMysql;
    case "python-mongodb":
      return t.sidebar.sectionPythonMongodb;
    case "python-cert":
      return t.sidebar.sectionPythonCert;
    case "python-how-to":
      return t.sidebar.sectionPythonHowTo;
    case "python-examples":
      return t.sidebar.sectionPythonExamples;
    case "python-reference":
      return t.sidebar.sectionPythonReference;
    case "module-reference":
      return t.sidebar.sectionModuleReference;
    default:
      return fallback;
  }
}

function CodeBlock({ code, output, title }: { code: string; output?: string; title?: string }) {
  const { t } = useLanguage();
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
  // "Try it" hands this exact snippet to the editor: the editor reads
  // lp_try_it_code from sessionStorage on mount and opens it as
  // try-it.py, so every code block gets its own Try-it button.
  function tryIt() {
    try {
      sessionStorage.setItem("lp_try_it_code", code);
    } catch {
      // sessionStorage unavailable — the editor still opens, just empty.
    }
  }
  return (
    <figure className="overflow-hidden rounded-xl border border-neutral-800 bg-black">
      <figcaption className="flex items-center justify-between gap-2 border-b border-neutral-800/70 bg-neutral-950 px-4 py-2">
        <span className="min-w-0 truncate text-xs font-medium text-neutral-400">
          {title ?? t.learnPage.example}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/editor"
            onClick={tryIt}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 px-2.5 py-1 text-[11px] font-medium text-neutral-300 transition hover:border-neutral-600 hover:text-white"
          >
            <Code2 className="h-3.5 w-3.5" /> {t.learnPage.tryInEditor}
          </Link>
          <button
            type="button"
            onClick={copy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-800 px-2.5 py-1 text-[11px] font-medium text-neutral-300 transition hover:border-neutral-600 hover:text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t.learnPage.copied : t.learnPage.copy}
          </button>
        </span>
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-neutral-100">
        <code>{highlightPython(code)}</code>
      </pre>
      {output !== undefined && (
        <div className="border-t border-neutral-800/70 bg-neutral-950 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            {t.learnPage.output}
          </p>
          <pre className="mt-1 overflow-x-auto font-mono text-[13px] leading-relaxed text-neutral-100">
            <code>{output}</code>
          </pre>
        </div>
      )}
    </figure>
  );
}

function renderBlock(block: TutorialBlock, index: number, t: Strings) {
  switch (block.type) {
    case "heading":
      return (
        <h2 key={index} className="mt-8 text-xl font-bold tracking-tight text-white first:mt-0">
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
        <aside key={index} className="mt-4 flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3">
          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/90" />
          <p className="text-sm leading-relaxed text-neutral-200">
            <span className="font-semibold text-amber-200">{t.learnPage.noteLabel}</span>
            {block.text}
          </p>
        </aside>
      );
    case "tip":
      return (
        <aside key={index} className="mt-4 flex gap-3 rounded-xl border border-sky-500/25 bg-sky-500/5 px-4 py-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-sky-300/90" />
          <p className="text-sm leading-relaxed text-neutral-200">
            <span className="font-semibold text-sky-200">{t.learnPage.tipLabel}</span>
            {block.text}
          </p>
        </aside>
      );
  }
}

/**
 * One Learn topic page. Text first, W3Schools-style: the written
 * tutorial is the content; reference entries get a short signature +
 * example card instead of a full tutorial.
 */
export default function LearnTopicPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const { lang, t, tutorialTitle, referenceTitle, roadmapName } = useLanguage();
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const [resumeSlug, setResumeSlug] = useState<string | null>(null);
  // The lesson content loads on demand (one corpus chunk per slug —
  // see src/lib/learn/index.ts), so it arrives async: null + not
  // ready yet means "still loading", null + ready means "not written
  // yet". `contentNonce` re-runs the load for the Retry button.
  const [rawTutorial, setRawTutorial] = useState<LearnTutorial | null>(null);
  const [rawReference, setRawReference] = useState<LearnReference | null>(null);
  const [contentReady, setContentReady] = useState(false);
  const [contentFailed, setContentFailed] = useState(false);
  const [contentNonce, setContentNonce] = useState(0);

  useEffect(() => {
    setCompletedSlugs(readCompleted());
  }, []);

  // Record this visit, but keep the previous value as this page's
  // resume target: the user came FROM that lesson, so Resume must keep
  // pointing at it while they are here.
  useEffect(() => {
    setResumeSlug(readLastVisited());
    try {
      localStorage.setItem(LAST_VISITED_KEY, slug);
    } catch {
      // Ignore.
    }
  }, [slug]);

  // Load this lesson's chunk (tutorial first; a reference entry only
  // when no tutorial exists for the slug — same lookup as before,
  // just async). A stale load (navigated away mid-fetch) is dropped.
  useEffect(() => {
    let cancelled = false;
    setRawTutorial(null);
    setRawReference(null);
    setContentFailed(false);
    setContentReady(false);
    (async () => {
      try {
        const tutorial = await getLearnTutorial(slug);
        if (cancelled) return;
        setRawTutorial(tutorial);
        if (!tutorial) {
          const reference = await getLearnReference(slug);
          if (cancelled) return;
          setRawReference(reference);
        }
        if (!cancelled) setContentReady(true);
      } catch {
        if (cancelled) return;
        setContentFailed(true);
        setContentReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, contentNonce]);

  const topic = getLearnTopic(slug);
  const tutorial = rawTutorial
    ? localizeTutorial(rawTutorial, getTutorialTranslations(lang)[rawTutorial.slug])
    : null;
  const reference = rawReference
    ? localizeReference(rawReference, getReferenceTranslations(lang)[rawReference.slug])
    : null;
  const isDone = completedSlugs.includes(slug);

  if (!topic) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="text-lg font-semibold text-white">{t.learnPage.topicNotFound}</p>
        <p className="mt-2 text-sm text-neutral-400">
          {t.learnPage.topicNotFoundHint}
        </p>
        <Link
          href="/learn/python-home"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" /> {roadmapName("Python HOME")}
        </Link>
      </div>
    );
  }

  function toggleComplete() {
    const next = isDone
      ? readCompleted().filter((s) => s !== slug)
      : [...readCompleted(), slug];
    try {
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
    } catch {
      // Ignore.
    }
    setCompletedSlugs(next);
  }

  const idx = ALL_LEARN_TOPICS.findIndex((t) => t.slug === slug);
  const prevTopic = idx > 0 ? ALL_LEARN_TOPICS[idx - 1] : null;
  const nextTopic =
    idx >= 0 && idx < ALL_LEARN_TOPICS.length - 1 ? ALL_LEARN_TOPICS[idx + 1] : null;

  // The lesson after the last completed one, in curriculum order — the
  // furthest-along completed topic, plus one. No timestamps needed:
  // the curriculum order IS the progress order. None completed yet
  // means the first lesson; all completed means there is no next one
  // (the button hides). It shows on EVERY lesson page, completed or
  // not (Maalik, 2026-11-19) — even when it points at the page itself.
  const lastCompletedIdx = completedSlugs.reduce((max, s) => {
    const i = ALL_LEARN_TOPICS.findIndex((t) => t.slug === s);
    return i > max ? i : max;
  }, -1);
  const continueTopic =
    lastCompletedIdx < ALL_LEARN_TOPICS.length - 1
      ? ALL_LEARN_TOPICS[lastCompletedIdx + 1]
      : null;
  const showContinue = continueTopic !== null;

  const resumeTopic = resumeSlug
    ? ALL_LEARN_TOPICS.find((t) => t.slug === resumeSlug) ?? null
    : null;
  // Resume only when it points somewhere useful: a real lesson that is
  // neither this page nor the Up Next target (when both point at the
  // same lesson, Up Next alone is enough).
  const showResume =
    resumeTopic !== null &&
    resumeTopic.slug !== slug &&
    resumeTopic.slug !== continueTopic?.slug;

  return (
    <article>
      <TextSelectionToolbar
        lessonTitle={tutorial?.title ?? reference?.title ?? tutorialTitle(slug, topic.title)}
      />
      <nav className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span>{sectionTitle(t, topic.sectionId, topic.sectionTitle)}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-neutral-300">{tutorial?.title ?? reference?.title ?? tutorialTitle(slug, topic.title)}</span>
          </span>
          <LessonOfflineButton slug={slug} />
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {showResume && resumeTopic && (
            <Link
              href={`/learn/${resumeTopic.slug}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-black transition hover:bg-neutral-200"
            >
              {t.lesson.resume}{" "}
              {tutorialTitle(resumeTopic.slug, referenceTitle(resumeTopic.slug, resumeTopic.title))}
            </Link>
          )}
          {showContinue && continueTopic && (
            <Link
              href={`/learn/${continueTopic.slug}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-neutral-600 hover:text-white"
            >
              {t.lesson.upNext}{" "}
              {tutorialTitle(continueTopic.slug, referenceTitle(continueTopic.slug, continueTopic.title))}
            </Link>
          )}
        </span>
      </nav>

      <header className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {tutorial?.title ?? reference?.title ?? tutorialTitle(slug, topic.title)}
          </h1>
          <button
            type="button"
            onClick={toggleComplete}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              isDone
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "bg-white text-black hover:bg-neutral-200"
            }`}
          >
            {isDone ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> {t.common.completed}
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> {t.course.markAsComplete}
              </>
            )}
          </button>
        </div>
        {tutorial && (
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-400 sm:text-base">
            {tutorial.intro}
          </p>
        )}
      </header>

      {!contentReady ? (
        <div className="mt-8 animate-pulse" aria-hidden="true">
          <div className="h-4 w-3/4 rounded bg-neutral-800" />
          <div className="mt-3 h-4 w-full rounded bg-neutral-800" />
          <div className="mt-3 h-4 w-5/6 rounded bg-neutral-800" />
          <div className="mt-6 h-40 rounded-xl bg-neutral-800/60" />
        </div>
      ) : contentFailed ? (
        <p className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-relaxed text-neutral-400">
          {t.common.genericError}{" "}
          <button
            type="button"
            onClick={() => setContentNonce((n) => n + 1)}
            className="font-semibold text-white underline underline-offset-2"
          >
            {t.common.retry}
          </button>
        </p>
      ) : tutorial ? (
        <>
          <div className="mt-8">
            {tutorial.blocks.map((block, i) => renderBlock(block, i, t))}
          </div>
          <section className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="text-base font-bold text-white">{t.learnPage.summary}</h2>
            <ul className="mt-3 space-y-2">
              {tutorial.summary.map((line, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-neutral-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/90" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-base font-bold text-white">{t.learnPage.practice}</h3>
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
              {t.learnPage.practiceHint}
            </p>
          </section>
        </>
      ) : reference ? (
        <div className="mt-8">
          {reference.signature && (
            <p className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 font-mono text-sm text-white">
              {reference.signature}
            </p>
          )}
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-300">
            {reference.description}
          </p>
          <div className="mt-4">
            <CodeBlock
              code={reference.exampleCode}
              output={reference.exampleOutput}
              title={t.learnPage.example}
            />
          </div>
        </div>
      ) : (
        <p className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-relaxed text-neutral-400">
          {t.learnPage.tutorialBeingPrepared}
        </p>
      )}

      <nav className="mt-10 grid grid-cols-2 gap-3">
        {prevTopic ? (
          <Link
            href={`/learn/${prevTopic.slug}`}
            className="group rounded-2xl border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-600"
          >
            <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
              <ChevronLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
              {t.learnPage.previous}
            </span>
            <span className="mt-1.5 block text-sm font-semibold text-white">
              {tutorialTitle(prevTopic.slug, referenceTitle(prevTopic.slug, prevTopic.title))}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {nextTopic ? (
          <Link
            href={`/learn/${nextTopic.slug}`}
            className="group rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-right transition hover:border-neutral-600"
          >
            <span className="flex items-center justify-end gap-1 text-xs font-medium text-neutral-500">
              {t.lesson.nextLesson}
            </span>
            <span className="mt-1.5 block text-sm font-semibold text-white">
              {tutorialTitle(nextTopic.slug, referenceTitle(nextTopic.slug, nextTopic.title))}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-neutral-600">
        <Link href="/learn/python-home" className="transition hover:text-neutral-300">
          {t.learnPage.backToPythonHome(roadmapName("Python HOME"))}
        </Link>
        <ArrowRight className="h-3.5 w-3.5" />
      </p>
    </article>
  );
}
