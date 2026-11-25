// Server-side fallback TTS legs for the Virtual Tutor, layered
// AFTER Gemini TTS in the /api/ai/tts route. Every leg here is
// UNPAID only — there is no billing or card anywhere in this chain:
//   Edge TTS — Microsoft neural voices, free, no key. UNOFFICIAL
//     endpoint (Edge read-aloud, reverse-engineered): Microsoft
//     has broken it before (Oct 2024, Oct 2026) and can break it
//     again — when it breaks, this leg just fails and the chain
//     moves on. Constants pinned to rany2/edge-tts master.
//   Kokoro-82M — open-source, unlimited, free. Runs on OUR OWN
//     free Hugging Face Space (see web/docs/kokoro-space/); the
//     leg is skipped entirely when KOKORO_TTS_URL is unset.
//   Sarvam Bulbul — ₹100 signup credit, never expires, no billing
//     or card; skipped when SARVAM_API_KEY is unset. Best for
//     Hindi/Marathi replies.
//   Deepgram Aura — one-time $200 signup credit (a bonus, not a
//     recurring tier); skipped when DEEPGRAM_API_KEY is unset.
//     English only.
// A leg that is not configured or that fails returns null and the
// chain moves on. The client falls back to the device voice when
// the route 503s, so the tutor is never left silent while a later
// leg could speak. No key is ever logged or echoed.

import { createHash, randomUUID } from "node:crypto";
import type { ClientRequest, IncomingMessage } from "node:http";
import WebSocket from "ws";
import { Client as GradioClient } from "@gradio/client";

export type SpeechLang = "en" | "hi" | "ur";
export type TtsLegName = "edge" | "kokoro" | "deepgram" | "sarvam";
export type TtsLegAudio = { audio: Buffer; contentType: "audio/mpeg" | "audio/wav" };
export type TtsLegEnv = {
  kokoroTtsUrl?: string;
  sarvamApiKey?: string;
  deepgramApiKey?: string;
};

export const FALLBACK_LEG_TIMEOUT_MS = 8000;
export const KOKORO_TIMEOUT_MS = 12000;

// Worst case for the route: Gemini 15s + Edge 8s + Kokoro 12s +
// Deepgram 8s + Sarvam 8s = 51s — inside the route's 60s
// maxDuration. In practice a failed leg answers in under a second
// (4xx/5xx), so the chain is normally far quicker.

