"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Code2, Flame, Github, LogOut, Map, Target, User } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchSessionUser,
  signOut,
  type SessionUser,
} from "@/lib/auth-client";
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
  ACTIVE_LESSON_KEY,
  LESSON_SELECT_EVENT,
  ROADMAP_OPEN_EVENT,
} from "@/lib/entered";
import { Roadmap } from "@/components/Roadmap";
import type { Lesson } from "@/lib/catalog";

function ProfileMenuItems({
  user,
  onOpenRoadmap,
  onSignOut,
  onClose,
}: {
  user: SessionUser | null;
  onOpenRoadmap: () => void;
  onSignOut: () => void;
  onClose: () => void;
}) {
  return (
    <div data-profile-menu className="p-1.5">
      {user ? (
        <div className="flex items-center gap-2.5 border-b border-neutral-900 px-3 pb-2.5 pt-1.5">
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>
      ) : (
        <a
          href="/api/auth/google"
          className="mb-1 flex w-full items-center gap-2.5 rounded-lg bg-white px-3 py-2 text-left text-sm font-semibold text-black hover:bg-neutral-200 transition"
        >
          Sign in with Google
        </a>
      )}
      <button
        type="button"
        onClick={onOpenRoadmap}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900 hover:text-white transition"
      >
        <Map className="h-4 w-4 text-neutral-400" /> Roadmap
      </button>
      <Link
        href="/github"
        onClick={onClose}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900 hover:text-white transition"
      >
        <Github className="h-4 w-4 text-neutral-400" /> GitHub
      </Link>
      {user && (
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900 hover:text-white transition"
        >
          <LogOut className="h-4 w-4 text-neutral-400" /> Sign out
        </button>
      )}
    </div>
  );
}

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressState>(() => emptyProgress(todayKey()));
  const [profileOpen, setProfileOpen] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSessionUser().then((u) => {
      if (!cancelled) setUser(u);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
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

  // The roadmap opens from the first-entry flow (home page) and from the
  // profile dropdown — both go through this event.
  useEffect(() => {
    const open = () => setRoadmapOpen(true);
    window.addEventListener(ROADMAP_OPEN_EVENT, open);
    return () => window.removeEventListener(ROADMAP_OPEN_EVENT, open);
  }, []);

  // Escape closes the menu and the roadmap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setRoadmapOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Clicking outside the profile menu closes it (either trigger or menu).
  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("[data-profile-menu], [data-profile-trigger]")) return;
      setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [profileOpen]);

  const navLinks = [
    { href: "/", label: "Course", icon: BookOpen },
    { href: "/editor", label: "Code Editor", icon: Code2 },
  ];

  function openRoadmap() {
    setProfileOpen(false);
    setRoadmapOpen(true);
  }

  async function handleSignOut() {
    setProfileOpen(false);
    await signOut();
    // Full reload: the home gate re-checks the session and shows the
    // landing page; no stale app state survives.
    window.location.href = "/";
  }

  function selectRoadmapLesson(lesson: Lesson) {
    try {
      localStorage.setItem(ACTIVE_LESSON_KEY, lesson.id);
    } catch {
      // Ignore.
    }
    setRoadmapOpen(false);
    window.dispatchEvent(new CustomEvent(LESSON_SELECT_EVENT, { detail: lesson.id }));
    if (pathname !== "/") router.push("/");
  }

  const profileTriggerClass =
    "flex items-center justify-center rounded-full border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white hover:border-neutral-600 transition";

  return (
    <>
      {/* PC top bar: Course, Code Editor, profile dropdown top-right. */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <Link href="/" className="flex shrink-0 items-center gap-2.5 hover:opacity-90 transition">
              <img
                src="/lp-logo.png"
                alt="LP Logo"
                width={28}
                height={28}
                className="h-7 w-7 rounded-md object-contain"
              />
              <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-white">
                LP <span className="hidden text-xs text-neutral-500 font-normal lg:inline">Learn Python</span>
              </span>
            </Link>

            {/* Nav links live here on PC only; mobile uses the bottom bar. */}
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    title={label}
                    aria-label={label}
                    className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 ${
                      active
                        ? "bg-white text-black"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-300">
              <Target className="h-3.5 w-3.5 text-neutral-400" />
              <span>{wholeMinutes(progress.seconds)}/{progress.goalMinutes}m</span>
            </div>
            <div className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-white md:flex">
              <Flame className="h-3.5 w-3.5 text-white" />
              <span>{computeStreak(progress.activeDates, progress.date)}d streak</span>
            </div>

            {/* Profile dropdown (top-right). Shows the signed-in Google
                account (picture + name) with Sign out; guests get a
                sign-in link. */}
            <div className="relative hidden md:block">
              <button
                type="button"
                data-profile-trigger
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Profile menu"
                aria-expanded={profileOpen}
                className={`${profileTriggerClass} h-8 w-8 overflow-hidden`}
              >
                {user?.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.picture}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : user ? (
                  <span className="text-sm font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-4 w-4" />
                )}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-52 rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl">
                  <ProfileMenuItems
                    user={user}
                    onOpenRoadmap={openRoadmap}
                    onSignOut={handleSignOut}
                    onClose={() => setProfileOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav bar (website or APK): same items as the PC bar. */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-800 bg-black/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-3">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                  active ? "text-white" : "text-neutral-500 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
          <div className="relative">
            <button
              type="button"
              data-profile-trigger
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Profile menu"
              aria-expanded={profileOpen}
              className={`flex w-full flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                profileOpen ? "text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              {user?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              Profile
            </button>
            {/* Menu opens upward from the bottom bar. */}
            {profileOpen && (
              <div className="absolute bottom-full right-2 z-40 mb-2 w-52 rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl">
                <ProfileMenuItems
                  user={user}
                  onOpenRoadmap={openRoadmap}
                  onSignOut={handleSignOut}
                  onClose={() => setProfileOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {roadmapOpen && (
        <Roadmap onClose={() => setRoadmapOpen(false)} onSelectLesson={selectRoadmapLesson} />
      )}
    </>
  );
}
