"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, MonitorPlay } from "lucide-react";
import { fetchSessionUser } from "@/lib/auth-client";
import { AppNavbar } from "@/components/AppNavbar";
import { COURSE_CREATORS, totalCourseVideos, type CourseCreator } from "@/lib/courses/data";

/** Total video hours for one creator, e.g. "52h 26m". */
function creatorHours(creator: CourseCreator): string {
  const seconds =
    creator.playlists.reduce(
      (n, p) => n + p.videos.reduce((m, v) => m + (v.durationSeconds ?? 0), 0),
      0
    ) + creator.oneShots.reduce((n, v) => n + (v.durationSeconds ?? 0), 0);
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function creatorVideoCount(creator: CourseCreator): number {
  return (
    creator.playlists.reduce((n, p) => n + p.videos.length, 0) +
    creator.oneShots.length
  );
}

function CreatorCard({ creator }: { creator: CourseCreator }) {
  return (
    <Link
      href={`/courses/${creator.slug}`}
      className="group block rounded-2xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600 hover:bg-neutral-900/60 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={creator.avatarUrl}
          alt={`${creator.name} channel picture`}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-neutral-800"
        />
        <ChevronRight className="h-5 w-5 shrink-0 self-center text-neutral-600 transition group-hover:text-white" />
      </div>
      <div className="mt-4 min-w-0">
        <h2 className="text-lg font-bold text-white transition group-hover:text-neutral-100">
          {creator.name}
        </h2>
        <p className="mt-0.5 text-sm text-neutral-500">{creator.handle}</p>
        <p className="mt-1 text-xs text-neutral-400">
          {creator.subscribers} • {creator.language}
        </p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-neutral-400">
        {creator.tagline}
      </p>
      <p className="mt-4 border-t border-neutral-800/70 pt-3 text-xs text-neutral-500">
        {creator.playlists.length === 0 ? (
          <>One-shot videos • </>
        ) : (
          <>
            {creator.playlists.length}{" "}
            {creator.playlists.length === 1 ? "course" : "courses"} •{" "}
          </>
        )}
        {creatorVideoCount(creator)} videos • {creatorHours(creator)}
      </p>
    </Link>
  );
}

/**
 * Video Courses — three teachers, one card each. Tap a card to see
 * that teacher's courses (one card per playlist, plus one-shots),
 * then tap a course to watch it in the player. Videos play from
 * MEGA/Drive, never YouTube. Same auth gate as the editor.
 */
export default function CoursesPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSessionUser().then((user) => {
      if (cancelled) return;
      if (!user) {
        router.replace("/");
        return;
      }
      setChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0">
      <AppNavbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <header>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            <MonitorPlay className="h-4 w-4 text-neutral-400" />
            Video courses
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Learn Python by watching<span className="text-[#d9a05b]">.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            Full Python courses from three teachers — topic by topic, plus
            one-shot videos when you want it all in one sitting. Pick a
            teacher, then a course, and work down. The written tutorials
            live on the Learn page.
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            {totalCourseVideos()} videos • MEGA &amp; Drive, YouTube for now
          </p>
        </header>

        {COURSE_CREATORS.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-sm text-neutral-400">
            Course videos are being added — check back shortly.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COURSE_CREATORS.map((creator) => (
              <CreatorCard key={creator.slug} creator={creator} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
