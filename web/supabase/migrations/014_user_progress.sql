-- 014: per-user progress sync (server-side, keyed by the signed-in user's email).
-- Run once in the Supabase SQL editor (after 001-013; the tables are
-- independent of the others). Re-runnable: every statement is guarded
-- (IF NOT EXISTS).
--
-- The app has NO Supabase Auth — users sign in with Google via the app's own
-- HMAC session (lp_session). Progress rows are keyed by the verified session
-- email (lowercased), never by auth.users(id): the user_progress table from
-- 001 references auth.users and is NOT used by this app.
--
-- RLS is ON with ZERO policies: the public anon key can read/write NOTHING
-- here. Only the service-role key (SUPABASE_SERVICE_ROLE_KEY, used
-- server-side by /api/progress through the session-gated route) reaches
-- these tables — the service role bypasses RLS.
--
-- Tables:
--   lp_user_progress: one row per (user email, lesson slug). Coverage is
--     stored as ranges (JSONB [[start, end], ...], inclusive integer
--     seconds) — compact and exactly mergeable across devices — plus the
--     derived watched-seconds count, completed flag, and test-passed flag.
--   lp_user_daily: one row per (user email, date). `seconds` is the sum of
--     the credited lessons' seconds (never a free counter), so merging two
--     devices can never double-count a lesson. A row's existence IS the
--     activity signal for that date (streaks derive from the log dates).

create table if not exists public.lp_user_progress (
  user_email text not null,
  lesson_id text not null,
  coverage_ranges jsonb not null default '[]'::jsonb,
  watched_seconds int not null default 0 check (watched_seconds >= 0),
  is_completed boolean not null default false,
  test_passed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_email, lesson_id),
  constraint lp_user_progress_email_check
    check (user_email = lower(user_email) and user_email like '%@%.%'),
  constraint lp_user_progress_lesson_check
    check (lesson_id ~ '^[A-Za-z0-9_-]{1,64}$')
);

create index if not exists lp_user_progress_user_idx
  on public.lp_user_progress (user_email);

alter table public.lp_user_progress enable row level security;
-- No policies: service role only (see header).

create table if not exists public.lp_user_daily (
  user_email text not null,
  log_date date not null,
  seconds int not null default 0 check (seconds >= 0),
  goal_minutes int not null default 30 check (goal_minutes > 0),
  credited jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_email, log_date),
  constraint lp_user_daily_email_check
    check (user_email = lower(user_email) and user_email like '%@%.%')
);

create index if not exists lp_user_daily_user_idx
  on public.lp_user_daily (user_email);

alter table public.lp_user_daily enable row level security;
-- No policies: service role only (see header).
