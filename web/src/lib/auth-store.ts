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

/**
 * Read a user row, distinguishing "no such user" from "the database
 * could not be read" (R2-M3). `getUserByEmail` collapses both to
 * null, which let a DB blip fall through to "create the row / mint
 * with sv 0". Callers that mint a session must use this and fail
 * CLOSED on "error", never treat it as "missing".
 */
export type GetUserByEmailResult =
  | { status: "found"; user: AuthUser }
  | { status: "missing" }
  | { status: "error" };

export async function getUserByEmailResult(
  email: string
): Promise<GetUserByEmailResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { status: "error" };
  const { data, error } = await supabase
    .from("lp_auth_users")
    .select("*")
    .eq("email", normalizeEmail(email))
    .limit(1)
    .maybeSingle();
  if (error) return { status: "error" };
  if (!data) return { status: "missing" };
  return { status: "found", user: data as unknown as AuthUser };
}

export async function getUserByEmail(
  email: string
): Promise<AuthUser | null> {
  const result = await getUserByEmailResult(email);
  return result.status === "found" ? result.user : null;
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
 * Atomically claim one backup code (M3, R2-M10, R2-L1, R2-L2):
 * remove the matched hash ONLY if it is still in the stored list,
 * and report whether this caller won the claim. Two parallel
 * requests presenting the same code cannot both succeed — the loser
 * sees no row updated and must fail.
 *
 * The removal is computed from a freshly re-read list, never from
 * a caller-computed `remaining`: two parallel claims of DIFFERENT
 * codes used to resurrect each other's code, because each wrote a
 * list computed from the same stale read. The write is guarded by
 * `.contains()` on the matched hash, and after the write the list
 * is re-read — if the hash is back (a parallel claim re-wrote the
 * list from a stale read), the claim loops and removes it again.
 * Any error fails CLOSED (false) — the old plain-update fallback
 * is gone, so a failing guard can never silently double-spend.
 *
 * Legacy SHA-256 codes retire with the claim: any non-scrypt entry
 * still in the list is dropped alongside the matched code. The
 * remaining legacy codes cannot be re-hashed under scrypt — their
 * plaintext is not stored anywhere — so retiring them (forcing
 * regeneration, which the user does from Settings) is the only way
 * to bound the weak form's lifetime. The user keeps TOTP access.
 */
export async function claimBackupCode(
  userId: string,
  matchedHash: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: row } = await supabase
      .from("lp_auth_users")
      .select("backup_codes")
      .eq("id", userId)
      .maybeSingle();
    const list = (row as { backup_codes?: string[] } | null)
      ?.backup_codes ?? [];
    if (!list.includes(matchedHash)) return false;
    // Drop the matched code — and every remaining legacy SHA-256
    // entry, which cannot be re-hashed without its plaintext.
    const remaining = list.filter(
      (h) => h !== matchedHash && h.startsWith("scrypt$")
    );
    const { data, error } = await supabase
      .from("lp_auth_users")
      .update({ backup_codes: remaining })
      .eq("id", userId)
      .contains("backup_codes", [matchedHash])
      .select("id");
    if (error || !data || (data as { id: string }[]).length === 0) {
      continue;
    }
    // Post-write check: a parallel claim of a different code may
    // have re-written the list from a stale read after this write,
    // resurrecting the matched hash. Re-read, and loop to remove it
    // again if it is back.
    const { data: after } = await supabase
      .from("lp_auth_users")
      .select("backup_codes")
      .eq("id", userId)
      .maybeSingle();
    const afterList = (after as { backup_codes?: string[] } | null)
      ?.backup_codes ?? [];
    if (!afterList.includes(matchedHash)) return true;
  }
  return false;
}

/**
 * Atomically record the TOTP step a code was accepted for (M4, R2-M9 —
 * replay protection). The record IS the check: the UPDATE only lands
 * when the stored step is NULL or a different step, and the caller
 * must require "claimed" BEFORE issuing a session. Two sign-in flows
 * presenting the same code in parallel can no longer both pass —
 * the loser sees zero rows updated ("replay") and must fail.
 *
 * "unavailable" means the column does not exist yet (migration 008
 * not run) or there is no DB client: replay protection simply is
 * not active, and the caller proceeds as before. Any other DB error
 * is "error" — fail closed, issue nothing.
 */
