import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth";
import {
  generateResetToken,
  sha256Hex,
  RESET_TOKEN_EXPIRY_MS,
} from "@/lib/auth-email";
import {
  countRecentResetTokens,
  getUserByEmail,
  storeResetToken,
} from "@/lib/auth-store";
import { getEmailConfig, resetEmail, sendMail } from "@/lib/email";
import {
  getAuthPrereqs,
  jsonError,
  rateLimit,
  readJsonBody,
  serviceUnavailable,
} from "@/lib/auth-routes";

// POST /api/auth/email/forgot { email }
// Sends a password-reset link. Always returns { sent: true } — the
// response never reveals whether the email belongs to an account.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-email-forgot", 20, 60 * 60 * 1000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("forgot");
  if (!getEmailConfig()) return serviceUnavailable("forgot");

  const body = await readJsonBody(req);
  const email = body?.email;
  if (!isValidEmail(email)) {
    return jsonError("Enter a valid email address.", 400);
  }

  // Success-shaped either way.
  const sentResponse = NextResponse.json({ sent: true });
  const user = await getUserByEmail(email);
  if (!user) return sentResponse;

  // At most 5 reset emails per hour per account.
  const recent = await countRecentResetTokens(
    user.id,
    Date.now() - 60 * 60 * 1000
  );
  if (recent === null) {
    return jsonError("Could not send the email. Please try again.", 502);
  }
  if (recent >= 5) return sentResponse;

  const token = generateResetToken();
  const stored = await storeResetToken({
    userId: user.id,
    tokenHash: sha256Hex(token),
    expiresAtMs: Date.now() + RESET_TOKEN_EXPIRY_MS,
  });
  if (!stored) {
    return jsonError("Could not send the email. Please try again.", 502);
  }
  const link = `${prereqs.origin}/auth/reset?token=${token}`;
  const sent = await sendMail({ to: email, ...resetEmail(link) });
  if (!sent.ok) {
    return jsonError("Could not send the email. Please try again.", 502);
  }
  return sentResponse;
}
