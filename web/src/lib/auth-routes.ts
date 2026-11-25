// Shared helpers for the email-auth + 2FA API routes.
//
// Server-only. Every route in this area follows the same shape:
// rate-limit first, then fail-closed 503 when the session secret or
// the service-role Supabase client is missing, then the work.

import { NextRequest, NextResponse } from "next/server";
import {
  buildSessionPayload,
  clearCookieOptions,
  getRequestOrigin,
  getSessionSecret,
  isSecureDeployment,
  LEGACY_SESSION_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
  signToken,
  verifySession,
  verifyToken,
  type SessionUser,
} from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PENDING_2FA_COOKIE = "lp_2fa_pending";
export const PENDING_2FA_MAX_AGE_SECONDS = 10 * 60; // 10 minutes

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * R3-L1: auth state must never sit in a shared cache. Stamp
 * `Cache-Control: private, no-store` on an auth GET response
 * (me, 2fa/pending, 2fa/status, and every other auth GET).
 */
export function noStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

/**
 * R3-L3: fixed delay for the no-account path of forgot / send-otp.
 * A real account pays a DB count + store + SMTP; without this the
 * response time alone reveals whether the email exists.
 */
export function sameCostDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function serviceUnavailable(endpoint: string): NextResponse {
  console.error(JSON.stringify({ event: "auth_misconfigured", endpoint }));
  return jsonError("Sign-in is not configured yet.", 503);
}

/**
 * Per-IP sliding-window limit. Returns a 429 response when exceeded,
 * a 503 when the limiter itself fails, or null when the request may
 * proceed. `failClosed` (Phase 3, auth routes only): when Redis IS
 * configured but its call errors, checkRateLimit throws and this
 * answers 503 instead of falling back to per-instance memory.
 */
export async function rateLimit(
  req: NextRequest,
  key: string,
  limit: number,
  windowMs: number,
  opts: { failClosed?: boolean } = {}
): Promise<NextResponse | null> {
  let result;
  try {
    result = await checkRateLimit(
      `${key}:${getClientIp(req)}`,
      limit,
      windowMs,
      Date.now(),
      opts
    );
  } catch {
    return jsonError("Sign-in is temporarily unavailable.", 503);
  }
  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(result.retryAfterSeconds) },
      }
    );
  }
  return null;
}

export interface AuthPrereqs {
  secret: string;
  supabase: SupabaseClient;
  origin: string;
  isSecure: boolean;
}

/** Session secret + service-role client + public origin, or null. */
export function getAuthPrereqs(req: NextRequest): AuthPrereqs | null {
  const secret = getSessionSecret();
  const supabase = getSupabaseAdmin();
  const origin = getRequestOrigin(req);
  if (!secret || !supabase || !origin) return null;
  // Secure comes from the deployment, never from request headers.
  return { secret, supabase, origin, isSecure: isSecureDeployment() };
}

/** Sign the session and set the lp_session cookie on the response. */
export async function issueSession(
  res: NextResponse,
  secret: string,
  user: SessionUser,
  isSecure: boolean,
  opts: { auth?: "google" | "email"; mfa?: boolean; sv?: number } = {}
): Promise<void> {
  const token = await signSession(
    secret,
    buildSessionPayload(user, Math.floor(Date.now() / 1000), opts)
  );
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(isSecure));
}

/**
 * Set the short-lived 2FA step-up cookie (HMAC-signed, "v1p." prefix).
 * `auth` records which first factor brought the user here, so the
 * verify step issues the session with the right method (a Google
 * sign-in with 2FA on must not come back as an email session).
 * Defaults to "email" — the email sign-in and OTP flows.
 */
export async function setPending2fa(
  res: NextResponse,
  secret: string,
  email: string,
  isSecure: boolean,
  auth: "google" | "email" = "email"
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const token = await signToken(secret, {
    kind: "2fa",
    email,
    auth,
    iat: now,
    exp: now + PENDING_2FA_MAX_AGE_SECONDS,
  });
  res.cookies.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_2FA_MAX_AGE_SECONDS,
  });
}

export function clearPending2fa(
  res: NextResponse,
  isSecure: boolean
): void {
  res.cookies.set(
    PENDING_2FA_COOKIE,
    "",
    clearCookieOptions(isSecure, "/")
  );
}

