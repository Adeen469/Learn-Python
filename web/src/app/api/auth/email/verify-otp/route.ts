import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth";
import { decideOtp } from "@/lib/auth-email";
import {
  consumeOtp,
  getLatestOtp,
  getUserByEmail,
  updateUser,
  bumpOtpAttempts,
} from "@/lib/auth-store";
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

// POST /api/auth/email/verify-otp { email, code, purpose }
// Verifies a sign-up or sign-in code and signs the user in. A wrong,
// expired, consumed, or over-attempted code always yields the same
// generic 400 — the reason is never exposed.
export const dynamic = "force-dynamic";

const GENERIC_CODE_ERROR = "The code is incorrect or has expired.";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-email-verify-otp", 20, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("verify-otp");

  const body = await readJsonBody(req);
  const email = body?.email;
  const code = body?.code;
  const purpose = body?.purpose;
  if (
    !isValidEmail(email) ||
    typeof code !== "string" ||
    (purpose !== "signup" && purpose !== "signin")
  ) {
    return jsonError(GENERIC_CODE_ERROR, 400);
  }

  const user = await getUserByEmail(email);
  const row = await getLatestOtp(email, purpose);
  if (!user || !row) return jsonError(GENERIC_CODE_ERROR, 400);
  if (purpose === "signin" && !user.email_verified) {
    return jsonError(GENERIC_CODE_ERROR, 400);
  }

  const decision = decideOtp(
    {
      codeHash: row.code_hash,
      expiresAtMs: new Date(row.expires_at).getTime(),
      attempts: row.attempts,
      consumedAtMs: row.consumed_at
        ? new Date(row.consumed_at).getTime()
        : null,
    },
    code,
    Date.now()
  );
  if (!decision.ok) {
    if (decision.reason === "invalid") await bumpOtpAttempts(row.id);
    return jsonError(GENERIC_CODE_ERROR, 400);
  }
  await consumeOtp(row.id);

  const patch: { email_verified?: boolean; last_sign_in_at?: string } = {
    last_sign_in_at: new Date().toISOString(),
  };
  if (purpose === "signup") patch.email_verified = true;
  await updateUser(user.id, patch);

  const res = NextResponse.json({
    user: { email: user.email, name: user.name, picture: null },
    ...(user.totp_enabled ? { needs2fa: true } : {}),
  });
  if (user.totp_enabled) {
    // The code proved email possession; the second factor still has
    // to be completed before any session is issued.
    await setPending2fa(res, prereqs.secret, user.email, prereqs.isSecure);
    return res;
  }
  await issueSession(
    res,
    prereqs.secret,
    { email: user.email, name: user.name, picture: null },
    prereqs.isSecure,
    { auth: "email", mfa: false }
  );
  // A stale pending cookie must never survive a fresh sign-in.
  clearPending2fa(res, prereqs.isSecure);
  return res;
}
