"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Mic, MicOff, Send, Volume2, X } from "lucide-react";
import { fetchSessionUser, type SessionUser } from "@/lib/auth-client";
import { useLanguage, type LanguageCode } from "@/lib/i18n";
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

const STRANDS_COLORS = [
  "#afafaf",
  "#afafaf",
  "#000000",
  "#000000",
  "#afafaf",
  "#afafaf",
  "#afafaf",
];

export function VirtualTutor() {
  const { lang, t } = useLanguage();
  const pathname = usePathname();
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
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

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
      recognitionRef.current?.abort();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    []
  );

  function stopSpeech() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeakingMessage(null);
  }

  function closeTutor() {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setListening(false);
    stopSpeech();
    setOpen(false);
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
    const recognition = new Recognition();
    recognition.lang = SPEECH_LOCALES[lang] ?? navigator.language ?? "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
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
      if (event.error !== "aborted") {
        setError("Voice input stopped. You can retry or type your question.");
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setError("Could not start voice input. Check microphone permission or type instead.");
    }
  }

  function speak(text: string, index: number) {
    if (!("speechSynthesis" in window)) {
      setError("Speech playback is not supported in this browser.");
      return;
    }
    if (speakingMessage === index) {
      stopSpeech();
      return;
    }
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LOCALES[lang] ?? navigator.language ?? "en-IN";
    utterance.onstart = () => setSpeakingMessage(index);
    utterance.onend = () => setSpeakingMessage(null);
    utterance.onerror = () => setSpeakingMessage(null);
    window.speechSynthesis.speak(utterance);
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || sending || !user) return;
    setError(null);
    setInput("");
    const history = messages.slice(-4).map(({ role, text }) => ({ role, text }));
    setMessages((current) => [...current, { role: "user", text: question }]);
    setSending(true);
    try {
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
      if (response.status === 401) {
        setError(t.tutor.errorSessionExpired);
        setMessages((current) => current.slice(0, -1));
        setInput(question);
        return;
      }
      if (
        !response.ok ||
        typeof data !== "object" ||
        data === null ||
        !("reply" in data) ||
        typeof data.reply !== "string" ||
        !data.reply.trim()
      ) {
        setError(
          typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
            ? data.error
            : t.tutor.errorGeneric
        );
        setMessages((current) => current.slice(0, -1));
        setInput(question);
        return;
      }
      const message: TutorMessage = {
        role: "assistant",
        text: data.reply.trim(),
        provider:
          "provider" in data && typeof data.provider === "string"
            ? data.provider
            : undefined,
        topicGrounded:
          "topicGrounded" in data && data.topicGrounded === true,
      };
      setMessages((current) => [...current, message]);
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
          onClick={() => setOpen(true)}
          aria-label={t.common.aiTutor}
          aria-haspopup="dialog"
          className="fixed bottom-24 right-4 z-[80] h-16 w-16 overflow-hidden rounded-full border border-neutral-700 bg-black shadow-[0_0_32px_rgba(175,175,175,0.28)] transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:bottom-6 sm:right-6"
        >
          <Strands
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
            glassSize={0.5}
            rim={0.7}
            dispersion={0}
            maxDevicePixelRatio={1.5}
          />
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
                listening={listening || sending || speakingMessage !== null}
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
                glassSize={0.5}
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
                    content. Ask a question, or use the microphone to dictate
                    one.
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    This conversation is kept in this page session only. Voice
                    recognition starts only after you tap the microphone and
                    depends on your browser.
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
                      onClick={() => {
                        if (listening) {
                          recognitionRef.current?.stop();
                        } else {
                          startListening();
                        }
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
