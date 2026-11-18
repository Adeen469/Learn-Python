"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    // Surface the error for debugging; nothing sensitive is rendered.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <span className="text-4xl font-bold tracking-tight text-white">{t.common.genericError}</span>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-400">
        {t.common.errorPageDetail}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-neutral-200"
        >
          {t.update.tryAgain}
        </button>
        <Link
          href="/"
          className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition hover:border-neutral-700 hover:bg-neutral-900"
        >
          {t.common.backToDashboard}
        </Link>
      </div>
    </div>
  );
}
