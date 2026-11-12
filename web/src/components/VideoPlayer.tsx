"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download, HardDrive, Loader2, Trash2, Wifi, WifiOff } from "lucide-react";

const CACHE_NAME = "lp-offline-videos-v1";

interface VideoPlayerProps {
  lessonId: string;
  title: string;
  onCompleteLesson?: () => void;
  onWatchProgress?: (seconds: number) => void;
}

export function VideoPlayer({ lessonId, title, onCompleteLesson, onWatchProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [src, setSrc] = useState<string>(`/api/video/${lessonId}`);
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Real watch-time tracking: count only small forward steps while playing
  // (seeks/rewinds are ignored), flush every ~5s and on pause/end/unmount.
  const lastTimeRef = useRef(0);
  const pendingSecondsRef = useRef(0);
  const onWatchProgressRef = useRef(onWatchProgress);
  onWatchProgressRef.current = onWatchProgress;

  function flushWatchProgress() {
    const pending = pendingSecondsRef.current;
    if (pending > 0) {
      pendingSecondsRef.current = 0;
      onWatchProgressRef.current?.(pending);
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || video.paused) return;
    const now = video.currentTime;
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;
    if (delta > 0 && delta <= 2) {
      pendingSecondsRef.current += delta;
      if (pendingSecondsRef.current >= 5) flushWatchProgress();
    }
  }

  function handleEnded() {
    flushWatchProgress();
    onCompleteLesson?.();
  }

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onUp = () => setIsOnline(true);
    const onDown = () => setIsOnline(false);
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    return () => {
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);

  useEffect(() => {
    let activeObjectUrl: string | null = null;
    let cancelled = false;
    lastTimeRef.current = 0;
    pendingSecondsRef.current = 0;

    async function loadSource() {
      setErrorMsg(null);
      const streamUrl = `/api/video/${lessonId}`;

      if (typeof window !== "undefined" && "caches" in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(streamUrl);
          if (cached && !cancelled) {
            const blob = await cached.blob();
            activeObjectUrl = URL.createObjectURL(blob);
            setSrc(activeObjectUrl);
            setIsSavedOffline(true);
            return;
          }
        } catch {
          // Fallback to online stream if Cache Storage is unavailable
        }
      }

      if (!cancelled) {
        setIsSavedOffline(false);
        setSrc(streamUrl);
      }
    }

    loadSource();

    return () => {
      cancelled = true;
      flushWatchProgress();
      if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
    };
  }, [lessonId]);

  async function handleSaveOffline() {
    if (!("caches" in window)) {
      setErrorMsg("Offline cache is not supported in this browser.");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setErrorMsg(null);

    try {
      const streamUrl = `/api/video/${lessonId}`;
      const res = await fetch(streamUrl);
      if (!res.ok || !res.body) {
        throw new Error(`Download failed (${res.status})`);
      }

      const contentLength = Number(res.headers.get("Content-Length") ?? "0");
      const contentType = res.headers.get("Content-Type") ?? "video/mp4";
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          if (contentLength > 0) {
            setDownloadProgress(Math.min(100, Math.round((received / contentLength) * 100)));
          }
        }
      }

      const blob = new Blob(chunks as BlobPart[], { type: contentType });
      const cache = await caches.open(CACHE_NAME);
      await cache.put(
        streamUrl,
        new Response(blob, {
          status: 200,
          headers: { "Content-Type": contentType, "Content-Length": String(blob.size) },
        })
      );

      const objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
      setIsSavedOffline(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not save video offline.");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleRemoveOffline() {
    if (!("caches" in window)) return;
    const cache = await caches.open(CACHE_NAME);
    const streamUrl = `/api/video/${lessonId}`;
    await cache.delete(streamUrl);
    setIsSavedOffline(false);
    setSrc(streamUrl);
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
      <div className="aspect-video w-full bg-black flex items-center justify-center relative">
        <video
          ref={videoRef}
          key={src}
          src={src}
          controls
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onPause={flushWatchProgress}
          onEnded={handleEnded}
          className="h-full w-full bg-black"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 px-4 py-3 bg-neutral-950">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-white">{title}</h2>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
            {isSavedOffline ? (
              <span className="inline-flex items-center gap-1 text-neutral-200">
                <HardDrive className="h-3.5 w-3.5" /> Playing from in-app offline storage
              </span>
            ) : isOnline ? (
              <span className="inline-flex items-center gap-1">
                <Wifi className="h-3.5 w-3.5" /> Streaming online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-neutral-500">
                <WifiOff className="h-3.5 w-3.5" /> Offline (not saved)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSavedOffline ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white">
                <Check className="h-3.5 w-3.5" /> Saved Offline
              </span>
              <button
                type="button"
                onClick={handleRemoveOffline}
                title="Remove offline copy"
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-black px-2.5 py-1.5 text-xs text-neutral-400 hover:border-neutral-600 hover:text-white transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSaveOffline}
              disabled={isDownloading || !isOnline}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 disabled:opacity-50 transition"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving {downloadProgress > 0 ? `${downloadProgress}%` : "..."}
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Save Offline
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="border-t border-neutral-800 bg-neutral-900 px-4 py-2 text-xs text-neutral-300">
          {errorMsg}
        </div>
      )}
    </div>
  );
}

