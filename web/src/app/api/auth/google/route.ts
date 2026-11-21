import { NextRequest, NextResponse } from "next/server";
import {
  APP_STATE_KIND,
  APP_STATE_MAX_AGE_SECONDS,
  buildGoogleAuthUrl,
  getGoogleConfig,
  getRedirectUri,
  getRequestOrigin,
  getSessionSecret,
  isAppRequest,
  isSecureOrigin,
  oauthCookieOptions,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  pkceChallenge,
  randomBase64url,
  signToken,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Starts the Google sign-in (authorization-code flow, server-side only).
// Sets short-lived HttpOnly state + PKCE verifier cookies, then redirects
// the browser to accounts.google.com. Fail-closed 503 when the OAuth
// config or SESSION_SECRET is missing — never a fallback secret.
export const dynamic = "force-dynamic";

const SERVICE_UNAVAILABLE = () =>
  NextResponse.json({ error: "Sign-in is not configured yet." }, { status: 503 });

export async function GET(req: NextRequest) {
  let limit;
  try {
    limit = await checkRateLimit(`auth-google:${getClientIp(req)}`, 20, 60_000);
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

  // Both the Google config and the session secret must exist: the
  // callback signs the session with SESSION_SECRET, so starting a flow
  // that cannot finish would strand the user at Google.
  if (!getGoogleConfig() || !getSessionSecret()) {
    console.error(
      JSON.stringify({ event: "auth_misconfigured", endpoint: "google" })
    );
    return SERVICE_UNAVAILABLE();
  }

  const origin = getRequestOrigin(req);
  if (!origin) return SERVICE_UNAVAILABLE();
  const redirectUri = getRedirectUri(origin);
  const isSecure = isSecureOrigin(origin);
  const googleConfig = getGoogleConfig();
  if (!googleConfig) return SERVICE_UNAVAILABLE();
  const { clientId } = googleConfig;

  // App mode (Android WebView wrapper, or the React Native app):
  // the sign-in continues in a Chrome Custom Tab / system browser
  // and the callback runs there, in a different cookie jar from the
  // app's WebView — so state/verifier cookies set here would never
  // reach the callback. Instead the SIGNED state carries the nonce +
  // PKCE verifier through Google itself. No cookies are set in this
  // branch. Triggered by the app's user-agent marker (LPapp WebView)
  // or by ?app=1 (React Native app, which opens the URL in the
  // system browser and has no app user-agent marker).
  if (
    req.nextUrl.searchParams.get("app") === "1" ||
    isAppRequest(req.headers.get("user-agent"))
  ) {
    const secret = getSessionSecret();
    if (!secret) return SERVICE_UNAVAILABLE();
    const nowSeconds = Math.floor(Date.now() / 1000);
    const verifier = randomBase64url(64);
    const challenge = await pkceChallenge(verifier);
    const state = await signToken(secret, {
      kind: APP_STATE_KIND,
      nonce: randomBase64url(16),
      verifier,
      iat: nowSeconds,
      exp: nowSeconds + APP_STATE_MAX_AGE_SECONDS,
    });
    console.log(JSON.stringify({ event: "auth_start_app", endpoint: "google" }));
    return NextResponse.redirect(
      buildGoogleAuthUrl({ clientId, redirectUri, state, codeChallenge: challenge })
    );
  }

  const state = randomBase64url(32);
  const verifier = randomBase64url(64);
  const challenge = await pkceChallenge(verifier);

  const res = NextResponse.redirect(
    buildGoogleAuthUrl({ clientId, redirectUri, state, codeChallenge: challenge })
  );
  const cookieOpts = oauthCookieOptions(isSecure);
  res.cookies.set(OAUTH_STATE_COOKIE, state, cookieOpts);
  res.cookies.set(OAUTH_VERIFIER_COOKIE, verifier, cookieOpts);

  console.log(JSON.stringify({ event: "auth_start", endpoint: "google" }));
  return res;
}