export type ClaimTotpStepResult =
  | "claimed"
  | "replay"
  | "unavailable"
  | "error";

export async function claimTotpStep(
  userId: string,
  step: number
): Promise<ClaimTotpStepResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // R3-L9: "unavailable" silently drops replay protection — log
    // it loudly instead of letting a missing migration pass quiet.
    console.error(
      JSON.stringify({
        event: "totp_replay_unavailable",
        reason: "no_supabase_client",
      })
    );
    return "unavailable";
  }
  const { data, error } = await supabase
    .from("lp_auth_users")
    .update({ totp_last_step: step, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .or(`totp_last_step.is.null,totp_last_step.neq.${step}`)
    .select("id");
  if (!error && data) {
    return (data as { id: string }[]).length > 0 ? "claimed" : "replay";
  }
  // A missing column (migration 008 not run yet) is the only error
  // that passes through — replay protection just activates with the
  // migration, as before. Every other DB error fails closed.
  const code = (error as { code?: string } | null)?.code;
  const message =
    error instanceof Error ? error.message : String(error ?? "");
  if (
    code === "PGRST204" ||
    (message.includes("totp_last_step") &&
      message.includes("schema cache"))
  ) {
    // R3-L9: the column is missing (migration 008 not run) — replay
    // protection is off, and that must never be silent.
    console.error(
      JSON.stringify({
        event: "totp_replay_unavailable",
        reason: "missing_totp_last_step_column",
      })
    );
    return "unavailable";
  }
  return "error";
}

/**
 * Backwards-compatible wrapper: true only when this caller won the
 * atomic step claim. Prefer claimTotpStep — it distinguishes a
 * replay from a missing column.
 */
export async function recordTotpStep(
  userId: string,
  step: number
): Promise<boolean> {
  return (await claimTotpStep(userId, step)) === "claimed";
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
 * Retire EVERY live reset token for a user EXCEPT the presented one
 * (R2-L4). Called at claim time, BEFORE the password is written —
 * two concurrent resets with different live tokens can no longer
 * both succeed, because the second token dies with the first claim.
 * Best-effort: false when the update fails; the presented token is
 * already claimed by then, so the reset itself still stands.
 */
export async function invalidateOtherResetTokens(
  userId: string,
  exceptTokenId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase
    .from("lp_auth_reset_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("user_id", userId)
    .neq("id", exceptTokenId)
    .is("used_at", null);
  return !error;
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
 * THE one atomic session_version increment (R2-M11). Every call
 * site — logout, sign-in, 2FA enable/disable/backup-codes, password
 * reset — must use this, never a locally computed `+ 1`. The UPDATE
 * only lands when the version is still the value just read
 * (compare-and-swap, same pattern as bumpTotpFailedAttempts), so two
 * concurrent bumps cannot both write N+1 and leave a session valid
 * after logout/reset. Returns the NEW version, or null when it could
 * not be bumped — sign-in must use the returned value and mint
 * nothing on null. The column is NOT NULL DEFAULT 0 (migration
 * 005), so the equality check never has to deal with NULL.
 */
export async function incrementSessionVersion(
  userId: string
): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: row } = await supabase
      .from("lp_auth_users")
      .select("session_version")
      .eq("id", userId)
      .maybeSingle();
    if (!row) return null;
    const current =
      (row as { session_version?: number }).session_version ?? 0;
    const { data, error } = await supabase
      .from("lp_auth_users")
      .update({
        session_version: current + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .eq("session_version", current)
      .select("session_version");
    if (!error && data && (data as { session_version: number }[]).length > 0) {
      return (data as { session_version: number }[])[0].session_version;
    }
  }
  return null;
}

/**
 * Bump a user's session version (migration 005) and clear the TOTP
 * failure counter and the sign-in lockout (R2-L5: a password reset
 * already proved inbox ownership, so a lockout the attacker caused
 * must not keep the victim out with their new password). Used after
 * a password reset: every session signed before the reset stops
 * verifying, and a locked step-up flow opens again. Best-effort:
 * false when the version could not be bumped — the password itself
 * is already changed, revocation just activates with the migration.
 */
export async function bumpSessionVersion(userId: string): Promise<boolean> {
  const bumped = await incrementSessionVersion(userId);
  if (bumped === null) return false;
  await updateUser(userId, {
    totp_failed_attempts: 0,
    signin_failed_attempts: 0,
    signin_locked_until: null,
  });
  return true;
}

// ---------------------------------------------------------------------------
// Progressive sign-in lockout (M5, migration 008). Threshold and
// window live in auth-email.ts (SIGNIN_LOCKOUT_THRESHOLD /
// SIGNIN_LOCKOUT_MS) — this file only reads and writes the row.
// ---------------------------------------------------------------------------

/**
 * Record one failed password check. Atomic compare-and-swap (R2-M6),
 * like bumpTotpFailedAttempts: the UPDATE only lands when the
 * counter is still the value just read, so parallel wrong guesses
 * cannot all read N and all write N+1 and stall the lockout. Returns
 * the consecutive failure count, or 0 when it could not be recorded
 * (migration 008 not run yet — the lockout is then inactive, never
 * a sign-in failure). At the threshold the account locks for 15
 * minutes and the counter resets, so the lock always lasts a full
 * 15 minutes from the last burst.
 */
export async function recordSigninFailure(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    const user = await getUserById(userId);
    if (!user) return 0;
    const current = user.signin_failed_attempts ?? 0;
    const attempts = current + 1;
    const patch =
      attempts >= SIGNIN_LOCKOUT_THRESHOLD
        ? {
            signin_failed_attempts: 0,
            signin_locked_until: new Date(
              Date.now() + SIGNIN_LOCKOUT_MS
            ).toISOString(),
          }
        : { signin_failed_attempts: attempts };
    const { data, error } = await supabase
      .from("lp_auth_users")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .eq("signin_failed_attempts", current)
      .select("id");
    if (!error && data && (data as { id: string }[]).length > 0) {
      return attempts;
    }
  }
  return 0;
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

/**
 * Hold a sign-up pending until the emailed code is verified (L8).
 * Refuses to overwrite an UNEXPIRED pending row (R2-M4): an attacker
 * who re-signs-up with a victim's email used to replace the victim's
 * password hash, so the victim's own code created the account with
 * the attacker's password. Now the pending row — and therefore the
 * password the account is created with — is the one the code was
 * issued for. A caller that gets "exists" still sends the code (the
 * signup route does), so the legitimate owner is never blocked by
 * their own in-flight sign-up; they just keep the password they
 * first chose until the row expires (24h). An expired row is
 * deleted and replaced.
 */
export async function storePendingSignup(args: {
  email: string;
  name: string;
  passwordHash: string;
  expiresAtMs: number;
}): Promise<
  { ok: true } | { ok: false; reason: "exists" | "db" }
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, reason: "db" };
  const existing = await getPendingSignup(args.email);
  if (existing) {
    return { ok: false, reason: "exists" };
  }
  const { error } = await supabase.from("lp_auth_pending_signups").upsert(
    {
      email: normalizeEmail(args.email),
      name: args.name,
      password_hash: args.passwordHash,
      expires_at: new Date(args.expiresAtMs).toISOString(),
    },
    { onConflict: "email" }
  );
  if (error) {
    // Lost a race with another sign-up for the same email: re-read —
    // an unexpired row now held by someone else is "exists", not a
    // database failure.
    if ((error as { code?: string }).code === "23505") {
      const raced = await getPendingSignup(args.email);
      if (raced) return { ok: false, reason: "exists" };
    }
    return { ok: false, reason: "db" };
  }
  return { ok: true };
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
  const row = data as unknown as PendingSignup;
  // Opportunistic expiry (R2-L12): the migration never deletes
  // expired rows, so drop them on access instead of letting stale
  // password hashes accumulate indefinitely.
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await deletePendingSignup(email);
    return null;
  }
  return row;
}

export async function deletePendingSignup(email: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase
    .from("lp_auth_pending_signups")
    .delete()
    .eq("email", normalizeEmail(email));
}

/**
 * R3-M6: delete expired pending sign-ups (migration 010 defines
 * `delete_expired_pending_signups()` but nothing ever called it).
 * Best-effort — callers fire-and-forget this; a failure must never
 * fail the request. Only the service-role client may execute it.
 */
export async function deleteExpiredPendingSignups(): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  try {
    await supabase.rpc("delete_expired_pending_signups");
  } catch {
    // Best-effort cleanup only.
  }
}
