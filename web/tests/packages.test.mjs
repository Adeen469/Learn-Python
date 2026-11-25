import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8").replace(/\r\n/g, "\n");

function namesFromTsList(file, constName) {
  const text = readFileSync(join(root, file), "utf8").replace(/\r\n/g, "\n");
  const block = text.split(constName)[1].split("];")[0];
  return [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

const pyodidePackages = namesFromTsList(
  "src/lib/pyodide-packages.ts",
  "PYODIDE_PACKAGES"
);

test("Pyodide list is the full lock-file list (not 15)", () => {
  assert.ok(pyodidePackages.length >= 200, `only ${pyodidePackages.length} packages`);
  assert.equal(new Set(pyodidePackages).size, pyodidePackages.length, "duplicates");
  assert.deepEqual(pyodidePackages, [...pyodidePackages].sort(), "not sorted");
  for (const must of ["numpy", "pandas", "matplotlib", "scipy", "scikit-learn", "sympy", "regex", "requests", "beautifulsoup4", "pytest", "rich", "networkx", "jinja2", "pyyaml", "pillow", "opencv-python", "sqlalchemy"]) {
    assert.ok(pyodidePackages.includes(must), `missing ${must}`);
  }
  assert.ok(!pyodidePackages.some((n) => n.endsWith("-tests")), "test packages leaked in");
  // These are PyPI-only — they must NOT be claimed as Pyodide packages.
  for (const notPyodide of ["flask", "django", "seaborn", "plotly", "openpyxl"]) {
    assert.ok(!pyodidePackages.includes(notPyodide), `${notPyodide} is not Pyodide-built`);
  }
});

test("micropip list has no overlap with the Pyodide list", () => {
  const text = readFileSync(join(root, "src/lib/external-packages.ts"), "utf8");
  const micropipBlock = text.split("MICROPIP_PACKAGES")[1].split("];")[0];
  const micropip = [...micropipBlock.matchAll(/name: "([^"]+)"/g)].map((m) => m[1]);
  assert.ok(micropip.length >= 15, `only ${micropip.length} micropip packages`);
  assert.equal(new Set(micropip).size, micropip.length, "duplicates in micropip list");
  for (const name of micropip) {
    assert.ok(!pyodidePackages.includes(name), `${name} is in both lists`);
  }
  for (const must of ["flask", "seaborn", "plotly", "openpyxl"]) {
    assert.ok(micropip.includes(must), `missing micropip ${must}`);
  }
});

// Mirror of web/src/lib/pyodide-install.ts (pure helpers, zero-build test).
const IMPORT_NAME_MAP = {
  "beautifulsoup4": "bs4",
  "pillow": "PIL",
  "scikit-learn": "sklearn",
  "scikit-image": "skimage",
  "pyyaml": "yaml",
  "opencv-python": "cv2",
  "python-dateutil": "dateutil",
};
function normalizePackageName(name) {
  return name.trim().toLowerCase().replace(/_/g, "-");
}
function importNameFor(packageName) {
  const norm = normalizePackageName(packageName);
  return IMPORT_NAME_MAP[norm] ?? norm.replace(/-/g, "_").split(".")[0];
}

test("import names differ from PyPI names where they must", () => {
  assert.equal(importNameFor("beautifulsoup4"), "bs4");
  assert.equal(importNameFor("Pillow"), "PIL");
  assert.equal(importNameFor("scikit-learn"), "sklearn");
  assert.equal(importNameFor("opencv-python"), "cv2");
  assert.equal(importNameFor("pyyaml"), "yaml");
  assert.equal(importNameFor("numpy"), "numpy");
  assert.equal(importNameFor("python-dateutil"), "dateutil");
  assert.equal(normalizePackageName("Scikit_Learn"), "scikit-learn");
  assert.equal(normalizePackageName("  Requests "), "requests");
});

test("CSP allows micropip's PyPI hosts", () => {
  const config = readFileSync(join(root, "next.config.ts"), "utf8");
  assert.ok(config.includes("https://pypi.org"), "pypi.org missing from connect-src");
  assert.ok(config.includes("https://files.pythonhosted.org"), "files.pythonhosted.org missing");
});

// Mirror of the editor's isItemVisible (web/src/app/editor/page.tsx).
function isItemVisible(item, expandedFolders) {
  const parts = item.path.split("/");
  for (let i = 1; i < parts.length; i += 1) {
    const ancestor = parts.slice(0, i).join("/");
    if (expandedFolders[ancestor] === false) return false;
  }
  return true;
}

test("collapsing a folder hides its files (editor tree)", () => {
  const items = [
    { path: "main.py" },
    { path: "utils" },
    { path: "utils/__init__.py" },
    { path: "utils/math_helpers.py" },
  ];
  assert.deepEqual(items.filter((i) => isItemVisible(i, { utils: true })).map((i) => i.path), [
    "main.py", "utils", "utils/__init__.py", "utils/math_helpers.py",
  ]);
  assert.deepEqual(items.filter((i) => isItemVisible(i, { utils: false })).map((i) => i.path), [
    "main.py", "utils",
  ]);
  // Folders never mentioned default to visible.
  assert.equal(isItemVisible({ path: "tests/test_a.py" }, {}), true);
});

// --- loadPyodideScript + withTimeout mirrors (pyodide-install.ts) ---

const PYODIDE_SCRIPT_URL =
  "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js";
const PYODIDE_LOAD_TIMEOUT_MS = 120_000;

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

function loadPyodideScript(url = PYODIDE_SCRIPT_URL, timeoutMs = 30000) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(false);
  }
  if (typeof window.loadPyodide === "function") {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      if (!ok) script.remove();
      resolve(ok && typeof window.loadPyodide === "function");
    };
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    script.src = url;
    script.onload = () => finish(true);
    script.onerror = () => finish(false);
    document.head.appendChild(script);
  });
}