/**
 * Read + verify the 2FA step-up cookie. Returns the email and the
 * first-factor method, or null. Tokens issued before the `auth`
 * field existed verify as "email".
 */
export async function readPending2fa(
  req: NextRequest,
  secret: string
): Promise<{ email: string; auth: "google" | "email" } | null> {
  const token = req.cookies.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;
  const verified = await verifyToken(secret, token);
  if (!verified.ok) return null;
  const p = verified.payload;
  if (p.kind !== "2fa" || typeof p.email !== "string") return null;
  if (
    p.auth !== undefined &&
    p.auth !== "google" &&
    p.auth !== "email"
  ) {
    return null;
  }
  return {
    email: p.email,
    auth: (p.auth as "google" | "email" | undefined) ?? "email",
  };
}

/** Read + verify the lp_session cookie. Returns the user, or null. */
export async function getSessionUser(
  req: NextRequest,
  secret: string
): Promise<SessionUser | null> {
  const verified = await getSessionUserRaw(req, secret);
  if (!verified) return null;
  // Session revocation (migration 005): when the user has a database
  // row, its session_version must match the one signed into this
  // session — a password reset (or logout) bumps the stored version,
  // so every older session fails here. A pure Google user has no row
  // and passes on the signature alone. But when the version check
  // itself cannot run (no client, query error), the session FAILS —
  // a DB blip must not silently pass a revoked session.
  const check = await getSessionCheckByEmail(verified.email);
  if (!check.ok) return null;
  if (check.version !== null && check.version !== (verified.sv ?? 0)) {
    return null;
  }
  // 2FA step-up (H2): a session minted with mfa:false stops working
  // the moment the user turns TOTP on. Without this, a stolen
  // pre-2FA session keeps full access forever after 2FA is enabled.
  if (check.version !== null && check.totpEnabled && verified.mfa !== true) {
    return null;
  }
  return verified;
}

/**
 * Signature-only session check: the user from a valid (unexpired,
 * correctly signed) session cookie, with NO database check. Used
 * only by logout (M9), which must still attempt revocation by email
 * when the version check itself fails — a DB blip must not let a
 * logout silently skip revocation. Never use this to authorise
 * anything: it cannot tell a revoked session from a live one.
 */
export async function getSessionUserRaw(
  req: NextRequest,
  secret: string
): Promise<SessionUser | null> {
  // No legacy fallback (R2-L7): the pre-rename `lp_session` cookie is
  // no longer honoured. Reading it let a sibling subdomain toss the
  // attacker's own valid session onto a signed-out victim's browser
  // and sign them in as the attacker — the exact attack the `__Host-`
  // rename was meant to close. Clearing the legacy cookie on sign-out
  // (clearSessionCookies) stays — only reading it is gone.
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const verified = await verifySession(secret, token);
  if (!verified.ok) return null;
  return verified.user;
}

/**
 * Clear every auth cookie a sign-out must kill (M9): the session
 * (current name + the pre-rename legacy name), the pending-2FA
 * step-up cookie, and the OAuth state/verifier cookies. A leftover
 * pending-2FA cookie narrows an attacker's remaining work to just
 * the second factor.
 */
export function clearSessionCookies(
  res: NextResponse,
  isSecure: boolean
): void {
  res.cookies.set(
    SESSION_COOKIE,
    "",
    clearCookieOptions(isSecure, "/")
  );
  if (LEGACY_SESSION_COOKIE !== SESSION_COOKIE) {
    res.cookies.set(
      LEGACY_SESSION_COOKIE,
      "",
      clearCookieOptions(isSecure, "/")
    );
  }
  clearPending2fa(res, isSecure);
  // R3-L7: __Host- cookies live at Path=/ now, so the clear must
  // use Path=/ too — a clear at the old callback path would miss.
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
}

/**
 * Clear ONLY the session cookies (current name + the pre-rename
 * legacy name). Used by /api/auth/me on 401: a caller with no
 * session is often mid-sign-in — the 2FA step-up cookie or the
 * OAuth state/verifier cookies ARE the in-progress sign-in, and
 * wiping them kills it. That is exactly what broke Google+2FA
 * login: the 2FA page's own load calls /api/auth/me (the app
 * shell's session check), the 401 cleared lp_2fa_pending, and
 * every code submit then 401'd "sign-in step expired". A real
 * sign-out still uses clearSessionCookies above, which kills
 * everything.
 */
