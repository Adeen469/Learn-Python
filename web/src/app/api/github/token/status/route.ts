import { NextRequest, NextResponse } from "next/server";
import { getGithubToken } from "@/lib/github-token";
import { getAuthPrereqs, getSessionUser } from "@/lib/auth-routes";

// Whether the signed-in user has a GitHub token stored on the
// server. Answers { connected, configured } — never the token
// itself. `configured: false` means token storage is not set up
// yet (missing service-role key or migration 006 not run); the
// GitHub page shows a setup message instead of the connect form.
export async function GET(req: NextRequest) {
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return NextResponse.json({ connected: false, configured: false });
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return NextResponse.json({ error: "Sign in to use GitHub" }, { status: 401 });
  }
  const token = await getGithubToken(user.email, prereqs.secret);
  return NextResponse.json({ connected: token !== null, configured: true });
}
