-- 009_byok_key_storage.sql — server-held BYOK provider keys.
--
-- Bring-your-own-key provider keys used to live in the browser's
-- localStorage (lp_ai_byok), where any JavaScript on the site (an
-- XSS hole, a shady extension) could read every paid provider key
-- at once, and they were shipped to the server in plain JSON on
-- every AI call. They now live here, encrypted, and the browser
-- never sees them again: routes read them with the service-role key
-- and call the provider on the user's behalf. The browser sends
-- only a provider reference ({ provider, baseUrl?, model? }).
--
-- Same rules as 004/005/006: RLS is ON with NO public policies, so
-- the anon key cannot read or write a single row. Only the server,
-- using the service-role key (SUPABASE_SERVICE_ROLE_KEY, Vercel
-- env var), touches this table.
--
-- The key is encrypted with AES-256-GCM, key = SHA-256 of the
-- DEDICATED BYOK_ENCRYPTION_KEY (Vercel env var) — and nothing
-- else. There is no SESSION_SECRET fallback: if the var is unset,
-- saving and reading keys fail closed ("no key") instead of
-- silently encrypting under another secret. One row per
-- (user, provider): a user keeps at most one key per provider
-- (Gemini, Groq, Anthropic, OpenAI, OpenRouter, custom). The
-- custom provider also stores its base URL + model here, so the
-- browser never has to send them either.
--
-- Run this once in the Supabase SQL editor (same project as the
-- lessons tables). It is idempotent: re-running it changes nothing.
--
-- The app code FAILS CLOSED when this migration has not run yet:
-- BYOK is unavailable (the /api/byok routes answer 503 and /api/ai
-- answers 400 for a BYOK reference with no stored key) instead of
-- falling back to a browser key. Running it turns BYOK on.

create table if not exists public.lp_byok_keys (
  user_email text not null,
  provider text not null,
  key_encrypted text not null,
  base_url text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_email, provider)
);
alter table public.lp_byok_keys enable row level security;
