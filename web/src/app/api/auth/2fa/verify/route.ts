import { NextRequest, NextResponse } from "next/server";
import {
  decideOtp,
  decryptTotpSecret,
  findBackupCode,
  verifyTotpCode,
} from "@/lib/auth-email";
import {
  bumpOtpAttempts,
  consumeOtp,
  getLatestOtp,
  getUserByEmail,
  updateUser,
} from "@/lib/auth-store";
import {
  clearPending2fa,
  getAuthPrereqs,
  issueSession,
  jsonError,
  rateLimit,
  readJsonBody,
  readPending2fa,
  serviceUnavailable,
} from "@/lib/auth-routes";

// POST /api/auth/2fa/verify { code, method: "totp" | "email" | "backup" }
// Completes sign-in after the first factor: consumes the step-up
// cookie and issues the full session (mfa: true). A wrong code always
// yields the same generic 400.
export const dynamic = "force-dynamic";

const GENERIC_CODE_ERROR = "The code is incorrect or has expired.";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-2fa-verify", 10, 60_000);
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

  const email = await readPending2fa(req, prereqs.secret);
  if (!email) {
    return jsonError("Your sign-in step expired. Please sign in again.", 401);
  }
  const user = await getUserByEmail(email);
  if (!user || !user.totp_enabled) {
    return jsonError(GENERIC_CODE_ERROR, 400);
  }

  let verified = false;
  if (method === "totp") {
    if (!user.totp_secret_enc) return jsonError(GENERIC_CODE_ERROR, 400);
    const secret = decryptTotpSecret(prereqs.secret, user.totp_secret_enc);
    verified = secret !== null && verifyTotpCode(secret, code);
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
        await consumeOtp(row.id);
        verified = true;
      } else if (decision.reason === "invalid") {
        await bumpOtpAttempts(row.id);
      }
    }
  } else {
    // Backup code: single-use — the matched hash leaves the list.
    const matched = findBackupCode(user.backup_codes, code);
    if (matched) {
      const remaining = user.backup_codes.filter((h) => h !== matched);
      const saved = await updateUser(user.id, { backup_codes: remaining });
      verified = saved;
    }
  }
  if (!verified) return jsonError(GENERIC_CODE_ERROR, 400);

  await updateUser(user.id, {
    last_sign_in_at: new Date().toISOString(),
  });
  const res = NextResponse.json({
    user: { email: user.email, name: user.name, picture: null },
  });
  await issueSession(
    res,
    prereqs.secret,
    { email: user.email, name: user.name, picture: null },
    prereqs.isSecure,
    { auth: "email", mfa: true }
  );
  clearPending2fa(res, prereqs.isSecure);
  return res;
}
