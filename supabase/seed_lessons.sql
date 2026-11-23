-- LP seed lessons — mirrors web/src/lib/catalog.ts SEED_LESSONS.
-- 268 lessons: CodeWithHarry 100 Days of Code (100), CWH
-- 'Python Tutorials For Absolute Beginners In Hindi' (129,
-- cwh-000..cwh-128, MEGA folder 5N4xiaLZ), Code With Mosh (22),
-- Apna College lectures (9) + one-shots (3), CWH one-shots (5).
-- Run in the Supabase SQL editor AFTER 001_initial_schema.sql
-- (002_public_lessons.sql still worth running for the anon read
-- policies, but this seed no longer depends on it — see preamble).
-- Re-runnable: every insert upserts on its unique key
-- (courses.slug, modules (course_id, title), lessons.slug), so
-- re-running it only updates the rows in place.
-- video_url mirrors the catalog (all lessons carry MEGA links).
-- To add a lesson later, insert one row into public.lessons
-- (no redeploy; the app re-reads Supabase every 60s).

-- Self-sufficient preamble (fix 2026-11-16): the seed used to fail
-- with 42P10 'there is no unique or exclusion constraint matching
-- the ON CONFLICT specification' on the modules upsert when
-- 002_public_lessons.sql had not been run first — 002 is what
-- creates the modules (course_id, title) unique index and the
-- lessons.slug column. These statements create exactly what the
-- upserts below need, idempotently, so the seed works on a DB
-- that only ran 001.
alter table public.lessons add column if not exists slug text;
alter table public.lessons add column if not exists quiz jsonb;
create unique index if not exists modules_course_id_title_key
  on public.modules (course_id, title);
create unique index if not exists lessons_slug_key
  on public.lessons (slug);

do $$
declare
  v_course_id_0 uuid;
  v_course_id_1 uuid;
  v_course_id_2 uuid;
  v_course_id_3 uuid;
  v_course_id_4 uuid;
  v_module_id_0 uuid;
  v_module_id_1 uuid;
  v_module_id_2 uuid;
  v_module_id_3 uuid;
  v_module_id_4 uuid;
  v_module_id_5 uuid;
