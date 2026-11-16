"use client";

import { useEffect, useMemo, useState } from "react";
import { PYTHON_STDLIB_MODULES } from "@/lib/stdlib-data";
import { PYODIDE_PACKAGES } from "@/lib/pyodide-packages";
import {
  MICROPIP_PACKAGES,
  PYODIDE_DESCRIPTIONS,
} from "@/lib/external-packages";
import { installPackageInto } from "@/lib/pyodide-install";
import {
  getStoredInstalledPackages,
  removeStoredInstalledPackage,
  saveStoredInstalledPackage,
} from "@/lib/package-storage";
import {
  Check,
  Download,
  ExternalLink,
  Info,
  Loader2,
  Package,
  Search,
  Trash2,
} from "lucide-react";

interface PyPiInfo {
  name: string;
  version: string;
  summary: string;
  author: string;
  license: string;
  home_page: string;
}

interface ExternalEntry {
  name: string;
  desc: string;
  category: string;
  source: "pyodide" | "micropip";
}

// The full external list: every Pyodide-built package (254, from the
// 0.27.2 lock file) plus the curated pure-Python PyPI packages that are
// NOT in Pyodide and install via micropip. The old hardcoded list of
// 15 is gone — that was why users only ever saw 15 packages.
// Anything on PyPI beyond this list is still installable by exact name
// in the "Live PyPI Search & Install" tab.
const ALL_EXTERNAL: ExternalEntry[] = [
  ...PYODIDE_PACKAGES.map((name): ExternalEntry => ({
    name,
    desc:
      PYODIDE_DESCRIPTIONS[name] ??
      "Pyodide-built package — installs fast from the CDN, ready to import.",
    category: "Pyodide",
    source: "pyodide",
  })),
  ...MICROPIP_PACKAGES.map((pkg): ExternalEntry => ({
    name: pkg.name,
    desc: pkg.desc,
    category: pkg.category,
    source: "micropip",
  })),
];

interface ModulesPanelProps {
  /** The editor's shared Pyodide instance (same ref the editor uses). */
  pyodideRef: { current: any };
  /** Loads the editor's Pyodide runtime if needed; true when ready.
   * `onStage` reports each init step (which CDN is being tried,
   * timeouts, success) so the progress bar shows real progress. */
  ensurePyodide: (onStage?: (stage: string) => void) => Promise<boolean>;
}

