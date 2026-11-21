# Learn Python — Windows desktop app (Tauri v2)

Tauri v2 shell for Learn Python. The webview renders the **local static
export** of the Next.js app (`web/out`) only — it never loads the live
website. No `.env`, no keys, no setup: install and use.

## Build

```sh
# 1. Static export of the web app (from learn-python/web).
#    Hides src/app/api while building (Next `output: export` cannot
#    include route handlers) and restores it after; the normal Vercel
#    build never runs this script.
node scripts/build-desktop.mjs

# 2. Windows installer (from learn-python/tauri/src-tauri).
#    Needs the Windows cross-compile toolchain: cargo-xwin + the Windows
#    SDK in ~/.cache/cargo-xwin + clang/llvm/nsis (see ~/AGENTS.md — the
#    apt tools do NOT survive a VM restart, reinstall them first).
export PATH="$HOME/.cargo/bin:$PATH"
eval "$(cargo-xwin xwin env --target x86_64-pc-windows-msvc)"
cargo tauri build --target x86_64-pc-windows-msvc
# → tauri/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/
#   Learn Python_1.0.0_x64-setup.exe  (~27 MB)
```

## Status (2026-11-22) — BUILT, installer produced, NOT run on Windows yet

- ✅ Static export works: `node scripts/build-desktop.mjs` exits 0 and
  produces `web/out` (128 MB, 1,824 files). Two fixes made this pass:
  `generateStaticParams` in passthrough layouts for `/learn/[slug]`
  (812 lessons), `/courses/[slug]` (3 creators),
  `/courses/[slug]/[collection]` (6 paths) — the page components
  stayed client components, so the web test suite is untouched; and
  the build script hides `src/app/api` at `web/.api.hidden`
  (hiding it inside `src/app` failed — Next treats it as a route).
  Normal Vercel build verified still passing (`npm run build`, output
  stays `standalone`, api/ intact).
- ✅ `cargo check --target x86_64-pc-windows-msvc` passes.
- ✅ Full build passes: `learn-python.exe` (38 MB) + NSIS installer
  `Learn Python_1.0.0_x64-setup.exe` (27 MB). Verified: 1,819 of the
  1,824 `web/out` files are brotli-compressed into the exe (wheels,
  pyodide.wasm, lesson HTML, JS all present — checked the generated
  asset dir + `7z l` on the installer). Installer is **unsigned**
  (cross-compile cannot sign) — Windows SmartScreen will warn on
  first run.
- ✅ NSIS installer config: per-user install (no admin), install-folder
  prompt, start-menu folder page, "Create desktop shortcut" checkbox
  on the finish page, uninstaller (`uninstall.exe`, also in Add/Remove
  Programs). Verified against Tauri's default NSIS template
  (`tauri-bundler-2.10.6/.../nsis/installer.nsi`); no custom template
  needed.
- ❌ Installer NOT run: no Windows host here, and the app needs
  WebView2 at runtime. Maalik runs it on his laptop — that is the
  real test.

## What works once installed

- Offline: lesson text (the seed catalog ships in the bundle), local
  progress (localStorage), editor UI + Pyodide (self-hosted in the
  bundle, 90 MB of `public/pyodide`).
- Needs internet: video streams (MEGA/Drive), Monaco editor files
  (loaded from the jsDelivr CDN by the default loader), micropip
  installs from PyPI.
- Not in v1: video playback (the player calls `/api/video/...`, which
  does not exist in a static export), AI (the editor posts to
  `/api/ai`, which does not exist — the in-app BYOK field is there but
  its requests have no server to hit), Google/email sign-in (no server,
  no keys shipped — local profile only). And because `/learn`,
  `/courses` and `/editor` all redirect guests to the landing page, a
  signed-out desktop user currently reaches the landing page only.
  These need follow-up work in `web/` (guest mode, direct streaming,
  a local AI bridge) — not faked here.

## Files

- `src-tauri/Cargo.toml`, `src-tauri/build.rs`, `src-tauri/src/main.rs`
  — minimal Tauri v2 app, no plugins, no commands.
- `src-tauri/tauri.conf.json` — `frontendDist: ../../web/out`; CSP
  copied from the web app's `next.config.ts` (same allowances:
  jsDelivr for Monaco, PyPI for micropip, YouTube thumbnails/embeds).
  The CSP lists remote hosts the app *may* fetch from (video, PyPI,
  Monaco CDN) — the app shell itself loads local files only, never
  learnpythonprogram.vercel.app.
- `src-tauri/icons/` — generated from `web/public/lp-logo.png`.
- `web/scripts/build-desktop.mjs` + the three `layout.tsx` files
  under `web/src/app/learn/[slug]/`, `web/src/app/courses/[slug]/`,
  `web/src/app/courses/[slug]/[collection]/` — the export fixes above.
