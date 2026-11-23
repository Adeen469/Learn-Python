import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  decideResetToken,
  hashPassword,
  isValidPassword,
  sha256Hex,
} from "@/lib/auth-email";
import {
  bumpSessionVersion,
  getResetTokenByHash,
  invalidateAllResetTokens,
  invalidateOtherResetTokens,
  markResetTokenUsed,
  updateUser,
} from "@/lib/auth-store";
import {
  getAuthPrereqs,
  jsonError,
  noStore,
  rateLimit,
  rateLimitKey,
  readJsonBody,
  serviceUnavailable,
} from "@/lib/auth-routes";

const resetSchema = z.object({
  // Optional so a missing token/password still gets its own
  // specific 400 message from the checks below.
  token: z.string().min(1).max(1024).optional(),
  password: z.string().min(1).max(128).optional(),
});

// /api/auth/email/reset
//   GET  ?token=...  — checks whether a reset link is still valid.
//   POST { token, password } — sets the new password, single-use.
// A bad, expired, or already-used token always yields the same
// generic answer — the reason is never exposed.
export const dynamic = "force-dynamic";

const GENERIC_TOKEN_ERROR = "This reset link is invalid or has expired.";

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "auth-email-reset-check", 20, 60_000, {
    failClosed: true,
  });
  if (limited) return noStore(limited);

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return noStore(serviceUnavailable("reset"));

  const token = req.nextUrl.searchParams.get("token");
  if (!token) return noStore(NextResponse.json({ valid: false }));
  // Per-token limit (M7): rotating IPs must not buy unlimited
  // guesses against one link. The key is a hash prefix, never the
  // token itself.
  const tokenLimited = await rateLimitKey(
    `auth-email-reset-check-token:${sha256Hex(token).slice(0, 16)}`,
    20,
    60_000,
    { failClosed: true }
  );
  if (tokenLimited) return noStore(tokenLimited);
  const row = await getResetTokenByHash(sha256Hex(token));
  if (!row) return noStore(NextResponse.json({ valid: false }));
  const decision = decideResetToken(
    {
      tokenHash: row.token_hash,
      expiresAtMs: new Date(row.expires_at).getTime(),
      usedAtMs: row.used_at ? new Date(row.used_at).getTime() : null,
    },
    token,
    Date.now()
  );
  return noStore(NextResponse.json({ valid: decision.ok }));
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-email-reset", 10, 60_000, {
    failClosed: true,
  });
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("reset");

  const body = await readJsonBody(req);
  const parsed = resetSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError(GENERIC_TOKEN_ERROR, 400);
  }
  const token = parsed.data.token;
  const password = parsed.data.password;
  if (typeof token !== "string" || !isValidPassword(password)) {
    return jsonError(
      isValidPassword(password)
        ? GENERIC_TOKEN_ERROR
        : "Password must be at least 8 characters and include upper- and lowercase letters and a number.",
      400
    );
  }
  // Per-token limit (M7), as in GET above.
  const tokenLimited = await rateLimitKey(
    `auth-email-reset-token:${sha256Hex(token).slice(0, 16)}`,
    10,
    60_000,
    { failClosed: true }
  );
  if (tokenLimited) return tokenLimited;

  const row = await getResetTokenByHash(sha256Hex(token));
  if (!row) return jsonError(GENERIC_TOKEN_ERROR, 400);
  const decision = decideResetToken(
    {
      tokenHash: row.token_hash,
      expiresAtMs: new Date(row.expires_at).getTime(),
      usedAtMs: row.used_at ? new Date(row.used_at).getTime() : null,
    },
    token,
    Date.now()
  );
  if (!decision.ok) return jsonError(GENERIC_TOKEN_ERROR, 400);

  // Atomic claim first: a concurrent reset with the same link loses
  // the claim and gets the generic error.
  const claimed = await markResetTokenUsed(row.id);
  if (!claimed) return jsonError(GENERIC_TOKEN_ERROR, 400);

  // Retire every OTHER live token for this user NOW (R2-L4), before
  // the password is written: two concurrent resets with different
  // live tokens can no longer both succeed — the second token dies
  // with the first claim, and the last writer no longer wins.
  await invalidateOtherResetTokens(row.user_id, row.id);

  const passwordHash = await hashPassword(password);
  const updated = await updateUser(row.user_id, { password_hash: passwordHash });
  if (!updated) {
    return jsonError("Could not reset the password. Please try again.", 503);
  }
  // Retire EVERY reset token for this user (H5), not just the one
  // presented — any other outstanding link must die with the reset.
  // R3-M1: both revocation calls are checked — retry once, then
  // 503. NEVER answer { ok: true } when revocation may have failed:
  // the victim would believe the attacker's session/link is dead.
  const revokeWithRetry = async (fn: () => Promise<boolean>) =>
    (await fn()) || (await fn());
  const tokensRevoked = await revokeWithRetry(() =>
    invalidateAllResetTokens(row.user_id)
  );
  // Revoke every session signed before this reset (migration 005):
  // the stored version bumps, so older sessions stop verifying.
  const sessionsRevoked = await revokeWithRetry(() =>
    bumpSessionVersion(row.user_id)
  );
  if (!tokensRevoked || !sessionsRevoked) {
    return jsonError(
      "Your password was changed, but your other sessions or reset links may not have been revoked. Please sign out everywhere and try again.",
      503
    );
  }
  return NextResponse.json({ ok: true });
}
