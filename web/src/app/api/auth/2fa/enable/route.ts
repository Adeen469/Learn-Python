import { NextRequest, NextResponse } from "next/server";
import {
  decryptTotpSecret,
  generateBackupCodes,
  sha256Hex,
  verifyTotpCode,
} from "@/lib/auth-email";
import { getUserByEmail, updateUser } from "@/lib/auth-store";
import {
  getAuthPrereqs,
  getSessionUser,
  jsonError,
  rateLimit,
  readJsonBody,
  serviceUnavailable,
} from "@/lib/auth-routes";

// POST /api/auth/2fa/enable { code } — finish TOTP enrollment.
// The code must match the pending secret from /api/auth/2fa/setup.
// On success, 2FA turns on and 10 single-use backup codes are
// returned — shown ONCE, then only their hashes remain.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-2fa-enable", 10, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-enable");

  const sessionUser = await getSessionUser(req, prereqs.secret);
  if (!sessionUser || sessionUser.auth !== "email") {
    return jsonError("Sign in with email to set up two-factor authentication.", 401);
  }
  const body = await readJsonBody(req);
  const code = body?.code;
  if (typeof code !== "string") {
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
  const secret = decryptTotpSecret(prereqs.secret, user.totp_pending_enc);
  if (!secret || !verifyTotpCode(secret, code)) {
    return jsonError("The code is incorrect. Check your authenticator app and try again.", 400);
  }

  const backupCodes = generateBackupCodes();
  const saved = await updateUser(user.id, {
    totp_secret_enc: user.totp_pending_enc,
    totp_pending_enc: null,
    totp_enabled: true,
    backup_codes: backupCodes.map((c) => sha256Hex(c.replace("-", ""))),
  });
  if (!saved) {
    return jsonError("Could not turn on two-factor authentication.", 503);
  }
  return NextResponse.json({ backupCodes });
}
