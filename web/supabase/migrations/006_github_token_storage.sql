-- 006_github_token_storage.sql — server-held GitHub tokens.
--
-- The GitHub Personal Access Token used to live in the browser's
-- localStorage, where any JavaScript on the site (an XSS hole, a
-- shady extension) could read it. It now lives here, encrypted,
-- and the browser never sees it again: routes read it with the
-- service-role key and call GitHub on the user's behalf.
--
-- Same rules as 004/005: RLS is ON with NO public policies, so the
-- anon key cannot read or write a single row. Only the server,
-- using the service-role key (SUPABASE_SERVICE_ROLE_KEY, Vercel
-- env var), touches this table.
--
-- The token is encrypted with AES-256-GCM, key = SHA-256 of
-- SESSION_SECRET (the same helper as the TOTP secrets in
-- src/lib/auth-email.ts). Rotating SESSION_SECRET invalidates
-- every stored token — users reconnect once from the GitHub page.
--
-- Run this once in the Supabase SQL editor (same project as the
-- lessons tables). It is idempotent: re-running it changes nothing.
--
-- The app code FAILS CLOSED when this migration has not run yet:
-- the GitHub routes answer 503 ("token storage is not set up yet")
-- instead of falling back to a browser token. There is no fallback.
-- Running it turns GitHub features on.

create table if not exists public.lp_github_tokens (
  user_email text primary key,
  token_encrypted text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.lp_github_tokens enable row level security;
