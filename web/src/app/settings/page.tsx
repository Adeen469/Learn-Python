"use client";

import { useEffect, useState } from "react";
import { Flame, Moon, Settings, Sun, Target } from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";
import Counter from "@/components/Counter";
import {
  PROGRESS_KEY,
  PROGRESS_UPDATED_EVENT,
  computeStreak,
  emptyProgress,
  loadProgress,
  markActive,
  todayKey,
  wholeMinutes,
  type ProgressState,
} from "@/lib/progress";
import {
  MAX_RESTORES_PER_MONTH,
  RESTORE_KEY,
  getRestoreState,
  loadRestores,
  splitCountdown,
  type RestoreState,
} from "@/lib/streak-restore";
import {
  THEME_CHANGED_EVENT,
  applyTheme,
  getStoredTheme,
  type Theme,
} from "@/lib/theme";
import TwoFactorSettings from "@/components/TwoFactorSettings";

/**
 * Settings as its own page (/settings), reached from the profile
 * dropdown. Same content the modal used to hold: today's goal and
 * streak, plus the appearance (theme) toggle. No sign-in needed —
 * progress and theme both live in this browser.
 */
function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex flex-col items-center">
      {/* No intro spin: a countdown must read at a glance, the per-second
          roll still shows the odometer effect. */}
      <Counter value={value} minDigits={2} fontSize={28} fontWeight={600} intro={false} />
      <span className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">
        {label}
      </span>
    </span>
  );
}

// Progress + restores load in the initial state (not only in an effect),
// so the streak and the restore card render on the first paint instead
// of flashing empty. On the server there is no localStorage, so SSR
// falls back to empty state and hydration fills it in.
function initialProgress(): ProgressState {
  if (typeof window === "undefined") return emptyProgress(todayKey());
  return loadProgress((key) => localStorage.getItem(key));
}

function initialRestores(): string[] {
  if (typeof window === "undefined") return [];
  return loadRestores((key) => localStorage.getItem(key));
}

export default function SettingsPage() {
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [theme, setTheme] = useState<Theme>("dark");
  const [restores, setRestores] = useState<string[]>(initialRestores);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [restoredNote, setRestoredNote] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    const refresh = () => {
      setProgress(loadProgress((key) => localStorage.getItem(key)));
      setRestores(loadRestores((key) => localStorage.getItem(key)));
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
  const restoreState: RestoreState = getRestoreState(
    progress.activeDates,
    progress.date,
    nowMs,
    restores
  );

  // Tick the restore countdown once a second while it is live.
  useEffect(() => {
    if (restoreState.status !== "available") return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [restoreState.status]);

  // Clear the "restored" note after a while.
  useEffect(() => {
    if (!restoredNote) return;
    const timer = window.setTimeout(() => setRestoredNote(false), 8000);
    return () => window.clearTimeout(timer);
  }, [restoredNote]);

  function handleRestore() {
    if (restoreState.status !== "available") return;
    // Fill in the missed day so the run ends there again, and spend one
    // of this month's restores.
    const next = markActive(progress, restoreState.missedDay);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
    const updatedRestores = [...restores, new Date().toISOString()];
    localStorage.setItem(RESTORE_KEY, JSON.stringify(updatedRestores));
    setRestores(updatedRestores);
    setProgress(next);
    setRestoredNote(true);
  }

  const countdown =
    restoreState.status === "available"
      ? splitCountdown(restoreState.deadlineMs, nowMs)
      : null;

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
          {restoredNote && (
            <p className="mt-2 text-sm text-white">Streak restored — welcome back.</p>
          )}
        </div>

        {restoreState.status === "available" && countdown && (
          <div className="mt-2 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-4">
            <p className="text-sm font-medium text-white">Streak broken</p>
            <p className="mt-1 text-sm text-neutral-400">
              Your {restoreState.brokenStreak}-day streak broke. Restore it
              before the timer runs out — {restoreState.restoresUsed} of{" "}
              {MAX_RESTORES_PER_MONTH} restores used this month.
            </p>
            <div className="mt-3 flex items-start gap-1.5 text-white">
              <CountdownUnit value={countdown.hours} label="hrs" />
              <span className="pt-0.5 text-2xl font-semibold leading-none">:</span>
              <CountdownUnit value={countdown.minutes} label="min" />
              <span className="pt-0.5 text-2xl font-semibold leading-none">:</span>
              <CountdownUnit value={countdown.seconds} label="sec" />
            </div>
            <button
              type="button"
              onClick={handleRestore}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
            >
              Restore {restoreState.brokenStreak}-day streak
            </button>
          </div>
        )}

        {restoreState.status === "expired" && (
          <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
            <p className="text-sm font-medium text-white">Streak broken</p>
            <p className="mt-1 text-sm text-neutral-400">
              Your {restoreState.brokenStreak}-day streak broke and the
              24-hour restore window has passed. Watch a lesson to start a
              new streak.
            </p>
          </div>
        )}

        {restoreState.status === "limit" && (
          <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
            <p className="text-sm font-medium text-white">No restores left</p>
            <p className="mt-1 text-sm text-neutral-400">
              You used all {MAX_RESTORES_PER_MONTH} restores this month. Your{" "}
              {restoreState.brokenStreak}-day streak broke — watch a lesson
              to start a new streak. Restores reset next month.
            </p>
          </div>
        )}

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

        <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Account security
        </h2>
        <TwoFactorSettings />
      </main>
    </>
  );
}
