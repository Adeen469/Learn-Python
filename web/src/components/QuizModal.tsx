"use client";

import { useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import type { Lesson } from "@/lib/catalog";

// Pass mark for a lesson test. Passing unlocks the next lesson (the 95%
// watch path stays as the alternative). A test pass does NOT credit watch
// minutes — today's progress only counts minutes actually watched.
export const QUIZ_PASS_FRACTION = 0.7;

interface QuizModalProps {
  lesson: Lesson;
  onClose: () => void;
  onPass: (lessonId: string) => void;
}

export function QuizModal({ lesson, onClose, onPass }: QuizModalProps) {
  const questions = lesson.quiz ?? [];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.filter((q, i) => answers[i] === q.answer).length;
  const passed = submitted && questions.length > 0 && score / questions.length >= QUIZ_PASS_FRACTION;
  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  function handleSubmit() {
    if (!allAnswered) return;
    setSubmitted(true);
  }

  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center">
      <div className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-neutral-500">Test</p>
            <h2 className="mt-1 text-base font-semibold text-white">{lesson.title}</h2>
            <p className="mt-1 text-xs text-neutral-400">
              Score {Math.round(QUIZ_PASS_FRACTION * 100)}% or more to unlock the next lesson.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close test"
            className="shrink-0 rounded-lg border border-neutral-800 bg-black p-1.5 text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {questions.map((q, qi) => {
            const picked = answers[qi];
            const isCorrect = submitted && picked === q.answer;
            const isWrong = submitted && picked !== undefined && picked !== q.answer;
            return (
              <div key={qi}>
                <p className="text-sm font-medium text-white">
                  {qi + 1}. {q.question}
                </p>
                <div className="mt-2 space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = picked === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                        className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                          submitted && oi === q.answer
                            ? "border-green-500 bg-green-500/10 text-white"
                            : isWrong && selected
                              ? "border-red-500 bg-red-500/10 text-white"
                              : selected
                                ? "border-white bg-neutral-900 text-white"
                                : "border-neutral-800 bg-black text-neutral-300 hover:border-neutral-600"
                        }`}
                      >
                        {submitted && oi === q.answer ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                        ) : isWrong && selected ? (
                          <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                        ) : (
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-neutral-600 text-[10px] text-neutral-400">
                            {String.fromCharCode(65 + oi)}
                          </span>
                        )}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {isWrong && (
                  <p className="mt-1.5 text-xs text-red-400">
                    Correct answer: {q.options[q.answer]}
                  </p>
                )}
                {isCorrect && (
                  <p className="mt-1.5 text-xs text-green-400">Correct</p>
                )}
              </div>
            );
          })}
        </div>

        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="mt-5 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit test
          </button>
        ) : passed ? (
          <div className="mt-5 rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-center">
            <p className="text-sm font-semibold text-green-400">
              Passed — {score}/{questions.length} correct
            </p>
            <p className="mt-1 text-xs text-neutral-300">
              The next lesson is now unlocked.
            </p>
            <button
              type="button"
              onClick={() => {
                onPass(lesson.id);
                onClose();
              }}
              className="mt-3 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200"
            >
              Continue to next lesson
            </button>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-center">
            <p className="text-sm font-semibold text-red-400">
              Not passed — {score}/{questions.length} correct
            </p>
            <p className="mt-1 text-xs text-neutral-300">
              You need {Math.round(QUIZ_PASS_FRACTION * 100)}% to unlock the next lesson. Review the
              answers above and try again.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleRetry}
                className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-neutral-700 bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-900"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
