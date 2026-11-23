import { NextRequest, NextResponse } from "next/server";
import { fetchLessons } from "@/lib/lessons";
import { checkIpLimit, parsePagination } from "@/lib/api-handler";

// Public by design: lessons are readable without sign-in (anon SELECT
// policies in supabase/migrations/002_public_lessons.sql).
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ipBlocked = await checkIpLimit(req, "lessons", 60, 60_000);
  if (ipBlocked) return ipBlocked;

  // R3-L13: limit/offset pagination — one unauthenticated call
  // used to pull all ~268 lessons with full notes + quiz answers
  // in a single multi-hundred-KB response. Default limit 100 keeps
  // existing clients working: the only in-app caller is the service
  // worker, which caches the response without parsing it, and no
  // client code reads /api/lessons directly — callers that want the
  // whole catalog page through with limit/offset (limit caps at
  // 500). The body always carries total + the page.
  const { limit, offset } = parsePagination(req.nextUrl.searchParams);

  // No `source` in the body: it told anyone polling whether the DB
  // was down or unconfigured. An empty list means Supabase is
  // configured but failing or has nothing published — a 503, not
  // a silently served seed catalog.
  const { lessons } = await fetchLessons();
  if (lessons.length === 0) {
    return NextResponse.json(
      { error: "Lessons are unavailable right now — try again shortly." },
      { status: 503 }
    );
  }
  const total = lessons.length;
  const page = lessons.slice(offset, offset + limit);
  return NextResponse.json({ lessons: page, total, limit, offset });
}
