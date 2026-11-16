"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Download, HardDrive, Loader2, Maximize, Minimize, Pause, Play, Trash2, Volume2, VolumeX, Wifi, WifiOff } from "lucide-react";
import ElasticSlider from "@/components/ElasticSlider";
import { WATCH_QUALIFY_FRACTION } from "@/lib/progress";

const CACHE_NAME = "lp-offline-videos-v1";
const VOLUME_KEY = "lp_volume";
const MUTED_KEY = "lp_muted";

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const total = Math.floor(totalSeconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function storedVolume(): number {
  if (typeof window === "undefined") return 100;
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    // Number(null) is 0 — a missing key must mean the default 100,
    // not a muted player.
    if (raw === null) return 100;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 100;
  } catch {
    return 100;
  }
}

function storedMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

interface VideoPlayerProps {
  lessonId: string;
  title: string;
  onWatchCoverage?: (fraction: number, coveredSeconds: number) => void;
  onLessonQualified?: (coveredSeconds: number) => void;
  // The page's Mark Complete / Watched % button, rendered in the
  // footer next to Save Offline (the page owns the completion logic).
  completionButton?: ReactNode;
}

export function VideoPlayer({ lessonId, title, onWatchCoverage, onLessonQualified, completionButton }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [src, setSrc] = useState<string>(`/api/video/${lessonId}`);
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom control bar (no native controls): one place holding the
  // seek bar and the volume control — the volume slider stays hidden
  // until you hover the speaker icon, then it slides out.
  const playerRef = useRef<HTMLDivElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Volume — React Bits ElasticSlider, wired to the <video> element
  // (persisted per browser, like everything else).
  const [volume, setVolume] = useState(storedVolume);
  const [muted, setMuted] = useState(storedMuted);

  // Push volume/mute onto the element whenever either changes or the
  // source swaps (the <video> remounts on src change).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume / 100;
    video.muted = muted;
  }, [volume, muted, src]);

  // Keep in sync when the native controls change the volume instead.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const sync = () => {
      setVolume(Math.round(video.volume * 100));
      setMuted(video.muted);
    };
    video.addEventListener("volumechange", sync);
    return () => video.removeEventListener("volumechange", sync);
  }, [src]);

  function handleVolumeChange(next: number) {
    const v = Math.min(100, Math.max(0, Math.round(next)));
    setVolume(v);
    try {
      localStorage.setItem(VOLUME_KEY, String(v));
    } catch {
      // Volume just won't survive a reload.
    }
    const video = videoRef.current;
    if (!video) return;
    video.volume = v / 100;
    // Dragging to 0 mutes; dragging back up unmutes.
    if (v > 0 && video.muted) {
      video.muted = false;
      setMuted(false);
      try {
        localStorage.setItem(MUTED_KEY, "0");
      } catch {
        // Ignore.
      }
    } else if (v === 0 && !video.muted) {
      video.muted = true;
      setMuted(true);
      try {
        localStorage.setItem(MUTED_KEY, "1");
      } catch {
        // Ignore.
      }
    }
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    try {
      localStorage.setItem(MUTED_KEY, next ? "1" : "0");
    } catch {
      // Ignore.
    }
    const video = videoRef.current;
    if (video) video.muted = next;
  }

  // 95% watch rule: track which seconds of the video were actually seen
  // (unique coverage — seeking past content doesn't count it, re-watching
  // the same seconds doesn't count twice). Coverage persists per lesson in
  // localStorage, so 95% can be reached across sessions. Completion and
  // today's-progress credit fire only once per session, when new watching
  // in this session pushes coverage to 95%.
  const watchedRef = useRef<Set<number>>(new Set());
  const durationRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastReportedCoverageRef = useRef(-1);
  const sessionNewBucketsRef = useRef(0);
  const qualifiedThisSessionRef = useRef(false);
  const lastPersistedAtRef = useRef(0);
  const onWatchCoverageRef = useRef(onWatchCoverage);
  onWatchCoverageRef.current = onWatchCoverage;
  const onLessonQualifiedRef = useRef(onLessonQualified);
  onLessonQualifiedRef.current = onLessonQualified;

  function coverageKey(id: string) {
    return `lp_coverage_${id}`;
  }

  function loadWatched(id: string): Set<number> {
    try {
      const raw = localStorage.getItem(coverageKey(id));
      if (!raw) return new Set();
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((n) => typeof n === "number" && n >= 0));
    } catch {
      return new Set();
    }
  }

  function persistWatched(id: string) {
    try {
      localStorage.setItem(coverageKey(id), JSON.stringify([...watchedRef.current]));
    } catch {
      // Storage full or blocked — coverage just won't survive a reload.
    }
    lastPersistedAtRef.current = Date.now();
  }

  function currentCoverage(): { fraction: number; seconds: number } {
    const duration = durationRef.current;
    const seconds = watchedRef.current.size;
    return {
      fraction: duration > 0 ? Math.min(1, seconds / duration) : 0,
      seconds,
    };
  }

  function reportCoverage(force = false) {
    const { fraction, seconds } = currentCoverage();
    if (!force && Math.abs(fraction - lastReportedCoverageRef.current) < 0.01) return;
    lastReportedCoverageRef.current = fraction;
    onWatchCoverageRef.current?.(fraction, seconds);
  }

  function maybeQualify() {
    if (qualifiedThisSessionRef.current) return;
    if (sessionNewBucketsRef.current <= 0) return;
    const { fraction, seconds } = currentCoverage();
    if (fraction < WATCH_QUALIFY_FRACTION) return;
    qualifiedThisSessionRef.current = true;
    persistWatched(lessonId);
    onLessonQualifiedRef.current?.(seconds);
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || video.paused) return;
    setCurrentTime(video.currentTime);
    const now = video.currentTime;
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;
    if (delta > 0 && delta <= 2) {
      const from = Math.floor(now - delta);
      const to = Math.floor(now);
      let added = 0;
      for (let s = from; s <= to; s += 1) {
        if (s >= 0 && !watchedRef.current.has(s)) {
          watchedRef.current.add(s);
          added += 1;
        }
      }
      if (added > 0) {
        sessionNewBucketsRef.current += added;
        // Persist throttled so a reload mid-video keeps the coverage.
        if (Date.now() - lastPersistedAtRef.current > 5000) persistWatched(lessonId);
        reportCoverage();
        maybeQualify();
      }
    }
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      durationRef.current = video.duration;
      setDuration(video.duration);
    }
    reportCoverage(true);
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  function handleSeek(next: number) {
    const video = videoRef.current;
    if (!video || !(duration > 0)) return;
    video.currentTime = Math.min(duration, Math.max(0, next));
    setCurrentTime(video.currentTime);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void playerRef.current?.requestFullscreen();
  }

  // Keep play/pause + fullscreen state in sync with the element.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [src]);

  function handleEnded() {
    persistWatched(lessonId);
    reportCoverage(true);
    // If the duration was never readable, ending the video is the only
    // signal we have — qualify on the seconds actually covered.
    if (
      !(durationRef.current > 0) &&
      sessionNewBucketsRef.current > 0 &&
      !qualifiedThisSessionRef.current
    ) {
      qualifiedThisSessionRef.current = true;
      onLessonQualifiedRef.current?.(watchedRef.current.size);
    }
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
    watchedRef.current = loadWatched(lessonId);
    durationRef.current = 0;
    setCurrentTime(0);
    setDuration(0);
    setPaused(true);
    lastTimeRef.current = 0;
    lastReportedCoverageRef.current = -1;
    sessionNewBucketsRef.current = 0;
    qualifiedThisSessionRef.current = false;
    lastPersistedAtRef.current = 0;

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
      persistWatched(lessonId);
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
      <div
        ref={playerRef}
        className="aspect-video w-full bg-black flex items-center justify-center relative"
      >
        <video
          ref={videoRef}
          key={src}
          src={src}
          playsInline
          preload="metadata"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPause={() => persistWatched(lessonId)}
          onEnded={handleEnded}
          className="h-full w-full bg-black"
        />

        {/* One control bar for both sliders: seek on top, and the
            volume slider slides out when you hover the speaker. */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2.5 pt-10 text-white">
          <ElasticSlider
            value={currentTime}
            maxValue={duration > 0 ? duration : 1}
            onChange={handleSeek}
            valuePosition="none"
            thumb
            leftIcon={null}
            rightIcon={null}
            disabled={duration <= 0}
            ariaLabel="Seek"
          />
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              title={paused ? "Play" : "Pause"}
              aria-label={paused ? "Play" : "Pause"}
              className="shrink-0 rounded-lg p-1.5 text-white transition hover:bg-white/10"
            >
              {paused ? (
                <Play className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </button>
            <div className="group/vol flex items-center">
              <button
                type="button"
                onClick={toggleMute}
                title={muted ? "Unmute" : "Mute"}
                aria-label={muted ? "Unmute" : "Mute"}
                className="shrink-0 rounded-lg p-1.5 text-white transition hover:bg-white/10"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <div className="w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover/vol:w-48 group-hover/vol:opacity-100">
                <ElasticSlider
                  value={volume}
                  onChange={handleVolumeChange}
                  valuePosition="none"
                  thumb
                  leftIcon={null}
                  rightIcon={null}
                  ariaLabel="Volume"
                />
              </div>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-neutral-200">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="shrink-0 rounded-lg p-1.5 text-white transition hover:bg-white/10"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
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
          {completionButton}
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

