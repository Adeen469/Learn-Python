import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth";
import { hashPassword, isValidPassword } from "@/lib/auth-email";
import {
  createEmailUser,
  getUserByEmail,
  storePendingSignup,
} from "@/lib/auth-store";
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
// Sends a sign-up code. Always answers { sent: true } — the response
// never reveals whether the email already has an account (M1).
//
// The email is NOT reserved here (L8): the name + password hash wait
// in a pending-signup row until the emailed code is verified, and
// only then is the account created. An attacker squatting an address
// can no longer block its real owner from signing up — the owner's
// sign-up overwrites the pending row — and the owner is never
// mail-bombed by it either: at most 5 codes/hour/email, and a code
// is only sent for a fresh or unverified address.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-email-signup", 10, 60_000);
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
    return jsonError(
      "Password must be at least 8 characters and include upper- and lowercase letters and a number.",
      400
    );
  }
  if (name.length < 1 || name.length > 100) {
    return jsonError("Enter your name.", 400);
  }

  // Success-shaped either way — enumeration happens nowhere.
  const sentResponse = NextResponse.json({ sent: true, email });
  const existing = await getUserByEmail(email);
  if (existing?.password_hash) {
    // Already an account with a password. A verified one gets no
    // mail at all (no mail-bombing a stranger's inbox); an
    // unverified legacy one gets its code resent.
    if (!existing.email_verified) {
      await issueOtpCode(email, "signup");
    }
    return sentResponse;
  }

  // No account yet — or a Google-only row (no password): hold the
  // sign-up pending until the code is verified.
  const passwordHash = await hashPassword(password);
  const stored = await storePendingSignup({
    email,
    name,
    passwordHash,
    expiresAtMs: Date.now() + 24 * 60 * 60 * 1000,
  });
  if (!stored) {
    // Pending table missing (migration 008 not run yet): fall back
    // to creating the row now, so sign-up keeps working
    // pre-migration (with the old squatting behaviour until then).
    const created = await createEmailUser({ email, name, passwordHash });
    if (!created.ok) {
      if (created.reason === "exists") return sentResponse;
      return jsonError("Could not create the account. Please try again.", 503);
    }
  }

  const result = await issueOtpCode(email, "signup");
  if (!result.ok) {
    if (result.reason === "not_configured") {
      return serviceUnavailable("signup");
    }
    // Cooldown / cap / mail failure: the pending sign-up waits and
    // the code can be resent from the verification step. The
    // response stays success-shaped — the reason is server-side only.
    console.error(
      JSON.stringify({
        event: "auth_signup_otp_failed",
        reason: result.reason,
      })
    );
  }
  return sentResponse;
}
