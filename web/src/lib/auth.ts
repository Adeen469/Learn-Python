// Google sign-in — server-only helpers (HMAC-signed stateless sessions).
//
// Pattern: authorization-code flow, server-side only. The Google
// access/refresh tokens are NEVER stored and NEVER sent to the client —
// only the Google profile (email, name, picture) goes into the session
// payload. The session is a stateless HMAC-SHA256 signed cookie
// (WebCrypto), 30-day expiry, HttpOnly + Secure-on-https + SameSite=Lax.
//
// This file is imported ONLY by API route handlers. It must never be
// imported by a client component — SESSION_SECRET and GOOGLE_CLIENT_SECRET
// are server-only env vars. The pure functions below (base64url, PKCE,
// sign/verify) are mirrored inline in web/tests/auth.test.mjs.
//
// Fail-closed: getSessionSecret() / getGoogleConfig() return null when
// the env vars are missing or too short — routes answer 503, never a
// fallback secret and never a session.

export interface SessionUser {
  email: string;
  name: string;
  picture: string | null;
}

export interface SessionPayload extends SessionUser {
  iat: number; // issued-at, seconds since epoch
  exp: number; // expiry, seconds since epoch
}

export const SESSION_COOKIE = "lp_session";
export const OAUTH_STATE_COOKIE = "lp_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "lp_oauth_verifier";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days
export const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60; // 10 minutes
export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_URL =
  "https://openidconnect.googleapis.com/v1/userinfo";
export const GOOGLE_SCOPE = "openid email profile";

// ---------------------------------------------------------------------------
// base64url (Buffer-based; server runtime is Node)
// ---------------------------------------------------------------------------

export function base64urlEncode(data: Uint8Array | string): string {
  const buf =
    typeof data === "string" ? Buffer.from(data, "utf8") : Buffer.from(data);
  return buf.toString("base64url");
}

export function base64urlDecode(input: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(input)) return null;
  try {
    const buf = Buffer.from(input, "base64url");
    // Strict: the input must round-trip, otherwise it was not canonical.
    if (buf.toString("base64url") !== input) return null;
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Random values + PKCE (RFC 7636, S256)
// ---------------------------------------------------------------------------

export function randomBase64url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return base64urlEncode(new Uint8Array(digest));
}

// ---------------------------------------------------------------------------
// Session sign / verify (HMAC-SHA256, token "v1.<payload>.<signature>")
// ---------------------------------------------------------------------------

async function hmacKey(
  secret: string,
  usage: KeyUsage[]
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage
  );
}

export async function signSession(
  secret: string,
  payload: SessionPayload
): Promise<string> {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64urlEncode(payloadJson);
  const key = await hmacKey(secret, ["sign"]);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );
  return `v1.${payloadB64}.${base64urlEncode(new Uint8Array(sig))}`;
}

export type VerifyResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: string };

export async function verifySession(
  secret: string,
  token: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): Promise<VerifyResult> {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") {
    return { ok: false, reason: "malformed" };
  }
  const [, payloadB64, sigB64] = parts;
  const payloadBytes = base64urlDecode(payloadB64);
  const sigBytes = base64urlDecode(sigB64);
  if (!payloadBytes || !sigBytes) {
    return { ok: false, reason: "malformed" };
  }
  const key = await hmacKey(secret, ["verify"]);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes as BufferSource,
    new TextEncoder().encode(payloadB64)
  );
  if (!valid) return { ok: false, reason: "bad_signature" };
  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, reason: "malformed" };
  }
  const p = payload as Record<string, unknown>;
  if (
    typeof p.email !== "string" ||
    !isValidEmail(p.email) ||
    typeof p.name !== "string" ||
    typeof p.iat !== "number" ||
    typeof p.exp !== "number" ||
    (typeof p.picture !== "string" && p.picture !== null)
  ) {
    return { ok: false, reason: "malformed" };
  }
  if (p.exp <= nowSeconds) return { ok: false, reason: "expired" };
  if (p.iat > nowSeconds + 60) return { ok: false, reason: "not_yet_valid" };
  return {
    ok: true,
    user: {
      email: p.email,
      name: p.name,
      picture: p.picture as string | null,
    },
  };
}

export function buildSessionPayload(
  user: SessionUser,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): SessionPayload {
  return {
    email: user.email,
    name: user.name,
    picture: user.picture,
    iat: nowSeconds,
    exp: nowSeconds + SESSION_MAX_AGE_SECONDS,
  };
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  if (email.length < 3 || email.length > 254) return false;
  // Single @, no spaces, dot in the domain part.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** OAuth `state`: 1-256 chars, base64url alphabet only. */
export function isValidState(state: unknown): state is string {
  return (
    typeof state === "string" &&
    state.length >= 1 &&
    state.length <= 256 &&
    /^[A-Za-z0-9_-]+$/.test(state)
  );
}

/** Authorization code: 1-1024 chars, no whitespace or control chars. */
export function isValidCode(code: unknown): code is string {
  return (
    typeof code === "string" &&
    code.length >= 1 &&
    code.length <= 1024 &&
    !/[\s\x00-\x1f\x7f]/.test(code)
  );
}

/** Google picture URL: must be an https URL (lh3.googleusercontent.com). */
export function sanitizePictureUrl(picture: unknown): string | null {
  if (typeof picture !== "string" || picture.length === 0) return null;
  try {
    const url = new URL(picture);
    if (url.protocol !== "https:") return null;
    return picture;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Env config — fail closed (null when missing / too short)
// ---------------------------------------------------------------------------

export function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

export function getGoogleConfig(): {
  clientId: string;
  clientSecret: string;
} | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

// ---------------------------------------------------------------------------
// Origin + redirect URI (derived from the request, never hardcoded)
// ---------------------------------------------------------------------------

/**
 * Public origin of this request: x-forwarded-proto (set by Fly's proxy)
 * + host header. Google only ever redirects back to a URI registered in
 * the OAuth client, so a tampered Host header can only break the flow,
 * never redirect a token somewhere else.
 */
export function getRequestOrigin(req: Request): string | null {
  const forwardedProto = req.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const host =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    req.headers.get("host")?.trim();
  if (!host || /[\s/@]/.test(host)) return null;
  const proto =
    forwardedProto || new URL(req.url).protocol.replace(":", "") || "http";
  if (proto !== "http" && proto !== "https") return null;
  return `${proto}://${host}`;
}

export function getRedirectUri(origin: string): string {
  return `${origin}/api/auth/callback/google`;
}

export function isSecureOrigin(origin: string): boolean {
  return origin.startsWith("https://");
}

// ---------------------------------------------------------------------------
// Google authorization URL (pure)
// ---------------------------------------------------------------------------

export function buildGoogleAuthUrl(args: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", args.clientId);
  url.searchParams.set("redirect_uri", args.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_SCOPE);
  url.searchParams.set("state", args.state);
  url.searchParams.set("code_challenge", args.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

// ---------------------------------------------------------------------------
// Cookie options (pure — testable)
// ---------------------------------------------------------------------------

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
}

export function sessionCookieOptions(isSecure: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function oauthCookieOptions(isSecure: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/api/auth/callback/google",
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  };
}

export function clearCookieOptions(isSecure: boolean, path: string): CookieOptions {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path,
    maxAge: 0,
  };
}
