import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth-store";
import { getEmailConfig } from "@/lib/email";
import {
  getAuthPrereqs,
  issueOtpCode,
  jsonError,
  rateLimit,
  readPending2fa,
  serviceUnavailable,
} from "@/lib/auth-routes";

// POST /api/auth/2fa/send-code — email a two-factor code to the user
// mid-sign-in. Only works with a valid step-up cookie, so a code can
// never be requested for someone else's account.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-2fa-send-code", 10, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-send-code");
  if (!getEmailConfig()) return serviceUnavailable("2fa-send-code");

  const email = await readPending2fa(req, prereqs.secret);
  if (!email) {
    return jsonError("Your sign-in step expired. Please sign in again.", 401);
  }
  const user = await getUserByEmail(email);
  if (!user || !user.totp_enabled || !user.email_verified) {
    return jsonError("Your sign-in step expired. Please sign in again.", 401);
  }

  const result = await issueOtpCode(email, "2fa");
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
      return serviceUnavailable("2fa-send-code");
    }
    return jsonError("Could not send the email. Please try again.", 502);
  }
  return NextResponse.json({ sent: true });
}
