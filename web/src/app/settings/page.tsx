"use client";

import { useEffect, useState } from "react";
import { Flame, Moon, Settings, Sun, Target } from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";
import Counter from "@/components/Counter";
import {
  PROGRESS_UPDATED_EVENT,
  computeStreak,
  emptyProgress,
  loadProgress,
  todayKey,
  wholeMinutes,
  type ProgressState,
} from "@/lib/progress";
import {
  THEME_CHANGED_EVENT,
  applyTheme,
  getStoredTheme,
  type Theme,
} from "@/lib/theme";

/**
 * Settings as its own page (/settings), reached from the profile
 * dropdown. Same content the modal used to hold: today's goal and
 * streak, plus the appearance (theme) toggle. No sign-in needed —
 * progress and theme both live in this browser.
 */
export default function SettingsPage() {
  const [progress, setProgress] = useState<ProgressState>(() => emptyProgress(todayKey()));
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getStoredTheme());
    const refresh = () => {
      setProgress(loadProgress((key) => localStorage.getItem(key)));
    };
    refresh();
    window.addEventListener(PROGRESS_UPDATED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  // Keep the toggle in sync if the theme changes elsewhere.
  useEffect(() => {
    const sync = () => setTheme(getStoredTheme());
    window.addEventListener(THEME_CHANGED_EVENT, sync);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, sync);
  }, []);

  function handleThemeChange(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  const minutes = wholeMinutes(progress.seconds);
  const goal = progress.goalMinutes;
  const pct = goal > 0 ? Math.min(100, Math.round((minutes / goal) * 100)) : 0;
  const streak = computeStreak(progress.activeDates, progress.date);

  return (
    <>
      <AppNavbar />
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Settings className="h-5 w-5 shrink-0 text-white" />
            Settings
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Your progress and how the app looks.
          </p>
        </div>

        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Today
        </h2>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
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
        <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
          <span className="flex items-center gap-2 text-sm text-neutral-300">
            <Flame className="h-4 w-4 text-white" />
            Streak
          </span>
          <div className="mt-1 flex items-end gap-2 text-white">
            <Counter value={streak} fontSize={56} fontWeight={600} />
            <span className="pb-2 text-sm text-neutral-400">day streak</span>
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Appearance
        </h2>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
          <span className="text-sm text-neutral-300">Theme</span>
          <div
            className="flex rounded-lg border border-neutral-800 bg-black p-0.5"
            role="group"
            aria-label="Theme"
          >
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
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
              onClick={() => handleThemeChange("light")}
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
      </main>
    </>
  );
}
