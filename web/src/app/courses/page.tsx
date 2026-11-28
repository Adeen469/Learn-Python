"use client";

import { useEffect, useState } from "react";
import { ChevronRight, MonitorPlay } from "lucide-react";
import { fetchSessionUser } from "@/lib/auth-client";
import { AppNavbar } from "@/components/AppNavbar";
import ChromaGrid from "@/components/ChromaGrid";
import SignInGate from "@/components/SignInGate";
import { useLanguage, type Strings } from "@/lib/i18n";
import { COURSE_CREATORS, CREATOR_ACCENTS, totalCourseVideos, type CourseCreator } from "@/lib/courses/data";

/** Total video seconds for one creator (durations render via t.common.durationTotal). */
function creatorTotalSeconds(creator: CourseCreator): number {
  return (
    creator.playlists.reduce(
      (n, p) => n + p.videos.reduce((m, v) => m + (v.durationSeconds ?? 0), 0),
      0
    ) + creator.oneShots.reduce((n, v) => n + (v.durationSeconds ?? 0), 0)
  );
}

/** Creator tagline, translated via the coursesPage keys (data.ts keeps the English copy). */
function creatorTagline(creator: CourseCreator, t: Strings): string {
  switch (creator.slug) {
    case "codewithharry":
      return t.coursesPage.taglineCodeWithHarry;
    case "code-with-mosh":
      return t.coursesPage.taglineMosh;
    case "apna-college":
      return t.coursesPage.taglineApnaCollege;
    default:
      return creator.tagline;
  }
}

function creatorVideoCount(creator: CourseCreator): number {
  return (
    creator.playlists.reduce((n, p) => n + p.videos.length, 0) +
    creator.oneShots.length
  );
}

/**
 * Video Courses — three teachers, one card each. Tap a card to see
 * that teacher's courses (one card per playlist, plus one-shots),
 * then tap a course to watch it in the player. Videos play from
 * MEGA/Drive, never YouTube. Gated: a guest sees the sign-in gate
 * screen (warning + Sign in button), not a silent bounce home.
 */
export default function CoursesPage() {
  const { t } = useLanguage();
  const [auth, setAuth] = useState<{ checked: boolean; signedIn: boolean }>({
    checked: false,
    signedIn: false,
  });

  useEffect(() => {
    let cancelled = false;
    fetchSessionUser().then((user) => {
      if (cancelled) return;
      setAuth({ checked: true, signedIn: !!user });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!auth.checked) return null;
  if (!auth.signedIn) return <SignInGate />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0">
      <AppNavbar />
      {/*
        w-full is load-bearing: this div is a flex item of a flex-col
        parent, and mx-auto (auto cross-axis margins) stops it stretching,
        so without an explicit width it shrink-wraps to the grid's
        intrinsic width (470px — two cards per row) instead of the full
        width. w-full gives it a definite width; there is no max-w cap
        (full width, Maalik's order 2026-11-19).
      */}
      <div className="w-full px-4 py-8 sm:py-10">
        <header>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            <MonitorPlay className="h-4 w-4 text-neutral-400" />
            {t.coursesPage.videoCourses}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {/* heroTitle ends in "." in every language; the dot stays in its own orange span. */}
            {t.coursesPage.heroTitle.slice(0, -1)}
            <span className="text-[#d9a05b]">.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            {t.courses.intro}
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            {t.courses.countVideos(totalCourseVideos())} •{" "}
            {t.coursesPage.videoSourceNote}
          </p>
        </header>

        {COURSE_CREATORS.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-sm text-neutral-400">
            {t.coursesPage.emptyState}
          </p>
        ) : (
          <div className="mx-auto mt-8 w-full max-w-6xl">
            <ChromaGrid
              items={COURSE_CREATORS.map((creator) => ({
                image: creator.avatarUrl,
                title: creator.name,
                subtitle: `${creator.subscribers} • ${creator.language}`,
                accent: CREATOR_ACCENTS[creator.slug] ?? "#ffffff",
                url: `/courses/${creator.slug}`,
                details: (
                  <>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                      {creatorTagline(creator, t)}
                    </p>
                    {/* The arrow at the footer's right end, the same
                        "go" cue the creator page's cards carry. */}
                    <div className="mt-3 flex items-center gap-2 border-t border-neutral-800/70 pt-3 text-xs text-neutral-500">
                      <span>
                        {creator.playlists.length === 0 ? (
                          <>{t.course.oneShotsHeading} • </>
                        ) : (
                          <>{t.coursesPage.countCourses(creator.playlists.length)} • </>
                        )}
                        {t.courses.countVideos(creatorVideoCount(creator))} •{" "}
                        {t.common.durationTotal(creatorTotalSeconds(creator))}
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
                    </div>
                  </>
                ),
              }))}
              columns={3}
              reveal="card"
              minCardWidth={190}
              cardRadius={23}
              radius={260}
              damping={1.5}
              dim={0.29}
              glow={1}
              aspectRatio="1 / 1"
              theme="dark"
              enableTilt
              tiltStrength={8}
            />
          </div>
        )}
      </div>
    </div>
  );
}
