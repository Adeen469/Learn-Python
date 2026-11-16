"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, ExternalLink, MonitorPlay, Play, Youtube } from "lucide-react";
import { fetchSessionUser } from "@/lib/auth-client";
import { AppNavbar } from "@/components/AppNavbar";
import { COURSE_CREATORS, totalCourseVideos, type CourseVideo } from "@/lib/courses/data";

function formatDuration(totalSeconds?: number): string {
  if (totalSeconds === undefined) return "";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function VideoRow({ video, index }: { video: CourseVideo; index: number }) {
  return (
    <li>
      <a
        href={`https://www.youtube.com/watch?v=${video.videoId}`}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3 px-4 py-3 transition hover:bg-neutral-900"
      >
        <span className="w-6 shrink-0 text-center font-mono text-xs text-neutral-500 tabular-nums">
          {index + 1}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`}
          alt=""
          width={120}
          height={68}
          loading="lazy"
          className="h-10 w-[72px] shrink-0 rounded-md object-cover"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white transition group-hover:text-neutral-100">
            {video.title}
          </span>
          {video.durationSeconds !== undefined && (
            <span className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
              <Clock className="h-3 w-3" />
              {formatDuration(video.durationSeconds)}
            </span>
          )}
        </span>
        <Play className="h-4 w-4 shrink-0 text-neutral-600 transition group-hover:text-white" />
      </a>
    </li>
  );
}

/**
 * Video Courses — complete Python courses from CodeWithHarry,
 * Apna College and Code With Mosh, each as topic-wise videos, plus
 * their one-shot videos. Separate from Learn (the text main page).
 * Same auth gate as the editor.
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
          teacher, start at the top, and work down. The written tutorials
          live on the Learn page.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          {totalCourseVideos()} videos • Videos play on YouTube
        </p>
      </header>

      {COURSE_CREATORS.length === 0 && (
        <p className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-sm text-neutral-400">
          Course videos are being added — check back shortly.
        </p>
      )}

      {COURSE_CREATORS.map((creator) => (
        <section key={creator.name} className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <Youtube className="h-5 w-5 text-red-500/90" />
                {creator.name}
              </h2>
              <p className="mt-0.5 text-sm text-neutral-400">{creator.tagline}</p>
            </div>
            <a
              href={creator.channelUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition hover:text-white"
            >
              Channel <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {creator.oneShots.length > 0 && (
            <div className="mt-4">
              <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                One-shot videos
              </h3>
              <ul className="mt-2 divide-y divide-neutral-800/70 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
                {creator.oneShots.map((video, i) => (
                  <VideoRow key={video.videoId} video={video} index={i} />
                ))}
              </ul>
            </div>
          )}

          {creator.playlists.map((playlist) => (
            <div key={playlist.url} className="mt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
                <h3 className="text-base font-bold text-white">{playlist.title}</h3>
                <span className="text-xs text-neutral-500">
                  {playlist.videos.length} videos
                </span>
              </div>
              <ul className="mt-2 divide-y divide-neutral-800/70 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
                {playlist.videos.map((video, i) => (
                  <VideoRow key={video.videoId} video={video} index={i} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}

      <p className="mt-10 text-center text-xs text-neutral-600">
        Prefer reading?{" "}
        <Link href="/learn/python-home" className="text-neutral-400 transition hover:text-white">
          Open the Learn page
        </Link>
        .
      </p>
      </div>
    </div>
  );
}
