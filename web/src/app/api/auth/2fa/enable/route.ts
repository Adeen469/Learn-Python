import { NextRequest, NextResponse } from "next/server";
import {
  decryptUserTotpSecret,
  generateBackupCodes,
  hashBackupCodes,
  TOTP_MAX_FAILED_ATTEMPTS,
  verifyPassword,
  verifyTotpCodeWithStep,
} from "@/lib/auth-email";
import {
  bumpTotpFailedAttempts,
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

// POST /api/auth/2fa/enable { code, password } — finish TOTP enrollment.
// The code must match the pending secret from /api/auth/2fa/setup, and
// the password is re-entered (H4) so a stolen session alone cannot
// enroll an attacker's authenticator. On success, 2FA turns on and 10
// single-use backup codes are returned — shown ONCE, then only their
// scrypt hashes remain. The session version bumps (H2) and the session
// is re-issued with mfa:true, so sessions minted before 2FA was on
// die immediately.
export const dynamic = "force-dynamic";

const GENERIC_CODE_ERROR =
  "The code is incorrect. Check your authenticator app and try again.";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-2fa-enable", 10, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-enable");

  const sessionUser = await getSessionUser(req, prereqs.secret);
  if (!sessionUser || sessionUser.auth !== "email") {
    return jsonError("Sign in with email to set up two-factor authentication.", 401);
  }
  const body = await readJsonBody(req);
  const code = body?.code;
  const password = body?.password;
  if (typeof code !== "string" || typeof password !== "string") {
    return jsonError("Enter the 6-digit code from your authenticator app.", 400);
  }

  const user = await getUserByEmail(sessionUser.email);
  if (!user) return jsonError("Account not found.", 404);
  if (user.totp_enabled) {
    return jsonError("Two-factor authentication is already on.", 400);
  }
  if (!user.totp_pending_enc) {
    return jsonError("Start setup first — scan the QR code in Settings.", 400);
  }
  // Password re-entry (H4), before the code is even checked.
  if (!user.password_hash) {
    return jsonError("Invalid email or password.", 401);
  }
  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) {
    return jsonError("Invalid email or password.", 401);
  }
  // Per-account attempt cap (M2), same 5-failure lockout as the
  // step-up verify. A locked enrollment answers with the same
  // generic error as a wrong code.
  if ((user.totp_failed_attempts ?? 0) >= TOTP_MAX_FAILED_ATTEMPTS) {
    return jsonError(GENERIC_CODE_ERROR, 400);
  }
  const secret = decryptUserTotpSecret(prereqs.secret, user.totp_pending_enc);
  const matched = secret
    ? verifyTotpCodeWithStep(secret, code)
    : null;
  if (!secret || !matched) {
    await bumpTotpFailedAttempts(user.id);
    // At the cap, the pending secret dies (M2): the attacker cannot
    // keep guessing it, and the user re-runs setup for a fresh one.
    if ((user.totp_failed_attempts ?? 0) + 1 >= TOTP_MAX_FAILED_ATTEMPTS) {
      await updateUser(user.id, { totp_pending_enc: null });
    }
    return jsonError(GENERIC_CODE_ERROR, 400);
  }

  const backupCodes = generateBackupCodes();
  const newSessionVersion = (user.session_version ?? 0) + 1;
  const saved = await updateUser(user.id, {
    totp_secret_enc: user.totp_pending_enc,
    totp_pending_enc: null,
    totp_enabled: true,
    backup_codes: await hashBackupCodes(backupCodes),
    totp_failed_attempts: 0,
    session_version: newSessionVersion,
  });
  if (!saved) {
    return jsonError("Could not turn on two-factor authentication.", 503);
  }
  // Record the step this code was accepted for, so it cannot be
  // replayed in a second sign-in flow within the window (M4).
  await recordTotpStep(user.id, matched.step);
  const res = NextResponse.json({ backupCodes });
  // Re-issue the session: the old one (mfa:false, old version) is
  // dead from the version bump above, including this browser's.
  await issueSession(res, prereqs.secret, sessionUser, prereqs.isSecure, {
    auth: "email",
    mfa: true,
    sv: newSessionVersion,
  });
  return res;
}
