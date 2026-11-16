"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Clock, Play } from "lucide-react";
import { fetchSessionUser } from "@/lib/auth-client";
import { AppNavbar } from "@/components/AppNavbar";
import {
  COURSE_CREATORS,
  playlistListId,
  type CourseCreator,
  type CoursePlaylist,
} from "@/lib/courses/data";

function formatHours(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function playlistSeconds(p: CoursePlaylist): number {
  return p.videos.reduce((n, v) => n + (v.durationSeconds ?? 0), 0);
}

function CollectionCard({
  creator,
  href,
  thumbVideoId,
  title,
  count,
  seconds,
  label,
}: {
  creator: CourseCreator;
  href: string;
  thumbVideoId?: string;
  title: string;
  count: number;
  seconds: number;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 transition hover:border-neutral-600 hover:bg-neutral-900/60"
    >
      <div className="relative aspect-video w-full bg-neutral-900">
        {thumbVideoId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://i.ytimg.com/vi/${thumbVideoId}/hqdefault.jpg`}
            alt=""
            width={480}
            height={270}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="h-10 w-10 text-neutral-700" />
          </div>
        )}
        <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
          {count} {count === 1 ? "video" : "videos"}
        </span>
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
          {formatHours(seconds)} total
          <ChevronRight className="ml-auto h-4 w-4 text-neutral-600 transition group-hover:text-white" />
        </p>
      </div>
    </Link>
  );
}

/**
 * One teacher's courses: one card per playlist, plus one card for
 * their one-shot videos. Tap a card to watch it in the player.
 * Same auth gate as the hub.
 */
export default function CreatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0">
      <AppNavbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> All teachers
        </Link>

        <header className="mt-5 flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={creator.avatarUrl}
            alt={`${creator.name} channel picture`}
            width={80}
            height={80}
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-neutral-800"
          />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {creator.name}
            </h1>
            <p className="mt-0.5 text-sm text-neutral-500">{creator.handle}</p>
            <p className="mt-1 text-xs text-neutral-400">
              {creator.subscribers} • {creator.language}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              {creator.tagline}
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {creator.playlists.map((playlist) => (
            <CollectionCard
              key={playlistListId(playlist.url)}
              creator={creator}
              href={`/courses/${creator.slug}/${playlistListId(playlist.url)}`}
              thumbVideoId={playlist.videos[0]?.videoId}
              title={playlist.title}
              count={playlist.videos.length}
              seconds={playlistSeconds(playlist)}
              label="Full course"
            />
          ))}
          {creator.oneShots.length > 0 && (
            <CollectionCard
              creator={creator}
              href={`/courses/${creator.slug}/one-shots`}
              thumbVideoId={creator.oneShots[0]?.videoId}
              title="One-shot videos on Python"
              count={creator.oneShots.length}
              seconds={oneShotSeconds}
              label="One-shot videos"
            />
          )}
        </div>
      </div>
    </div>
  );
}
