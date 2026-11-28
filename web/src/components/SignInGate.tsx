"use client";

import { Lock } from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";
import { useLanguage } from "@/lib/i18n";

/**
 * Sign-in gate screen for the gated pages (/courses, /editor,
 * /github). A guest sees a warning + a Sign in button ON the page
 * instead of a silent bounce to the landing page — and no gated
 * content renders or fetches behind it: each page returns this
 * before its own content, and every data call it would make 401s
 * for guests anyway. Copy is English on purpose: the button label
 * is the translated `t.common.signIn`, the two warning lines are
 * the same in every language (no new i18n keys for a gate screen).
 */
export default function SignInGate() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0">
      <AppNavbar />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          Sign in to continue
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-400 sm:text-base">
          This section needs an account. Lessons are free to read — sign in to save your progress and use courses, the code editor and GitHub.
        </p>
        <a
          href="/auth/email"
          className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200"
        >
          {t.common.signIn}
        </a>
      </main>
    </div>
  );
}
