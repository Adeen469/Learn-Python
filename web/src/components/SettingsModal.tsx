"use client";

import { useEffect } from "react";
import { Flame, Moon, Settings, Sun, Target, X } from "lucide-react";
import {
  computeStreak,
  wholeMinutes,
  type ProgressState,
} from "@/lib/progress";
import type { Theme } from "@/lib/theme";

/**
 * Settings, opened from the profile dropdown. Holds the things that
 * used to live as pills in the navbar — today's goal and the streak —
 * plus the appearance (theme) toggle. Same muted modal style as the
 * roadmap: dark card, white accents, no gradients.
 */
export function SettingsModal({
  progress,
  theme,
  onThemeChange,
  onClose,
}: {
  progress: ProgressState;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
}) {
  // Escape closes the modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const minutes = wholeMinutes(progress.seconds);
  const goal = progress.goalMinutes;
  const pct = goal > 0 ? Math.min(100, Math.round((minutes / goal) * 100)) : 0;
  const streak = computeStreak(progress.activeDates, progress.date);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-neutral-800 bg-neutral-950 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-neutral-800 px-5 py-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <Settings className="h-5 w-5 shrink-0 text-white" />
              Settings
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Your progress and how the app looks.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Today
          </h3>
          <div className="rounded-xl border border-neutral-800 bg-black px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-neutral-300">
                <Target className="h-4 w-4 text-neutral-400" />
                Today&apos;s goal
              </span>
              <span className="text-sm font-medium text-white">
                {minutes}/{goal}m
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-black px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-neutral-300">
              <Flame className="h-4 w-4 text-white" />
              Streak
            </span>
            <span className="text-sm font-medium text-white">{streak}d streak</span>
          </div>

          <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Appearance
          </h3>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-black px-4 py-3">
            <span className="text-sm text-neutral-300">Theme</span>
            <div
              className="flex rounded-lg border border-neutral-800 bg-neutral-950 p-0.5"
              role="group"
              aria-label="Theme"
            >
              <button
                type="button"
                onClick={() => onThemeChange("dark")}
                aria-pressed={theme === "dark"}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  theme === "dark"
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                Dark
              </button>
              <button
                type="button"
                onClick={() => onThemeChange("light")}
                aria-pressed={theme === "light"}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  theme === "light"
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                Light
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
