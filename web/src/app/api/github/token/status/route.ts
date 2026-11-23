import { NextRequest, NextResponse } from "next/server";
import { getGithubToken, getGithubTokenExpiresAt } from "@/lib/github-token";
import { getAuthPrereqs, getSessionUser } from "@/lib/auth-routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkUserLimit } from "@/lib/api-handler";

// Whether the signed-in user has a GitHub token stored on the
// server. Answers { connected, configured, expiresAt } — never the
// token itself. `configured: false` means token storage is not set
// up yet (missing service-role key or migration 006 not run); the
// GitHub page shows a setup message instead of the connect form.
// expiresAt is the token's expiry as GitHub reported it when the
// token was saved (null = no expiry, or unknown) — the page warns
// when it is close.
export async function GET(req: NextRequest) {
  const limit = await checkRateLimit(`github-token:${getClientIp(req)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return NextResponse.json({ connected: false, configured: false, expiresAt: null });
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return NextResponse.json({ error: "Sign in to use GitHub" }, { status: 401 });
  }
  // Per-user bucket alongside the per-IP one, so one user behind
  // a shared NAT cannot starve another user's status checks.
  const userBlocked = await checkUserLimit(user.email, "github-token", 10, 60_000);
  if (userBlocked) return userBlocked;
  const token = await getGithubToken(user.email);
  if (!token) {
    return NextResponse.json({ connected: false, configured: true, expiresAt: null });
  }
  const expiresAt = await getGithubTokenExpiresAt(user.email);
  return NextResponse.json({ connected: true, configured: true, expiresAt });
}
