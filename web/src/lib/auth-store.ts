// Supabase access for the email-auth tables.
//
// Server-only. Every function goes through the service-role client
// (getSupabaseAdmin) because the auth tables have RLS on with NO
// public policies — the anon key cannot touch them.
//
// Conventions: functions return null on a database error (routes
// answer 503), except where the caller must distinguish "already
// exists" from "database failed" — those return a discriminated
// result. Emails are normalised (trim + lowercase) before any
// lookup or insert, so `Name@Example.com` and `name@example.com`
// are the same account.

import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  SIGNIN_LOCKOUT_MS,
  SIGNIN_LOCKOUT_THRESHOLD,
} from "@/lib/auth-email";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  email_verified: boolean;
  totp_secret_enc: string | null;
  totp_pending_enc: string | null;
  totp_enabled: boolean;
  backup_codes: string[];
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  // Added by migration 005. Rows read before it runs have these as
  // undefined — every use site treats undefined as 0.
  session_version: number;
  totp_failed_attempts: number;
  // Added by migration 008. Undefined on rows read before it runs —
  // every use site treats undefined as "no record yet", so 2FA and
  // sign-in keep working until the migration is run.
  totp_last_step?: number | null;
  signin_failed_attempts?: number | null;
  signin_locked_until?: string | null;
}

export interface PendingSignup {
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
  expires_at: string;
}

export interface OtpDbRow {
  id: string;
  email: string;
  code_hash: string;
  purpose: string;
  expires_at: string;
  attempts: number;
  consumed_at: string | null;
  created_at: string;
}

export interface ResetTokenDbRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getUserByEmail(
  email: string
): Promise<AuthUser | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lp_auth_users")
    .select("*")
    .eq("email", normalizeEmail(email))
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as AuthUser;
}

export async function getUserById(
  userId: string
): Promise<AuthUser | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lp_auth_users")
    .select("*")
    .eq("id", userId)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as AuthUser;
}

/**
 * Session check that distinguishes "no row" from "the database
 * could not be read". `ok: false` means the check itself failed —
 * the caller must fail CLOSED (no session), never treat a DB blip
 * as a user with no row. `version: null` is a genuine pure-Google
 * user with no row; their session passes on its signature alone.
 * `totpEnabled` is false when there is no row.
 */
export async function getSessionCheckByEmail(
  email: string
): Promise<{ ok: boolean; version: number | null; totpEnabled: boolean }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, version: null, totpEnabled: false };
  const { data, error } = await supabase
    .from("lp_auth_users")
    .select("session_version, totp_enabled")
    .eq("email", normalizeEmail(email))
    .limit(1)
    .maybeSingle();
  if (error) return { ok: false, version: null, totpEnabled: false };
  if (!data) return { ok: true, version: null, totpEnabled: false };
  return {
    ok: true,
    version: (data as { session_version?: number }).session_version ?? 0,
    totpEnabled:
      (data as { totp_enabled?: boolean }).totp_enabled ?? false,
  };
}

/**
 * Session-version check that distinguishes "no row" from "the
 * database could not be read". `ok: false` means the check itself
 * failed — the caller must fail CLOSED (no session), never treat a
 * DB blip as a user with no row. `version: null` is a genuine
 * pure-Google user with no row; their session passes on the
 * signature alone.
 */
export async function getSessionVersionByEmail(
  email: string
): Promise<{ ok: boolean; version: number | null }> {
  const check = await getSessionCheckByEmail(email);
  return { ok: check.ok, version: check.version };
}

/**
 * Create the row for a first-time Google sign-in (H3). Google-only
 * users previously had no row, so logout had nothing to revoke — a
 * stolen Google session stayed valid for 30 days after logout.
 * The row carries no password (password_hash null) and is already
 * email-verified (Google verified the address); it exists so
 * logout, password reset, and the 2FA gate can bump / check the
 * session version like for email users. A race (two sign-ins at
 * once) returns the existing row instead of failing.
 */
export async function createGoogleUser(args: {
  email: string;
  name: string;
}): Promise<AuthUser | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lp_auth_users")
    .insert({
      email: normalizeEmail(args.email),
      name: args.name,
      password_hash: null,
      email_verified: true,
    })
    .select("*")
    .single();
  if (!error && data) return data as unknown as AuthUser;
  if ((error as { code?: string }).code === "23505") {
    return getUserByEmail(args.email);
  }
  return null;
}

