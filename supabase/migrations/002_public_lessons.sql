-- LP Phase 3: public (anon) read access to published lessons.
-- Re-runnable: every statement is guarded (IF NOT EXISTS / DROP IF EXISTS).
-- Run AFTER 001_initial_schema.sql, BEFORE seed_lessons.sql.
--
-- Changes:
--   1. lessons.slug (unique) — the public lesson id (e.g. "sample-mega-01").
--   2. video_provider allows 'drive' as well as 'mega'.
--   3. video_url check: mega rows need the provider share-URL pattern
--      (empty '' allowed — lesson not uploaded yet, shown as Coming soon);
--      drive rows accept a Drive file ID (10-64 chars, alphanumerics/-/_).
--   6. quiz jsonb column (see 1b) so DB-served lessons keep their test.
--   4. Unique index on modules (course_id, title) so the seed script can
--      upsert modules with ON CONFLICT.
--   5. SELECT policies for anon + authenticated on published courses,
--      their modules, and their lessons (001 only allowed authenticated).

-- 1. Slug column on lessons.
alter table public.lessons
  add column if not exists slug text unique;

-- 1b. Optional quiz (jsonb) — [{question, options[], answer}].
--    Lessons served from Supabase keep their test; without a quiz
--    the lesson is watch-only for unlocking.
alter table public.lessons
  add column if not exists quiz jsonb;

-- 2. Allow 'drive' in the provider check (001 only allowed 'mega').
--    The inline CHECK in 001 was unnamed, so Postgres auto-named it
--    lessons_video_provider_check; drop it if present, then re-add.
alter table public.lessons
  drop constraint if exists lessons_video_provider_check;
alter table public.lessons
  add constraint lessons_video_provider_check
  check (video_provider in ('mega', 'drive'));

-- 3. Relax the video_url check per provider.
alter table public.lessons
  drop constraint if exists lessons_video_url_check;
alter table public.lessons
  add constraint lessons_video_url_check
  check (
    (video_provider = 'mega' and (video_url = '' or video_url like 'https://mega.nz/%'))
    or
    (video_provider = 'drive' and video_url ~ '^[A-Za-z0-9_-]{10,64}$')
  );

-- 4. Unique index so modules can be upserted on (course_id, title).
create unique index if not exists modules_course_id_title_key
  on public.modules (course_id, title);

-- 5. Public read policies (anon + authenticated) for published content.
--    The authenticated-only policies from 001 stay in place; these add
--    anon access. A row is readable if ANY applicable policy allows it.

drop policy if exists "Anyone can view published courses"
  on public.courses;
create policy "Anyone can view published courses"
  on public.courses for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Anyone can view modules of published courses"
  on public.modules;
create policy "Anyone can view modules of published courses"
  on public.modules for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.is_published = true
    )
  );

drop policy if exists "Anyone can view lessons of published courses"
  on public.lessons;
create policy "Anyone can view lessons of published courses"
  on public.lessons for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id and c.is_published = true
    )
  );
