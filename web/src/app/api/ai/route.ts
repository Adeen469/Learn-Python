import { NextRequest, NextResponse } from "next/server";
import { getSessionSecret } from "@/lib/auth";
import { getSessionUser } from "@/lib/auth-routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { fetchLessonById } from "@/lib/lessons";
import {
  askAi,
  getAiConfig,
  hasAiConfig,
  validateAiRequest,
  type AiSkill,
} from "@/lib/ai";
import {
  BUILTIN_AI_SKILLS,
  DEFAULT_ACTIVE_SKILL_IDS,
} from "@/lib/ai-skills.generated";
import {
  extractYouTubeId,
  fetchTranscript,
  selectTranscriptWindow,
  TRANSCRIPT_MAX_CHARS,
  TRANSCRIPT_TIMEOUT_MS,
} from "@/lib/transcript";
import { getStoredTranscript } from "@/lib/stored-transcripts";

// AI tutor / code help — Gemini first, Groq fallback.
// Session-required (401 when logged out). Fail-closed 503 when the
// session secret or both AI keys are missing. No chat history is
// stored server-side; the client sends at most the last 8 turns.
// No user profile data is ever passed to a model — only the lesson
// context (title/notes, plus the lesson video transcript for tutor
// and quiz modes) and the learner's own question/code.
// Guide mode (editor AI panel) additionally accepts the user's own
// skills (built-in ids resolved server-side + their custom skills)
// and a BYOK key for one provider (Gemini, Groq, Anthropic, OpenAI,
// OpenRouter, or a custom OpenAI-compatible endpoint). The BYOK key
// is used in-memory for that one request only — it is never stored,
// logged, or echoed back in any response.
export const dynamic = "force-dynamic";

// The fallback chain can run past the default 10s serverless budget
// (Gemini 7s + Groq 8s + Anthropic 15s + …), so allow 60s like the
// video route does.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let limit;
  try {
    limit = await checkRateLimit(`ai:${getClientIp(req)}`, 20, 60_000);
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

  // getSessionUser also checks the session version: a password reset
  // revokes sessions signed before it.
  const user = await getSessionUser(req, secret);
  if (!user) {
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
  // BYOK (guide mode): the user's own key for one provider replaces
  // the server key for that provider, in-memory for this request
  // only. The other providers keep their server keys as fallback.
  // Custom also carries its base URL + model in the BYOK.
  if (body.byok?.key) {
    if (body.byok.provider === "gemini") config.geminiKey = body.byok.key;
    if (body.byok.provider === "groq") config.groqKey = body.byok.key;
    if (body.byok.provider === "anthropic") config.anthropicKey = body.byok.key;
    if (body.byok.provider === "openai") config.openaiKey = body.byok.key;
    if (body.byok.provider === "openrouter") config.openrouterKey = body.byok.key;
    if (body.byok.provider === "custom") {
      config.customKey = body.byok.key;
      config.customBaseUrl = body.byok.baseUrl ?? null;
      config.customModel = body.byok.model ?? null;
    }
  }
  if (!hasAiConfig(config)) {
    return NextResponse.json(
      { error: "AI is not configured yet — the API keys are missing." },
      { status: 503 }
    );
  }

  // Skills (guide mode only — the lesson tutor keeps its own
  // transcript-grounded behaviour). Built-in ids resolve against the
  // server's skill files; an absent list defaults to ponytail. The
  // catalogue of available built-in skills always rides along, so
  // the AI knows the sub-skills exist and when to use them.
  let skills: AiSkill[] = [];
  if (body.mode === "guide") {
    const catalogue = BUILTIN_AI_SKILLS.map(
      (s) => `${s.name} — ${s.description}`
    ).join("\n");
    const wanted =
      body.skillIds && body.skillIds.length > 0
        ? body.skillIds
        : DEFAULT_ACTIVE_SKILL_IDS;
    const builtin: AiSkill[] = BUILTIN_AI_SKILLS.filter((s) =>
      wanted.includes(s.id)
    ).map((s) => ({ name: s.name, content: s.content }));
    const custom: AiSkill[] = (body.skills ?? []).map((s) => ({
      name: s.name,
      content: s.content,
    }));
    skills = [
      { name: "Available skills", content: catalogue },
      ...builtin,
      ...custom,
    ];
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
  // about the learner's own code, not the video). The transcript comes
  // FIRST from the stored captions shipped with the code — the lesson
  // video's real words, harvested once, with [mm:ss] timestamps. A
  // live YouTube fetch is only the fallback for a lesson with no
  // stored transcript (YouTube 429s datacenter IPs, so live fetch
  // fails often — stored captions are what make the tutor real).
  // Long transcripts are windowed to the question, so the answer
  // comes from the part of the video the learner asked about.
  let transcript = null;
  let transcriptSource: "stored" | "live" | "none" = "none";
  if ((body.mode === "tutor" || body.mode === "quiz") && lesson) {
    transcript = getStoredTranscript(lesson.id);
    if (transcript) {
      transcriptSource = "stored";
    } else {
      const videoId = extractYouTubeId(lesson.notes);
      if (videoId) {
        transcript = await fetchTranscript(videoId, {
          timeoutMs: TRANSCRIPT_TIMEOUT_MS,
        });
        if (transcript) {
          transcriptSource = "live";
        } else {
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
    if (transcript?.hasTimestamps && body.question) {
      const windowed = selectTranscriptWindow(
        transcript.text,
        body.question,
        TRANSCRIPT_MAX_CHARS
      );
      transcript = {
        ...transcript,
        text: windowed.text,
        truncated: windowed.truncated,
      };
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
      model: body.model,
      effort: body.effort,
      skills,
    },
    config
  );
  if (!result) {
    // Key presence only (booleans, never values) — enough to tell
    // "no key configured" from "key present but every call failed".
    console.error(
      JSON.stringify({
        event: "ai_provider_failed",
        mode: body.mode,
        model: body.model ?? null,
        hasGemini: Boolean(config.geminiKey),
        hasGroq: Boolean(config.groqKey),
        hasAnthropic: Boolean(config.anthropicKey),
        hasOpenai: Boolean(config.openaiKey),
        hasOpenrouter: Boolean(config.openrouterKey),
        hasCustom: Boolean(config.customKey),
      })
    );
    return NextResponse.json(
      { error: "AI is unavailable right now — please try again in a moment." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ...result,
    // Grounded = the answer was built from the lesson video's real
    // transcript (stored captions, or a live fetch). False means the
    // tutor answered from the lesson title/notes only — the UI says
    // so, so a general answer is never passed off as video content.
    grounded: transcript !== null,
    transcriptSource,
    transcriptLanguage: transcript?.language ?? null,
  });
}
