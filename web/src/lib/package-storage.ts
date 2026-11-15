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

  const { installPackageInto } = await import("./pyodide-install");
  for (const pkg of packages) {
    onProgress?.(pkg, "loading");
    const result = await installPackageInto(pyodide, pkg);
    if (result.ok) {
      onProgress?.(pkg, "done");
    } else {
      onProgress?.(pkg, "error", result.error);
    }
  }
}

