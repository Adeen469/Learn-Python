import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  decideOtp,
  decryptUserTotpSecret,
  findBackupCode,
  TOTP_MAX_FAILED_ATTEMPTS,
  totpSecretEncryptionKey,
  verifyPassword,
  verifyTotpCodeWithStep,
} from "@/lib/auth-email";
import {
  bumpOtpAttempts,
  bumpTotpFailedAttempts,
  claimTotpStep,
  consumeOtp,
  getLatestOtp,
  getUserByEmail,
  incrementSessionVersion,
  updateUser,
} from "@/lib/auth-store";
import {
  getAuthPrereqs,
  getSessionUser,
  issueSession,
  jsonError,
  rateLimit,
  rateLimitKey,
  readJsonBody,
  serviceUnavailable,
} from "@/lib/auth-routes";

const disableSchema = z.object({
  password: z.string().min(1).max(128).optional(),
  code: z.string().min(1).max(10).optional(),
  // Second-factor method: "totp" (authenticator app, or a backup
  // code) or "email" (a 6-digit code emailed to the account — the
  // recovery path when the authenticator cannot verify). Defaults
  // to "totp" for older clients that send only password + code.
  method: z.enum(["totp", "email"]).optional(),
});

// POST /api/auth/2fa/disable { password, code, method? } — turn two-factor off.
// The password is re-checked, AND a valid second factor must be
// presented (H10): a phished password alone must not be able to
// strip the second factor. The second factor is a current TOTP code
// (or a backup code), or — method "email" — a code emailed to the
// account via /api/auth/2fa/disable/send-code. The emailed code
// bypasses the TOTP failure cap, exactly like the sign-in email-code
// step: a legacy account whose secret no longer decrypts (key split,
// 2026-11-23) would otherwise be locked out of disabling 2FA
// forever. The session version bumps (H2) and the session is
// re-issued, so every other session dies with the change.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-2fa-disable", 10, 60_000, {
    failClosed: true,
  });
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-disable");

  const sessionUser = await getSessionUser(req, prereqs.secret);
  if (!sessionUser || sessionUser.auth !== "email") {
    return jsonError("Sign in with email to manage two-factor authentication.", 401);
  }
  // R3-L5: per-email bucket on top of the per-IP limit (same
  // pattern as sign-in/verify).
  const emailLimited = await rateLimitKey(
    `auth-2fa-disable-email:${sessionUser.email.toLowerCase()}`,
    10,
    60_000,
    { failClosed: true }
  );
  if (emailLimited) return emailLimited;
  const body = await readJsonBody(req);
  const parsed = disableSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Enter your password and a code from your authenticator app to disable two-factor authentication.", 400);
  }
  const password = parsed.data.password;
  const code = parsed.data.code;
  const method = parsed.data.method ?? "totp";
  if (typeof password !== "string" || typeof code !== "string") {
    return jsonError("Enter your password and a code from your authenticator app to disable two-factor authentication.", 400);
  }

  const user = await getUserByEmail(sessionUser.email);
  if (!user || !user.password_hash) {
    return jsonError("Invalid email or password.", 401);
  }
  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) {
    return jsonError("Invalid email or password.", 401);
  }
  if (!user.totp_enabled) {
    return jsonError("Two-factor authentication is not on.", 400);
  }
  // Legacy secret (key split, 2026-11-23): the stored secret exists
  // but no longer decrypts under TOTP_ENCRYPTION_KEY, so no
  // authenticator code can ever verify for this account. The key
  // check matters: decryptUserTotpSecret also returns null when the
  // key itself is missing, and then the account is not "legacy" —
  // the whole TOTP setup is unconfigured. Guide the user to the
  // emailed code instead of demanding an authenticator code that
  // can never work (and burning the failure cap guessing it).
  const secretUnusable =
    user.totp_secret_enc !== null &&
    user.totp_secret_enc !== undefined &&
    totpSecretEncryptionKey() !== null &&
    decryptUserTotpSecret(user.totp_secret_enc) === null;
  if (method === "totp" && secretUnusable) {
    return jsonError("Your authenticator app can't verify this account. Use an emailed code to turn two-factor authentication off instead.", 400);
  }
  // Per-account attempt cap (R2-M8), same 5-failure lockout as
  // verify/enable: without it the cap was bypassable by guessing
  // codes here instead. A locked disable answers with the same
  // generic error as a wrong code. The emailed-code method skips
  // this cap — like the sign-in email-code step, it is the recovery
  // path for an account the cap has locked out of TOTP.
  if (
    method !== "email" &&
    (user.totp_failed_attempts ?? 0) >= TOTP_MAX_FAILED_ATTEMPTS
  ) {
    return jsonError("The code is incorrect. Check your authenticator app and try again.", 400);
  }

  // Second-factor proof (H10): a current TOTP code, or one of the
  // backup codes (the recovery path when the authenticator is
  // lost) — or, for method "email", the 6-digit code emailed to the
  // account. A replayed TOTP code fails the step check (M4). The
  // emailed code is single-use (consumed atomically) and has its
  // own 5-attempt limit on the OTP row; a wrong emailed code does
  // NOT bump the TOTP failure cap.
  let matchedStep: number | null = null;
  let codeOk = false;
  if (method === "email") {
    const row = await getLatestOtp(sessionUser.email, "2fa");
    if (row) {
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
      if (decision.ok) {
        // Atomic claim: a second request with the same code loses.
        codeOk = await consumeOtp(row.id);
      } else if (decision.reason === "invalid") {
        await bumpOtpAttempts(row.id);
      }
    }
  } else {
    if (user.totp_secret_enc) {
      const secret = decryptUserTotpSecret(user.totp_secret_enc);
      const matched = secret ? verifyTotpCodeWithStep(secret, code) : null;
      const replay =
        matched !== null &&
        user.totp_last_step !== null &&
        user.totp_last_step !== undefined &&
        matched.step === user.totp_last_step;
      if (matched && !replay) {
        codeOk = true;
        matchedStep = matched.step;
      }
    }
    if (!codeOk) {
      const matchedBackup = await findBackupCode(user.backup_codes, code);
      codeOk = matchedBackup !== null;
    }
  }
  if (!codeOk) {
    if (method !== "email") {
      await bumpTotpFailedAttempts(user.id);
    }
    return jsonError("The code is incorrect. Check your authenticator app and try again.", 400);
  }

  // Replay protection (R2-M9): claim the step atomically BEFORE
  // disabling — a second flow presenting the same code loses the
  // claim and fails here, while 2FA stays on.
  if (matchedStep !== null) {
    const stepClaim = await claimTotpStep(user.id, matchedStep);
    if (stepClaim === "replay" || stepClaim === "error") {
      return jsonError("The code is incorrect. Check your authenticator app and try again.", 400);
    }
  }

  // Atomic version bump (R2-M11): the new session carries the
  // RETURNED version; a failed bump disables nothing.
  const newSessionVersion = await incrementSessionVersion(user.id);
  if (newSessionVersion === null) {
    return jsonError("Could not disable two-factor authentication.", 503);
  }
  const saved = await updateUser(user.id, {
    totp_secret_enc: null,
    totp_pending_enc: null,
    totp_enabled: false,
    backup_codes: [],
    totp_failed_attempts: 0,
    // R3-L6: NO session_version here — the CAS incrementSessionVersion
    // above already wrote it.
  });
  if (!saved) {
    return jsonError("Could not disable two-factor authentication.", 503);
  }
  const res = NextResponse.json({ ok: true });
  // Re-issue the session: the old one (old version, mfa:true) is
  // dead from the version bump above, including this browser's.
  await issueSession(res, prereqs.secret, sessionUser, prereqs.isSecure, {
    auth: "email",
    mfa: false,
    sv: newSessionVersion,
  });
  return res;
}
