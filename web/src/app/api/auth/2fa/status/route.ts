import { NextRequest, NextResponse } from "next/server";
import {
  decryptUserTotpSecret,
  totpSecretEncryptionKey,
} from "@/lib/auth-email";
import { getUserByEmail } from "@/lib/auth-store";
import {
  getAuthPrereqs,
  getSessionUser,
  jsonError,
  noStore,
  rateLimit,
  serviceUnavailable,
} from "@/lib/auth-routes";

// GET /api/auth/2fa/status — two-factor state for the signed-in user
// (used by Settings). Google accounts have no LP 2FA to manage —
// their second factor lives with Google.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "auth-2fa-status", 30, 60_000, {
    failClosed: true,
  });
  if (limited) return noStore(limited);

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return noStore(serviceUnavailable("2fa-status"));

  const sessionUser = await getSessionUser(req, prereqs.secret);
  if (!sessionUser) {
    return noStore(NextResponse.json({ signedIn: false }));
  }
  if (sessionUser.auth !== "email") {
    return noStore(
      NextResponse.json({
        signedIn: true,
        auth: "google",
        totpEnabled: false,
        hasPassword: false,
        emailVerified: true,
      })
    );
  }
  const user = await getUserByEmail(sessionUser.email);
  if (!user) return noStore(jsonError("Account not found.", 404));
  // Legacy secret (key split, 2026-11-23): the stored secret exists
  // but no longer decrypts under TOTP_ENCRYPTION_KEY, so no
  // authenticator code can ever verify for this account. The key
  // check matters: decryptUserTotpSecret also returns null when the
  // key itself is missing, and then the account is not "legacy" —
  // the whole TOTP setup is unconfigured. Session-gated (this
  // account's owner only), so reporting it leaks nothing.
  const authenticatorBroken =
    user.totp_enabled &&
    user.totp_secret_enc !== null &&
    user.totp_secret_enc !== undefined &&
    totpSecretEncryptionKey() !== null &&
    decryptUserTotpSecret(user.totp_secret_enc) === null;
  return noStore(
    NextResponse.json({
      signedIn: true,
      auth: "email",
      totpEnabled: user.totp_enabled,
      hasPassword: user.password_hash !== null,
      emailVerified: user.email_verified,
      authenticatorBroken,
    })
  );
}
