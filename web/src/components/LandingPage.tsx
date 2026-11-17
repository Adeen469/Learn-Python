"use client";

import {
  ArrowRight,
  BookOpen,
  Code2,
  Flame,
  Github,
  Play,
  Sparkles,
} from "lucide-react";
import StarBorder from "@/components/StarBorder";
import TextType from "@/components/TextType";

const FEATURES = [
  {
    icon: Play,
    title: "Videos, online & offline",
    text: "Watch video lessons with or without internet — save them on your device and keep watching when the connection drops.",
  },
  {
    icon: BookOpen,
    title: "Tutorials, offline too",
    text: "Topic-by-topic tutorials and reference entries — read them anywhere, even without internet.",
  },
  {
    icon: Code2,
    title: "Code editor",
    text: "Write and run real Python in the browser — Monaco editor with Pyodide, multi-file workspace, no install needed.",
  },
  {
    icon: Sparkles,
    title: "Ask the AI tutor",
    text: "Stuck on a concept or an error? Ask the AI tutor anything — it answers from the lesson you're on, with examples and fixes.",
  },
  {
    icon: Github,
    title: "GitHub, built in",
    text: "Connect your GitHub account, create repos, and push your code straight from the editor — your work, versioned from day one.",
  },
  {
    icon: Flame,
    title: "Daily goals & streaks",
    text: "Set a daily watch goal, keep the streak alive, and see today's real progress at a glance.",
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
          </div>
          <a
            href="/auth/email"
            className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition"
          >
            Sign in
          </a>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4">
        {/* Hero */}
        <section className="flex flex-col items-center py-14 text-center sm:py-20">
          <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Learn Python programming,{" "}
            <TextType
              as="span"
              text={["online", "offline"]}
              typingSpeed={75}
              pauseDuration={1500}
              deletingSpeed={50}
              deleteMode="backspace"
              typeEffect="fade"
              mistakes={0}
              cursorStyle="bar"
              cursorGlide
              showCursor
            />
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            Topic-by-topic tutorials, video courses, and a real code editor —
            from your first print() to real projects. Watch, code, and build
            the streak.
          </p>
          <div className="mt-12">
            <StarBorder
              as="a"
              href="/auth/email"
              color="#ffffff"
              trailColor="#ffffff"
              duration={4}
              direction="clockwise"
              stars={1}
              trailLength={0.3}
              thickness={1}
              radius={12}
              glow={0.6}
              hover="lap"
              sparkle={false}
              clickPulse
              theme="dark"
              className="text-sm font-semibold"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </StarBorder>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Free • Sign in with email or Google • Your progress stays on this device
          </p>

          {/* Stats */}
          <div className="mt-10 grid w-full max-w-lg grid-cols-3 gap-3">
            {[
              { value: "812", label: "topics" },
              { value: "259", label: "videos" },
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
        LP — Learn Python
      </footer>
    </div>
  );
}
