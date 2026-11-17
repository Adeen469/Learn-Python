import { NextRequest, NextResponse } from "next/server";
import {
  buildOtpAuthUrl,
  encryptTotpSecret,
  generateTotpSecret,
} from "@/lib/auth-email";
import { getUserByEmail, updateUser } from "@/lib/auth-store";
import QRCode from "qrcode";
import {
  getAuthPrereqs,
  getSessionUser,
  jsonError,
  rateLimit,
  serviceUnavailable,
} from "@/lib/auth-routes";

// POST /api/auth/2fa/setup — start TOTP enrollment for an email user.
// Generates a fresh secret, stores it encrypted as "pending", and
// returns the otpauth URL + QR image. Nothing is enabled yet — the
// user must prove the code in /api/auth/2fa/enable first. Re-running
// setup while 2FA is already on is refused, so an abandoned re-setup
// can never lock the user out of their working second factor.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-2fa-setup", 10, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-setup");

  const sessionUser = await getSessionUser(req, prereqs.secret);
  if (!sessionUser || sessionUser.auth !== "email") {
    return jsonError("Sign in with email to set up two-factor authentication.", 401);
  }
  const user = await getUserByEmail(sessionUser.email);
  if (!user) return jsonError("Account not found.", 404);
  if (user.totp_enabled) {
    return jsonError(
      "Two-factor authentication is already on. Disable it first to set up a new one.",
      400
    );
  }

  const secret = generateTotpSecret();
  const pendingEnc = encryptTotpSecret(prereqs.secret, secret);
  const saved = await updateUser(user.id, { totp_pending_enc: pendingEnc });
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