function stubDom({ loadPyodide, behavior = "load" } = {}) {
  const appended = [];
  const win = {
    loadPyodide,
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
  };
  const doc = {
    head: {
      appendChild: (el) => {
        appended.push(el);
        // behavior may be a fixed string or a function of the tag URL.
        const b =
          typeof behavior === "function" ? behavior(el.src) : behavior;
        if (b === "load") {
          queueMicrotask(() => {
            if (typeof win.loadPyodide !== "function") {
              win.loadPyodide = async (opts) => ({ loadedFrom: opts.indexURL });
            }
            el.onload?.();
          });
        } else if (b === "error") {
          queueMicrotask(() => el.onerror?.());
        }
        // "never": the tag just sits there until the timeout fires.
      },
    },
    createElement: () => ({
      src: "",
      onload: null,
      onerror: null,
      removed: false,
      remove() {
        this.removed = true;
      },
    }),
  };
  globalThis.window = win;
  globalThis.document = doc;
  return { win, appended };
}

function unstubDom() {
  delete globalThis.window;
  delete globalThis.document;
}

test("withTimeout resolves fast promises and rejects slow ones with the message", async () => {
  assert.equal(await withTimeout(Promise.resolve(42), 1000, "slow"), 42);
  await assert.rejects(
    withTimeout(new Promise(() => {}), 20, "Python runtime download timed out"),
    /timed out/
  );
});

test("loadPyodideScript returns true at once when the runtime is already there", async () => {
  stubDom({ loadPyodide: () => ({}) });
  try {
    assert.equal(await loadPyodideScript(), true);
  } finally {
    unstubDom();
  }
});

