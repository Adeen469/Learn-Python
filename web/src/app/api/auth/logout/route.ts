import { NextRequest, NextResponse } from "next/server";
import {
  getSessionSecret,
  isSecureDeployment,
  LEGACY_SESSION_COOKIE,
  SESSION_COOKIE,
} from "@/lib/auth";
import {
  createGoogleUser,
  getUserByEmail,
  updateUser,
} from "@/lib/auth-store";
import { clearSessionCookies, getSessionUserRaw } from "@/lib/auth-routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Signs out: expires the session cookie AND revokes the session
// server-side by bumping the user's session_version, so a copied
// token stops verifying (getSessionUser enforces the version).
// POST only (a GET logout would be triggerable cross-site via an
// <img> tag). The cookies are always cleared, even when
// SESSION_SECRET is missing. But when a session token WAS presented
// and revocation could not be done, the failure is now surfaced
// (M9) instead of a false { ok: true }.
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

  const isSecure = isSecureDeployment();
  const secret = getSessionSecret();
  const presentedToken =
    req.cookies.get(SESSION_COOKIE)?.value ??
    req.cookies.get(LEGACY_SESSION_COOKIE)?.value ??
    null;

  // Server-side revocation: bump the stored version so this token
  // (and any copy of it) stops verifying. Only the version moves —
  // the TOTP failure counter is untouched. Revocation is attempted
  // from the raw (signature-valid) token even when the version
  // check fails (M9): getSessionUser returns null for an already
  // revoked session or during a DB blip, and skipping revocation
  // then would leave a copied token live while the user believes
  // they signed out. A missing row (a Google session from before
  // rows were created at sign-in) gets a row first, then the bump.
  // An expired or garbage token has nothing live to revoke, so it
  // still signs out cleanly; a token that cannot even be checked
  // (no secret) is a failure, not a success.
  let revoked = false;
  let hadLiveToken = false;
  if (secret) {
    const user = await getSessionUserRaw(req, secret);
    if (user) {
      hadLiveToken = true;
      let row = await getUserByEmail(user.email);
      if (!row) {
        row = await createGoogleUser({
          email: user.email,
          name: user.name,
        });
      }
      if (row) {
        revoked = await updateUser(row.id, {
          session_version: (row.session_version ?? 0) + 1,
        });
      }
    }
  } else if (presentedToken) {
    hadLiveToken = true;
  }

  if (hadLiveToken && !revoked) {
    // A token was presented but no revocation landed (no secret, no
    // row could be created, or the DB write failed). The cookies are
    // still cleared, so this browser is signed out — but a copied
    // token may still be live, and the caller must know that.
    const res = NextResponse.json(
      {
        error:
          "Could not revoke the session on the server. Your browser is signed out, but a copied session token may still work — please try signing out again.",
      },
      { status: 503 }
    );
    clearSessionCookies(res, isSecure);
    return res;
  }

  const res = NextResponse.json({ ok: true });
  clearSessionCookies(res, isSecure);
  return res;
}
