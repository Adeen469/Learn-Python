"use client";

import { useState } from "react";
import { Download, Wifi } from "lucide-react";
import { LEARN_TOPIC_COUNT } from "@/lib/learn/topic-slugs";
import { useLanguage } from "@/lib/i18n";
import {
  connectionAllowsWarming,
  isWifiOnlyEnabled,
  markDownloadOfferAnswered,
  maybeWarmAppPages,
  maybeWarmLessons,
} from "@/lib/offline-downloads";

// First-sign-in question: "lessons download karna hai ya nahi?"
// Two equal choices, side by side, same size — Yes starts the
// warming job (the Wi-Fi gate still applies), No starts NOTHING:
// no download, no background job. The answer is persisted, so
// this asks exactly once; a user who said No can still download
// later from Settings (bulk) or a lesson page (single lesson).
// No X, no Escape: the user answers the question — a No is a real
// answer, not a dismissal. If Yes is picked but the Wi-Fi gate
// blocks the start, the popup says so and the job starts on its
// own when the connection allows it (the Yes is already stored).
export function OfflineDownloadPopup({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [blocked, setBlocked] = useState(false);

  function handleYes() {
    markDownloadOfferAnswered("yes");
    // The job itself takes minutes (812 pages) — the popup must
    // close as soon as it STARTS, not when it finishes. So the
    // Wi-Fi gate is checked synchronously here (online + toggle +
    // connection heuristic); the job then runs in the background.
    // The signed-in gate is skipped: this popup only renders for a
    // signed-in user, and maybeWarmLessons re-checks it anyway.
    if (
      typeof navigator !== "undefined" &&
      navigator.onLine &&
      isWifiOnlyEnabled() &&
      connectionAllowsWarming()
    ) {
      void maybeWarmLessons();
      void maybeWarmAppPages();
      onClose();
    } else {
      setBlocked(true);
    }
  }

  function handleNo() {
    // No download, no background job, nothing starts.
    markDownloadOfferAnswered("no");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t.offline.askTitle}
    >
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <h3 className="flex items-center gap-2 text-base font-semibold text-white">
          <Download className="h-5 w-5 shrink-0 text-white" />
          {t.offline.askTitle}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          {t.offline.askBody(LEARN_TOPIC_COUNT)}
        </p>
        {blocked ? (
          <>
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs leading-relaxed text-neutral-300">
              <Wifi className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t.offline.askWaitingWifi}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
              >
                {t.offline.askGotIt}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleYes}
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              {t.offline.askYes}
            </button>
            <button
              type="button"
              onClick={handleNo}
              className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:text-white"
            >
              {t.offline.askNo}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
