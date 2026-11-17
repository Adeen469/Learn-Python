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
import { getUserByEmail } from "@/lib/auth-store";

// POST /api/auth/email/send-otp { email, purpose: "signup" | "signin" }
// Resends a verification code. Always returns { sent: true } — the
// response never reveals whether the email belongs to an account.
// A code is only actually sent when one is expected: an unverified
// account for "signup", a verified account for "signin".
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-email-send-otp", 20, 60 * 60 * 1000);
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

  // Success-shaped either way — enumeration happens nowhere.
  const sentResponse = NextResponse.json({ sent: true });
  const user = await getUserByEmail(email);
  if (!user) return sentResponse;
  if (purpose === "signup" && user.email_verified) return sentResponse;
  if (purpose === "signin" && !user.email_verified) return sentResponse;

  const result = await issueOtpCode(email, purpose as OtpPurpose);
  if (!result.ok) {
    if (result.reason === "cooldown" || result.reason === "hourly_cap") {
      return NextResponse.json(
        {
          error:
            result.reason === "cooldown"
              ? "Please wait a moment before requesting another code."
              : "Too many codes sent to this email. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfterSeconds ?? 60),
          },
        }
      );
    }
    if (result.reason === "not_configured") {
      return serviceUnavailable("send-otp");
    }
    return jsonError("Could not send the email. Please try again.", 502);
  }
  return sentResponse;
}
