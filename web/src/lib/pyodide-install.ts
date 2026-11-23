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
      // loadPackage RESOLVES even when the wheel fails to load
      // (Pyodide logs "Failed to load <name>" but does not reject) —
      // that is exactly how numpy "downloaded" yet `import numpy`
      // failed (2026-11-19: the wheel was not self-hosted, so it
      // 404'd from /pyodide/). Check the package actually loaded;
      // if not, fall back to the CDN wheel via micropip.
      if (!isPackageLoaded(pyodide, name)) {
        const wheel = await cdnWheelFor(name);
        if (!wheel) {
          return {
            ok: false,
            error:
              `'${name}' is a Pyodide-built package, but its wheel could not be ` +
              `loaded from this site and no CDN wheel URL is known for it.`,
          };
        }
        // R2-L24: the CDN wheel is fetched and its sha256 verified
        // against the self-hosted lockfile BEFORE micropip sees
        // it — a poisoned CDN file (or a MITM with a valid cert)
        // must never reach the browser's Python. The verified
        // bytes are installed from a blob URL, never from the CDN
        // URL directly.
        let blobUrl: string;
        try {
          blobUrl = await withTimeout(
            fetchVerifiedCdnWheel(wheel),
            CDN_WHEEL_INSTALL_TIMEOUT_MS,
            `Downloading '${name}' from the Pyodide CDN timed out after 5 minutes — check your connection and retry.`
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          return {
            ok: false,
            error:
              `'${name}' is a Pyodide-built package, but its CDN wheel ` +
              `could not be verified: ${msg}`,
          };
        }
        try {
          await withTimeout(
            pyodide.runPythonAsync(
              "import micropip\n" +
                `await micropip.install(${JSON.stringify(blobUrl)})`
            ),
            CDN_WHEEL_INSTALL_TIMEOUT_MS,
            `Installing '${name}' from the Pyodide CDN timed out after 5 minutes — check your connection and retry.`
          );
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      }
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
      return {
        ok: false,
        error:
          `Could not load '${name}' — tried the wheel hosted on this site ` +
          `and the Pyodide CDN: ${msg}`,
      };
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
 * Where the Pyodide runtime is loaded from. The runtime (~14 MB) is
 * SELF-HOSTED in web/public/pyodide/ and served from the same origin
 * as the app — because BOTH public CDNs failed for the user
 * (2026-11-19: jsDelivr and unpkg each timed out at 300s, so the
 * editor could never load the runtime at all). The CDN fallbacks
 * were removed 2026-11-22 (M22): loading executable JS from a CDN
 * with no SRI runs arbitrary third-party code in full origin
 * context, and the unpkg entry was CSP-blocked anyway, so the chain
 * was half-dead. There is exactly one source now: this site.
 * (The /pyodide/ base is relative: loadPyodide resolves it against
 * the page origin.)
 */
export const PYODIDE_CDN_BASES = ["/pyodide/"];
/**
 * How long the runtime gets to deliver (~15 MB). Was 60s — but the
 * user's screenshot proved jsDelivr was DOWNLOADING, just slowly: it
 * hit the 60s cap and got abandoned mid-download. Was then 180s —
 * still too short: on the user's connection the download runs closer
 * to ~50-80 KB/s, so 15 MB needs ~190-300s. 5 minutes gives a
 * slow-but-working download a real chance to finish; the editor now
 * shows the live stage + elapsed seconds the whole way, so a slow
 * load reads as "working", not "stuck". (The CDN history is kept in
 * this comment only — the runtime is self-hosted now, see
 * PYODIDE_CDN_BASES.)
 */
export const PYODIDE_LOAD_TIMEOUT_MS = 300_000;
/** How long one package's wheel download (loadPackage) may take. */
export const PYODIDE_PACKAGE_LOAD_TIMEOUT_MS = 120_000;
/** How long a micropip install from PyPI may take. */
export const MICROPIP_INSTALL_TIMEOUT_MS = 180_000;
/**
 * How long the CDN-wheel fallback may take. The Pyodide CDN is slow
 * for the user (~35 KB/s measured 2026-11-19), so a 12 MB wheel needs
 * ~6 minutes; 5 minutes covers most wheels up to ~10 MB. Larger
 * wheels (scipy, 46 MB) will still time out here — they belong in the
 * self-hosted set if the user needs them.
 */
export const CDN_WHEEL_INSTALL_TIMEOUT_MS = 300_000;
/**
 * Where the CDN fallback fetches a Pyodide-built wheel from. The
 * wheel file_name comes from the self-hosted pyodide-lock.json, so
 * the URL is always the exact wheel loadPackage would have fetched.
 */
export const PYODIDE_CDN_WHEEL_BASE =
  "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/";

/**
 * Did loadPackage actually load this package? loadPackage resolves
 * even when the wheel 404s, so the promise alone proves nothing —
 * Pyodide records genuinely loaded packages in `loadedPackages`.
 */
export function isPackageLoaded(pyodide: any, packageName: string): boolean {
  const loaded = pyodide?.loadedPackages as
    | Record<string, unknown>
    | undefined;
  if (!loaded) return false;
  const norm = normalizePackageName(packageName);
  return norm in loaded || packageName in loaded;
}

let lockfileCache: Promise<Record<string, { file_name?: string; sha256?: string }> | null> | null =
  null;

/** A CDN wheel: its URL plus the sha256 the self-hosted lockfile
    pins for it. Both come from the lockfile — the URL is always
    the exact wheel loadPackage would have fetched. */
export interface CdnWheel {
  url: string;
  sha256: string;
}

/**
 * The CDN wheel for a Pyodide-built package, from the self-hosted
 * pyodide-lock.json (same origin, so the lookup itself is fast).
 * Returns null when the package has no wheel in the lockfile, or
 * no sha256 to verify it against — an unverifiable wheel is never
 * offered to the installer. The result is cached for the page
 * lifetime.
 */
export async function cdnWheelFor(packageName: string): Promise<CdnWheel | null> {
  const norm = normalizePackageName(packageName);
  if (!lockfileCache) {
    lockfileCache = (async () => {
      try {
        const res = await fetch("/pyodide/pyodide-lock.json");
        if (!res.ok) return null;
        const lock = (await res.json()) as {
          packages?: Record<string, { file_name?: string; sha256?: string }>;
        };
        return lock.packages ?? null;
      } catch {
        return null;
      }
    })();
  }
  const packages = await lockfileCache;
  const entry = packages?.[norm];
  const fileName = entry?.file_name;
  const sha256 = entry?.sha256;
  if (!fileName || !sha256) return null;
  return { url: `${PYODIDE_CDN_WHEEL_BASE}${fileName}`, sha256 };
}

/**
 * Fetch a CDN wheel and verify its sha256 against the lockfile
 * before it is installed. Returns a blob URL for the verified
 * bytes (micropip installs from that, never from the CDN URL).
 * Throws — never returns an unverified URL — on a fetch failure,
 * a hash mismatch, or a browser without Web Crypto (secure
 * contexts only: localhost + https).
 */
export async function fetchVerifiedCdnWheel(wheel: CdnWheel): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error(
      "this browser cannot verify the wheel's integrity (Web Crypto is unavailable)"
    );
  }
  const res = await fetch(wheel.url);
  if (!res.ok) throw new Error(`the CDN answered ${res.status}`);
  const bytes = await res.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (hex !== wheel.sha256.toLowerCase()) {
    throw new Error("its sha256 does not match the lockfile — refusing to install it");
  }
  return URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
}

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
 * tag. The editor's <Script> tag loads it once — but a single
 * request can occasionally fail, and then window.loadPyodide never
 * appears and no Install can ever succeed until a page reload.
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
 * Load the Pyodide runtime from this site. loadPyodide() downloads
 * the whole runtime and has no timeout of its own — without the
 * withTimeout wrapper, a stalled 15 MB download hung "Installing…"
 * for minutes with no error. `onStage` reports each step so the UI
 * can show WHERE a slow load is stuck instead of a frozen 10%.
 * There is no CDN fallback anymore (M22): the runtime is
 * self-hosted, so a failure here means this site could not deliver
 * it. Throws when the runtime cannot be loaded.
 */
export async function loadPyodideRuntime(
  onStage?: (stage: string) => void
): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("Pyodide can only load in the browser.");
  }
  // Give the editor's <Script> tag a chance first.
  onStage?.("Waiting for Pyodide script…");
  await waitForPyodideScript(10000);
  for (const base of PYODIDE_CDN_BASES) {
    const cdnName = "this site";
    if (typeof (window as any).loadPyodide !== "function") {
      const scriptOk = await loadPyodideScript(base + "pyodide.js", 30000);
      if (!scriptOk) {
        onStage?.(`${cdnName} script did not load.`);
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
        `${cdnName} timed out after ${PYODIDE_LOAD_TIMEOUT_MS / 1000}s.`
      );
    }
  }
  throw new Error(
    "Python runtime could not load from this site — check your connection and retry."
  );
}