export function clearStaleSessionCookies(
  res: NextResponse,
  isSecure: boolean
): void {
  res.cookies.set(
    SESSION_COOKIE,
    "",
    clearCookieOptions(isSecure, "/")
  );
  if (LEGACY_SESSION_COOKIE !== SESSION_COOKIE) {
    res.cookies.set(
      LEGACY_SESSION_COOKIE,
      "",
      clearCookieOptions(isSecure, "/")
    );
  }
}

/**
 * Sliding-window limit on an explicit key (not the client IP).
 * Used for per-account / per-email / per-token limits (M7) on top
 * of the per-IP limit: an attacker rotating IPs still hits the
 * per-account budget. Same 429/503 shape as rateLimit.
 */
export async function rateLimitKey(
  key: string,
  limit: number,
  windowMs: number,
  opts: { failClosed?: boolean } = {}
): Promise<NextResponse | null> {
  let result;
  try {
    result = await checkRateLimit(key, limit, windowMs, Date.now(), opts);
  } catch {
    return jsonError("Sign-in is temporarily unavailable.", 503);
  }
  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(result.retryAfterSeconds) },
      }
    );
  }
  return null;
}

/**
 * Largest JSON body any auth route accepts (R2-M13). Auth bodies are
 * a few hundred bytes (email, password, a 6-digit code); 64 KiB is
 * already generous. Bodies over this are rejected before parsing,
 * so a 4.5 MB JSON post cannot burn function CPU/memory on parse.
 */
export const MAX_AUTH_JSON_BYTES = 64 * 1024;

/** Parse a JSON body, or null when it is not valid JSON / not an object. */
export async function readJsonBody(
  req: NextRequest,
  maxBytes: number = MAX_AUTH_JSON_BYTES
): Promise<Record<string, unknown> | null> {
  // Content-Length pre-check: refuse oversized bodies before parsing.
  const contentLength = req.headers.get("content-length");
  if (contentLength !== null) {
    const length = Number(contentLength);
    if (!Number.isFinite(length) || length < 0 || length > maxBytes) {
      return null;
    }
  } else if (req.body) {
    // No Content-Length (chunked body): stream with a byte cap instead
    // of trusting the platform cap — `await req.json()` would parse
    // an unbounded chunked body.
    try {
      const reader = req.body.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > maxBytes) {
          await reader.cancel();
          return null;
        }
        chunks.push(value);
      }
      const text = Buffer.concat(chunks).toString("utf8");
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null) return null;
      return parsed as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return null;
  }
  if (typeof body !== "object" || body === null) return null;
  return body as Record<string, unknown>;
}


// ---------------------------------------------------------------------------
// Issuing one-time codes (shared by send-otp, signup, and 2fa/send-code)
// ---------------------------------------------------------------------------

import {
  OTP_EXPIRY_MS,
  OTP_MAX_SENDS_PER_HOUR,
  OTP_RESEND_COOLDOWN_MS,
  generateOtpCode,
  sha256Hex,
} from "@/lib/auth-email";
import {
  countRecentOtps,
  getLatestOtp,
  getSessionCheckByEmail,
  normalizeEmail,
  storeOtp,
} from "@/lib/auth-store";
import { deleteRepoEmail, otpEmail, sendMail, twoFaEmail } from "@/lib/email";

export type OtpPurpose = "signup" | "signin" | "2fa" | "delete-repo";

export type IssueOtpResult =
  | { ok: true }
  | {
      ok: false;
      reason: "cooldown" | "hourly_cap" | "not_configured" | "failed";
      retryAfterSeconds?: number;
    };

// Per-email serialisation (R2-L3): the 5/hour cap and the 60s
// cooldown were count-then-send, so a parallel burst all read
// count 4 and all sent. Work for one email now runs one at a time
// per instance — each unit sees the previous unit's stored row.
// Cross-instance races remain (same as every other in-memory limit
// while Redis is unset). Exported as enqueuePerEmail so
// forgot-password (R3-L4) can serialise its count-then-store the
// same way; enqueueOtpSend below is the same chain under its old
// name (the OTP path's call site).
const otpSendChains = new Map<string, Promise<unknown>>();