test("loadPyodideScript injects a fresh tag and succeeds on load", async () => {
  const { win, appended } = stubDom({ behavior: "load" });
  try {
    assert.equal(await loadPyodideScript(PYODIDE_SCRIPT_URL, 1000), true);
    assert.equal(appended.length, 1);
    assert.equal(appended[0].src, PYODIDE_SCRIPT_URL);
    assert.equal(typeof win.loadPyodide, "function");
  } finally {
    unstubDom();
  }
});

test("loadPyodideScript removes the tag and returns false on error", async () => {
  const { appended } = stubDom({ behavior: "error" });
  try {
    assert.equal(await loadPyodideScript(PYODIDE_SCRIPT_URL, 1000), false);
    assert.equal(appended.length, 1);
    assert.equal(appended[0].removed, true);
  } finally {
    unstubDom();
  }
});

test("loadPyodideScript returns false when the tag never loads (timeout)", async () => {
  stubDom({ behavior: "never" });
  try {
    assert.equal(await loadPyodideScript(PYODIDE_SCRIPT_URL, 20), false);
  } finally {
    unstubDom();
  }
});

// --- restore loop mirror (package-storage.ts): one stalled package
// must time out and let the next one load, never hang init ---

async function restoreWithTimeout(pkgs, installFn, onProgress, timeoutMs = 90_000) {
  for (const pkg of pkgs) {
    onProgress?.(pkg, "loading");
    let result;
    try {
      result = await withTimeout(
        installFn(pkg),
        timeoutMs,
        `Timed out loading '${pkg}'`
      );
    } catch (err) {
      result = { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
    onProgress?.(pkg, result.ok ? "done" : "error", result.error);
  }
}

test("restore continues past a package whose download stalls", async () => {
  const seen = [];
  await restoreWithTimeout(
    ["numpy", "pandas"],
    async (pkg) => {
      if (pkg === "numpy") return new Promise(() => {}); // never settles
      return { ok: true };
    },
    (pkg, status, error) => seen.push([pkg, status, error || null]),
    20
  );
  assert.deepEqual(seen, [
    ["numpy", "loading", null],
    ["numpy", "error", "Timed out loading 'numpy'"],
    ["pandas", "loading", null],
    ["pandas", "done", null],
  ]);
});

// --- installPackageInto timeout mirror (pyodide-install.ts) ---

const PYODIDE_PACKAGE_LOAD_TIMEOUT_MS = 20;
const MICROPIP_INSTALL_TIMEOUT_MS = 20;

async function installPackageIntoMirror(pyodide, packageName) {
  const name = packageName.trim().toLowerCase();
  const importName = name.replace(/-/g, "_").split(".")[0];
  const viaPyodide = true; // numpy path
  try {
    if (viaPyodide) {
      await withTimeout(
        pyodide.loadPackage(name),
        PYODIDE_PACKAGE_LOAD_TIMEOUT_MS,
        `Downloading '${name}' timed out after 2 minutes — check your connection and retry.`
      );
    }
  } catch (err) {
    return { ok: false, error: `Could not load '${name}' from Pyodide: ${err.message}` };
  }
  try {
    await withTimeout(pyodide.runPythonAsync(`import ${importName}`), 20, "verify timed out");
  } catch (err) {
    return { ok: false, error: `import failed: ${err.message}` };
  }
  return { ok: true, method: "pyodide", importName };
}

test("install fails with a clear timeout error when the wheel download stalls", async () => {
  const neverPyodide = {
    loadPackage: () => new Promise(() => {}), // never settles
    runPythonAsync: async () => {},
  };
  const result = await installPackageIntoMirror(neverPyodide, "numpy");
  assert.equal(result.ok, false);
  assert.match(result.error, /timed out/);
});

test("install succeeds when the wheel loads and the import works", async () => {
  const okPyodide = {
    loadPackage: async () => {},
    runPythonAsync: async () => {},
  };
  const result = await installPackageIntoMirror(okPyodide, "numpy");
  assert.deepEqual(result, { ok: true, method: "pyodide", importName: "numpy" });
});

// --- loadPyodideRuntime CDN-fallback mirror (pyodide-install.ts) ---

const PYODIDE_CDN_BASES = [
  "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/",
  "https://unpkg.com/pyodide@0.27.2/",
];
const RUNTIME_LOAD_TIMEOUT_MS = 20;

function waitForPyodideScriptMirror(timeoutMs = 20) {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (typeof window.loadPyodide === "function") return Promise.resolve(true);
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (typeof window.loadPyodide === "function") {
        clearInterval(timer);
        resolve(true);
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        resolve(false);
      }
    }, 5);
  });
}

