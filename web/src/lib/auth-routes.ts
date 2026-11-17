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
  isSecureOrigin,
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

export function serviceUnavailable(endpoint: string): NextResponse {
  console.error(JSON.stringify({ event: "auth_misconfigured", endpoint }));
  return jsonError("Sign-in is not configured yet.", 503);
}

/**
 * Per-IP sliding-window limit. Returns a 429 response when exceeded,
 * a 503 when the limiter itself fails, or null when the request may
 * proceed.
 */
export function rateLimit(
  req: NextRequest,
  key: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  let result;
  try {
    result = checkRateLimit(`${key}:${getClientIp(req)}`, limit, windowMs);
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
  return { secret, supabase, origin, isSecure: isSecureOrigin(origin) };
}

/** Sign the session and set the lp_session cookie on the response. */
export async function issueSession(
  res: NextResponse,
  secret: string,
  user: SessionUser,
  isSecure: boolean,
  opts: { auth?: "google" | "email"; mfa?: boolean } = {}
): Promise<void> {
  const token = await signSession(
    secret,
    buildSessionPayload(user, Math.floor(Date.now() / 1000), opts)
  );
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(isSecure));
}

/** Set the short-lived 2FA step-up cookie (HMAC-signed, "v1p." prefix). */
export async function setPending2fa(
  res: NextResponse,
  secret: string,
  email: string,
  isSecure: boolean
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const token = await signToken(secret, {
    kind: "2fa",
    email,
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

/** Read + verify the 2FA step-up cookie. Returns the email, or null. */
export async function readPending2fa(
  req: NextRequest,
  secret: string
): Promise<string | null> {
  const token = req.cookies.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;
  const verified = await verifyToken(secret, token);
  if (!verified.ok) return null;
  const p = verified.payload;
  if (p.kind !== "2fa" || typeof p.email !== "string") return null;
  return p.email;
}

/** Read + verify the lp_session cookie. Returns the user, or null. */
export async function getSessionUser(
  req: NextRequest,
  secret: string
): Promise<SessionUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const verified = await verifySession(secret, token);
  if (!verified.ok) return null;
  return verified.user;
}

/** Parse a JSON body, or null when it is not valid JSON / not an object. */
export async function readJsonBody(
  req: NextRequest
): Promise<Record<string, unknown> | null> {
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
  normalizeEmail,
  storeOtp,
} from "@/lib/auth-store";
import { otpEmail, sendMail, twoFaEmail } from "@/lib/email";

export type OtpPurpose = "signup" | "signin" | "2fa";

export type IssueOtpResult =
  | { ok: true }
  | {
      ok: false;
      reason: "cooldown" | "hourly_cap" | "not_configured" | "failed";
      retryAfterSeconds?: number;
    };

/**
 * Generate, store (hashed), and email a 6-digit code. Enforces the
 * 60-second resend cooldown and the 5-per-hour cap per email. The
 * caller decides whether a code should be sent at all (e.g. only for
 * an existing account) — this function only does the sending.
 */
export async function issueOtpCode(
  email: string,
  purpose: OtpPurpose
): Promise<IssueOtpResult> {
  const normalized = normalizeEmail(email);
  const nowMs = Date.now();

  const recent = await countRecentOtps(
    normalized,
    purpose,
    nowMs - 60 * 60 * 1000
  );
  if (recent === null) return { ok: false, reason: "failed" };
  if (recent >= OTP_MAX_SENDS_PER_HOUR) {
    return { ok: false, reason: "hourly_cap", retryAfterSeconds: 3600 };
  }

  const latest = await getLatestOtp(normalized, purpose);
  if (latest) {
    const createdMs = new Date(latest.created_at).getTime();
    const waitMs = OTP_RESEND_COOLDOWN_MS - (nowMs - createdMs);
    if (waitMs > 0) {
      return {
        ok: false,
        reason: "cooldown",
        retryAfterSeconds: Math.ceil(waitMs / 1000),
      };
    }
  }

  const code = generateOtpCode();
  const stored = await storeOtp({
    email: normalized,
    purpose,
    codeHash: sha256Hex(code),
    expiresAtMs: nowMs + OTP_EXPIRY_MS,
  });
  if (!stored) return { ok: false, reason: "failed" };

  const message =
    purpose === "2fa" ? twoFaEmail(code) : otpEmail(code, purpose);
  const sent = await sendMail({ to: normalized, ...message });
  if (!sent.ok) {
    return { ok: false, reason: sent.reason };
  }
  return { ok: true };
}