// Detect the reply language from the text itself — the tutor
// client does not send a lang, so the route cannot rely on one.
// Devanagari → Hindi (Marathi shares the script, so it lands here
// too), Arabic script → Urdu, everything else → English.
export function detectSpeechLang(text: string, lang?: string): SpeechLang {
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

// Which server legs to try after Gemini, in order. Kokoro and
// Deepgram only speak English, Sarvam only gets Indian-language
// (or Indian-English) replies — a leg that cannot speak the reply
// language is skipped, not attempted.
export function ttsLegsForLang(lang: SpeechLang): TtsLegName[] {
  if (lang === "hi") return ["edge", "sarvam"];
  if (lang === "ur") return ["edge"];
  return ["edge", "kokoro", "deepgram", "sarvam"];
}

// Run one fallback leg. Returns null when the leg is not
// configured (missing env) or fails — the caller tries the next
// leg. `fetchImpl` exists so tests can stub the network.
export async function callTtsLeg(
  leg: TtsLegName,
  text: string,
  lang: SpeechLang,
  env: TtsLegEnv,
  fetchImpl: typeof fetch = fetch
): Promise<TtsLegAudio | null> {
  if (leg === "edge") return callEdgeTts(text, lang);
  if (leg === "kokoro") {
    if (!env.kokoroTtsUrl) return null;
    return callKokoroTts(text, env.kokoroTtsUrl);
  }
  if (leg === "deepgram") {
    if (!env.deepgramApiKey) return null;
    return callDeepgramTts(text, env.deepgramApiKey, FALLBACK_LEG_TIMEOUT_MS, fetchImpl);
  }
  if (!env.sarvamApiKey) return null;
  return callSarvamTts(text, lang, env.sarvamApiKey, FALLBACK_LEG_TIMEOUT_MS, fetchImpl);
}

// --- Edge TTS -------------------------------------------------------

const EDGE_WSS_URL =
  "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
const EDGE_TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D68F";
const EDGE_CHROMIUM_VERSION = "143.0.3650.75";
const EDGE_SEC_MS_GEC_VERSION = `1-${EDGE_CHROMIUM_VERSION}`;

export function edgeVoiceForLang(lang: SpeechLang): string {
  if (lang === "hi") return "hi-IN-SwaraNeural";
  if (lang === "ur") return "ur-PK-UzmaNeural";
  return "en-IN-NeerjaNeural";
}

function edgeXmlEscape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function edgeSsml(text: string, voice: string): string {
  return (
    "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>" +
    `<voice name='${voice}'><prosody pitch='+0Hz' rate='+0%' volume='+0%'>${edgeXmlEscape(text)}</prosody></voice></speak>`
  );
}

const EDGE_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EDGE_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// JS-style date string, exactly as edge-tts builds it.
export function edgeDateString(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${EDGE_DAYS[date.getUTCDay()]} ${EDGE_MONTHS[date.getUTCMonth()]} ${p(date.getUTCDate())} ` +
    `${date.getUTCFullYear()} ${p(date.getUTCHours())}:${p(date.getUTCMinutes())}:${p(date.getUTCSeconds())} ` +
    "GMT+0000 (Coordinated Universal Time)"
  );
}

// Sec-MS-GEC DRM token: SHA-256 (uppercase hex) of the Windows
// file time — 100ns ticks since 1601, floored to 5-minute windows
// — followed by the trusted client token. Mirrors edge-tts drm.py.
export function edgeSecMsGec(nowMs = Date.now()): string {
  const ticks =
    Math.floor((Math.floor(nowMs / 1000) + 11644473600) / 300) * 300 * 10_000_000;
  return createHash("sha256")
    .update(`${ticks}${EDGE_TRUSTED_CLIENT_TOKEN}`)
    .digest("hex")
    .toUpperCase();
}

export type EdgeParsedMessage =
  | { kind: "audio"; audio: Buffer }
  | { kind: "turn.end" }
  | { kind: "other"; path: string };

// Parse one WebSocket message from the Edge endpoint. Text frames
// carry `Path:` headers (turn.start / turn.end / response /
// audio.metadata); binary frames start with a 2-byte big-endian
// header length and carry the MP3 chunk when Path is audio.
// Returns null for anything unparseable — the caller ignores it.
export function parseEdgeMessage(data: string | Buffer): EdgeParsedMessage | null {
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

function edgeRandomHex(bytes = 16): string {
  return [...crypto.getRandomValues(new Uint8Array(bytes))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  return Promise.race([
    promise.then(
      (v) => {
        clearTimeout(timer);
        return v as T | null;
      },
      () => {
        clearTimeout(timer);
        return null;
      }
    ),
    timeout,
  ]);
}

// One Edge TTS turn over WebSocket. Retries once on 403 with the
// clock skew the server reports (its Date header) — the same
// correction edge-tts applies. Any other failure returns null.
export async function callEdgeTts(
  text: string,
  lang: SpeechLang,
  timeoutMs = FALLBACK_LEG_TIMEOUT_MS
): Promise<TtsLegAudio | null> {
  const voice = edgeVoiceForLang(lang);
  const state = { skewMs: 0 };
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await callEdgeTtsOnce(text, voice, timeoutMs, state);
    if (result !== "retry") return result;
  }
  return null;
}

async function callEdgeTtsOnce(
  text: string,
  voice: string,
  timeoutMs: number,
  state: { skewMs: number }
): Promise<TtsLegAudio | null | "retry"> {
  const requestId = randomUUID().replace(/-/g, "");
  const url =
    `${EDGE_WSS_URL}?TrustedClientToken=${EDGE_TRUSTED_CLIENT_TOKEN}` +
    `&Sec-MS-GEC=${edgeSecMsGec(Date.now() + state.skewMs)}` +
    `&Sec-MS-GEC-Version=${EDGE_SEC_MS_GEC_VERSION}&ConnectionId=${requestId}`;
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
      `Chrome/${EDGE_CHROMIUM_VERSION.split(".")[0]}.0.0.0 Safari/537.36 Edg/${EDGE_CHROMIUM_VERSION.split(".")[0]}.0.0.0`,
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
    Cookie: `MUID=${edgeRandomHex()}`,
  };
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let done = false;
    let ws: WebSocket | null = null;
    const timer = setTimeout(() => finish(null), timeoutMs);
    const finish = (result: TtsLegAudio | null | "retry") => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        ws?.close();
      } catch {
        // Already closed.
      }
      resolve(result);
    };
    try {
      ws = new WebSocket(url, { headers });
    } catch {
      finish(null);
      return;
    }
    ws.on("unexpected-response", (_req: ClientRequest, res: IncomingMessage) => {
      // 403 means our clock is skewed vs Microsoft's — retry once
      // with the skew from the server's Date header.
      if (res.statusCode === 403) {
        const serverDate = Date.parse(res.headers.date ?? "");
        if (Number.isFinite(serverDate)) state.skewMs = serverDate - Date.now();
        finish("retry");
      } else {
        finish(null);
      }
    });
    ws.on("error", () => finish(null));
    ws.on("open", () => {
      const ts = edgeDateString();
      ws?.send(
        `X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
          `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`
      );
      ws?.send(
        `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${ts}Z\r\nPath:ssml\r\n\r\n${edgeSsml(text, voice)}`
      );
    });
    ws.on("message", (data: WebSocket.RawData) => {
      const parsed = parseEdgeMessage(
        typeof data === "string" ? data : Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer)
      );
      if (!parsed) return;
      if (parsed.kind === "audio") chunks.push(parsed.audio);
      else if (parsed.kind === "turn.end") {
        finish(chunks.length ? { audio: Buffer.concat(chunks), contentType: "audio/mpeg" } : null);
      }
    });
  });
}

