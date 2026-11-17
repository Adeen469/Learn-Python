-- 004_email_auth.sql — email sign-in, password auth, OTP codes,
-- password-reset tokens, and TOTP two-factor authentication.
--
-- The app reads lessons with the anon key (public reads). These auth
-- tables are the opposite: RLS is ON with NO public policies, so the
-- anon key cannot read or write a single row. Only the server, using
-- the service-role key (SUPABASE_SERVICE_ROLE_KEY, Vercel env var),
-- touches them.
--
-- Run this once in the Supabase SQL editor (same project as the
-- lessons tables). It is idempotent: re-running it changes nothing.
-- Secrets are never stored in the clear here — password hashes are
-- scrypt, OTP/reset/backup codes are SHA-256 hashes, and the TOTP
-- secret is AES-256-GCM encrypted (see web/src/lib/auth-email.ts).

create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- Users who sign in with email (Google users stay stateless — no row).
-- ---------------------------------------------------------------------------
create table if not exists public.lp_auth_users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  name text not null default '',
  password_hash text,
  email_verified boolean not null default false,
  totp_secret_enc text,
  totp_pending_enc text,
  totp_enabled boolean not null default false,
  backup_codes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_sign_in_at timestamptz
);

alter table public.lp_auth_users enable row level security;

-- ---------------------------------------------------------------------------
-- One-time codes: sign-up / sign-in / two-factor email codes.
-- The code itself is never stored — only its SHA-256 hash.
-- ---------------------------------------------------------------------------
create table if not exists public.lp_auth_otp (
  id uuid primary key default gen_random_uuid(),
  email citext not null,
  code_hash text not null,
  purpose text not null check (purpose in ('signup', 'signin', '2fa')),
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists lp_auth_otp_email_purpose_idx
  on public.lp_auth_otp (email, purpose, created_at desc);

alter table public.lp_auth_otp enable row level security;

-- ---------------------------------------------------------------------------
-- Password-reset tokens: single-use, 1-hour expiry. Only the SHA-256
-- hash of the token is stored — the token itself only ever travels in
-- the reset email link.
-- ---------------------------------------------------------------------------
create table if not exists public.lp_auth_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.lp_auth_users (id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists lp_auth_reset_tokens_hash_idx
  on public.lp_auth_reset_tokens (token_hash);

alter table public.lp_auth_reset_tokens enable row level security;
