import { NextRequest, NextResponse } from "next/server";
import {
  decideOtp,
  decryptUserTotpSecret,
  findBackupCode,
  sha256Hex,
  TOTP_MAX_FAILED_ATTEMPTS,
  verifyTotpCodeWithStep,
} from "@/lib/auth-email";
import {
  bumpOtpAttempts,
  bumpTotpFailedAttempts,
  claimBackupCode,
  claimUsedToken,
  consumeOtp,
  getLatestOtp,
  getUserByEmail,
  recordTotpStep,
  updateUser,
} from "@/lib/auth-store";
import {
  clearPending2fa,
  getAuthPrereqs,
  issueSession,
  jsonError,
  rateLimit,
  rateLimitKey,
  readJsonBody,
  readPending2fa,
  serviceUnavailable,
  PENDING_2FA_COOKIE,
} from "@/lib/auth-routes";

// POST /api/auth/2fa/verify { code, method: "totp" | "email" | "backup" }
// Completes sign-in after the first factor: consumes the step-up
// cookie and issues the full session (mfa: true). A wrong code always
// yields the same generic 400.
export const dynamic = "force-dynamic";

const GENERIC_CODE_ERROR = "The code is incorrect or has expired.";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-2fa-verify", 10, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-verify");

  const body = await readJsonBody(req);
  const code = body?.code;
  const method = body?.method;
  if (
    typeof code !== "string" ||
    (method !== "totp" && method !== "email" && method !== "backup")
  ) {
    return jsonError(GENERIC_CODE_ERROR, 400);
  }
  const pending = await readPending2fa(req, prereqs.secret);
  if (!pending) {
    return jsonError("Your sign-in step expired. Please sign in again.", 401);
  }
  const email = pending.email;
  // Per-email limit (M7): rotating IPs must not buy unlimited
  // guesses against one account's second factor.
  const emailLimited = await rateLimitKey(
    `auth-2fa-verify-email:${email.toLowerCase()}`,
    10,
    60_000
  );
  if (emailLimited) return emailLimited;
  const user = await getUserByEmail(email);
  if (!user || !user.totp_enabled) {
    return jsonError(GENERIC_CODE_ERROR, 400);
  }

  let verified = false;
  let matchedStep: number | null = null;
  if (method === "totp") {
    if (!user.totp_secret_enc) return jsonError(GENERIC_CODE_ERROR, 400);
    // Per-account attempt cap (migration 005): 5 consecutive failures
    // lock the step-up flow. Only a backup/email code success or a
    // password reset clears it — a TOTP success cannot, or the cap
    // would be useless. The lock answers with the same generic error.
    if ((user.totp_failed_attempts ?? 0) >= TOTP_MAX_FAILED_ATTEMPTS) {
      return jsonError(GENERIC_CODE_ERROR, 400);
    }
    const secret = decryptUserTotpSecret(prereqs.secret, user.totp_secret_enc);
    const matched = secret ? verifyTotpCodeWithStep(secret, code) : null;
    // Replay (M4): this exact code was already accepted once for
    // this step — a second sign-in flow reusing a seen code fails,
    // even inside the ±1 window. (A legitimate user signing in
    // twice within one 30-second step waits for the next code.)
    const replay =
      matched !== null &&
      user.totp_last_step !== null &&
      user.totp_last_step !== undefined &&
      matched.step === user.totp_last_step;
    verified = matched !== null && !replay;
    matchedStep = verified && matched ? matched.step : null;
    if (!verified) {
      // Atomic bump (compare-and-swap in the store): a parallel
      // wrong guess cannot overwrite this one and stall the cap.
      await bumpTotpFailedAttempts(user.id);
    }
  } else if (method === "email") {
    const row = await getLatestOtp(email, "2fa");
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
        verified = await consumeOtp(row.id);
      } else if (decision.reason === "invalid") {
        await bumpOtpAttempts(row.id);
      }
    }
  } else {
    // Backup code: single-use, claimed atomically (M3) — the matched
    // hash leaves the list only if it is still there, so two
    // parallel requests with the same code cannot both succeed.
    // Backup attempts share the per-account failure cap (M4).
    if ((user.totp_failed_attempts ?? 0) >= TOTP_MAX_FAILED_ATTEMPTS) {
      return jsonError(GENERIC_CODE_ERROR, 400);
    }
    const matched = await findBackupCode(user.backup_codes, code);
    if (matched) {
      const remaining = user.backup_codes.filter((h) => h !== matched);
      verified = await claimBackupCode(user.id, matched, remaining);
    }
    if (!verified) {
      await bumpTotpFailedAttempts(user.id);
    }
  }
  if (!verified) return jsonError(GENERIC_CODE_ERROR, 400);

  // Single-use step-up cookie: a stolen copy cannot be replayed
  // within its 10-minute window — the first successful use claims
  // the token hash, and any replay gets the generic error.
  const pendingToken = req.cookies.get(PENDING_2FA_COOKIE)?.value;
  if (pendingToken) {
    const fresh = await claimUsedToken(sha256Hex(pendingToken));
    if (!fresh) return jsonError(GENERIC_CODE_ERROR, 400);
  }

  await updateUser(user.id, {
    last_sign_in_at: new Date().toISOString(),
    totp_failed_attempts: 0,
  });
  // Record the step this TOTP code was accepted for (M4): the same
  // code cannot be replayed in a second sign-in flow within its
  // window. Best-effort — pre-migration the column is missing and
  // replay protection just activates with migration 008.
  if (matchedStep !== null) {
    await recordTotpStep(user.id, matchedStep);
  }
  const res = NextResponse.json({
    user: { email: user.email, name: user.name, picture: null },
  });
  await issueSession(
    res,
    prereqs.secret,
    { email: user.email, name: user.name, picture: null },
    prereqs.isSecure,
    { auth: pending.auth, mfa: true, sv: user.session_version ?? 0 }
  );
  clearPending2fa(res, prereqs.isSecure);
  return res;
}
