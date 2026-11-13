"use client";

import { useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import type { Lesson } from "@/lib/catalog";

// AI tutor chat tied to one lesson. History lives only in this
// component's state (never stored server-side); the route caps it at
// the last 8 turns. The parent renders it with key={lesson.id} so the
// chat resets when the lesson changes.

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface AiTutorProps {
  lesson: Lesson;
}

export function AiTutor({ lesson }: AiTutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;
    setError(null);
    setInput("");
    const history = messages.slice(-8);
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setSending(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "tutor",
          lessonId: lesson.id,
          question,
          history,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (res.status === 503) {
        setUnavailable(true);
        setMessages((prev) => prev.slice(0, -1));
        setInput(question);
        return;
      }
      if (res.status === 401) {
        setError("Your session expired — please sign in again.");
        setMessages((prev) => prev.slice(0, -1));
        setInput(question);
        return;
      }
      if (!res.ok || typeof data !== "object" || data === null) {
        setError("Something went wrong — please try again.");
        setMessages((prev) => prev.slice(0, -1));
        setInput(question);
        return;
      }
      const reply = (data as { reply?: unknown }).reply;
      if (typeof reply !== "string" || !reply.trim()) {
        setError("The AI returned an empty reply — please try again.");
        setMessages((prev) => prev.slice(0, -1));
        setInput(question);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", text: reply.trim() }]);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      });
    } catch {
      setError("Could not reach the AI — check your connection and try again.");
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-white" />
        <h2 className="text-sm font-semibold text-white">Ask AI about this lesson</h2>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-neutral-400">
        Doubts, explanations, examples — in Hindi or English. The AI only
        knows this lesson and Python, and its answers are not stored anywhere.
      </p>

      {unavailable ? (
        <div className="mt-3 rounded-lg border border-neutral-800 bg-black px-4 py-3 text-xs leading-relaxed text-neutral-300">
          AI is not available right now — the API keys are not configured yet.
          The rest of the course works normally.
        </div>
      ) : (
        <>
          {messages.length > 0 && (
            <div
              ref={listRef}
              className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-8 bg-white text-black"
                      : "mr-8 border border-neutral-800 bg-black text-neutral-200"
                  }`}
                >
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-60">
                    {m.role === "user" ? "You" : "AI Tutor"}
                  </p>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              ))}
              {sending && (
                <p className="flex items-center gap-2 text-xs text-neutral-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> AI is thinking…
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          )}

          <form onSubmit={send} className="mt-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about "${lesson.title.slice(0, 40)}${lesson.title.length > 40 ? "…" : ""}"`}
              disabled={sending}
              className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-black px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-white focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-200 transition disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> Ask
            </button>
          </form>
        </>
      )}
    </div>
  );
}
