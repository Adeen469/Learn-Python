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

export async function countRecentOtps(
  email: string,
  purpose: string,
  sinceMs: number
): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { count, error } = await supabase
    .from("lp_auth_otp")
    .select("id", { count: "exact", head: true })
    .eq("email", normalizeEmail(email))
    .eq("purpose", purpose)
    .gte("created_at", new Date(sinceMs).toISOString());
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

export async function getLatestOtp(
  email: string,
  purpose: string
): Promise<OtpDbRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lp_auth_otp")
    .select("*")
    .eq("email", normalizeEmail(email))
    .eq("purpose", purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as OtpDbRow;
}

export async function bumpOtpAttempts(otpId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  // Atomic increment (migration 005). Two wrong guesses at the same
  // instant must not both read N and both write N+1. If the function
  // is missing (migration not run yet), fall back to read-then-write.
  const { error } = await supabase.rpc("bump_otp_attempts", { p_id: otpId });
  if (!error) return;
  const { data } = await supabase
    .from("lp_auth_otp")
    .select("attempts")
    .eq("id", otpId)
    .maybeSingle();
  const attempts = (data as { attempts?: number } | null)?.attempts ?? 0;
  await supabase
    .from("lp_auth_otp")
    .update({ attempts: attempts + 1 })
    .eq("id", otpId);
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
// Single-use bearer tokens (migration 005: lp_auth_used_tokens)
// ---------------------------------------------------------------------------

/**
 * Claim a token hash: true when this caller is the first to present
 * it, false when it was already used (replay). A missing table
 * (migration not run yet) returns true — the protection is
 * best-effort until the migration runs, and a sign-in must never
 * fail for that reason.
 */
export async function claimUsedToken(tokenHash: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return true;
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
  return true;
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
