"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Code2, Github, LogOut, Map, MonitorPlay, Settings, User } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import {
  fetchSessionUser,
  signOut,
  type SessionUser,
} from "@/lib/auth-client";
import { ROADMAP_SEEN_KEY } from "@/lib/roadmap";
import { RoadmapHint, RoadmapModal } from "@/components/RoadmapModal";
import {
  PROGRESS_UPDATED_EVENT,
  emptyProgress,
  loadProgress,
  todayKey,
  type ProgressState,
} from "@/lib/progress";
import PillNav from "@/components/PillNav";

// Three items, everywhere: Learn (the W3Schools-style main page),
// Video Courses (Harry / Apna College / Mosh), Code Editor.
const navLinks = [
  { href: "/learn/python-home", label: "Learn", icon: BookOpenText, match: "/learn" },
  { href: "/courses", label: "Video Courses", icon: MonitorPlay, match: "/courses" },
  { href: "/editor", label: "Code Editor", icon: Code2, match: "/editor" },
];

function ProfileMenuItems({
  user,
  onSignOut,
  onRoadmap,
  onClose,
}: {
  user: SessionUser | null;
  onSignOut: () => void;
  onRoadmap: () => void;
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
      <Link
        href="/github"
        onClick={onClose}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900 hover:text-white transition"
      >
        <Github className="h-4 w-4 text-neutral-400" /> GitHub
      </Link>
      <Link
        href="/settings"
        onClick={onClose}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900 hover:text-white transition"
      >
        <Settings className="h-4 w-4 text-neutral-400" /> Settings
      </Link>
      {user && (
        <button
          type="button"
          onClick={() => {
            onClose();
            onRoadmap();
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900 hover:text-white transition"
        >
          <Map className="h-4 w-4 text-neutral-400" /> Roadmap
        </button>
      )}
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
  const [progress, setProgress] = useState<ProgressState>(() => emptyProgress(todayKey()));
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [roadmapHintOpen, setRoadmapHintOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSessionUser().then((u) => {
      if (!cancelled) setUser(u);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // First sign-in on this browser: show the roadmap once, right
  // after registration. Closing it marks it seen, so it never
  // auto-shows again — it stays reachable from the profile menu.
  useEffect(() => {
    if (!user) return;
    try {
      if (localStorage.getItem(ROADMAP_SEEN_KEY) !== "1") {
        setRoadmapOpen(true);
      }
    } catch {
      // If storage is unavailable, don't block the page.
    }
  }, [user]);

  // Closing the roadmap: the hint is a one-time notice — it appears
  // ONLY the first time the roadmap is closed, and it appears BEFORE
  // the roadmap goes away (over the still-open modal), never after.
  // Later closes just close the modal, no hint.
  function handleCloseRoadmap() {
    // While the hint is up, the modal underneath must not react to
    // Escape — the hint is dismissed with Got it (or its own Escape).
    if (roadmapHintOpen) return;
    let firstClose = false;
    try {
      firstClose = localStorage.getItem(ROADMAP_SEEN_KEY) !== "1";
      localStorage.setItem(ROADMAP_SEEN_KEY, "1");
    } catch {
      // Ignore storage failures.
    }
    if (firstClose) {
      setRoadmapHintOpen(true);
    } else {
      setRoadmapOpen(false);
    }
  }

  // Dismissing the hint is what finally closes the roadmap (first
  // close only). After this, the hint never appears again.
  function handleRoadmapHintGotIt() {
    setRoadmapHintOpen(false);
    setRoadmapOpen(false);
  }

  // Picking a topic is a navigation, not a close: the modal goes
  // away quietly and the hint never fires for it.
  function handleRoadmapNavigate() {
    setRoadmapOpen(false);
    try {
      localStorage.setItem(ROADMAP_SEEN_KEY, "1");
    } catch {
      // Ignore storage failures.
    }
  }

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

  // Escape closes the menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
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

  async function handleSignOut() {
    setProfileOpen(false);
    await signOut();
    // Full reload: the home gate re-checks the session and shows the
    // landing page; no stale app state survives.
    window.location.href = "/";
  }

  const profileTriggerClass =
    "flex items-center justify-center rounded-full border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white hover:border-neutral-600 transition";

  // Which nav item is the current page ("" = none, e.g. landing/settings).
  const activeNavHref = pathname.startsWith("/learn")
    ? "/learn/python-home"
    : pathname.startsWith("/courses")
      ? "/courses"
      : pathname.startsWith("/editor")
        ? "/editor"
        : "";

  return (
    <>
      {/* PC top bar: logo left, the three nav buttons centred, profile
          dropdown top-right. */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5">
          <div className="flex min-w-0 items-center justify-start">
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
          </div>

          {/* Nav links live here on PC only, centred (PillNav); mobile uses the bottom bar. */}
          <div className="hidden items-center justify-center md:flex">
            <PillNav
              items={navLinks.map(({ href, label, icon: Icon }) => ({
                label,
                href,
                icon: <Icon />,
              }))}
              activeHref={activeNavHref}
              linkComponent={Link}
              theme="dark"
              itemStyle="plain"
              hoverEffect="fill"
              indicator="dot"
              size="sm"
              collapse="never"
            />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2.5">
            {/* Profile dropdown (top-right). Shows the signed-in Google
                account (picture + name) with Sign out; guests get a
                sign-in link. Today's goal and streak now live in
                Settings, not as pills in the bar. */}
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
                    onSignOut={handleSignOut}
                    onRoadmap={() => setRoadmapOpen(true)}
                    onClose={() => setProfileOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav (floating dock): the same PillNav as the PC bar,
          plus the profile circle beside it. The menu opens upward. */}
      <div className="fixed bottom-3 left-0 right-0 z-30 flex items-center justify-center gap-2 md:hidden">
        <PillNav
          items={navLinks.map(({ href, label, icon: Icon }) => ({
            label,
            href,
            icon: <Icon />,
          }))}
          activeHref={activeNavHref}
          linkComponent={Link}
          theme="dark"
          itemStyle="plain"
          hoverEffect="fill"
          indicator="dot"
          size="sm"
          collapse="never"
          style={{ "--pn-x": "8px", "--pn-font": "12px" } as CSSProperties}
        />
        <div className="relative">
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
          {/* Menu opens upward from the bottom dock. */}
          {profileOpen && (
            <div className="absolute bottom-full right-0 z-40 mb-2 w-52 rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl">
              <ProfileMenuItems
                user={user}
                onSignOut={handleSignOut}
                onRoadmap={() => setRoadmapOpen(true)}
                onClose={() => setProfileOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Python roadmap: auto-shows once after first sign-in, and
          the hint appears only on the first close, over the still-open
          modal — the modal goes away only when the hint is dismissed. */}
      {roadmapOpen && (
        <RoadmapModal onClose={handleCloseRoadmap} onNavigate={handleRoadmapNavigate} />
      )}
      {roadmapHintOpen && <RoadmapHint onGotIt={handleRoadmapHintGotIt} />}
    </>
  );
}
