import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  buildOtpAuthUrl,
  encryptTotpSecret,
  generateTotpSecret,
  totpSecretEncryptionKey,
  verifyPassword,
} from "@/lib/auth-email";
import { getUserByEmail, updateUser } from "@/lib/auth-store";
import QRCode from "qrcode";
import {
  getAuthPrereqs,
  getSessionUser,
  jsonError,
  rateLimit,
  rateLimitKey,
  readJsonBody,
  serviceUnavailable,
} from "@/lib/auth-routes";

const setupSchema = z.object({
  password: z.string().min(1).max(128).optional(),
});

// POST /api/auth/2fa/setup { password } — start TOTP enrollment for
// an email user. The password is re-entered (H4): a stolen session
// alone must not be enough to start enrolling an attacker's
// authenticator. Generates a fresh secret, stores it encrypted as
// "pending", and returns the otpauth URL + QR image. Nothing is
// enabled yet — the user must prove the code in /api/auth/2fa/enable
// first. Re-running setup while 2FA is already on is refused, so an
// abandoned re-setup can never lock the user out of their working
// second factor.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-2fa-setup", 10, 60_000, {
    failClosed: true,
  });
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-setup");

  const sessionUser = await getSessionUser(req, prereqs.secret);
  if (!sessionUser || sessionUser.auth !== "email") {
    return jsonError("Sign in with email to set up two-factor authentication.", 401);
  }
  const user = await getUserByEmail(sessionUser.email);
  if (!user) return jsonError("Account not found.", 404);
  // R3-L5: per-email bucket on top of the per-IP limit — rotating
  // IPs must not buy unbounded scrypt password checks on one
  // account. Same pattern as sign-in/verify.
  const emailLimited = await rateLimitKey(
    `auth-2fa-setup-email:${sessionUser.email.toLowerCase()}`,
    10,
    60_000,
    { failClosed: true }
  );
  if (emailLimited) return emailLimited;
  if (user.totp_enabled) {
    return jsonError(
      "Two-factor authentication is already on. Disable it first to set up a new one.",
      400
    );
  }
  // Password re-entry (H4), before any secret is generated.
  const body = await readJsonBody(req);
  const parsed = setupSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Enter your password to set up two-factor authentication.", 400);
  }
  const password = parsed.data.password;
  if (typeof password !== "string" || !user.password_hash) {
    return jsonError("Enter your password to set up two-factor authentication.", 400);
  }
  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) {
    return jsonError("Invalid email or password.", 401);
  }

  const key = totpSecretEncryptionKey();
  if (!key) return serviceUnavailable("2fa-setup");
  const secret = generateTotpSecret();
  const pendingEnc = encryptTotpSecret(key, secret);
  // A fresh setup resets the TOTP failure counter (R2-M8): without
  // this, a user who burned all 5 enable attempts stayed locked out
  // of enrolment until a password reset.
  const saved = await updateUser(user.id, {
    totp_pending_enc: pendingEnc,
    totp_failed_attempts: 0,
  });
  if (!saved) {
    return jsonError("Could not start setup. Please try again.", 503);
  }
  const otpauthUrl = buildOtpAuthUrl(secret, user.email);
  let qrDataUrl: string;
  try {
    qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    });
  } catch {
    return jsonError("Could not start setup. Please try again.", 503);
  }
  // The secret is returned so the user can type it into the
  // authenticator app manually instead of scanning the QR code.
  return NextResponse.json({ otpauthUrl, qrDataUrl, secret });
}
