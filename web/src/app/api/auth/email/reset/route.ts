import { NextRequest, NextResponse } from "next/server";
import {
  decideResetToken,
  hashPassword,
  isValidPassword,
  sha256Hex,
} from "@/lib/auth-email";
import {
  getResetTokenByHash,
  markResetTokenUsed,
  updateUser,
} from "@/lib/auth-store";
import {
  getAuthPrereqs,
  jsonError,
  rateLimit,
  readJsonBody,
  serviceUnavailable,
} from "@/lib/auth-routes";

// /api/auth/email/reset
//   GET  ?token=...  — checks whether a reset link is still valid.
//   POST { token, password } — sets the new password, single-use.
// A bad, expired, or already-used token always yields the same
// generic answer — the reason is never exposed.
export const dynamic = "force-dynamic";

const GENERIC_TOKEN_ERROR = "This reset link is invalid or has expired.";

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "auth-email-reset-check", 20, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("reset");

  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false });
  const row = await getResetTokenByHash(sha256Hex(token));
  if (!row) return NextResponse.json({ valid: false });
  const decision = decideResetToken(
    {
      tokenHash: row.token_hash,
      expiresAtMs: new Date(row.expires_at).getTime(),
      usedAtMs: row.used_at ? new Date(row.used_at).getTime() : null,
    },
    token,
    Date.now()
  );
  return NextResponse.json({ valid: decision.ok });
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-email-reset", 10, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("reset");

  const body = await readJsonBody(req);
  const token = body?.token;
  const password = body?.password;
  if (typeof token !== "string" || !isValidPassword(password)) {
    return jsonError(
      isValidPassword(password)
        ? GENERIC_TOKEN_ERROR
        : "Password must be at least 8 characters.",
      400
    );
  }

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

  await markResetTokenUsed(row.id);
  const passwordHash = await hashPassword(password);
  const updated = await updateUser(row.user_id, { password_hash: passwordHash });
  if (!updated) {
    return jsonError("Could not reset the password. Please try again.", 503);
  }
  return NextResponse.json({ ok: true });
}
