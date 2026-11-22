"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight, Download, Flame, Languages, Loader2, Moon, Settings, Sun, Target, Trash2, Wifi } from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";
import Counter from "@/components/Counter";
import { LANGUAGES, useLanguage } from "@/lib/i18n";
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
import {
  WARM_EVENT,
  clearAllSavedLessons,
  downloadLessonsAgain,
  getSavedLessons,
  getSavedVideos,
  isWifiOnlyEnabled,
  maybeWarmLessons,
  readWarmProgress,
  removeSavedLesson,
  removeSavedVideo,
  setWifiOnlyEnabled,
  syncWarmProgress,
  type SavedLesson,
  type SavedVideo,
  type WarmProgress,
} from "@/lib/offline-downloads";

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
  const { lang, setLang, t } = useLanguage();
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [theme, setTheme] = useState<Theme>("dark");
  const [restores, setRestores] = useState<string[]>(initialRestores);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [restoredNote, setRestoredNote] = useState(false);
  const [wifiOnly, setWifiOnly] = useState<boolean>(() => isWifiOnlyEnabled());
  const [warm, setWarm] = useState<WarmProgress>(() => readWarmProgress());
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  // Drill-down for the saved lessons, mirroring the editor's AI
  // Settings card: the "Offline lessons" row opens a lessons view
  // with an "Offline > Lessons" breadcrumb, and the back arrow
  // returns to the overview. Only the lessons get this treatment.
  const [lessonsOpen, setLessonsOpen] = useState(false);
  // Re-download in progress: set the instant the button is tapped,
  // so the user sees processing at once instead of a dead button.
  const [reDownloading, setReDownloading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  // Close the language dropdown on Escape.
  useEffect(() => {
    if (!langOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [langOpen]);

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

  // Offline section: warming status (live via the warm event) and the
  // saved-videos list (validated against the real cache).
  useEffect(() => {
    let alive = true;
    const refreshSaved = () => {
      void getSavedVideos().then((list) => {
        if (alive) setSavedVideos(list);
      });
    };
    const refreshLessons = () => {
      void getSavedLessons().then((list) => {
        if (alive) setSavedLessons(list);
      });
      // Lessons cached by visiting (not by the warmer) leave the
      // stored progress stale — reconcile it with the real cache.
      void syncWarmProgress();
    };
    const onWarm = (e: Event) => {
      const p = (e as CustomEvent<WarmProgress>).detail;
      if (p) {
        setWarm(p);
        // A warming run only finishes once: refresh the list then,
        // not on every batch (812 cache matches per batch is waste).
        if (p.state === "done") refreshLessons();
      }
    };
    setWarm(readWarmProgress());
    refreshSaved();
    refreshLessons();
    window.addEventListener(WARM_EVENT, onWarm);
    window.addEventListener("focus", refreshSaved);
    window.addEventListener("focus", refreshLessons);
    return () => {
      alive = false;
      window.removeEventListener(WARM_EVENT, onWarm);
      window.removeEventListener("focus", refreshSaved);
      window.removeEventListener("focus", refreshLessons);
    };
  }, []);

  function handleWifiToggle(next: boolean) {
    setWifiOnlyEnabled(next);
    setWifiOnly(next);
    if (next) void maybeWarmLessons();
  }

  async function handleRemoveSaved(lessonId: string) {
    await removeSavedVideo(lessonId);
    setSavedVideos(await getSavedVideos());
  }

  async function handleRemoveLesson(slug: string) {
    await removeSavedLesson(slug);
    setSavedLessons(await getSavedLessons());
  }

  async function handleClearAllLessons() {
    await clearAllSavedLessons();
    setSavedLessons([]);
    setConfirmClear(false);
  }

  async function handleDownloadAgain() {
    // Show processing AT ONCE: the run takes a while for 812
    // lessons, and with no feedback the button looked dead, so the
    // user kept tapping it. The busy state also blocks double taps;
    // the label carries the live % from the warm events.
    if (reDownloading) return;
    setReDownloading(true);
    try {
      await downloadLessonsAgain();
    } finally {
      setReDownloading(false);
    }
  }

  function closeLessons() {
    setLessonsOpen(false);
    setConfirmClear(false);
  }

  const warmPct =
    warm.total > 0 ? Math.round((warm.done / warm.total) * 100) : 0;
  const warmText =
    warm.state === "done"
      ? t.offline.lessonsReady(warm.done, warm.total)
      : warm.state === "warming"
        ? t.offline.lessonsDownloading(warmPct)
        : warm.state === "waiting"
          ? t.offline.lessonsWaiting
          : t.offline.lessonsReady(warm.done, warm.total);

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
            {t.common.settings}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {t.settingsPage.subtitle}
          </p>
        </div>

        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {t.settingsPage.todaySection}
        </h2>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-neutral-300">
              <Target className="h-4 w-4 text-neutral-400" />
              {t.settings.dailyGoal}
            </span>
            <span className="text-sm font-medium text-white">
              {t.settingsPage.goalProgress(minutes, goal)}
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
            {t.settings.streak}
          </span>
          <div className="mt-1 flex items-end gap-2 text-white">
            <Counter value={streak} fontSize={56} fontWeight={600} />
            <span className="pb-2 text-sm text-neutral-400">{t.profile.statStreakLabel}</span>
          </div>
          {restoredNote && (
            <p className="mt-2 text-sm text-white">{t.settingsPage.streakRestored}</p>
          )}
        </div>

        {restoreState.status === "available" && countdown && (
          <div className="mt-2 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-4">
            <p className="text-sm font-medium text-white">{t.settingsPage.streakBroken}</p>
            <p className="mt-1 text-sm text-neutral-400">
              {t.settingsPage.streakBrokenRestore(
                restoreState.brokenStreak,
                restoreState.restoresUsed,
                MAX_RESTORES_PER_MONTH
              )}
            </p>
            <div className="mt-3 flex items-start gap-1.5 text-white">
              <CountdownUnit value={countdown.hours} label={t.settingsPage.countdownHrs} />
              <span className="pt-0.5 text-2xl font-semibold leading-none">:</span>
              <CountdownUnit value={countdown.minutes} label={t.settingsPage.countdownMin} />
              <span className="pt-0.5 text-2xl font-semibold leading-none">:</span>
              <CountdownUnit value={countdown.seconds} label={t.settingsPage.countdownSec} />
            </div>
            <button
              type="button"
              onClick={handleRestore}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
            >
              {t.settingsPage.restoreStreakButton(restoreState.brokenStreak)}
            </button>
          </div>
        )}

        {restoreState.status === "expired" && (
          <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
            <p className="text-sm font-medium text-white">{t.settingsPage.streakBroken}</p>
            <p className="mt-1 text-sm text-neutral-400">
              {t.settingsPage.streakBrokenExpired(restoreState.brokenStreak)}
            </p>
          </div>
        )}

        {restoreState.status === "limit" && (
          <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
            <p className="text-sm font-medium text-white">{t.settingsPage.noRestoresLeft}</p>
            <p className="mt-1 text-sm text-neutral-400">
              {t.settingsPage.noRestoresLeftBody(
                MAX_RESTORES_PER_MONTH,
                restoreState.brokenStreak
              )}
            </p>
          </div>
        )}

        <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {t.settings.appearance}
        </h2>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
          <span className="text-sm text-neutral-300">{t.settings.theme}</span>
          <div
            className="flex rounded-lg border border-neutral-800 bg-black p-0.5"
            role="group"
            aria-label={t.settings.theme}
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
              {t.settings.themeDark}
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
              {t.settings.themeLight}
            </button>
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {t.settings.language}
        </h2>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-neutral-300">
            <Languages className="h-4 w-4 text-neutral-400" />
            {t.settings.language}
          </span>
          <p className="mt-1 text-sm text-neutral-400">
            {t.settings.languageHint}
          </p>
          <div className="relative mt-3">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-left"
            >
              <span>
                <span className="block text-sm text-white">{currentLang.label}</span>
                <span className="block text-xs text-neutral-400">
                  {currentLang.englishName}
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${langOpen ? "rotate-180" : ""}`}
              />
            </button>
            {langOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close language menu"
                  onClick={() => setLangOpen(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />
                <div
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 py-1 shadow-xl"
                >
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      role="option"
                      aria-selected={lang === l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-neutral-900"
                    >
                      <span>
                        <span className="block text-sm text-white">{l.label}</span>
                        <span className="block text-xs text-neutral-400">
                          {l.englishName}
                        </span>
                      </span>
                      {lang === l.code && (
                        <Check className="h-4 w-4 shrink-0 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {t.offline.heading}
        </h2>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
          {lessonsOpen ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeLessons}
                  aria-label={t.offline.heading}
                  title={t.offline.heading}
                  className="shrink-0 rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="flex-1 text-sm font-semibold text-neutral-200">
                  <button
                    type="button"
                    onClick={closeLessons}
                    className="text-neutral-400 hover:text-white"
                  >
                    {t.offline.heading}
                  </button>
                  <span className="text-neutral-500">{" > "}</span>
                  {t.offline.lessons}
                </span>
              </div>
              <div className="mt-3 border-t border-neutral-800 pt-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-neutral-300">{t.offline.savedLessons}</span>
                  {savedLessons.length > 0 &&
                    (confirmClear ? (
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">
                          {t.offline.confirmDeleteAll(savedLessons.length)}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleClearAllLessons()}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-300 transition hover:border-red-500/70 hover:text-red-200"
                        >
                          {t.offline.deleteAll}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClear(false)}
                          className="inline-flex shrink-0 items-center rounded-lg border border-neutral-800 bg-black px-2.5 py-1.5 text-xs text-neutral-400 transition hover:border-neutral-600 hover:text-white"
                        >
                          {t.common.cancel}
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmClear(true)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-800 bg-black px-2.5 py-1.5 text-xs text-neutral-400 transition hover:border-red-500/40 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t.offline.deleteAll}
                      </button>
                    ))}
                </div>
                {savedLessons.length === 0 ? (
                  <div className="mt-2">
                    <p className="text-xs text-neutral-400">{t.offline.noSavedLessons}</p>
                    <button
                      type="button"
                      onClick={handleDownloadAgain}
                      disabled={reDownloading}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
                    >
                      {reDownloading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {t.offline.lessonsDownloading(warmPct)}
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          {t.offline.downloadAgain}
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 max-h-72 divide-y divide-neutral-800 overflow-y-auto">
                    {savedLessons.map((l) => (
                      <div
                        key={l.slug}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <span className="min-w-0 truncate text-sm">
                          <span className="text-neutral-500">{l.sectionTitle} › </span>
                          <span className="text-white">{l.title}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleRemoveLesson(l.slug)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-800 bg-black px-2.5 py-1.5 text-xs text-neutral-400 transition hover:border-neutral-600 hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t.offline.removeSaved}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <span>
                  <span className="flex items-center gap-2 text-sm text-neutral-300">
                    <Wifi className="h-4 w-4 text-neutral-400" />
                    {t.offline.wifiOnly}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-neutral-400">
                    {t.offline.wifiOnlyHint}
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={wifiOnly}
                  aria-label={t.offline.wifiOnly}
                  onClick={() => handleWifiToggle(!wifiOnly)}
                  className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition ${
                    wifiOnly ? "bg-white" : "bg-neutral-700"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full transition-all ${
                      wifiOnly ? "ml-auto bg-black" : "bg-white"
                    }`}
                  />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setLessonsOpen(true)}
                className="mt-3 block w-full border-t border-neutral-800 pt-3 text-left"
              >
                <span className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-neutral-300">{t.offline.lessonsLabel}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-white">{warmText}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
                  </span>
                </span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-neutral-800">
                  <span
                    className="block h-full rounded-full bg-white transition-all"
                    style={{ width: `${warmPct}%` }}
                  />
                </span>
              </button>
              <div className="mt-3 border-t border-neutral-800 pt-3">
                <span className="text-sm text-neutral-300">{t.offline.savedVideos}</span>
                {savedVideos.length === 0 ? (
                  <p className="mt-1 text-xs text-neutral-400">
                    {t.offline.noSavedVideos}
                  </p>
                ) : (
                  <div className="mt-2 divide-y divide-neutral-800">
                    {savedVideos.map((v) => (
                      <div
                        key={v.lessonId}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <span className="min-w-0 truncate text-sm text-white">
                          {v.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleRemoveSaved(v.lessonId)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-800 bg-black px-2.5 py-1.5 text-xs text-neutral-400 transition hover:border-neutral-600 hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t.offline.removeSaved}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {t.settingsPage.accountSecurity}
        </h2>
        <TwoFactorSettings />
      </main>
    </>
  );
}
