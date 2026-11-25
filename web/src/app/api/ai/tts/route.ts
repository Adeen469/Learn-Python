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

// Virtual Tutor text-to-speech — Gemini TTS (Sulafat, Warm) over
// the SAME GEMINI_API_KEY as chat; there is no separate TTS key.
// Session-required (401 when logged out). Fail-closed 503 when the
// session secret or the Gemini key is missing. The key is sent to
// Google server-side only and is never echoed in a response or a
// log. Per-IP 20/min + per-user 50/day keep one session from
// burning the free tier for everyone else.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

  const geminiKey = process.env.GEMINI_API_KEY || null;
  if (!geminiKey) {
    return NextResponse.json(
      { error: "Speech is not configured yet — the API key is missing." },
      { status: 503 }
    );
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
    return NextResponse.json({ error: TTS_UNAVAILABLE }, { status: 503 });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Status only — a provider error body could contain a key or
    // token, so it is never logged or echoed.
    console.error(JSON.stringify({ event: "tts_failed", endpoint: "ai/tts", status: res.status }));
    return NextResponse.json({ error: TTS_UNAVAILABLE }, { status: 503 });
  }
  const pcm = extractTtsAudio(data);
  if (!pcm || pcm.length === 0) {
    console.error(JSON.stringify({ event: "tts_failed", endpoint: "ai/tts", reason: "bad audio shape" }));
    return NextResponse.json({ error: TTS_UNAVAILABLE }, { status: 503 });
  }
  return new NextResponse(wrapPcmInWav(pcm) as unknown as BodyInit, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store",
    },
  });
}
