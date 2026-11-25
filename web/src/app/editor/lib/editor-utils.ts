// Pure / localStorage-only editor helpers, moved verbatim from
// web/src/app/editor/page.tsx (editor split). No React state lives
// here — the page imports these and keeps the state itself.
// (The BYOK store helpers stay in page.tsx: their AiByok* types are
// local to the page and the r3c tests pin them there.)
import type { WorkspaceItem } from "./editor-types";

export function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

// Build workspace items from a repo's file tree (GitHub page
// handoff): one folder item per folder, before its children — the
// same order DEFAULT_WORKSPACE uses. Files start lazy (empty
// content, sha kept) and load when they are opened.
export function buildRepoWorkspaceTree(files: { path: string; size: number; sha: string }[]): WorkspaceItem[] {
  const items: WorkspaceItem[] = [];
  const folders = new Set<string>();
  files.forEach((f, i) => {
    const parts = f.path.split("/");
    let acc = "";
    for (const part of parts.slice(0, -1)) {
      acc = acc ? `${acc}/${part}` : part;
      if (!folders.has(acc)) {
        folders.add(acc);
        items.push({ id: `f-repo-dir-${acc}`, name: part, path: acc, type: "folder" });
      }
    }
    items.push({
      id: `f-repo-${i}`,
      name: parts[parts.length - 1],
      path: f.path,
      type: "file",
      content: "",
      isSaved: true,
      lazy: true,
      sha: f.sha,
    });
  });
  return items;
}

export const DEFAULT_WORKSPACE: WorkspaceItem[] = [
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

// Monaco language id for a file path, by extension. The editor shows
// one file at a time, so the language follows the open file — a .py
// file gets Python, .html gets HTML, and so on. Unknown or missing
// extensions fall back to plaintext (no highlighting, and never the
// wrong language's highlighting).
const EXTENSION_LANGUAGES: Record<string, string> = {
  py: "python",
  html: "html",
  htm: "html",
  css: "css",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  md: "markdown",
  txt: "plaintext",
  xml: "xml",
  yml: "yaml",
  yaml: "yaml",
  sh: "shell",
  sql: "sql",
  java: "java",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  go: "go",
  rs: "rust",
  rb: "ruby",
  php: "php",
};

export function languageForFile(path: string | undefined | null): string {
  if (!path) return "plaintext";
  const base = path.split("/").pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "plaintext";
  const ext = base.slice(dot + 1).toLowerCase();
  return EXTENSION_LANGUAGES[ext] ?? "plaintext";
}

// Parse a Pyodide run error into an editor marker. The failing line
// comes from a `File "<exec>", line N` frame (the code runs without
// a filename); the message is the exception's line, e.g.
// "NameError: name 'x' is not defined". Takes the innermost
// user-code frame when there are several. The trailing
// "Traceback (most recent call last):" line Pyodide appends is not
// the message — it is skipped when picking it.
export function parsePythonError(msg: string): { line: number; message: string } | null {
  if (!msg) return null;
  const frames = [...msg.matchAll(/File "<exec>", line (\d+)/g)];
  if (frames.length === 0) return null;
  const line = Number(frames[frames.length - 1][1]);
  if (!Number.isFinite(line) || line < 1) return null;
  const lines = msg
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && l !== "Traceback (most recent call last):");
  const message = lines.length > 0 ? lines[lines.length - 1] : "Error";
  return { line, message };
}

// Parse Python warning lines out of captured run output. The warnings
// module prints `<exec>:N: Category: message` (the same "<exec>"
// filename as the error frames). Only that exact form is trusted;
// anything else is left in the terminal, never marked.
export function parsePythonWarnings(output: string): { line: number; message: string }[] {
  if (!output) return [];
  const seen = new Set<string>();
  const out: { line: number; message: string }[] = [];
  for (const raw of output.split("\n")) {
    const m = /^<exec>:(\d+): ([A-Za-z_][A-Za-z0-9_]*Warning): (.*)$/.exec(raw.trim());
    if (!m) continue;
    const line = Number(m[1]);
    if (!Number.isFinite(line) || line < 1) continue;
    const message = `${m[2]}: ${m[3]}`.trim();
    const key = `${line}:${message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ line, message });
  }
  return out;
}
