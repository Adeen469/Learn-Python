import { NextRequest, NextResponse } from "next/server";
import {
  clearCookieOptions,
  getSessionSecret,
  isSecureOrigin,
  getRequestOrigin,
  SESSION_COOKIE,
} from "@/lib/auth";
import { getSessionUser } from "@/lib/auth-routes";
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
    // Tampered, expired, or revoked: 401 and clear the useless cookie.
    const origin = getRequestOrigin(req);
    const res = NextResponse.json(
      { error: "Not signed in." },
      { status: 401 }
    );
    res.cookies.set(
      SESSION_COOKIE,
      "",
      clearCookieOptions(origin ? isSecureOrigin(origin) : false, "/")
    );
    return res;
  }
  return NextResponse.json({ user });
}
