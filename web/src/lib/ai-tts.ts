// Server-side TTS helpers for the Virtual Tutor (Gemini TTS).
// Pure functions — mirrored by tests/virtual-tutor-voice.test.mjs.
// The Gemini TTS model returns raw PCM (16-bit, mono, 24 kHz);
// wrapPcmInWav puts a standard 44-byte WAV header around it so a
// plain <audio> element can play it. No key is ever read here —
// the route owns the key and never echoes it anywhere.

export const TTS_MODEL = "gemini-2.5-flash-preview-tts";
export const TTS_VOICE = "Sulafat";
export const TTS_MAX_CHARS = 1000;
export const TTS_TIMEOUT_MS = 15000;
export const TTS_SAMPLE_RATE_HZ = 24000;

export type TtsBodyValidation =
  | { ok: true; body: { text: string; lang?: string } }
  | { ok: false; error: string };

export function validateTtsBody(rawBody: unknown): TtsBodyValidation {
  if (typeof rawBody !== "object" || rawBody === null || Array.isArray(rawBody)) {
    return { ok: false, error: "Request body must be an object." };
  }
  const { text, lang } = rawBody as { text?: unknown; lang?: unknown };
  if (typeof text !== "string" || !text.trim()) {
    return { ok: false, error: "Text is required." };
  }
  if (text.length > TTS_MAX_CHARS) {
    return { ok: false, error: `Text must be ${TTS_MAX_CHARS} characters or less.` };
  }
  if (lang !== undefined && typeof lang !== "string") {
    return { ok: false, error: "Language must be a string." };
  }
  return { ok: true, body: { text, ...(lang ? { lang } : {}) } };
}

// Make a tutor reply speakable: code fences become a short spoken
// aside, backticks go, whitespace collapses, and the result is
// capped at TTS_MAX_CHARS (a hard cut never splits mid-word badly
// enough to matter — the route validates length first anyway).
export function stripForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " Code example. ")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, TTS_MAX_CHARS);
}

// Wrap raw PCM (signed 16-bit little-endian, mono, 24 kHz) in a
// minimal 44-byte WAV header. Returns a Buffer the route can send
// as audio/wav.
export function wrapPcmInWav(pcm: Buffer): Buffer {
  const dataSize = pcm.length;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(TTS_SAMPLE_RATE_HZ, 24);
  header.writeUInt32LE(TTS_SAMPLE_RATE_HZ * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36, "ascii");
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]);
}

// Pull the base64 PCM audio out of a Gemini generateContent
// response. Returns null on any unexpected shape — the caller
// treats that as a failed TTS attempt and falls back to the
// browser voice.
export function extractTtsAudio(body: unknown): Buffer | null {
  if (typeof body !== "object" || body === null) return null;
  const candidates = (body as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const content = (candidates[0] as { content?: unknown })?.content;
  if (typeof content !== "object" || content === null) return null;
  const parts = (content as { parts?: unknown }).parts;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const inlineData = (parts[0] as { inlineData?: unknown })?.inlineData;
  if (typeof inlineData !== "object" || inlineData === null) return null;
  const data = (inlineData as { data?: unknown }).data;
  if (typeof data !== "string" || !data) return null;
  return Buffer.from(data, "base64");
}
