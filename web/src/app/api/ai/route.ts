import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getSessionSecret,
  verifySession,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { fetchLessonById } from "@/lib/lessons";
import {
  askAi,
  getAiConfig,
  hasAiConfig,
  validateAiRequest,
} from "@/lib/ai";
import {
  extractYouTubeId,
  fetchTranscript,
  TRANSCRIPT_TIMEOUT_MS,
} from "@/lib/transcript";

// AI tutor / code help — Gemini first, Groq fallback.
// Session-required (401 when logged out). Fail-closed 503 when the
// session secret or both AI keys are missing. No chat history is
// stored server-side; the client sends at most the last 8 turns.
// No user profile data is ever passed to a model — only the lesson
// context (title/notes, plus the lesson video transcript for tutor
// and quiz modes) and the learner's own question/code.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let limit;
  try {
    limit = checkRateLimit(`ai:${getClientIp(req)}`, 20, 60_000);
  } catch {
    return NextResponse.json(
      { error: "AI is temporarily unavailable." },
      { status: 503 }
    );
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
    console.error(JSON.stringify({ event: "auth_misconfigured", endpoint: "ai" }));
    return NextResponse.json(
      { error: "Sign-in is not configured yet." },
      { status: 503 }
    );
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const verified = await verifySession(secret, token);
  if (!verified.ok) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
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
  const validated = validateAiRequest(rawBody);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const body = validated.body;

  const config = getAiConfig();
  if (!hasAiConfig(config)) {
    return NextResponse.json(
      { error: "AI is not configured yet — the API keys are missing." },
      { status: 503 }
    );
  }

  // Lesson context, server-side (Supabase with seed fallback, same as
  // the course). A bad lessonId is not fatal — the tutor just answers
  // without lesson context.
  let lesson = null;
  if (body.lessonId) {
    try {
      lesson = await fetchLessonById(body.lessonId);
    } catch {
      lesson = null;
    }
  }

  // Video transcript grounding, tutor + quiz only (explain/debug are
  // about the learner's own code, not the video). The transcript is
  // fetched live per question, cached per video, and capped — but a
  // YouTube failure must NEVER fail the tutor: on null, answer from
  // the title/notes grounding exactly as before.
  let transcript = null;
  if ((body.mode === "tutor" || body.mode === "quiz") && lesson) {
    const videoId = extractYouTubeId(lesson.notes);
    if (videoId) {
      transcript = await fetchTranscript(videoId, {
        timeoutMs: TRANSCRIPT_TIMEOUT_MS,
      });
      if (!transcript) {
        console.error(
          JSON.stringify({
            event: "ai_transcript_failed",
            endpoint: "ai",
            lessonId: body.lessonId ?? null,
            reason: "fetch_failed",
          })
        );
      }
    }
  }

  const result = await askAi(
    {
      mode: body.mode,
      lesson,
      transcript,
      question: body.question,
      code: body.code,
      history: body.history ?? [],
    },
    config
  );
  if (!result) {
    console.error(
      JSON.stringify({ event: "ai_provider_failed", mode: body.mode })
    );
    return NextResponse.json(
      { error: "AI is unavailable right now — please try again in a moment." },
      { status: 503 }
    );
  }

  return NextResponse.json(result);
}
