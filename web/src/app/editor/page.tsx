"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Editor from "@monaco-editor/react";
import { AppNavbar } from "@/components/AppNavbar";
import { restoreStoredPackages } from "@/lib/package-storage";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  FileCode,
  Folder,
  FolderPlus,
  GripVertical,
  Loader2,
  Play,
  Plus,
  Save,
  Terminal,
  Trash2,
  UploadCloud,
} from "lucide-react";

export interface WorkspaceItem {
  id: string;
  name: string;
  path: string; // e.g. "main.py" or "utils/math_helpers.py"
  type: "file" | "folder";
  content?: string;
  isSaved?: boolean;
}

const DEFAULT_WORKSPACE: WorkspaceItem[] = [
  {
    id: "f-root-main",
    name: "main.py",
    path: "main.py",
    type: "file",
    isSaved: true,
    content: `# Welcome to LP Python IDE
# Real Monaco Code Editor with syntax highlighting, auto-complete & minimap.
# Constraint: Save file before compiling/running!

import sys
import math
from utils.math_helpers import quadratic_roots

print("Python WebAssembly Engine:", sys.version.split()[0])

roots = quadratic_roots(1, -7, 12)
print("Roots of x^2 - 7x + 12 = 0 are:", roots)

for i in range(1, 6):
    print(f"Cube of {i} is {i**3}")
`,
  },
  {
    id: "folder-utils",
    name: "utils",
    path: "utils",
    type: "folder",
  },
  {
    id: "f-utils-init",
    name: "__init__.py",
    path: "utils/__init__.py",
    type: "file",
    isSaved: true,
    content: ``,
  },
  {
    id: "f-utils-math",
    name: "math_helpers.py",
    path: "utils/math_helpers.py",
    type: "file",
    isSaved: true,
    content: `import math

def quadratic_roots(a, b, c):
    disc = b**2 - 4*a*c
    if disc < 0:
        return None
    return ((-b + math.sqrt(disc)) / (2*a), (-b - math.sqrt(disc)) / (2*a))
`,
  },
];

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
  }
}

