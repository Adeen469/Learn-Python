import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth-store";
import { getEmailConfig } from "@/lib/email";
import {
  getAuthPrereqs,
  getSessionUser,
  issueOtpCode,
  jsonError,
  rateLimit,
  serviceUnavailable,
} from "@/lib/auth-routes";

// POST /api/github/delete-repo/send-code — email a repo-deletion code
// to the signed-in user's address. The delete dialog calls this the
// moment the user types the exact owner/repo name, so the code boxes
// are already waiting by the time they open their inbox. Only works
// with a valid session, so a code can never be requested for someone
// else's account — and only for a verified email.
export const dynamic = "force-dynamic";

// Masked for the dialog ("bi•••@gmail.com"): the user needs to know
// which inbox to check, but the full address never leaves the server.
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || !local) return "•••";
  const shown = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${shown}•••@${domain}`;
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "github-delete-send-code", 10, 60_000, {
    failClosed: true,
  });
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("github-delete-send-code");
  if (!getEmailConfig()) return serviceUnavailable("github-delete-send-code");

  const sessionUser = await getSessionUser(req, prereqs.secret);
  if (!sessionUser) {
    return jsonError("Sign in again to delete this repo.", 401);
  }
  const user = await getUserByEmail(sessionUser.email);
  if (!user || !user.email_verified) {
    return jsonError("Sign in again to delete this repo.", 401);
  }

  const result = await issueOtpCode(sessionUser.email, "delete-repo");
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
      return serviceUnavailable("github-delete-send-code");
    }
    return jsonError("Could not send the email. Please try again.", 502);
  }
  return NextResponse.json({ sent: true, email: maskEmail(sessionUser.email) });
}
