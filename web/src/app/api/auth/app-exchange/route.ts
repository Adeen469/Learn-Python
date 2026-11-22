import { NextRequest, NextResponse } from "next/server";
import {
  APP_EXCHANGE_KIND,
  buildSessionPayload,
  getRequestOrigin,
  getSessionSecret,
  isSecureOrigin,
  isValidEmail,
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
  verifyToken,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { claimUsedToken, getUserByEmail } from "@/lib/auth-store";
import { setPending2fa } from "@/lib/auth-routes";
import { sha256Hex } from "@/lib/auth-email";

// Completes an Android-app Google sign-in. The app opens this URL in
// its OWN WebView after Google sends it back through the
// learnpython://auth deep link carrying a short-lived signed exchange
// code (issued by the callback). This endpoint verifies the code,
// signs the session, sets the session cookie IN THE WEBVIEW's jar,
// and redirects home — which is exactly what the plain callback
// cannot do, because it runs in Chrome (Custom Tab), a different
// cookie jar from the app.
//
// The code carries only the Google profile, never the signed session
// itself; it is HMAC-signed and expires in 5 minutes. A bad or
// expired code sends the user back to the sign-in page to retry.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let limit;
  try {
    limit = await checkRateLimit(`auth-app-exchange:${getClientIp(req)}`, 20, 60_000);
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
  const origin = getRequestOrigin(req);
  if (!secret || !origin) {
    console.error(
      JSON.stringify({ event: "auth_misconfigured", endpoint: "app-exchange" })
    );
    return NextResponse.json(
      { error: "Sign-in is not configured yet." },
      { status: 503 }
    );
  }
  const isSecure = isSecureOrigin(origin);

  const code = req.nextUrl.searchParams.get("code");
  const verified = code ? await verifyToken(secret, code) : { ok: false as const, reason: "missing" };
  const p = verified.ok ? verified.payload : null;
  if (
    !p ||
    p.kind !== APP_EXCHANGE_KIND ||
    !isValidEmail(p.email) ||
    typeof p.name !== "string" ||
    (typeof p.picture !== "string" && p.picture !== null)
  ) {
    console.log(
      JSON.stringify({ event: "auth_app_exchange_bad_code", endpoint: "app-exchange" })
    );
    // Back to the sign-in page — the user can retry Google sign-in.
    // Same as the callback: use the public origin, never req.url.
    return NextResponse.redirect(new URL("/auth/email", origin));
  }

  // Single-use exchange code (migration 005): the code travels in a
  // deep link, so a captured copy must not mint a second session
  // within its 5-minute window.
  if (code) {
    const fresh = await claimUsedToken(sha256Hex(code));
    if (!fresh) {
      console.log(
        JSON.stringify({ event: "auth_app_exchange_bad_code", endpoint: "app-exchange" })
      );
      return NextResponse.redirect(new URL("/auth/email", origin));
    }
  }

  const user = {
    email: p.email as string,
    name: p.name as string,
    picture: p.picture as string | null,
    auth: "google" as const,
    mfa: false,
  };
  // 2FA gate (same as the browser callback): the exchange code
  // carries no session, so the check belongs here, where the
  // session would be minted. A user with TOTP on gets the step-up
  // cookie instead, and finishes on /auth/2fa inside this same
  // WebView — the session cookie then lands in the app's jar.
  const row = await getUserByEmail(p.email);
  if (row?.totp_enabled) {
    const res = NextResponse.redirect(new URL("/auth/2fa", origin));
    await setPending2fa(res, secret, p.email, isSecure, "google");
    console.log(
      JSON.stringify({
        event: "auth_login_2fa_app_exchange",
        endpoint: "app-exchange",
        email: p.email,
      })
    );
    return res;
  }
  const token = await signSession(
    secret,
    buildSessionPayload(user, Math.floor(Date.now() / 1000), {
      sv: typeof p.sv === "number" ? p.sv : 0,
    })
  );
  // Native clients (React Native) ask for ?format=json: they fetch
  // this endpoint instead of loading it in a WebView, so a redirect
  // would swallow the Set-Cookie header. Answer JSON with the cookie
  // set; the client captures the cookie and calls /api/auth/me.
  if (req.nextUrl.searchParams.get("format") === "json") {
    const res = NextResponse.json({ user });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(isSecure));
    console.log(
      JSON.stringify({
        event: "auth_login_app_exchange",
        endpoint: "app-exchange",
        email: p.email,
      })
    );
    return res;
  }
  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(isSecure));
  console.log(
    JSON.stringify({
      event: "auth_login_app_exchange",
      endpoint: "app-exchange",
      email: p.email,
    })
  );
  return res;
}
