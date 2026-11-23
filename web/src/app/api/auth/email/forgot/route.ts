import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidEmail } from "@/lib/auth";
import {
  generateResetToken,
  sha256Hex,
  RESET_TOKEN_EXPIRY_MS,
} from "@/lib/auth-email";
import {
  countRecentResetTokens,
  getUserByEmail,
  normalizeEmail,
  storeResetToken,
} from "@/lib/auth-store";
import { getEmailConfig, resetEmail, sendMail } from "@/lib/email";
import {
  enqueuePerEmail,
  getAuthPrereqs,
  jsonError,
  rateLimit,
  readJsonBody,
  sameCostDelay,
  serviceUnavailable,
} from "@/lib/auth-routes";

const forgotSchema = z.object({
  email: z.string().min(3).max(254),
});

// POST /api/auth/email/forgot { email }
// Sends a password-reset link. Always returns { sent: true } — the
// response never reveals whether the email belongs to an account.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-email-forgot", 20, 60 * 60 * 1000, {
    failClosed: true,
  });
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("forgot");
  if (!getEmailConfig()) return serviceUnavailable("forgot");

  const body = await readJsonBody(req);
  const parsed = forgotSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Enter a valid email address.", 400);
  }
  const email = parsed.data.email;
  if (!isValidEmail(email)) {
    return jsonError("Enter a valid email address.", 400);
  }

  // Success-shaped either way (M1): a DB error, a mail failure, or
  // the hourly cap answers exactly like a sent link. The real reason
  // is logged server-side only — the old 502 here fired only when a
  // real user existed, which was the oracle.
  const sentResponse = NextResponse.json({ sent: true });
  // R3-L3: every no-mail exit pays the same fixed delay, so the
  // response time does not reveal whether the account exists.
  const silent = async () => {
    await sameCostDelay();
    return sentResponse;
  };
  const user = await getUserByEmail(email);
  if (!user) return silent();

  // R3-L4: count-then-store runs serialised per email (same as
  // issueOtpCode), so a parallel burst cannot overshoot the 5/hour
  // cap. The mail send happens after, outside the lock — the stored
  // row is what the next request in line counts.
  const prepared = await enqueuePerEmail(normalizeEmail(email), async () => {
    // At most 5 reset emails per hour per account.
    const recent = await countRecentResetTokens(
      user.id,
      Date.now() - 60 * 60 * 1000
    );
    if (recent === null) return { ok: false as const };
    if (recent >= 5) return { ok: false as const };

    const token = generateResetToken();
    const stored = await storeResetToken({
      userId: user.id,
      tokenHash: sha256Hex(token),
      expiresAtMs: Date.now() + RESET_TOKEN_EXPIRY_MS,
    });
    if (!stored) return { ok: false as const };
    return { ok: true as const, token };
  });
  if (!prepared.ok) {
    console.error(JSON.stringify({ event: "auth_forgot_failed", reason: "db_or_cap" }));
    return silent();
  }
  const link = `${prereqs.origin}/auth/reset?token=${prepared.token}`;
  const sent = await sendMail({ to: email, ...resetEmail(link) });
  if (!sent.ok) {
    console.error(
      JSON.stringify({ event: "auth_forgot_failed", reason: sent.reason })
    );
  }
  return sentResponse;
}
