"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { AppNavbar } from "@/components/AppNavbar";
import { PYTHON_STDLIB_MODULES, type StdlibModule } from "@/lib/stdlib-data";
import {
  getStoredInstalledPackages,
  removeStoredInstalledPackage,
  restoreStoredPackages,
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

const TOP_PYPI_PACKAGES = [
  { name: "numpy", desc: "Scientific computing, N-dimensional arrays, linear algebra" },
  { name: "pandas", desc: "Fast, flexible data analysis and manipulation structures" },
  { name: "matplotlib", desc: "Comprehensive 2D plotting and data visualization" },
  { name: "scipy", desc: "Algorithms for mathematics, science, and engineering" },
  { name: "sympy", desc: "Computer algebra and symbolic mathematics system" },
  { name: "scikit-learn", desc: "Machine learning algorithms for classification & regression" },
  { name: "regex", desc: "Alternative regular expression module supporting full Unicode" },
  { name: "requests", desc: "Elegant and simple HTTP library for Python" },
  { name: "beautifulsoup4", desc: "Screen-scraping library for HTML/XML documents" },
  { name: "pytest", desc: "Mature full-featured Python testing tool" },
  { name: "rich", desc: "Rich text and beautiful formatting in the terminal" },
  { name: "networkx", desc: "Creation, manipulation, and study of complex networks" },
  { name: "jinja2", desc: "Fast, expressive, and extensible template engine" },
  { name: "pyyaml", desc: "Full-featured YAML parser and emitter for Python" },
  { name: "pillow", desc: "Python Imaging Library (PIL fork) for opening and saving images" },
];

export default function ModulesPage() {
  const [pyodideReady, setPyodideReady] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState(false);
  const [activeTab, setActiveTab] = useState<"stdlib" | "external" | "search">("stdlib");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [installedList, setInstalledList] = useState<string[]>([]);
  const [installingMap, setInstallingMap] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<string[]>([]);

  // PyPI live search
  const [pypiQuery, setPypiQuery] = useState("");
  const [pypiSearching, setPypiSearching] = useState(false);
  const [pypiResult, setPypiResult] = useState<PyPiInfo | null>(null);
  const [pypiError, setPypiError] = useState<string | null>(null);

  const pyodideRef = useRef<any>(null);

  // Load persistently installed packages from localStorage on mount
  useEffect(() => {
    const saved = getStoredInstalledPackages();
    setInstalledList(saved);
  }, []);

  async function initPyodide() {
    if (pyodideRef.current || !window.loadPyodide) return;
    setLoadingEngine(true);
    try {
      const pyodide = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/",
      });
      await pyodide.loadPackage("micropip");
      pyodideRef.current = pyodide;
      setPyodideReady(true);
      addLog("Pyodide 0.27.2 and micropip package manager loaded.");

      // Restore all persistently installed packages
      await restoreStoredPackages(pyodide, (pkg, status, error) => {
        if (status === "loading") addLog(`Restoring persistent package '${pkg}'...`);
        if (status === "done") addLog(`✓ Loaded '${pkg}'`);
        if (status === "error") addLog(`✗ Failed restoring '${pkg}': ${error}`);
      });
    } catch (e: unknown) {
      addLog(`Failed to initialize: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoadingEngine(false);
    }
  }

  function addLog(msg: string) {
    setLogs((prev) => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  async function installPackage(pkgName: string) {
    if (!pyodideRef.current) {
      addLog("Initializing Python environment...");
      await initPyodide();
      if (!pyodideRef.current) return;
    }

    setInstallingMap((prev) => ({ ...prev, [pkgName]: true }));
    addLog(`Installing package '${pkgName}' via Pyodide / Micropip...`);

    try {
      const py = pyodideRef.current;
      try {
        await py.loadPackage(pkgName);
      } catch {
        await py.runPythonAsync(`
import micropip
await micropip.install('${pkgName}')
`);
      }

      const updated = saveStoredInstalledPackage(pkgName);
      setInstalledList(updated);
      addLog(`✓ Successfully installed '${pkgName}'. Now saved in workspace storage!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`✗ Failed to install '${pkgName}': ${msg}`);
    } finally {
      setInstallingMap((prev) => ({ ...prev, [pkgName]: false }));
    }
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js"
        onLoad={initPyodide}
      />
      <AppNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col gap-5">
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
          <div className="flex gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 p-1 text-xs">
            <button
              onClick={() => setActiveTab("stdlib")}
              className={`rounded-md px-3.5 py-1.5 font-medium transition ${
                activeTab === "stdlib" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              Built-in Standard Library ({PYTHON_STDLIB_MODULES.length})
            </button>
            <button
              onClick={() => setActiveTab("external")}
              className={`rounded-md px-3.5 py-1.5 font-medium transition ${
                activeTab === "external" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              Popular External Packages ({TOP_PYPI_PACKAGES.length})
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`rounded-md px-3.5 py-1.5 font-medium transition ${
                activeTab === "search" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              Live PyPI Search & Install
            </button>
          </div>

          {activeTab === "stdlib" && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Filter built-in modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 rounded-lg border border-neutral-800 bg-neutral-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
              />
            </div>
          )}
        </div>

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

        {/* TAB 2: Popular External Packages */}
        {activeTab === "external" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {TOP_PYPI_PACKAGES.map((pkg) => {
              const isInstalled = installedList.includes(pkg.name);
              const isInstalling = installingMap[pkg.name];
              return (
                <div
                  key={pkg.name}
                  className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-3.5 hover:border-neutral-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-white">
                        {pkg.name}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-white">
                        PyPI / WASM
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
                  className="flex-1 rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={pypiSearching}
                  className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition disabled:opacity-50 flex items-center gap-1.5"
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
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-base font-bold text-white">
                        {pypiResult.name}
                      </span>{" "}
                      <span className="text-xs text-neutral-400 font-mono">v{pypiResult.version}</span>
                    </div>
                    {installedList.includes(pypiResult.name) ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <Check className="h-4 w-4" /> Installed in Workspace
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => installPackage(pypiResult.name)}
                        disabled={installingMap[pypiResult.name]}
                        className="rounded-md bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {installingMap[pypiResult.name] ? (
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
          <pre className="max-h-36 overflow-auto bg-black p-3 rounded-lg font-mono text-[11px] text-neutral-400 whitespace-pre-wrap">
            {logs.length > 0 ? logs.join("\n") : "Python environment ready. Install any package to load it into your workspace."}
          </pre>
        </div>
      </main>
    </div>
  );
}
