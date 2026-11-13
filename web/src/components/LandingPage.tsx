"use client";

import {
  ArrowRight,
  BookOpen,
  CloudOff,
  Code2,
  Flame,
  Package,
  Play,
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "100-day course",
    text: "CodeWithHarry's Python for Beginners full course in Hindi — 100 lessons, Day 1 to Day 100, plus 3 extra videos.",
  },
  {
    icon: CloudOff,
    title: "Offline video",
    text: "Lessons cache in your browser, so a video you watched once keeps playing even with a weak connection.",
  },
  {
    icon: Flame,
    title: "Daily goals & streaks",
    text: "Set a daily watch goal, keep the streak alive, and see today's real progress at a glance.",
  },
  {
    icon: Code2,
    title: "Code editor",
    text: "Write and run real Python in the browser — Monaco editor with Pyodide, multi-file workspace, no install needed.",
  },
  {
    icon: Package,
    title: "Modules & packages",
    text: "The full Python standard library catalog plus live PyPI search and install, right inside the editor.",
  },
  {
    icon: Play,
    title: "Learn by doing",
    text: "Every lesson has exercises and tests — watch 95% to complete a lesson, pass its test to earn the badge.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Slim landing header — no app navigation for guests. */}
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/lp-logo.png"
              alt="LP Logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-contain"
            />
            <span className="text-sm font-semibold tracking-tight">
              LP <span className="text-xs font-normal text-neutral-500">Learn Python</span>
            </span>
          </div>
          <a
            href="/api/auth/google"
            className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition"
          >
            Sign in with Google
          </a>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4">
        {/* Hero */}
        <section className="flex flex-col items-center py-14 text-center sm:py-20">
          <p className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            100 days • 103 lessons • Hindi
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Learn Python in 100 days.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            CodeWithHarry&apos;s Python for Beginners full course — from your first
            print() to real projects. Watch, code, and build the streak, one day
            at a time.
          </p>
          <a
            href="/api/auth/google"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition"
          >
            Sign in with Google <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-3 text-xs text-neutral-500">
            Free • Sign in with Google • Your progress stays on this device
          </p>

          {/* Stats */}
          <div className="mt-10 grid w-full max-w-lg grid-cols-3 gap-3">
            {[
              { value: "100", label: "days" },
              { value: "103", label: "lessons" },
              { value: "6", label: "stages" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-4"
              >
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="pb-16">
          <h2 className="text-center text-lg font-semibold text-white">
            Everything you need to actually finish
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <f.icon className="h-5 w-5 text-white" />
                <h3 className="mt-3 text-sm font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-800 py-5 text-center text-xs text-neutral-600">
        LP — Learn Python • Python for Beginners (Full Course) by CodeWithHarry
      </footer>
    </div>
  );
}