export async function createEmailUser(args: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<
  { ok: true; user: AuthUser } | { ok: false; reason: "exists" | "db" }
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, reason: "db" };
  const { data, error } = await supabase
    .from("lp_auth_users")
    .insert({
      email: normalizeEmail(args.email),
      name: args.name,
      password_hash: args.passwordHash,
      email_verified: false,
    })
    .select("*")
    .single();
  if (error) {
    // Unique violation on the citext email (Postgres 23505).
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, reason: "exists" };
    }
    return { ok: false, reason: "db" };
  }
  if (!data) return { ok: false, reason: "db" };
  return { ok: true, user: data as unknown as AuthUser };
}

export async function updateUser(
  userId: string,
  patch: Partial<{
    name: string;
    password_hash: string;
    email_verified: boolean;
    totp_secret_enc: string | null;
    totp_pending_enc: string | null;
    totp_enabled: boolean;
    backup_codes: string[];
    last_sign_in_at: string;
    session_version: number;
    totp_failed_attempts: number;
    totp_last_step: number;
    signin_failed_attempts: number;
    signin_locked_until: string | null;
  }>
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase
    .from("lp_auth_users")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userId);
  return !error;
}

// ---------------------------------------------------------------------------
// One-time codes
// ---------------------------------------------------------------------------

/**
 * OTP sends in the last hour for one email. `purpose: null` counts
 * across ALL purposes (L6): the 5/hour cap and the 60s cooldown are
 * per email, not per purpose, or signup + signin + 2fa codes add up
 * to 15/hour of mail-bombing per address. Pass a purpose only when
 * the caller genuinely needs the per-purpose count (none do today).
 */
export async function countRecentOtps(
  email: string,
  purpose: string | null,
  sinceMs: number
): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  let query = supabase
    .from("lp_auth_otp")
    .select("id", { count: "exact", head: true })
    .eq("email", normalizeEmail(email))
    .gte("created_at", new Date(sinceMs).toISOString());
  if (purpose !== null) query = query.eq("purpose", purpose);
  const { count, error } = await query;
  if (error || count === null) return null;
  return count;
}

export async function storeOtp(args: {
  email: string;
  purpose: string;
  codeHash: string;
  expiresAtMs: number;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  // One live code per email+purpose: retire older unconsumed ones so
  // a resend never leaves two valid codes in play.
  await supabase
    .from("lp_auth_otp")
    .update({ consumed_at: new Date().toISOString() })
    .eq("email", normalizeEmail(args.email))
    .eq("purpose", args.purpose)
    .is("consumed_at", null);
  const { error } = await supabase.from("lp_auth_otp").insert({
    email: normalizeEmail(args.email),
    code_hash: args.codeHash,
    purpose: args.purpose,
    expires_at: new Date(args.expiresAtMs).toISOString(),
  });
  return !error;
}

/**
 * Latest unconsumed OTP for one email. `purpose: null` looks across
 * all purposes (L6 — the resend cooldown is per email, so a signup
 * code sent 30 seconds ago also blocks a 2fa code).
 */
export async function getLatestOtp(
  email: string,
  purpose: string | null
): Promise<OtpDbRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  let query = supabase
    .from("lp_auth_otp")
    .select("*")
    .eq("email", normalizeEmail(email))
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);
  if (purpose !== null) query = query.eq("purpose", purpose);
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data as unknown as OtpDbRow;
}

export async function bumpOtpAttempts(otpId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  // Atomic increment (migration 005). Two wrong guesses at the same
  // instant must not both read N and both write N+1.
  const { error } = await supabase.rpc("bump_otp_attempts", { p_id: otpId });
  if (!error) return;
  // RPC missing (migration not run yet): the same increment as a
  // compare-and-swap — the UPDATE only lands when the counter is
  // still the value just read, so a parallel guess wins instead of
  // silently overwriting it. One retry, then give up.
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: row } = await supabase
      .from("lp_auth_otp")
      .select("attempts")
      .eq("id", otpId)
      .maybeSingle();
    const current = (row as { attempts?: number } | null)?.attempts ?? 0;
    const { data, error: casError } = await supabase
      .from("lp_auth_otp")
      .update({ attempts: current + 1 })
      .eq("id", otpId)
      .eq("attempts", current)
      .select("id");
    if (!casError && data && (data as { id: string }[]).length > 0) return;
  }
}