// --- Kokoro-82M (own free Hugging Face Space) -----------------------

export const KOKORO_VOICE = "af_heart";

// Pull the audio file URL out of a Gradio /generate_first result.
// data[0] is the FileData object ({url}); data[1] is phonemes.
// Returns null when the shape is unexpected.
export function kokoroAudioUrlFromResult(result: unknown, baseUrl: string): string | null {
  if (typeof result !== "object" || result === null) return null;
  const data = (result as { data?: unknown }).data;
  const first = Array.isArray(data)
    ? data[0]
    : typeof data === "object" && data !== null
      ? (data as Record<string, unknown>)[0]
      : undefined;
  if (typeof first !== "object" || first === null) return null;
  const url = (first as { url?: unknown }).url;
  if (typeof url !== "string" || !url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return baseUrl.replace(/\/$/, "") + (url.startsWith("/") ? url : `/${url}`);
}

export async function callKokoroTts(
  text: string,
  baseUrl: string,
  timeoutMs = KOKORO_TIMEOUT_MS
): Promise<TtsLegAudio | null> {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const audio = await withTimeout(
    (async (): Promise<TtsLegAudio | null> => {
      const client = await GradioClient.connect(cleanBase);
      const result = await client.predict("/generate_first", {
        text,
        voice: KOKORO_VOICE,
        speed: 1,
        lang: "en-us",
      });
      const url = kokoroAudioUrlFromResult(result, cleanBase);
      if (!url) return null;
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      return buf.length ? { audio: buf, contentType: "audio/wav" } : null;
    })(),
    timeoutMs
  );
  return audio;
}

// --- Sarvam Bulbul (₹100 signup credit, no billing) ---------------

export const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";
export const SARVAM_MODEL = "bulbul:v2";

export function sarvamSpeakerForLang(lang: SpeechLang): string {
  return lang === "hi" ? "anushka" : "ritu";
}

export function sarvamTargetLang(lang: SpeechLang): string {
  return lang === "hi" ? "hi-IN" : "en-IN";
}

export async function callSarvamTts(
  text: string,
  lang: SpeechLang,
  apiKey: string,
  timeoutMs = FALLBACK_LEG_TIMEOUT_MS,
  fetchImpl: typeof fetch = fetch
): Promise<TtsLegAudio | null> {
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
    const body = (await res.json().catch(() => null)) as { audios?: unknown } | null;
    const b64 = Array.isArray(body?.audios) ? body.audios[0] : undefined;
    if (typeof b64 !== "string" || !b64) return null;
    const buf = Buffer.from(b64, "base64");
    return buf.length ? { audio: buf, contentType: "audio/wav" } : null;
  } catch {
    return null;
  }
}

// --- Deepgram Aura (one-time $200 signup credit) -------------------

export const DEEPGRAM_TTS_URL =
  "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=mp3";

export async function callDeepgramTts(
  text: string,
  apiKey: string,
  timeoutMs = FALLBACK_LEG_TIMEOUT_MS,
  fetchImpl: typeof fetch = fetch
): Promise<TtsLegAudio | null> {
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
