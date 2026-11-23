import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidEmail } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth-email";
import {
  clearSigninFailures,
  getUserByEmail,
  incrementSessionVersion,
  recordSigninFailure,
  updateUser,
} from "@/lib/auth-store";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  clearPending2fa,
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

const signinSchema = z.object({
  email: z.string().min(3).max(254),
  password: z.string().min(1).max(128).optional(),
});

const GENERIC_CREDENTIALS_ERROR = "Invalid email or password.";

// Timing oracle guard: a missing account (or one without a password)
// must cost the same scrypt verification as a real account, or the
// response time alone reveals whether the email exists. This is a
// hash of a random password nobody knows — it verifies nothing, it
// only burns the same ~100ms.
const DUMMY_PASSWORD_HASH =
  "scrypt$16384$8$1$gfRCHUJjd6I4GJXlcvywSw$Q7Rnq-KI6CqIaWYUz7p40M3SSU33SMJ15ekdKkWg4GwD7-N5HsTWfNN8Gy1rwGw_xzQk8OnoXqXx2b0v9-YarA";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-email-signin", 10, 60_000, {
    failClosed: true,
  });
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("signin");

  const body = await readJsonBody(req);
  const parsed = signinSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError(GENERIC_CREDENTIALS_ERROR, 401);
  }
  const email = parsed.data.email;
  const password = parsed.data.password;
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
      60_000,
      Date.now(),
      { failClosed: true }
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
  // lock the account for 15 minutes. A locked account answers with
  // the SAME generic 401 as bad credentials (R2-M7) — the old
  // distinct 429 ("Too many failed sign-in attempts for this
  // email") was an enumeration oracle: 11 wrong passwords to any
  // address proved whether a real account with a password exists.
  // The dummy scrypt keeps the timing identical to a real password
  // check. Residual, stated honestly: the lockout itself is still
  // an account-DoS (10 wrong guesses lock the victim out for 15
  // minutes) — closing that needs a CAPTCHA or emailed unlock link,
  // which the owner has forbidden (no UI change).
  if (
    user.signin_locked_until &&
    new Date(user.signin_locked_until).getTime() > Date.now()
  ) {
    await verifyPassword(password, DUMMY_PASSWORD_HASH);
    return jsonError(GENERIC_CREDENTIALS_ERROR, 401);
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
  // victim signing in again. The bump is atomic (R2-M11) and the
  // new session carries the RETURNED version (R2-L6): if the bump
  // write fails, mint nothing — a locally computed version would
  // fail the very next session check and strand the user signed in
  // but immediately 401'd. The 2FA branch below bumps too, and the
  // verify step reads the fresh version when it issues the session.
  const newSessionVersion = await incrementSessionVersion(user.id);
  if (newSessionVersion === null) {
    return jsonError("Sign-in is temporarily unavailable.", 503);
  }
  await updateUser(user.id, {
    last_sign_in_at: new Date().toISOString(),
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
  // R3-L2: a stale pending-2FA cookie must never survive a fresh
  // sign-in (same as verify-otp already does).
  clearPending2fa(res, prereqs.isSecure);
  return res;
}
