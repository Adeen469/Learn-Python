import { NextRequest, NextResponse } from "next/server";
import {
  generateBackupCodes,
  sha256Hex,
} from "@/lib/auth-email";
import { getUserByEmail, updateUser } from "@/lib/auth-store";
import {
  getAuthPrereqs,
  getSessionUser,
  jsonError,
  rateLimit,
  serviceUnavailable,
} from "@/lib/auth-routes";

// POST /api/auth/2fa/backup-codes — replace all backup codes with a
// fresh set of 10. The old set stops working immediately. The new
// codes are returned once — the page must show them and tell the
// user to save them now.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-2fa-backup-codes", 5, 60_000);
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

  const backupCodes = generateBackupCodes();
  const saved = await updateUser(user.id, {
    backup_codes: backupCodes.map((c) => sha256Hex(c.replace("-", ""))),
  });
  if (!saved) {
    return jsonError("Could not generate new backup codes.", 503);
  }
  return NextResponse.json({ backupCodes });
}
