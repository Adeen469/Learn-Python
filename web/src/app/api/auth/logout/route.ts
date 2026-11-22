import { NextRequest, NextResponse } from "next/server";
import {
  clearCookieOptions,
  getRequestOrigin,
  getSessionSecret,
  isSecureOrigin,
  SESSION_COOKIE,
} from "@/lib/auth";
import { getUserByEmail, updateUser } from "@/lib/auth-store";
import { getSessionUser } from "@/lib/auth-routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Signs out: expires the session cookie AND revokes the session
// server-side by bumping the user's session_version, so a copied
// token stops verifying (getSessionUser enforces the version).
// Pure Google users have no row — for them the cookie clear is all
// there is. POST only (a GET logout would be triggerable cross-site
// via an <img> tag). Clearing the cookie is safe even when
// SESSION_SECRET is missing, so logout never 503s on a
// misconfigured secret — it just destroys the cookie.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let limit;
  try {
    limit = await checkRateLimit(`auth-logout:${getClientIp(req)}`, 30, 60_000);
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
  // Server-side revocation: bump the stored version so this token
  // (and any copy of it) stops verifying. Only the version moves —
  // the TOTP failure counter is untouched. A missing row (pure
  // Google user), a missing secret, or a DB error leaves just the
  // cookie clear; logout still succeeds.
  const secret = getSessionSecret();
  if (secret) {
    const user = await getSessionUser(req, secret);
    if (user) {
      const row = await getUserByEmail(user.email);
      if (row) {
        await updateUser(row.id, {
          session_version: (row.session_version ?? 0) + 1,
        });
      }
    }
  }
  return res;
}
