import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const testRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const readSrc = (p) => readFileSync(join(testRoot, p), "utf8");

// Inline mirrors of web/src/lib/ai-tts.ts and
// web/src/lib/tutor-wake.ts for zero-build node --test
// verification (no TS imports in tests).

const TTS_MODEL = "gemini-2.5-flash-preview-tts";
const TTS_VOICE = "Sulafat";
const TTS_MAX_CHARS = 1000;
const TTS_TIMEOUT_MS = 15000;
const TTS_SAMPLE_RATE_HZ = 24000;

function validateTtsBody(rawBody) {
  if (typeof rawBody !== "object" || rawBody === null || Array.isArray(rawBody)) {
    return { ok: false, error: "Request body must be an object." };
  }
  const { text, lang } = rawBody;
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

function stripForSpeech(text) {
  return text
    .replace(/```[\s\S]*?```/g, " Code example. ")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, TTS_MAX_CHARS);
}

function wrapPcmInWav(pcm) {
  const dataSize = pcm.length;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(TTS_SAMPLE_RATE_HZ, 24);
  header.writeUInt32LE(TTS_SAMPLE_RATE_HZ * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]);
}

function extractTtsAudio(body) {
  if (typeof body !== "object" || body === null) return null;
  const candidates = body.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const content = candidates[0]?.content;
  if (typeof content !== "object" || content === null) return null;
  const parts = content.parts;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const inlineData = parts[0]?.inlineData;
  if (typeof inlineData !== "object" || inlineData === null) return null;
  const data = inlineData.data;
  if (typeof data !== "string" || !data) return null;
  return Buffer.from(data, "base64");
}

const WAKE_PHRASES = ["virtual assistant", "virtual tutor"];

function normalizeTranscript(transcript) {
  return transcript.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

function matchesWakeWord(transcript) {
  const normalized = normalizeTranscript(transcript);
  if (!normalized) return false;
  return WAKE_PHRASES.some((phrase) => normalized.includes(phrase));
}

// The mirrors above must match the TS source exactly — a drift
// here means the route/client and the tests disagree.
test("TTS mirror: constants match src/lib/ai-tts.ts", () => {
  const src = readSrc("src/lib/ai-tts.ts");
  assert.ok(src.includes(`TTS_MODEL = "${TTS_MODEL}"`));
  assert.ok(src.includes(`TTS_VOICE = "${TTS_VOICE}"`));
  assert.ok(src.includes("TTS_MAX_CHARS = 1000"));
  assert.ok(src.includes("TTS_TIMEOUT_MS = 15000"));
  assert.ok(src.includes("TTS_SAMPLE_RATE_HZ = 24000"));
  assert.equal(TTS_TIMEOUT_MS, 15000);
});

test("Wake mirror: phrases match src/lib/tutor-wake.ts", () => {
  const src = readSrc("src/lib/tutor-wake.ts");
  assert.ok(src.includes('"virtual assistant"'));
  assert.ok(src.includes('"virtual tutor"'));
  assert.deepEqual([...WAKE_PHRASES], ["virtual assistant", "virtual tutor"]);
});

test("validateTtsBody accepts a plain text body", () => {
  const result = validateTtsBody({ text: "Hello there." });
  assert.equal(result.ok, true);
  assert.equal(result.body.text, "Hello there.");
});

test("validateTtsBody accepts an optional string lang", () => {
  const result = validateTtsBody({ text: "Hi.", lang: "en-IN" });
  assert.equal(result.ok, true);
  assert.equal(result.body.lang, "en-IN");
});

test("validateTtsBody rejects non-objects, empty text and bad lang", () => {
  assert.equal(validateTtsBody(null).ok, false);
  assert.equal(validateTtsBody("hello").ok, false);
  assert.equal(validateTtsBody([]).ok, false);
  assert.equal(validateTtsBody({}).ok, false);
  assert.equal(validateTtsBody({ text: "   " }).ok, false);
  assert.equal(validateTtsBody({ text: "Hi.", lang: 42 }).ok, false);
});

test("validateTtsBody rejects text over 1000 chars", () => {
  assert.equal(validateTtsBody({ text: "x".repeat(1001) }).ok, false);
  assert.equal(validateTtsBody({ text: "x".repeat(1000) }).ok, true);
});

test("stripForSpeech turns code fences into a spoken aside", () => {
  assert.equal(
    stripForSpeech("Here is how:\n```python\nprint(1)\n```\nDone."),
    "Here is how: Code example. Done."
  );
});

test("stripForSpeech strips backticks and collapses whitespace", () => {
  assert.equal(stripForSpeech("Use  `print()`\n\n  to  show it."), "Use print() to show it.");
});

test("stripForSpeech caps at 1000 chars", () => {
  assert.equal(stripForSpeech("y".repeat(1500)).length, 1000);
});

test("wrapPcmInWav builds a 44-byte RIFF/WAVE PCM header", () => {
  const pcm = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]);
  const wav = wrapPcmInWav(pcm);
  assert.equal(wav.length, 44 + pcm.length);
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.readUInt32LE(4), 36 + pcm.length);
  assert.equal(wav.toString("ascii", 8, 12), "WAVE");
  assert.equal(wav.toString("ascii", 12, 16), "fmt ");
  assert.equal(wav.readUInt16LE(20), 1); // PCM
  assert.equal(wav.readUInt16LE(22), 1); // mono
  assert.equal(wav.readUInt32LE(24), 24000);
  assert.equal(wav.readUInt16LE(34), 16); // bits per sample
  assert.equal(wav.toString("ascii", 36, 40), "data");
  assert.equal(wav.readUInt32LE(40), pcm.length);
  assert.deepEqual([...wav.subarray(44)], [...pcm]);
});

