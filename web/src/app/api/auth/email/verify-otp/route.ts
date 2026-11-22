import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth";
import { decideOtp } from "@/lib/auth-email";
import {
  consumeOtp,
  createEmailUser,
  deletePendingSignup,
  getLatestOtp,
  getPendingSignup,
  getUserByEmail,
  updateUser,
  bumpOtpAttempts,
} from "@/lib/auth-store";
import {
  clearPending2fa,
  getAuthPrereqs,
  issueSession,
  jsonError,
  rateLimit,
  rateLimitKey,
  readJsonBody,
  serviceUnavailable,
  setPending2fa,
} from "@/lib/auth-routes";

// POST /api/auth/email/verify-otp { email, code, purpose }
// Verifies a sign-up or sign-in code and signs the user in. A wrong,
// expired, consumed, or over-attempted code always yields the same
// generic 400 — the reason is never exposed.
export const dynamic = "force-dynamic";

const GENERIC_CODE_ERROR = "The code is incorrect or has expired.";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-email-verify-otp", 20, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("verify-otp");

  const body = await readJsonBody(req);
  const email = body?.email;
  const code = body?.code;
  const purpose = body?.purpose;
  if (
    !isValidEmail(email) ||
    typeof code !== "string" ||
    (purpose !== "signup" && purpose !== "signin")
  ) {
    return jsonError(GENERIC_CODE_ERROR, 400);
  }

  const user = await getUserByEmail(email);
  const row = await getLatestOtp(email, purpose);
  if (!row) return jsonError(GENERIC_CODE_ERROR, 400);
  // Per-email limit (M7): rotating IPs must not buy unlimited
  // guesses against one inbox.
  const emailLimited = await rateLimitKey(
    `auth-email-verify-otp-email:${email.toLowerCase()}`,
    20,
    60_000
  );
  if (emailLimited) return emailLimited;
  if (purpose === "signin" && (!user || !user.email_verified)) {
    return jsonError(GENERIC_CODE_ERROR, 400);
  }
  if (purpose === "signup") {
    // A sign-up code is only meaningful for a pending sign-up (L8)
    // or a legacy unverified account — never for a stranger's
    // address with no pending row and no account.
    const pending = await getPendingSignup(email);
    if (!pending && !user) return jsonError(GENERIC_CODE_ERROR, 400);
  }

  const decision = decideOtp(
    {
      codeHash: row.code_hash,
      expiresAtMs: new Date(row.expires_at).getTime(),
      attempts: row.attempts,
      consumedAtMs: row.consumed_at
        ? new Date(row.consumed_at).getTime()
        : null,
    },
    code,
    Date.now()
  );
  if (!decision.ok) {
    if (decision.reason === "invalid") await bumpOtpAttempts(row.id);
    return jsonError(GENERIC_CODE_ERROR, 400);
  }
  // Atomic claim: a second request presenting the same code at the
  // same instant loses the claim and gets the generic error.
  const claimed = await consumeOtp(row.id);
  if (!claimed) return jsonError(GENERIC_CODE_ERROR, 400);

  if (purpose === "signup") {
    // The code proved inbox possession: the account is created NOW
    // (L8), never at sign-up time. A pending sign-up carries the
    // name + password hash; a legacy account (created at sign-up
    // before migration 008) just gets verified.
    const pending = await getPendingSignup(email);
    if (pending) {
      if (new Date(pending.expires_at).getTime() < Date.now()) {
        await deletePendingSignup(email);
        return jsonError(GENERIC_CODE_ERROR, 400);
      }
      if (user?.password_hash) {
        // A password already exists for this address — a pending
        // row must never overwrite it.
        return jsonError(GENERIC_CODE_ERROR, 400);
      }
      if (user) {
        // Google-only row (no password): claim it with the verified
        // password. The inbox proof is what authorises the claim.
        await updateUser(user.id, {
          password_hash: pending.password_hash,
          name: pending.name,
          email_verified: true,
          last_sign_in_at: new Date().toISOString(),
        });
      } else {
        const created = await createEmailUser({
          email,
          name: pending.name,
          passwordHash: pending.password_hash,
        });
        if (created.ok) {
          await updateUser(created.user.id, {
            email_verified: true,
            last_sign_in_at: new Date().toISOString(),
          });
        } else if (created.reason === "exists") {
          // Lost a race with another verification: re-read, claim
          // only when the row still has no password.
          const raced = await getUserByEmail(email);
          if (!raced || raced.password_hash) {
            return jsonError(GENERIC_CODE_ERROR, 400);
          }
          await updateUser(raced.id, {
            password_hash: pending.password_hash,
            name: pending.name,
            email_verified: true,
            last_sign_in_at: new Date().toISOString(),
          });
        } else {
          return jsonError("Could not create the account. Please try again.", 503);
        }
      }
      await deletePendingSignup(email);
    } else if (user) {
      await updateUser(user.id, {
        email_verified: true,
        last_sign_in_at: new Date().toISOString(),
      });
    }
  } else if (user) {
    await updateUser(user.id, {
      last_sign_in_at: new Date().toISOString(),
    });
  }

  // Re-read: a fresh sign-up may just have created the row, and the
  // session below needs the real user (version, 2FA flag).
  const finalUser = (await getUserByEmail(email)) ?? user;
  if (!finalUser) {
    return jsonError("Could not create the account. Please try again.", 503);
  }

  const res = NextResponse.json({
    user: { email: finalUser.email, name: finalUser.name, picture: null },
    ...(finalUser.totp_enabled ? { needs2fa: true } : {}),
  });
  if (finalUser.totp_enabled) {
    // The code proved email possession; the second factor still has
    // to be completed before any session is issued.
    await setPending2fa(res, prereqs.secret, finalUser.email, prereqs.isSecure);
    return res;
  }
  await issueSession(
    res,
    prereqs.secret,
    { email: finalUser.email, name: finalUser.name, picture: null },
    prereqs.isSecure,
    { auth: "email", mfa: false, sv: finalUser.session_version ?? 0 }
  );
  // A stale pending cookie must never survive a fresh sign-in.
  clearPending2fa(res, prereqs.isSecure);
  return res;
}