/**
 * Atomically bump a user's TOTP failure counter (the 2FA step-up
 * cap). Same compare-and-swap as bumpOtpAttempts: the UPDATE only
 * lands when the counter is still the value just read, so two
 * parallel wrong guesses cannot both write N+1 and stall the cap.
 * One retry on a lost race, then give up (the next guess re-reads).
 * The column is NOT NULL DEFAULT 0 (migration 005), so the equality
 * check never has to deal with NULL.
 */
export async function bumpTotpFailedAttempts(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: row } = await supabase
      .from("lp_auth_users")
      .select("totp_failed_attempts")
      .eq("id", userId)
      .maybeSingle();
    const current = (row as { totp_failed_attempts?: number } | null)?.totp_failed_attempts ?? 0;
    const { data, error } = await supabase
      .from("lp_auth_users")
      .update({ totp_failed_attempts: current + 1 })
      .eq("id", userId)
      .eq("totp_failed_attempts", current)
      .select("id");
    if (!error && data && (data as { id: string }[]).length > 0) return true;
  }
  return false;
}

/**
 * Atomically claim one backup code (M3): remove the matched hash
 * ONLY if it is still in the stored list, and report whether this
 * caller won the claim. Two parallel requests presenting the same
 * code cannot both succeed — the loser sees no row updated and must
 * fail. Falls back to the plain update when the array-contains
 * filter errors (older PostgREST), so backup sign-in never breaks
 * outright — it just loses the atomicity on that path.
 */
export async function claimBackupCode(
  userId: string,
  matchedHash: string,
  remaining: string[]
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("lp_auth_users")
    .update({ backup_codes: remaining })
    .eq("id", userId)
    .contains("backup_codes", [matchedHash])
    .select("id");
  if (!error && data) {
    return (data as { id: string }[]).length > 0;
  }
  console.error(
    JSON.stringify({
      event: "auth_backup_claim_fallback",
      error: error instanceof Error ? error.message : "unknown",
    })
  );
  return updateUser(userId, { backup_codes: remaining });
}

/**
 * Record the TOTP step a code was accepted for (M4 — replay
 * protection). Best-effort: false when the column is missing
 * (migration 008 not run yet) — sign-in still succeeds, replay
 * protection just activates with the migration.
 */
export async function recordTotpStep(
  userId: string,
  step: number
): Promise<boolean> {
  return updateUser(userId, { totp_last_step: step });
}

/**
 * Atomically claim a code: mark it consumed ONLY if it is still
 * unconsumed, and report whether this caller won the claim. Two
 * requests presenting the same code at the same instant cannot both
 * succeed — the second sees no row updated and must fail.
 */
export async function consumeOtp(otpId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("lp_auth_otp")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", otpId)
    .is("consumed_at", null)
    .select("id");
  if (error || !data) return false;
  return (data as { id: string }[]).length > 0;
}

// ---------------------------------------------------------------------------
// Password-reset tokens
// ---------------------------------------------------------------------------

export async function storeResetToken(args: {
  userId: string;
  tokenHash: string;
  expiresAtMs: number;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase.from("lp_auth_reset_tokens").insert({
    user_id: args.userId,
    token_hash: args.tokenHash,
    expires_at: new Date(args.expiresAtMs).toISOString(),
  });
  return !error;
}

export async function getResetTokenByHash(
  tokenHash: string
): Promise<ResetTokenDbRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lp_auth_reset_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as ResetTokenDbRow;
}

export async function markResetTokenUsed(tokenId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  // Atomic claim, same as consumeOtp: two concurrent resets with the
  // same link cannot both pass — the loser sees no row updated.
  const { data, error } = await supabase
    .from("lp_auth_reset_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", tokenId)
    .is("used_at", null)
    .select("id");
  if (error || !data) return false;
  return (data as { id: string }[]).length > 0;
}

/**
 * Retire EVERY live reset token for a user (H5). On a successful
 * reset, other outstanding links for the same user must die too —
 * marking only the presented token used leaves earlier links live
 * for an hour. Best-effort: false when the update fails; the
 * presented token is already claimed by then, so the reset itself
 * still stands.
 */
