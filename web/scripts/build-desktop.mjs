// Desktop export build for the Tauri app.
//
// Next `output: export` cannot include API route handlers, so this script
// hides src/app/api while building and restores it after (try/finally).
// The hidden dir lives at web/.api.hidden — OUTSIDE src/app, because
// Next treats any directory under src/app as a route segment (hiding it
// there made it build /.api.hidden/... routes instead).
// The normal Vercel build never runs this script and is unaffected.
// If a previous run was interrupted mid-build, the hidden dir is restored
// first. Usage: node scripts/build-desktop.mjs  (from learn-python/web)
import { spawnSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const api = join(web, "src", "app", "api");
const hidden = join(web, ".api.hidden");
const legacyHidden = join(web, "src", "app", ".api.hidden");

if (!existsSync(api) && existsSync(legacyHidden)) renameSync(legacyHidden, api);
if (!existsSync(api) && existsSync(hidden)) renameSync(hidden, api);
if (!existsSync(api)) {
  console.error("src/app/api missing, nothing to build");
  process.exit(1);
}
if (existsSync(hidden)) {
  console.error(".api.hidden already exists, refusing to build");
  process.exit(1);
}

let code = 1;
try {
  renameSync(api, hidden);
  const r = spawnSync("npm", ["run", "build"], {
    cwd: web,
    stdio: "inherit",
    env: { ...process.env, LP_DESKTOP_EXPORT: "1" },
  });
  code = r.status ?? 1;
} finally {
  if (existsSync(hidden)) renameSync(hidden, api);
}
process.exit(code);
