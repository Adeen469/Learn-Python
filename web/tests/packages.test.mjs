import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function namesFromTsList(file, constName) {
  const text = readFileSync(join(root, file), "utf8");
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
