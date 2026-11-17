import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth";
import { hashPassword, isValidPassword } from "@/lib/auth-email";
import { createEmailUser, getUserByEmail } from "@/lib/auth-store";
import { getEmailConfig } from "@/lib/email";
import {
  getAuthPrereqs,
  issueOtpCode,
  jsonError,
  rateLimit,
  readJsonBody,
  serviceUnavailable,
} from "@/lib/auth-routes";

// POST /api/auth/email/signup { email, password, name }
// Creates an unverified email account and sends the sign-up code.
// The account cannot sign in until the code is verified.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-email-signup", 10, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("signup");
  if (!getEmailConfig()) return serviceUnavailable("signup");

  const body = await readJsonBody(req);
  const email = body?.email;
  const password = body?.password;
  const name =
    typeof body?.name === "string" ? body.name.trim() : "";
  if (!isValidEmail(email)) {
    return jsonError("Enter a valid email address.", 400);
  }
  if (!isValidPassword(password)) {
    return jsonError("Password must be at least 8 characters.", 400);
  }
  if (name.length < 1 || name.length > 100) {
    return jsonError("Enter your name.", 400);
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return jsonError(
      "An account with this email already exists. Try signing in instead.",
      400
    );
  }

  const passwordHash = await hashPassword(password);
  const created = await createEmailUser({ email, name, passwordHash });
  if (!created.ok) {
    if (created.reason === "exists") {
      return jsonError(
        "An account with this email already exists. Try signing in instead.",
        400
      );
    }
    return jsonError("Could not create the account. Please try again.", 503);
  }

  const result = await issueOtpCode(email, "signup");
  if (!result.ok) {
    if (result.reason === "not_configured") {
      return serviceUnavailable("signup");
    }
    // The account exists (unverified) — the code can be resent from
    // the verification step, so this is a retryable failure, not a
    // lost account.
    return jsonError("Could not send the verification email.", 502);
  }
  return NextResponse.json({ sent: true, email });
}
