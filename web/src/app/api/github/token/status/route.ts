import { NextRequest, NextResponse } from "next/server";
import { getGithubToken, getGithubTokenExpiresAt } from "@/lib/github-token";
import { getAuthPrereqs, getSessionUser } from "@/lib/auth-routes";

// Whether the signed-in user has a GitHub token stored on the
// server. Answers { connected, configured, expiresAt } — never the
// token itself. `configured: false` means token storage is not set
// up yet (missing service-role key or migration 006 not run); the
// GitHub page shows a setup message instead of the connect form.
// expiresAt is the token's expiry as GitHub reported it when the
// token was saved (null = no expiry, or unknown) — the page warns
// when it is close.
export async function GET(req: NextRequest) {
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return NextResponse.json({ connected: false, configured: false, expiresAt: null });
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return NextResponse.json({ error: "Sign in to use GitHub" }, { status: 401 });
  }
  const token = await getGithubToken(user.email, prereqs.secret);
  if (!token) {
    return NextResponse.json({ connected: false, configured: true, expiresAt: null });
  }
  const expiresAt = await getGithubTokenExpiresAt(user.email);
  return NextResponse.json({ connected: true, configured: true, expiresAt });
}