export function enqueuePerEmail<T>(
  email: string,
  fn: () => Promise<T>
): Promise<T> {
  const prev = otpSendChains.get(email) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  otpSendChains.set(email, next);
  next.catch(() => {}).finally(() => {
    if (otpSendChains.get(email) === next) otpSendChains.delete(email);
  });
  return next;
}

function enqueueOtpSend<T>(email: string, fn: () => Promise<T>): Promise<T> {
  return enqueuePerEmail(email, fn);
}

/**
 * Generate, store (hashed), and email a 6-digit code. Enforces the
 * 60-second resend cooldown and the 5-per-hour cap PER EMAIL across
 * signup + signin (L6) — a signup code, a sign-in code, and a 2fa
 * code used to share one budget, so the cap could be tripled by
 * switching purpose. The `2fa` and `delete-repo` purposes each have
 * their OWN 5/hour budget and cooldown (R2-L8): anyone could
 * otherwise burn the victim's 2FA email-code quota with 5 signin
 * codes and deny the step-up fallback for the rest of the hour. The
 * caller decides whether a code should be sent at all (e.g. only
 * for an existing account) — this function only does the sending.
 */
export async function issueOtpCode(
  email: string,
  purpose: OtpPurpose
): Promise<IssueOtpResult> {
  const normalized = normalizeEmail(email);
  const nowMs = Date.now();

  // Cap + cooldown + store run serialised per email (R2-L3), so a
  // parallel burst cannot overshoot the cap. The mail send happens
  // after, outside the lock — the stored row is what the next send
  // in line counts.
  const prepared = await enqueueOtpSend(normalized, async () => {
    if (purpose === "2fa" || purpose === "delete-repo") {
      const recentOwn = await countRecentOtps(
        normalized,
        purpose,
        nowMs - 60 * 60 * 1000
      );
      if (recentOwn === null) return { ok: false as const, reason: "failed" as const };
      if (recentOwn >= OTP_MAX_SENDS_PER_HOUR) {
        return { ok: false as const, reason: "hourly_cap" as const, retryAfterSeconds: 3600 };
      }
      const latestOwn = await getLatestOtp(normalized, purpose);
      if (latestOwn) {
        const createdMs = new Date(latestOwn.created_at).getTime();
        const waitMs = OTP_RESEND_COOLDOWN_MS - (nowMs - createdMs);
        if (waitMs > 0) {
          return {
            ok: false as const,
            reason: "cooldown" as const,
            retryAfterSeconds: Math.ceil(waitMs / 1000),
          };
        }
      }
    } else {
      const recent = await countRecentOtps(
        normalized,
        null,
        nowMs - 60 * 60 * 1000
      );
      if (recent === null) return { ok: false as const, reason: "failed" as const };
      if (recent >= OTP_MAX_SENDS_PER_HOUR) {
        return { ok: false as const, reason: "hourly_cap" as const, retryAfterSeconds: 3600 };
      }

      const latest = await getLatestOtp(normalized, null);
      if (latest) {
        const createdMs = new Date(latest.created_at).getTime();
        const waitMs = OTP_RESEND_COOLDOWN_MS - (nowMs - createdMs);
        if (waitMs > 0) {
          return {
            ok: false as const,
            reason: "cooldown" as const,
            retryAfterSeconds: Math.ceil(waitMs / 1000),
          };
        }
      }
    }

    const code = generateOtpCode();
    const stored = await storeOtp({
      email: normalized,
      purpose,
      codeHash: sha256Hex(code),
      expiresAtMs: nowMs + OTP_EXPIRY_MS,
    });
    if (!stored) return { ok: false as const, reason: "failed" as const };
    return { ok: true as const, code };
  });
  if (!prepared.ok) return prepared;

  const message =
    purpose === "2fa"
      ? twoFaEmail(prepared.code)
      : purpose === "delete-repo"
        ? deleteRepoEmail(prepared.code)
        : otpEmail(prepared.code, purpose);
  const sent = await sendMail({ to: normalized, ...message });
  if (!sent.ok) {
    return { ok: false, reason: sent.reason };
  }
  return { ok: true };
}
