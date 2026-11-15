export const INSTALLED_PACKAGES_STORAGE_KEY = "lp_installed_packages";

export function getStoredInstalledPackages(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INSTALLED_PACKAGES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredInstalledPackage(pkgName: string): string[] {
  if (typeof window === "undefined") return [];
  const existing = getStoredInstalledPackages();
  if (existing.includes(pkgName)) return existing;
  const updated = [...existing, pkgName];
  try {
    localStorage.setItem(INSTALLED_PACKAGES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to persist package to localStorage:", e);
  }
  return updated;
}

export function removeStoredInstalledPackage(pkgName: string): string[] {
  if (typeof window === "undefined") return [];
  const existing = getStoredInstalledPackages();
  const updated = existing.filter((p) => p !== pkgName);
  try {
    localStorage.setItem(INSTALLED_PACKAGES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to remove package from localStorage:", e);
  }
  return updated;
}

/**
 * Loads all persistently saved packages into an active Pyodide instance.
 * Uses the shared install logic (Pyodide-built first, micropip fallback,
 * import verified) so a package that can no longer install is reported
 * instead of silently skipped — and is NOT removed from storage, so the
 * user can retry it from the Modules panel.
 */
export async function restoreStoredPackages(
  pyodide: any,
  onProgress?: (pkg: string, status: "loading" | "done" | "error", error?: string) => void
) {
  if (!pyodide) return;
  const packages = getStoredInstalledPackages();
  if (packages.length === 0) return;

  const { installPackageInto, withTimeout } = await import("./pyodide-install");
  for (const pkg of packages) {
    onProgress?.(pkg, "loading");
    // One stalled wheel download used to hang the whole editor init
    // forever (no timeout anywhere in this path) — the runtime never
    // became ready and every Install click waited on the same stuck
    // promise. Cap each package at 90s and move on to the next one;
    // a package that times out stays in storage and can be retried
    // from the Modules panel.
    let result: Awaited<ReturnType<typeof installPackageInto>>;
    try {
      result = await withTimeout(
        installPackageInto(pyodide, pkg),
        90_000,
        `Timed out loading '${pkg}' (90s) — check your connection and retry from the Modules panel.`
      );
    } catch (err: unknown) {
      result = {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
    if (result.ok) {
      onProgress?.(pkg, "done");
    } else {
      onProgress?.(pkg, "error", result.error);
    }
  }
}

