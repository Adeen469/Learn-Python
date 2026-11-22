import { NextRequest, NextResponse } from "next/server";
import {
  decryptUserTotpSecret,
  generateBackupCodes,
  hashBackupCodes,
  verifyTotpCodeWithStep,
} from "@/lib/auth-email";
import {
  getUserByEmail,
  recordTotpStep,
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
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-2fa-backup-codes", 5, 60_000);
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
  const code = body?.code;
  if (typeof code !== "string" || !user.totp_secret_enc) {
    return jsonError("Enter the 6-digit code from your authenticator app.", 400);
  }
  const secret = decryptUserTotpSecret(prereqs.secret, user.totp_secret_enc);
  const matched = secret ? verifyTotpCodeWithStep(secret, code) : null;
  const replay =
    matched !== null &&
    user.totp_last_step !== null &&
    user.totp_last_step !== undefined &&
    matched.step === user.totp_last_step;
  if (!matched || replay) {
    return jsonError("The code is incorrect. Check your authenticator app and try again.", 400);
  }

  const backupCodes = generateBackupCodes();
  const newSessionVersion = (user.session_version ?? 0) + 1;
  const saved = await updateUser(user.id, {
    backup_codes: await hashBackupCodes(backupCodes),
    session_version: newSessionVersion,
  });
  if (!saved) {
    return jsonError("Could not generate new backup codes.", 503);
  }
  await recordTotpStep(user.id, matched.step);
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
