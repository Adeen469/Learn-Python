-- 005_security_hardening.sql — session revocation, single-use
-- exchange codes, per-account TOTP attempt cap, atomic OTP counting.
--
-- Same rules as 004: RLS is ON with NO public policies on every
-- table here, so the anon key cannot read or write a single row.
-- Only the server, using the service-role key
-- (SUPABASE_SERVICE_ROLE_KEY, Vercel env var), touches them.
--
-- Run this once in the Supabase SQL editor (same project as the
-- lessons tables). It is idempotent: re-running it changes nothing.
--
-- The app code tolerates this migration NOT being run yet: the new
-- columns default to 0, the used-tokens insert is best-effort, and
-- the OTP bump falls back to a read-then-write. Running it turns
-- all four protections on.

-- ---------------------------------------------------------------------------
-- Session revocation: every session carries the user's session_version
-- (sv). Changing the password bumps the version, so all older sessions
-- stop verifying. Google sign-ins have no row — they carry sv 0 and
-- are checked only when a row exists for that email.
-- ---------------------------------------------------------------------------
alter table public.lp_auth_users
  add column if not exists session_version integer not null default 0;

-- ---------------------------------------------------------------------------
-- Per-account TOTP attempt cap: 5 consecutive failed TOTP codes lock
-- the step-up flow until a backup/email code succeeds or the password
-- is reset. (The per-IP rate limit alone is not enough on Vercel,
-- where each serverless instance has its own in-memory limiter.)
-- ---------------------------------------------------------------------------
alter table public.lp_auth_users
  add column if not exists totp_failed_attempts integer not null default 0;

-- ---------------------------------------------------------------------------
-- Single-use tokens: HMAC-signed app-exchange codes, app-state tokens
-- and 2FA step-up cookies are bearer tokens inside their expiry
-- window. Recording the hash of each consumed token makes replay
-- impossible, even within the window. Old rows are tiny (one per
-- sign-in) and pruned opportunistically by the app.
-- ---------------------------------------------------------------------------
create table if not exists public.lp_auth_used_tokens (
  token_hash text primary key,
  used_at timestamptz not null default now()
);
alter table public.lp_auth_used_tokens enable row level security;

-- ---------------------------------------------------------------------------
-- Atomic OTP attempt bump: two wrong guesses at the same instant must
-- not both read the same counter and both write N+1. The function
-- runs as one UPDATE, so the count can never be lost.
-- ---------------------------------------------------------------------------
create or replace function public.bump_otp_attempts(p_id uuid)
returns void
language sql
as $$
  update public.lp_auth_otp set attempts = attempts + 1 where id = p_id;
$$;