async function loadPyodideRuntimeMirror(onStage) {
  if (typeof window === "undefined") {
    throw new Error("Pyodide can only load in the browser.");
  }
  onStage?.("Waiting for Pyodide script…");
  await waitForPyodideScriptMirror(20);
  for (const base of PYODIDE_CDN_BASES) {
    const cdnName = base.includes("unpkg") ? "unpkg" : "jsDelivr";
    if (typeof window.loadPyodide !== "function") {
      const scriptOk = await loadPyodideScript(base + "pyodide.js", 20);
      if (!scriptOk) {
        onStage?.(`${cdnName} script did not load — trying the next CDN…`);
        continue;
      }
    }
    onStage?.(`Downloading runtime from ${cdnName}…`);
    try {
      const rt = await withTimeout(
        window.loadPyodide({ indexURL: base }),
        RUNTIME_LOAD_TIMEOUT_MS,
        `Python runtime download from ${base} timed out.`
      );
      onStage?.(`Runtime loaded from ${cdnName}`);
      return rt;
    } catch {
      onStage?.(`${cdnName} timed out after ${RUNTIME_LOAD_TIMEOUT_MS / 1000}s — trying the next CDN…`);
    }
  }
  throw new Error(
    "Python runtime could not load from jsDelivr or unpkg — check your connection and retry."
  );
}

test("runtime falls back to unpkg when the jsDelivr script fails", async () => {
  stubDom({
    behavior: (src) =>
      src.includes("jsdelivr") ? "error" : "load",
  });
  try {
    const rt = await loadPyodideRuntimeMirror();
    assert.equal(rt.loadedFrom, "https://unpkg.com/pyodide@0.27.2/");
  } finally {
    unstubDom();
  }
});

test("runtime falls back to unpkg when the jsDelivr download stalls", async () => {
  stubDom({
    loadPyodide: (opts) =>
      opts.indexURL.includes("jsdelivr")
        ? new Promise(() => {}) // never settles
        : Promise.resolve({ loadedFrom: opts.indexURL }),
  });
  try {
    const rt = await loadPyodideRuntimeMirror();
    assert.equal(rt.loadedFrom, "https://unpkg.com/pyodide@0.27.2/");
  } finally {
    unstubDom();
  }
});

test("runtime throws a clear error when both CDNs fail", async () => {
  stubDom({
    loadPyodide: () => new Promise(() => {}), // never settles, either CDN
  });
  try {
    await assert.rejects(
      loadPyodideRuntimeMirror(),
      /could not load from jsDelivr or unpkg/
    );
  } finally {
    unstubDom();
  }
});

test("runtime reports each CDN stage while falling back", async () => {
  stubDom({
    loadPyodide: (opts) =>
      opts.indexURL.includes("jsdelivr")
        ? new Promise(() => {}) // never settles
        : Promise.resolve({ loadedFrom: opts.indexURL }),
  });
  try {
    const stages = [];
    const rt = await loadPyodideRuntimeMirror((s) => stages.push(s));
    assert.equal(rt.loadedFrom, "https://unpkg.com/pyodide@0.27.2/");
    assert.ok(stages.some((s) => s.includes("Downloading runtime from jsDelivr")));
    assert.ok(stages.some((s) => s.includes("jsDelivr timed out")));
    assert.ok(stages.some((s) => s.includes("Downloading runtime from unpkg")));
    assert.ok(stages.some((s) => s.includes("Runtime loaded from unpkg")));
  } finally {
    unstubDom();
  }
});

