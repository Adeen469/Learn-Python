// Wake-word matching for the Virtual Tutor.
// Pure function — mirrored by tests/virtual-tutor-voice.test.mjs.
// The tutor listens (in the browser, only while the toggle is on)
// for either default phrase; a match opens the tutor panel and
// starts dictation. Matching is a case-insensitive substring
// check on a normalised transcript, so "hey virtual tutor" and
// "virtual assistant please" both fire.

export const WAKE_PHRASES = ["virtual assistant", "virtual tutor"] as const;

export function normalizeTranscript(transcript: string): string {
  return transcript.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

export function matchesWakeWord(transcript: string): boolean {
  const normalized = normalizeTranscript(transcript);
  if (!normalized) return false;
  return WAKE_PHRASES.some((phrase) => normalized.includes(phrase));
}
