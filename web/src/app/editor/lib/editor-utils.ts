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