// --- shared-init single-flight mirror (editor/page.tsx initPyodide) ---
// The creator AND any joiner must both get null (never a throw) when
// the shared init fails — a throw used to crash the joining install
// and freeze its button on "Installing…" with a stuck bar forever
// (scikit-image, 2026-11-16: the 12:10 init failed, the joiner
// crashed, its bar stayed at "unpkg timed out after 60s · 1193s").

function makeSharedInitMirror(loadFn) {
  let promise = null;
  async function init(onStage) {
    if (promise) {
      try {
        return await promise;
      } catch {
        return null;
      }
    }
    promise = (async () => loadFn(onStage))();
    try {
      return await promise;
    } catch {
      promise = null;
      return null;
    }
  }
  return init;
}

test("joining init caller gets null (not a throw) when the shared init fails", async () => {
  let calls = 0;
  const init = makeSharedInitMirror(async () => {
    calls += 1;
    await new Promise((r) => setTimeout(r, 10));
    throw new Error("runtime load failed");
  });
  const [creator, joiner] = await Promise.all([init(), init()]);
  assert.equal(creator, null);
  assert.equal(joiner, null);
  assert.equal(calls, 1);
  // A later attempt retries instead of reusing the failed promise.
  assert.equal(await init(), null);
  assert.equal(calls, 2);
});

test("creator and joiner share one successful init", async () => {
  let calls = 0;
  const init = makeSharedInitMirror(async () => {
    calls += 1;
    await new Promise((r) => setTimeout(r, 10));
    return { ready: true };
  });
  const [creator, joiner] = await Promise.all([init(), init()]);
  assert.deepEqual(creator, { ready: true });
  assert.deepEqual(joiner, { ready: true });
  assert.equal(calls, 1);
});

test("runtime load timeout is 5 minutes per CDN (slow downloads must finish)", () => {
  const src = readFileSync(join(root, "src/lib/pyodide-install.ts"), "utf8");
  assert.ok(
    src.includes("export const PYODIDE_LOAD_TIMEOUT_MS = 300_000;"),
    "PYODIDE_LOAD_TIMEOUT_MS must be 300_000: at ~50-80 KB/s the 15 MB runtime needs ~190-300s, and 180s killed both CDNs mid-download leaving the editor on 'Loading Engine' with no error"
  );
  assert.ok(
    !src.includes("PYODIDE_LOAD_TIMEOUT_MS = 180_000"),
    "the old 180s timeout must be gone"
  );
});

