import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidEmail } from "@/lib/auth";
import {
  getAuthPrereqs,
  issueOtpCode,
  jsonError,
  rateLimit,
  readJsonBody,
  sameCostDelay,
  serviceUnavailable,
  type OtpPurpose,
} from "@/lib/auth-routes";
import { getEmailConfig } from "@/lib/email";
import { getPendingSignup, getUserByEmail } from "@/lib/auth-store";

const sendOtpSchema = z.object({
  email: z.string().min(3).max(254),
  purpose: z.enum(["signup", "signin"]),
});

// POST /api/auth/email/send-otp { email, purpose: "signup" | "signin" }
// Resends a verification code. Always returns { sent: true } — the
// response never reveals whether the email belongs to an account.
// A code is only actually sent when one is expected: an unverified
// account for "signup", a verified account for "signin".
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-email-send-otp", 20, 60 * 60 * 1000, {
    failClosed: true,
  });
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("send-otp");
  if (!getEmailConfig()) return serviceUnavailable("send-otp");

  const body = await readJsonBody(req);
  const parsed = sendOtpSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Enter a valid email address.", 400);
  }
  const email = parsed.data.email;
  const purpose = parsed.data.purpose;
  if (!isValidEmail(email)) {
    return jsonError("Enter a valid email address.", 400);
  }

  // Success-shaped either way — enumeration happens nowhere (M1):
  // a cooldown, an hourly cap, or a mail failure answers exactly
  // like a sent code. The real reason is logged server-side only,
  // and the client always shows "code sent".
  const sentResponse = NextResponse.json({ sent: true });
  // R3-L3: every no-mail exit pays the same fixed delay, so the
  // response time does not reveal whether the account exists.
  const silent = async () => {
    await sameCostDelay();
    return sentResponse;
  };
  const user = await getUserByEmail(email);
  if (purpose === "signup") {
    // A code is expected for an unverified legacy account only.
    // R3-H1: when a pending sign-up already exists, THIS request
    // did not create it — mailing a code would let the recipient
    // complete someone else's pending row (the attacker's
    // password), so no mail goes out. The row's owner still has
    // the code from when the row was created.
    const pending = await getPendingSignup(email);
    if (pending) return silent();
    if (!user || user.email_verified) return silent();
  } else {
    if (!user) return silent();
    if (!user.email_verified) return silent();
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
