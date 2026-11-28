import { NextRequest, NextResponse } from "next/server";
import { getAuthPrereqs, getSessionUser, readJsonBody } from "@/lib/auth-routes";
import { checkIpLimit, checkUserLimit } from "@/lib/api-handler";
import { fetchLessons } from "@/lib/lessons";
import { COURSE_CREATORS } from "@/lib/courses/data";
import { ALL_LEARN_TOPICS } from "@/lib/learn/sidebar";
import {
  fetchServerProgress,
  saveServerProgress,
  validateProgressPayload,
  type KnownLesson,
} from "@/lib/progress-server";

// Per-user progress sync — GET loads the server copy, POST saves (merging
// with) it. Session-required (401 when logged out). Fail-soft 503 when
// progress sync is not configured (no service-role key / session secret)
// or the store is unreachable — the client keeps working on
// localStorage-only. The verified session email is the only key; the
// client never sends a user id.
export const dynamic = "force-dynamic";

// POST bodies carry up to ~500 lessons; 64KB (the auth default) is too
// small for a power user's snapshot.
const MAX_PROGRESS_BODY_BYTES = 256 * 1024;

async function knownLessons(): Promise<KnownLesson[]> {
  const byId = new Map<string, number>();
  try {
    const { lessons } = await fetchLessons();
    for (const l of lessons) byId.set(l.id, l.durationSeconds);
  } catch {
    // Lesson list unavailable — validation still accepts slug-shaped
    // ids, clamped to 24h (see progress-server).
  }
  for (const creator of COURSE_CREATORS) {
    for (const video of [...creator.oneShots, ...creator.playlists.flatMap((p) => p.videos)]) {
      const id = video.megaLessonId ?? video.videoId;
      if (!byId.has(id) && video.durationSeconds !== undefined) {
        byId.set(id, video.durationSeconds);
      }
    }
  }
  return [...byId.entries()].map(([id, durationSeconds]) => ({ id, durationSeconds }));
}

const LEARN_SLUGS = new Set(ALL_LEARN_TOPICS.map((t) => t.slug));

export async function GET(req: NextRequest) {
  const ipBlocked = await checkIpLimit(req, "progress-get", 60, 60_000);
  if (ipBlocked) return ipBlocked;
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return NextResponse.json(
      {
        synced: false,
        error:
          "Progress sync is not set up yet — your progress is saved on this device only.",
      },
      { status: 503 }
    );
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const userBlocked = await checkUserLimit(user.email, "progress-get", 60, 60_000);
  if (userBlocked) return userBlocked;

  const snapshot = await fetchServerProgress(prereqs.supabase, user.email.toLowerCase());
  if (!snapshot) {
    return NextResponse.json(
      {
        synced: false,
        error:
          "Progress sync is not set up yet — your progress is saved on this device only.",
      },
      { status: 503 }
    );
  }
  return NextResponse.json({ synced: true, ...snapshot });
}

export async function POST(req: NextRequest) {
  const ipBlocked = await checkIpLimit(req, "progress-post", 20, 60_000);
  if (ipBlocked) return ipBlocked;
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return NextResponse.json(
      {
        synced: false,
        error:
          "Progress sync is not set up yet — your progress is saved on this device only.",
      },
      { status: 503 }
    );
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const userBlocked = await checkUserLimit(user.email, "progress-post", 20, 60_000);
  if (userBlocked) return userBlocked;

  const rawBody = await readJsonBody(req, MAX_PROGRESS_BODY_BYTES);
  if (!rawBody) {
    return NextResponse.json(
      { error: "Request body must be valid JSON under 256KB." },
      { status: 400 }
    );
  }

  const lessons = await knownLessons();
  const validated = validateProgressPayload(rawBody, lessons, LEARN_SLUGS);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const saved = await saveServerProgress(
    prereqs.supabase,
    user.email.toLowerCase(),
    validated.payload,
    lessons
  );
  if (!saved) {
    return NextResponse.json(
      {
        synced: false,
        error:
          "Progress could not be saved to your account right now — it is still saved on this device.",
      },
      { status: 503 }
    );
  }
  return NextResponse.json({ synced: true });
}
