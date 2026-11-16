// Server-only lookup into the generated transcript store
// (web/src/lib/transcripts.ts — the lesson videos' real captions,
// harvested once and shipped with the code, so the tutor never depends
// on YouTube answering at request time). Returns null when a lesson
// has no stored transcript; the /api/ai route then falls back to a
// live YouTube fetch for that lesson.

import { STORED_TRANSCRIPTS } from "./transcripts";
import type { Transcript } from "./transcript";

export function getStoredTranscript(lessonId: string): Transcript | null {
  const entry = STORED_TRANSCRIPTS[lessonId];
  if (
    !entry ||
    typeof entry.text !== "string" ||
    !entry.text.trim()
  ) {
    return null;
  }
  return {
    text: entry.text,
    language: typeof entry.language === "string" ? entry.language : "hi-Latn",
    truncated: false,
    hasTimestamps: true,
  };
}
