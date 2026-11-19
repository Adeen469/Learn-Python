// Downloads the Pyodide 0.27.2 runtime into web/public/pyodide/ so the
// editor serves it from the SAME ORIGIN as the app. Run automatically
// before every build via the `prebuild` script in package.json.
//
// Why not commit the files? The ~14 MB runtime is binary (.wasm, .zip,
// .whl) and the GitHub snapshot push flow only accepts UTF-8 text, so
// binary files cannot be pushed that way. Downloading at build time
// keeps the repo clean and the deployed app self-contained: Vercel's
// build servers reach jsDelivr fine, and the deployed files then load
// from the same fast origin as the app itself (jsDelivr/unpkg both
// failed for the user in 2026-11-19, timing out at 300s each).
//
// The script is idempotent: files that already exist with the expected
// byte size are skipped, so local rebuilds do not re-download. It fails
// loudly (non-zero exit) if a download fails, so a broken fetch fails
// the build instead of deploying an editor with a missing runtime.
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PYODIDE_VERSION = "0.27.2";
const CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// The files loadPyodide fetches from the indexURL, with their exact
// byte sizes (a size mismatch means a truncated/corrupt download).
const FILES = [
  { name: "pyodide.js", size: 14810 },
  { name: "pyodide.asm.js", size: 1253021 },
  { name: "pyodide.asm.wasm", size: 10102467 },
  { name: "python_stdlib.zip", size: 2358641 },
  { name: "pyodide-lock.json", size: 108095 },
  // loadPyodide fetches these two wheels itself (micropip + packaging)
  // — without them it logs "Failed to load micropip, packaging".
  { name: "micropip-0.8.0-py3-none-any.whl", size: 140739 },
  { name: "packaging-24.2-py3-none-any.whl", size: 259534 },
];

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "pyodide");
mkdirSync(outDir, { recursive: true });

let downloaded = 0;
for (const { name, size } of FILES) {
  const dest = join(outDir, name);
  if (existsSync(dest) && statSync(dest).size === size) {
    console.log(`pyodide-runtime: ${name} already present (${size} bytes), skipping`);
    continue;
  }
  console.log(`pyodide-runtime: downloading ${name} ...`);
  const res = await fetch(`${CDN_BASE}${name}`);
  if (!res.ok) throw new Error(`failed to download ${name}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length !== size) {
    throw new Error(`${name}: expected ${size} bytes, got ${buf.length} (truncated download?)`);
  }
  writeFileSync(dest, buf);
  downloaded += 1;
  console.log(`pyodide-runtime: ${name} OK (${size} bytes)`);
}
console.log(`pyodide-runtime: done (${downloaded} downloaded, ${FILES.length - downloaded} already present)`);
