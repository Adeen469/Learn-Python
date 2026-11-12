import { NextResponse } from "next/server";
import { fetchLessons, isSupabaseConfigured } from "@/lib/lessons";

// Health endpoint for Fly.io ([[http_service.checks]] in fly.toml) and
// humans. Uses the cached fetchLessons() result — no fresh DB ping per
// call. Deliberately NOT rate-limited: Fly probes it every 30s and a
// limit could make a healthy machine look unhealthy.
export const dynamic = "force-dynamic";

export async function GET() {
  const { source } = await fetchLessons();
  return NextResponse.json({
    status: "ok",
    supabase: isSupabaseConfigured() ? "configured" : "not_configured",
    lessons: source,
    uptime_seconds: Math.floor(process.uptime()),
  });
}
