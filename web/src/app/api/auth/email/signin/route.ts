import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth-email";
import { getUserByEmail, updateUser } from "@/lib/auth-store";
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

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-email-signin", 10, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("signin");

  const body = await readJsonBody(req);
  const email = body?.email;
  const password = body?.password;
  if (!isValidEmail(email) || typeof password !== "string") {
    return jsonError(GENERIC_CREDENTIALS_ERROR, 401);
  }

  // Per-email brute-force guard, on top of the per-IP limit above.
  let emailLimit;
  try {
    emailLimit = checkRateLimit(
      `auth-email-signin-email:${email.toLowerCase()}`,
      5,
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
    return jsonError(GENERIC_CREDENTIALS_ERROR, 401);
  }
  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) {
    return jsonError(GENERIC_CREDENTIALS_ERROR, 401);
  }
  if (!user.email_verified) {
    return NextResponse.json(
      {
        error: "Please verify your email first.",
        needsVerification: true,
      },
      { status: 403 }
    );
  }

  const res = NextResponse.json({
    user: { email: user.email, name: user.name, picture: null },
    ...(user.totp_enabled ? { needs2fa: true } : {}),
  });
  if (user.totp_enabled) {
    await setPending2fa(res, prereqs.secret, user.email, prereqs.isSecure);
    return res;
  }
  await updateUser(user.id, {
    last_sign_in_at: new Date().toISOString(),
  });
  await issueSession(
    res,
    prereqs.secret,
    { email: user.email, name: user.name, picture: null },
    prereqs.isSecure,
    { auth: "email", mfa: false }
  );
  return res;
}
