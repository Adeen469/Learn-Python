import { NextRequest, NextResponse } from "next/server";
import { getSessionSecret } from "@/lib/auth";
import { getSessionUser } from "@/lib/auth-routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { perUserRateKey } from "@/lib/api-handler";
import {
  extractTtsAudio,
  stripForSpeech,
  TTS_MODEL,
  TTS_TIMEOUT_MS,
  TTS_VOICE,
  validateTtsBody,
  wrapPcmInWav,
} from "@/lib/ai-tts";
import {
  callTtsLeg,
  detectSpeechLang,
  ttsLegsForLang,
} from "@/lib/ai-tts-legs";

// Virtual Tutor text-to-speech — Gemini TTS (Sulafat, Warm) over
// the SAME GEMINI_API_KEY as chat, then free fallback legs (Edge,
// Kokoro, Deepgram, Sarvam — see lib/ai-tts-legs.ts) when Gemini
// fails or its 15-requests-a-day free tier is exhausted. A missing
// Gemini key just skips that leg; the route only 503s when EVERY
// leg fails, and the client then falls back to the device voice.
// Session-required (401 when logged out). Fail-closed 503 when the
// session secret is missing. Keys are sent to providers server-side
// only and are never echoed in a response or a log. Per-IP 20/min
// + per-user 50/day keep one session from burning the free tiers
// for everyone else.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TTS_DAILY_LIMIT_PER_USER = 50;
const TTS_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const TTS_MAX_BODY_BYTES = 16 * 1024;
const TTS_UNAVAILABLE = "Speech is unavailable right now — please try again in a moment.";

export async function POST(req: NextRequest) {
  let limit;
  try {
    limit = await checkRateLimit(`tts:${getClientIp(req)}`, 20, 60_000, Date.now(), { failClosed: true });
  } catch {
    return NextResponse.json({ error: TTS_UNAVAILABLE }, { status: 503 });
  }
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  const secret = getSessionSecret();
  if (!secret) {
    console.error(JSON.stringify({ event: "auth_misconfigured", endpoint: "ai/tts" }));
    return NextResponse.json(
      { error: "Sign-in is not configured yet." },
      { status: 503 }
    );
  }
  const user = await getSessionUser(req, secret);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Body-size ceiling BEFORE parsing: a huge body is refused
  // without ever being parsed into memory.
  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > TTS_MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }
  const validated = validateTtsBody(rawBody);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  // Per-user daily quota, counted only after the body validates —
  // malformed requests burn nothing.
  try {
    const userKey = perUserRateKey("tts-user:", user.email);
    const userLimit = await checkRateLimit(userKey, TTS_DAILY_LIMIT_PER_USER, TTS_DAILY_WINDOW_MS, Date.now(), { failClosed: true });
    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: "Daily speech limit reached — please try again tomorrow." },
        {
          status: 429,
          headers: { "Retry-After": String(userLimit.retryAfterSeconds) },
        }
      );
    }
  } catch {
    return NextResponse.json({ error: TTS_UNAVAILABLE }, { status: 503 });
  }

  const text = stripForSpeech(validated.body.text);
  const lang = detectSpeechLang(text, validated.body.lang);
  const failures: string[] = [];

  // Leg 1: Gemini TTS. A missing key skips the leg — it no longer
  // 503s, the fallback legs below still get their turn.
  const geminiKey = process.env.GEMINI_API_KEY || null;
  let spoken: { audio: Buffer; contentType: string; provider: string } | null = null;
  if (geminiKey) {
    let res: Response | null = null;
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Say: ${text}` }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: TTS_VOICE },
                },
              },
            },
          }),
          signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
        }
      );
    } catch {
      res = null;
    }
    if (!res) {
      console.error(JSON.stringify({ event: "tts_failed", endpoint: "ai/tts", reason: "no response" }));
      failures.push("gemini");
    } else {
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        // Status only — a provider error body could contain a key or
        // token, so it is never logged or echoed.
        console.error(JSON.stringify({ event: "tts_failed", endpoint: "ai/tts", status: res.status }));
        failures.push("gemini");
      } else {
        const pcm = extractTtsAudio(data);
        if (!pcm || pcm.length === 0) {
          console.error(JSON.stringify({ event: "tts_failed", endpoint: "ai/tts", reason: "bad audio shape" }));
          failures.push("gemini");
        } else {
          spoken = { audio: wrapPcmInWav(pcm), contentType: "audio/wav", provider: "gemini" };
        }
      }
    }
  } else {
    failures.push("gemini (no key)");
  }

  // Legs 2..n: free fallbacks, in language order. Each leg is
  // skipped when unconfigured and returns null on failure, so the
  // chain keeps moving until something speaks.
  if (!spoken) {
    const env = {
      kokoroTtsUrl: process.env.KOKORO_TTS_URL || undefined,
      sarvamApiKey: process.env.SARVAM_API_KEY || undefined,
      deepgramApiKey: process.env.DEEPGRAM_API_KEY || undefined,
    };
    for (const leg of ttsLegsForLang(lang)) {
      try {
        const out = await callTtsLeg(leg, text, lang, env);
        if (out) {
          spoken = { ...out, provider: leg };
          break;
        }
        failures.push(leg);
      } catch {
        failures.push(leg);
      }
    }
  }

  if (!spoken) {
    console.error(JSON.stringify({ event: "tts_failed", endpoint: "ai/tts", failures }));
    return NextResponse.json({ error: TTS_UNAVAILABLE }, { status: 503 });
  }
  return new NextResponse(spoken.audio as unknown as BodyInit, {
    headers: {
      "Content-Type": spoken.contentType,
      "Cache-Control": "no-store",
      "X-TTS-Provider": spoken.provider,
    },
  });
}