test("extractTtsAudio pulls base64 PCM from a Gemini response", () => {
  const pcm = Buffer.from([10, 20, 30, 40]);
  const body = {
    candidates: [
      { content: { parts: [{ inlineData: { data: pcm.toString("base64") } }] } },
    ],
  };
  assert.deepEqual(extractTtsAudio(body), pcm);
});

test("extractTtsAudio returns null on any bad shape", () => {
  assert.equal(extractTtsAudio(null), null);
  assert.equal(extractTtsAudio({}), null);
  assert.equal(extractTtsAudio({ candidates: [] }), null);
  assert.equal(extractTtsAudio({ candidates: [{}] }), null);
  assert.equal(extractTtsAudio({ candidates: [{ content: { parts: [] } }] }), null);
  assert.equal(
    extractTtsAudio({ candidates: [{ content: { parts: [{ inlineData: {} }] } }] }),
    null
  );
  assert.equal(
    extractTtsAudio({ candidates: [{ content: { parts: [{ inlineData: { data: "" } }] } }] }),
    null
  );
});

test("matchesWakeWord fires on either default phrase", () => {
  assert.equal(matchesWakeWord("Hey Virtual Tutor"), true);
  assert.equal(matchesWakeWord("virtual assistant please"), true);
  assert.equal(matchesWakeWord("VIRTUAL TUTOR, explain sets"), true);
  assert.equal(matchesWakeWord("ok virtual assistant"), true);
});

test("matchesWakeWord ignores anything else", () => {
  assert.equal(matchesWakeWord("hello world"), false);
  assert.equal(matchesWakeWord(""), false);
  assert.equal(matchesWakeWord("   "), false);
  assert.equal(matchesWakeWord("virtual"), false);
  assert.equal(matchesWakeWord("assistant"), false);
  assert.equal(matchesWakeWord("tutor me python"), false);
});

const MIC_DENIED_MESSAGE =
  "Microphone access is blocked for this site. Tap the lock icon in the address bar, open Site permissions, set Microphone to Allow, then tap the microphone again.";

function isMicPermissionError(error) {
  return error === "not-allowed" || error === "service-not-allowed";
}

function voiceErrorMessage(error) {
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

test("Mic mirror: denied message matches src/lib/tutor-wake.ts", () => {
  const src = readSrc("src/lib/tutor-wake.ts");
  assert.ok(src.includes(MIC_DENIED_MESSAGE));
  assert.ok(src.includes("export function isMicPermissionError"));
  assert.ok(src.includes("export function voiceErrorMessage"));
});

test("isMicPermissionError flags only permission denials", () => {
  assert.equal(isMicPermissionError("not-allowed"), true);
  assert.equal(isMicPermissionError("service-not-allowed"), true);
  assert.equal(isMicPermissionError("network"), false);
  assert.equal(isMicPermissionError("no-speech"), false);
  assert.equal(isMicPermissionError("aborted"), false);
  assert.equal(isMicPermissionError(undefined), false);
});

test("voiceErrorMessage returns null for aborted / missing errors", () => {
  assert.equal(voiceErrorMessage("aborted"), null);
  assert.equal(voiceErrorMessage(undefined), null);
  assert.equal(voiceErrorMessage(""), null);
});

test("voiceErrorMessage maps each recognition error", () => {
  assert.equal(voiceErrorMessage("not-allowed"), MIC_DENIED_MESSAGE);
  assert.equal(voiceErrorMessage("service-not-allowed"), MIC_DENIED_MESSAGE);
  assert.equal(
    voiceErrorMessage("audio-capture"),
    "No microphone was found, or it is in use by another app. Check your microphone and try again."
  );
  assert.equal(
    voiceErrorMessage("network"),
    "Voice service is unreachable. Check your connection or type your question."
  );
  assert.equal(
    voiceErrorMessage("no-speech"),
    "Didn't hear anything. Try again or type your question."
  );
  assert.equal(
    voiceErrorMessage("bad-device"),
    "Voice input stopped. You can retry or type your question."
  );
});

test("Mic permission: site allows microphone and requests it on gesture", () => {
  const config = readSrc("next.config.ts");
  assert.ok(config.includes("microphone=(self)"));
  assert.equal(config.includes("microphone=()"), false);
  const tutor = readSrc("src/components/VirtualTutor.tsx");
  assert.ok(tutor.includes("getUserMedia({ audio: true })"));
  assert.ok(tutor.includes("navigator.permissions"));
  assert.ok(tutor.includes('"microphone"'));
  assert.ok(tutor.includes("requestMicPermission()"));
});
