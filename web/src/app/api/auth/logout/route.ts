import { NextRequest, NextResponse } from "next/server";
import {
  clearCookieOptions,
  getRequestOrigin,
  isSecureOrigin,
  SESSION_COOKIE,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Signs out: expires the session cookie. POST only (a GET logout would
// be triggerable cross-site via an <img> tag). Clearing the cookie is
// safe even when SESSION_SECRET is missing, so logout never 503s on a
// misconfigured secret — it just destroys the cookie.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let limit;
  try {
    limit = checkRateLimit(`auth-logout:${getClientIp(req)}`, 30, 60_000);
  } catch {
    return NextResponse.json(
      { error: "Sign-out is temporarily unavailable." },
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

  const origin = getRequestOrigin(req);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    SESSION_COOKIE,
    "",
    clearCookieOptions(origin ? isSecureOrigin(origin) : false, "/")
  );
  return res;
}
