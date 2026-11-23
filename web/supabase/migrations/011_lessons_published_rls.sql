-- 011_lessons_published_rls.sql — published-only reads on the
-- lessons/courses tables (R3-M5).
--
-- The app reads lessons with the anon key and filters
-- is_published in app code only (lib/lessons.ts) — anyone holding
-- the public anon key can query Supabase PostgREST directly and
-- read ALL lesson rows, including unpublished/draft rows, unless a
-- DB policy restricts SELECT to published rows. The lessons/courses
-- DDL lives in root migration 001 (on main, as do 002 and 004–009);
-- this migration adds the published-only policies the app needs.
--
-- SAFETY FIRST: the FK column names are discovered at run time,
-- every step is guarded and the migration is a no-op where it
-- cannot prove what it is doing:
--   * a policy is created ONLY when its table + columns exist;
--   * the lessons/modules policies are built from the FK columns
--     discovered in information_schema at run time — if the FKs
--     are not found, the policy is SKIPPED with a NOTICE and RLS
--     stays OFF on that table (current behaviour, not worse);
--   * RLS is enabled on a table ONLY once its published-only
--     policy exists — enabling RLS with no policy would return
--     zero rows to anon and take every lesson down;
--   * re-running is a no-op (policy-exists checks).
--
-- MAALIK STEP: run this once in the Supabase SQL editor (same
-- project as the lessons tables), then verify: as anon, SELECT
-- from lessons/courses must return published rows ONLY, and an
-- unpublished course's lessons must be gone. If the output says a
-- policy was skipped, check the FK column names in Supabase and
-- tell Servant — do NOT force-enable RLS without the policy.
-- This migration was NOT tested against a live DB; the SQL below
-- was checked for syntax/plausibility only.

-- ---------------------------------------------------------------------------
-- (1) courses: published-only SELECT.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'courses'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'courses'
      and column_name = 'is_published'
  ) and not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'courses'
      and policyname = 'courses_published_select'
  ) then
    -- Strict: only is_published IS TRUE is published; a missing
    -- or NULL flag means unpublished, like the app filter.
    create policy courses_published_select on public.courses
      for select using (is_published is true);
  else
    raise notice '011: courses policy skipped (table/column missing or policy already present)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'courses'
      and policyname = 'courses_published_select'
  ) then
    alter table public.courses enable row level security;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- (2) lessons + modules: published-only SELECT, via the
-- lessons -> modules -> courses FK chain discovered at run time.
-- ---------------------------------------------------------------------------
do $$
declare
  lesson_module_col text;  -- lessons.<col> -> modules.<ref>
  lesson_module_ref text;  -- referenced column on modules (id)
  module_course_col text;  -- modules.<col> -> courses.<ref>
  module_course_ref text;  -- referenced column on courses (id)
begin
  select kcu.column_name, ccu.column_name
    into lesson_module_col, lesson_module_ref
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on kcu.constraint_name = tc.constraint_name
    and kcu.table_schema = tc.table_schema
  join information_schema.constraint_column_usage ccu
    on ccu.constraint_name = tc.constraint_name
    and ccu.table_schema = tc.table_schema
  where tc.table_schema = 'public'
    and tc.table_name = 'lessons'
    and tc.constraint_type = 'FOREIGN KEY'
    and ccu.table_name = 'modules'
  limit 1;

  select kcu.column_name, ccu.column_name
    into module_course_col, module_course_ref
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on kcu.constraint_name = tc.constraint_name
    and kcu.table_schema = tc.table_schema
  join information_schema.constraint_column_usage ccu
    on ccu.constraint_name = tc.constraint_name
    and ccu.table_schema = tc.table_schema
  where tc.table_schema = 'public'
    and tc.table_name = 'modules'
    and tc.constraint_type = 'FOREIGN KEY'
    and ccu.table_name = 'courses'
  limit 1;

  if lesson_module_col is not null
    and lesson_module_ref is not null
    and module_course_col is not null
    and module_course_ref is not null
    and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'courses'
        and column_name = 'is_published'
    )
  then
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'lessons'
        and policyname = 'lessons_published_select'
    ) then
      execute format(
        'create policy lessons_published_select on public.lessons '
        'for select using (exists (select 1 from public.modules m '
        'join public.courses c on c.%I = m.%I '
        'where m.%I = public.lessons.%I and c.is_published is true))',
        module_course_ref, module_course_col,
        lesson_module_ref, lesson_module_col
      );
    end if;
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'modules'
        and policyname = 'modules_published_select'
    ) then
      execute format(
        'create policy modules_published_select on public.modules '
        'for select using (exists (select 1 from public.courses c '
        'where c.%I = public.modules.%I and c.is_published is true))',
        module_course_ref, module_course_col
      );
    end if;
  else
    raise notice '011: lessons/modules policies skipped — lessons->modules or modules->courses FK not found (lesson_module_col=%, module_course_col=%)', lesson_module_col, module_course_col;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lessons'
      and policyname = 'lessons_published_select'
  ) then
    alter table public.lessons enable row level security;
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'modules'
      and policyname = 'modules_published_select'
  ) then
    alter table public.modules enable row level security;
  end if;
end $$;