export function ModulesPanel({ pyodideRef, ensurePyodide }: ModulesPanelProps) {
  const [activeTab, setActiveTab] = useState<"stdlib" | "external" | "search">("stdlib");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [installedList, setInstalledList] = useState<string[]>([]);
  const [installingMap, setInstallingMap] = useState<Record<string, boolean>>({});
  // Progress bars shown inside the Terminal Logs card while installs
  // run — one bar per package, so two installs at once don't hide
  // each other. Stage-based, not byte-based: Pyodide's loadPackage
  // exposes no download progress, so the bar marks the install
  // stages (runtime → download → verify → done) and pulses while a
  // download is in flight, so a slow network reads as "working",
  // not "stuck". A finished bar stays until the next install starts.
  const [installProgress, setInstallProgress] = useState<
    Record<string, { stage: string; pct: number }>
  >({});
  const [logs, setLogs] = useState<string[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  // Elapsed-time ticker for the progress bars: the user kept asking
  // "5 min hogaye?" because nothing showed how long an install had
  // been running. Ticks once a second while any install is active.
  // Per package, not shared: a shared start time survived a crashed
  // install and made the NEXT attempt show 1193s at once (2026-11-16).
  const [installStartedAt, setInstallStartedAt] = useState<Record<string, number>>({});
  const [now, setNow] = useState(() => Date.now());
  const anyInstalling = Object.values(installingMap).some(Boolean);
  useEffect(() => {
    if (!anyInstalling) {
      setInstallStartedAt({});
      return;
    }
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [anyInstalling]);

  // External tab: search + source filter + install-by-name.
  const [externalQuery, setExternalQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "pyodide" | "micropip">("all");
  const [installByName, setInstallByName] = useState("");

  // PyPI live search
  const [pypiQuery, setPypiQuery] = useState("");
  const [pypiSearching, setPypiSearching] = useState(false);
  const [pypiResult, setPypiResult] = useState<PyPiInfo | null>(null);
  const [pypiError, setPypiError] = useState<string | null>(null);

  // Load persistently installed packages from localStorage on mount
  useEffect(() => {
    const saved = getStoredInstalledPackages();
    setInstalledList(saved);
  }, []);

  function addLog(msg: string) {
    setLogs((prev) => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  async function installPackage(pkgName: string) {
    const clean = pkgName.trim().toLowerCase();
    if (!clean) return;
    setLastError(null);
    // Mark installing FIRST — the runtime load is a one-time ~15 MB
    // download that takes a while, and until now the button showed
    // nothing during it: every click just logged "not ready yet" again
    // and the user could not tell loading from broken. The spinner
    // (installingMap) now covers the whole ensure + install flow, and
    // repeat clicks are blocked while it runs.
    setInstallingMap((prev) => ({ ...prev, [clean]: true }));
    setInstallStartedAt((prev) => ({ ...prev, [clean]: Date.now() }));
    // A new install replaces any finished (100%) bars, keeping the
    // card to the installs actually running.
    setInstallProgress((prev) => {
      const next: Record<string, { stage: string; pct: number }> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (v.pct < 100) next[k] = v;
      }
      return next;
    });
    if (!pyodideRef.current) {
      setInstallProgress((prev) => ({
        ...prev,
        [clean]: { stage: "Starting Python runtime…", pct: 10 },
      }));
      addLog("Starting Python runtime — one-time download (~15 MB), please wait…");
      // The init reports each step (which CDN, timeouts, success) so
      // the bar shows WHERE a slow load is stuck instead of a frozen
      // "Starting Python runtime…" at 10%. Never let ensurePyodide
      // throw out of here: a joining install used to crash when the
      // shared init failed, leaving its button stuck on
      // "Installing…" with a frozen bar and a polluted timer.
      let ready = false;
      let ensureError: string | null = null;
      try {
        ready = await ensurePyodide((stage) => {
          const pct = stage.startsWith("Downloading runtime")
            ? 15
            : stage.includes("timed out") || stage.includes("trying the next CDN")
              ? 20
              : stage === "Loading micropip…"
                ? 25
                : stage === "Python runtime ready" || stage.startsWith("Runtime loaded")
                  ? 30
                  : 10;
          setInstallProgress((prev) => ({
            ...prev,
            [clean]: { stage, pct },
          }));
          if (
            stage.includes("timed out") ||
            stage.startsWith("Runtime loaded") ||
            stage.includes("did not load")
          ) {
            addLog(stage);
          }
        });
      } catch (err) {
        ensureError = err instanceof Error ? err.message : String(err);
      }
      if (!ready) {
        const msg = ensureError
          ? `Python environment could not start: ${ensureError}`
          : "Python environment could not start (the Pyodide script did not load). Check your connection and try again — the Install button will retry.";
        addLog(msg);
        setLastError(msg);
        setInstallProgress((prev) => {
          const next = { ...prev };
          delete next[clean];
          return next;
        });
        setInstallingMap((prev) => ({ ...prev, [clean]: false }));
        setInstallStartedAt((prev) => {
          const next = { ...prev };
          delete next[clean];
          return next;
        });
        return;
      }
      setInstallProgress((prev) => ({
        ...prev,
        [clean]: { stage: "Python runtime ready", pct: 30 },
      }));
      addLog("Python runtime ready.");
    }

    setInstallProgress((prev) => ({
      ...prev,
      [clean]: { stage: `Downloading '${clean}'…`, pct: 55 },
    }));
    addLog(`Installing '${clean}'…`);

    const result = await installPackageInto(pyodideRef.current, clean);
    if (result.ok) {
      const updated = saveStoredInstalledPackage(clean);
      setInstalledList(updated);
      setInstallProgress((prev) => ({
        ...prev,
        [clean]: { stage: `Installed '${clean}' ✓`, pct: 100 },
      }));
      addLog(
        `✓ Installed '${clean}' via ${result.method} (import ${result.importName} works). Saved in workspace storage.`
      );
    } else {
      setInstallProgress((prev) => {
        const next = { ...prev };
        delete next[clean];
        return next;
      });
      addLog(`✗ Failed to install '${clean}': ${result.error}`);
      setLastError(result.error);
    }
    setInstallingMap((prev) => ({ ...prev, [clean]: false }));
    setInstallStartedAt((prev) => {
      const next = { ...prev };
      delete next[clean];
      return next;
    });
  }

  function uninstallPackage(pkgName: string) {
    if (pyodideRef.current) {
      try {
        pyodideRef.current.runPython(`
import sys
if '${pkgName}' in sys.modules:
    del sys.modules['${pkgName}']
`);
      } catch {}
    }
    const updated = removeStoredInstalledPackage(pkgName);
    setInstalledList(updated);
    addLog(`Uninstalled and removed '${pkgName}' from workspace.`);
  }

  async function handlePyPiSearch(e: React.FormEvent) {
    e.preventDefault();
    const clean = pypiQuery.trim();
    if (!clean) return;
    setPypiSearching(true);
    setPypiError(null);
    setPypiResult(null);

    try {
      const res = await fetch(`/api/pypi?name=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Package not found on PyPI");
      setPypiResult(data);
    } catch (err: unknown) {
      setPypiError(err instanceof Error ? err.message : "Error querying PyPI");
    } finally {
      setPypiSearching(false);
    }
  }

  const categories = ["All", ...Array.from(new Set(PYTHON_STDLIB_MODULES.map((m) => m.category)))];

  const filteredStdlib = PYTHON_STDLIB_MODULES.filter((m) => {
    if (categoryFilter !== "All" && m.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredExternal = useMemo(() => {
    const q = externalQuery.trim().toLowerCase();
    return ALL_EXTERNAL.filter((pkg) => {
      if (sourceFilter !== "all" && pkg.source !== sourceFilter) return false;
      if (!q) return true;
      return (
        pkg.name.toLowerCase().includes(q) ||
        pkg.desc.toLowerCase().includes(q) ||
        pkg.category.toLowerCase().includes(q)
      );
    });
  }, [externalQuery, sourceFilter]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Package className="h-5 w-5" /> Python Modules & Packages Manager
        </h1>
        <p className="mt-1 text-xs text-neutral-400">
          Browse Python&apos;s complete official standard library and search/install all PyPI & Pyodide external packages in your workspace.
        </p>
      </div>

      {/* Tab Selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex gap-1.5 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950 p-1 text-xs">
          <button
            onClick={() => setActiveTab("stdlib")}
            className={`shrink-0 whitespace-nowrap rounded-md px-3.5 py-1.5 font-medium transition ${
              activeTab === "stdlib" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            Built-in Standard Library ({PYTHON_STDLIB_MODULES.length})
          </button>
          <button
            onClick={() => setActiveTab("external")}
            className={`shrink-0 whitespace-nowrap rounded-md px-3.5 py-1.5 font-medium transition ${
              activeTab === "external" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            External Packages ({ALL_EXTERNAL.length})
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`shrink-0 whitespace-nowrap rounded-md px-3.5 py-1.5 font-medium transition ${
              activeTab === "search" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            Live PyPI Search & Install
          </button>
        </div>

        {activeTab === "stdlib" && (
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Filter built-in modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none sm:w-56"
            />
          </div>
        )}
      </div>

      {lastError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs leading-relaxed text-red-200">
          {lastError}
        </div>
      )}

      {/* TAB 1: Complete Built-in Standard Library */}
      {activeTab === "stdlib" && (
        <div className="space-y-4">
          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition border ${
                  categoryFilter === cat
                    ? "border-white bg-white text-black font-semibold"
                    : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStdlib.map((mod) => (
              <div
                key={mod.name}
                className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-3.5 hover:border-neutral-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-white">
                      {mod.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                      {mod.category}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                    {mod.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                    <Check className="h-3.5 w-3.5 text-white" /> Built-in (Always ready)
                  </span>
                  <a
                    href={mod.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-400 hover:text-white text-xs inline-flex items-center gap-1"
                  >
                    Docs <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: All External Packages (Pyodide-built + PyPI micropip) */}
      {activeTab === "external" && (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-neutral-400">
            {PYODIDE_PACKAGES.length} Pyodide-built packages (install fast from the CDN) +{" "}
            {MICROPIP_PACKAGES.length} popular pure-Python PyPI packages (install via micropip).{" "}
            {installedList.length > 0 && (
              <span className="text-white font-medium">{installedList.length} installed in this workspace.</span>
            )}{" "}
            Anything else on PyPI can still be installed by exact name in the Live PyPI Search tab.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search all packages — e.g. numpy, flask, seaborn, opencv…"
                value={externalQuery}
                onChange={(e) => setExternalQuery(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
              />
            </div>
            <div className="flex gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 p-1 text-xs">
              {(["all", "pyodide", "micropip"] as const).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSourceFilter(src)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition ${
                    sourceFilter === src ? "bg-white text-black" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {src === "all" ? "All" : src === "pyodide" ? "Pyodide" : "PyPI (micropip)"}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              installPackage(installByName);
              setInstallByName("");
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Install any package by name — e.g. tabulate"
              value={installByName}
              onChange={(e) => setInstallByName(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!installByName.trim()}
              className="shrink-0 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition disabled:opacity-50"
            >
              Install
            </button>
          </form>

          <p className="text-[11px] text-neutral-500">
            Showing {filteredExternal.length} of {ALL_EXTERNAL.length} packages.
            {filteredExternal.length === 0 && " No match — try the Live PyPI Search tab for an exact package name."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExternal.map((pkg) => {
              const isInstalled = installedList.includes(pkg.name);
              const isInstalling = installingMap[pkg.name];
              return (
                <div
                  key={pkg.name}
                  className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-3.5 hover:border-neutral-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-white truncate">
                        {pkg.name}
                      </span>
                      <span className="shrink-0 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-white">
                        {pkg.source === "pyodide" ? "Pyodide" : "PyPI / micropip"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                      {pkg.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center justify-between">
                    {isInstalled ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="inline-flex items-center gap-1 text-[11px] text-white font-medium">
                          <Check className="h-3.5 w-3.5" /> Installed
                        </span>
                        <button
                          type="button"
                          onClick={() => uninstallPackage(pkg.name)}
                          className="inline-flex items-center gap-1 rounded border border-neutral-800 bg-black px-2 py-1 text-[10px] text-neutral-400 hover:text-red-400 hover:border-red-900 transition"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => installPackage(pkg.name)}
                        disabled={isInstalling}
                        className="ml-auto inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition disabled:opacity-50"
                      >
                        {isInstalling ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" /> Installing...
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3" /> Install Package
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Live PyPI Search and Install Any Package */}
      {activeTab === "search" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <Search className="h-4 w-4" /> Search the Official Python Package Index (PyPI)
            </h2>
            <form onSubmit={handlePyPiSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. rich, requests, sympy, tabulate, httpx, textstat"
                value={pypiQuery}
                onChange={(e) => setPypiQuery(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={pypiSearching}
                className="shrink-0 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {pypiSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                Search PyPI
              </button>
            </form>

            {pypiError && (
              <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs text-red-200">
                {pypiError}
              </div>
            )}

            {pypiResult && (
              <div className="mt-4 rounded-xl border border-neutral-800 bg-black p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-base font-bold text-white">
                      {pypiResult.name}
                    </span>{" "}
                    <span className="text-xs text-neutral-400 font-mono">v{pypiResult.version}</span>
                  </div>
                  {installedList.includes(pypiResult.name.toLowerCase()) ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <Check className="h-4 w-4" /> Installed in Workspace
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => installPackage(pypiResult.name)}
                      disabled={installingMap[pypiResult.name.toLowerCase()]}
                      className="rounded-md bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {installingMap[pypiResult.name.toLowerCase()] ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Installing...
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" /> Install {pypiResult.name}
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                  {pypiResult.summary}
                </p>

                <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-neutral-400 border-t border-neutral-900 pt-3">
                  <span>License: <strong className="text-neutral-200">{pypiResult.license}</strong></span>
                  <span>Author: <strong className="text-neutral-200">{pypiResult.author}</strong></span>
                  <a
                    href={pypiResult.home_page}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white underline inline-flex items-center gap-1"
                  >
                    Project Homepage <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Activity Logs */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5 mb-2">
          <Info className="h-3.5 w-3.5" /> Package Engine Terminal Logs
        </span>
        {Object.entries(installProgress).map(([pkg, progress]) => (
          <div className="mb-3" key={pkg}>
            <div className="flex justify-between text-[11px] font-mono text-neutral-300 mb-1">
              <span>
                {pkg} — {progress.stage}
                {installingMap[pkg] && installStartedAt[pkg]
                  ? ` · ${Math.max(0, Math.floor((now - installStartedAt[pkg]) / 1000))}s`
                  : ""}
              </span>
              <span>{progress.pct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
              <div
                className={`h-full rounded-full bg-emerald-500 transition-all duration-500 ${
                  progress.pct < 100 ? "animate-pulse" : ""
                }`}
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </div>
        ))}
        <pre className="max-h-36 overflow-auto bg-black p-3 rounded-lg font-mono text-[11px] text-neutral-400 whitespace-pre-wrap">
          {logs.length > 0 ? logs.join("\n") : "Python environment ready. Install any package to load it into your workspace."}
        </pre>
      </div>
    </div>
  );
}