test("the Pyodide runtime is self-hosted on the same origin (CDNs failed for the user)", () => {
  // 2026-11-19: BOTH public CDNs failed for the user — jsDelivr and
  // unpkg each timed out at 300s, so the editor showed "could not
  // load from jsDelivr or unpkg" and no code could run at all. The
  // runtime is now served only from this site: executing third-party
  // scripts in the app origin would weaken the site's trust boundary.
  const src = read("src/lib/pyodide-install.ts");
  assert.ok(
    src.includes('export const PYODIDE_SCRIPT_URL = "/pyodide/pyodide.js";'),
    "the loader script must come from the same origin"
  );
  assert.ok(
    src.includes('"/pyodide/",'),
    "the same-origin /pyodide/ base must be first in PYODIDE_CDN_BASES"
  );
  const bases = src.match(/export const PYODIDE_CDN_BASES = \[([\s\S]*?)\];/);
  assert.ok(bases, "PYODIDE_CDN_BASES must be defined");
  assert.ok(bases[1].includes('"/pyodide/"'), "the runtime must use the same-origin base");
  assert.ok(
    !/https?:\/\//.test(bases[1]),
    "the runtime must not execute a third-party CDN script in the app origin"
  );
  assert.ok(
    src.includes('base.startsWith("/")'),
    "the CDN display name must handle the same-origin base"
  );
  assert.ok(
    src.includes('"this site"'),
    "the same-origin base must display as 'this site' in the status line"
  );
  // The runtime files are fetched at BUILD time (not committed): the
  // GitHub snapshot push flow only accepts UTF-8 text, so the binary
  // .wasm/.zip/.whl files cannot be pushed. scripts/fetch-pyodide-runtime.mjs
  // downloads them into public/pyodide/ via the `prebuild` script, and
  // public/pyodide/ is gitignored.
  const fetchScript = read("scripts/fetch-pyodide-runtime.mjs");
  for (const f of ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json", "micropip-0.8.0-py3-none-any.whl", "packaging-24.2-py3-none-any.whl"]) {
    assert.ok(fetchScript.includes(`"${f}"`), `fetch script must download ${f}`);
  }
  assert.ok(fetchScript.includes("0.27.2"), "fetch script must pin Pyodide 0.27.2");
  const pkg = JSON.parse(read("package.json"));
  assert.ok(
    pkg.scripts.prebuild.startsWith("node scripts/fetch-pyodide-runtime.mjs"),
    "prebuild must fetch the Pyodide runtime before every build"
  );
  assert.ok(
    pkg.scripts.prebuild.includes("node scripts/generate-ai-skills.mjs"),
    "prebuild must regenerate the AI skill module from the skill files"
  );
  const gitignore = read(".gitignore");
  assert.ok(gitignore.includes("public/pyodide/"), "the downloaded runtime must be gitignored (binary, not committed)");
  // The runtime files themselves must be present locally (downloaded
  // by the fetch script) so the editor can serve them.
  for (const f of ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json", "micropip-0.8.0-py3-none-any.whl", "packaging-24.2-py3-none-any.whl"]) {
    const p = join(root, `public/pyodide/${f}`);
    assert.ok(existsSync(p), `public/pyodide/${f} must exist locally`);
    assert.ok(statSync(p).size > 0, `public/pyodide/${f} must not be empty`);
  }
  // The editor's <Script> must load the loader from the same origin.
  const page = read("src/app/editor/page.tsx");
  assert.ok(
    page.includes('src="/pyodide/pyodide.js"'),
    "the editor Script must load pyodide.js from the same origin"
  );
  assert.ok(
    !page.includes("cdn.jsdelivr.net/pyodide"),
    "the editor must not load the Pyodide script from jsDelivr anymore"
  );
});

