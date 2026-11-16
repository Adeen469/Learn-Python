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
  type TutorialBlock,
} from "@/lib/learn/index";

const COMPLETED_KEY = "lp_learn_completed";

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
            <span className="font-semibold text-amber-200">Note: </span>
            {block.text}
          </p>
        </aside>
      );
    case "tip":
      return (
        <aside key={index} className="mt-4 flex gap-3 rounded-xl border border-sky-500/25 bg-sky-500/5 px-4 py-3">
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
 * One Learn topic page. Text first, W3Schools-style: the written
 * tutorial is the content; reference entries get a short signature +
 * example card instead of a full tutorial.
 */
export default function LearnTopicPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);

  useEffect(() => {
    setCompletedSlugs(readCompleted());
  }, []);

  const topic = getLearnTopic(slug);
  const tutorial = getLearnTutorial(slug);
  const reference = !tutorial ? getLearnReference(slug) : null;
  const isDone = completedSlugs.includes(slug);

  if (!topic) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="text-lg font-semibold text-white">Topic not found</p>
        <p className="mt-2 text-sm text-neutral-400">
          Pick a topic from the sidebar — every Python topic lives there.
        </p>
        <Link
          href="/learn/python-home"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" /> Python HOME
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

  return (
    <article className="mx-auto max-w-3xl">
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
        <span>{topic.sectionTitle}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-neutral-300">{topic.title}</span>
      </nav>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {tutorial?.title ?? reference?.title ?? topic.title}
        </h1>
        {tutorial && (
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-400 sm:text-base">
            {tutorial.intro}
          </p>
        )}
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

      {tutorial ? (
        <>
          <div className="mt-8">
            {tutorial.blocks.map((block, i) => renderBlock(block, i))}
          </div>
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
              title="Example"
            />
          </div>
        </div>
      ) : (
        <p className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-relaxed text-neutral-400">
          The written tutorial for this topic is being prepared. Pick
          another topic from the sidebar for now — this one will appear
          here once it is ready.
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
              Previous
            </span>
            <span className="mt-1.5 block text-sm font-semibold text-white">
              {prevTopic.title}
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
              Next
              <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1.5 block text-sm font-semibold text-white">
              {nextTopic.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-neutral-600">
        <Link href="/learn/python-home" className="transition hover:text-neutral-300">
          Back to Python HOME
        </Link>
        <ArrowRight className="h-3.5 w-3.5" />
      </p>
    </article>
  );
}
