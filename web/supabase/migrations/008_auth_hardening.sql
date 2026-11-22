-- 008_auth_hardening.sql — TOTP replay protection, progressive
-- sign-in lockout, pending sign-ups, and the anon EXECUTE revoke.
--
-- Same rules as 004/005: RLS is ON with NO public policies on every
-- table here, so the anon key cannot read or write a single row.
-- Only the server, using the service-role key
-- (SUPABASE_SERVICE_ROLE_KEY, Vercel env var), touches them.
--
-- Run this once in the Supabase SQL editor (same project as the
-- lessons tables). It is idempotent: re-running it changes nothing.
--
-- The app code tolerates this migration NOT being run yet: the new
-- columns read as undefined (replay protection and the lockout stay
-- inactive), the pending-signup insert fails soft (sign-up falls
-- back to creating the row immediately), and the revoke only
-- matters once the function exists. Running it turns all four
-- protections on.

-- ---------------------------------------------------------------------------
-- TOTP replay protection (M4): the last 30-second step a code was
-- accepted for, per user. A code already used for that step is
-- rejected in a second sign-in flow, even inside the ±1 window.
-- ---------------------------------------------------------------------------
alter table public.lp_auth_users
  add column if not exists totp_last_step bigint;

-- ---------------------------------------------------------------------------
-- Progressive sign-in lockout (M5): 10 consecutive failed password
-- checks lock the account for 15 minutes (see
-- SIGNIN_LOCKOUT_THRESHOLD / SIGNIN_LOCKOUT_MS in
-- web/src/lib/auth-email.ts). A NULL locked_until means "not
-- locked".
-- ---------------------------------------------------------------------------
alter table public.lp_auth_users
  add column if not exists signin_failed_attempts integer not null default 0;

alter table public.lp_auth_users
  add column if not exists signin_locked_until timestamptz;

-- ---------------------------------------------------------------------------
-- Pending sign-ups (L8): sign-up no longer reserves the email. The
-- name + scrypt password hash wait here (one row per email, upserted
-- on re-sign-up) until the emailed code is verified, and only then
-- is the lp_auth_users row created. An attacker squatting an address
-- can no longer block its real owner — the owner's sign-up
-- overwrites the pending row — and the row expires after 24 hours.
-- ---------------------------------------------------------------------------
create table if not exists public.lp_auth_pending_signups (
  email citext primary key,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.lp_auth_pending_signups enable row level security;

-- ---------------------------------------------------------------------------
-- Anon EXECUTE revoke (L24): bump_otp_attempts was executable by the
-- anon role through PostgREST RPC (Postgres grants EXECUTE to PUBLIC
-- by default) — an unauthenticated write primitive into the auth
-- tables. Only the service-role key may call it now.
--
-- Audit of the other functions named in the report: is_admin() and
-- handle_new_user() do NOT exist in this project (no such function
-- in any migration 001–007), so there is nothing to revoke there.
-- bump_otp_attempts is the only public function in the schema.
-- ---------------------------------------------------------------------------
revoke execute on function public.bump_otp_attempts(uuid) from public;
