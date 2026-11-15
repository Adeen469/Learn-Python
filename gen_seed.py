import json, subprocess, sys

# Dump the current catalog via Bun (imports the TS directly), then generate
# supabase/seed_lessons.sql mirroring it exactly (titles, durations, video
# URLs — including the user's Day 1-2 MEGA links — notes, modules, order).
out = subprocess.run(
    ["bun", "-e",
     "import {getLessons} from './src/lib/catalog.ts'; console.log(JSON.stringify(getLessons()))"],
    cwd="/home/hatch/workspace/learn-python/web",
    capture_output=True, text=True, check=True,
)
lessons = json.loads(out.stdout)
print("lessons in catalog:", len(lessons))
assert len(lessons) == 100, len(lessons)

def sql_str(s):
    return "'" + str(s).replace("'", "''") + "'"

# Group by (course, module) preserving first-seen order.
groups = []
seen = {}
for i, l in enumerate(lessons):
    key = (l["courseTitle"], l["moduleTitle"])
    if key not in seen:
        seen[key] = len(groups)
        groups.append({"course": l["courseTitle"], "module": l["moduleTitle"], "items": []})
    groups[seen[key]]["items"].append((i, l))

courses = sorted({g["course"] for g in groups})
assert len(courses) == 1, courses
course = courses[0]

lines = []
lines.append("-- LP seed lessons — mirrors web/src/lib/catalog.ts SEED_LESSONS.")
lines.append("-- CodeWithHarry 100 Days of Code playlist (100 lessons).")
lines.append("-- Run in the Supabase SQL editor AFTER 001_initial_schema.sql")
lines.append("-- (002_public_lessons.sql still worth running for the anon read")
lines.append("-- policies, but this seed no longer depends on it — see preamble).")
lines.append("-- Re-runnable: every insert upserts on its unique key")
lines.append("-- (courses.slug, modules (course_id, title), lessons.slug), so")
lines.append("-- re-running it only updates the rows in place.")
lines.append("-- video_url mirrors the catalog (all 100 days carry MEGA links now).")
lines.append("-- To add a lesson later, insert one row into public.lessons")
lines.append("-- (no redeploy; the app re-reads Supabase every 60s).")
lines.append("")
lines.append("-- Self-sufficient preamble (fix 2026-11-16): the seed used to fail")
lines.append("-- with 42P10 'there is no unique or exclusion constraint matching")
lines.append("-- the ON CONFLICT specification' on the modules upsert when")
lines.append("-- 002_public_lessons.sql had not been run first — 002 is what")
lines.append("-- creates the modules (course_id, title) unique index and the")
lines.append("-- lessons.slug column. These statements create exactly what the")
lines.append("-- upserts below need, idempotently, so the seed works on a DB")
lines.append("-- that only ran 001.")
lines.append("alter table public.lessons add column if not exists slug text;")
lines.append("alter table public.lessons add column if not exists quiz jsonb;")
lines.append("create unique index if not exists modules_course_id_title_key")
lines.append("  on public.modules (course_id, title);")
lines.append("create unique index if not exists lessons_slug_key")
lines.append("  on public.lessons (slug);")
lines.append("")
lines.append("do $$")
lines.append("declare")
lines.append("  v_course_id uuid;")
for mi in range(len(groups)):
    lines.append(f"  v_module_id_{mi} uuid;")
lines.append("begin")
lines.append("  insert into public.courses (title, slug, is_published)")
lines.append(f"    values ({sql_str(course)}, 'python-for-beginners', true)")
lines.append("    on conflict (slug) do update set title = excluded.title, is_published = true")
lines.append("    returning id into v_course_id;")
lines.append("")
for mi, g in enumerate(groups):
    lines.append("  insert into public.modules (course_id, title, order_index)")
    lines.append(f"    values (v_course_id, {sql_str(g['module'])}, {mi})")
    lines.append("    on conflict (course_id, title) do update set order_index = excluded.order_index")
    lines.append(f"    returning id into v_module_id_{mi};")
    lines.append("")
    for (i, l) in g["items"]:
        quiz = "null"
        if l.get("quiz"):
            quiz = sql_str(json.dumps(l["quiz"], ensure_ascii=False)) + "::jsonb"
        lines.append("  insert into public.lessons (module_id, slug, title, video_provider, video_url, duration_seconds, notes_markdown, quiz, order_index)")
        lines.append(f"    values (v_module_id_{mi}, {sql_str(l['id'])}, {sql_str(l['title'])}, {sql_str(l['videoSource'])}, {sql_str(l['videoUrl'])}, {int(l['durationSeconds'])}, {sql_str(l['notes'])}, {quiz}, {i})")
        lines.append("    on conflict (slug) do update set module_id = excluded.module_id, title = excluded.title,")
        lines.append("      video_provider = excluded.video_provider, video_url = excluded.video_url,")
        lines.append("      duration_seconds = excluded.duration_seconds, notes_markdown = excluded.notes_markdown,")
        lines.append("      quiz = excluded.quiz, order_index = excluded.order_index;")
lines.append("end $$;")
lines.append("")
# The 3 extra videos were removed from the catalog (2026-11-16, Day 1-100
# only). Upserts above never delete rows, so explicitly remove any extras
# already seeded in Supabase, and their now-empty module.
lines.append("-- Remove the retired extra videos (catalog is Day 1-100 only).")
lines.append("delete from public.lessons where slug like 'python-extra-%';")
lines.append("delete from public.modules where title = 'Extra Videos';")
lines.append("")

open("/home/hatch/workspace/learn-python/supabase/seed_lessons.sql", "w").write("\n".join(lines))
print("wrote seed_lessons.sql")
print("modules:", [(g["module"], len(g["items"])) for g in groups])
print("with video_url:", sum(1 for l in lessons if l["videoUrl"]))
