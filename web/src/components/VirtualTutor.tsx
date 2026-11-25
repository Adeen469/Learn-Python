"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Mic, MicOff, Send, Volume2, X } from "lucide-react";
import { fetchSessionUser, type SessionUser } from "@/lib/auth-client";
import { stripForSpeech } from "@/lib/ai-tts";
import { applyTheme } from "@/lib/theme";
import {
  executeVoiceCommand,
  realCommandEnv,
} from "@/lib/tutor-command-actions";
import { matchVoiceCommand } from "@/lib/tutor-commands";
import { useLanguage, type LanguageCode } from "@/lib/i18n";
import {
  MIC_DENIED_MESSAGE,
  isMicPermissionError,
  matchesWakeWord,
  normalizeTranscript,
  voiceErrorMessage,
} from "@/lib/tutor-wake";
import Strands from "@/components/Strands";

interface TutorMessage {
  role: "user" | "assistant";
  text: string;
  provider?: string;
  topicGrounded?: boolean;
}

interface SpeechRecognitionResultLike {
  0: { transcript: string };
  length: number;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

// Voice-only session phases (wake word, panel closed):
// idle = wake listening; listening = hearing the question;
// thinking = waiting on the tutor reply; speaking = reading it aloud.
type VoicePhase = "idle" | "listening" | "thinking" | "speaking";

type TutorReplyResult =
  | { ok: true; reply: string; provider?: string; topicGrounded?: boolean }
  | { ok: false; expired: boolean; error: string | null };

const SPEECH_LOCALES: Partial<Record<LanguageCode, string>> = {
  en: "en-IN",
  "hi-roman": "hi-IN",
  fr: "fr-FR",
  ja: "ja-JP",
  ko: "ko-KR",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-BR",
  ru: "ru-RU",
  ar: "ar-SA",
  zh: "zh-CN",
};

// Spoken when the wake word fires, before listening for the
// question — the tutor must never sit silent after waking.
const VOICE_GREETING = "Hi! How can I help?";

const STRANDS_COLORS = [
  "#afafaf",
  "#afafaf",
  "#000000",
  "#000000",
  "#afafaf",
  "#afafaf",
  "#afafaf",
];

// Microphone permission state for the wake listener. The wake
// listener must not auto-start before the browser has granted the
// mic: start() without a user gesture is blocked with
// "not-allowed" and no permission prompt is ever shown.
async function checkMicPermission(): Promise<
  "granted" | "denied" | "prompt" | "unknown"
> {
  try {
    const permissions = navigator.permissions;
    if (!permissions?.query) return "unknown";
    const status = await permissions.query({
      name: "microphone" as PermissionName,
    });
    return status.state;
  } catch {
    return "unknown";
  }
}

export function VirtualTutor() {
  const { lang, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const topicMatch = pathname?.match(/^\/learn\/([A-Za-z0-9_-]+)\/?$/);
  const topicSlug = topicMatch?.[1];
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(false);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [speakingMessage, setSpeakingMessage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Voice-only session (wake word): the panel stays closed while
  // the tutor listens for a question and answers by voice.
  const [voicePhase, setVoicePhase] = useState<VoicePhase>("idle");
  const [wakeEnabled, setWakeEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem("lp_tutor_wake") !== "off";
    } catch {
      return true;
    }
  });
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wakeRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wakeBlockedRef = useRef(false);
  const wakeRetryRef = useRef<number | null>(null);
  const openRef = useRef(open);
  const wakeEnabledRef = useRef(wakeEnabled);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const voicePhaseRef = useRef<VoicePhase>("idle");
  const questionRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const greetingTimerRef = useRef<number | null>(null);
  const questionSilenceRef = useRef<number | null>(null);
  const voiceSessionActiveRef = useRef(false);
  const userRef = useRef<SessionUser | null>(null);
  // Wake-word listener health: the orb must never go silently dead.
  // Repeated start/recognition failures surface as a visible error
  // (orb badge + panel hint) instead of a quiet retry loop.
  const [wakeError, setWakeError] = useState<string | null>(null);
  const wakeFailuresRef = useRef(0);
  const wakeSettleRef = useRef<number | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    wakeEnabledRef.current = wakeEnabled;
  }, [wakeEnabled]);
  useEffect(() => {
    voicePhaseRef.current = voicePhase;
  }, [voicePhase]);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setCheckingSession(true);
    const speechWindow = window as SpeechWindow;
    setSpeechAvailable(
      Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition)
    );
    fetchSessionUser()
      .then((sessionUser) => {
        if (active) setUser(sessionUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTutor();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, sending]);

  useEffect(
    () => () => {
      if (wakeRetryRef.current !== null) {
        window.clearTimeout(wakeRetryRef.current);
      }
      if (wakeSettleRef.current !== null) {
        window.clearTimeout(wakeSettleRef.current);
      }
      if (greetingTimerRef.current !== null) {
        window.clearTimeout(greetingTimerRef.current);
      }
      if (questionSilenceRef.current !== null) {
        window.clearTimeout(questionSilenceRef.current);
      }
      recognitionRef.current?.abort();
      wakeRecognitionRef.current?.abort();
      questionRecognitionRef.current?.abort();
      ttsAbortRef.current?.abort();
      if (audioRef.current) audioRef.current.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    []
  );

  function cleanupAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }

  function stopSpeech() {
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;
    cleanupAudio();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeakingMessage(null);
  }

  function closeTutor() {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setListening(false);
    // A voice-only session may be speaking when the panel is
    // opened and then closed — reset it so the wake listener
    // restarts instead of the orb staying stuck active.
    endVoiceSession();
    stopSpeech();
    setOpen(false);
  }

  // Ask the browser for the microphone, on a user gesture. This is
  // what makes Edge/Chrome show the permission prompt and register
  // the Microphone entry in Site permissions (like muse.ai). The
  // stream is stopped at once — the granted permission is what
  // matters; SpeechRecognition uses it afterwards.
  async function requestMicPermission(): Promise<boolean> {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      setError("Voice input is not supported in this browser. You can still type.");
      return false;
    }
    try {
      const stream = await mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setError(null);
      return true;
    } catch (caught) {
      const name = caught instanceof Error ? caught.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setError(MIC_DENIED_MESSAGE);
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setError(
          "No microphone was found on this device. Check your microphone or type instead."
        );
      } else if (name === "NotReadableError") {
        setError("Your microphone is in use by another app. Close it and try again.");
      } else {
        setError("Could not access the microphone. Check permission or type instead.");
      }
      return false;
    }
  }

  // Retry the wake listener after a short pause. Guards so a
  // stopped or blocked listener never restarts.
  function scheduleWakeRestart() {
    if (wakeRetryRef.current !== null) return;
    wakeRetryRef.current = window.setTimeout(() => {
      wakeRetryRef.current = null;
      if (!wakeEnabledRef.current || wakeBlockedRef.current) {
        return;
      }
      // The old listener is dead or dying — stop it first so a
      // fresh one starts instead of two listeners racing.
      stopWake();
      startWake();
    }, 1500);
  }

  function startListening() {
    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Voice input is not supported in this browser. You can still type.");
      return;
    }

    setError(null);
    // The wake listener and dictation cannot share the mic — stop
    // wake first; it restarts when dictation ends.
    stopWake();
    let recognition: SpeechRecognitionLike;
    try {
      recognition = new Recognition();
    } catch {
      // The constructor itself can throw when the speech service
      // is unavailable — say so instead of failing silently.
      setError("Could not start voice input. Check microphone permission or type instead.");
      return;
    }
    recognition.lang = SPEECH_LOCALES[lang] ?? navigator.language ?? "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    // Watchdog: the service can start and then never fire any
    // event (unreachable service, blocked on the device) — after
    // 12s with no result, say so instead of listening forever.
    let heardSomething = false;
    const noResultTimer = window.setTimeout(() => {
      if (!heardSomething && recognitionRef.current === recognition) {
        recognitionRef.current = null;
        setListening(false);
        try {
          recognition.abort();
        } catch {
          // Already stopped.
        }
        setError(
          "Voice input started but I heard nothing. On Windows, check Settings → Privacy & security → Speech → Online speech recognition is on — or type your question instead."
        );
        scheduleWakeRestart();
      }
    }, 12000);
    const clearNoResultTimer = () => window.clearTimeout(noResultTimer);
    recognition.onresult = (event) => {
      heardSomething = true;
      clearNoResultTimer();
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) {
        setInput((current) =>
          current.trim() ? `${current.trim()} ${transcript}` : transcript
        );
      }
    };
    recognition.onerror = (event) => {
      clearNoResultTimer();
      const message = voiceErrorMessage(event.error);
      if (message) setError(message);
    };
    recognition.onend = () => {
      clearNoResultTimer();
      recognitionRef.current = null;
      setListening(false);
      scheduleWakeRestart();
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      clearNoResultTimer();
      recognitionRef.current = null;
      setListening(false);
      setError("Could not start voice input. Check microphone permission or type instead.");
    }
  }

  function stopWake() {
    if (wakeRetryRef.current !== null) {
      window.clearTimeout(wakeRetryRef.current);
      wakeRetryRef.current = null;
    }
    if (wakeSettleRef.current !== null) {
      window.clearTimeout(wakeSettleRef.current);
      wakeSettleRef.current = null;
    }
    const recognition = wakeRecognitionRef.current;
    wakeRecognitionRef.current = null;
    if (recognition) {
      try {
        recognition.abort();
      } catch {
        // Already stopped.
      }
    }
  }

  // Record a wake-listener failure. Three in a row surface a
  // visible error (orb badge + panel hint) — the listener must
  // never fail silently in a retry loop.
  function recordWakeFailure(message: string) {
    wakeFailuresRef.current += 1;
    if (wakeFailuresRef.current >= 3) {
      setWakeError(message);
    }
  }

  function startWake() {
    if (typeof window === "undefined") return;
    // A pending retry is moot once a fresh listener starts.
    if (wakeRetryRef.current !== null) {
      window.clearTimeout(wakeRetryRef.current);
      wakeRetryRef.current = null;
    }
    // Stop any previous listener first, so a restart never leaves
    // two listeners racing on the same wake word.
    stopWake();
    wakeBlockedRef.current = false;
    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setWakeError("Voice input is not supported in this browser. You can still type.");
      return;
    }
    let recognition: SpeechRecognitionLike;
    try {
      recognition = new Recognition();
    } catch {
      // The constructor itself can throw when the speech service
      // is unavailable — retry instead of dying silently.
      recordWakeFailure("Voice listening could not start. Check the microphone and try again.");
      scheduleWakeRestart();
      return;
    }
    recognition.lang = SPEECH_LOCALES[lang] ?? navigator.language ?? "en-IN";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript && matchesWakeWord(transcript)) {
        stopWake();
        // Voice-only session: the panel stays closed. The tutor
        // listens for the question and answers by voice; the
        // panel opens only when the user taps the orb.
        startVoiceSession();
      }
    };
    recognition.onerror = (event) => {
      // A denied microphone must not hot-loop restarts — but surface
      // it instead of degrading silently, so the user can allow the
      // mic in Site permissions and retry.
      if (isMicPermissionError(event.error)) {
        wakeBlockedRef.current = true;
        setError(MIC_DENIED_MESSAGE);
        setWakeError(MIC_DENIED_MESSAGE);
        return;
      }
      // Any other error ends this listener; onend normally follows
      // and restarts it. Count it, so a flapping listener surfaces
      // instead of retrying forever unnoticed.
      recordWakeFailure(
        voiceErrorMessage(event.error) ?? "Voice listening stopped. Try again."
      );
      scheduleWakeRestart();
    };
    recognition.onend = () => {
      // Auto-restart while the toggle is on. If stopWake() cleared
      // the ref, this instance was stopped on purpose and must not
      // restart.
      if (wakeRecognitionRef.current !== recognition) return;
      wakeRecognitionRef.current = null;
      if (wakeBlockedRef.current) return;
      scheduleWakeRestart();
    };
    wakeRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      wakeRecognitionRef.current = null;
      // start() can throw without firing onend, so schedule the
      // retry explicitly instead of dying silently.
      recordWakeFailure("Voice listening could not start. Check the microphone and try again.");
      if (!wakeBlockedRef.current) scheduleWakeRestart();
      return;
    }
    // A listener that survives 5s is healthy — clear the failure
    // count (and any earlier failure flag) so one bad start does
    // not brand the mic broken forever.
    if (wakeSettleRef.current !== null) {
      window.clearTimeout(wakeSettleRef.current);
    }
    wakeSettleRef.current = window.setTimeout(() => {
      wakeSettleRef.current = null;
      if (wakeRecognitionRef.current === recognition) {
        wakeFailuresRef.current = 0;
        setWakeError(null);
      }
    }, 5000);
  }

  // End a voice-only session and return the orb to idle. The wake
  // effect restarts the wake listener once the phase is idle again
  // (toggle on, mic not blocked).
  function endVoiceSession() {
    voiceSessionActiveRef.current = false;
    if (greetingTimerRef.current !== null) {
      window.clearTimeout(greetingTimerRef.current);
      greetingTimerRef.current = null;
    }
    stopQuestionListener();
    if (voicePhaseRef.current !== "idle") setVoicePhase("idle");
  }

  // Stop the question listener (and its inactivity timer) without
  // ending the session — used when a transcript arrived and the
  // session moves on to thinking.
  function stopQuestionListener() {
    if (questionSilenceRef.current !== null) {
      window.clearTimeout(questionSilenceRef.current);
      questionSilenceRef.current = null;
    }
    const recognition = questionRecognitionRef.current;
    questionRecognitionRef.current = null;
    if (recognition) {
      try {
        recognition.abort();
      } catch {
        // Already stopped.
      }
    }
  }

  // Listen for the spoken question. continuous MUST stay true: a
  // non-continuous listener ends on the first pause in speech —
  // about a second after the wake word — and the session dies
  // before the user speaks. While the phase is "listening" an
  // ended listener restarts instead of ending the session; 30s
  // of silence with no question ends it so the mic never runs
  // forever.
  function startQuestionListener() {
    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      endVoiceSession();
      return;
    }
    setVoicePhase("listening");
    const recognition = new Recognition();
    recognition.lang = SPEECH_LOCALES[lang] ?? navigator.language ?? "en-IN";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) {
        // Ignore echoes of the wake phrase and the greeting itself:
        // the mic hears the speaker while the greeting plays, and
        // that must not become the user's question.
        const normalized = normalizeTranscript(transcript);
        if (matchesWakeWord(transcript) || /how can i help/.test(normalized)) {
          return;
        }
        stopQuestionListener();
        void askVoiceQuestion(transcript);
      }
    };
    recognition.onerror = (event) => {
      // A revoked mic ends the session with the denied hint;
      // anything else (network blips, service hiccups) is left to
      // onend, which restarts the listener below.
      if (isMicPermissionError(event.error)) {
        endVoiceSession();
        setError(MIC_DENIED_MESSAGE);
      }
    };
    recognition.onend = () => {
      if (questionRecognitionRef.current !== recognition) return;
      questionRecognitionRef.current = null;
      // Still waiting on the question: the listener ended (pause,
      // network blip) — restart it instead of going silent.
      if (voicePhaseRef.current === "listening") {
        startQuestionListener();
      }
    };
    questionRecognitionRef.current = recognition;
    if (questionSilenceRef.current !== null) {
      window.clearTimeout(questionSilenceRef.current);
    }
    questionSilenceRef.current = window.setTimeout(() => {
      questionSilenceRef.current = null;
      if (voicePhaseRef.current === "listening") endVoiceSession();
    }, 30000);
    try {
      recognition.start();
    } catch {
      questionRecognitionRef.current = null;
      // start() can throw if the mic is momentarily busy (the wake
      // listener was just aborted) — retry once shortly instead of
      // dying silently.
      window.setTimeout(() => {
        if (voicePhaseRef.current === "listening") {
          startQuestionListener();
        }
      }, 500);
    }
  }

  function startVoiceSession() {
    voiceSessionActiveRef.current = true;
    // The wake word worked — clear any earlier failure flag.
    setWakeError(null);
    // Greet by voice and listen for the question in parallel. The
    // tutor must never sit silent after waking — and the question
    // listener must already be running while the greeting is
    // still generating, or the user's words are never heard.
    setVoicePhase("speaking");
    // The panel has never been opened on this page load, so the
    // session user may not be loaded yet — fetch it while the
    // greeting plays.
    void fetchSessionUser()
      .then((sessionUser) => {
        userRef.current = sessionUser;
        setUser(sessionUser);
      })
      .catch(() => {
        // Still unknown — askVoiceQuestion falls back to a sign-in
        // prompt if there is no user by then.
      });
    let listeningStarted = false;
    const beginListening = () => {
      if (listeningStarted) return;
      listeningStarted = true;
      if (greetingTimerRef.current !== null) {
        window.clearTimeout(greetingTimerRef.current);
        greetingTimerRef.current = null;
      }
      // The session may have ended mid-greeting — only listen
      // while still in the voice session.
      if (!voiceSessionActiveRef.current) return;
      startQuestionListener();
    };
    // Safety: if the greeting never finishes (TTS hangs), start
    // listening anyway instead of sitting silent forever.
    greetingTimerRef.current = window.setTimeout(beginListening, 10000);
    speak(VOICE_GREETING, -1, beginListening);
    // Listen in parallel with the greeting: the greeting's TTS
    // fetch takes seconds, and the user speaks the question while
    // it is still generating — if the listener only starts after
    // the greeting ends, those words are never heard (the "not
    // listening" / "responding too late" complaint). The question
    // listener ignores echoes of the greeting itself.
    beginListening();
  }

  async function askVoiceQuestion(question: string) {
    // The session user is fetched while the greeting plays, so the
    // question can arrive before that fetch resolves — wait for it
    // (cached, so this is cheap) instead of telling a signed-in
    // user to sign in.
    const sessionUser =
      userRef.current ?? (await fetchSessionUser().catch(() => null));
    if (sessionUser) {
      userRef.current = sessionUser;
      setUser(sessionUser);
    }
    if (!sessionUser) {
      setVoicePhase("speaking");
      speak("Please sign in to use the Virtual Tutor.", -1, () => endVoiceSession());
      return;
    }
    setVoicePhase("thinking");
    const history = messages.slice(-4).map(({ role, text }) => ({ role, text }));
    setMessages((current) => [...current, { role: "user", text: question }]);
    // Voice site control (130): a command runs instead of an AI
    // answer — the wake-word voice session never opens the panel,
    // so the confirmation is spoken and the session ends.
    const confirmation = await handleVoiceCommand(question);
    if (confirmation) {
      setMessages((current) => [...current, { role: "assistant", text: confirmation }]);
      setVoicePhase("speaking");
      speak(confirmation, -1, () => endVoiceSession());
      return;
    }
    try {
      const result = await fetchTutorReply(question, history);
      if (!result.ok) throw new Error("tutor reply failed");
      const message: TutorMessage = {
        role: "assistant",
        text: result.reply,
        provider: result.provider,
        topicGrounded: result.topicGrounded,
      };
      setMessages((current) => [...current, message]);
      setVoicePhase("speaking");
      speak(result.reply, -1, () => endVoiceSession());
    } catch {
      setMessages((current) => current.slice(0, -1));
      setVoicePhase("speaking");
      speak("Sorry, I couldn't answer that right now. Please try again.", -1, () =>
        endVoiceSession()
      );
    }
  }

  useEffect(() => {
    // The wake word is heard whether the panel is open or closed —
    // it never OPENS the panel (only the orb tap does), but the
    // listener must not die just because the panel is open.
    if (!wakeEnabled || voicePhase !== "idle") {
      stopWake();
      return;
    }
    // Auto-start only once the mic is already granted. Starting
    // recognition on page load (no gesture, permission still on
    // "prompt") is blocked with "not-allowed" and never shows a
    // prompt — so wait for a gesture (wake toggle or mic button),
    // which requests the permission first. A "prompt" state is
    // surfaced, never silently ignored.
    let cancelled = false;
    checkMicPermission().then((state) => {
      if (cancelled) return;
      if (state === "denied") {
        setError(MIC_DENIED_MESSAGE);
        setWakeError(MIC_DENIED_MESSAGE);
        return;
      }
      if (state === "prompt") {
        setWakeError(
          "Microphone is not allowed yet — tap the microphone button in the tutor panel once, then the wake word will work."
        );
        return;
      }
      if (state === "granted" || state === "unknown") startWake();
    });
    return () => {
      cancelled = true;
      stopWake();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeEnabled, voicePhase]);

  // If the mic was allowed in Site permissions while this tab was
  // in the background, the wake listener never hears about it —
  // re-check when the tab becomes visible again.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (
        !wakeEnabledRef.current ||
        voicePhaseRef.current !== "idle" ||
        wakeRecognitionRef.current ||
        recognitionRef.current
      ) {
        return;
      }
      checkMicPermission().then((state) => {
        if (state === "granted" || state === "unknown") startWake();
      });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function speakWithBrowser(text: string, index: number, onDone?: () => void) {
    if (!("speechSynthesis" in window)) {
      setError("Speech playback is not supported in this browser.");
      onDone?.();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LOCALES[lang] ?? navigator.language ?? "en-IN";
    utterance.onstart = () => setSpeakingMessage(index);
    utterance.onend = () => {
      setSpeakingMessage(null);
      onDone?.();
    };
    utterance.onerror = () => {
      setSpeakingMessage(null);
      onDone?.();
    };
    window.speechSynthesis.speak(utterance);
  }

  async function speak(text: string, index: number, onDone?: () => void) {
    if (speakingMessage === index) {
      stopSpeech();
      onDone?.();
      return;
    }
    stopSpeech();
    // Gemini TTS first; any failure falls back to the browser voice.
    const spoken = stripForSpeech(text);
    if (spoken) {
      const controller = new AbortController();
      ttsAbortRef.current = controller;
      try {
        const response = await fetch("/api/ai/tts", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: spoken }),
          signal: controller.signal,
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audioUrlRef.current = url;
          audio.onplaying = () => setSpeakingMessage(index);
          audio.onended = () => {
            setSpeakingMessage(null);
            cleanupAudio();
            onDone?.();
          };
          audio.onerror = () => {
            cleanupAudio();
            speakWithBrowser(text, index, onDone);
          };
          await audio.play();
          return;
        }
      } catch {
        // Aborted on purpose (stopSpeech) — do not restart speech.
        if (controller.signal.aborted) return;
      } finally {
        ttsAbortRef.current = null;
      }
    }
    speakWithBrowser(text, index, onDone);
  }

  // Shared by the panel form and the voice-only session: ask the
  // tutor and normalise the reply / failure shape.
  async function fetchTutorReply(
    question: string,
    history: { role: "user" | "assistant"; text: string }[]
  ): Promise<TutorReplyResult> {
    const response = await fetch("/api/ai", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        virtualTutor: true,
        ...(topicSlug ? { topicSlug } : {}),
        question,
        history,
      }),
    });
    const data: unknown = await response.json().catch(() => null);
    if (response.status === 401) return { ok: false, expired: true, error: null };
    if (
      !response.ok ||
      typeof data !== "object" ||
      data === null ||
      !("reply" in data) ||
      typeof data.reply !== "string" ||
      !data.reply.trim()
    ) {
      return {
        ok: false,
        expired: false,
        error:
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : null,
      };
    }
    return {
      ok: true,
      reply: data.reply.trim(),
      provider:
        "provider" in data && typeof data.provider === "string"
          ? data.provider
          : undefined,
      topicGrounded: "topicGrounded" in data && data.topicGrounded === true,
    };
  }

  // Voice site control (130): "open strings lesson", "play the
  // video", "run the code". Returns the spoken confirmation, or null
  // when the text is not a command (then the AI answers it). Used by
  // both send() (panel) and askVoiceQuestion() (wake-word voice
  // session, no panel).
  async function handleVoiceCommand(question: string): Promise<string | null> {
    const command = matchVoiceCommand(question, { pathname, topicSlug });
    if (!command) return null;
    return executeVoiceCommand(
      command,
      realCommandEnv({
        navigate: (path) => router.push(path),
        setTutorOpen: setOpen,
        setTheme: applyTheme,
      }),
      { pathname, topicSlug }
    );
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || sending || !user) return;
    setError(null);
    setInput("");
    const history = messages.slice(-4).map(({ role, text }) => ({ role, text }));
    setMessages((current) => [...current, { role: "user", text: question }]);
    const confirmation = await handleVoiceCommand(question);
    if (confirmation) {
      setMessages((current) => [...current, { role: "assistant", text: confirmation }]);
      void speak(confirmation, messages.length + 1);
      return;
    }
    setSending(true);
    try {
      const result = await fetchTutorReply(question, history);
      if (!result.ok) {
        setError(
          result.expired ? t.tutor.errorSessionExpired : result.error ?? t.tutor.errorGeneric
        );
        setMessages((current) => current.slice(0, -1));
        setInput(question);
        return;
      }
      const message: TutorMessage = {
        role: "assistant",
        text: result.reply,
        provider: result.provider,
        topicGrounded: result.topicGrounded,
      };
      setMessages((current) => [...current, message]);
      // Every tutor reply is also spoken aloud via the TTS chain
      // — panel replies were text-only before this. The reply
      // lands at messages.length + 1 (the user message just
      // appended sits at messages.length).
      void speak(result.reply, messages.length + 1);
    } catch {
      setError(t.tutor.errorGeneric);
      setMessages((current) => current.slice(0, -1));
      setInput(question);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => {
            // The panel opens ONLY from this tap — never from the
            // wake word. Stop any voice-only session first.
            endVoiceSession();
            setOpen(true);
          }}
          aria-label={voicePhase !== "idle" ? "Virtual Tutor listening" : t.common.aiTutor}
          aria-haspopup="dialog"
          title={
            !wakeEnabled
              ? "Wake word is off — open the tutor to turn it on"
              : wakeError ?? undefined
          }
          className={`fixed bottom-24 right-4 z-[80] h-16 w-16 overflow-hidden rounded-full bg-transparent transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:bottom-6 sm:right-6${
            voicePhase !== "idle" ? " ring-2 ring-white/70" : ""
          }${!wakeEnabled ? " opacity-40" : ""}`}
        >
          <Strands
            listening={voicePhase !== "idle"}
            className="absolute inset-0"
            colors={STRANDS_COLORS}
            scale={2.6}
            speed={2.45}
            amplitude={1.05}
            waviness={2.5}
            energy={0.55}
            thickness={0.3}
            spread={1.4}
            glow={0.9}
            taper={1.2}
            intensity={0.6}
            saturation={1.05}
            glassSize={1.2}
            rim={0.7}
            dispersion={0}
            maxDevicePixelRatio={1.5}
          />
          {!wakeEnabled && (
            <span className="absolute bottom-1 right-1 rounded-full bg-black p-1.5 text-white ring-1 ring-white/40">
              <MicOff className="h-3 w-3" />
            </span>
          )}
          {wakeEnabled && wakeError && (
            <span
              title={wakeError}
              className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-black"
            />
          )}
        </button>
      ) : (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-end bg-black/55 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTutor();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="virtual-tutor-heading"
            className="flex max-h-[min(88vh,760px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 text-white shadow-2xl"
          >
            <header className="flex items-start justify-between border-b border-neutral-800 px-4 py-3">
              <div>
                <h2
                  id="virtual-tutor-heading"
                  className="text-sm font-semibold text-white"
                >
                  {t.common.aiTutor}
                </h2>
                <p className="mt-1 text-xs text-neutral-400">
                  {topicSlug
                    ? `Context: ${topicSlug.replaceAll("-", " ")}`
                    : "Ask about Python or what you are learning."}
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={wakeEnabled}
                  onClick={() => {
                    const next = !wakeEnabled;
                    try {
                      window.localStorage.setItem(
                        "lp_tutor_wake",
                        next ? "on" : "off"
                      );
                    } catch {
                      // Private mode: the toggle still works for this session.
                    }
                    // Turning wake on is a user gesture: request the
                    // mic now so the browser prompts and registers
                    // the Microphone permission for this site.
                    if (next) void requestMicPermission();
                    setWakeError(null);
                    setWakeEnabled(next);
                  }}
                  className="mt-2 flex items-center gap-2 text-xs text-neutral-400 transition hover:text-white"
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-4 w-7 rounded-full p-0.5 transition ${
                      wakeEnabled ? "bg-white" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`block h-3 w-3 rounded-full transition ${
                        wakeEnabled
                          ? "translate-x-3 bg-black"
                          : "bg-neutral-400"
                      }`}
                    />
                  </span>
                  {t.tutor.wakeLabel}
                </button>
                <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
                  {t.tutor.wakePrivacy}
                </p>
                {wakeError && (
                  <p className="mt-1 text-[11px] leading-relaxed text-red-300">
                    {wakeError}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeTutor}
                aria-label={t.selectionToolbar.close}
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="relative shrink-0 border-b border-neutral-800 bg-black">
              <Strands
                listening={listening || sending || speakingMessage !== null || voicePhase !== "idle"}
                colors={STRANDS_COLORS}
                speed={2.45}
                amplitude={1.05}
                waviness={2.5}
                energy={0.28}
                thickness={0.3}
                spread={1.4}
                glow={0.9}
                taper={1.2}
                intensity={0.6}
                saturation={1.05}
                glassSize={1.2}
                rim={0.7}
                dispersion={0}
                maxDevicePixelRatio={1.5}
                style={{ height: 150 }}
              />
              {(listening || sending) && (
                <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-neutral-300">
                  {listening ? "Listening — tap the microphone to stop" : t.tutor.thinking}
                </p>
              )}
            </div>

            <div
              ref={listRef}
              aria-live="polite"
              className="min-h-24 flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && (
                <div className="rounded-xl border border-neutral-800 bg-black p-3 text-sm leading-relaxed text-neutral-300">
                  <p>
                    I can explain the current Learn topic using its published
                    content. Ask a question, use the microphone to dictate
                    one, or just say “Virtual Tutor” or “Virtual Assistant”
                    to wake me up and talk by voice — no need to open this
                    panel.
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    This conversation is kept in this page session only. Wake-word
                    listening runs in your browser and can be turned off above.
                  </p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-xl px-3 py-2.5 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "ml-8 bg-white text-black"
                      : "mr-6 border border-neutral-800 bg-black text-neutral-200"
                  }`}
                >
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-60">
                    {message.role === "user" ? t.tutor.youLabel : t.common.aiTutor}
                  </p>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.role === "assistant" && (
                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-neutral-500">
                      <span>
                        {message.topicGrounded
                          ? "Based on the current topic"
                          : "General answer"}
                        {message.provider ? ` · ${message.provider}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => speak(message.text, index)}
                        aria-label={
                          speakingMessage === index ? "Stop speech" : "Read answer aloud"
                        }
                        className="rounded p-1 transition hover:bg-neutral-900 hover:text-white"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <p className="flex items-center gap-2 text-xs text-neutral-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t.tutor.thinking}
                </p>
              )}
            </div>

            {!checkingSession && !user ? (
              <div className="border-t border-neutral-800 px-4 py-3 text-sm text-neutral-300">
                <p>Sign in to use the Virtual Tutor.</p>
                <Link
                  href="/auth/email"
                  onClick={closeTutor}
                  className="mt-2 inline-flex rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-neutral-200"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <form
                onSubmit={send}
                className="border-t border-neutral-800 p-3"
              >
                {error && (
                  <p
                    role="alert"
                    className="mb-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200"
                  >
                    {error}
                  </p>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    rows={2}
                    maxLength={8000}
                    placeholder={t.tutorPage.askPlaceholder(
                      topicSlug?.replaceAll("-", " ") ?? "Python"
                    )}
                    disabled={checkingSession || !user || sending}
                    className="min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-neutral-800 bg-black px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none disabled:opacity-50"
                  />
                  {speechAvailable && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (listening) {
                          recognitionRef.current?.stop();
                          return;
                        }
                        // Request the mic first: this shows the
                        // browser prompt and registers the
                        // Microphone permission for this site.
                        if (await requestMicPermission()) startListening();
                      }}
                      disabled={checkingSession || !user || sending}
                      aria-label={listening ? "Stop voice input" : "Start voice input"}
                      title={
                        listening
                          ? "Stop voice input"
                          : "Voice input starts only after you tap this button"
                      }
                      className={`h-11 w-11 shrink-0 rounded-xl border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                        listening
                          ? "border-red-500 bg-red-500/15 text-red-200"
                          : "border-neutral-800 bg-black text-neutral-300 hover:bg-neutral-900 hover:text-white"
                      }`}
                    >
                      {listening ? (
                        <MicOff className="mx-auto h-4 w-4" />
                      ) : (
                        <Mic className="mx-auto h-4 w-4" />
                      )}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={checkingSession || !user || sending || !input.trim()}
                    aria-label={t.tutor.askButton}
                    className="h-11 w-11 shrink-0 rounded-xl bg-white text-black transition hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40"
                  >
                    <Send className="mx-auto h-4 w-4" />
                  </button>
                </div>
                {listening && (
                  <p className="mt-2 text-[11px] text-neutral-500">
                    Audio recognition may be processed by your browser provider.
                    Nothing is sent to the tutor until you press Ask.
                  </p>
                )}
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
