-- LP seed lessons — mirrors web/src/lib/catalog.ts SEED_LESSONS.
-- CodeWithHarry 100 Days of Code playlist (100 lessons) + 3 extra videos.
-- Run in the Supabase SQL editor AFTER 001_initial_schema.sql
-- and 002_public_lessons.sql. Re-runnable: every insert upserts
-- on its unique key (courses.slug, modules (course_id, title),
-- lessons.slug), so re-running it only updates the rows in place.
-- video_url mirrors the catalog (Day 1-2 carry the user's MEGA links;
-- the rest are EMPTY until their MEGA link is pasted into the catalog
-- or updated here) — the app shows 'Coming soon'.
-- To add a lesson later, insert one row into public.lessons
-- (no redeploy; the app re-reads Supabase every 60s).

do $$
declare
  v_course_id uuid;
  v_module_id_0 uuid;
  v_module_id_1 uuid;
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
    values (v_module_id_0, 'python-day-001', 'Introduction to Programming & Python | Python Tutorial - Day #1', 'mega', 'https://mega.nz/file/pcQB0LQK#0ogh7nPPNB-hoYC_Y5GzfVZOfr5sNSmBsjVhx92CpIA', 710, 'Watch on YouTube: https://www.youtube.com/watch?v=7wnove7K-ZQ', null, 0)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-002', 'Some Amazing Python Programs - The Power of Python | Python Tutorial - Day #2', 'mega', 'https://mega.nz/file/QYBHBKzD#BHk9whe7PvZd57NlKUYV_QmUs76jGbrN-nQCafBCEE4', 518, 'Watch on YouTube: https://www.youtube.com/watch?v=Tto8TS-fJQU', null, 1)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-003', 'Modules and Pip | Python Tutorial - Day #3', 'mega', '', 761, 'Watch on YouTube: https://www.youtube.com/watch?v=xwKO_y2gHxQ', null, 2)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-004', 'Our First Python Program | Python Tutorial - Day #4', 'mega', '', 444, 'Watch on YouTube: https://www.youtube.com/watch?v=7IWOYhfAcVg', null, 3)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-005', 'Comments, Escape Sequences & Print Statement | Python Tutorial - Day #5', 'mega', '', 1122, 'Watch on YouTube: https://www.youtube.com/watch?v=qxPMmW93eDs', null, 4)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-006', 'Variables and Data Types | Python Tutorial - Day #6', 'mega', '', 1005, 'Watch on YouTube: https://www.youtube.com/watch?v=ORCuz7s5cCY', null, 5)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-007', 'Exercise 1: Calculator using Python | Python Tutorial - Day #7', 'mega', '', 410, 'Watch on YouTube: https://www.youtube.com/watch?v=FLVqcxnJP_E', null, 6)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-008', 'Exercise 1: Calculator using Python (Solution) | Python Tutorial - Day #8', 'mega', '', 622, 'Watch on YouTube: https://www.youtube.com/watch?v=dohaSBCKCr0', null, 7)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-009', 'Typecasting in Python | Python Tutorial - Day #9', 'mega', '', 565, 'Watch on YouTube: https://www.youtube.com/watch?v=Pu5bqySSSS0', null, 8)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-010', 'Taking User Input in Python | Python Tutorial - Day #10', 'mega', '', 616, 'Watch on YouTube: https://www.youtube.com/watch?v=WvG-R-xXouA', null, 9)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-011', 'Strings in Python | Python Tutorial - Day #11', 'mega', '', 695, 'Watch on YouTube: https://www.youtube.com/watch?v=kMNFQYArrLg', null, 10)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-012', 'Strings Slicing and Operations on Strings in Python | Python Tutorial - Day #12', 'mega', '', 708, 'Watch on YouTube: https://www.youtube.com/watch?v=8jW7lpT8HW8', null, 11)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-013', 'String Methods in Python | Python Tutorial - Day #13', 'mega', '', 1352, 'Watch on YouTube: https://www.youtube.com/watch?v=0INvoK_T0cE', null, 12)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-014', 'If Else Conditional Statements in Python | Python Tutorial - Day #14', 'mega', '', 1167, 'Watch on YouTube: https://www.youtube.com/watch?v=ceiuLR2ysas', null, 13)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-015', 'Exercise 2: Good Morning Sir | Python Tutorial - Day #15', 'mega', '', 319, 'Watch on YouTube: https://www.youtube.com/watch?v=d7ng_aV4qdI', null, 14)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-016', 'Match Case Statements in Python | Python Tutorial - Day #16', 'mega', '', 491, 'Watch on YouTube: https://www.youtube.com/watch?v=bthQCK1QAmQ', null, 15)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-017', 'For Loops in Python | Python Tutorial - Day #17', 'mega', '', 781, 'Watch on YouTube: https://www.youtube.com/watch?v=fIYVzKp0q5w', null, 16)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-018', 'While Loops in Python | Python Tutorial - Day #18', 'mega', '', 850, 'Watch on YouTube: https://www.youtube.com/watch?v=-tCFyIyKVx0', null, 17)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-019', 'break and continue in Python | Python Tutorial - Day #19', 'mega', '', 734, 'Watch on YouTube: https://www.youtube.com/watch?v=RkwJnjdrm70', null, 18)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-020', 'Functions in Python | Python Tutorial - Day #20', 'mega', '', 978, 'Watch on YouTube: https://www.youtube.com/watch?v=dyvxxJSGUsE', null, 19)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-021', 'Function Arguments in Python | Python Tutorial - Day #21', 'mega', '', 830, 'Watch on YouTube: https://www.youtube.com/watch?v=0d6b6fFuCkE', null, 20)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-022', 'Introduction to Lists in Python | Python Tutorial - Day #22', 'mega', '', 1207, 'Watch on YouTube: https://www.youtube.com/watch?v=eF6nK5bSlmg', null, 21)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-023', 'List Methods in Python | Python Tutorial - Day #23', 'mega', '', 572, 'Watch on YouTube: https://www.youtube.com/watch?v=scWc3F8LbOo', null, 22)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-024', 'Tuples in Python | Python Tutorial - Day #24', 'mega', '', 495, 'Watch on YouTube: https://www.youtube.com/watch?v=PipsOUDKrVk', null, 23)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-025', 'Operations on Tuples in Python | Python Tutorial - Day #25', 'mega', '', 419, 'Watch on YouTube: https://www.youtube.com/watch?v=XblLSduioJI', null, 24)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-026', 'Exercise 2: Solution & Shoutouts | Python Tutorial - Day #26', 'mega', '', 462, 'Watch on YouTube: https://www.youtube.com/watch?v=IZBKXWrbqBM', null, 25)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-027', 'Exercise 3: Kaun Banega Crorepati (KBC) | Python Tutorial - Day #27', 'mega', '', 167, 'Watch on YouTube: https://www.youtube.com/watch?v=Vs1Z7K70Mvw', null, 26)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-028', 'f-strings in Python | Python Tutorial - Day #28', 'mega', '', 532, 'Watch on YouTube: https://www.youtube.com/watch?v=ixmxgUf8yIg', null, 27)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-029', 'Docstrings in Python | Python Tutorial - Day #29', 'mega', '', 512, 'Watch on YouTube: https://www.youtube.com/watch?v=SJzsNd7SM0g', null, 28)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-030', 'Recursion in Python | Python Tutorial - Day #30', 'mega', '', 601, 'Watch on YouTube: https://www.youtube.com/watch?v=XYwJKFB8DUk', null, 29)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-031', 'Sets in Python | Python Tutorial - Day #31', 'mega', '', 472, 'Watch on YouTube: https://www.youtube.com/watch?v=l3kCO8cVA6o', null, 30)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-032', 'Set Methods in Python | Python Tutorial - Day #32', 'mega', '', 958, 'Watch on YouTube: https://www.youtube.com/watch?v=HOrutCnp2zo', null, 31)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-033', 'Dictionaries in Python | Python Tutorial - Day #33', 'mega', '', 620, 'Watch on YouTube: https://www.youtube.com/watch?v=j2G68uQtOwM', null, 32)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-034', 'Dictionary Methods in Python | Python Tutorial - Day #34', 'mega', '', 507, 'Watch on YouTube: https://www.youtube.com/watch?v=LmbFwaLjT9k', null, 33)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-035', 'for Loop with else in Python | Python Tutorial - Day #35', 'mega', '', 393, 'Watch on YouTube: https://www.youtube.com/watch?v=qUkcIgErZzc', null, 34)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-036', 'Exception Handling in Python | Python Tutorial - Day #36', 'mega', '', 653, 'Watch on YouTube: https://www.youtube.com/watch?v=4LKo6dlku7M', null, 35)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-037', 'Finally keyword in Python | Python Tutorial - Day #37', 'mega', '', 485, 'Watch on YouTube: https://www.youtube.com/watch?v=r_iuC-IDpPM', null, 36)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-038', 'Raising custom errors in Python | Python Tutorial - Day #38', 'mega', '', 642, 'Watch on YouTube: https://www.youtube.com/watch?v=Phr4CNppYoM', null, 37)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-039', 'Kaun Banega Crorepati: Exercise 3 - Solution & Shoutouts | Python Tutorial - Day #39', 'mega', '', 1396, 'Watch on YouTube: https://www.youtube.com/watch?v=nyfeYAxP-EM', null, 38)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-040', 'Exercise 4: Secret Code Language | Python Tutorial - Day #40', 'mega', '', 365, 'Watch on YouTube: https://www.youtube.com/watch?v=pOWJ6WgVRIU', null, 39)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-041', 'Short hand if else statements | Python Tutorial - Day #41', 'mega', '', 463, 'Watch on YouTube: https://www.youtube.com/watch?v=Qqx_zNmQVGI', null, 40)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-042', 'Enumerate Function in Python | Python Tutorial - Day #42', 'mega', '', 457, 'Watch on YouTube: https://www.youtube.com/watch?v=kGnYc_h1geM', null, 41)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-043', 'Virtual Environment in Python | Python Tutorial - Day #43', 'mega', '', 1298, 'Watch on YouTube: https://www.youtube.com/watch?v=nt6LlFTWOkg', null, 42)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-044', 'How import works in Python | Python Tutorial - Day #44', 'mega', '', 762, 'Watch on YouTube: https://www.youtube.com/watch?v=Pr7UOr35NcI', null, 43)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-045', 'if __name__ == "__main__" in Python | Python Tutorial - Day #45', 'mega', '', 564, 'Watch on YouTube: https://www.youtube.com/watch?v=y_CX2Rvitk8', null, 44)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-046', 'os Module in Python | Python Tutorial - Day #46', 'mega', '', 924, 'Watch on YouTube: https://www.youtube.com/watch?v=dkVYSsL90Oo', null, 45)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-047', 'Exercise 4: Solutions and Shoutouts | Python Tutorial - Day #47', 'mega', '', 1171, 'Watch on YouTube: https://www.youtube.com/watch?v=4lSQfOJKn7U', null, 46)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-048', 'Local vs Global Variables in Python| Python Tutorial - Day #48', 'mega', '', 637, 'Watch on YouTube: https://www.youtube.com/watch?v=RaG6GgcDt54', null, 47)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-049', 'File IO in Python | Python Tutorial - Day #49', 'mega', '', 773, 'Watch on YouTube: https://www.youtube.com/watch?v=eDBPlcWYses', null, 48)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-050', 'read(), readlines() and other methods | Python Tutorial - Day #50', 'mega', '', 647, 'Watch on YouTube: https://www.youtube.com/watch?v=l1FsnQxET9U', null, 49)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-051', 'seek(), tell() and other functions | Python Tutorial - Day #51', 'mega', '', 467, 'Watch on YouTube: https://www.youtube.com/watch?v=PByYX-2l5Us', null, 50)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-052', 'Lambda functions in Python | Python Tutorial - Day #52', 'mega', '', 558, 'Watch on YouTube: https://www.youtube.com/watch?v=UfFWf-PXUqE', null, 51)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-053', 'Map, Filter and Reduce in Python | Python Tutorial - Day #53', 'mega', '', 781, 'Watch on YouTube: https://www.youtube.com/watch?v=OErhjT4f5Cs', null, 52)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-054', '''is'' vs ''=='' in Python | Python Tutorial - Day #54', 'mega', '', 481, 'Watch on YouTube: https://www.youtube.com/watch?v=TOemdfX_0xc', null, 53)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-055', 'Exercise 5 - Snake Water Gun | Python Tutorial - Day #55', 'mega', '', 355, 'Watch on YouTube: https://www.youtube.com/watch?v=dDsh7FT6-0I', null, 54)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-056', 'Introduction to OOPs in Python | Python Tutorial - Day #56', 'mega', '', 954, 'Watch on YouTube: https://www.youtube.com/watch?v=HQnoYzxOHMw', null, 55)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-057', 'Classes and Objects in Python | Python Tutorial - Day #57', 'mega', '', 572, 'Watch on YouTube: https://www.youtube.com/watch?v=a7baAGCBA9U', null, 56)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-058', 'Constructors in Python | Python Tutorial - Day #58', 'mega', '', 677, 'Watch on YouTube: https://www.youtube.com/watch?v=12HRkYld22c', null, 57)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-059', 'Decorators in Python | Python Tutorial - Day #59', 'mega', '', 785, 'Watch on YouTube: https://www.youtube.com/watch?v=PTBZ674EsvI', null, 58)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-060', 'Getters and Setters in Python | Python Tutorial - Day #60', 'mega', '', 637, 'Watch on YouTube: https://www.youtube.com/watch?v=2gbCT8h9uyk', null, 59)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-061', 'Inheritance in Python | Python Tutorial - Day #61', 'mega', '', 454, 'Watch on YouTube: https://www.youtube.com/watch?v=-KsfUaQEY9Y', null, 60)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-062', 'Access Modifiers in Python | Python Tutorial - Day #62', 'mega', '', 703, 'Watch on YouTube: https://www.youtube.com/watch?v=43FK20rWvKQ', null, 61)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-063', 'Snake Water Gun Game in Python - Exercise 5 - Solution | Python Tutorial - Day #63', 'mega', '', 928, 'Watch on YouTube: https://www.youtube.com/watch?v=GkfBpm6MN9A', null, 62)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-064', 'Exercise 6 - Library Management System in Python | Python Tutorial - Day #64', 'mega', '', 195, 'Watch on YouTube: https://www.youtube.com/watch?v=mlDZTSH2FFc', null, 63)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-065', 'Static Methods in Python | Python Tutorial - Day #65', 'mega', '', 457, 'Watch on YouTube: https://www.youtube.com/watch?v=GcSVYNSsJxo', null, 64)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-066', 'Instance variables vs Class variables in Python | Python Tutorial - Day #66', 'mega', '', 877, 'Watch on YouTube: https://www.youtube.com/watch?v=tQdaeiF4j38', null, 65)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-067', 'Exercise 6 Solution - Library Management Software in Python | Python Tutorial - Day #67', 'mega', '', 574, 'Watch on YouTube: https://www.youtube.com/watch?v=uRIEjf2vCIg', null, 66)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-068', 'Exercise 7 - Clear the Clutter | Python Tutorial - Day #68', 'mega', '', 214, 'Watch on YouTube: https://www.youtube.com/watch?v=6KvnP13TnhY', null, 67)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-069', 'Class Methods in Python | Python Tutorial - Day #69', 'mega', '', 385, 'Watch on YouTube: https://www.youtube.com/watch?v=9ynmDLc5FYo', null, 68)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-070', 'Class Methods as Alternative Constructors in Python | Python Tutorial - Day #70', 'mega', '', 786, 'Watch on YouTube: https://www.youtube.com/watch?v=FGlKJdy--p8', null, 69)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-071', 'dir, __dict__ and help method in Python | Python Tutorial - Day #71', 'mega', '', 443, 'Watch on YouTube: https://www.youtube.com/watch?v=Wgo9TaBcuJ4', null, 70)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-072', 'super keyword in Python | Python Tutorial - Day #72', 'mega', '', 548, 'Watch on YouTube: https://www.youtube.com/watch?v=P648reefNh0', null, 71)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-073', 'Magic/Dunder Methods in Python | Python Tutorial - Day #73', 'mega', '', 732, 'Watch on YouTube: https://www.youtube.com/watch?v=DmgQVJXhuLQ', null, 72)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-074', 'Method Overriding in Python | Python Tutorial - Day #74', 'mega', '', 387, 'Watch on YouTube: https://www.youtube.com/watch?v=46_yfYC36JY', null, 73)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-075', 'Exercise 7 Solution + Shoutouts | Python Tutorial - Day #75', 'mega', '', 732, 'Watch on YouTube: https://www.youtube.com/watch?v=Wt9Shnzv_Yg', null, 74)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-076', 'Exercise 8 - Merge the PDF | Python Tutorial - Day #76', 'mega', '', 194, 'Watch on YouTube: https://www.youtube.com/watch?v=uUbvJ7ZEhPE', null, 75)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-077', 'Operator Overloading in Python | Python Tutorial - Day #77', 'mega', '', 444, 'Watch on YouTube: https://www.youtube.com/watch?v=D67-b2t-y4k', null, 76)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-078', 'Single Inheritance in Python | Python Tutorial - Day #78', 'mega', '', 279, 'Watch on YouTube: https://www.youtube.com/watch?v=U53_Gw55NI8', null, 77)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-079', 'Multiple Inheritance in Python | Python Tutorial - Day #79', 'mega', '', 371, 'Watch on YouTube: https://www.youtube.com/watch?v=4o7xSHgKlvI', null, 78)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-080', 'Multilevel Inheritance in Python | Python Tutorial - Day #80', 'mega', '', 474, 'Watch on YouTube: https://www.youtube.com/watch?v=Il7XMJJeXiA', null, 79)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-081', 'Hybrid and Hierarchical Inheritance in Python | Python Tutorial - Day #81', 'mega', '', 534, 'Watch on YouTube: https://www.youtube.com/watch?v=B4Q8zxRkm_I', null, 80)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-082', 'Exercise 8 - Merge the Pdf Solution in Python | Python Tutorial - Day #82', 'mega', '', 471, 'Watch on YouTube: https://www.youtube.com/watch?v=qKKGemhBRVM', null, 81)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-083', 'Exercise 9 - Shoutouts to Everyone | Python Tutorial - Day #83', 'mega', '', 228, 'Watch on YouTube: https://www.youtube.com/watch?v=1WjwnlRXfHc', null, 82)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-084', 'Time Module in Python | Python Tutorial - Day #84', 'mega', '', 697, 'Watch on YouTube: https://www.youtube.com/watch?v=oTtIvV-Q1FY', null, 83)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-085', 'Creating command line utility in python | Python Tutorial - Day #85', 'mega', '', 1112, 'Watch on YouTube: https://www.youtube.com/watch?v=3IAu6-pgw7I', null, 84)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-086', 'Walrus Operator in Python | Python Tutorial - Day #86', 'mega', '', 576, 'Watch on YouTube: https://www.youtube.com/watch?v=NCmMEEyzLT8', null, 85)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-087', 'Shutil Module in Python | Python Tutorial - Day #87', 'mega', '', 762, 'Watch on YouTube: https://www.youtube.com/watch?v=wII2JhNACJE', null, 86)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-088', 'Exercise 9: Solution - Shoutouts to Everyone | Python Tutorial - Day #88', 'mega', '', 734, 'Watch on YouTube: https://www.youtube.com/watch?v=C9VP-56RXNM', null, 87)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-089', 'Requests Module in Python | Python Tutorial - Day #89', 'mega', '', 526, 'Watch on YouTube: https://www.youtube.com/watch?v=Nsb3bLIlO4w', null, 88)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-090', 'Exercise 10: News App in Python | Python Tutorial - Day #90', 'mega', '', 274, 'Watch on YouTube: https://www.youtube.com/watch?v=BGzFp9mwFQ4', null, 89)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-091', 'Generators in Python | Python Tutorial - Day #91', 'mega', '', 527, 'Watch on YouTube: https://www.youtube.com/watch?v=ixd-u3pmsUc', null, 90)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-092', 'Function Caching in Python | Python Tutorial - Day #92', 'mega', '', 674, 'Watch on YouTube: https://www.youtube.com/watch?v=K8gjSwc3Rlo', null, 91)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-093', 'Exercise 10 - News App Solution & Shoutout | Python Tutorial - Day #93', 'mega', '', 691, 'Watch on YouTube: https://www.youtube.com/watch?v=bnAz7Kb2efE', null, 92)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-094', 'Exercise 11 - Drink Water Reminder | Python Tutorial - Day #94', 'mega', '', 260, 'Watch on YouTube: https://www.youtube.com/watch?v=1i4piFhpnm8', null, 93)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-095', 'Regular Expressions in Python | Python Tutorial - Day #95', 'mega', '', 783, 'Watch on YouTube: https://www.youtube.com/watch?v=TCWOwavqFrw', null, 94)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-096', 'AsyncIO in Python | Python Tutorial - Day #96', 'mega', '', 629, 'Watch on YouTube: https://www.youtube.com/watch?v=lgoB3_-ejnI', null, 95)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-097', 'Multithreading in Python | Python Tutorial - Day #97', 'mega', '', 1069, 'Watch on YouTube: https://www.youtube.com/watch?v=ICbU6zAKtqQ', null, 96)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-098', 'MultiProcessing in Python | Python Tutorial - Day #98', 'mega', '', 1204, 'Watch on YouTube: https://www.youtube.com/watch?v=zGe-9LfnAaA', null, 97)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-099', 'Exercise 11: Solution + Shoutouts - Desktop Notification System | Python Tutorial - Day #99', 'mega', '', 606, 'Watch on YouTube: https://www.youtube.com/watch?v=18vZnLqXMoM', null, 98)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_0, 'python-day-100', 'Conclusion and Where to go from here | Python Tutorial - Day #100', 'mega', '', 999, 'Watch on YouTube: https://www.youtube.com/watch?v=5Pz8WGiMJ_c', null, 99)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.modules (course_id, title, order_index)
    values (v_course_id, 'Extra Videos', 1)
    on conflict (course_id, title) do update set order_index = excluded.order_index
    returning id into v_module_id_1;

  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'python-extra-001', '15 Minute Python Tutorial For Beginners In Hindi (Full & Complete Python Crash Course)', 'mega', '', 1057, 'Watch on YouTube: https://www.youtube.com/watch?v=fr1f84rg4Nw', null, 100)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'python-extra-002', 'Complete Python Programming Roadmap (Zero to Expert) 🐍', 'mega', '', 771, 'Watch on YouTube: https://www.youtube.com/watch?v=g4Ffdh41vRQ', null, 101)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)
    values (v_module_id_1, 'python-extra-003', 'Python Tutorial For Beginners in Hindi | Complete Python Course 🔥', 'mega', '', 39234, 'Watch on YouTube: https://www.youtube.com/watch?v=UrsmFxEIp5k', null, 102)
    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,
      video_provider = excluded.video_provider, video_url = excluded.video_url,
      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,
      quiz = excluded.quiz, order_index = excluded.order_index;
end $$;
