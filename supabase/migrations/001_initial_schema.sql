-- LP (Learning Platform) Initial Schema & Row-Level Security (RLS)
-- Hardened: least-privilege RLS, role escalation protection, search_path pinned.

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  daily_goal_minutes int not null default 30 check (daily_goal_minutes between 5 and 480),
  current_streak int not null default 0 check (current_streak >= 0),
  longest_streak int not null default 0 check (longest_streak >= 0),
  last_activity_date date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper: check admin role safely (pinned search_path prevents hijacking)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Trigger: auto-create student profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles RLS: users read/update own profile, cannot self-promote role
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile (non-role)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- 2. Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  category text,
  level text not null default 'Beginner' check (level in ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
  is_published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Authenticated users can view published courses"
  on public.courses for select
  to authenticated
  using (is_published = true or public.is_admin());

create policy "Admins can manage courses"
  on public.courses for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Modules
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  order_index int not null default 0
);

alter table public.modules enable row level security;

create policy "Authenticated users can view modules of published courses"
  on public.modules for select
  to authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and (c.is_published = true or public.is_admin())
    )
  );

create policy "Admins can manage modules"
  on public.modules for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Lessons (MEGA Video Storage)
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  video_provider text not null default 'mega' check (video_provider in ('mega')),
  video_url text not null check (video_url like 'https://mega.nz/%'),
  duration_seconds int not null default 0 check (duration_seconds >= 0),
  notes_markdown text,
  order_index int not null default 0
);

alter table public.lessons enable row level security;

create policy "Authenticated users can view lessons of published courses"
  on public.lessons for select
  to authenticated
  using (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id and (c.is_published = true or public.is_admin())
    )
  );

create policy "Admins can manage lessons"
  on public.lessons for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. User Lesson Progress
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  is_completed boolean not null default false,
  watched_seconds int not null default 0 check (watched_seconds >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.user_progress enable row level security;

create policy "Users can manage own progress"
  on public.user_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. Daily Goal Logs
create table if not exists public.daily_goal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  log_date date not null default current_date,
  minutes_spent int not null default 0 check (minutes_spent >= 0),
  lessons_completed int not null default 0 check (lessons_completed >= 0),
  is_goal_met boolean not null default false,
  unique (user_id, log_date)
);

alter table public.daily_goal_logs enable row level security;

create policy "Users can manage own daily goals"
  on public.daily_goal_logs for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

