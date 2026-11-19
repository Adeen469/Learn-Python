// Shared Pyodide install logic — used by ModulesPanel and by the
// stored-package restore in package-storage.ts.
//
// Why this exists: installs used to fail silently for three separate
// reasons, and the UI showed only a vague log line:
//   1. The editor's Pyodide runtime loads async (jsDelivr <Script>).
//      Clicking Install before it finished returned "not ready" and
//      gave up — no waiting, no retry.
//   2. micropip downloads wheels from pypi.org / files.pythonhosted.org,
//      but the CSP `connect-src` only allowed jsDelivr, so every
//      micropip install was blocked by the browser. (Fixed in
//      next.config.ts — those two hosts are now allowed.)
//   3. A package was marked "installed" when its download finished,
//      without ever checking `import <name>` works — PyPI name and
//      import name differ for several packages (beautifulsoup4 -> bs4,
//      pillow -> PIL, scikit-learn -> sklearn, ...), so code using them
//      still failed with ModuleNotFoundError.
//
// Install order matters: Pyodide-built packages (loadPackage, from the
// jsDelivr CDN) first — they are compiled for WASM. Only packages NOT
// in the Pyodide lock file go to micropip, and only pure-Python wheels
// can run in the browser; a compiled (non-pure) wheel fails there and
// the error now says so plainly instead of pretending it worked.

import { PYODIDE_PACKAGE_SET } from "./pyodide-packages";

/** PyPI/distribution name -> top-level import name, where they differ. */
export const IMPORT_NAME_MAP: Record<string, string> = {
  "beautifulsoup4": "bs4",
  "pillow": "PIL",
  "scikit-learn": "sklearn",
  "scikit-image": "skimage",
  "pyyaml": "yaml",
  "opencv-python": "cv2",
  "python-dateutil": "dateutil",
  "python-flint": "flint",
  "matplotlib-inline": "matplotlib_inline",
  "pyodide-http": "pyodide_http",
  "argon2-cffi": "argon2",
  "argon2-cffi-bindings": "argon2",
  "python-magic": "magic",
  "typing-extensions": "typing_extensions",
  "ruamel-yaml": "ruamel.yaml",
  "zstandard": "zstd",
  "pydantic-core": "pydantic_core",
  "jsonschema-specifications": "jsonschema_specifications",
  "lazy-object-proxy": "lazy_object_proxy",
  "more-itertools": "more_itertools",
  "python-solvespace": "solvespace",
  "primecountpy": "primecount",
  "lakers-python": "lakers",
};

/** Normalize a user-typed / PyPI name to the Pyodide package name. */
export function normalizePackageName(name: string): string {
  return name.trim().toLowerCase().replace(/_/g, "-");
}

/** Top-level module name to `import` to verify an install worked. */
export function importNameFor(packageName: string): string {
  const norm = normalizePackageName(packageName);
  return IMPORT_NAME_MAP[norm] ?? norm.replace(/-/g, "_").split(".")[0];
}

export function isPyodidePackage(packageName: string): boolean {
  return PYODIDE_PACKAGE_SET.has(normalizePackageName(packageName));
}

export type InstallResult =
  | { ok: true; method: "pyodide" | "micropip"; importName: string }
  | { ok: false; error: string };

/**
 * Install one package into a live Pyodide instance and verify it by
 * importing it. Never marks anything installed on failure — the caller
 * saves to localStorage only when `ok` is true.
 */
