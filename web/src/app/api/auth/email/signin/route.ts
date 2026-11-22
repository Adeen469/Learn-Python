import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth-email";
import {
  clearSigninFailures,
  getUserByEmail,
  recordSigninFailure,
  updateUser,
} from "@/lib/auth-store";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  getAuthPrereqs,
  issueSession,
  jsonError,
  rateLimit,
  readJsonBody,
  serviceUnavailable,
  setPending2fa,
} from "@/lib/auth-routes";

// POST /api/auth/email/signin { email, password }
// Password sign-in. Wrong credentials always yield the same generic
// 401. With 2FA on, no session is issued — the response asks for the
// second factor and a short-lived step-up cookie is set instead.
export const dynamic = "force-dynamic";

const GENERIC_CREDENTIALS_ERROR = "Invalid email or password.";

// Timing oracle guard: a missing account (or one without a password)
// must cost the same scrypt verification as a real account, or the
// response time alone reveals whether the email exists. This is a
// hash of a random password nobody knows — it verifies nothing, it
// only burns the same ~100ms.
const DUMMY_PASSWORD_HASH =
  "scrypt$16384$8$1$gfRCHUJjd6I4GJXlcvywSw$Q7Rnq-KI6CqIaWYUz7p40M3SSU33SMJ15ekdKkWg4GwD7-N5HsTWfNN8Gy1rwGw_xzQk8OnoXqXx2b0v9-YarA";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-email-signin", 10, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("signin");

  const body = await readJsonBody(req);
  const email = body?.email;
  const password = body?.password;
  if (!isValidEmail(email) || typeof password !== "string") {
    return jsonError(GENERIC_CREDENTIALS_ERROR, 401);
  }

  // Per-email flood guard, on top of the per-IP limit above.
  // Generous on purpose (M5): the real brute-force protection is
  // the per-account lockout below, and a tight per-email cap is a
  // login-DoS — anyone could 429 a victim's address at will.
  let emailLimit;
  try {
    emailLimit = await checkRateLimit(
      `auth-email-signin-email:${email.toLowerCase()}`,
      30,
      60_000
    );
  } catch {
    return jsonError("Sign-in is temporarily unavailable.", 503);
  }
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts for this email. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(emailLimit.retryAfterSeconds) },
      }
    );
  }

  const user = await getUserByEmail(email);
  if (!user || !user.password_hash) {
    // Same cost as a real check (see DUMMY_PASSWORD_HASH above).
    await verifyPassword(password, DUMMY_PASSWORD_HASH);
    return jsonError(GENERIC_CREDENTIALS_ERROR, 401);
  }
  // Progressive per-account lockout (M5): 10 consecutive failures
  // lock the account for 15 minutes. The 429 only ever fires for a
  // real locked account — a missing account still gets the generic
  // 401 above, so this is not an enumeration oracle.
  if (
    user.signin_locked_until &&
    new Date(user.signin_locked_until).getTime() > Date.now()
  ) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(
        (new Date(user.signin_locked_until).getTime() - Date.now()) / 1000
      )
    );
    return NextResponse.json(
      {
        error:
          "Too many failed sign-in attempts for this email. Try again in a few minutes.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }
  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) {
    await recordSigninFailure(user.id);
    return jsonError(GENERIC_CREDENTIALS_ERROR, 401);
  }
  await clearSigninFailures(user.id);
  if (!user.email_verified) {
    // Same 401 as bad credentials (M1): a distinct 403 here tells
    // anyone who guesses the password whether the email is
    // registered and unverified. The sign-in page offers a
    // "resend verification code" step instead.
    return jsonError(GENERIC_CREDENTIALS_ERROR, 401);
  }

  // Session rotation (M6): a fresh password sign-in invalidates
  // every older token, so a stolen session does not survive the
  // victim signing in again. The new session carries the bumped
  // version; the 2FA branch below bumps too, and the verify step
  // reads the fresh version when it issues the session.
  const newSessionVersion = (user.session_version ?? 0) + 1;
  await updateUser(user.id, {
    last_sign_in_at: new Date().toISOString(),
    session_version: newSessionVersion,
  });

  const res = NextResponse.json({
    user: { email: user.email, name: user.name, picture: null },
    ...(user.totp_enabled ? { needs2fa: true } : {}),
  });
  if (user.totp_enabled) {
    await setPending2fa(res, prereqs.secret, user.email, prereqs.isSecure);
    return res;
  }
  await issueSession(
    res,
    prereqs.secret,
    { email: user.email, name: user.name, picture: null },
    prereqs.isSecure,
    { auth: "email", mfa: false, sv: newSessionVersion }
  );
  return res;
}
