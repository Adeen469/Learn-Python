"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type TouchEvent } from "react";
import { Captions, Check, Download, HardDrive, Loader2, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw, Settings, Trash2, Volume2, VolumeX, Wifi, WifiOff } from "lucide-react";
import ElasticSlider from "@/components/ElasticSlider";
import { WATCH_QUALIFY_FRACTION } from "@/lib/progress";
import { useLanguage } from "@/lib/i18n";

const CACHE_NAME = "lp-offline-videos-v1";
const VOLUME_KEY = "lp_volume";
const MUTED_KEY = "lp_muted";
const PLAYBACK_RATE_KEY = "lp_playback_rate";
const QUALITY_KEY = "lp_quality";
const CAPTIONS_KEY = "lp_captions";
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
// The controls hide themselves this long after the last mouse move
// (only while the video is playing and no menu is open).
const CONTROLS_HIDE_MS = 2500;

function storedPlaybackRate(): number {
  if (typeof window === "undefined") return 1;
  try {
    const n = Number(localStorage.getItem(PLAYBACK_RATE_KEY));
    return PLAYBACK_RATES.includes(n) ? n : 1;
  } catch {
    return 1;
  }
}

function storedQuality(): string {
  if (typeof window === "undefined") return "auto";
  try {
    return localStorage.getItem(QUALITY_KEY) ?? "auto";
  } catch {
    return "auto";
  }
}

function storedCaptions(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CAPTIONS_KEY) === "1";
  } catch {
    return false;
  }
}

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
  // The YouTube id of the same video — English captions (when the
  // .vtt file exists under /public/captions) are named after it.
  videoId: string;
  title: string;
  // Autoplay the next lesson when this one ends. The toggle lives in
  // the footer; the page owns the state and advances the playlist.
  autoplay?: boolean;
  onAutoplayChange?: (next: boolean) => void;
  onWatchCoverage?: (fraction: number, coveredSeconds: number) => void;
  onLessonQualified?: (coveredSeconds: number) => void;
  // Fired when the video ends (the page advances the playlist when
  // autoplay is on) and whenever play/pause flips (the page shows
  // "Playing" for the active row in the lesson list).
  onEnded?: () => void;
  onPlayStateChange?: (playing: boolean) => void;
  // The page's Mark Complete / Watched % button, rendered in the
  // footer next to Save Offline (the page owns the completion logic).
  completionButton?: ReactNode;
}

