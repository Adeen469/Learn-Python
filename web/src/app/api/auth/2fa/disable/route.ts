import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  decryptUserTotpSecret,
  findBackupCode,
  TOTP_MAX_FAILED_ATTEMPTS,
  verifyPassword,
  verifyTotpCodeWithStep,
} from "@/lib/auth-email";
import {
  bumpTotpFailedAttempts,
  claimTotpStep,
  getUserByEmail,
  incrementSessionVersion,
  updateUser,
} from "@/lib/auth-store";
import {
  getAuthPrereqs,
  getSessionUser,
  issueSession,
  jsonError,
  rateLimit,
  rateLimitKey,
  readJsonBody,
  serviceUnavailable,
} from "@/lib/auth-routes";

const disableSchema = z.object({
  password: z.string().min(1).max(128).optional(),
  code: z.string().min(1).max(10).optional(),
});

// POST /api/auth/2fa/disable { password, code } — turn two-factor off.
// The password is re-checked, AND a valid TOTP code (or a backup
// code) must be presented (H10): a phished password alone must not
// be able to strip the second factor. The session version bumps
// (H2) and the session is re-issued, so every other session dies
// with the change.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-2fa-disable", 10, 60_000, {
    failClosed: true,
  });
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-disable");

  const sessionUser = await getSessionUser(req, prereqs.secret);
  if (!sessionUser || sessionUser.auth !== "email") {
    return jsonError("Sign in with email to manage two-factor authentication.", 401);
  }
  // R3-L5: per-email bucket on top of the per-IP limit (same
  // pattern as sign-in/verify).
  const emailLimited = await rateLimitKey(
    `auth-2fa-disable-email:${sessionUser.email.toLowerCase()}`,
    10,
    60_000,
    { failClosed: true }
  );
  if (emailLimited) return emailLimited;
  const body = await readJsonBody(req);
  const parsed = disableSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Enter your password and a code from your authenticator app to disable two-factor authentication.", 400);
  }
  const password = parsed.data.password;
  const code = parsed.data.code;
  if (typeof password !== "string" || typeof code !== "string") {
    return jsonError("Enter your password and a code from your authenticator app to disable two-factor authentication.", 400);
  }

  const user = await getUserByEmail(sessionUser.email);
  if (!user || !user.password_hash) {
    return jsonError("Invalid email or password.", 401);
  }
  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) {
    return jsonError("Invalid email or password.", 401);
  }
  if (!user.totp_enabled) {
    return jsonError("Two-factor authentication is not on.", 400);
  }
  // Per-account attempt cap (R2-M8), same 5-failure lockout as
  // verify/enable: without it the cap was bypassable by guessing
  // codes here instead. A locked disable answers with the same
  // generic error as a wrong code.
  if ((user.totp_failed_attempts ?? 0) >= TOTP_MAX_FAILED_ATTEMPTS) {
    return jsonError("The code is incorrect. Check your authenticator app and try again.", 400);
  }

  // Second-factor proof (H10): a current TOTP code, or one of the
  // backup codes (the recovery path when the authenticator is
  // lost). A replayed TOTP code fails the step check (M4).
  let matchedStep: number | null = null;
  let codeOk = false;
  if (user.totp_secret_enc) {
    const secret = decryptUserTotpSecret(user.totp_secret_enc);
    const matched = secret ? verifyTotpCodeWithStep(secret, code) : null;
    const replay =
      matched !== null &&
      user.totp_last_step !== null &&
      user.totp_last_step !== undefined &&
      matched.step === user.totp_last_step;
    if (matched && !replay) {
      codeOk = true;
      matchedStep = matched.step;
    }
  }
  if (!codeOk) {
    const matchedBackup = await findBackupCode(user.backup_codes, code);
    codeOk = matchedBackup !== null;
  }
  if (!codeOk) {
    await bumpTotpFailedAttempts(user.id);
    return jsonError("The code is incorrect. Check your authenticator app and try again.", 400);
  }

  // Replay protection (R2-M9): claim the step atomically BEFORE
  // disabling — a second flow presenting the same code loses the
  // claim and fails here, while 2FA stays on.
  if (matchedStep !== null) {
    const stepClaim = await claimTotpStep(user.id, matchedStep);
    if (stepClaim === "replay" || stepClaim === "error") {
      return jsonError("The code is incorrect. Check your authenticator app and try again.", 400);
    }
  }

  // Atomic version bump (R2-M11): the new session carries the
  // RETURNED version; a failed bump disables nothing.
  const newSessionVersion = await incrementSessionVersion(user.id);
  if (newSessionVersion === null) {
    return jsonError("Could not disable two-factor authentication.", 503);
  }
  const saved = await updateUser(user.id, {
    totp_secret_enc: null,
    totp_pending_enc: null,
    totp_enabled: false,
    backup_codes: [],
    totp_failed_attempts: 0,
    // R3-L6: NO session_version here — the CAS incrementSessionVersion
    // above already wrote it.
  });
  if (!saved) {
    return jsonError("Could not disable two-factor authentication.", 503);
  }
  const res = NextResponse.json({ ok: true });
  // Re-issue the session: the old one (old version, mfa:true) is
  // dead from the version bump above, including this browser's.
  await issueSession(res, prereqs.secret, sessionUser, prereqs.isSecure, {
    auth: "email",
    mfa: false,
    sv: newSessionVersion,
  });
  return res;
}
