import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth-email";
import { getUserByEmail, updateUser } from "@/lib/auth-store";
import {
  getAuthPrereqs,
  getSessionUser,
  jsonError,
  rateLimit,
  readJsonBody,
  serviceUnavailable,
} from "@/lib/auth-routes";

// POST /api/auth/2fa/disable { password } — turn two-factor off.
// The password is re-checked so a stray unlocked browser cannot
// silently drop the account's second factor.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-2fa-disable", 10, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-disable");

  const sessionUser = await getSessionUser(req, prereqs.secret);
  if (!sessionUser || sessionUser.auth !== "email") {
    return jsonError("Sign in with email to manage two-factor authentication.", 401);
  }
  const body = await readJsonBody(req);
  const password = body?.password;
  if (typeof password !== "string") {
    return jsonError("Enter your password to disable two-factor authentication.", 400);
  }

  const user = await getUserByEmail(sessionUser.email);
  if (!user || !user.password_hash) {
    return jsonError("Invalid email or password.", 401);
  }
  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) {
    return jsonError("Invalid email or password.", 401);
  }

  const saved = await updateUser(user.id, {
    totp_secret_enc: null,
    totp_pending_enc: null,
    totp_enabled: false,
    backup_codes: [],
  });
  if (!saved) {
    return jsonError("Could not disable two-factor authentication.", 503);
  }
  return NextResponse.json({ ok: true });
}
