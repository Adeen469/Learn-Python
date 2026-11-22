import { NextRequest, NextResponse } from "next/server";
import { getAuthPrereqs, getSessionUser } from "@/lib/auth-routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { listByokKeys } from "@/lib/byok-store";

// List the signed-in user's saved BYOK providers (migration 009).
//
// GET returns { keys: [{ provider, baseUrl, model }] } — metadata
// only. Keys are NEVER returned to the browser, not even here.
// When BYOK storage is not set up yet the list is empty (fail
// closed as "no keys"), not an error — the editor just shows no
// saved providers.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = await checkRateLimit(`byok:${getClientIp(req)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return NextResponse.json({ keys: [] });
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return NextResponse.json({ error: "Sign in to list saved keys" }, { status: 401 });
  }
  const keys = await listByokKeys(user.email);
  return NextResponse.json({ keys });
}
