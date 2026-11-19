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
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
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

// The Pyodide-built packages whose wheels are ALSO self-hosted here,
// so `loadPackage(name)` finds them at the same origin. This is the
// fix for the numpy install failure (2026-11-19): when the runtime
// moved to same-origin, loadPackage started fetching wheels from
// /pyodide/ — but only the 7 core files were there, so every package
// wheel 404'd. And loadPackage RESOLVES even when a wheel 404s
// (Pyodide logs "Failed to load <name>" but does not reject), so the
// install flow reached the import check and reported the confusing
// "'numpy' downloaded but 'import numpy' failed". Self-hosting the
// wheels makes loadPackage actually load them (verified: with the
// numpy wheel present, loadPackage resolves AND import numpy works).
//
// The list is the dependency closure of the packages a Python learner
// installs most (numpy / pandas / matplotlib + the small common
// libraries). 42 wheels, ~76 MB total. scipy, statsmodels, sympy,
// scikit-learn, opencv and the other big/less-common packages are NOT
// here — they fall back to the CDN wheel via micropip (see
// pyodide-install.ts). The lockfile (pyodide-lock.json, downloaded
// above) supplies each wheel's exact file_name + sha256, so no sizes
// are hardcoded here; a hash mismatch fails the build.
const SELF_HOSTED_PACKAGES = [
  "annotated-types", "atomicwrites", "attrs", "beautifulsoup4", "certifi",
  "charset-normalizer", "contourpy", "cycler", "decorator", "exceptiongroup",
  "fonttools", "idna", "iniconfig", "jinja2", "kiwisolver", "markupsafe",
  "matplotlib", "matplotlib-pyodide", "more-itertools", "networkx", "numpy",
  "packaging", "pandas", "pillow", "pluggy", "py", "pydantic", "pyparsing",
  "pytest", "python-dateutil", "pytz", "pyyaml", "regex", "requests", "rich",
  "setuptools", "six", "soupsieve", "tqdm", "typing-extensions", "tzdata",
  "urllib3",
];

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "pyodide");
mkdirSync(outDir, { recursive: true });

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

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

// Self-hosted package wheels (see SELF_HOSTED_PACKAGES above). The
// lockfile was downloaded with the core files, so read it for the
// exact wheel file_name + sha256 of each package.
const lock = JSON.parse(readFileSync(join(outDir, "pyodide-lock.json"), "utf8"));
let wheelsDownloaded = 0;
for (const pkgName of SELF_HOSTED_PACKAGES) {
  const entry = lock.packages?.[pkgName];
  if (!entry?.file_name || !entry?.sha256) {
    throw new Error(`pyodide-runtime: ${pkgName} has no file_name/sha256 in pyodide-lock.json`);
  }
  const dest = join(outDir, entry.file_name);
  if (existsSync(dest) && sha256(readFileSync(dest)) === entry.sha256) {
    console.log(`pyodide-runtime: wheel ${entry.file_name} already present, skipping`);
    continue;
  }
  console.log(`pyodide-runtime: downloading wheel ${entry.file_name} ...`);
  const res = await fetch(`${CDN_BASE}${entry.file_name}`);
  if (!res.ok) throw new Error(`failed to download wheel ${entry.file_name}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (sha256(buf) !== entry.sha256) {
    throw new Error(`wheel ${entry.file_name}: sha256 mismatch (corrupt download?)`);
  }
  writeFileSync(dest, buf);
  wheelsDownloaded += 1;
  console.log(`pyodide-runtime: wheel ${entry.file_name} OK (${buf.length} bytes)`);
}
console.log(`pyodide-runtime: wheels done (${wheelsDownloaded} downloaded, ${SELF_HOSTED_PACKAGES.length - wheelsDownloaded} already present)`);
