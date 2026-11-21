import { NextRequest, NextResponse } from "next/server";
import {
  APP_EXCHANGE_KIND,
  APP_EXCHANGE_MAX_AGE_SECONDS,
  APP_STATE_KIND,
  buildAppAuthReturnUrl,
  buildSessionPayload,
  clearCookieOptions,
  getGoogleConfig,
  getRedirectUri,
  getRequestOrigin,
  getSessionSecret,
  GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL,
  isSecureOrigin,
  isValidCode,
  isValidEmail,
  isValidState,
  isVerifiedGoogleEmail,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  sanitizePictureUrl,
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
  signToken,
  verifyToken,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { claimUsedToken, getUserByEmail } from "@/lib/auth-store";
import { sha256Hex } from "@/lib/auth-email";

// Google OAuth callback. Validates the state cookie (CSRF), exchanges the
// code for tokens server-side, fetches the Google profile, and sets the
// signed session cookie. Google tokens are NEVER stored or sent to the
// client — only the profile goes into the session payload.
export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 10_000;

function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export async function GET(req: NextRequest) {
  let limit;
  try {
    limit = await checkRateLimit(`auth-callback:${getClientIp(req)}`, 20, 60_000);
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
  const google = getGoogleConfig();
  const origin = getRequestOrigin(req);
  if (!secret || !google || !origin) {
    console.error(
      JSON.stringify({ event: "auth_misconfigured", endpoint: "callback" })
    );
    return NextResponse.json(
      { error: "Sign-in is not configured yet." },
      { status: 503 }
    );
  }
  const redirectUri = getRedirectUri(origin);
  const isSecure = isSecureOrigin(origin);

  // The one-time OAuth cookies are cleared on every exit path below that
  // passes state validation (single-use by design).
  const clearOauthCookies = (res: NextResponse) => {
    res.cookies.set(
      OAUTH_STATE_COOKIE,
      "",
      clearCookieOptions(isSecure, "/api/auth/callback/google")
    );
    res.cookies.set(
      OAUTH_VERIFIER_COOKIE,
      "",
      clearCookieOptions(isSecure, "/api/auth/callback/google")
    );
    return res;
  };

  const params = req.nextUrl.searchParams;
  const error = params.get("error");
  if (error) {
    // The user denied access at Google (or Google refused). Back to the
    // landing page — no session, nothing logged beyond the event.
    console.log(
      JSON.stringify({ event: "auth_denied", endpoint: "callback" })
    );
    // Redirect to the public origin, NOT req.url: behind Fly's proxy
    // req.url resolves to the server's own bind address (0.0.0.0:3000),
    // which is invalid in a browser (ERR_ADDRESS_INVALID).
    return clearOauthCookies(NextResponse.redirect(new URL("/", origin)));
  }

  const code = params.get("code");
  const state = params.get("state");

  // App mode: the state is a signed token (v1p.) carrying the PKCE
  // verifier. It arrives here from Chrome, where the state/verifier
  // cookies set at /api/auth/google never landed — so there is no
  // cookie to compare against. Verify the signature instead; a v1p.
  // token of any other kind (e.g. a 2FA pending token) is rejected.
  // Browser mode keeps the cookie check below, untouched.
  let appVerifier: string | null = null;
  if (state && state.startsWith("v1p.")) {
    const verified = await verifyToken(secret, state);
    if (
      !verified.ok ||
      verified.payload.kind !== APP_STATE_KIND ||
      typeof verified.payload.verifier !== "string"
    ) {
      console.log(
        JSON.stringify({ event: "auth_state_mismatch", endpoint: "callback" })
      );
      return NextResponse.json(
        { error: "Invalid sign-in response." },
        { status: 400 }
      );
    }
    // Single-use state (migration 005): the signed state travels in
    // the Custom Tab's URL, so a captured copy must not start a
    // second sign-in within its 10-minute window.
    const fresh = await claimUsedToken(sha256Hex(state));
    if (!fresh) {
      console.log(
        JSON.stringify({ event: "auth_state_mismatch", endpoint: "callback" })
      );
      return NextResponse.json(
        { error: "Invalid sign-in response." },
        { status: 400 }
      );
    }
    appVerifier = verified.payload.verifier;
  }

  if (!isValidCode(code) || (!appVerifier && !isValidState(state))) {
    console.log(
      JSON.stringify({ event: "auth_bad_params", endpoint: "callback" })
    );
    return NextResponse.json(
      { error: "Invalid sign-in response." },
      { status: 400 }
    );
  }

  // State must match the cookie exactly (constant-time compare inside
  // subtle.verify is not needed here — both values are random and the
  // comparison is a plain equality on secret strings; a mismatch only
  // ever yields a 400, never a session). Skipped in app mode: the
  // signed state above IS the validation there.
  const stateCookie = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const verifier = appVerifier ?? req.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;
  if (!verifier || (!appVerifier && (!stateCookie || stateCookie !== state))) {
    console.log(
      JSON.stringify({ event: "auth_state_mismatch", endpoint: "callback" })
    );
    return NextResponse.json(
      { error: "Invalid sign-in response." },
      { status: 400 }
    );
  }

  // Exchange the code for tokens (server-to-server, 10s timeout).
  let tokenData: { access_token?: unknown };
  try {
    const tokenRes = await fetchWithTimeout(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: google.clientId,
        client_secret: google.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
    });
    if (!tokenRes.ok) {
      console.error(
        JSON.stringify({
          event: "auth_token_exchange_failed",
          endpoint: "callback",
          status: tokenRes.status,
        })
      );
      return clearOauthCookies(
        NextResponse.json(
          { error: "Could not complete sign-in. Please try again." },
          { status: 502 }
        )
      );
    }
    tokenData = (await tokenRes.json()) as { access_token?: unknown };
  } catch (e) {
    console.error(
      JSON.stringify({
        event: "auth_token_exchange_error",
        endpoint: "callback",
        error: e instanceof Error ? e.name : "unknown",
      })
    );
    return clearOauthCookies(
      NextResponse.json(
        { error: "Could not complete sign-in. Please try again." },
        { status: 502 }
      )
    );
  }

  const accessToken = tokenData.access_token;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    console.error(
      JSON.stringify({
        event: "auth_token_exchange_failed",
        endpoint: "callback",
      })
    );
    return clearOauthCookies(
      NextResponse.json(
        { error: "Could not complete sign-in. Please try again." },
        { status: 502 }
      )
    );
  }

  // Fetch the Google profile. The access token lives only in this scope
  // and is never logged, stored, or sent to the client.
  let profile: Record<string, unknown>;
  try {
    const userRes = await fetchWithTimeout(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      console.error(
        JSON.stringify({
          event: "auth_userinfo_failed",
          endpoint: "callback",
          status: userRes.status,
        })
      );
      return clearOauthCookies(
        NextResponse.json(
          { error: "Could not complete sign-in. Please try again." },
          { status: 502 }
        )
      );
    }
    profile = (await userRes.json()) as Record<string, unknown>;
  } catch (e) {
    console.error(
      JSON.stringify({
        event: "auth_userinfo_error",
        endpoint: "callback",
        error: e instanceof Error ? e.name : "unknown",
      })
    );
    return clearOauthCookies(
      NextResponse.json(
        { error: "Could not complete sign-in. Please try again." },
        { status: 502 }
      )
    );
  }

  const email = profile.email;
  if (!isValidEmail(email) || !isVerifiedGoogleEmail(profile)) {
    console.error(
      JSON.stringify({ event: "auth_unverified_email", endpoint: "callback" })
    );
    return clearOauthCookies(
      NextResponse.json(
        { error: "Could not verify your Google account." },
        { status: 502 }
      )
    );
  }
  const name =
    typeof profile.name === "string" && profile.name.length > 0
      ? profile.name
      : email.split("@")[0];
  const picture = sanitizePictureUrl(profile.picture);

  // The session carries the user's version when they also have an
  // email account, so a password reset revokes this Google session
  // too. Pure Google users have no row — sv 0.
  const row = await getUserByEmail(email);
  const sv = row?.session_version ?? 0;

  if (appVerifier) {
    // App mode: a session cookie set here would land in Chrome's jar,
    // not the app's WebView. Hand the app a short-lived signed
    // exchange code instead; the app swaps it for a session inside its
    // own WebView at /api/auth/app-exchange. The code carries only the
    // profile, never the signed session itself.
    const nowSeconds = Math.floor(Date.now() / 1000);
    const exchangeCode = await signToken(secret, {
      kind: APP_EXCHANGE_KIND,
      email,
      name,
      picture,
      auth: "google",
      mfa: false,
      sv,
      iat: nowSeconds,
      exp: nowSeconds + APP_EXCHANGE_MAX_AGE_SECONDS,
    });
    console.log(
      JSON.stringify({ event: "auth_login_app", endpoint: "callback", email })
    );
    return NextResponse.redirect(buildAppAuthReturnUrl(exchangeCode));
  }

  const token = await signSession(
    secret,
    buildSessionPayload({ email, name, picture }, Math.floor(Date.now() / 1000), { sv })
  );
  // Same as above: use the public origin, never req.url (0.0.0.0:3000).
  const res = clearOauthCookies(NextResponse.redirect(new URL("/", origin)));
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(isSecure));
  console.log(
    JSON.stringify({ event: "auth_login", endpoint: "callback", email })
  );
  return res;
}
