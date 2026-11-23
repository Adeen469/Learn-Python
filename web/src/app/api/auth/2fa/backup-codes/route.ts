import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  decryptUserTotpSecret,
  generateBackupCodes,
  hashBackupCodes,
  TOTP_MAX_FAILED_ATTEMPTS,
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
  readJsonBody,
  serviceUnavailable,
} from "@/lib/auth-routes";

// POST /api/auth/2fa/backup-codes { code } — replace all backup codes
// with a fresh set of 10. The old set stops working immediately. The
// new codes are returned once — the page must show them and tell the
// user to save them now. A valid TOTP code is required (H4): a stolen
// session alone must not be able to kill the victim's backup codes.
// The session version bumps (H2) and the session is re-issued, so
// other sessions die with the change.
const backupCodesSchema = z.object({
  code: z.string().min(1).max(10).optional(),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-2fa-backup-codes", 5, 60_000, {
    failClosed: true,
  });
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-backup-codes");

  const sessionUser = await getSessionUser(req, prereqs.secret);
  if (!sessionUser || sessionUser.auth !== "email") {
    return jsonError("Sign in with email to manage two-factor authentication.", 401);
  }
  const user = await getUserByEmail(sessionUser.email);
  if (!user) return jsonError("Account not found.", 404);
  if (!user.totp_enabled) {
    return jsonError("Turn on two-factor authentication first.", 400);
  }

  const body = await readJsonBody(req);
  const parsed = backupCodesSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Enter the 6-digit code from your authenticator app.", 400);
  }
  const code = parsed.data.code;
  if (typeof code !== "string" || !user.totp_secret_enc) {
    return jsonError("Enter the 6-digit code from your authenticator app.", 400);
  }
  // Per-account attempt cap (R2-M8), same 5-failure lockout as
  // verify/enable: without it the cap was bypassable by guessing
  // codes here instead — one correct guess regenerated all 10
  // backup codes and killed the victim's set.
  if ((user.totp_failed_attempts ?? 0) >= TOTP_MAX_FAILED_ATTEMPTS) {
    return jsonError("The code is incorrect. Check your authenticator app and try again.", 400);
  }
  const secret = decryptUserTotpSecret(user.totp_secret_enc);
  const matched = secret ? verifyTotpCodeWithStep(secret, code) : null;
  const replay =
    matched !== null &&
    user.totp_last_step !== null &&
    user.totp_last_step !== undefined &&
    matched.step === user.totp_last_step;
  if (!matched || replay) {
    await bumpTotpFailedAttempts(user.id);
    return jsonError("The code is incorrect. Check your authenticator app and try again.", 400);
  }

  // Replay protection (R2-M9): claim the step atomically BEFORE
  // regenerating — a second flow presenting the same code loses the
  // claim and fails here, while the old codes stay live.
  const stepClaim = await claimTotpStep(user.id, matched.step);
  if (stepClaim === "replay" || stepClaim === "error") {
    return jsonError("The code is incorrect. Check your authenticator app and try again.", 400);
  }

  const backupCodes = generateBackupCodes();
  // Atomic version bump (R2-M11): the new session carries the
  // RETURNED version; a failed bump regenerates nothing.
  const newSessionVersion = await incrementSessionVersion(user.id);
  if (newSessionVersion === null) {
    return jsonError("Could not generate new backup codes.", 503);
  }
  const saved = await updateUser(user.id, {
    backup_codes: await hashBackupCodes(backupCodes),
    totp_failed_attempts: 0,
    // R3-L6: NO session_version here — the CAS incrementSessionVersion
    // above already wrote it.
  });
  if (!saved) {
    return jsonError("Could not generate new backup codes.", 503);
  }
  const res = NextResponse.json({ backupCodes });
  // Re-issue the session: the old one (old version) is dead from
  // the version bump above, including this browser's.
  await issueSession(res, prereqs.secret, sessionUser, prereqs.isSecure, {
    auth: "email",
    mfa: sessionUser.mfa ?? false,
    sv: newSessionVersion,
  });
  return res;
}
