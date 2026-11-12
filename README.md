# Learn-Python (LP) — Learning Platform

Next.js (App Router) video learning app: MEGA + Google Drive video
streaming with Range support, a 95%-watched rule for completion and
daily progress (seeking is free, all lessons are open), daily
goals/streaks, per-lesson tests, and Supabase-backed lessons.

## Quick start (local)

```bash
cd web
npm install
npm test        # node --test tests/*.test.mjs
npm run build
npm start       # serves on http://localhost:3000
```

Local smoke checks use `npx next start` on port 3000 — never
`.next/standalone/server.js` on its own. Kill a previous server first:

```bash
lsof -ti:3000 | xargs -r kill
```

## Lessons: Supabase first, seed fallback

Lessons live in Supabase (`courses` → `modules` → `lessons`). The app
reads them through `GET /api/lessons` (public, rate-limited 60 req/min
per IP). If Supabase is not configured, unreachable, or returns no usable
rows, the server falls back to the hardcoded seed list in
`web/src/lib/catalog.ts` (and logs one `console.warn` with the reason).
The homepage renders the seed list instantly, then replaces it with the
`/api/lessons` result on mount; if that fetch fails the seed list simply
stays on screen.

### One-time Supabase setup

Run these in the Supabase dashboard SQL editor, in order:

1. `supabase/migrations/001_initial_schema.sql` — tables + RLS.
2. `supabase/migrations/002_public_lessons.sql` — adds `lessons.slug`,
   allows the `drive` provider, per-provider `video_url` checks (an
   empty `video_url` is allowed — the lesson shows as "Coming soon"),
   an optional `quiz` jsonb column, and anon + authenticated `SELECT`
   policies for published courses, their modules, and their lessons.
   Re-runnable (drop-if-exists guards).
3. `supabase/seed_lessons.sql` — inserts the "Python for Beginners
   (Full Course)" course, its "100 Days of Code" module, and all 100
   playlist lessons (video URLs empty until the MEGA links are pasted
   in). Re-runnable (upserts on slug).

### Adding a lesson (no redeploy)

Insert one row into `public.lessons` (Supabase dashboard → Table Editor
or SQL), with the module's id, a unique `slug` (this becomes the public
lesson id, e.g. `intro-variables`), `title`, `video_provider`
(`mega` or `drive`), `video_url`, `duration_seconds`, and
`notes_markdown`. Rules enforced by the database:

- `mega` rows: `video_url` must be the full MEGA share link (empty
  `''` is allowed — the lesson shows as "Coming soon" until its link
  is pasted in).
- `drive` rows: `video_url` must be just the Drive file ID (10–64 chars,
  letters/digits/`-`/`_`), and the file must be shared as
  "Anyone with the link".
- Only lessons under a published course (`is_published = true`) are
  readable by anon/authenticated users.

The server caches the lesson list in memory for 60 seconds, so a new or
edited lesson appears within a minute — no redeploy, no restart.

> Note: quizzes are not stored in Supabase yet (the `lessons` table has
> no quiz column). A lesson served from Supabase has no test, so its
> "Take test" button is hidden and the next lesson unlocks by watching
> only. The seed catalog in `catalog.ts` still carries the sample
> quizzes, which is what you see when Supabase is not configured.

## Environment variables

Set in Fly secrets (production) or a local `.env.local` (never commit
secrets, never paste them in chat):

| Variable | Required? | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL; without it (and the key below) lessons come from the seed list |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon/public key; read-only lesson queries |
| `GOOGLE_DRIVE_API_KEY` | Optional | Google Drive streaming; without it Drive lessons return 503 |

## API endpoints

| Endpoint | Notes |
| --- | --- |
| `GET /api/lessons` | `{ lessons, source: "supabase" \| "seed" }`. Rate-limited 60/min per IP. Public. |
| `GET /api/health` | `{ status: "ok", supabase: "configured" \| "not_configured", lessons: "supabase" \| "seed", uptime_seconds }`. Uses the cached lesson fetch — no fresh DB ping per call. Not rate-limited (Fly probes it every 30s). |
| `GET /api/video/[lessonId]` | Range-capable video stream (MEGA or Drive). Rate-limited 120/min per IP. Errors are logged as one structured JSON line `{ lessonId, source, code, status }` plus the original error. |
| `GET /api/pypi?name=<pkg>` | PyPI package info. Rate-limited 60/min per IP. |
| `GET /api/github/...` | GitHub repo/commit helpers. Rate-limited 30/min per IP. |

No auth is required for the video API or `/api/lessons` — lessons are
public by design.

## Health check (Fly.io)

`fly.toml` wires `[[http_service.checks]]` to `GET /api/health`
(grace 10s, every 30s, 5s timeout). A failing check takes the machine out
of routing; it never restarts the machine. Check status with
`fly checks list`.

## Cold starts

`fly.toml` currently sets `min_machines_running = 0` with
`auto_stop_machines = true`: when the app has no traffic for about
5 minutes, Fly stops the machine (this is the behaviour on the free
trial with no card added). The next request then waits for a cold start
of roughly 4 seconds while the machine boots.

To remove the cold start, set `min_machines_running = 1` in `fly.toml`
(and redeploy): one machine stays warm at all times, so the first
request after idle time answers immediately. The trade-off is that the
always-on machine accrues uptime continuously, so only do this once
you are on a plan / payment method that covers it — on the no-card
trial, keeping a machine warm is not free. This setting is
deliberately left at `0` for now.

## Deployment

Push to `main`; deploy from the Fly.io dashboard (the repo has no
auto-deploy workflow — a push alone does not deploy). After a deploy,
verify live: home page 200, `/api/lessons` 200,
`/api/health` 200, and a video Range request 206.

## Security notes

- Content-Security-Policy + HSTS are set in `web/next.config.ts`.
  `script-src` keeps `'unsafe-inline'` on purpose: Next.js App Router
  streams its RSC payload as inline scripts, and a real Chromium render
  proved hydration is fully blocked without it.
- Rate limits are in-memory per IP (single Fly machine, no shared
  store needed): video 120/min, lessons 60/min, PyPI 60/min, GitHub
  30/min.
- Per-IP video concurrency guard: deliberately **not** implemented.
  The only correct form (wrapping the proxied `ReadableStream` to
  release the slot on close/cancel) risks breaking Range playback, and
  the cheap form (counting handler invocations) would 429 legitimate
  seeks, since every seek opens a new stream. The 120/min per-IP rate
  limit already bounds abuse.
