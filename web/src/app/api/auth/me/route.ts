import { NextRequest, NextResponse } from "next/server";
import { getSessionSecret, isSecureDeployment } from "@/lib/auth";
import { clearStaleSessionCookies, getSessionUser } from "@/lib/auth-routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Returns the signed-in user from the HttpOnly session cookie, or 401.
// Fail-closed 503 when SESSION_SECRET is missing — no session can be
// verified, so no user is ever reported.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let limit;
  try {
    limit = await checkRateLimit(`auth-me:${getClientIp(req)}`, 60, 60_000);
  } catch {
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable." },
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
    console.error(
      JSON.stringify({ event: "auth_misconfigured", endpoint: "me" })
    );
    return NextResponse.json(
      { error: "Sign-in is not configured yet." },
      { status: 503 }
    );
  }

  // getSessionUser also checks the session version: a password reset
  // revokes sessions signed before it.
  const user = await getSessionUser(req, secret);
  if (!user) {
    // No usable session: 401 and clear only the stale SESSION
    // cookies. Never the pending-2FA or OAuth cookies here — a
    // caller mid-sign-in (2FA page, OAuth callback) has no session
    // yet by design, and clearing the step-up cookie kills their
    // sign-in (Google+2FA login broke exactly this way).
    const res = NextResponse.json(
      { error: "Not signed in." },
      { status: 401 }
    );
    clearStaleSessionCookies(res, isSecureDeployment());
    return res;
  }
  return NextResponse.json({ user });
}
