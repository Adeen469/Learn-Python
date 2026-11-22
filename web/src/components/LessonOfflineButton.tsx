"use client";

import { useEffect, useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { PAGES_CACHE, WARM_EVENT } from "@/lib/offline-downloads";

type ButtonState =
  | "checking"
  | "unsupported"
  | "saved"
  | "not-saved"
  | "saving"
  | "error";

// Save THIS lesson offline, from the breadcrumb — it works even
// when the bulk download never ran: it writes the lesson page
// straight into the service worker's pages cache (same cache, same
// scheme the warming job uses), so the page loads offline afterwards.
export function LessonOfflineButton({ slug }: { slug: string }) {
  const { t } = useLanguage();
  const [state, setState] = useState<ButtonState>("checking");

  useEffect(() => {
    if (typeof window === "undefined" || !("caches" in window)) {
      setState("unsupported");
      return;
    }
    let cancelled = false;
    const check = async () => {
      try {
        const cache = await caches.open(PAGES_CACHE);
        const hit = await cache.match(`/learn/${slug}`);
        if (!cancelled) setState(hit ? "saved" : "not-saved");
      } catch {
        if (!cancelled) setState("not-saved");
      }
    };
    void check();
    // The bulk warming job may save this lesson while the page is
    // open — flip to Saved when it does.
    const onWarm = () => {
      void check();
    };
    window.addEventListener(WARM_EVENT, onWarm);
    return () => {
      cancelled = true;
      window.removeEventListener(WARM_EVENT, onWarm);
    };
  }, [slug]);

  async function handleSave() {
    if (state !== "not-saved" && state !== "error") return;
    setState("saving");
    try {
      const cache = await caches.open(PAGES_CACHE);
      await cache.add(`/learn/${slug}`);
      setState("saved");
    } catch {
      setState("error");
      // The error clears itself after a few seconds; the button
      // stays usable so the user can retry.
      window.setTimeout(() => {
        setState((s) => (s === "error" ? "not-saved" : s));
      }, 4000);
    }
  }

  // No Cache API (or still checking): render nothing, no flicker.
  if (state === "checking" || state === "unsupported") return null;

  const saved = state === "saved";
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={state === "saving" || saved}
        title={saved ? t.offline.lessonSaved : t.offline.saveLesson}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
          saved
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-600 hover:text-white"
        }`}
      >
        {state === "saving" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : saved ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        {state === "saving"
          ? t.offline.savingLesson
          : saved
            ? t.offline.lessonSaved
            : t.offline.saveLesson}
      </button>
      {state === "error" && (
        <span className="text-xs text-red-400">{t.offline.saveFailed}</span>
      )}
    </span>
  );
}
