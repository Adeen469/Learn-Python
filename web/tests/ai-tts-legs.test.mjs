import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const testRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const readSrc = (p) => readFileSync(join(testRoot, p), "utf8");

// Inline mirrors of web/src/lib/ai-tts-legs.ts for zero-build
// node --test verification (no TS imports in tests). The
// source-consistency tests at the bottom pin the TS source to the
// same constants, so a drift between the mirror and the real leg
// fails the suite.

const FALLBACK_LEG_TIMEOUT_MS = 8000;
const KOKORO_TIMEOUT_MS = 12000;
const EDGE_TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D68F";
const EDGE_CHROMIUM_VERSION = "143.0.3650.75";
const KOKORO_VOICE = "af_heart";
const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";
const SARVAM_MODEL = "bulbul:v2";
const DEEPGRAM_TTS_URL =
  "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=mp3";

function detectSpeechLang(text, lang) {
  if (lang) {
    const l = lang.toLowerCase();
    if (l.startsWith("hi") || l.startsWith("mr")) return "hi";
    if (l.startsWith("ur")) return "ur";
    if (l.startsWith("en")) return "en";
  }
  if (/[\u0600-\u06FF]/.test(text)) return "ur";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
}

function ttsLegsForLang(lang) {
  if (lang === "hi") return ["edge", "sarvam"];
  if (lang === "ur") return ["edge"];
  return ["edge", "kokoro", "deepgram", "sarvam"];
}

function edgeVoiceForLang(lang) {
  if (lang === "hi") return "hi-IN-SwaraNeural";
  if (lang === "ur") return "ur-PK-UzmaNeural";
  return "en-IN-NeerjaNeural";
}

function edgeSsml(text, voice) {
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return (
    "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>" +
    `<voice name='${voice}'><prosody pitch='+0Hz' rate='+0%' volume='+0%'>${esc}</prosody></voice></speak>`
  );
}

