import { NextRequest, NextResponse } from "next/server";
import { fetchLessons } from "@/lib/lessons";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Public by design: lessons are readable without sign-in (anon SELECT
// policies in supabase/migrations/002_public_lessons.sql).
export const dynamic = "force-dynamic";

const RATE_LIMITED_RESPONSE = (retryAfterSeconds: number) =>
  NextResponse.json(
    { error: "Too many requests — please slow down and retry shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );

export async function GET(req: NextRequest) {
  const limit = checkRateLimit(`lessons:${getClientIp(req)}`, 60, 60_000);
  if (!limit.allowed) {
    return RATE_LIMITED_RESPONSE(limit.retryAfterSeconds);
  }

  const { lessons, source } = await fetchLessons();
  return NextResponse.json({ lessons, source });
}
