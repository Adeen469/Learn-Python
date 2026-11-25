// Editor extensions: installable file viewers (Maalik's Extensions
// tab in the Explorer). Pure catalog + routing helpers; the install
// state lives in localStorage (per-browser, like BYOK keys) so the
// catalog panel and the editor pane always agree. The catalog names
// and descriptions are product data in English (like course and
// package names); only the chrome around them (tab label, Install /
// Installed / Uninstall, viewer errors) is translated.
//
// This module has no runtime imports on purpose: the test suite
// imports it directly (Node type-stripping cannot resolve
// extensionless TS imports, and tsc forbids explicit `.ts` imports
// here) — so the tiny guarded localStorage read lives here instead
// of coming from editor-utils.
//
// Per-user scope (Fix C, Maalik 2026-11-25): the repo a user opened
// is namespaced by their email, like the workspace tree. The editor
// page sets the scope once the session resolves (setEditorScope);
// until then the legacy bare key is read. That is safe: the viewer
// only uses the repo for files that carry a sha, and repo files
// only exist in a scoped workspace tree — a fresh user has none.
let editorScope: string | null = null;

/** Set the per-user scope — the signed-in user's email. */
export function setEditorScope(scope: string): void {
  editorScope = scope.toLowerCase();
}

function openRepoKey(): string {
  return editorScope ? `lp_open_repo_current::${editorScope}` : "lp_open_repo_current";
}
function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export type ExtensionKind = "pdf" | "excel" | "word" | "image" | "video" | "audio";

export interface EditorExtension {
  id: string;
  name: string;
  description: string;
  kind: ExtensionKind;
  /** Lowercase extensions, no dot — every common format of its kind. */
  formats: string[];
}

export const EDITOR_EXTENSIONS: EditorExtension[] = [
  {
    id: "pdf-viewer",
    name: "PDF Viewer",
    description: "Open PDF documents right in the editor.",
    kind: "pdf",
    formats: ["pdf"],
  },
  {
    id: "excel-viewer",
    name: "Excel Viewer",
    description: "View spreadsheets as tables.",
    kind: "excel",
    formats: ["xlsx", "xls", "csv"],
  },
  {
    id: "word-viewer",
    name: "Word Viewer",
    description: "Read Word documents as formatted text.",
    kind: "word",
    formats: ["docx"],
  },
  {
    id: "image-viewer",
    name: "Image Viewer",
    description: "Preview images of all formats.",
    kind: "image",
    formats: ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico", "avif"],
  },
  {
    id: "video-player",
    name: "Video Player",
    description: "Play videos of all formats.",
    kind: "video",
    formats: ["mp4", "webm", "mkv", "mov", "avi", "m4v"],
  },
  {
    id: "audio-player",
    name: "Audio Player",
    description: "Play audio of all formats.",
    kind: "audio",
    formats: ["mp3", "wav", "ogg", "flac", "m4a", "aac"],
  },
];

export const EXTENSIONS_STORAGE_KEY = "lp_editor_extensions";
export const EXTENSIONS_CHANGED_EVENT = "lp:extensions-changed";

function fileExtension(path: string | undefined | null): string {
  if (!path) return "";
  const base = path.split("/").pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "";
  return base.slice(dot + 1).toLowerCase();
}

/** The extension that handles this file, if any (installed or not). */
export function extensionForFile(path: string | undefined | null): EditorExtension | null {
  const ext = fileExtension(path);
  if (!ext) return null;
  return EDITOR_EXTENSIONS.find((e) => e.formats.includes(ext)) ?? null;
}

/** Installed extension ids (unknown ids from older storage are dropped). */
export function readInstalledExtensions(): string[] {
  const stored = readStoredJson<string[]>(EXTENSIONS_STORAGE_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored.filter(
    (id): id is string =>
      typeof id === "string" && EDITOR_EXTENSIONS.some((e) => e.id === id)
  );
}

/** Pure list update: add or remove one id, no duplicates. */
export function toggleExtensionId(ids: string[], id: string, on: boolean): string[] {
  const next = ids.filter((x) => x !== id);
  if (on) next.push(id);
  return next;
}

/** Persist an install/uninstall and tell every listener (same tab +
    other tabs via the storage event the browser fires itself). */
export function setExtensionInstalled(id: string, on: boolean): string[] {
  const next = toggleExtensionId(readInstalledExtensions(), id, on);
  try {
    localStorage.setItem(EXTENSIONS_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  try {
    window.dispatchEvent(new Event(EXTENSIONS_CHANGED_EVENT));
  } catch {}
  return next;
}

/** Which viewer handles this file — only when its extension is
    installed. Null means today's behaviour (Monaco text editor). */
export function viewerKindForFile(
  path: string | undefined | null,
  installedIds: string[]
): ExtensionKind | null {
  const ext = extensionForFile(path);
  if (!ext || !installedIds.includes(ext.id)) return null;
  return ext.kind;
}

/** Drop blob: URLs when restoring a workspace from storage: a
    blob: URL only lives in the session that created it, so a
    persisted one is dead by definition. data: URLs (if any) are
    durable and stay. */
export function stripTransientBlobUrls<T extends { blobUrl?: string }>(items: T[]): T[] {
  return items.map((it) =>
    it.blobUrl?.startsWith("blob:") ? { ...it, blobUrl: undefined } : it
  );
}

/** The open repo, as the repo hook persists it (owner/name + branch)
    — the viewer builds its binary file URL from it, no page prop
    needed. Read from the signed-in user's scoped key (set via
    setEditorScope); falls back to the legacy bare key for a repo
    opened before scoping shipped. */
export function readOpenRepo(): { repo: string; branch: string } | null {
  try {
    const raw = localStorage.getItem(openRepoKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { repo?: unknown; branch?: unknown };
    if (parsed && typeof parsed.repo === "string" && typeof parsed.branch === "string") {
      return { repo: parsed.repo, branch: parsed.branch };
    }
    return null;
  } catch {
    return null;
  }
}

/** Binary file URL for a repo file: the repo-file API streams the
    raw bytes (same token, SHA and size checks as the text read). */
export function repoBinaryFileUrl(
  repo: string,
  branch: string,
  path: string,
  sha: string
): string {
  const [owner, name] = repo.split("/");
  return (
    `/api/github/repo-file?owner=${encodeURIComponent(owner)}` +
    `&repo=${encodeURIComponent(name)}` +
    `&sha=${encodeURIComponent(sha)}` +
    `&path=${encodeURIComponent(path)}` +
    `&branch=${encodeURIComponent(branch)}&binary=1`
  );
}
