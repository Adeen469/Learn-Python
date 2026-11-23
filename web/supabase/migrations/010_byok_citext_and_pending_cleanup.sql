-- 010_byok_citext_and_pending_cleanup.sql — BYOK email case fix
-- (R2-L12) + expired pending-signup cleanup (R2-L12).
--
-- Same rules as 004/005/006/008/009: RLS is ON with NO public
-- policies on every table here, so the anon key cannot read or
-- write a single row. Only the server, using the service-role key
-- (SUPABASE_SERVICE_ROLE_KEY, Vercel env var), touches them.
--
-- Run this once in the Supabase SQL editor (same project as the
-- lessons tables). It is idempotent: re-running it changes nothing.
--
-- (1) 009's lp_byok_keys.user_email is `text` (case-sensitive)
-- while 008's lp_auth_pending_signups.email is `citext` — a case
-- mismatch between save and lookup misses the key (fail-closed,
-- availability-only), and the same address can hold two BYOK rows
-- (Google-case vs DB-lowercase). Making the column citext (the
-- extension was enabled in 004) makes save/lookup case-insensitive
-- like every other email column in the schema.
--
-- (2) 008's lp_auth_pending_signups rows "expire after 24 hours"
-- but nothing ever deletes them — expired rows (stale password
-- hashes) accumulate indefinitely, because expiry depends entirely
-- on app code. There is no scheduled-job extension in this project,
-- so this adds a small SQL function the app calls opportunistically (e.g. on a
-- sign-up/verify path) to delete expired rows; EXECUTE is revoked
-- from PUBLIC exactly like bump_otp_attempts in 008, so only the
-- service-role key may call it. No trigger: there is no periodic
-- event to hang one on, and a function the app calls is the
-- smallest mechanism that actually runs.

-- ---------------------------------------------------------------------------
-- (1) lp_byok_keys.user_email: text -> citext (guarded, so a
-- re-run is a no-op once the column is already citext).
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'lp_byok_keys'
      and column_name = 'user_email'
      and udt_name <> 'citext'
  ) then
    alter table public.lp_byok_keys
      alter column user_email type citext;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- (2) Expired pending-signup cleanup: delete rows past expires_at.
-- Returns nothing; the caller only needs the rows gone.
-- ---------------------------------------------------------------------------
create or replace function public.delete_expired_pending_signups()
returns void
language sql
as $$
  delete from public.lp_auth_pending_signups where expires_at < now();
$$;

revoke execute on function public.delete_expired_pending_signups() from public;
