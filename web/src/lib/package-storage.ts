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
 */
export async function restoreStoredPackages(
  pyodide: any,
  onProgress?: (pkg: string, status: "loading" | "done" | "error", error?: string) => void
) {
  if (!pyodide) return;
  const packages = getStoredInstalledPackages();
  if (packages.length === 0) return;

  for (const pkg of packages) {
    try {
      onProgress?.(pkg, "loading");
      try {
        await pyodide.loadPackage(pkg);
      } catch {
        // Fallback to micropip for pure Python packages
        await pyodide.runPythonAsync(`
import micropip
await micropip.install('${pkg}')
`);
      }
      onProgress?.(pkg, "done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onProgress?.(pkg, "error", msg);
    }
  }
}