export function VideoPlayer({ lessonId, videoId, title, autoplay = true, onAutoplayChange, onWatchCoverage, onLessonQualified, onEnded, onPlayStateChange, completionButton }: VideoPlayerProps) {
  const { t, videoTitle } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [src, setSrc] = useState<string>(`/api/video/${lessonId}`);
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Loading state: true from the moment a lesson is picked until the
  // video can actually play, and again whenever playback stalls on
  // buffering — the black screen must never look dead.
  const [isLoading, setIsLoading] = useState(true);

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

  // The slider opens on hover (desktop) or on a tap of the speaker
  // (touch has no hover, so hover-only could never show on a phone).
  // First tap opens it, a tap while open mutes; an outside tap closes.
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [volumeHovered, setVolumeHovered] = useState(false);
  const volumeGroupRef = useRef<HTMLDivElement | null>(null);
  const volumeExpanded = volumeOpen || volumeHovered;

  // Playback speed + quality (both in the gear menu, persisted per
  // browser). Quality: MEGA serves one file per lesson, so the menu
  // lists the real resolution of that file next to Auto — there is no
  // lower-quality stream to switch to.
  const [playbackRate, setPlaybackRate] = useState(storedPlaybackRate);
  const [quality, setQuality] = useState(storedQuality);
  const [detectedQuality, setDetectedQuality] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // English captions: a .vtt file under /public/captions named after
  // the YouTube id (<videoId>.en.vtt). The CC button only shows when
  // the file is actually there — no fake button for a missing file.
  const [captionsAvailable, setCaptionsAvailable] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(storedCaptions);
  const trackRef = useRef<HTMLTrackElement | null>(null);

  // Auto-hide controls: the bar fades out 2.5s after the last mouse
  // move (playing only, menu closed) and comes back on any movement.
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<number | null>(null);

  // Push the playback rate onto the element whenever it changes or
  // the source swaps (the <video> remounts on src change).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate, src]);

  // Check whether English captions exist for this video.
  useEffect(() => {
    let cancelled = false;
    setCaptionsAvailable(false);
    fetch(`/captions/${videoId}.en.vtt`, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setCaptionsAvailable(res.ok);
      })
      .catch(() => {
        if (!cancelled) setCaptionsAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  // Show/hide the caption track when the toggle (or the video) changes.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const apply = () => {
      const track = video.textTracks[0];
      if (track) track.mode = captionsOn && captionsAvailable ? "showing" : "disabled";
    };
    apply();
    const trackEl = trackRef.current;
    trackEl?.addEventListener("load", apply);
    return () => trackEl?.removeEventListener("load", apply);
  }, [captionsOn, captionsAvailable, src]);

  function clearHideTimer() {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }

  function scheduleHide() {
    clearHideTimer();
    // Never hide while paused or while a menu is open — the bar must
    // stay put when the user is reading it.
    if (paused || settingsOpen) return;
    hideTimerRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, CONTROLS_HIDE_MS);
  }

  function handlePointerActivity() {
    setShowControls(true);
    scheduleHide();
  }

  // Keep the bar visible while paused (or while a menu is open) and
  // restart the hide timer whenever that changes.
  useEffect(() => {
    if (paused || settingsOpen) {
      clearHideTimer();
      setShowControls(true);
      return;
    }
    scheduleHide();
    return clearHideTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, settingsOpen]);

  useEffect(() => clearHideTimer, []);

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

  function handleSpeakerClick() {
    // First tap opens the slider (no mute yet); a tap while it is
    // open toggles mute. Desktop hover opens it without a click.
    if (volumeExpanded) toggleMute();
    else setVolumeOpen(true);
  }

  // An outside tap closes the tap-opened slider.
  useEffect(() => {
    if (!volumeOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (volumeGroupRef.current && !volumeGroupRef.current.contains(e.target as Node)) {
        setVolumeOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [volumeOpen]);

  function selectPlaybackRate(next: number) {
    setPlaybackRate(next);
    try {
      localStorage.setItem(PLAYBACK_RATE_KEY, String(next));
    } catch {
      // Ignore.
    }
    const video = videoRef.current;
    if (video) video.playbackRate = next;
    setSettingsOpen(false);
  }

  function selectQuality(next: string) {
    setQuality(next);
    try {
      localStorage.setItem(QUALITY_KEY, next);
    } catch {
      // Ignore.
    }
    // One stream per video, so this only records the choice — there is
    // no other file to switch to.
    setSettingsOpen(false);
  }

  function toggleCaptions() {
    const next = !captionsOn;
    setCaptionsOn(next);
    try {
      localStorage.setItem(CAPTIONS_KEY, next ? "1" : "0");
    } catch {
      // Ignore.
    }
  }

  // Plain file download (to the device's Downloads folder) — different
  // from Save Offline, which keeps the video inside the app. The
  // stream URL serves the whole file on a plain GET; the download
  // attribute names it after the lesson title.
  function handleDownload() {
    if (!isOnline && !isSavedOffline) return;
    const name = `${title.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim() || lessonId}.mp4`;
    const a = document.createElement("a");
    a.href = src;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const onPlayStateChangeRef = useRef(onPlayStateChange);
  onPlayStateChangeRef.current = onPlayStateChange;

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
    // The file's real resolution — what the Quality menu shows.
    if (video && video.videoHeight > 0) {
      setDetectedQuality(`${video.videoHeight}p`);
    }
    reportCoverage(true);
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  // Double-tap to seek (touch only, YouTube-style): two quick taps on
  // the left half rewind 10s, on the right half forward 10s. A single
  // tap still toggles play — it just waits ~300ms to make sure a
  // second tap isn't coming.
  const DOUBLE_TAP_MS = 300;
  const tapRef = useRef<{ time: number; x: number } | null>(null);
  const tapTimerRef = useRef<number | null>(null);
  const lastTouchRef = useRef(0);
  const [seekFeedback, setSeekFeedback] = useState<{ dir: "back" | "forward"; id: number } | null>(null);
  const seekFeedbackTimerRef = useRef<number | null>(null);

  function handleVideoClick() {
    // A tap handled by the touch handler below already toggled play
    // on its timer — the synthetic click that follows it must not
    // toggle a second time.
    if (Date.now() - lastTouchRef.current < 500) return;
    togglePlay();
  }

  function handleVideoTouchEnd(e: TouchEvent<HTMLVideoElement>) {
    // Suppress the synthetic click so the tap is handled exactly once.
    e.preventDefault();
    lastTouchRef.current = Date.now();
    const touch = e.changedTouches[0];
    if (!touch) return;
    const rect = videoRef.current?.getBoundingClientRect();
    const x = rect ? touch.clientX - rect.left : 0;
    const half = rect ? rect.width / 2 : 0;
    const now = Date.now();
    const prev = tapRef.current;
    if (prev && now - prev.time < DOUBLE_TAP_MS && (prev.x < half) === (x < half)) {
      // Double-tap on the same half: seek, don't toggle play.
      if (tapTimerRef.current !== null) {
        window.clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }
      tapRef.current = null;
      const dir = x < half ? "back" : "forward";
      seekBy(dir === "back" ? -10 : 10);
      if (seekFeedbackTimerRef.current !== null) window.clearTimeout(seekFeedbackTimerRef.current);
      setSeekFeedback({ dir, id: now });
      seekFeedbackTimerRef.current = window.setTimeout(() => setSeekFeedback(null), 700);
      return;
    }
    tapRef.current = { time: now, x };
    if (tapTimerRef.current !== null) window.clearTimeout(tapTimerRef.current);
    tapTimerRef.current = window.setTimeout(() => {
      tapTimerRef.current = null;
      tapRef.current = null;
      togglePlay();
    }, DOUBLE_TAP_MS);
  }

  function handleSeek(next: number) {
    const video = videoRef.current;
    if (!video || !(duration > 0)) return;
    video.currentTime = Math.min(duration, Math.max(0, next));
    setCurrentTime(video.currentTime);
  }

  function seekBy(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    handleSeek(video.currentTime + seconds);
  }

  function handlePlayerKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // Keys act only when the player itself has focus — never steal
    // them from a button or field inside it.
    if (e.target !== e.currentTarget) return;
    if (e.key === " ") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      seekBy(10);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      seekBy(-10);
    }
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
    const onPlay = () => {
      setPaused(false);
      onPlayStateChangeRef.current?.(true);
    };
    const onPause = () => {
      setPaused(true);
      onPlayStateChangeRef.current?.(false);
    };
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    // Loading / buffering: show the spinner while the stream is still
    // loading or stalls mid-playback, hide it once the video can play
    // (or fails — a broken stream must not spin forever).
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onCanPlay = () => setIsLoading(false);
    const onLoadStart = () => setIsLoading(true);
    const onVideoError = () => setIsLoading(false);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("loadstart", onLoadStart);
    video.addEventListener("error", onVideoError);
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("loadstart", onLoadStart);
      video.removeEventListener("error", onVideoError);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [src]);

  function handleEnded() {
    persistWatched(lessonId);
    reportCoverage(true);
    onPlayStateChangeRef.current?.(false);
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
    // The page advances the playlist when autoplay is on.
    onEndedRef.current?.();
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
    setIsLoading(true);
    setDetectedQuality(null);
    setShowControls(true);
    onPlayStateChangeRef.current?.(false);
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
      setErrorMsg(t.player.errorOfflineCacheUnsupported);
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setErrorMsg(null);

    try {
      const streamUrl = `/api/video/${lessonId}`;
      const res = await fetch(streamUrl);
      if (!res.ok || !res.body) {
        throw new Error(t.player.errorDownloadFailed(res.status));
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
      setErrorMsg(err instanceof Error ? err.message : t.player.errorSaveOffline);
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
        tabIndex={0}
        onKeyDown={handlePlayerKeyDown}
        aria-label={t.player.ariaLabel}
        onMouseMove={handlePointerActivity}
        onMouseEnter={handlePointerActivity}
        onMouseLeave={() => {
          clearHideTimer();
          if (!paused && !settingsOpen) setShowControls(false);
        }}
        onTouchStart={handlePointerActivity}
        className={`aspect-video w-full bg-black flex items-center justify-center relative${showControls ? "" : " cursor-none"}`}
      >
        <video
          ref={videoRef}
          key={src}
          src={src}
          playsInline
          preload="metadata"
          autoPlay={autoplay}
          onClick={handleVideoClick}
          onTouchEnd={handleVideoTouchEnd}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPause={() => persistWatched(lessonId)}
          onEnded={handleEnded}
          className="h-full w-full bg-black"
        >
          {captionsAvailable && (
            <track
              ref={trackRef}
              kind="captions"
              label="English"
              srcLang="en"
              src={`/captions/${videoId}.en.vtt`}
            />
          )}
        </video>

        {/* Loading state: a spinner + "Loading…" while the stream is
            still loading or re-buffering, so the black screen never
            looks dead. Pointer-events pass through, so a tap on the
            video still toggles play. */}
        {isLoading && !errorMsg && (
          <div className="pointer-events-none absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3 bg-black/40">
            <Loader2 className="h-10 w-10 animate-spin text-white" aria-hidden="true" />
            <p className="text-sm text-neutral-300">{t.common.loading}</p>
          </div>
        )}

        {/* Double-tap seek feedback: a brief "10s" badge on the side
            that was double-tapped, so the seek is visible. */}
        {seekFeedback && (
          <div
            key={seekFeedback.id}
            className={`pointer-events-none absolute inset-y-0 z-[6] flex w-1/3 items-center ${seekFeedback.dir === "back" ? "left-0 justify-start pl-8" : "right-0 justify-end pr-8"}`}
          >
            <div className="flex flex-col items-center gap-1 rounded-full bg-black/60 px-4 py-3 text-white">
              {seekFeedback.dir === "back" ? (
                <RotateCcw className="h-6 w-6" aria-hidden="true" />
              ) : (
                <RotateCw className="h-6 w-6" aria-hidden="true" />
              )}
              <span className="text-xs font-semibold">10s</span>
            </div>
          </div>
        )}

        {/* Settings menu backdrop — clicking anywhere else closes it. */}
        {settingsOpen && (
          <div
            className="absolute inset-0 z-10"
            onClick={() => setSettingsOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Settings menu (autoplay, speed + quality), anchored above
            the bar and capped to the video area so it never clips off
            the top. */}
        {settingsOpen && (
          <div className="absolute right-3 bottom-[6.5rem] z-20 max-h-[calc(100%-8rem)] w-60 overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => onAutoplayChange?.(!autoplay)}
              title={autoplay ? t.player.autoplayOnHint : t.player.autoplayOffHint}
              aria-label={t.player.autoplay}
              aria-pressed={autoplay}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-white/10"
            >
              <span>{t.player.autoplay}</span>
              <span className={`relative h-4 w-7 shrink-0 rounded-full transition ${autoplay ? "bg-white" : "bg-neutral-700"}`}>
                <span className={`absolute top-0.5 h-3 w-3 rounded-full transition-all ${autoplay ? "left-3.5 bg-black" : "left-0.5 bg-neutral-300"}`} />
              </span>
            </button>
            <div className="my-1 border-t border-neutral-800" />
            <p className="px-3 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {t.player.playbackSpeed}
            </p>
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => selectPlaybackRate(rate)}
                className="flex w-full items-center justify-between px-3 py-1 text-left text-[13px] hover:bg-white/10"
              >
                <span>{rate === 1 ? t.player.speedNormal : `${rate}×`}</span>
                {playbackRate === rate && <Check className="h-4 w-4" />}
              </button>
            ))}
            <div className="my-1 border-t border-neutral-800" />
            <p className="px-3 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {t.player.quality}
            </p>
            <button
              type="button"
              onClick={() => selectQuality("auto")}
              className="flex w-full items-center justify-between px-3 py-1 text-left text-[13px] hover:bg-white/10"
            >
              <span>{t.player.qualityAuto}</span>
              {quality === "auto" && <Check className="h-4 w-4" />}
            </button>
            {detectedQuality && (
              <button
                type="button"
                onClick={() => selectQuality(detectedQuality)}
                className="flex w-full items-center justify-between px-3 py-1 text-left text-[13px] hover:bg-white/10"
              >
                <span>
                  {detectedQuality} <span className="text-neutral-400">{t.player.original}</span>
                </span>
                {quality === detectedQuality && <Check className="h-4 w-4" />}
              </button>
            )}
            <p className="px-3 py-2 text-[11px] leading-snug text-neutral-500">
              {t.player.qualityNote}
            </p>
          </div>
        )}

        {/* One control bar for both sliders: seek on top, and the
            volume slider slides out when you hover the speaker. The
            bar fades out 2.5s after the last mouse move while the
            video plays, and comes back on any movement. */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2.5 pt-10 text-white transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        >
          <ElasticSlider
            value={currentTime}
            maxValue={duration > 0 ? duration : 1}
            onChange={handleSeek}
            valuePosition="none"
            thumb
            leftIcon={null}
            rightIcon={null}
            disabled={duration <= 0}
            ariaLabel={t.player.seekLabel}
            className="pointer-events-auto"
          />
          <div className="pointer-events-auto mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              title={paused ? t.player.play : t.player.pause}
              aria-label={paused ? t.player.play : t.player.pause}
              className="shrink-0 rounded-lg p-1.5 text-white transition hover:bg-white/10"
            >
              {paused ? (
                <Play className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </button>
            <div
              ref={volumeGroupRef}
              onMouseEnter={() => setVolumeHovered(true)}
              onMouseLeave={() => setVolumeHovered(false)}
              className="flex items-center"
            >
              <button
                type="button"
                onClick={handleSpeakerClick}
                title={muted ? t.player.unmute : t.player.mute}
                aria-label={muted ? t.player.unmute : t.player.mute}
                className="shrink-0 rounded-lg p-1.5 text-white transition hover:bg-white/10"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <div className={`w-0 overflow-hidden opacity-0 transition-all duration-300 ${volumeExpanded ? "w-28 opacity-100 md:w-48" : ""}`}>
                <ElasticSlider
                  value={volume}
                  onChange={handleVolumeChange}
                  valuePosition="none"
                  thumb
                  leftIcon={null}
                  rightIcon={null}
                  ariaLabel={t.player.volumeLabel}
                />
              </div>
            </div>
            <span className="hidden shrink-0 text-xs tabular-nums text-neutral-200 sm:inline">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="flex-1" />
            {captionsAvailable && (
              <button
                type="button"
                onClick={toggleCaptions}
                title={captionsOn ? t.player.hideCaptions : t.player.showCaptions}
                aria-label={t.player.captionsLabel}
                aria-pressed={captionsOn}
                className={`shrink-0 rounded-lg p-1.5 transition hover:bg-white/10 ${captionsOn ? "bg-white text-black hover:bg-white" : "text-white"}`}
              >
                <Captions className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleDownload}
              disabled={!isOnline && !isSavedOffline}
              title={t.player.downloadVideo}
              aria-label={t.player.downloadVideo}
              className="shrink-0 rounded-lg p-1.5 text-white transition hover:bg-white/10 disabled:opacity-40"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              title={t.player.settingsLabel}
              aria-label={t.player.settingsLabel}
              aria-expanded={settingsOpen}
              className={`shrink-0 rounded-lg p-1.5 transition hover:bg-white/10 ${settingsOpen ? "bg-white/15 text-white" : "text-white"}`}
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? t.player.exitFullscreen : t.player.fullscreen}
              aria-label={isFullscreen ? t.player.exitFullscreen : t.player.fullscreen}
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
          <h2 className="truncate text-sm font-medium text-white">{videoTitle(videoId, title)}</h2>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
            {isSavedOffline ? (
              <span className="inline-flex items-center gap-1 text-neutral-200">
                <HardDrive className="h-3.5 w-3.5" /> {t.player.playingOffline}
              </span>
            ) : isOnline ? (
              <span className="inline-flex items-center gap-1">
                <Wifi className="h-3.5 w-3.5" /> {t.player.streamingOnline}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-neutral-500">
                <WifiOff className="h-3.5 w-3.5" /> {t.player.offlineNotSaved}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500">{t.player.keyboardHint}</p>
        </div>

        <div className="flex items-center gap-2">
          {completionButton}
          {isSavedOffline ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white">
                <Check className="h-3.5 w-3.5" /> {t.lesson.savedOffline}
              </span>
              <button
                type="button"
                onClick={handleRemoveOffline}
                title={t.player.removeOfflineCopy}
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
                  {downloadProgress > 0 ? t.player.savingPct(downloadProgress) : t.player.saving}
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  {t.lesson.saveOffline}
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

