"use client";

import { useEffect, useRef } from "react";
import { getLessons } from "@/lib/catalog";
import { COURSE_CREATORS } from "@/lib/courses/data";
import { fetchSessionUser } from "@/lib/auth-client";
import { PROGRESS_UPDATED_EVENT, todayKey } from "@/lib/progress";
import {
  PROGRESS_SYNCED_EVENT,
  createDebouncedSaver,
  loadServerProgress,
  mergeSnapshots,
  readLocalSnapshot,
  saveServerProgress,
  saveServerProgressKeepalive,
  writeLocalSnapshot,
  type LessonDuration,
} from "@/lib/progress-sync";

// Per-user progress sync, mounted once in the root layout (renders
// nothing). Guests never touch the server — localStorage stays their
// only progress store. Signed-in users: on mount, the server copy is
// loaded once and merged into local state (union — nothing is ever
// lost), then the union is saved back; later local changes save
// debounced (at most once per 10s) plus a keepalive flush when the
// tab hides or closes. Every server failure is silent — the app
// keeps working locally and the next save retries.
//
// Sign-in/out today always navigates (the auth callback redirects to
// /), so the mount-time session check is enough; a save that finds
// the session gone simply 401s and stays local.
function lessonDurations(): LessonDuration[] {
  const byId = new Map<string, number>();
  for (const l of getLessons()) byId.set(l.id, l.durationSeconds);
  for (const creator of COURSE_CREATORS) {
    for (const video of [...creator.oneShots, ...creator.playlists.flatMap((p) => p.videos)]) {
      const id = video.megaLessonId ?? video.videoId;
      if (!byId.has(id) && video.durationSeconds !== undefined) {
        byId.set(id, video.durationSeconds);
      }
    }
  }
  return [...byId.entries()].map(([id, durationSeconds]) => ({ id, durationSeconds }));
}

export function ProgressSync() {
  const lessonsRef = useRef<LessonDuration[] | null>(null);
  const syncedForRef = useRef<string | null>(null);
  const signedInRef = useRef(false);
  const saverRef = useRef(
    createDebouncedSaver(() => {
      if (!signedInRef.current) return;
      const lessons = lessonsRef.current ?? [];
      const snapshot = readLocalSnapshot((k) => localStorage.getItem(k), lessons, todayKey());
      void saveServerProgress(snapshot);
    })
  );

  useEffect(() => {
    lessonsRef.current = lessonDurations();
    let cancelled = false;

    // Load + merge once per sign-in.
    fetchSessionUser().then(async (user) => {
      if (cancelled || !user) return;
      signedInRef.current = true;
      if (syncedForRef.current === user.email) return;
      const server = await loadServerProgress();
      if (cancelled || !server) return;
      const lessons = lessonsRef.current ?? [];
      const local = readLocalSnapshot((k) => localStorage.getItem(k), lessons, todayKey());
      const merged = mergeSnapshots(local, server, lessons);
      writeLocalSnapshot(
        (k, v) => localStorage.setItem(k, v),
        (k) => localStorage.removeItem(k),
        merged,
        lessons
      );
      syncedForRef.current = user.email;
      window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
      window.dispatchEvent(new Event(PROGRESS_SYNCED_EVENT));
      // Push the union back so the server also has this device's
      // progress. If it lands, the debounced retry the event above
      // scheduled is redundant — cancel it; if it fails, the retry
      // stays scheduled.
      void saveServerProgress(merged).then((ok) => {
        if (ok) saverRef.current.cancel();
      });
    });

    const onProgress = () => saverRef.current.schedule();
    const flush = () => {
      if (!signedInRef.current) return;
      const lessons = lessonsRef.current ?? [];
      const snapshot = readLocalSnapshot((k) => localStorage.getItem(k), lessons, todayKey());
      saveServerProgressKeepalive(snapshot);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener(PROGRESS_UPDATED_EVENT, onProgress);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      cancelled = true;
      window.removeEventListener(PROGRESS_UPDATED_EVENT, onProgress);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
