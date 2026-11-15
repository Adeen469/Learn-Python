-- LP seed lessons — mirrors web/src/lib/catalog.ts SEED_LESSONS.
-- CodeWithHarry 100 Days of Code playlist (100 lessons).
-- Run in the Supabase SQL editor AFTER 001_initial_schema.sql
-- (002_public_lessons.sql still worth running for the anon read
-- policies, but this seed no longer depends on it — see preamble).
-- Re-runnable: every insert upserts on its unique key
-- (courses.slug, modules (course_id, title), lessons.slug), so
-- re-running it only updates the rows in place.
-- video_url mirrors the catalog (all 100 days carry MEGA links now).
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
  v_course_id uuid;
  v_module_id_0 uuid;
begin
  insert into public.courses (title, slug, is_published)
    values ('Python for Beginners (Full Course)', 'python-for-beginners', true)
    on conflict (slug) do update set title = excluded.title, is_published = true
    returning id into v_course_id;

  insert into public.modules (course_id, title, order_index)
    values (v_course_id, '100 Days of Code', 0)
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
end $$;

-- Remove the retired extra videos (catalog is Day 1-100 only).
delete from public.lessons where slug like 'python-extra-%';
delete from public.modules where title = 'Extra Videos';
