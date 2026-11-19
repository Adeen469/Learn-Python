"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Clock, Play } from "lucide-react";
import { fetchSessionUser } from "@/lib/auth-client";
import { AppNavbar } from "@/components/AppNavbar";
import Tilt from "@/components/Tilt";
import { useLanguage, type Strings } from "@/lib/i18n";
import {
  COURSE_CREATORS,
  CREATOR_ACCENTS,
  playlistListId,
  type CourseCreator,
  type CoursePlaylist,
  type CourseVideo,
} from "@/lib/courses/data";

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

function playlistSeconds(p: CoursePlaylist): number {
  return p.videos.reduce((n, v) => n + (v.durationSeconds ?? 0), 0);
}

/** The id the player marks complete for a video (MEGA lesson when it has one). */
function completionId(video: CourseVideo): string {
  return video.megaLessonId ?? video.videoId;
}

function CollectionCard({
  creator,
  href,
  thumbVideoId,
  title,
  count,
  seconds,
  label,
  doneCount,
}: {
  creator: CourseCreator;
  href: string;
  thumbVideoId?: string;
  title: string;
  count: number;
  seconds: number;
  label: string;
  /** Videos already watched in this collection (0 hides the progress bar). */
  doneCount: number;
}) {
  const { t } = useLanguage();
  const accent = CREATOR_ACCENTS[creator.slug] ?? "#ffffff";
  const pct = count > 0 ? Math.round((doneCount / count) * 100) : 0;
  // A dead thumbnail (deleted video, blocked domain) must never show
  // a broken-image icon — fall back to the Play placeholder instead.
  const [thumbFailed, setThumbFailed] = useState(false);
  // Like the hub's Chroma cards: black-and-white at rest, colour on
  // hover, and the whole card tilts toward the cursor (same Tilt
  // component, same 8° strength). The accent progress bar stays
  // coloured, so "how much watched" still reads at a glance.
  return (
    <Tilt className="h-full">
    <Link
      href={href}
      className="group block h-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 transition duration-300 hover:-translate-y-1 hover:border-neutral-600 hover:bg-neutral-900/60"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        {thumbVideoId && !thumbFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://i.ytimg.com/vi/${thumbVideoId}/hqdefault.jpg`}
            alt=""
            width={480}
            height={270}
            loading="lazy"
            onError={() => setThumbFailed(true)}
            className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="h-10 w-10 text-neutral-700" />
          </div>
        )}
        {/* Hover veil + play button: the card reads as watchable at a glance. */}
        <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition duration-300 group-hover:scale-100 scale-90"
            style={{ backgroundColor: accent }}
          >
            <Play className="h-5 w-5 fill-black text-black" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
          {t.courses.countVideos(count)}
        </span>
        {/* Watch progress, drawn over the thumbnail's bottom edge. */}
        {doneCount > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: accent }}
            />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          {label}
        </p>
        <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-white">
          {title}
        </h2>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
          <Clock className="h-3.5 w-3.5" />
          {t.common.durationTotal(seconds)} {t.course.totalLabel}
          {doneCount > 0 && (
            <span className="font-medium" style={{ color: accent }}>
              · {t.common.watchedPct(pct)}
            </span>
          )}
          <ChevronRight className="ml-auto h-4 w-4 text-neutral-600 transition group-hover:text-white motion-safe:group-hover:animate-[arrow-pulse_0.9s_ease-in-out_infinite]" />
        </p>
      </div>
    </Link>
    </Tilt>
  );
}

/** Creator channel picture — a dead avatar URL shows the initial letter, never a broken-image icon. */
function CreatorAvatar({ creator, size }: { creator: CourseCreator; size: "lg" | "md" }) {
  const { t } = useLanguage();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const accent = CREATOR_ACCENTS[creator.slug] ?? "#ffffff";
  const cls =
    size === "lg"
      ? "h-24 w-24 text-3xl"
      : "h-16 w-16 text-xl";
  // A solid accent ring (2px, the creator's own colour) frames the
  // picture — the same accent the hub's Chroma card glows with.
  const ring = (
    <div
      className="shrink-0 rounded-full p-[2px]"
      style={{ backgroundColor: accent }}
    >
      {avatarFailed ? (
        <div
          className={`flex ${cls} items-center justify-center rounded-full bg-neutral-900 font-bold text-white`}
          aria-label={t.coursesPage.channelPictureAlt(creator.name)}
        >
          {creator.name.charAt(0)}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={creator.avatarUrl}
          alt={t.coursesPage.channelPictureAlt(creator.name)}
          width={size === "lg" ? 96 : 64}
          height={size === "lg" ? 96 : 64}
          onError={() => setAvatarFailed(true)}
          className={`${cls} rounded-full object-cover`}
        />
      )}
    </div>
  );
  return ring;
}

