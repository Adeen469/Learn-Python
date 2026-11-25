import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth-store";
import { getEmailConfig } from "@/lib/email";
import {
  getAuthPrereqs,
  getSessionUser,
  issueOtpCode,
  jsonError,
  rateLimit,
  rateLimitKey,
  serviceUnavailable,
} from "@/lib/auth-routes";

// POST /api/auth/2fa/disable/send-code — email a disable-2FA code to
// the signed-in user's address. The Disable form in Settings calls
// this when the user cannot use their authenticator app: the app is
// lost, or the account carries a legacy TOTP secret that no longer
// decrypts (key split, 2026-11-23) so no authenticator code can ever
// verify. Session-gated, so a code can never be requested for
// someone else's account — and only for a verified email with 2FA
// on. Reuses the '2fa' OTP budget (own 5/hour + 60s cooldown), the
// same one the sign-in email-code step uses.
export const dynamic = "force-dynamic";

// Masked for the dialog ("mr•••@gmail.com"): the user needs to know
// which inbox to check, but the full address never leaves the server.
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || !local) return "•••";
  const shown = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${shown}•••@${domain}`;
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-2fa-disable-send-code", 10, 60_000, {
    failClosed: true,
  });
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-disable-send-code");
  if (!getEmailConfig()) return serviceUnavailable("2fa-disable-send-code");

  const sessionUser = await getSessionUser(req, prereqs.secret);
  if (!sessionUser || sessionUser.auth !== "email") {
    return jsonError("Sign in with email to manage two-factor authentication.", 401);
  }
  // R3-L5: per-email bucket on top of the per-IP limit (same
  // pattern as sign-in/verify/disable).
  const emailLimited = await rateLimitKey(
    `auth-2fa-disable-send-code-email:${sessionUser.email.toLowerCase()}`,
    10,
    60_000,
    { failClosed: true }
  );
  if (emailLimited) return emailLimited;

  const user = await getUserByEmail(sessionUser.email);
  if (!user || !user.totp_enabled || !user.email_verified) {
    return jsonError("Sign in with email to manage two-factor authentication.", 401);
  }

  const result = await issueOtpCode(sessionUser.email, "2fa");
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
      return serviceUnavailable("2fa-disable-send-code");
    }
    return jsonError("Could not send the email. Please try again.", 502);
  }
  return NextResponse.json({ sent: true, email: maskEmail(sessionUser.email) });
}
