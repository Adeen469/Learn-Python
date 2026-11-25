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

// Microphone-permission errors for the Virtual Tutor.
// Pure helpers — mirrored by tests/virtual-tutor-voice.test.mjs.
export const MIC_DENIED_MESSAGE =
  "Microphone access is blocked for this site. Tap the lock icon in the address bar, open Site permissions, set Microphone to Allow, then tap the microphone again.";

export function isMicPermissionError(error?: string): boolean {
  return error === "not-allowed" || error === "service-not-allowed";
}

// One message per SpeechRecognition error; null means "show nothing"
// (aborted is a deliberate stop, not an error).
export function voiceErrorMessage(error?: string): string | null {
  if (!error || error === "aborted") return null;
  if (isMicPermissionError(error)) return MIC_DENIED_MESSAGE;
  if (error === "audio-capture") {
    return "No microphone was found, or it is in use by another app. Check your microphone and try again.";
  }
  if (error === "network") {
    return "Voice service is unreachable. Check your connection or type your question.";
  }
  if (error === "no-speech") {
    return "Didn't hear anything. Try again or type your question.";
  }
  return "Voice input stopped. You can retry or type your question.";
}
