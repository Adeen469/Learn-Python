import { NextResponse } from "next/server";

// Health endpoint for Fly.io ([[http_service.checks]] in fly.toml) and
// humans. Deliberately NOT rate-limited: Fly probes it every 30s and a
// limit could make a healthy machine look unhealthy. The body is a
// bare { status: "ok" } on purpose (L21): it used to report whether
// Supabase was configured, which lesson source was live, and the
// process uptime — deployment facts an unauthenticated caller could
// poll to fingerprint config and detect restarts/deploys. It does
// not even call fetchLessons() anymore, so a probe adds no DB load.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
