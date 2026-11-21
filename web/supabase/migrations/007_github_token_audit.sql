-- 007_github_token_audit.sql — audit log for server-held GitHub token use + token expiry.
--
-- Two gaps the 006 token move left open:
--
-- (1) A stored token's use was invisible. If a token ever leaked,
--     nothing recorded what it did. lp_github_token_audit now
--     records every mutating use — token saved/deleted, repo
--     created/deleted, commit — with the user, the repo and the
--     caller's IP, so misuse shows up fast. The audit write is
--     best-effort in code: a dead audit table never breaks the
--     action it records.
--
-- (2) A token's expiry was unknown to the server. GitHub reports
--     it in the github-authentication-token-expiration header when
--     a token is saved; the route stores it in lp_github_tokens
--     .expires_at (null = no expiry / GitHub unreachable at save
--     time) and the GitHub page warns when it is close.
--
-- Same rules as 004/005/006: RLS is ON with NO public policies,
-- so the anon key cannot read or write a single row. Only the
-- server, using the service-role key (SUPABASE_SERVICE_ROLE_KEY,
-- Vercel env var), touches these.
--
-- Run this once in the Supabase SQL editor (same project as the
-- lessons tables). It is idempotent: re-running it changes nothing.
-- The app code tolerates it not being run yet: the audit insert
-- fails silently and expires_at reads as null.

create table if not exists public.lp_github_token_audit (
  id bigint generated always as identity primary key,
  user_email text not null,
  action text not null,
  repo text,
  ip text,
  created_at timestamptz not null default now()
);
alter table public.lp_github_token_audit enable row level security;

alter table public.lp_github_tokens add column if not exists expires_at timestamptz;