begin
  insert into public.courses (title, slug, is_published)
    values ('Python Full Course', 'python-full-course', true)
    on conflict (slug) do update set title = excluded.title, is_published = true
    returning id into v_course_id_0;

  insert into public.courses (title, slug, is_published)
    values ('Python One-Shots', 'python-one-shots', true)
    on conflict (slug) do update set title = excluded.title, is_published = true
    returning id into v_course_id_1;

  insert into public.courses (title, slug, is_published)
    values ('Python Tutorials', 'python-tutorials', true)
    on conflict (slug) do update set title = excluded.title, is_published = true
    returning id into v_course_id_2;

  insert into public.courses (title, slug, is_published)
    values ('Python Tutorials For Absolute Beginners In Hindi', 'python-tutorials-for-absolute-beginners-in-hindi', true)
    on conflict (slug) do update set title = excluded.title, is_published = true
    returning id into v_course_id_3;

  insert into public.courses (title, slug, is_published)
    values ('Python for Beginners (Full Course)', 'python-for-beginners', true)
    on conflict (slug) do update set title = excluded.title, is_published = true
    returning id into v_course_id_4;

  insert into public.modules (course_id, title, order_index)
    values (v_course_id_4, '100 Days of Code', 0)
    on conflict (course_id, title) do update set order_index = excluded.order_index
    returning id into v_module_id_0;

  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-001', 'Introduction to Programming & Python | Python Tutorial - Day #1', 'mega', 'https://mega.nz/file/tEAnVSDK#Yt4qIoI6DfErt8o_dTvvfzsw2yKl7KkuV0Ga1urOXgA', 710, 'Watch on YouTube: https://www.youtube.com/watch?v=7wnove7K-ZQ', null, 0)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-002', 'Some Amazing Python Programs - The Power of Python | Python Tutorial - Day #2', 'mega', 'https://mega.nz/file/cVgzUSCD#9dul5m0luDuEk871OlUUKbmugZKTqwfpWija2XOmg_g', 518, 'Watch on YouTube: https://www.youtube.com/watch?v=Tto8TS-fJQU', null, 1)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-003', 'Modules and Pip | Python Tutorial - Day #3', 'mega', 'https://mega.nz/file/QRJ2GLLQ#IIsBKP_pN7r0m6pnIsreVmR0Gy05GhZ-CRgLWSYl2FM', 761, 'Watch on YouTube: https://www.youtube.com/watch?v=xwKO_y2gHxQ', null, 2)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-004', 'Our First Python Program | Python Tutorial - Day #4', 'mega', 'https://mega.nz/file/cYgxxR6I#8bK6WpOWu5w_edCZohC4GagUiiZiVMDHq3SiFaBRMgo', 444, 'Watch on YouTube: https://www.youtube.com/watch?v=7IWOYhfAcVg', null, 3)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-005', 'Comments, Escape Sequences & Print Statement | Python Tutorial - Day #5', 'mega', 'https://mega.nz/file/oUpSXTwY#nh_3395ASXghCI--5kyPTMZD_Q-hiTfi8YX1GrECo6o', 1122, 'Watch on YouTube: https://www.youtube.com/watch?v=qxPMmW93eDs', null, 4)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-006', 'Variables and Data Types | Python Tutorial - Day #6', 'mega', 'https://mega.nz/file/pMwzEJgJ#wL0rW9h_dUyauoI2yUtsT9BS5QxUY_r_lgYEOG4ZrgE', 1005, 'Watch on YouTube: https://www.youtube.com/watch?v=ORCuz7s5cCY', null, 5)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-007', 'Exercise 1: Calculator using Python | Python Tutorial - Day #7', 'mega', 'https://mega.nz/file/0NwAUCbK#WKmA5pJDwuee32nzixVbaUaodznysTSeQxLKe61mzfE', 410, 'Watch on YouTube: https://www.youtube.com/watch?v=FLVqcxnJP_E', null, 6)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-008', 'Exercise 1: Calculator using Python (Solution) | Python Tutorial - Day #8', 'mega', 'https://mega.nz/file/AMJmRRKK#DNL6LVv5-UDYI6p9JiKPXdQXQatINFMjYBvKAcTwOoQ', 622, 'Watch on YouTube: https://www.youtube.com/watch?v=dohaSBCKCr0', null, 7)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-009', 'Typecasting in Python | Python Tutorial - Day #9', 'mega', 'https://mega.nz/file/MZhCwLbQ#ZwzY1twBMw1xnbnO8xYFw4sVwkLUzy7xWbuYZVHBL_o', 565, 'Watch on YouTube: https://www.youtube.com/watch?v=Pu5bqySSSS0', null, 8)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-010', 'Taking User Input in Python | Python Tutorial - Day #10', 'mega', 'https://mega.nz/file/RNoHSD7J#GvbG90agHSpV0spdUCYHZpolyi7vsN8mjSUUri1twzk', 616, 'Watch on YouTube: https://www.youtube.com/watch?v=WvG-R-xXouA', null, 9)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-011', 'Strings in Python | Python Tutorial - Day #11', 'mega', 'https://mega.nz/file/sF4hxb4A#KdHY2qOPPryxNoEfeDCuJ5-_gByRuyNa-6DtYAuc53w', 695, 'Watch on YouTube: https://www.youtube.com/watch?v=kMNFQYArrLg', null, 10)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-012', 'Strings Slicing and Operations on Strings in Python | Python Tutorial - Day #12', 'mega', 'https://mega.nz/file/INRCnLJY#SBZqpI3XxKd1f2rWAsvByOJxvRwks-3-AltQeBkkA4o', 708, 'Watch on YouTube: https://www.youtube.com/watch?v=8jW7lpT8HW8', null, 11)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-013', 'String Methods in Python | Python Tutorial - Day #13', 'mega', 'https://mega.nz/file/RQpGmKwR#Yk-uBqlFgF49ZqczliAFE03YfzUGuoa7g-6SHZzCH6M', 1352, 'Watch on YouTube: https://www.youtube.com/watch?v=0INvoK_T0cE', null, 12)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-014', 'If Else Conditional Statements in Python | Python Tutorial - Day #14', 'mega', 'https://mega.nz/file/5cA3hIpB#tVoDHwyDMHaphhyTuoykn_FpfZL9bKXKNZBIeULJGSk', 1167, 'Watch on YouTube: https://www.youtube.com/watch?v=ceiuLR2ysas', null, 13)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-015', 'Exercise 2: Good Morning Sir | Python Tutorial - Day #15', 'mega', 'https://mega.nz/file/ZE4WSbwS#UfFDQwvD2s1isgWZu98CEFessq0xNbMyZdXoAnsrw-8', 319, 'Watch on YouTube: https://www.youtube.com/watch?v=d7ng_aV4qdI', null, 14)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-016', 'Match Case Statements in Python | Python Tutorial - Day #16', 'mega', 'https://mega.nz/file/ZAIkmC6I#9K2fjhUaI2MJV8L7sM5jL9QxVA8VImgUZyu6t0HXG-g', 491, 'Watch on YouTube: https://www.youtube.com/watch?v=bthQCK1QAmQ', null, 15)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-017', 'For Loops in Python | Python Tutorial - Day #17', 'mega', 'https://mega.nz/file/5V4E2L4D#jV4ZzAq1GY4i3-moYkzzdaWuvoZIz9zjURPDCTHpsr8', 781, 'Watch on YouTube: https://www.youtube.com/watch?v=fIYVzKp0q5w', null, 16)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-018', 'While Loops in Python | Python Tutorial - Day #18', 'mega', 'https://mega.nz/file/hZJ3kTrT#AMKJw6G51NBF2_c9MZWbzmV2TgsiFlXkFB9LCWqmzXI', 850, 'Watch on YouTube: https://www.youtube.com/watch?v=-tCFyIyKVx0', null, 17)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-019', 'break and continue in Python | Python Tutorial - Day #19', 'mega', 'https://mega.nz/file/Bc4kFBLR#Mh7n2KrHMrlAVdjIXNTKPtULvymL-TNWyYQ8VtLkqos', 734, 'Watch on YouTube: https://www.youtube.com/watch?v=RkwJnjdrm70', null, 18)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-020', 'Functions in Python | Python Tutorial - Day #20', 'mega', 'https://mega.nz/file/5VBxDRxB#AIogqq_e07NWyqAH7AIviZMXzrGd7WVpqPjhmCupqB0', 978, 'Watch on YouTube: https://www.youtube.com/watch?v=dyvxxJSGUsE', null, 19)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-021', 'Function Arguments in Python | Python Tutorial - Day #21', 'mega', 'https://mega.nz/file/xQIjnJia#dwLxw-YRl0auZF_aY5fK101-zbk_a9_uzl1qt7Yn3ac', 830, 'Watch on YouTube: https://www.youtube.com/watch?v=0d6b6fFuCkE', null, 20)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-022', 'Introduction to Lists in Python | Python Tutorial - Day #22', 'mega', 'https://mega.nz/file/4MAHGLLL#VRYkyk_BJ--BXNbLqUg89MhGQiLCZsqSA1EXAhgA1fY', 1207, 'Watch on YouTube: https://www.youtube.com/watch?v=eF6nK5bSlmg', null, 21)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-023', 'List Methods in Python | Python Tutorial - Day #23', 'mega', 'https://mega.nz/file/9M5FGZgT#IZpdaNTJIyJDYX0pFm5EPTywxGz5SyAk9KISiDGM-7w', 572, 'Watch on YouTube: https://www.youtube.com/watch?v=scWc3F8LbOo', null, 22)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-024', 'Tuples in Python | Python Tutorial - Day #24', 'mega', 'https://mega.nz/file/dMAUib5Q#Y_Oh_mV2f7z2eNHNydJLIsi11tkeicsSApLCU7q6m7Q', 495, 'Watch on YouTube: https://www.youtube.com/watch?v=PipsOUDKrVk', null, 23)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-025', 'Operations on Tuples in Python | Python Tutorial - Day #25', 'mega', 'https://mega.nz/file/lJJxAaqC#rfhqs4SeT_PzrM36YfnHyGky-bHr1gik3rxtjFQpjnk', 419, 'Watch on YouTube: https://www.youtube.com/watch?v=XblLSduioJI', null, 24)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-026', 'Exercise 2: Solution & Shoutouts | Python Tutorial - Day #26', 'mega', 'https://mega.nz/file/hYJ1yTaI#Mj5enrT32AyhSt8U35h6CM8j_g0EXFcrlhpgjkF8O68', 462, 'Watch on YouTube: https://www.youtube.com/watch?v=IZBKXWrbqBM', null, 25)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-027', 'Exercise 3: Kaun Banega Crorepati (KBC) | Python Tutorial - Day #27', 'mega', 'https://mega.nz/file/tAIiAJCQ#YJS31No1smyCQoGj7SNbl0VtWafnkwcsJOTNAeYaCfk', 167, 'Watch on YouTube: https://www.youtube.com/watch?v=Vs1Z7K70Mvw', null, 26)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-028', 'f-strings in Python | Python Tutorial - Day #28', 'mega', 'https://mega.nz/file/gdIwBDza#sdNGqob8A7dxD3aK7lOE8BHT1kRQtL0C0lw--RvWxiU', 532, 'Watch on YouTube: https://www.youtube.com/watch?v=ixmxgUf8yIg', null, 27)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-029', 'Docstrings in Python | Python Tutorial - Day #29', 'mega', 'https://mega.nz/file/dIwDCTiS#NuWNR2bGjA_CzJLD3ehtWiyxFXX5FLwNNsU3K_uKZxg', 512, 'Watch on YouTube: https://www.youtube.com/watch?v=SJzsNd7SM0g', null, 28)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-030', 'Recursion in Python | Python Tutorial - Day #30', 'mega', 'https://mega.nz/file/pAozxTTI#4NcNsA8Dwg4UubjGESj4s3oSLppnkus5w5JvqWAJEKQ', 601, 'Watch on YouTube: https://www.youtube.com/watch?v=XYwJKFB8DUk', null, 29)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-031', 'Sets in Python | Python Tutorial - Day #31', 'mega', 'https://mega.nz/file/wQxQQCpI#JWLdYeM2fCLNYN2SU4ISIK7yKXjo9-CO54rxTb2T7Es', 472, 'Watch on YouTube: https://www.youtube.com/watch?v=l3kCO8cVA6o', null, 30)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-032', 'Set Methods in Python | Python Tutorial - Day #32', 'mega', 'https://mega.nz/file/UJ5TkRoA#DtOydZ1_1ObLG5c6qzgiq6HnjRd--03BCxAmNvMLS2o', 958, 'Watch on YouTube: https://www.youtube.com/watch?v=HOrutCnp2zo', null, 31)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-033', 'Dictionaries in Python | Python Tutorial - Day #33', 'mega', 'https://mega.nz/file/YMhWyB5J#JpBIpCwkMnaECb5LjWCYFFgVsWK4I13bgKiaymsVPiQ', 620, 'Watch on YouTube: https://www.youtube.com/watch?v=j2G68uQtOwM', null, 32)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-034', 'Dictionary Methods in Python | Python Tutorial - Day #34', 'mega', 'https://mega.nz/file/NV5giS6J#imKMBRlQYKfycQ8vqwtJIt7NwW-rxWxXC2DXr5S5-K8', 507, 'Watch on YouTube: https://www.youtube.com/watch?v=LmbFwaLjT9k', null, 33)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-035', 'for Loop with else in Python | Python Tutorial - Day #35', 'mega', 'https://mega.nz/file/wIRwBDSb#ntDzCRO9zeh2gy7Y1GcLUpnXwpzAZjIlvIcWqiRxIxg', 393, 'Watch on YouTube: https://www.youtube.com/watch?v=qUkcIgErZzc', null, 34)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-036', 'Exception Handling in Python | Python Tutorial - Day #36', 'mega', 'https://mega.nz/file/FMRHRAiB#MltGsYE1Amoja4d25IfuAYcqU3TTPp26WXYVyuxShhg', 653, 'Watch on YouTube: https://www.youtube.com/watch?v=4LKo6dlku7M', null, 35)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-037', 'Finally keyword in Python | Python Tutorial - Day #37', 'mega', 'https://mega.nz/file/xFx0BKyJ#fyf4zZnO9Roy_F-TA5FbaLy5irj5Za6B0HIhuewZPDA', 485, 'Watch on YouTube: https://www.youtube.com/watch?v=r_iuC-IDpPM', null, 36)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-038', 'Raising custom errors in Python | Python Tutorial - Day #38', 'mega', 'https://mega.nz/file/wIpwCawD#IgQGjwh5TY7TAZDUI_9GrNeEFPLVZ4OMAEieTSD-dcQ', 642, 'Watch on YouTube: https://www.youtube.com/watch?v=Phr4CNppYoM', null, 37)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-039', 'Kaun Banega Crorepati: Exercise 3 - Solution & Shoutouts | Python Tutorial - Day #39', 'mega', 'https://mega.nz/file/4JQCDCSR#RzfYbtiAiNfA1FrqU7BSZRpFk0NehoSlG_J3hut9jxQ', 1396, 'Watch on YouTube: https://www.youtube.com/watch?v=nyfeYAxP-EM', null, 38)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-040', 'Exercise 4: Secret Code Language | Python Tutorial - Day #40', 'mega', 'https://mega.nz/file/0YRjQJ5b#CC93mfw3w80_kxlpKiE61PhbozjF-eFWwnYTwIrRadY', 365, 'Watch on YouTube: https://www.youtube.com/watch?v=pOWJ6WgVRIU', null, 39)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-041', 'Short hand if else statements | Python Tutorial - Day #41', 'mega', 'https://mega.nz/file/cdxnRJ6A#h_NE2hC_p5XyBoMXIb7Z0pgzzIKaQoEcIY0g_3Rz2HM', 463, 'Watch on YouTube: https://www.youtube.com/watch?v=Qqx_zNmQVGI', null, 40)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-042', 'Enumerate Function in Python | Python Tutorial - Day #42', 'mega', 'https://mega.nz/file/QQIzGbAS#DetmyAhXtabghCyLmsoTDbtMX7sK3NdPmfSBFTUSJfc', 457, 'Watch on YouTube: https://www.youtube.com/watch?v=kGnYc_h1geM', null, 41)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-043', 'Virtual Environment in Python | Python Tutorial - Day #43', 'mega', 'https://mega.nz/file/cEQRDQCS#orB1QT4qzNbFStMjxrZPpoq0qTQDEI5p4J7Uzpt9_zE', 1298, 'Watch on YouTube: https://www.youtube.com/watch?v=nt6LlFTWOkg', null, 42)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-044', 'How import works in Python | Python Tutorial - Day #44', 'mega', 'https://mega.nz/file/QUJnAQbT#vmucq6UvOAlCMRz44owk-FJBGn4quaUhdZ9ilRduLTU', 762, 'Watch on YouTube: https://www.youtube.com/watch?v=Pr7UOr35NcI', null, 43)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-045', 'if __name__ == "__main__" in Python | Python Tutorial - Day #45', 'mega', 'https://mega.nz/file/NZI30Y5Q#B_ssUu93iFJ3JkVQvox2qR5m0P8foel3X0DTu9oJ3XI', 564, 'Watch on YouTube: https://www.youtube.com/watch?v=y_CX2Rvitk8', null, 44)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-046', 'os Module in Python | Python Tutorial - Day #46', 'mega', 'https://mega.nz/file/sQI20KYT#aZo7FQnBmfSbogi6weYuetyHAfvphpuI91U_gks6aPE', 924, 'Watch on YouTube: https://www.youtube.com/watch?v=dkVYSsL90Oo', null, 45)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-047', 'Exercise 4: Solutions and Shoutouts | Python Tutorial - Day #47', 'mega', 'https://mega.nz/file/gN4whQjR#Kkjuyq0SUNJZ3t84Tv40HIktrnStW5phxUpMfiN8le4', 1171, 'Watch on YouTube: https://www.youtube.com/watch?v=4lSQfOJKn7U', null, 46)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-048', 'Local vs Global Variables in Python| Python Tutorial - Day #48', 'mega', 'https://mega.nz/file/9ZwHjJAB#PXIGTJdsqKBt-FzqVlBmXjpPUIXq_0NN6JbeimCUXRI', 637, 'Watch on YouTube: https://www.youtube.com/watch?v=RaG6GgcDt54', null, 47)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-049', 'File IO in Python | Python Tutorial - Day #49', 'mega', 'https://mega.nz/file/5Up2gCzJ#U6QUGQ1dl0ve-GFCk4_1rLYGJ1h_wRdVsgTuZzv_BCY', 773, 'Watch on YouTube: https://www.youtube.com/watch?v=eDBPlcWYses', null, 48)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-050', 'read(), readlines() and other methods | Python Tutorial - Day #50', 'mega', 'https://mega.nz/file/xZgC2QKT#QymuBXGql9lOOfVteHac1lhI_bOvmryu9jp7fWcc_X0', 647, 'Watch on YouTube: https://www.youtube.com/watch?v=l1FsnQxET9U', null, 49)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-051', 'seek(), tell() and other functions | Python Tutorial - Day #51', 'mega', 'https://mega.nz/file/xIRA1AQC#J0ACc0LGwKY9960bd4WLFJ8lSXVLkXu7ZlA4yd7Iokc', 467, 'Watch on YouTube: https://www.youtube.com/watch?v=PByYX-2l5Us', null, 50)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-052', 'Lambda functions in Python | Python Tutorial - Day #52', 'mega', 'https://mega.nz/file/NER3mC7Q#2bMdb5RGu0frloBqkwI6fjhv68bynkCQrdjyAtK0FEE', 558, 'Watch on YouTube: https://www.youtube.com/watch?v=UfFWf-PXUqE', null, 51)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-053', 'Map, Filter and Reduce in Python | Python Tutorial - Day #53', 'mega', 'https://mega.nz/file/8BBGWCqJ#k7yNMmN_3OFMdfoVuklBgAEbbHpy42UsODlW_ttrpiE', 781, 'Watch on YouTube: https://www.youtube.com/watch?v=OErhjT4f5Cs', null, 52)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-054', '''is'' vs ''=='' in Python | Python Tutorial - Day #54', 'mega', 'https://mega.nz/file/URBEELRD#3xnwkNMnXOS58dHw-bwSrW-h4aGWpc-hhocYo442eAk', 481, 'Watch on YouTube: https://www.youtube.com/watch?v=TOemdfX_0xc', null, 53)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-055', 'Exercise 5 - Snake Water Gun | Python Tutorial - Day #55', 'mega', 'https://mega.nz/file/pR5nWDxL#OKagwd5cXFuvQKIbewX1GVCLaSmX5o0Y-rn_DQNm1hM', 355, 'Watch on YouTube: https://www.youtube.com/watch?v=dDsh7FT6-0I', null, 54)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-056', 'Introduction to OOPs in Python | Python Tutorial - Day #56', 'mega', 'https://mega.nz/file/dNpwiBwT#cMa8amtpx1JxVNEIYjag8NBIRFYV5i0egO7XtOYNCXQ', 954, 'Watch on YouTube: https://www.youtube.com/watch?v=HQnoYzxOHMw', null, 55)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-057', 'Classes and Objects in Python | Python Tutorial - Day #57', 'mega', 'https://mega.nz/file/AVIylYBQ#dTkqbp3Z0pgoLvs0NEM1ctLnxr-Zl9Fi20_rL2SYi_E', 572, 'Watch on YouTube: https://www.youtube.com/watch?v=a7baAGCBA9U', null, 56)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-058', 'Constructors in Python | Python Tutorial - Day #58', 'mega', 'https://mega.nz/file/UBIUBRQb#jwxP0Bek_ZGsIl2fe6tK6mH1Muh8tHGZ61fqpLCQotE', 677, 'Watch on YouTube: https://www.youtube.com/watch?v=12HRkYld22c', null, 57)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-059', 'Decorators in Python | Python Tutorial - Day #59', 'mega', 'https://mega.nz/file/lIglWJyI#ew_Cjo5PNvXbTS3ob2VxTHnnbE01A7ptMjoyWdVgPlY', 785, 'Watch on YouTube: https://www.youtube.com/watch?v=PTBZ674EsvI', null, 58)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-060', 'Getters and Setters in Python | Python Tutorial - Day #60', 'mega', 'https://mega.nz/file/lMQSACJb#QZ14NgQ29ruj2UkFhAXWlnvDPQUCryfisQQtN2rb62g', 637, 'Watch on YouTube: https://www.youtube.com/watch?v=2gbCT8h9uyk', null, 59)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-061', 'Inheritance in Python | Python Tutorial - Day #61', 'mega', 'https://mega.nz/file/1Rh0VQob#XVzX4YhdPhvWBAxyhyqdHin7ilvhww8onHv4ebZZ0yE', 454, 'Watch on YouTube: https://www.youtube.com/watch?v=-KsfUaQEY9Y', null, 60)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-062', 'Access Modifiers in Python | Python Tutorial - Day #62', 'mega', 'https://mega.nz/file/IBQCEYhI#JZKM7FI3gHRNwIpEHm9j9TOw9XFvBkZ415Wh2PIer8M', 703, 'Watch on YouTube: https://www.youtube.com/watch?v=43FK20rWvKQ', null, 61)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-063', 'Snake Water Gun Game in Python - Exercise 5 - Solution | Python Tutorial - Day #63', 'mega', 'https://mega.nz/file/5Ao1nYha#F_pDj973nQJnNAxygSmm9oZ52IiSmT9L-wH4YjSOSRw', 928, 'Watch on YouTube: https://www.youtube.com/watch?v=GkfBpm6MN9A', null, 62)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-064', 'Exercise 6 - Library Management System in Python | Python Tutorial - Day #64', 'mega', 'https://mega.nz/file/JAJjCTYS#nHUco8jNBRUHKVz5uAz7f1QXl7xrKwN0zvhckFO_MUA', 195, 'Watch on YouTube: https://www.youtube.com/watch?v=mlDZTSH2FFc', null, 63)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-065', 'Static Methods in Python | Python Tutorial - Day #65', 'mega', 'https://mega.nz/file/pYowSKqA#BN46NjoQ5z81lDkdivGh-EEN64055J8ofmuIIw2FuM8', 457, 'Watch on YouTube: https://www.youtube.com/watch?v=GcSVYNSsJxo', null, 64)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-066', 'Instance variables vs Class variables in Python | Python Tutorial - Day #66', 'mega', 'https://mega.nz/file/scpUVCYY#AJqC1Y-vrpIzA2xLqRys4Yip1l_TcKyoCijto9JBtlA', 877, 'Watch on YouTube: https://www.youtube.com/watch?v=tQdaeiF4j38', null, 65)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-067', 'Exercise 6 Solution - Library Management Software in Python | Python Tutorial - Day #67', 'mega', 'https://mega.nz/file/YVxhRRhQ#OsT_QiRJ9MjUmQ8xITieqh9P_5-n1ZE_K962QS6DBMI', 574, 'Watch on YouTube: https://www.youtube.com/watch?v=uRIEjf2vCIg', null, 66)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-068', 'Exercise 7 - Clear the Clutter | Python Tutorial - Day #68', 'mega', 'https://mega.nz/file/9RYCXCJY#Wt3z3atzLujohnbnCnf7XW03vQejyf2ll_lk2Vv7iJc', 214, 'Watch on YouTube: https://www.youtube.com/watch?v=6KvnP13TnhY', null, 67)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-069', 'Class Methods in Python | Python Tutorial - Day #69', 'mega', 'https://mega.nz/file/8MhkCBKB#k8ecMQIJOszdkHtD0-DcPPVXrvcIcRCfZarugqy6Giw', 385, 'Watch on YouTube: https://www.youtube.com/watch?v=9ynmDLc5FYo', null, 68)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-070', 'Class Methods as Alternative Constructors in Python | Python Tutorial - Day #70', 'mega', 'https://mega.nz/file/4UY32BzL#v_TmkGfHX4yp_5HXDtkf-SpL1hd9VKrH5q1dqF6ri34', 786, 'Watch on YouTube: https://www.youtube.com/watch?v=FGlKJdy--p8', null, 69)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-071', 'dir, __dict__ and help method in Python | Python Tutorial - Day #71', 'mega', 'https://mega.nz/file/cNI2GRiK#IiEqJQrqHa8qSkG8wFFS4osDYsPC15EUYXfTMlbSHe4', 443, 'Watch on YouTube: https://www.youtube.com/watch?v=Wgo9TaBcuJ4', null, 70)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-072', 'super keyword in Python | Python Tutorial - Day #72', 'mega', 'https://mega.nz/file/4RhzQayB#ugsdVy-wYatXUMWy9H1xO5_evckNUdmdQujKqjBuu7w', 548, 'Watch on YouTube: https://www.youtube.com/watch?v=P648reefNh0', null, 71)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-073', 'Magic/Dunder Methods in Python | Python Tutorial - Day #73', 'mega', 'https://mega.nz/file/UYZg1DQQ#4m0hMDccl7K9Llq6pwONmdbEznjE9zlkwFBaaDeA0SQ', 732, 'Watch on YouTube: https://www.youtube.com/watch?v=DmgQVJXhuLQ', null, 72)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-074', 'Method Overriding in Python | Python Tutorial - Day #74', 'mega', 'https://mega.nz/file/0MIihKBL#b3hwMioNDYOnVUbF0cCy9ZeKNNuKa-SPQah6UECoyRM', 387, 'Watch on YouTube: https://www.youtube.com/watch?v=46_yfYC36JY', null, 73)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-075', 'Exercise 7 Solution + Shoutouts | Python Tutorial - Day #75', 'mega', 'https://mega.nz/file/lJIBWJAQ#Fw8Q8rh8SAMBnIm8rDn5TUPfdrZNiLUTbKJJlP6YEec', 732, 'Watch on YouTube: https://www.youtube.com/watch?v=Wt9Shnzv_Yg', null, 74)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-076', 'Exercise 8 - Merge the PDF | Python Tutorial - Day #76', 'mega', 'https://mega.nz/file/tRQGjKjJ#xv7PD-1tJBJBLDsEYGkyGnOHLnG3VP8l5-KZb6uD10M', 194, 'Watch on YouTube: https://www.youtube.com/watch?v=uUbvJ7ZEhPE', null, 75)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-077', 'Operator Overloading in Python | Python Tutorial - Day #77', 'mega', 'https://mega.nz/file/BEYEHAIb#8lB5H0AmcIFHiCYLj9tsiamqEizbN7c4jodmwrsipL8', 444, 'Watch on YouTube: https://www.youtube.com/watch?v=D67-b2t-y4k', null, 76)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-078', 'Single Inheritance in Python | Python Tutorial - Day #78', 'mega', 'https://mega.nz/file/JU4BWQrB#Hd17y88k0qphnU6tO1O4isd1pteZkm6_ueeuEiWTCUQ', 279, 'Watch on YouTube: https://www.youtube.com/watch?v=U53_Gw55NI8', null, 77)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-079', 'Multiple Inheritance in Python | Python Tutorial - Day #79', 'mega', 'https://mega.nz/file/cdRR1SaD#rZDfkDH-NFlEJha1Tk8fzRhm8gbSZNzlo_yKRHkyU6M', 371, 'Watch on YouTube: https://www.youtube.com/watch?v=4o7xSHgKlvI', null, 78)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-080', 'Multilevel Inheritance in Python | Python Tutorial - Day #80', 'mega', 'https://mega.nz/file/YA53CSDJ#k6PE6MeKZINkkNr6ucqadAue0GKN26LKj_mJfAtMjFs', 474, 'Watch on YouTube: https://www.youtube.com/watch?v=Il7XMJJeXiA', null, 79)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-081', 'Hybrid and Hierarchical Inheritance in Python | Python Tutorial - Day #81', 'mega', 'https://mega.nz/file/hVhx0IiB#ap88QU7fFP14Y2bFVyG4u4YzNN7SZ5uIA1njdeYQgtg', 534, 'Watch on YouTube: https://www.youtube.com/watch?v=B4Q8zxRkm_I', null, 80)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-082', 'Exercise 8 - Merge the Pdf Solution in Python | Python Tutorial - Day #82', 'mega', 'https://mega.nz/file/xIwHwJgZ#ysAo0uxzPICga82nmFi10KFDFpUStvFSD0ZlM2sSuRM', 471, 'Watch on YouTube: https://www.youtube.com/watch?v=qKKGemhBRVM', null, 81)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-083', 'Exercise 9 - Shoutouts to Everyone | Python Tutorial - Day #83', 'mega', 'https://mega.nz/file/MFgxWD6Y#pbIFqt-6tKOh0gw513xKyDOZ6EK_WvQz2r1yScC0_6g', 228, 'Watch on YouTube: https://www.youtube.com/watch?v=1WjwnlRXfHc', null, 82)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-084', 'Time Module in Python | Python Tutorial - Day #84', 'mega', 'https://mega.nz/file/ABhz3BwT#AtSwJ4XzvKnFrelyS8IUVJXK6ba0aMT9yDQLK1cCUos', 697, 'Watch on YouTube: https://www.youtube.com/watch?v=oTtIvV-Q1FY', null, 83)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-085', 'Creating command line utility in python | Python Tutorial - Day #85', 'mega', 'https://mega.nz/file/UZw00IZQ#44d-tQTAxpPcWMjkmCZiCty7y93aLEnlezFQYR6mQ_A', 1112, 'Watch on YouTube: https://www.youtube.com/watch?v=3IAu6-pgw7I', null, 84)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-086', 'Walrus Operator in Python | Python Tutorial - Day #86', 'mega', 'https://mega.nz/file/0IBB2RCT#hynA8om4c1QwvVwmwy2r_i7o_Z4Bp4iC0bOgpFKVitU', 576, 'Watch on YouTube: https://www.youtube.com/watch?v=NCmMEEyzLT8', null, 85)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-087', 'Shutil Module in Python | Python Tutorial - Day #87', 'mega', 'https://mega.nz/file/VEh3CK4K#WcboeoW4niiwkRuNJHXrNvkOO3Kmqb8-7FpYRfQhvk8', 762, 'Watch on YouTube: https://www.youtube.com/watch?v=wII2JhNACJE', null, 86)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-088', 'Exercise 9: Solution - Shoutouts to Everyone | Python Tutorial - Day #88', 'mega', 'https://mega.nz/file/VEgVHRha#nbA0n2_mJErc2RP2J7cPwcKgCPntBnkAv18rSA8xwg8', 734, 'Watch on YouTube: https://www.youtube.com/watch?v=C9VP-56RXNM', null, 87)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-089', 'Requests Module in Python | Python Tutorial - Day #89', 'mega', 'https://mega.nz/file/cN5S3D5S#8tFRWu6-WejxiEqlyWFYo86yU_frTV_Or-VVd-xKyNw', 526, 'Watch on YouTube: https://www.youtube.com/watch?v=Nsb3bLIlO4w', null, 88)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-090', 'Exercise 10: News App in Python | Python Tutorial - Day #90', 'mega', 'https://mega.nz/file/NM5hQLwA#oCRvl76_4KAogEgb3woKIit8YSG6n3Ub2qzCBZCL0xo', 274, 'Watch on YouTube: https://www.youtube.com/watch?v=BGzFp9mwFQ4', null, 89)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-091', 'Generators in Python | Python Tutorial - Day #91', 'mega', 'https://mega.nz/file/MNw1iBCT#SVnCVeBmytgEGZy4vOjBQHqtU7QB_P0v76t-7iNCtC0', 527, 'Watch on YouTube: https://www.youtube.com/watch?v=ixd-u3pmsUc', null, 90)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-092', 'Function Caching in Python | Python Tutorial - Day #92', 'mega', 'https://mega.nz/file/FZw0lb4C#yer8gcjCKCKu2XW7UfnZZ1Sfpwx7QCDTvhrpiGHRNIg', 674, 'Watch on YouTube: https://www.youtube.com/watch?v=K8gjSwc3Rlo', null, 91)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-093', 'Exercise 10 - News App Solution & Shoutout | Python Tutorial - Day #93', 'mega', 'https://mega.nz/file/pIYHlSJB#WZZ5KmHb_L7ubgj1i_FwgMd5Bg_zDCTbVnM73vBdSws', 691, 'Watch on YouTube: https://www.youtube.com/watch?v=bnAz7Kb2efE', null, 92)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-094', 'Exercise 11 - Drink Water Reminder | Python Tutorial - Day #94', 'mega', 'https://mega.nz/file/8Fwn0TpK#BoWvDAno6gQ96GP1OYp1XkYZ44DUlBtvBcs1NMcv6hg', 260, 'Watch on YouTube: https://www.youtube.com/watch?v=1i4piFhpnm8', null, 93)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-095', 'Regular Expressions in Python | Python Tutorial - Day #95', 'mega', 'https://mega.nz/file/QUYAxKCD#MOI3gfw28PcvCc1GfFcmmrkqAsuLlwpvMthzQTztZuU', 783, 'Watch on YouTube: https://www.youtube.com/watch?v=TCWOwavqFrw', null, 94)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-096', 'AsyncIO in Python | Python Tutorial - Day #96', 'mega', 'https://mega.nz/file/tFQhFS5Z#Y5lSW3hBlLPTJAAQdPHydskjMcnRhnhDLJF2IW5YumA', 629, 'Watch on YouTube: https://www.youtube.com/watch?v=lgoB3_-ejnI', null, 95)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-097', 'Multithreading in Python | Python Tutorial - Day #97', 'mega', 'https://mega.nz/file/BFJAmKrK#iLNAcL-S9z3yQim2KWOdVPRHdJYQEbTO8rlUwOCIJWo', 1069, 'Watch on YouTube: https://www.youtube.com/watch?v=ICbU6zAKtqQ', null, 96)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-098', 'MultiProcessing in Python | Python Tutorial - Day #98', 'mega', 'https://mega.nz/file/4YYCEAjY#raEpPLw8CPL-IE8BKcU9y0MIevSXUKHy2PDuPUfW1zo', 1204, 'Watch on YouTube: https://www.youtube.com/watch?v=zGe-9LfnAaA', null, 97)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-099', 'Exercise 11: Solution + Shoutouts - Desktop Notification System | Python Tutorial - Day #99', 'mega', 'https://mega.nz/file/QApnyDiS#N--8zM3jhpVU6jcmFupKatuw2AbIW516voHgIYE8Vx0', 606, 'Watch on YouTube: https://www.youtube.com/watch?v=18vZnLqXMoM', null, 98)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-100', 'Conclusion and Where to go from here | Python Tutorial - Day #100', 'mega', 'https://mega.nz/file/lEwCmIRB#ob8ikCfrKjqYxpaNaUuQDHDjYsmk1PqLkN0ziKs3Ruk', 999, 'Watch on YouTube: https://www.youtube.com/watch?v=5Pz8WGiMJ_c', null, 99)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.modules (course_id, title, order_index)
    values (v_course_id_0, 'Apna College', 1)
    on conflict (course_id, title) do update set order_index = excluded.order_index
    returning id into v_module_id_1;

  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'apna-lecture-01', 'Python Full Course❤️ | Variables & Data Types | Lecture 1', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/8ZoEhBIT', 4939, 'Watch on YouTube: https://www.youtube.com/watch?v=t2_Q2BRzeEE', null, 100)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'apna-lecture-02', 'Lecture 2 : Strings & Conditional Statements | Python Full Course', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/RIQH3JhI', 3341, 'Watch on YouTube: https://www.youtube.com/watch?v=lIId8IDP6TU', null, 101)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'apna-lecture-03', 'Lecture 3 : List & Tuple in Python | Python Full Course', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/xAwxlQCS', 2506, 'Watch on YouTube: https://www.youtube.com/watch?v=qVyvmzFxF_o', null, 102)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'apna-lecture-04', 'Lecture 4 : Dictionary & Set in Python | Python Full Course', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/RQ413aTD', 3272, 'Watch on YouTube: https://www.youtube.com/watch?v=078tYSD7K8E', null, 103)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'apna-lecture-05', 'Lecture 5 : Loops in Python | While & For Loops | Python Full Course', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/YNhSlDQA', 3831, 'Watch on YouTube: https://www.youtube.com/watch?v=S73thl0AyFU', null, 104)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'apna-lecture-06', 'Lecture 6 : Functions & Recursion in Python | Python Full Course', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/5AwmFZQD', 3708, 'Watch on YouTube: https://www.youtube.com/watch?v=OvTH-7ESoRA', null, 105)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'apna-lecture-07', 'Lecture 7 : File Input/Output in Python', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/ZEJzCBpD', 3048, 'Watch on YouTube: https://www.youtube.com/watch?v=jU0cndZziO0', null, 106)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'apna-lecture-08', 'Lecture 8 : OOPS in Python | Object Oriented Programming | Classes & Objects | Python Full Course', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/BYxl0YBS', 3400, 'Watch on YouTube: https://www.youtube.com/watch?v=HeW-D6KpDwY', null, 107)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'apna-lecture-09', 'Lecture 9 : OOPS Part 2 | Object Oriented Programming | Python Full Course', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/FcoCzbJK', 4146, 'Watch on YouTube: https://www.youtube.com/watch?v=bAwmZVJeO5s', null, 108)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.modules (course_id, title, order_index)
    values (v_course_id_1, 'Apna College', 2)
    on conflict (course_id, title) do update set order_index = excluded.order_index
    returning id into v_module_id_2;

  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_2, 'apna-oneshot-03', 'Python Tutorial for Beginners | Learn Python in 1.5 Hours', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/4doUTRwY', 4632, 'Watch on YouTube: https://www.youtube.com/watch?v=vLqTf2b6GZw', null, 109)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_2, 'apna-oneshot-02', 'Python Full Course for Beginners', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/cBhQHLLQ', 7352, 'Watch on YouTube: https://www.youtube.com/watch?v=q3AuP01daL4', null, 110)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_2, 'apna-oneshot-01', 'Python Tutorial for Beginners - Full Course (with Notes & Practice Questions)', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/IAgBBQDB', 37491, 'Watch on YouTube: https://www.youtube.com/watch?v=ERCMXc8x7mc', null, 111)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.modules (course_id, title, order_index)
    values (v_course_id_1, 'CodeWithHarry', 3)
    on conflict (course_id, title) do update set order_index = excluded.order_index
    returning id into v_module_id_3;

  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_3, 'cwh-oneshot-05', '15 Minute Python Tutorial For Beginners In Hindi (Full & Complete Python Crash Course)', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/5Mp33Dwa', 1057, 'Watch on YouTube: https://www.youtube.com/watch?v=fr1f84rg4Nw', null, 112)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_3, 'cwh-oneshot-02', 'Learn Python In Hindi In One Video - हिंदी में', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/dU41gJiK', 3614, 'Watch on YouTube: https://www.youtube.com/watch?v=qHJjMvHLJdg', null, 113)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_3, 'cwh-oneshot-03', 'Python Tutorial In Hindi 🔥', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/wEpxgB6A', 6303, 'Watch on YouTube: https://www.youtube.com/watch?v=ihk_Xglr164', null, 114)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_3, 'cwh-oneshot-04', 'Python Programming Course in Hindi (Advanced) 🔥', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/dYgxlZaJ', 12230, 'Watch on YouTube: https://www.youtube.com/watch?v=61a7UkDO50s', null, 115)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_3, 'cwh-oneshot-01', 'Python Tutorial For Beginners In Hindi (With Notes) 🔥', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/pRo3zaIb', 42744, 'Watch on YouTube: https://www.youtube.com/watch?v=gfDE2a7MKjA', null, 116)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.modules (course_id, title, order_index)
    values (v_course_id_2, 'Code With Mosh', 4)
    on conflict (course_id, title) do update set order_index = excluded.order_index
    returning id into v_module_id_4;

  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-001', 'Python Full Course for Beginners', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/YVgURKAA', 22447, 'Watch on YouTube: https://www.youtube.com/watch?v=_uQrJ0TkZlc', null, 117)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-002', 'Learn Python Programming - Python Course', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/5QoEmIrB', 6485, 'Watch on YouTube: https://www.youtube.com/watch?v=f79MRyMsjrQ', null, 118)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-003', 'Python Tutorials for Beginners - Learn Python Online', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/BN5kVIrD', 8753, 'Watch on YouTube: https://www.youtube.com/watch?v=yE9v9rt6ziw', null, 119)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-004', 'What is Python? Why Python is So Popular?', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/hJwk0AyJ', 247, 'Watch on YouTube: https://www.youtube.com/watch?v=Y8Tko2YC5hA', null, 120)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-005', 'Python Exercises for Beginners - Exercise #1', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/cQ4QhIrL', 138, 'Watch on YouTube: https://www.youtube.com/watch?v=ODjFDZC_TyA', null, 121)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-006', 'How to Loop over Lists in Python', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/5QoHFIwb', 201, 'Watch on YouTube: https://www.youtube.com/watch?v=9ueMumuFv6g', null, 122)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-007', 'Python For Loops - Python Tutorial for Absolute Beginners', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/1N5wmCSa', 881, 'Watch on YouTube: https://www.youtube.com/watch?v=94UHCEmprCY', null, 123)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-008', 'Python Functions | Python Tutorial for Absolute Beginners #1', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/sZgCHCRD', 1833, 'Watch on YouTube: https://www.youtube.com/watch?v=u-OmVr_fT4s', null, 124)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-009', 'Control Flow in Python - If Elif Else Statements', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/RM4W2ApA', 968, 'Watch on YouTube: https://www.youtube.com/watch?v=Zp5MuPOtsSY', null, 125)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-010', 'How to Use Lists in Python', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/QJxEFYRL', 1128, 'Watch on YouTube: https://www.youtube.com/watch?v=9OeznAkyQz4', null, 126)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-011', 'How to Use Strings in Python - Python Tutorial for Beginners', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/dY50mSqA', 1005, 'Watch on YouTube: https://www.youtube.com/watch?v=Ctqi5Y4X-jA', null, 127)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-012', 'Python Stacks - Python Tutorial for Absolute Beginners | Mosh', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/pAxEXAKD', 291, 'Watch on YouTube: https://www.youtube.com/watch?v=NKmasqr_Xkw', null, 128)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-013', 'What are Sets in Python? Python Tutorial for Absolute Beginners | Mosh', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/UBwHjITI', 270, 'Watch on YouTube: https://www.youtube.com/watch?v=t9j8lCUGZXo', null, 129)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-014', 'Map and Filter Functions in Python - Python Tutorial for Absolute Beginners | Mosh', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/wQpknabY', 359, 'Watch on YouTube: https://www.youtube.com/watch?v=2qKQGqpRsks', null, 130)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-015', 'How to Sort Lists in Python - Python Tutorial for Absolute Beginners | Mosh', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/AUoUzCyD', 413, 'Watch on YouTube: https://www.youtube.com/watch?v=3Tcq_dBhIrQ', null, 131)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-016', 'Python Variables - Python Tutorial for Beginners with Examples | Mosh', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/REoHUS7Y', 395, 'Watch on YouTube: https://www.youtube.com/watch?v=cQT33yu9pY8', null, 132)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-017', 'Python Practice - Interview Question - Fizz Buzz | Mosh', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/5RoBnKCA', 374, 'Watch on YouTube: https://www.youtube.com/watch?v=z3-XFI_nXNM', null, 133)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-018', 'Python for Beginners - Learn Coding with Python in 1 Hour', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/McwCwY6T', 3606, 'Watch on YouTube: https://www.youtube.com/watch?v=kqtD5dpn9C8', null, 134)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-019', 'Python Machine Learning Tutorial (Data Science)', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/9N4GSAba', 2983, 'Watch on YouTube: https://www.youtube.com/watch?v=7eh4d6sabA0', null, 135)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-020', 'Django Tutorial for Beginners – Build Powerful Backends', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/cFwWSSiA', 3756, 'Watch on YouTube: https://www.youtube.com/watch?v=rHux0gMZ3Eg', null, 136)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-021', 'Python Full Course for Beginners', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/4FxkUATB', 7340, 'Watch on YouTube: https://www.youtube.com/watch?v=K5KVEU3aaeQ', null, 137)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_4, 'mosh-022', 'Python Projects for Beginners – Master Problem-Solving! 🚀', 'mega', 'https://mega.nz/folder/UAxCFDJR#gfTnvRZxT3fbM19jjoJMZg/file/MU5yTQgS', 3180, 'Watch on YouTube: https://www.youtube.com/watch?v=yVl_G-F7m8c', null, 138)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.modules (course_id, title, order_index)
    values (v_course_id_3, 'CodeWithHarry', 5)
    on conflict (course_id, title) do update set order_index = excluded.order_index
    returning id into v_module_id_5;

  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-000', 'Beginner Friendly Full Python Tutorials(Teaser) | Python Tutorials For Absolute Beginners In Hindi#0', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/RRgTCBhL', 225, 'Watch on YouTube: https://www.youtube.com/watch?v=aqvDTCpNRek', null, 139)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-001', 'What is Programming & Why Learn Python? | Python Tutorials For Absolute Beginners In Hindi #1', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/wZhSFTKS', 666, 'Watch on YouTube: https://www.youtube.com/watch?v=vrQlEhmVFDA', null, 140)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-002', 'Downloading Python and Pycharm Installation | Python Tutorials For Absolute Beginners In Hindi #2', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/FYpTRCQS', 891, 'Watch on YouTube: https://www.youtube.com/watch?v=MoeQlmeJnPg', null, 141)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-003', 'Using Modules & Pip In Python | Python Tutorials For Absolute Beginners In Hindi #3', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/JIgEnRKa', 495, 'Watch on YouTube: https://www.youtube.com/watch?v=0SZodbWUsQU', null, 142)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-004', 'Writing Our First Python Program | Python Tutorials For Absolute Beginners In Hindi #4', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/EVgxnTIJ', 301, 'Watch on YouTube: https://www.youtube.com/watch?v=bfSHM-vx5lA', null, 143)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-005', 'Using Python As A Calculator | Python Tutorials For Absolute Beginners In Hindi #5', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/JNoWmTJI', 264, 'Watch on YouTube: https://www.youtube.com/watch?v=CDb9YzUq_VA', null, 144)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-006', 'Comments, Escape Sequences & Print Statement| Python Tutorials For Absolute Beginners In Hindi #6', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/tBw0GYAb', 787, 'Watch on YouTube: https://www.youtube.com/watch?v=uhUgIT68CoU', null, 145)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-007', 'Variables, Datatypes and Typecasting | Python Tutorials For Absolute Beginners In Hindi #7', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/oZx2TLYb', 1013, 'Watch on YouTube: https://www.youtube.com/watch?v=z1-zfCvxybI', null, 146)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-008', 'String Slicing And Other Functions In Python | Python Tutorials For Absolute Beginners In Hindi #8', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/ZBg0Ebxa', 1076, 'Watch on YouTube: https://www.youtube.com/watch?v=lPZn7zcGXQo', null, 147)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-009', 'Python Lists And List Functions | Python Tutorials For Absolute Beginners In Hindi #9', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/AZ5nhKQa', 1299, 'Watch on YouTube: https://www.youtube.com/watch?v=neTsPE9XFsQ', null, 148)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-010', 'Dictionary & Its Functions Explained | Python Tutorials For Absolute Beginners In Hindi #10', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/cJxCST5D', 789, 'Watch on YouTube: https://www.youtube.com/watch?v=5y1sh0-oKTE', null, 149)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-011', 'Python Exercise 1 - Apni Dictionary | Python Tutorials For Absolute Beginners In Hindi #11', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/xRgxTL4Z', 133, 'Watch on YouTube: https://www.youtube.com/watch?v=y_aRifWZbnY', null, 150)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-012', 'Sets In Python | Python Tutorials For Absolute Beginners In Hindi #12', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/JRpgCA6Q', 382, 'Watch on YouTube: https://www.youtube.com/watch?v=iVJv3zdgkD4', null, 151)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-013', 'If Else & Elif Conditionals In Python | Python Tutorials For Absolute Beginners In Hindi #13', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/1AwTzRSC', 796, 'Watch on YouTube: https://www.youtube.com/watch?v=3VejIihDfwU', null, 152)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-014', 'Exercise 1 - Solution And Your Answers | Python Tutorials For Absolute Beginners In Hindi #14', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/8cxHFRTS', 697, 'Watch on YouTube: https://www.youtube.com/watch?v=6_hq_8FsKkE', null, 153)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-015', 'Python Exercise 2 - Faulty Calculator  | Python Tutorials For Absolute Beginners In Hindi #15', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/hQ5hRBDJ', 237, 'Watch on YouTube: https://www.youtube.com/watch?v=VP8s9NiFToM', null, 154)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-016', 'For Loops In Python | Python Tutorials For Absolute Beginners In Hindi #16', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/8dwyGSgC', 680, 'Watch on YouTube: https://www.youtube.com/watch?v=sSyCRQx5WM0', null, 155)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-017', 'While Loops In Python | Python Tutorials For Absolute Beginners In Hindi #17', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/cRwBFbAD', 234, 'Watch on YouTube: https://www.youtube.com/watch?v=qvWuPZNOeGg', null, 156)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-018', 'Break & Continue Statements In Python | Python Tutorials For Absolute Beginners In Hindi #18', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/BdhWHZZA', 558, 'Watch on YouTube: https://www.youtube.com/watch?v=aXGC1fx6QQo', null, 157)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-019', 'Python Exercise 2: Faulty Calculator Solution| Python Tutorials For Absolute Beginners In Hindi #19', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/9NwWQYKS', 1063, 'Watch on YouTube: https://www.youtube.com/watch?v=s0lxxTHWx6w', null, 158)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-020', 'Python Exercise 3 - Guess The Number | Python Tutorials For Absolute Beginners In Hindi #20', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/RUghjbwL', 211, 'Watch on YouTube: https://www.youtube.com/watch?v=2loUi5KxZ3E', null, 159)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-021', 'Operators In Python | Python Tutorials For Absolute Beginners In Hindi #21', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/sRpTkTAY', 784, 'Watch on YouTube: https://www.youtube.com/watch?v=OlumSBDDR3U', null, 160)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-022', 'Short Hand If Else Notation In Python | Python Tutorials For Absolute Beginners In Hindi #22', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/ZZgT2TwR', 293, 'Watch on YouTube: https://www.youtube.com/watch?v=FsqiWRJeRDQ', null, 161)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-023', 'Functions And Docstrings | Python Tutorials For Absolute Beginners In Hindi #23', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/kU5iCDrK', 781, 'Watch on YouTube: https://www.youtube.com/watch?v=xTmBq-CQTVU', null, 162)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-024', 'Try Except Exception Handling In Python | Python Tutorials For Absolute Beginners In Hindi #24', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/cQoFiJoR', 426, 'Watch on YouTube: https://www.youtube.com/watch?v=A0hmk3wWTXI', null, 163)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-025', 'Python File IO Basics | Python Tutorials For Absolute Beginners In Hindi #25', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/oZwlUZoK', 402, 'Watch on YouTube: https://www.youtube.com/watch?v=MpHo6dC6Ky0', null, 164)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-026', 'Open(), Read() & Readline() For Reading File | Python Tutorials For Absolute Beginners In Hindi #26', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/cVpgxK5C', 783, 'Watch on YouTube: https://www.youtube.com/watch?v=Q9K_wFj5DuQ', null, 165)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-027', 'Python Exercise 3: Solution | Python Tutorials For Absolute Beginners In Hindi #27', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/9Mg0jLoJ', 1385, 'Watch on YouTube: https://www.youtube.com/watch?v=nsJuAUCH-_o', null, 166)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-028', 'Writing And Appending To A File | Python Tutorials For Absolute Beginners In Hindi #28', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/ZUp33b5a', 409, 'Watch on YouTube: https://www.youtube.com/watch?v=ZNIe4Nf-6-c', null, 167)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-029', 'Python Exercise 4: Astrologer''s Stars | Python Tutorials For Absolute Beginners In Hindi #29', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/lUxV1TbS', 200, 'Watch on YouTube: https://www.youtube.com/watch?v=FyvmDqsc8tc', null, 168)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-030', 'Seek(), tell() & More On Python Files | Python Tutorials For Absolute Beginners In Hindi #30', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/gA4FTa5C', 364, 'Watch on YouTube: https://www.youtube.com/watch?v=stcJipumWwY', null, 169)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-031', 'Using With Block To Open Python Files | Python Tutorials For Absolute Beginners In Hindi #31', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/sEgWEboS', 353, 'Watch on YouTube: https://www.youtube.com/watch?v=Mqmq5YwciMg', null, 170)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-032', 'Exercise 5: Health Management System | Python Tutorials For Absolute Beginners In Hindi #32', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/BEpHSDqC', 332, 'Watch on YouTube: https://www.youtube.com/watch?v=OM5hCIwSv1g', null, 171)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-033', 'Scope, Global Variables and Global Keyword | Python Tutorials For Absolute Beginners In Hindi #33', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/YRoxyJ4T', 787, 'Watch on YouTube: https://www.youtube.com/watch?v=im7Z1jKMGao', null, 172)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-034', 'Recursions: Recursive Vs Iterative Approach | Python Tutorials For Absolute Beginners In Hindi #34', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/cBwFBa4K', 948, 'Watch on YouTube: https://www.youtube.com/watch?v=UhCObChYSMc', null, 173)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-035', 'Exercise 4: Solution And First Solver | Python Tutorials For Absolute Beginners In Hindi #35', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/wEpgWSTY', 1086, 'Watch on YouTube: https://www.youtube.com/watch?v=ZXtpX_CRVGM', null, 174)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-036', 'Anonymous/Lambda Functions In Python | Python Tutorials For Absolute Beginners In Hindi #36', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/MBgDUJhY', 400, 'Watch on YouTube: https://www.youtube.com/watch?v=EFjf3cx1N7o', null, 175)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-037', 'Exercise 5: Solution And First Solver | Python Tutorials For Absolute Beginners In Hindi #37', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/ocoknDBS', 945, 'Watch on YouTube: https://www.youtube.com/watch?v=Ft5ksUloEH8', null, 176)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-038', 'Using Python External & Built In Modules | Python Tutorials For Absolute Beginners In Hindi #38', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/VUhlmACT', 677, 'Watch on YouTube: https://www.youtube.com/watch?v=jA5pP2HNRNI', null, 177)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-039', 'F-Strings & String Formatting In Python | Python Tutorials For Absolute Beginners In Hindi #39', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/kdhg0DoD', 448, 'Watch on YouTube: https://www.youtube.com/watch?v=mcK9lEPomMI', null, 178)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-040', 'Exercise 6: Game Development: Snake Water Gun | Python Tutorials For Absolute Beginners In Hindi #40', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/cA4EWIxQ', 317, 'Watch on YouTube: https://www.youtube.com/watch?v=kHYaYbHQOg0', null, 179)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-041', '*args and **kwargs In Python | Python Tutorials For Absolute Beginners In Hindi #41', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/cUpwgaQC', 892, 'Watch on YouTube: https://www.youtube.com/watch?v=0lu2SY3menU', null, 180)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-042', 'Time Module In Python | Python Tutorials For Absolute Beginners In Hindi #42', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/RApUmZIC', 670, 'Watch on YouTube: https://www.youtube.com/watch?v=u9cHEJivgPA', null, 181)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-043', 'Virtual Environment & Requirements.txt | Python Tutorials For Absolute Beginners In Hindi #43', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/8NwwSTwQ', 1308, 'Watch on YouTube: https://www.youtube.com/watch?v=Lah7WGW6exg', null, 182)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-044', 'Enumerate Function | Python Tutorials For Absolute Beginners In Hindi #44', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/kQpmSbCQ', 410, 'Watch on YouTube: https://www.youtube.com/watch?v=NjaKU7eEGt8', null, 183)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-045', 'How Import Works In Python? | Python Tutorials For Absolute Beginners In Hindi #45', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/9EhmlDiT', 773, 'Watch on YouTube: https://www.youtube.com/watch?v=6RfTUiMR-RM', null, 184)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-046', 'If __name__==__main__ usage & necessity | Python Tutorials For Absolute Beginners In Hindi #46', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/dEgRwBhK', 542, 'Watch on YouTube: https://www.youtube.com/watch?v=Gy74MjEpnYw', null, 185)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-047', 'Join Function In Python | Python Tutorials For Absolute Beginners In Hindi #47', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/5JoHQLBQ', 273, 'Watch on YouTube: https://www.youtube.com/watch?v=6VXmyVwPDlE', null, 186)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-048', 'Map, Filter & Reduce | Python Tutorials For Absolute Beginners In Hindi #48', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/9RoxFaIZ', 1119, 'Watch on YouTube: https://www.youtube.com/watch?v=zimHDlOpGXo', null, 187)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-049', 'Exercise 6 Solution & First Solver | Python Tutorials For Absolute Beginners In Hindi #49', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/MVhQnCwA', 2019, 'Watch on YouTube: https://www.youtube.com/watch?v=uRIjZu3d22I', null, 188)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-050', 'Exercise 7: Healthy Programmer | Python Tutorials For Absolute Beginners In Hindi #50', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/MBoSiR7J', 690, 'Watch on YouTube: https://www.youtube.com/watch?v=khKJXOOETzc', null, 189)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-051', 'Decorators In Python | Python Tutorials For Absolute Beginners In Hindi #51', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/QUpjXDba', 622, 'Watch on YouTube: https://www.youtube.com/watch?v=_zTyBMFD4yY', null, 190)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-052', 'Classes & Objects (OOPS) | Python Tutorials For Absolute Beginners In Hindi #52', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/NchDEB4Y', 585, 'Watch on YouTube: https://www.youtube.com/watch?v=o6zPAzl4ZtM', null, 191)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-053', 'Creating Our First Class In Python | Python Tutorials For Absolute Beginners In Hindi #53', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/4ZwUQT5L', 370, 'Watch on YouTube: https://www.youtube.com/watch?v=l2YmwyayVVk', null, 192)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-054', 'Instance & Class Variables | Python Tutorials For Absolute Beginners In Hindi #54', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/JF4S2ZjK', 507, 'Watch on YouTube: https://www.youtube.com/watch?v=Hg7dnmczBTA', null, 193)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-055', 'Self & __init__() (Constructors) | Python Tutorials For Absolute Beginners In Hindi #55', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/QIhGBQJA', 708, 'Watch on YouTube: https://www.youtube.com/watch?v=ya4e4OcCRB4', null, 194)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-056', 'Class Methods In Python | Python Tutorials For Absolute Beginners In Hindi #56', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/NEoFXTYS', 357, 'Watch on YouTube: https://www.youtube.com/watch?v=16K7DvU5Bvw', null, 195)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-057', 'Class Methods As Alternative Constructors | Python Tutorials For Absolute Beginners In Hindi #57', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/oMxGgByR', 505, 'Watch on YouTube: https://www.youtube.com/watch?v=nrCI9HcpVZ8', null, 196)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-058', 'Static Methods In Python | Python Tutorials For Absolute Beginners In Hindi #58', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/pJwQUZoS', 343, 'Watch on YouTube: https://www.youtube.com/watch?v=cO5GBHKJGJw', null, 197)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-059', 'Abstraction & Encapsulation | Python Tutorials For Absolute Beginners In Hindi #59', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/EEhhnTKY', 492, 'Watch on YouTube: https://www.youtube.com/watch?v=wySW_E4XsvE', null, 198)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-060', 'Single Inheritance | Python Tutorials For Absolute Beginners In Hindi #60', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/tR4ASJAS', 750, 'Watch on YouTube: https://www.youtube.com/watch?v=Ynf1GcIEzeo', null, 199)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-061', 'Multiple Inheritance | Python Tutorials For Absolute Beginners In Hindi #61', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/1Yhn0RzC', 726, 'Watch on YouTube: https://www.youtube.com/watch?v=-f5yvt5XtEU', null, 200)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-062', 'Multilevel Inheritance | Python Tutorials For Absolute Beginners In Hindi #62', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/4dx2SJCJ', 542, 'Watch on YouTube: https://www.youtube.com/watch?v=VccLwnrT5hQ', null, 201)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-063', 'Public, Private & Protected Access Specifiers | Python Tutorials For Absolute Beginners In Hindi #63', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/MIxz2Z5J', 460, 'Watch on YouTube: https://www.youtube.com/watch?v=e2dmC0hksVE', null, 202)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-064', 'Polymorphism In Python | Python Tutorials For Absolute Beginners In Hindi #64', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/dIhHXRCa', 252, 'Watch on YouTube: https://www.youtube.com/watch?v=xnb-9TI-BjQ', null, 203)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-065', 'Super() and Overriding In Classes | Python Tutorials For Absolute Beginners In Hindi #65', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/YU5Anbxa', 578, 'Watch on YouTube: https://www.youtube.com/watch?v=HfmFcj0NmHI', null, 204)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-066', 'Diamond Shape Problem In Multiple Inheritance | Python Tutorials For Absolute Beginners In Hindi #66', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/sUwhlYpQ', 367, 'Watch on YouTube: https://www.youtube.com/watch?v=mEF_vVNTPUY', null, 205)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-067', 'Operator Overloading & Dunder Methods | Python Tutorials For Absolute Beginners In Hindi #67', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/RUhWwCjL', 665, 'Watch on YouTube: https://www.youtube.com/watch?v=iYu6KPigfr4', null, 206)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-068', 'Abstract Base Class & @abstractmethod | Python Tutorials For Absolute Beginners In Hindi #68', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/9AoQWBiD', 422, 'Watch on YouTube: https://www.youtube.com/watch?v=Iho_Kgj5kfI', null, 207)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-069', 'Setters & Property Decorators | Python Tutorials For Absolute Beginners In Hindi #69', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/wN4VyabD', 1065, 'Watch on YouTube: https://www.youtube.com/watch?v=O3R_P5j41ns', null, 208)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-070', 'Object Introspection | Python Tutorials For Absolute Beginners In Hindi #70', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/4JgQ3DDT', 386, 'Watch on YouTube: https://www.youtube.com/watch?v=h1CmrQBAifY', null, 209)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-071', 'Python Mini Project #1 | Python Tutorials For Absolute Beginners In Hindi #71', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/4EgCRDoL', 393, 'Watch on YouTube: https://www.youtube.com/watch?v=LH6wWxXLKQ0', null, 210)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-072', 'Generators In Python | Python Tutorials For Absolute Beginners In Hindi #72', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/5dg0zTjT', 792, 'Watch on YouTube: https://www.youtube.com/watch?v=S9d-fwalZ_Q', null, 211)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-073', 'Python Comprehensions | Python Tutorials For Absolute Beginners In Hindi #73', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/1IoBDJBQ', 956, 'Watch on YouTube: https://www.youtube.com/watch?v=D2h_qI6Tx4M', null, 212)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-074', 'Using Else With For Loops | Python Tutorials For Absolute Beginners In Hindi #74', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/lZxGEBCb', 388, 'Watch on YouTube: https://www.youtube.com/watch?v=C0SnZ_DRfUI', null, 213)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-075', 'Function Caching In Python | Python Tutorials For Absolute Beginners In Hindi #75', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/gBgkEDQK', 755, 'Watch on YouTube: https://www.youtube.com/watch?v=34p5CH48hLE', null, 214)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-076', 'Else & Finally In Try Except | Python Tutorials For Absolute Beginners In Hindi #76', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/FFhX2L5C', 624, 'Watch on YouTube: https://www.youtube.com/watch?v=pxEhxWhvIik', null, 215)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-077', 'Coroutines In Python | Python Tutorials For Absolute Beginners In Hindi #77', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/pB510byL', 730, 'Watch on YouTube: https://www.youtube.com/watch?v=T3tmkWfOHa8', null, 216)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-078', 'Exercise 7: Solution & First Solver | Python Tutorials For Absolute Beginners In Hindi #78', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/VBxgVTDR', 1684, 'Watch on YouTube: https://www.youtube.com/watch?v=gDeCfW_Kt0s', null, 217)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-079', 'Os Module | Python Tutorials For Absolute Beginners In Hindi #79', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/MAoXXS6b', 878, 'Watch on YouTube: https://www.youtube.com/watch?v=HHviSDUTtUc', null, 218)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-080', 'Exercise 8: Oh Soldier Prettify My Folder| Python Tutorials For Absolute Beginners In Hindi #80', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/ZUxCiCaR', 327, 'Watch on YouTube: https://www.youtube.com/watch?v=MkgJfmN6dN8', null, 219)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-081', 'Requests Module For HTTP Requests | Python Tutorials For Absolute Beginners In Hindi #81', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/pBxUFDqL', 504, 'Watch on YouTube: https://www.youtube.com/watch?v=u6_aYV-1LAE', null, 220)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-082', 'Json Module | Python Tutorials For Absolute Beginners In Hindi #82', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/EV5Q0LAb', 693, 'Watch on YouTube: https://www.youtube.com/watch?v=9U4dHBOzmaE', null, 221)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-083', 'Exercise 9: Akhbaar Padhke Sunaao | Python Tutorials For Absolute Beginners In Hindi #83', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/5AoTyLRQ', 285, 'Watch on YouTube: https://www.youtube.com/watch?v=9aW-knzZ7p8', null, 222)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-084', 'Pickle Module | Python Tutorials For Absolute Beginners In Hindi #84', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/sJwEFL4D', 595, 'Watch on YouTube: https://www.youtube.com/watch?v=KaurZiP0mhU', null, 223)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-085', 'Exercise 10: Pickling Iris | Python Tutorials For Absolute Beginners In Hindi #85', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/Ad4XSKCQ', 286, 'Watch on YouTube: https://www.youtube.com/watch?v=XEgRSum4Zps', null, 224)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-086', 'Regular Expressions | Python Tutorials For Absolute Beginners In Hindi #86', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/1JoCGTxZ', 1059, 'Watch on YouTube: https://www.youtube.com/watch?v=g8u0wLvvPSs', null, 225)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-087', 'Converting .py to .exe | Python Tutorials For Absolute Beginners In Hindi #87', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/0QoRDTiD', 723, 'Watch on YouTube: https://www.youtube.com/watch?v=oNq9QKX3lMs', null, 226)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-088', 'Python Exercise 8: Solution + Tips | Python Tutorials For Absolute Beginners In Hindi #88', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/xMhAjCYK', 824, 'Watch on YouTube: https://www.youtube.com/watch?v=uw4pvD0Mczw', null, 227)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-089', 'Raise In Python + Examples | Python Tutorials For Absolute Beginners In Hindi #89', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/4VpilapK', 690, 'Watch on YouTube: https://www.youtube.com/watch?v=BGQhccSWYpk', null, 228)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-090', 'Python ''is'' vs ''=='': What''s The Difference? | Python Tutorials For Absolute Beginners In Hindi #90', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/IVhnhbiK', 307, 'Watch on YouTube: https://www.youtube.com/watch?v=Xub80-7g4I8', null, 229)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-091', 'Python 2.x Vs Python 3.x | Python Tutorials For Absolute Beginners In Hindi #91', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/JV5EQRha', 649, 'Watch on YouTube: https://www.youtube.com/watch?v=n39cxF9bQIE', null, 230)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-092', 'Python Exercise 9 Solution + Shoutouts | Python Tutorials For Absolute Beginners In Hindi #92', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/UAwXlDZL', 1419, 'Watch on YouTube: https://www.youtube.com/watch?v=S2kvV91gswo', null, 231)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-093', 'Creating a Command Line Utility In Python | Python Tutorials For Absolute Beginners In Hindi #93', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/oZxCXKQa', 870, 'Watch on YouTube: https://www.youtube.com/watch?v=Qi-8zaBfRWI', null, 232)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-094', 'Exercise 10: Solution + Shoutouts | Python Tutorials For Absolute Beginners In Hindi #94', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/IdhkiTrT', 854, 'Watch on YouTube: https://www.youtube.com/watch?v=tCrRWiEIMec', null, 233)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-095', 'Creating a Python Package Using Setuptools | Python Tutorials For Absolute Beginners In Hindi #95', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/tQh3RDqb', 1182, 'Watch on YouTube: https://www.youtube.com/watch?v=RiWqigGW9cA', null, 234)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-096', 'Python Exercise 11: Regex Email Extractor | Python Tutorials For Absolute Beginners In Hindi #96', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/UR5yhQBQ', 202, 'Watch on YouTube: https://www.youtube.com/watch?v=IvCMglGI4PU', null, 235)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-097', 'Learning Path For Python Web Development | Python Tutorials For Absolute Beginners In Hindi #97', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/FUojWRSI', 402, 'Watch on YouTube: https://www.youtube.com/watch?v=QW7eJbkDvDc', null, 236)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-098', 'Python GUI Development - Learning Path | Python Tutorials For Absolute Beginners In Hindi #98', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/FZwRwQ4D', 889, 'Watch on YouTube: https://www.youtube.com/watch?v=eowHTYzUZhw', null, 237)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-099', 'Machine Learning & Data Science Learning Path | Python Tutorials For Absolute Beginners In Hindi #99', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/1N5ylDAA', 1071, 'Watch on YouTube: https://www.youtube.com/watch?v=nO546sT9PFQ', null, 238)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-100', 'Regex Exercise 11 Solutions | Python Tutorials For Absolute Beginners In Hindi #100', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/QYx0UAAZ', 740, 'Watch on YouTube: https://www.youtube.com/watch?v=-1dH3h-BcVg', null, 239)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-101', 'Mini Project 1 (OOPs Library) Solution | Python Tutorials For Absolute Beginners In Hindi #101', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/5U5CGZRZ', 1560, 'Watch on YouTube: https://www.youtube.com/watch?v=hyZA885xVmc', null, 240)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-102', 'Conclusion & Way Forward | Python Tutorials For Absolute Beginners In Hindi #102', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/dcowUSiD', 995, 'Watch on YouTube: https://www.youtube.com/watch?v=XI6s3-TdU54', null, 241)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-103', 'Practice Problem 1 (Easy) |  Python Tutorials For Absolute Beginners In Hindi #103', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/gM4EmCwb', 557, 'Watch on YouTube: https://www.youtube.com/watch?v=nDWMNCs8TBg', null, 242)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-104', 'Python Practice 1 Solution | Python Tutorials For Absolute Beginners In Hindi #104', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/dJxlhJDK', 1069, 'Watch on YouTube: https://www.youtube.com/watch?v=F6-RRrwWEsQ', null, 243)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-105', 'Practice Problem 2 (Easy) |  Python Tutorials For Absolute Beginners In Hindi #105', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/NN51gDyT', 470, 'Watch on YouTube: https://www.youtube.com/watch?v=VeOPJM6yTIY', null, 244)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-106', 'Python Practice 2 Solution | Python Tutorials For Absolute Beginners In Hindi #106', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/hRgngLRK', 588, 'Watch on YouTube: https://www.youtube.com/watch?v=-aF859WfPoQ', null, 245)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-107', 'Python Practice 3 | Python Tutorials For Absolute Beginners In Hindi #107', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/1FwAVCaA', 500, 'Watch on YouTube: https://www.youtube.com/watch?v=XiXUrvzoTIs', null, 246)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-108', 'Python Problem 3: Solution | Python Tutorials For Absolute Beginners In Hindi #108', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/IJpiDZoa', 1226, 'Watch on YouTube: https://www.youtube.com/watch?v=tx7VofKNnAA', null, 247)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-109', 'Python Problem 4 | Python Tutorials For Absolute Beginners In Hindi #109', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/cFp3kZIL', 385, 'Watch on YouTube: https://www.youtube.com/watch?v=-7IhCwaHb2c', null, 248)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-110', 'Python Problem 4: Solution | Python Tutorials For Absolute Beginners In Hindi #110', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/0NgkSQ7a', 1016, 'Watch on YouTube: https://www.youtube.com/watch?v=o6h2kU2VTkc', null, 249)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-111', 'Python Problem 5 | Python Tutorials For Absolute Beginners In Hindi #111', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/5NohFZ4I', 533, 'Watch on YouTube: https://www.youtube.com/watch?v=H7kH_2YJQVY', null, 250)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-112', 'Python Problem 5: Solution | Python Tutorials For Absolute Beginners In Hindi #112', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/sUwhwBKS', 904, 'Watch on YouTube: https://www.youtube.com/watch?v=-Q57UxpBfV0', null, 251)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-113', 'Python Problem 6 | Python Tutorials For Absolute Beginners In Hindi #113', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/pNwCCBzS', 579, 'Watch on YouTube: https://www.youtube.com/watch?v=3ePMrLWsBps', null, 252)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-114', 'Python Problem 6: Solution | Python Tutorials For Absolute Beginners In Hindi #114', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/5A4zTBpR', 934, 'Watch on YouTube: https://www.youtube.com/watch?v=NRndfnhknSc', null, 253)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-115', 'Python Problem 7: Creating A Search Engine | Python Tutorials For Absolute Beginners In Hindi #115', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/lZgSjT5J', 691, 'Watch on YouTube: https://www.youtube.com/watch?v=sEZW2n2D-Hs', null, 254)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-116', 'Python Problem 7: Solution | Python Tutorials For Absolute Beginners In Hindi #116', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/BJhEyTwa', 1427, 'Watch on YouTube: https://www.youtube.com/watch?v=VkH1B0EAhfU', null, 255)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-117', 'Python Problem 8: Fake Multiplication Tables | Python Tutorials For Absolute Beginners In Hindi #117', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/4doFARwA', 706, 'Watch on YouTube: https://www.youtube.com/watch?v=S-OFpk9IQmU', null, 256)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-118', 'Python Problem 8: Solution | Python Tutorials For Absolute Beginners In Hindi #118', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/4cpiiC7b', 743, 'Watch on YouTube: https://www.youtube.com/watch?v=Dhzp7hlXJFQ', null, 257)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-119', 'Python Problem 9: Jumbled Funny Names | Python Tutorials For Absolute Beginners In Hindi #119', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/wM5HlZhS', 416, 'Watch on YouTube: https://www.youtube.com/watch?v=1glrtDGtjVI', null, 258)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-120', 'Project 1: Iron Man Jarvis AI Desktop Voice Assistant | Python Tutorials For Absolute Beginners #120', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/oIYwBRjJ', 3527, 'Watch on YouTube: https://www.youtube.com/watch?v=Lp9Ftuq2sVI', null, 259)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-121', 'VS Code Tutorial + Python Setup | Python Tutorials For Absolute Beginners In Hindi #121', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/ZJwlHZiI', 3177, 'Watch on YouTube: https://www.youtube.com/watch?v=t90FMQr9WWc', null, 260)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-122', 'Project 2: Coding Flappy Bird Game (With Source Code) | Python Tutorials For Absolute Beginners #122', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/kJwQ2LbB', 7672, 'Watch on YouTube: https://www.youtube.com/watch?v=itB6VsP5UnA', null, 261)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-123', 'Project 3: Third Umpire Decision Review System (DRS Gully Cricket) |Python Tutorials in Hindi #123', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/8V5FFSgZ', 3705, 'Watch on YouTube: https://www.youtube.com/watch?v=Sq9oaVFYUaE', null, 262)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-124', 'Project 4: Indian Railways Announcement Software | Python Tutorials For Absolute Beginners #124', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/xAQGELIR', 3120, 'Watch on YouTube: https://www.youtube.com/watch?v=V-O96C_7xgc', null, 263)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-125', 'CoronaVirus: Python Programming Solution to the Problem', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/sBwUlTST', 5026, 'Watch on YouTube: https://www.youtube.com/watch?v=02eZFXALcl4', null, 264)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-126', 'Covid -19: Creating a Realtime CoronaVirus Outbreak Notification System Using Python Programming', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/xd4ggbCR', 2404, 'Watch on YouTube: https://www.youtube.com/watch?v=h_0lPh7LE_E', null, 265)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-127', 'Django Tutorial In Hindi', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/MIojQApC', 10583, 'Watch on YouTube: https://www.youtube.com/watch?v=JxzZxdht-XY', null, 266)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_5, 'cwh-128', 'I Automated The Chrome Dinosaur Game Using Python 🔥', 'mega', 'https://mega.nz/folder/5N4xiaLZ#jP8eVtFFUJrd3jJL-JkUtQ/file/hZwmTZhD', 3599, 'Watch on YouTube: https://www.youtube.com/watch?v=PXz2nFNuNJU', null, 267)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
end $$;

-- Remove the retired extra videos (catalog is Day 1-100 only).
delete from public.lessons where slug like 'python-extra-%';
delete from public.modules where title = 'Extra Videos';
