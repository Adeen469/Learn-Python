import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth";
import {
  getAuthPrereqs,
  issueOtpCode,
  jsonError,
  rateLimit,
  readJsonBody,
  serviceUnavailable,
  type OtpPurpose,
} from "@/lib/auth-routes";
import { getEmailConfig } from "@/lib/email";
import { getPendingSignup, getUserByEmail } from "@/lib/auth-store";

// POST /api/auth/email/send-otp { email, purpose: "signup" | "signin" }
// Resends a verification code. Always returns { sent: true } — the
// response never reveals whether the email belongs to an account.
// A code is only actually sent when one is expected: an unverified
// account for "signup", a verified account for "signin".
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-email-send-otp", 20, 60 * 60 * 1000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("send-otp");
  if (!getEmailConfig()) return serviceUnavailable("send-otp");

  const body = await readJsonBody(req);
  const email = body?.email;
  const purpose = body?.purpose;
  if (
    !isValidEmail(email) ||
    (purpose !== "signup" && purpose !== "signin")
  ) {
    return jsonError("Enter a valid email address.", 400);
  }

  // Success-shaped either way — enumeration happens nowhere (M1):
  // a cooldown, an hourly cap, or a mail failure answers exactly
  // like a sent code. The real reason is logged server-side only,
  // and the client always shows "code sent".
  const sentResponse = NextResponse.json({ sent: true });
  const user = await getUserByEmail(email);
  if (purpose === "signup") {
    // A code is expected for a pending sign-up (L8) or an
    // unverified legacy account. A verified account, or no account
    // at all, gets silence — same response, no mail.
    const pending = await getPendingSignup(email);
    if (!pending && (!user || user.email_verified)) return sentResponse;
  } else {
    if (!user) return sentResponse;
    if (!user.email_verified) return sentResponse;
  }

  const result = await issueOtpCode(email, purpose as OtpPurpose);
  if (!result.ok) {
    if (result.reason === "not_configured") {
      return serviceUnavailable("send-otp");
    }
    console.error(
      JSON.stringify({
        event: "auth_send_otp_failed",
        reason: result.reason,
      })
    );
  }
  return sentResponse;
}
