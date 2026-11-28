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
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import SpecularButton from "@/components/SpecularButton";
import TextType from "@/components/TextType";

export function LandingPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const FEATURES = [
    {
      icon: Play,
      title: t.landing.featureVideosTitle,
      text: t.landing.featureVideosText,
    },
    {
      icon: BookOpen,
      title: t.landing.featureTutorialsTitle,
      text: t.landing.featureTutorialsText,
    },
    {
      icon: Code2,
      title: t.editor.title,
      text: t.landing.featureEditorText,
    },
    {
      icon: Sparkles,
      title: t.lesson.askTutor,
      text: t.landing.featureTutorText,
    },
    {
      icon: Github,
      title: t.landing.featureGithubTitle,
      text: t.landing.featureGithubText,
    },
    {
      icon: Flame,
      title: t.landing.featureGoalsTitle,
      text: t.landing.featureGoalsText,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Slim landing header — no app navigation for guests. */}
      <header className="border-b border-neutral-800">
        <div className="flex w-full items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/lp-logo.png"
              alt="LP Logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-md object-contain"
            />
          </div>
          <a
            href="/auth/email"
            className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition"
          >
            {t.common.signIn}
          </a>
        </div>
      </header>

      <main className="flex w-full flex-1 flex-col px-4">
        {/* Hero */}
        <section className="flex flex-col items-center py-14 text-center sm:py-20">
          <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            {t.landing.heroTitle}{" "}
            <TextType
              as="span"
              text={[t.landing.heroWordOnline, t.landing.heroWordOffline]}
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
            {t.landing.heroSubtitle}
          </p>
          <div className="mt-12">
            <SpecularButton
              size="lg"
              radius={18}
              tint="#ffffff"
              tintOpacity={0}
              textColor="#f5f5f5"
              lineColor="#ffffff"
              baseColor="#000000"
              intensity={0.55}
              idleIntensity={0}
              shineSize={0}
              shineFade={79}
              thickness={0.5}
              glow={1}
              followMouse
              proximity={250}
              // Get started goes straight to the first lesson —
              // lessons are free to read, no sign-in needed. (The
              // header still has its own Sign in button.)
              onClick={() => router.push("/learn/python-home")}
            >
              {t.landing.getStarted} <ArrowRight className="h-4 w-4" />
            </SpecularButton>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            {t.landing.heroNote}
          </p>

          {/* Stats */}
          <div className="mt-10 grid w-full max-w-lg grid-cols-3 gap-3">
            {[
              { value: "812", label: t.landing.statTopics },
              { value: "268", label: t.landing.statVideos },
              { value: "6", label: t.landing.statStages },
            ].map((s) => (
              <div
                key={s.value}
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
            {t.landing.featuresHeading}
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
