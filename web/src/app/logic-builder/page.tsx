"use client";

import { Blocks } from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";
import { useLanguage } from "@/lib/i18n";

/**
 * Logic Builder (/logic-builder) — a placeholder for now. The navbar
 * button sits between Courses and Code Editor. The page says
 * "Coming Soon" in the centre and tells the user they'll get an
 * email when it's ready. Guests can view it, like the lessons.
 */
export default function LogicBuilderPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <AppNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950">
          <Blocks className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          {t.logicBuilder.comingSoon}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400 sm:text-base">
          {t.logicBuilder.notifyText}
        </p>
      </main>
    </div>
  );
}