export async function installPackageInto(
  pyodide: any,
  packageName: string
): Promise<InstallResult> {
  const name = normalizePackageName(packageName);
  const importName = importNameFor(name);
  const viaPyodide = isPyodidePackage(name);

  try {
    if (viaPyodide) {
      // The wheel download has no timeout of its own — a stalled
      // download used to hang "Installing…" forever with no error.
      await withTimeout(
        pyodide.loadPackage(name),
        PYODIDE_PACKAGE_LOAD_TIMEOUT_MS,
        `Downloading '${name}' timed out after 2 minutes — check your connection and retry.`
      );
    } else {
      await withTimeout(
        pyodide.runPythonAsync(
          "import micropip\n" +
            `await micropip.install(${JSON.stringify(name)})`
        ),
        MICROPIP_INSTALL_TIMEOUT_MS,
        `Installing '${name}' from PyPI timed out after 3 minutes — check your connection and retry.`
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (viaPyodide) {
      return { ok: false, error: `Could not load '${name}' from Pyodide: ${msg}` };
    }
    return {
      ok: false,
      error:
        `'${name}' is not a Pyodide-built package, so it was tried from PyPI ` +
        `(micropip). That failed: ${msg}. Only pure-Python packages can ` +
        `install this way — packages with compiled (C/C++) code need a ` +
        `Pyodide-built version instead.`,
    };
  }

  // Verify the import actually works — download success alone is not
  // enough (e.g. beautifulsoup4 installs but must be imported as bs4).
  try {
    await withTimeout(
      pyodide.runPythonAsync(`import ${importName}`),
      60_000,
      `Verifying 'import ${importName}' timed out after 1 minute.`
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error:
        `'${name}' downloaded but 'import ${importName}' failed: ${msg}. ` +
        `It may need a different import name, or its dependencies did not load.`,
    };
  }

  return { ok: true, method: viaPyodide ? "pyodide" : "micropip", importName };
}

/** The Pyodide loader script — served from this site (same origin),
    so it loads whenever the app itself loads, no CDN needed. */
export const PYODIDE_SCRIPT_URL = "/pyodide/pyodide.js";
/**
 * Where the Pyodide runtime is loaded from, in try order. The runtime
 * (~14 MB) is SELF-HOSTED in web/public/pyodide/ and served from the
 * same origin as the app — because BOTH public CDNs failed for the
 * user (2026-11-19: jsDelivr and unpkg each timed out at 300s, so the
 * editor could never load the runtime at all and showed "could not
 * load from jsDelivr or unpkg"). The app itself loads fine from
 * Vercel, so the same-origin runtime loads from the same fast path.
 * jsDelivr and unpkg stay as fallbacks if the self-hosted copy ever
 * fails. (The /pyodide/ base is relative: loadPyodide resolves it
 * against the page origin.)
 */
export const PYODIDE_CDN_BASES = [
  "/pyodide/",
  "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/",
  "https://unpkg.com/pyodide@0.27.2/",
];
/**
 * How long one CDN gets to deliver the runtime (~15 MB) per try.
 * Was 60s — but the user's screenshot proved jsDelivr was
 * DOWNLOADING, just slowly: it hit the 60s cap and got abandoned
 * mid-download, then unpkg faced the same cap. A ~15 MB runtime at
 * ~100 KB/s needs ~150s, so 60s killed every attempt before it
 * could finish. Was then 180s — still too short: on the user's
 * connection the download runs closer to ~50-80 KB/s, so 15 MB
 * needs ~190-300s and 180s killed BOTH CDNs mid-download, leaving
 * the editor on "Loading Engine" with no error at all. 5 minutes
 * per CDN gives a slow-but-working download a real chance to
 * finish; the editor now shows the live stage + elapsed seconds
 * the whole way, so a slow load reads as "working", not "stuck".
 */
export const PYODIDE_LOAD_TIMEOUT_MS = 300_000;
/** How long one package's wheel download (loadPackage) may take. */
export const PYODIDE_PACKAGE_LOAD_TIMEOUT_MS = 120_000;
/** How long a micropip install from PyPI may take. */
export const MICROPIP_INSTALL_TIMEOUT_MS = 180_000;

/**
 * Run a promise with a timeout. loadPyodide() downloads the whole
 * runtime and has no timeout of its own — without this, a stalled
 * download hangs the install forever with no error at all.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

/** Wait for the Pyodide <Script> to define window.loadPyodide. */
export function waitForPyodideScript(timeoutMs = 30000): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (typeof (window as any).loadPyodide === "function") {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (typeof (window as any).loadPyodide === "function") {
        window.clearInterval(timer);
        resolve(true);
      } else if (Date.now() - started > timeoutMs) {
        window.clearInterval(timer);
        resolve(false);
      }
    }, 200);
  });
}

/**
 * Load the Pyodide script from the given URL with a fresh <script>
 * tag. The editor's <Script> tag loads it once — but jsDelivr
 * occasionally 404s a single request, and then window.loadPyodide
 * never appears and no Install can ever succeed until a page reload.
 * Retrying with a new tag fixes that without a reload. Returns true
 * when loadPyodide is defined afterwards (immediately true when it
 * already is).
 */
export function loadPyodideScript(
  url: string = PYODIDE_SCRIPT_URL,
  timeoutMs = 30000
): Promise<boolean> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(false);
  }
  if (typeof (window as any).loadPyodide === "function") {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      if (!ok) script.remove();
      resolve(
        ok && typeof (window as any).loadPyodide === "function"
      );
    };
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    script.src = url;
    script.onload = () => finish(true);
    script.onerror = () => finish(false);
    document.head.appendChild(script);
  });
}

/**
 * Load the Pyodide runtime, trying each CDN base in turn. One slow
 * CDN used to doom the whole install: loadPyodide() has no timeout
 * of its own, and a stalled 15 MB download hung "Installing…"
 * for minutes with no error. Now each CDN gets 5 minutes — jsDelivr
 * first, unpkg second — and a stalled one is abandoned for the
 * next instead of blocking the install. `onStage` reports each
 * step (which CDN is being tried, timeouts, success) so the UI can
 * show WHERE a slow load is stuck instead of a frozen 10%.
 * Throws when no CDN delivers the runtime.
 */
export async function loadPyodideRuntime(
  onStage?: (stage: string) => void
): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("Pyodide can only load in the browser.");
  }
  // Give the editor's <Script> tag (jsDelivr) a chance first.
  onStage?.("Waiting for Pyodide script…");
  await waitForPyodideScript(10000);
  for (const base of PYODIDE_CDN_BASES) {
    const cdnName = base.startsWith("/")
      ? "this site"
      : base.includes("unpkg")
        ? "unpkg"
        : "jsDelivr";
    if (typeof (window as any).loadPyodide !== "function") {
      const scriptOk = await loadPyodideScript(base + "pyodide.js", 30000);
      if (!scriptOk) {
        onStage?.(`${cdnName} script did not load — trying the next CDN…`);
        continue;
      }
    }
    onStage?.(`Downloading runtime from ${cdnName}…`);
    try {
      const pyodide = await withTimeout(
        (window as any).loadPyodide({ indexURL: base }),
        PYODIDE_LOAD_TIMEOUT_MS,
        `Python runtime download from ${base} timed out.`
      );
      onStage?.(`Runtime loaded from ${cdnName}`);
      return pyodide;
    } catch {
      onStage?.(
        `${cdnName} timed out after ${PYODIDE_LOAD_TIMEOUT_MS / 1000}s — trying the next CDN…`
      );
    }
  }
  throw new Error(
    "Python runtime could not load from this site, jsDelivr or unpkg — check your connection and retry."
  );
}