/**
 * One teacher's courses: one card per playlist, plus one card for
 * their one-shot videos. Tap a card to watch it in the player.
 * Same auth gate as the hub.
 */
export default function CreatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [checked, setChecked] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  // Video ids the player marked complete (localStorage), so each
  // card can show its own watch progress. Read once on mount —
  // the player writes it, this page only reads it.
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    params.then((p) => {
      if (!cancelled) setSlug(p.slug);
    });
    fetchSessionUser().then((user) => {
      if (cancelled) return;
      if (!user) {
        router.replace("/");
        return;
      }
      setChecked(true);
    });
    try {
      const saved = localStorage.getItem("lp_completed_lessons");
      if (saved) setCompletedIds(JSON.parse(saved));
    } catch {
      // Ignore corrupt saved data — progress just shows as 0.
    }
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  if (!checked || slug === null) return null;

  const creator = COURSE_CREATORS.find((c) => c.slug === slug);
  if (!creator) {
    router.replace("/courses");
    return null;
  }

  const oneShotSeconds = creator.oneShots.reduce(
    (n, v) => n + (v.durationSeconds ?? 0),
    0
  );
  const totalVideos =
    creator.playlists.reduce((n, p) => n + p.videos.length, 0) +
    creator.oneShots.length;
  const totalSeconds =
    creator.playlists.reduce((n, p) => n + playlistSeconds(p), 0) +
    oneShotSeconds;
  const collectionCount =
    creator.playlists.length + (creator.oneShots.length > 0 ? 1 : 0);
  const doneIn = (videos: CourseVideo[]) =>
    videos.filter((v) => completedIds.includes(completionId(v))).length;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0">
      <AppNavbar />
      {/*
        w-full is load-bearing: this div is a flex item of a flex-col
        parent, and mx-auto (auto cross-axis margins) stops it stretching,
        so without an explicit width it shrink-wraps to the grid's
        intrinsic width. w-full gives it a definite width; there is no
        max-w cap (full width, Maalik's order 2026-11-19).
      */}
      <div className="w-full px-4 py-8 sm:py-10">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> {t.coursesPage.allTeachers}
        </Link>

        <header className="mt-6 flex items-start gap-5">
          <CreatorAvatar creator={creator} size="lg" />
          <div className="min-w-0 pt-1">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {creator.name}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">{creator.handle}</p>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-300">
              <span className="font-semibold text-white">
                {t.coursesPage.countCourses(collectionCount)}
              </span>
              <span className="text-neutral-600">•</span>
              <span>{t.courses.countVideos(totalVideos)}</span>
              <span className="text-neutral-600">•</span>
              <span>{t.common.durationTotal(totalSeconds)} {t.course.totalLabel}</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400">
                {creator.subscribers} • {creator.language}
              </span>
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-400">
              {creatorTagline(creator, t)}
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {creator.playlists.map((playlist) => (
            <CollectionCard
              key={playlistListId(playlist.url)}
              creator={creator}
              href={`/courses/${creator.slug}/${playlistListId(playlist.url)}`}
              thumbVideoId={playlist.videos[0]?.videoId}
              title={playlist.title}
              count={playlist.videos.length}
              seconds={playlistSeconds(playlist)}
              label={t.course.fullCourseLabel}
              doneCount={doneIn(playlist.videos)}
            />
          ))}
          {creator.oneShots.length > 0 && (
            <CollectionCard
              creator={creator}
              href={`/courses/${creator.slug}/one-shots`}
              thumbVideoId={creator.oneShots[0]?.videoId}
              title={t.course.oneShotsHeading}
              count={creator.oneShots.length}
              seconds={oneShotSeconds}
              label={t.course.oneShotsHeading}
              doneCount={doneIn(creator.oneShots)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
