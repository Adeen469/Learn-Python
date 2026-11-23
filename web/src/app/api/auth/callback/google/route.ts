import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
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
  isSecureDeployment,
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
import {
  claimUsedToken,
  createGoogleUser,
  getUserByEmailResult,
  incrementSessionVersion,
} from "@/lib/auth-store";
import { setPending2fa, clearPending2fa, noStore } from "@/lib/auth-routes";
import { sha256Hex } from "@/lib/auth-email";

// Google OAuth callback. Validates the state cookie (CSRF), exchanges the
// code for tokens server-side, fetches the Google profile, and sets the
// signed session cookie. Google tokens are NEVER stored or sent to the
// client — only the profile goes into the session payload.
export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 10_000;

/** Constant-time equality for two state strings (false on bad input). */
function statesEqual(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

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
    limit = await checkRateLimit(
      `auth-callback:${getClientIp(req)}`,
      20,
      60_000,
      Date.now(),
      { failClosed: true }
    );
  } catch {
    return noStore(
      NextResponse.json(
        { error: "Sign-in is temporarily unavailable." },
        { status: 503 }
      )
    );
  }
  if (!limit.allowed) {
    return noStore(
      NextResponse.json(
        { error: "Too many requests — please slow down and retry shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        }
      )
    );
  }

  const secret = getSessionSecret();
  const google = getGoogleConfig();
  const origin = getRequestOrigin(req);
  if (!secret || !google || !origin) {
    console.error(
      JSON.stringify({ event: "auth_misconfigured", endpoint: "callback" })
    );
    return noStore(
      NextResponse.json(
        { error: "Sign-in is not configured yet." },
        { status: 503 }
      )
    );
  }
  const redirectUri = getRedirectUri(origin);
  // Secure comes from the deployment, never from request headers.
  const isSecure = isSecureDeployment();

  // The one-time OAuth cookies are cleared on every exit path below
  // (single-use by design) — including the 400 state-mismatch exits
  // (R3-L8), which used to leave a stale state/verifier behind.
  // R3-L7: the clear uses Path=/, matching the __Host- cookie.
  // R3-L1: auth responses are never cached.
  const clearOauthCookies = (res: NextResponse) => {
    res.cookies.set(
      OAUTH_STATE_COOKIE,
      "",
      clearCookieOptions(isSecure, "/")
    );
    res.cookies.set(
      OAUTH_VERIFIER_COOKIE,
      "",
      clearCookieOptions(isSecure, "/")
    );
    return noStore(res);
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
      return clearOauthCookies(
        NextResponse.json(
          { error: "Invalid sign-in response." },
          { status: 400 }
        )
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
      return clearOauthCookies(
        NextResponse.json(
          { error: "Invalid sign-in response." },
          { status: 400 }
        )
      );
    }
    appVerifier = verified.payload.verifier;
  }

  if (!isValidCode(code) || (!appVerifier && !isValidState(state))) {
    console.log(
      JSON.stringify({ event: "auth_bad_params", endpoint: "callback" })
    );
    return clearOauthCookies(
      NextResponse.json(
        { error: "Invalid sign-in response." },
        { status: 400 }
      )
    );
  }

  // State must match the cookie exactly. Constant-time compare
  // (L1): both values are random, so the timing channel is
  // negligible in practice — but the pattern is the point, and the
  // comparison must never be a plain === on secret strings.
  // Skipped in app mode: the signed state above IS the validation
  // there.
  const stateCookie = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const verifier = appVerifier ?? req.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;
  if (
    !verifier ||
    (!appVerifier && (!stateCookie || !statesEqual(stateCookie, state)))
  ) {
    console.log(
      JSON.stringify({ event: "auth_state_mismatch", endpoint: "callback" })
    );
    return clearOauthCookies(
      NextResponse.json(
        { error: "Invalid sign-in response." },
        { status: 400 }
      )
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
  // too. First Google sign-in creates the row (H3) — without it,
  // logout has nothing to revoke for a pure Google user and a
  // stolen session stays valid for 30 days after logout.
  //
  // Fail closed (R2-M3): a database error is NOT "no row". If the
  // row cannot be read, or still cannot be created, sign-in stops
  // here with a 503 and mints nothing — a DB blip must never mint
  // an unrevocable 30-day session with sv 0 and no row behind it.
  const lookup = await getUserByEmailResult(email);
  if (lookup.status === "error") {
    return clearOauthCookies(
      NextResponse.json(
        { error: "Could not complete sign-in. Please try again." },
        { status: 503 }
      )
    );
  }
  let row = lookup.status === "found" ? lookup.user : null;
  if (!row) {
    row = await createGoogleUser({ email, name });
    if (!row) {
      // Lost a race (or the create failed): one re-read decides —
      // a row that exists by now is used, anything else fails
      // closed instead of minting with sv 0.
      const again = await getUserByEmailResult(email);
      if (again.status !== "found") {
        return clearOauthCookies(
          NextResponse.json(
            { error: "Could not complete sign-in. Please try again." },
            { status: 503 }
          )
        );
      }
      row = again.user;
    }
  }
  // Session rotation (R2-M5, atomic per R2-M11): a fresh Google
  // sign-in invalidates every older token, like password sign-in
  // already does — a stolen session must not survive the victim
  // signing in again. The exchange code and the session below both
  // carry the bumped version; a failed bump mints nothing.
  const sv = await incrementSessionVersion(row.id);
  if (sv === null) {
    return clearOauthCookies(
      NextResponse.json(
        { error: "Could not complete sign-in. Please try again." },
        { status: 503 }
      )
    );
  }
  // 2FA gate (same as email sign-in): a user with TOTP on never
  // gets a session here — they get the short-lived step-up cookie
  // and finish on /auth/2fa, which issues the session with mfa: true.
  const needs2fa = row?.totp_enabled === true;

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
      JSON.stringify({
        event: "auth_login_app",
        endpoint: "callback",
        emailHash: sha256Hex(email),
      })
    );
    return noStore(
      NextResponse.redirect(buildAppAuthReturnUrl(exchangeCode))
    );
  }

  if (needs2fa) {
    const res = clearOauthCookies(
      NextResponse.redirect(new URL("/auth/2fa", origin))
    );
    await setPending2fa(res, secret, email, isSecure, "google");
    console.log(
      JSON.stringify({
        event: "auth_login_2fa",
        endpoint: "callback",
        emailHash: sha256Hex(email),
      })
    );
    return res;
  }

  const token = await signSession(
    secret,
    buildSessionPayload({ email, name, picture }, Math.floor(Date.now() / 1000), { sv })
  );
  // Same as above: use the public origin, never req.url (0.0.0.0:3000).
  const res = clearOauthCookies(NextResponse.redirect(new URL("/", origin)));
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(isSecure));
  // R3-L2: a stale pending-2FA cookie must never survive a fresh
  // sign-in (same as verify-otp already does).
  clearPending2fa(res, isSecure);
  console.log(
    JSON.stringify({
      event: "auth_login",
      endpoint: "callback",
      emailHash: sha256Hex(email),
    })
  );
  return res;
}
