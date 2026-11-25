-- 013_byok_github_key_hints.sql — masked key hints for saved keys.
--
-- Maalik's order (2026-11-25): BYOK keys and the GitHub token live
-- encrypted on the server, tied to the account — sign in anywhere
-- and they work without re-entering. The UI must prove which key is
-- saved without ever showing it: each row keeps the last 4 chars
-- of the secret as `key_hint` (e.g. "a1b2"), displayed as
-- "••••a1b2". The full key/token is never returned, logged, or
-- stored anywhere else.
--
-- The hint is written at save time (the plaintext is in hand then)
-- and read back by /api/byok/list and /api/github/token/status.
-- The app code tolerates this column missing (migration not run
-- yet): saves retry without the hint and lists fall back to
-- keyHint null, so the feature keeps working and only the hint is
-- absent until this runs. Run once in the Supabase SQL editor.
-- Idempotent: re-running it changes nothing.

alter table public.lp_byok_keys
  add column if not exists key_hint text;

alter table public.lp_github_tokens
  add column if not exists key_hint text;
