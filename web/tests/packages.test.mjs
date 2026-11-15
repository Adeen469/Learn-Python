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

function loadPyodideScript(timeoutMs = 30000) {
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
    script.src = PYODIDE_SCRIPT_URL;
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
        if (behavior === "load") {
          queueMicrotask(() => {
            win.loadPyodide = () => ({});
            el.onload?.();
          });
        } else if (behavior === "error") {
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
    assert.equal(await loadPyodideScript(1000), true);
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
    assert.equal(await loadPyodideScript(1000), false);
    assert.equal(appended.length, 1);
    assert.equal(appended[0].removed, true);
  } finally {
    unstubDom();
  }
});

test("loadPyodideScript returns false when the tag never loads (timeout)", async () => {
  stubDom({ behavior: "never" });
  try {
    assert.equal(await loadPyodideScript(20), false);
  } finally {
    unstubDom();
  }
});