export async function invalidateAllResetTokens(
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase
    .from("lp_auth_reset_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("used_at", null);
  return !error;
}

/**
 * Bump a user's session version (migration 005) and clear the TOTP
 * failure counter. Used after a password reset: every session signed
 * before the reset stops verifying, and a locked step-up flow opens
 * again (the reset link proved email ownership). Best-effort: false
 * when the row or the column is missing — the password itself is
 * already changed, revocation just activates with the migration.
 */
export async function bumpSessionVersion(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  return updateUser(userId, {
    session_version: (user.session_version ?? 0) + 1,
    totp_failed_attempts: 0,
  });
}

// ---------------------------------------------------------------------------
// Progressive sign-in lockout (M5, migration 008). Threshold and
// window live in auth-email.ts (SIGNIN_LOCKOUT_THRESHOLD /
// SIGNIN_LOCKOUT_MS) — this file only reads and writes the row.
// ---------------------------------------------------------------------------

/**
 * Record one failed password check. Returns the consecutive
 * failure count, or 0 when it could not be recorded (migration 008
 * not run yet — the lockout is then inactive, never a sign-in
 * failure). At the threshold the account locks for 15 minutes and
 * the counter resets, so the lock always lasts a full 15 minutes
 * from the last burst.
 */
export async function recordSigninFailure(userId: string): Promise<number> {
  const user = await getUserById(userId);
  if (!user) return 0;
  const attempts = (user.signin_failed_attempts ?? 0) + 1;
  const ok =
    attempts >= SIGNIN_LOCKOUT_THRESHOLD
      ? await updateUser(userId, {
          signin_failed_attempts: 0,
          signin_locked_until: new Date(
            Date.now() + SIGNIN_LOCKOUT_MS
          ).toISOString(),
        })
      : await updateUser(userId, { signin_failed_attempts: attempts });
  return ok ? attempts : 0;
}

/** Clear the failure counter and any lock (on a successful sign-in). Best-effort. */
export async function clearSigninFailures(userId: string): Promise<void> {
  await updateUser(userId, {
    signin_failed_attempts: 0,
    signin_locked_until: null,
  });
}

// ---------------------------------------------------------------------------
// Single-use bearer tokens (migration 005: lp_auth_used_tokens)
// ---------------------------------------------------------------------------

/**
 * Claim a token hash: true when this caller is the first to present
 * it, false when it was already used (replay) — and false when the
 * claim itself cannot be recorded. A missing client or a database
 * error fails CLOSED: single-use protection that cannot be written
 * down is no protection, so the token must not be honoured. (The
 * table exists since migration 005; a fresh database without it
 * refuses these flows until the migration runs.)
 */
export async function claimUsedToken(tokenHash: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase
    .from("lp_auth_used_tokens")
    .insert({ token_hash: tokenHash });
  if (!error) {
    // Opportunistic prune of day-old rows; a failure here is harmless.
    await supabase
      .from("lp_auth_used_tokens")
      .delete()
      .lt("used_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    return true;
  }
  // Unique violation = this hash was already claimed.
  if ((error as { code?: string }).code === "23505") return false;
  return false;
}

export async function countRecentResetTokens(
  userId: string,
  sinceMs: number
): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { count, error } = await supabase
    .from("lp_auth_reset_tokens")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", new Date(sinceMs).toISOString());
  if (error || count === null) return null;
  return count;
}

// ---------------------------------------------------------------------------
// Pending sign-ups (L8, migration 008)
//
// Sign-up no longer reserves the email: the name + password hash
// wait here (one row per email, upserted) until the emailed code is
// verified, and only then is the lp_auth_users row created. Until
// the migration runs, storePendingSignup returns false and the
// signup route falls back to creating the row immediately (the old
// behaviour), so sign-up never breaks pre-migration.
// ---------------------------------------------------------------------------

export async function storePendingSignup(args: {
  email: string;
  name: string;
  passwordHash: string;
  expiresAtMs: number;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase.from("lp_auth_pending_signups").upsert(
    {
      email: normalizeEmail(args.email),
      name: args.name,
      password_hash: args.passwordHash,
      expires_at: new Date(args.expiresAtMs).toISOString(),
    },
    { onConflict: "email" }
  );
  return !error;
}

export async function getPendingSignup(
  email: string
): Promise<PendingSignup | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lp_auth_pending_signups")
    .select("*")
    .eq("email", normalizeEmail(email))
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PendingSignup;
}

export async function deletePendingSignup(email: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase
    .from("lp_auth_pending_signups")
    .delete()
    .eq("email", normalizeEmail(email));
}