export default function CodeEditorPage() {
  const [items, setItems] = useState<WorkspaceItem[]>(DEFAULT_WORKSPACE);
  const [activeFilePath, setActiveFilePath] = useState<string>("main.py");
  const [output, setOutput] = useState<string>("Ready. Write or edit code, click 'Save', then 'Compile & Run'.\n");
  const [isRunning, setIsRunning] = useState(false);
  const [needsSaveWarning, setNeedsSaveWarning] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ utils: true });

  // Creation dialogs
  const [newFileInput, setNewFileInput] = useState("");
  const [newFolderInput, setNewFolderInput] = useState("");
  const [showNewFile, setShowNewFile] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);

  // Drag and drop states
  const [draggedItemPath, setDraggedItemPath] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [isExternalDragOver, setIsExternalDragOver] = useState(false);

  const pyodideRef = useRef<any>(null);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState(false);

  const activeFile =
    items.find((it) => it.type === "file" && it.path === activeFilePath) ||
    items.find((it) => it.type === "file");

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
      setOutput((prev) => prev + "✓ Python runtime (Pyodide 0.27.2) loaded successfully.\n");

      // Auto-load all packages installed on the Modules page
      await restoreStoredPackages(pyodide, (pkg, status, error) => {
        if (status === "loading") setOutput((prev) => prev + `[Loading installed package '${pkg}'...]\n`);
        if (status === "done") setOutput((prev) => prev + `[Package '${pkg}' ready]\n`);
        if (status === "error") setOutput((prev) => prev + `[Failed loading '${pkg}': ${error}]\n`);
      });
    } catch (err: unknown) {
      setOutput((prev) => prev + `✗ Failed to load runtime: ${err instanceof Error ? err.message : String(err)}\n`);
    } finally {
      setLoadingEngine(false);
    }
  }

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lp_workspace_tree");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          const firstFile = parsed.find((p: WorkspaceItem) => p.type === "file");
          if (firstFile) setActiveFilePath(firstFile.path);
        }
      } catch {}
    }
  }, []);

  function handleEditorChange(value: string | undefined) {
    if (!activeFile) return;
    setNeedsSaveWarning(null);
    setItems((prev) =>
      prev.map((it) =>
        it.path === activeFile.path ? { ...it, content: value ?? "", isSaved: false } : it
      )
    );
  }

  function saveCurrentFile() {
    if (!activeFile) return;
    const updated = items.map((it) =>
      it.path === activeFile.path ? { ...it, isSaved: true } : it
    );
    setItems(updated);
    localStorage.setItem("lp_workspace_tree", JSON.stringify(updated));
    setNeedsSaveWarning(null);
    syncAllFilesToPyodide(updated);
    setOutput((prev) => prev + `[Saved '${activeFile.path}']\n`);
  }

  function syncAllFilesToPyodide(workspaceItems: WorkspaceItem[]) {
    if (!pyodideRef.current) return;
    const py = pyodideRef.current;
    try {
      const folders = workspaceItems.filter((i) => i.type === "folder");
      for (const f of folders) {
        try {
          py.FS.mkdirTree(f.path);
        } catch {}
      }
      const files = workspaceItems.filter((i) => i.type === "file");
      for (const f of files) {
        try {
          const parts = f.path.split("/");
          if (parts.length > 1) {
            const dir = parts.slice(0, -1).join("/");
            try {
              py.FS.mkdirTree(dir);
            } catch {}
          }
          py.FS.writeFile(f.path, f.content ?? "");
        } catch (e) {
          console.warn("FS write:", e);
        }
      }
    } catch (e) {
      console.warn("Pyodide sync error:", e);
    }
  }

  function handleAddFile(e: React.FormEvent) {
    e.preventDefault();
    const clean = newFileInput.trim();
    if (!clean) return;
    const normalized = clean.endsWith(".py") ? clean : `${clean}.py`;
    if (items.some((i) => i.path === normalized)) {
      alert("A file with this path already exists");
      return;
    }
    const newFile: WorkspaceItem = {
      id: "f-" + Date.now(),
      name: normalized.split("/").pop()!,
      path: normalized,
      type: "file",
      isSaved: true,
      content: `# ${normalized}\n`,
    };
    const next = [...items, newFile];
    setItems(next);
    setActiveFilePath(normalized);
    setNewFileInput("");
    setShowNewFile(false);
    localStorage.setItem("lp_workspace_tree", JSON.stringify(next));
  }

  function handleAddFolder(e: React.FormEvent) {
    e.preventDefault();
    const clean = newFolderInput.trim().replace(/\/+$/, "");
    if (!clean) return;
    if (items.some((i) => i.path === clean)) {
      alert("A folder with this name already exists");
      return;
    }
    const newFolder: WorkspaceItem = {
      id: "folder-" + Date.now(),
      name: clean.split("/").pop()!,
      path: clean,
      type: "folder",
    };
    const next = [...items, newFolder];
    setItems(next);
    setExpandedFolders((prev) => ({ ...prev, [clean]: true }));
    setNewFolderInput("");
    setShowNewFolder(false);
    localStorage.setItem("lp_workspace_tree", JSON.stringify(next));
  }

  function handleDeleteItem(item: WorkspaceItem) {
    if (items.filter((i) => i.type === "file").length <= 1 && item.type === "file") {
      alert("You must keep at least one file in the workspace.");
      return;
    }
    const next = items.filter((i) => i.path !== item.path && !i.path.startsWith(item.path + "/"));
    setItems(next);
    if (activeFile?.path === item.path) {
      const remainingFile = next.find((i) => i.type === "file");
      if (remainingFile) setActiveFilePath(remainingFile.path);
    }
    localStorage.setItem("lp_workspace_tree", JSON.stringify(next));
  }

  // --- Drag and Drop: Internal moving between folders ---
  function handleDragStart(e: React.DragEvent, item: WorkspaceItem) {
    e.dataTransfer.setData("text/plain", item.path);
    setDraggedItemPath(item.path);
  }

  function handleDragOverFolder(e: React.DragEvent, targetFolderPath: string | "root") {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(targetFolderPath);
  }

  function handleDropOnTarget(e: React.DragEvent, targetFolderPath: string | "root") {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);

    const sourcePath = e.dataTransfer.getData("text/plain") || draggedItemPath;
    if (!sourcePath) return;

    const sourceItem = items.find((i) => i.path === sourcePath);
    if (!sourceItem) return;

    // Can't drop folder into itself or its own subfolder
    if (sourceItem.type === "folder" && (targetFolderPath === sourceItem.path || targetFolderPath.startsWith(sourceItem.path + "/"))) {
      return;
    }

    const itemName = sourceItem.name;
    const newPath = targetFolderPath === "root" ? itemName : `${targetFolderPath}/${itemName}`;

    if (newPath === sourceItem.path) return;

    if (items.some((i) => i.path === newPath)) {
      alert(`An item named '${itemName}' already exists in that location.`);
      return;
    }

    const updated = items.map((it) => {
      if (it.path === sourceItem.path) {
        return { ...it, path: newPath, isSaved: false };
      }
      if (sourceItem.type === "folder" && it.path.startsWith(sourceItem.path + "/")) {
        const subRelative = it.path.slice(sourceItem.path.length + 1);
        return { ...it, path: `${newPath}/${subRelative}`, isSaved: false };
      }
      return it;
    });

    setItems(updated);
    if (activeFilePath === sourceItem.path) {
      setActiveFilePath(newPath);
    }
    if (targetFolderPath !== "root") {
      setExpandedFolders((p) => ({ ...p, [targetFolderPath]: true }));
    }
    localStorage.setItem("lp_workspace_tree", JSON.stringify(updated));
    setDraggedItemPath(null);
    setOutput((prev) => prev + `[Moved '${sourceItem.name}' to ${targetFolderPath === "root" ? "root" : targetFolderPath}]\n`);
  }

  // --- Drag and Drop: External File Upload from user's Desktop/OS ---
  async function handleExternalDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsExternalDragOver(false);

    const filesList = e.dataTransfer.files;
    if (!filesList || filesList.length === 0) return;

    const newItems: WorkspaceItem[] = [];
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const text = await file.text();
      const fileName = file.name;

      if (!items.some((it) => it.path === fileName)) {
        newItems.push({
          id: "f-drop-" + Date.now() + "-" + i,
          name: fileName,
          path: fileName,
          type: "file",
          content: text,
          isSaved: true,
        });
      }
    }

    if (newItems.length > 0) {
      const merged = [...items, ...newItems];
      setItems(merged);
      setActiveFilePath(newItems[0].path);
      localStorage.setItem("lp_workspace_tree", JSON.stringify(merged));
      setOutput((prev) => prev + `[Imported ${newItems.length} file(s) via drag & drop]\n`);
    }
  }

  async function compileAndRun() {
    if (!activeFile) return;

    if (!activeFile.isSaved) {
      setNeedsSaveWarning(`Please save '${activeFile.path}' before compiling/running.`);
      return;
    }

    if (!pyodideRef.current) {
      setOutput((prev) => prev + "Python runtime is loading, please wait...\n");
      await initPyodide();
      if (!pyodideRef.current) return;
    }

    setIsRunning(true);
    setNeedsSaveWarning(null);
    setOutput(`=== Executing ${activeFile.path} ===\n`);

    try {
      const py = pyodideRef.current;
      syncAllFilesToPyodide(items);

      py.runPython(`
import sys
import io
class LPOutputBuffer(io.StringIO):
    pass
sys.stdout = LPOutputBuffer()
sys.stderr = sys.stdout
`);

      await py.runPythonAsync(activeFile.content ?? "");

      const captured = py.runPython("sys.stdout.getvalue()");
      setOutput((prev) => prev + (captured || "(Execution completed with no output)\n") + "\n=== Finished (Exit 0) ===\n");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutput((prev) => prev + `\nTraceback (most recent call last):\n${msg}\n=== Execution Failed ===\n`);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js"
        onLoad={initPyodide}
      />
      <AppNavbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 flex flex-col gap-3">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5 min-w-0">
              <FileCode className="h-4 w-4 text-white shrink-0" />
              Active: <span className="text-white font-mono truncate">{activeFile?.path ?? "None"}</span>
              {activeFile && !activeFile.isSaved && (
                <span className="text-amber-400 font-sans text-xs ml-1">(unsaved*)</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveCurrentFile}
              disabled={!activeFile}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium border transition ${
                activeFile?.isSaved
                  ? "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                  : "border-white bg-white text-black font-semibold animate-pulse"
              }`}
            >
              {activeFile?.isSaved ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" /> Saved
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save File (Required)
                </>
              )}
            </button>

            <button
              type="button"
              onClick={compileAndRun}
              disabled={isRunning || loadingEngine}
              className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Compiling...
                </>
              ) : loadingEngine ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading Engine
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-black" /> Compile & Run
                </>
              )}
            </button>
          </div>
        </div>

        {/* Warning banner */}
        {needsSaveWarning && (
          <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span>{needsSaveWarning}</span>
            </div>
            <button
              type="button"
              onClick={saveCurrentFile}
              className="underline font-semibold hover:text-white ml-3"
            >
              Save Now
            </button>
          </div>
        )}

        {/* 3-Column Layout: File Tree Explorer | Monaco Editor | Output Console */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 min-h-[620px]">
          {/* Column 1: Workspace Folder Tree Explorer with Drag & Drop (3 cols) */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsExternalDragOver(true);
            }}
            onDragLeave={() => setIsExternalDragOver(false)}
            onDrop={handleExternalDrop}
            className={`max-h-[340px] md:col-span-3 md:max-h-none rounded-xl border flex flex-col overflow-hidden transition relative ${
              isExternalDragOver
                ? "border-white bg-neutral-900 ring-2 ring-white/20"
                : "border-neutral-800 bg-neutral-950"
            }`}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2 bg-black/60">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-neutral-300" /> Explorer
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowNewFile(!showNewFile)}
                  title="New File"
                  className="rounded p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewFolder(!showNewFolder)}
                  title="New Folder"
                  className="rounded p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Inline create inputs */}
            {showNewFile && (
              <form onSubmit={handleAddFile} className="p-2 border-b border-neutral-800 bg-black">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. script.py or utils/helper.py"
                  value={newFileInput}
                  onChange={(e) => setNewFileInput(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs font-mono text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                />
              </form>
            )}

            {showNewFolder && (
              <form onSubmit={handleAddFolder} className="p-2 border-b border-neutral-800 bg-black">
                <input
                  type="text"
                  autoFocus
                  placeholder="folder name, e.g. tests"
                  value={newFolderInput}
                  onChange={(e) => setNewFolderInput(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs font-mono text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                />
              </form>
            )}

            {/* Root Drop Zone */}
            <div
              onDragOver={(e) => handleDragOverFolder(e, "root")}
              onDragLeave={() => setDragOverTarget(null)}
              onDrop={(e) => handleDropOnTarget(e, "root")}
              className={`px-3 py-1 text-[10px] uppercase font-mono tracking-wider transition ${
                dragOverTarget === "root"
                  ? "bg-white text-black font-semibold rounded mx-2 my-1"
                  : "text-neutral-600"
              }`}
            >
              Workspace Root (drop here to move out)
            </div>

            {/* Tree Items */}
            <div className="flex-1 overflow-auto p-2 space-y-1">
              {items.map((item) => {
                const isFolder = item.type === "folder";
                const depth = item.path.split("/").length - 1;
                const isSelected = activeFilePath === item.path;
                const isDragOver = dragOverTarget === item.path;

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={(e) => {
                      if (isFolder) handleDragOverFolder(e, item.path);
                    }}
                    onDragLeave={() => {
                      if (isFolder) setDragOverTarget(null);
                    }}
                    onDrop={(e) => {
                      if (isFolder) handleDropOnTarget(e, item.path);
                    }}
                    style={{ paddingLeft: `${depth * 14 + 6}px` }}
                    className={`group flex items-center justify-between rounded-md py-1 pr-1.5 text-xs font-mono transition cursor-grab active:cursor-grabbing border ${
                      isDragOver && isFolder
                        ? "border-white bg-neutral-800 text-white ring-1 ring-white"
                        : isSelected && !isFolder
                        ? "border-neutral-700 bg-neutral-800 text-white font-semibold"
                        : "border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                      <GripVertical className="h-3 w-3 text-neutral-600 opacity-0 group-hover:opacity-100 shrink-0 cursor-grab" />
                      <button
                        type="button"
                        onClick={() => {
                          if (!isFolder) {
                            setActiveFilePath(item.path);
                            setNeedsSaveWarning(null);
                          } else {
                            setExpandedFolders((p) => ({ ...p, [item.path]: !p[item.path] }));
                          }
                        }}
                        className="flex items-center gap-1.5 min-w-0 flex-1 truncate text-left"
                      >
                        {isFolder ? (
                          <>
                            {expandedFolders[item.path] ? (
                              <ChevronDown className="h-3 w-3 shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 shrink-0" />
                            )}
                            <Folder className="h-3.5 w-3.5 text-neutral-300 shrink-0" />
                          </>
                        ) : (
                          <FileCode className="h-3.5 w-3.5 text-neutral-300 shrink-0" />
                        )}
                        <span className="truncate">{item.name}</span>
                        {!isFolder && !item.isSaved && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title="Unsaved" />
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-red-400 p-0.5 ml-1"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Drag & Drop Hint */}
            <div className="border-t border-neutral-900 p-2.5 text-center text-[10px] text-neutral-500 flex items-center justify-center gap-1.5">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Drag files here from your computer</span>
            </div>
          </div>

          {/* Column 2: Real Monaco Code Editor (6 cols) */}
          <div className="min-h-[420px] sm:min-h-[480px] md:col-span-6 md:min-h-0 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 bg-black/60">
              <span className="text-xs font-mono text-neutral-300 flex items-center gap-2 min-w-0">
                <FileCode className="h-3.5 w-3.5 text-white shrink-0" />
                <span className="truncate">{activeFile?.path} {!activeFile?.isSaved && "(unsaved*)"}</span>
              </span>
              <span className="hidden text-[11px] text-neutral-500 font-mono sm:inline shrink-0 ml-2">
                Python 3.12 (WASM) • Monaco Editor
              </span>
            </div>

            <div className="flex-1 w-full relative">
              <Editor
                height="100%"
                language="python"
                theme="vs-dark"
                value={activeFile?.content ?? ""}
                onChange={handleEditorChange}
                options={{
                  fontSize: 13,
                  lineNumbers: "on",
                  minimap: { enabled: true, side: "right" },
                  quickSuggestions: true,
                  suggestOnTriggerCharacters: true,
                  parameterHints: { enabled: true },
                  folding: true,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  tabSize: 4,
                  insertSpaces: true,
                  renderWhitespace: "selection",
                  wordWrap: "on",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
              />
            </div>
          </div>

          {/* Column 3: Terminal Output / Compiler Logs (3 cols) */}
          <div className="min-h-[180px] md:col-span-3 md:min-h-0 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-800 px-3.5 py-2 bg-black/60">
              <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-white" /> Terminal Logs
              </span>
              <button
                type="button"
                onClick={() => setOutput("")}
                className="text-[11px] text-neutral-500 hover:text-white transition"
              >
                Clear
              </button>
            </div>
            <pre className="flex-1 w-full bg-black p-3.5 font-mono text-xs text-neutral-300 overflow-auto whitespace-pre-wrap selection:bg-neutral-800">
              {output}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
