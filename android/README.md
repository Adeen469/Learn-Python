# Learn Python — Android app

Native Android app for Learn-Python. No account, no
setup: install it and use it. The editor is the one WebView — the
website's /editor — because Pyodide has no native equivalent on
Android.

## What's built (Phase 1)

- **Learn** — 268 written tutorials in curriculum order, with search.
  Each lesson shows its text, code examples, practice tasks and a
  summary. Mark lessons complete.
- **Video Courses** — the 3 creators (CodeWithHarry, Code With Mosh,
  Apna College) and their 268 videos. 139 videos play; the other 129
  have no MEGA link yet and show "Not uploaded yet".
- **Video player** — expo-video. Videos stream through the website's
  own video endpoint (`learnpythonprogram.vercel.app/api/video/[id]`),
  the same one the website uses — a MEGA share link cannot play
  directly, and the endpoint is public (rate-limited, no sign-in).
  Watching 95% marks a video watched, same rule as the website.
- **Progress** — completed lessons and videos, stored on the device
  (AsyncStorage). Clear it from Settings.
- **Settings** — about, BYOK key entry, clear progress.
- **Ask AI (BYOK only)** — on each lesson. The user pastes their own
  Gemini or Groq key in Settings; it is stored on the device and sent
  only to that provider, with the question. There is no built-in key.
- **Editor** — the website's /editor in a WebView (the only WebView in
  the app). The full Pyodide editor: all 273 packages, on-demand via
  micropip. Links off the app (Google sign-in, external links) open in
  the browser — Google blocks OAuth inside a WebView. Running code
  needs no sign-in.

Content is bundled in `assets/content.json` (268 tutorials, 139
video lessons, 3 creators). Rebuild it after any web catalog edit:

```bash
node scripts/generate-content.mjs
```

## Notes

- The editor loads the live website's /editor, so it needs internet.
  Lessons work offline; videos need internet too.
- No native Python runtime is planned: the WebView editor is the
  decision (Maalik, 2026-11-22) — the app stays mobile-possible only,
  no server runner, no hybrid.
- App icon/splash are Expo defaults for now: the template PNGs in
  assets/ cannot go through the text-only push tool, and the proper
  icons should be made from the LP logo (web/public/lp-logo.png)
  anyway — follow-up is a GitHub web upload.

## Build the APK (the user runs this)

```bash
npx eas-cli@latest build -p android
```

Run from this folder. First run asks you to link or create the EAS
project — no config file is needed. EAS builds in the cloud and gives
you the APK to install.

## Checks

```bash
npm run typecheck   # tsc --noEmit
npx expo export     # static export, no EAS account needed
npx expo-doctor     # dependency and config diagnosis
```
