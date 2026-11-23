import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidEmail } from "@/lib/auth";
import { decideOtp, hashPassword, isValidPassword } from "@/lib/auth-email";
import {
  consumeOtp,
  createEmailUser,
  deleteExpiredPendingSignups,
  deletePendingSignup,
  getLatestOtp,
  getPendingSignup,
  getUserByEmail,
  incrementSessionVersion,
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

// R3-H1 full fix: a signup code with a pending row cannot complete
// without the code-enterer's password. The code is NOT consumed on
// this error — the user goes back, re-enters the password they chose
// at sign-up, and the same code still works.
const SIGNUP_PASSWORD_REQUIRED =
  "To finish creating your account, go back to the sign-up form and enter the password you chose, then enter the code again.";

const PASSWORD_REQUIREMENTS =
  "Password must be at least 8 characters and include upper- and lowercase letters and a number.";

const verifyOtpSchema = z.object({
  email: z.string().min(3).max(254),
  code: z.string().min(1).max(10),
  purpose: z.enum(["signup", "signin"]),
  // R3-H1 full fix: the password the code-enterer chose, for a
  // signup-purpose code. The account is created with THIS password,
  // never the pending row's — the row's hash was chosen by whoever
  // created the row, which may be an attacker squatting the address.
  // Optional: sign-in codes and legacy verifications do not use it,
  // and a deep-linked / refreshed code step has no password to send.
  password: z.string().min(1).max(128).optional(),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-email-verify-otp", 20, 60_000, {
    failClosed: true,
  });
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("verify-otp");

  // R3-M6: opportunistic cleanup of expired pending sign-ups —
  // best-effort, never fails the request.
  void deleteExpiredPendingSignups();

  const body = await readJsonBody(req);
  const parsed = verifyOtpSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError(GENERIC_CODE_ERROR, 400);
  }
  const email = parsed.data.email;
  const code = parsed.data.code;
  const purpose = parsed.data.purpose;
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
    60_000,
    { failClosed: true }
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
  // R3-H1 FULL FIX — the account password must come from the person
  // entering the code, never from the pending row.
  //
  // The attack: an attacker signs up with the victim's email and
  // the attacker's password, so the pending row holds the attacker's
  // hash and a code is mailed to the victim's inbox. The victim
  // enters that code expecting their own sign-up, and verify-otp
  // used to create the account from the pending row — with the
  // attacker's password. Binding the OTP to the row id alone does
  // NOT close this: the code WAS issued for the attacker's row and
  // that row IS still current at verify time. The only thing that
  // closes it is taking the password from the code-enterer: the
  // attacker never sees the code (it goes to the victim's inbox),
  // so whoever presents a valid code is the inbox owner, and the
  // account gets THEIR password.
  //
  // Checked AFTER the code is verified (a wrong code must never
  // probe whether a pending row exists) and BEFORE the code is
  // consumed (a missing/invalid password must never burn the code).
  // Only a signup code with a live pending row needs the password:
  // sign-in codes have no pending row, and a legacy unverified
  // account already has its owner's password.
  let signupPasswordHash: string | null = null;
  if (purpose === "signup") {
    const pendingForBinding = await getPendingSignup(email);
    if (pendingForBinding) {
      if (user?.password_hash) {
        // A password already exists for this address — a pending row
        // must never overwrite it. Checked here (before the claim)
        // so a doomed verify no longer burns a valid code.
        return jsonError(GENERIC_CODE_ERROR, 400);
      }
      const suppliedPassword = parsed.data.password;
      if (
        typeof suppliedPassword !== "string" ||
        suppliedPassword.length === 0
      ) {
        return jsonError(SIGNUP_PASSWORD_REQUIRED, 400);
      }
      if (!isValidPassword(suppliedPassword)) {
        return jsonError(PASSWORD_REQUIREMENTS, 400);
      }
      signupPasswordHash = await hashPassword(suppliedPassword);
    }
  }
  // Atomic claim: a second request presenting the same code at the
  // same instant loses the claim and gets the generic error.
  const claimed = await consumeOtp(row.id);
  if (!claimed) return jsonError(GENERIC_CODE_ERROR, 400);

  if (purpose === "signup") {
    // The code proved inbox possession: the account is created NOW
    // (L8), never at sign-up time. A pending sign-up carries the
    // NAME; the PASSWORD comes from the code-enterer (hashed above,
    // R3-H1 full fix) — the pending row's hash is never used, so a
    // squatted row cannot plant its creator's password. A legacy
    // account (created at sign-up before migration 008) just gets
    // verified and keeps its own password.
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
      if (!signupPasswordHash) {
        // The pending row appeared after the binding check above —
        // a sign-up raced this verify, so the code was not issued
        // for this row and no password was supplied for it. Fail
        // closed rather than creating the account with the row's
        // hash.
        return jsonError(GENERIC_CODE_ERROR, 400);
      }
      if (user) {
        // Google-only row (no password): claim it with the password
        // the code-enterer supplied.
        await updateUser(user.id, {
          password_hash: signupPasswordHash,
          name: pending.name,
          email_verified: true,
          last_sign_in_at: new Date().toISOString(),
        });
      } else {
        const created = await createEmailUser({
          email,
          name: pending.name,
          passwordHash: signupPasswordHash,
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
            password_hash: signupPasswordHash,
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
  // Session rotation (R2-M5, atomic per R2-M11): an OTP sign-in
  // invalidates older tokens like password sign-in does — a stolen
  // session must not survive the victim signing in again via OTP.
  // The bump happens before either branch below, so the 2FA
  // step-up inherits the rotated version too, and the session is
  // issued with the RETURNED version. A failed bump mints nothing.
  const newSessionVersion = await incrementSessionVersion(finalUser.id);
  if (newSessionVersion === null) {
    return jsonError("Could not create the account. Please try again.", 503);
  }
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
    { auth: "email", mfa: false, sv: newSessionVersion }
  );
  // A stale pending cookie must never survive a fresh sign-in.
  clearPending2fa(res, prereqs.isSecure);
  return res;
}