test("CSP allows WebAssembly instantiation for the self-hosted Pyodide runtime", () => {
  // Without 'wasm-unsafe-eval' in script-src, the browser refuses
  // WebAssembly.instantiateStreaming() with a CompileError and the
  // runtime download succeeds but the engine never starts. This was
  // hidden while the CDN download failed first; self-hosting exposed it.
  const config = read("next.config.ts");
  assert.ok(
    config.includes("'wasm-unsafe-eval'"),
    "script-src must include 'wasm-unsafe-eval' so Pyodide can instantiate its wasm module"
  );
  assert.ok(
    /script-src[^"]*'wasm-unsafe-eval'/.test(config),
    "'wasm-unsafe-eval' must be in the script-src directive (not elsewhere)"
  );
  // The broad 'unsafe-eval' must NOT appear as a standalone token in
  // the script-src directive — 'wasm-unsafe-eval' is the narrow
  // wasm-only permission. (The comment above the directive quotes the
  // browser's "'unsafe-eval' is not an allowed source" error, so check
  // the directive itself, not the whole file.)
  const scriptSrc = config.match(/"script-src[^"]*"/);
  assert.ok(scriptSrc, "a script-src directive must exist");
  assert.ok(
    !/(?<!wasm-)'unsafe-eval'/.test(scriptSrc[0]),
    "the broad 'unsafe-eval' must NOT be used in script-src — 'wasm-unsafe-eval' is the narrow wasm-only permission"
  );
});

test("numpy install — the build-time fetch self-hosts the wheels loadPackage needs, so a wheel cannot 404 from /pyodide/", () => {
  const script = read("scripts/fetch-pyodide-runtime.mjs");
  // The 42-package closure (numpy / pandas / matplotlib + small common libs).
  for (const pkg of ["numpy", "pandas", "matplotlib", "pillow", "requests", "beautifulsoup4", "pyyaml", "regex", "pytest", "rich", "networkx", "jinja2", "pydantic"]) {
    assert.ok(script.includes(`"${pkg}"`), `the fetch script must self-host the ${pkg} wheel`);
  }
  assert.ok(script.includes("SELF_HOSTED_PACKAGES"), "the wheel list must be a named constant");
  assert.ok(script.includes("pyodide-lock.json"), "wheel file names + hashes must come from the lockfile");
  assert.ok(script.includes("sha256"), "each wheel must be verified by sha256, not just size");
  assert.ok(script.includes("file_name"), "the lockfile file_name is the wheel to download");
  // scipy / statsmodels / scikit-learn are deliberately NOT self-hosted (too big).
  assert.ok(!script.includes('"scipy"'), "scipy must NOT be self-hosted (46 MB) — it uses the CDN fallback");
  assert.ok(!script.includes('"scikit-learn"'), "scikit-learn must NOT be self-hosted — it uses the CDN fallback");
  // The wheels must actually be present locally after the fetch.
  const lock = JSON.parse(read("public/pyodide/pyodide-lock.json"));
  for (const pkg of ["numpy", "pandas", "matplotlib"]) {
    const fileName = lock.packages[pkg].file_name;
    assert.ok(existsSync(join(root, "public", "pyodide", fileName)), `${pkg} wheel ${fileName} must be present in public/pyodide/`);
  }
});

test("numpy install — installPackageInto detects loadPackage's silent failure and falls back to the CDN wheel via micropip", () => {
  const src = read("src/lib/pyodide-install.ts");
  // loadPackage resolves even when the wheel 404s — the code must check it loaded.
  assert.ok(src.includes("isPackageLoaded(pyodide, name)"), "the install must check the package actually loaded after loadPackage");
  assert.ok(src.includes("loadedPackages"), "the check must use pyodide.loadedPackages");
  // The fallback installs the exact CDN wheel via micropip — but
  // only after verifying its sha256 against the self-hosted
  // lockfile (R2-L24): the bytes are installed from a blob URL,
  // never from the CDN URL directly.
  assert.ok(src.includes("cdnWheelFor(name)"), "the fallback must resolve the CDN wheel for the package");
  assert.ok(src.includes("fetchVerifiedCdnWheel(wheel)"), "the fallback must verify the CDN wheel before installing it");
  assert.ok(src.includes("crypto.subtle.digest(\"SHA-256\""), "verification must be a sha256 digest");
  assert.ok(src.includes("URL.createObjectURL"), "verified bytes must be installed from a blob URL");
  assert.ok(src.includes("URL.revokeObjectURL(blobUrl)"), "the blob URL must be revoked after install");
  assert.ok(src.includes("micropip.install"), "the fallback must install the CDN wheel via micropip");
  assert.ok(src.includes("PYODIDE_CDN_WHEEL_BASE"), "the CDN wheel base must be a named constant");
  assert.ok(src.includes("cdn.jsdelivr.net/pyodide/v0.27.2/full/"), "the CDN wheel base must be the jsDelivr full/ directory");
  assert.ok(src.includes("CDN_WHEEL_INSTALL_TIMEOUT_MS"), "the CDN fallback must have its own (generous) timeout");
  // cdnWheelFor reads the file_name + sha256 from the self-hosted lockfile.
  assert.ok(src.includes("/pyodide/pyodide-lock.json"), "the wheel URL must come from the self-hosted lockfile");
  assert.ok(src.includes("file_name"), "the lockfile file_name is the wheel name");
  assert.ok(src.includes("sha256"), "the lockfile sha256 is the verification hash");
  // The old misleading error is gone: a failed load must say both paths were tried.
  assert.ok(!src.includes("Could not load '${name}' from Pyodide:"), "the old 'Could not load from Pyodide' message must be replaced");
  assert.ok(src.includes("tried the wheel hosted on this site"), "the error must say both the self-hosted wheel and the CDN were tried");
});

// --- L12/L15 mirrors: PyPI response guard + home_page validation ---

// Mirror of web/src/app/api/pypi/route.ts (and the same check in
// web/src/components/ModulesPanel.tsx): only absolute https: URLs
// may be rendered as the project-homepage link.
function isSafeHttpsUrl(href) {
  if (typeof href !== "string" || !href) return false;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

test("L15: PyPI home_page allows https: only", () => {
  assert.equal(isSafeHttpsUrl("https://example.com/"), true);
  assert.equal(isSafeHttpsUrl("https://pypi.org/project/numpy/"), true);
  assert.equal(isSafeHttpsUrl("http://example.com/"), false);
  assert.equal(isSafeHttpsUrl("javascript:alert(1)"), false);
  assert.equal(isSafeHttpsUrl("data:text/html,<h1>x</h1>"), false);
  assert.equal(isSafeHttpsUrl("/relative/path"), false);
  assert.equal(isSafeHttpsUrl("example.com"), false);
  assert.equal(isSafeHttpsUrl(""), false);
  assert.equal(isSafeHttpsUrl(null), false);
  assert.equal(isSafeHttpsUrl(undefined), false);
});

test("L12/L15: PyPI route caps upstream JSON and validates home_page", () => {
  const src = read("src/app/api/pypi/route.ts");
  // L12: Content-Length guard before parsing, plus an info shape check.
  assert.ok(src.includes("PYPI_MAX_JSON_BYTES"), "missing upstream JSON size cap");
  assert.ok(src.includes('res.headers.get("content-length")'), "must read Content-Length before parsing");
  assert.ok(src.includes("PyPI response too large"), "oversize upstream must be refused");
  assert.ok(src.includes("typeof (data as { info?: unknown }).info !== \"object\""), "must validate data.info is an object");
  // L15: home_page goes through the https: check, with a PyPI fallback.
  assert.ok(src.includes("isSafeHttpsUrl(rawHomePage)"), "home_page must be validated server-side");
  assert.ok(src.includes("https://pypi.org/project/${pkg}/"), "invalid home_page must fall back to the PyPI page");
});

test("R2-M13: PyPI route counts streamed bytes instead of trusting Content-Length", () => {
  const src = read("src/app/api/pypi/route.ts");
  // Chunked upstream bodies carry no Content-Length, so the header
  // check alone lets an unbounded body reach the parser — count
  // bytes while streaming and stop the read past the cap.
  assert.ok(src.includes("res.body.getReader()"), "the upstream body must be read as a stream");
  assert.ok(src.includes("receivedBytes > PYPI_MAX_JSON_BYTES"), "the stream must be capped by counted bytes");
  assert.ok(src.includes("reader.cancel()"), "an oversize stream must be cancelled, not drained");
  assert.ok(src.includes("JSON.parse("), "the capped bytes must be parsed as JSON");
  assert.ok(!src.includes("await res.json()"), "the route must not parse the upstream body unbounded");
});

test("L15: ModulesPanel re-checks home_page before rendering the link", () => {
  const src = read("src/components/ModulesPanel.tsx");
  assert.ok(src.includes("function isSafeHttpsUrl"), "ModulesPanel needs its own https: check");
  assert.ok(src.includes("isSafeHttpsUrl(pypiResult.home_page)"), "the homepage anchor must be gated on the check");
});