const EDGE_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EDGE_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function edgeDateString(date = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${EDGE_DAYS[date.getUTCDay()]} ${EDGE_MONTHS[date.getUTCMonth()]} ${p(date.getUTCDate())} ` +
    `${date.getUTCFullYear()} ${p(date.getUTCHours())}:${p(date.getUTCMinutes())}:${p(date.getUTCSeconds())} ` +
    "GMT+0000 (Coordinated Universal Time)"
  );
}

function edgeSecMsGec(nowMs = Date.now()) {
  const ticks =
    Math.floor((Math.floor(nowMs / 1000) + 11644473600) / 300) * 300 * 10_000_000;
  return createHash("sha256")
    .update(`${ticks}${EDGE_TRUSTED_CLIENT_TOKEN}`)
    .digest("hex")
    .toUpperCase();
}

function parseEdgeMessage(data) {
  if (typeof data === "string") {
    const m = data.match(/^Path:([^\r\n]+)/m);
    if (!m) return null;
    const path = m[1].trim();
    if (path === "turn.end") return { kind: "turn.end" };
    return { kind: "other", path };
  }
  if (data.length < 2) return null;
  const headerLength = data.readUInt16BE(0);
  if (headerLength <= 0 || headerLength > data.length) return null;
  const headerText = data.subarray(2, 2 + headerLength).toString("utf-8");
  const pathMatch = headerText.match(/^Path:([^\r\n]+)/m);
  if (!pathMatch || pathMatch[1].trim() !== "audio") return null;
  const audio = data.subarray(2 + headerLength);
  if (audio.length === 0) return null;
  return { kind: "audio", audio: Buffer.from(audio) };
}

function kokoroAudioUrlFromResult(result, baseUrl) {
  if (typeof result !== "object" || result === null) return null;
  const data = result.data;
  const first = Array.isArray(data)
    ? data[0]
    : typeof data === "object" && data !== null
      ? data[0]
      : undefined;
  if (typeof first !== "object" || first === null) return null;
  const url = first.url;
  if (typeof url !== "string" || !url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return baseUrl.replace(/\/$/, "") + (url.startsWith("/") ? url : `/${url}`);
}

function sarvamSpeakerForLang(lang) {
  return lang === "hi" ? "anushka" : "ritu";
}

function sarvamTargetLang(lang) {
  return lang === "hi" ? "hi-IN" : "en-IN";
}

async function callSarvamTts(text, lang, apiKey, timeoutMs = FALLBACK_LEG_TIMEOUT_MS, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(SARVAM_TTS_URL, {
      method: "POST",
      headers: { "api-subscription-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: sarvamTargetLang(lang),
        speaker: sarvamSpeakerForLang(lang),
        pace: 1,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: SARVAM_MODEL,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    const b64 = Array.isArray(body?.audios) ? body.audios[0] : undefined;
    if (typeof b64 !== "string" || !b64) return null;
    const buf = Buffer.from(b64, "base64");
    return buf.length ? { audio: buf, contentType: "audio/wav" } : null;
  } catch {
    return null;
  }
}

async function callDeepgramTts(text, apiKey, timeoutMs = FALLBACK_LEG_TIMEOUT_MS, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(DEEPGRAM_TTS_URL, {
      method: "POST",
      headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length ? { audio: buf, contentType: "audio/mpeg" } : null;
  } catch {
    return null;
  }
}

// A leg with no env must never touch the network — the caller
// skips it. (Mirrors callTtsLeg's guards; the route passes env
// from process.env, which is empty in tests.)
async function callTtsLeg(leg, text, lang, env, fetchImpl = fetch) {
  if (leg === "edge") return null; // WebSocket leg — not stubbed here.
  if (leg === "kokoro") {
    if (!env.kokoroTtsUrl) return null;
    return null;
  }
  if (leg === "deepgram") {
    if (!env.deepgramApiKey) return null;
    return callDeepgramTts(text, env.deepgramApiKey, FALLBACK_LEG_TIMEOUT_MS, fetchImpl);
  }
  if (!env.sarvamApiKey) return null;
  return callSarvamTts(text, lang, env.sarvamApiKey, FALLBACK_LEG_TIMEOUT_MS, fetchImpl);
}

test("detectSpeechLang: script detection", () => {
  assert.equal(detectSpeechLang("Hello, how are you?"), "en");
  assert.equal(detectSpeechLang("नमस्ते, कैसे हो?"), "hi");
  assert.equal(detectSpeechLang("मैं पायथन सीख रहा हूँ"), "hi");
  assert.equal(detectSpeechLang("السلام علیکم، کیسے ہیں؟"), "ur");
  assert.equal(detectSpeechLang(""), "en");
});

test("detectSpeechLang: explicit lang wins", () => {
  assert.equal(detectSpeechLang("hello", "hi-roman"), "hi");
  assert.equal(detectSpeechLang("hello", "mr"), "hi");
  assert.equal(detectSpeechLang("hello", "ur-PK"), "ur");
  assert.equal(detectSpeechLang("hello", "en-IN"), "en");
  // Script still wins when the lang is unknown.
  assert.equal(detectSpeechLang("नमस्ते", "xx"), "hi");
});

test("ttsLegsForLang: order and language scoping", () => {
  assert.deepEqual(ttsLegsForLang("en"), ["edge", "kokoro", "deepgram", "sarvam"]);
  assert.deepEqual(ttsLegsForLang("hi"), ["edge", "sarvam"]);
  assert.deepEqual(ttsLegsForLang("ur"), ["edge"]);
  // Kokoro and Deepgram are English-only; Sarvam is Indian-only.
  assert.ok(!ttsLegsForLang("hi").includes("kokoro"));
  assert.ok(!ttsLegsForLang("hi").includes("deepgram"));
  assert.ok(!ttsLegsForLang("ur").includes("sarvam"));
});

test("edgeVoiceForLang: one neural voice per language", () => {
  assert.equal(edgeVoiceForLang("en"), "en-IN-NeerjaNeural");
  assert.equal(edgeVoiceForLang("hi"), "hi-IN-SwaraNeural");
  assert.equal(edgeVoiceForLang("ur"), "ur-PK-UzmaNeural");
});

test("edgeSsml: voice + XML escaping", () => {
  const ssml = edgeSsml("a & b <c> d", "en-IN-NeerjaNeural");
  assert.ok(ssml.includes("name='en-IN-NeerjaNeural'"));
  assert.ok(ssml.includes("a &amp; b &lt;c&gt; d"));
  assert.ok(!ssml.includes("a & b"));
  assert.ok(ssml.startsWith("<speak "));
  assert.ok(ssml.includes("<prosody"));
});

test("edgeDateString: JS-style UTC format", () => {
  assert.equal(
    edgeDateString(new Date("2026-11-26T02:23:21.000Z")),
    "Thu Nov 26 2026 02:23:21 GMT+0000 (Coordinated Universal Time)"
  );
});

test("edgeSecMsGec: 64-char uppercase hex, stable within a 5-minute window", () => {
  // Anchor mid-window so +60s cannot cross a window boundary.
  const windowStart = Math.floor(Date.now() / 300_000) * 300_000;
  const mid = windowStart + 150_000;
  const a = edgeSecMsGec(mid);
  const b = edgeSecMsGec(mid + 60_000);
  assert.match(a, /^[0-9A-F]{64}$/);
  assert.equal(a, b);
  // Exactly one window later gives a different token.
  assert.notEqual(a, edgeSecMsGec(mid + 300_000));
});

test("parseEdgeMessage: binary audio frame", () => {
  const headers = Buffer.from("Path:audio\r\n\r\n", "utf-8");
  const mp3 = Buffer.from([0xff, 0xfb, 0x90, 0x00, 0x01, 0x02]);
  const len = Buffer.alloc(2);
  len.writeUInt16BE(headers.length);
  const frame = Buffer.concat([len, headers, mp3]);
  const parsed = parseEdgeMessage(frame);
  assert.equal(parsed.kind, "audio");
  assert.deepEqual(parsed.audio, mp3);
});

test("parseEdgeMessage: text frames and garbage", () => {
  assert.deepEqual(parseEdgeMessage("Path:turn.end\r\n\r\n"), { kind: "turn.end" });
  assert.deepEqual(parseEdgeMessage("Path:turn.start\r\n\r\n"), { kind: "other", path: "turn.start" });
  assert.equal(parseEdgeMessage("hello"), null);
  assert.equal(parseEdgeMessage(Buffer.alloc(0)), null);
  // Binary frame whose path is not audio is ignored.
  const headers = Buffer.from("Path:response\r\n\r\n", "utf-8");
  const len = Buffer.alloc(2);
  len.writeUInt16BE(headers.length);
  assert.equal(parseEdgeMessage(Buffer.concat([len, headers, Buffer.from([1])])), null);
});

test("kokoroAudioUrlFromResult: absolute, relative, and bad shapes", () => {
  const base = "https://adeen469-kokoro-tts.hf.space";
  const abs = kokoroAudioUrlFromResult(
    { data: [{ url: "https://cdn.hf.co/gradio_api/file=/tmp/audio.wav" }, "phonemes"] },
    base
  );
  assert.equal(abs, "https://cdn.hf.co/gradio_api/file=/tmp/audio.wav");
  // The real Gradio client returns an array-like object with
  // numeric keys, not a true array.
  const like = kokoroAudioUrlFromResult(
    { data: { 0: { url: "https://cdn.hf.co/x.wav" }, 1: "" } },
    base
  );
  assert.equal(like, "https://cdn.hf.co/x.wav");
  assert.equal(
    kokoroAudioUrlFromResult({ data: [{ url: "/gradio_api/file=/tmp/a.wav" }] }, base),
    `${base}/gradio_api/file=/tmp/a.wav`
  );
  assert.equal(kokoroAudioUrlFromResult({ data: [] }, base), null);
  assert.equal(kokoroAudioUrlFromResult({ data: [{ path: "/tmp/a.wav" }] }, base), null);
  assert.equal(kokoroAudioUrlFromResult(null, base), null);
});

test("sarvam: speaker and target language per lang", () => {
  assert.equal(sarvamSpeakerForLang("hi"), "anushka");
  assert.equal(sarvamSpeakerForLang("en"), "ritu");
  assert.equal(sarvamTargetLang("hi"), "hi-IN");
  assert.equal(sarvamTargetLang("en"), "en-IN");
});

test("callSarvamTts: request shape and base64 wav", async () => {
  const seen = {};
  const stubFetch = async (url, init) => {
    seen.url = url;
    seen.init = init;
    return {
      ok: true,
      json: async () => ({ audios: [Buffer.from("RIFFxxxx", "utf-8").toString("base64")] }),
    };
  };
  const out = await callSarvamTts("नमस्ते", "hi", "test-key", FALLBACK_LEG_TIMEOUT_MS, stubFetch);
  assert.equal(seen.url, SARVAM_TTS_URL);
  assert.equal(seen.init.method, "POST");
  assert.equal(seen.init.headers["api-subscription-key"], "test-key");
  const body = JSON.parse(seen.init.body);
  assert.deepEqual(body.inputs, ["नमस्ते"]);
  assert.equal(body.target_language_code, "hi-IN");
  assert.equal(body.speaker, "anushka");
  assert.equal(body.model, SARVAM_MODEL);
  assert.equal(out.contentType, "audio/wav");
  assert.equal(out.audio.toString("utf-8"), "RIFFxxxx");
});

test("callSarvamTts: failure paths return null", async () => {
  const failFetch = async () => ({ ok: false, status: 402, json: async () => ({}) });
  assert.equal(await callSarvamTts("hi", "en", "k", FALLBACK_LEG_TIMEOUT_MS, failFetch), null);
  const badFetch = async () => ({ ok: true, json: async () => ({ audios: [] }) });
  assert.equal(await callSarvamTts("hi", "en", "k", FALLBACK_LEG_TIMEOUT_MS, badFetch), null);
  const throwFetch = async () => {
    throw new Error("network down");
  };
  assert.equal(await callSarvamTts("hi", "en", "k", FALLBACK_LEG_TIMEOUT_MS, throwFetch), null);
});

test("callDeepgramTts: request shape and mp3 bytes", async () => {
  const seen = {};
  const stubFetch = async (url, init) => {
    seen.url = url;
    seen.init = init;
    return { ok: true, arrayBuffer: async () => new Uint8Array([0xff, 0xfb, 0x90]).buffer };
  };
  const out = await callDeepgramTts("Hello", "dg-key", FALLBACK_LEG_TIMEOUT_MS, stubFetch);
  assert.equal(seen.url, DEEPGRAM_TTS_URL);
  assert.ok(seen.url.includes("aura-2-thalia-en"));
  assert.equal(seen.init.headers.Authorization, "Token dg-key");
  assert.deepEqual(JSON.parse(seen.init.body), { text: "Hello" });
  assert.equal(out.contentType, "audio/mpeg");
  assert.deepEqual([...out.audio], [0xff, 0xfb, 0x90]);
});

test("callDeepgramTts: failure paths return null", async () => {
  const failFetch = async () => ({ ok: false, status: 401, arrayBuffer: async () => new ArrayBuffer(0) });
  assert.equal(await callDeepgramTts("hi", "k", FALLBACK_LEG_TIMEOUT_MS, failFetch), null);
  const throwFetch = async () => {
    throw new Error("network down");
  };
  assert.equal(await callDeepgramTts("hi", "k", FALLBACK_LEG_TIMEOUT_MS, throwFetch), null);
});

test("callTtsLeg: unconfigured legs never touch the network", async () => {
  let calls = 0;
  const spyFetch = async () => {
    calls += 1;
    return { ok: true, json: async () => ({}), arrayBuffer: async () => new ArrayBuffer(0) };
  };
  assert.equal(await callTtsLeg("kokoro", "hi", "en", {}, spyFetch), null);
  assert.equal(await callTtsLeg("sarvam", "hi", "hi", {}, spyFetch), null);
  assert.equal(await callTtsLeg("deepgram", "hi", "en", {}, spyFetch), null);
  assert.equal(calls, 0);
});

test("timeouts: fallback legs fit inside the route's 60s maxDuration", () => {
  // Gemini 15s + Edge 8s + Kokoro 12s + Deepgram 8s + Sarvam 8s.
  assert.equal(15000 + FALLBACK_LEG_TIMEOUT_MS + KOKORO_TIMEOUT_MS + FALLBACK_LEG_TIMEOUT_MS + FALLBACK_LEG_TIMEOUT_MS, 51000);
  assert.ok(51000 < 60_000);
});

test("source consistency: legs lib matches the mirror", () => {
  const src = readSrc("src/lib/ai-tts-legs.ts");
  assert.ok(src.includes(`EDGE_TRUSTED_CLIENT_TOKEN = "${EDGE_TRUSTED_CLIENT_TOKEN}"`));
  assert.ok(src.includes(`EDGE_CHROMIUM_VERSION = "${EDGE_CHROMIUM_VERSION}"`));
  assert.ok(src.includes(`KOKORO_VOICE = "${KOKORO_VOICE}"`));
  assert.ok(src.includes(`SARVAM_TTS_URL = "${SARVAM_TTS_URL}"`));
  assert.ok(src.includes(`SARVAM_MODEL = "${SARVAM_MODEL}"`));
  assert.ok(src.includes(`DEEPGRAM_TTS_URL =\n  "${DEEPGRAM_TTS_URL}"`));
  assert.ok(src.includes("FALLBACK_LEG_TIMEOUT_MS = 8000"));
  assert.ok(src.includes("KOKORO_TIMEOUT_MS = 12000"));
  assert.ok(src.includes('return ["edge", "kokoro", "deepgram", "sarvam"]'));
  assert.ok(src.includes('return ["edge", "sarvam"]'));
  assert.ok(src.includes('return ["edge"]'));
  assert.ok(src.includes("en-IN-NeerjaNeural"));
  assert.ok(src.includes("hi-IN-SwaraNeural"));
  assert.ok(src.includes("ur-PK-UzmaNeural"));
  assert.ok(src.includes("anushka"));
  assert.ok(src.includes("aura-2-thalia-en"));
  assert.ok(src.includes("UNOFFICIAL"));
  assert.ok(src.includes("no billing"));
  assert.ok(src.includes('"/generate_first"'));
  assert.ok(src.includes("audio-24khz-48kbitrate-mono-mp3"));
});

test("source consistency: route chains Gemini then fallbacks", () => {
  const route = readSrc("src/app/api/ai/tts/route.ts");
  assert.ok(route.includes("maxDuration = 60"));
  assert.ok(route.includes("X-TTS-Provider"));
  assert.ok(route.includes("ttsLegsForLang(lang)"));
  assert.ok(route.includes("callTtsLeg(leg, text, lang, env)"));
  assert.ok(route.includes("KOKORO_TTS_URL"));
  assert.ok(route.includes("SARVAM_API_KEY"));
  assert.ok(route.includes("DEEPGRAM_API_KEY"));
  // A missing Gemini key skips the leg, it must not 503 on its own.
  assert.ok(!route.includes("Speech is not configured yet"));
});

test("source consistency: package.json carries the new deps", () => {
  const pkg = JSON.parse(readSrc("package.json"));
  assert.ok(pkg.dependencies.ws, "ws must be a dependency");
  assert.ok(pkg.dependencies["@gradio/client"], "@gradio/client must be a dependency");
  assert.ok(pkg.devDependencies["@types/ws"], "@types/ws must be a devDependency");
});
