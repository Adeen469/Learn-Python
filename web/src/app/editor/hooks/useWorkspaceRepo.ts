// The workspace + repo layer: which repo is open, lazy file loading,
// workspace persistence (state + localStorage + Pyodide FS), and the
// save functions. Moved verbatim from web/src/app/editor/page.tsx
// (F1 split) — no behaviour change.
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { buildRepoWorkspaceTree, DEFAULT_WORKSPACE } from "@/app/editor/lib/editor-utils";
import type { WorkspaceItem } from "@/app/editor/lib/editor-types";
import type { usePyodideEngine } from "@/app/editor/hooks/usePyodideEngine";

type Engine = ReturnType<typeof usePyodideEngine>;

export function useWorkspaceRepo(args: {
  items: WorkspaceItem[];
  setItems: Dispatch<SetStateAction<WorkspaceItem[]>>;
  activeFilePath: string;
  setActiveFilePath: Dispatch<SetStateAction<string>>;
  activeFile: WorkspaceItem | undefined;
  engine: Engine;
  setOutput: Dispatch<SetStateAction<string>>;
  setNeedsSaveWarning: Dispatch<SetStateAction<string | null>>;
}) {
  const {
    items, setItems, activeFilePath, setActiveFilePath, activeFile,
    engine, setOutput, setNeedsSaveWarning,
  } = args;
  // Which repo the open workspace belongs to (null = the user's own
  // workspace). Restored on reload from lp_open_repo_current so lazy
  // files keep working after a refresh.
  const [openRepoState, setOpenRepoState] = useState<{ repo: string; branch: string } | null>(null);
  // Success toast after a repo opens: repo name + file count.
  // The tree is what loads here — file contents load lazily when
  // each file is opened, so the toast fires on the tree load, not
  // on every file. It dismisses itself after 5 seconds.
  const [repoLoadedToast, setRepoLoadedToast] = useState<{ repo: string; count: number } | null>(null);
  useEffect(() => {
    if (!repoLoadedToast) return;
    const timer = setTimeout(() => setRepoLoadedToast(null), 5000);
    return () => clearTimeout(timer);
  }, [repoLoadedToast]);
  // Which file's content is being fetched right now (lazy load) —
  // the editor shows a circular spinner for exactly this file.
  // Instant switches (content already in memory) fetch nothing,
  // so no spinner ever shows for them.
  const [loadingFilePath, setLoadingFilePath] = useState<string | null>(null);
  // Files changed since the repo was opened (edits, new files, renames,
  // duplicates, drops) — the Push button commits exactly these, one
  // commit per file through /api/github/batch-commit (one request for
  // the whole push, chunked when needed; the server still makes one
  // commit per file). Saving to the browser is not pushing to GitHub:
  // the set only clears for files a push actually sent (or when a
  // different repo opens / the backup is restored).
  const changedRepoPathsRef = useRef<Set<string>>(new Set());
  const [changedRepoCount, setChangedRepoCount] = useState(0);
  function markRepoChanged(path: string) {
    if (!openRepoState) return;
    if (changedRepoPathsRef.current.has(path)) return;
    changedRepoPathsRef.current.add(path);
    setChangedRepoCount(changedRepoPathsRef.current.size);
  }
  function clearRepoChanged() {
    changedRepoPathsRef.current.clear();
    setChangedRepoCount(0);
  }
  // Paths the repo had when it was opened — a changed path missing
  // here is a new file, so the commit-message AI can tell adds
  // apart from updates.
  const repoTreePathsRef = useRef<Set<string>>(new Set());
  // Fresh mirror of the workspace for the lazy loader (lets it check
  // whether the file is still untouched before overwriting it).
  const itemsRef = useRef<WorkspaceItem[]>(DEFAULT_WORKSPACE);
  useEffect(() => {
    itemsRef.current = items;
  });
  // Whether the too-big-for-storage warning has been printed once.
  const persistWarnedRef = useRef(false);

  // Fetch a repo's file tree and open it as the workspace, like
  // GitHub's code view. Files load lazily when opened (see the
  // effect below) — the tree itself is the only thing fetched here.
  async function loadRepoTree(fullName: string) {
    // The server resolves the caller's stored GitHub token from
    // the session (migration 006) — no token leaves this browser.
    const [owner, name] = fullName.split("/");
    try {
      const res = await fetch(
        `/api/github/repo-tree?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(name)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load the repo");
      if (!data.files || data.files.length === 0) {
        setOutput((prev) => prev + `[${fullName} has no files to open in the editor.]\n`);
        return;
      }
      const repoItems = buildRepoWorkspaceTree(data.files);
      setItems(repoItems);
      clearRepoChanged();
      repoTreePathsRef.current = new Set(data.files.map((f: { path: string }) => f.path));
      try {
        localStorage.setItem(
          "lp_open_repo_current",
          JSON.stringify({ repo: data.repo, branch: data.branch })
        );
      } catch {}
      setOpenRepoState({ repo: data.repo, branch: data.branch });
      setRepoLoadedToast({ repo: data.repo, count: data.files.length });
      const firstFile = repoItems.find((p: WorkspaceItem) => p.type === "file");
      if (firstFile) setActiveFilePath(firstFile.path);
      setOutput((prev) => prev + `[Opened ${data.repo} in the editor — ${data.files.length} files. Click a file to load it. Previous workspace backed up, restore it from File → Restore previous workspace.]\n`);
    } catch (err: unknown) {
      setOutput((prev) => prev + `[Could not open ${fullName}: ${err instanceof Error ? err.message : String(err)}]\n`);
    }
  }

  // Whether a pre-repo workspace backup exists (File → Restore).
  const [hasWorkspaceBackup, setHasWorkspaceBackup] = useState(false);

  // Load from localStorage, plus the "Try it" handoff: a lesson code
  // block stores its snippet in sessionStorage (lp_try_it_code) and
  // links here — open it as try-it.py so the user's workspace files
  // are untouched and the snippet is the active file.
  useEffect(() => {
    const saved = localStorage.getItem("lp_workspace_tree");
    let base = DEFAULT_WORKSPACE;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) base = parsed;
      } catch {}
    }
    // A repo opened earlier (reload): its files may still be lazy —
    // restore which repo they belong to so clicking one loads it.
    let restoredRepo: { repo: string; branch: string } | null = null;
    try {
      const raw = localStorage.getItem("lp_open_repo_current");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.repo === "string" && typeof parsed.branch === "string") {
          setOpenRepoState(parsed);
          restoredRepo = parsed;
        }
      }
    } catch {}
    // Repo handoff: the GitHub page stores just the repo's name in
    // sessionStorage (lp_open_repo) — the tree is fetched here, and
    // each file loads lazily when opened. The workspace being left
    // is backed up first (File → Restore previous workspace brings
    // it back).
    let openRepoName: string | null = null;
    try {
      const raw = sessionStorage.getItem("lp_open_repo");
      if (raw !== null) {
        sessionStorage.removeItem("lp_open_repo");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.repo === "string") {
          openRepoName = parsed.repo;
        }
      }
    } catch {}
    if (openRepoName) {
      try {
        localStorage.setItem("lp_workspace_tree_backup", JSON.stringify(base));
        setHasWorkspaceBackup(true);
      } catch {}
      setOutput((prev) => prev + `[Opening ${openRepoName}...]\n`);
      void loadRepoTree(openRepoName);
      return;
    }
    // Refresh-restore (no fresh handoff): the tree came back from
    // localStorage, so loadRepoTree — and its toast — never ran.
    // Fire it here so the user still sees "repo loaded" once the
    // files are back. Only when the saved workspace actually holds
    // repo files (they carry a sha; a plain workspace has none).
    if (restoredRepo) {
      const repoFileCount = base.filter(
        (p: WorkspaceItem) => p.type === "file" && p.sha
      ).length;
      if (repoFileCount > 0) {
        setRepoLoadedToast({ repo: restoredRepo.repo, count: repoFileCount });
      }
    }
    let tryCode: string | null = null;
    try {
      tryCode = sessionStorage.getItem("lp_try_it_code");
      if (tryCode !== null) sessionStorage.removeItem("lp_try_it_code");
    } catch {}
    if (tryCode !== null) {
      const tryFile: WorkspaceItem = {
        id: "f-try-it",
        name: "try-it.py",
        path: "try-it.py",
        type: "file",
        content: tryCode,
        isSaved: false,
      };
      setItems([tryFile, ...base.filter((p: WorkspaceItem) => p.path !== "try-it.py")]);
      setActiveFilePath("try-it.py");
      return;
    }
    if (saved) {
      setItems(base);
      const firstFile = base.find((p: WorkspaceItem) => p.type === "file");
      if (firstFile) setActiveFilePath(firstFile.path);
    }
  }, []);

  // Lazy file loading: a repo file's content arrives only when the
  // file is opened. The lazy flag is the real guard (the ref only
  // stops a second fetch while one is in flight); if the user typed
  // into the empty file while it was loading, their text wins and
  // the fetch result is dropped.
  const loadingFileRef = useRef<string | null>(null);
  useEffect(() => {
    if (!openRepoState || !activeFile || !activeFile.lazy || !activeFile.sha) return;
    const path = activeFile.path;
    const sha = activeFile.sha;
    if (loadingFileRef.current === path) return;
    loadingFileRef.current = path;
    setLoadingFilePath(path);
    // The server resolves the caller's stored GitHub token from
    // the session (migration 006) — no token leaves this browser.
    const [owner, name] = openRepoState.repo.split("/");
    fetch(
      `/api/github/repo-file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(name)}&sha=${encodeURIComponent(sha)}&path=${encodeURIComponent(path)}&branch=${encodeURIComponent(openRepoState.branch)}`
    )
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Could not load file");
        }
        return res.text();
      })
      .then((content) => {
        const current = itemsRef.current.find((it) => it.path === path);
        if (!current || !current.lazy || current.content) return;
        const next = itemsRef.current.map((it) =>
          it.path === path ? { ...it, content, lazy: false, isSaved: true } : it
        );
        persistWorkspace(next);
      })
      .catch((err: unknown) => {
        setOutput((prev) => prev + `[Could not load ${path}: ${err instanceof Error ? err.message : String(err)}]\n`);
      })
      .finally(() => {
        // Only clear when this fetch is still the latest one — a
        // newer file clicked mid-flight already owns the ref and
        // the spinner, and must not lose either to this one.
        if (loadingFileRef.current === path) {
          loadingFileRef.current = null;
          setLoadingFilePath(null);
        }
      });
  }, [activeFile, openRepoState]);

  function handleEditorChange(value: string | undefined) {
    if (!activeFile) return;
    setNeedsSaveWarning(null);
    markRepoChanged(activeFile.path);
    setItems((prev) =>
      prev.map((it) =>
        it.path === activeFile.path ? { ...it, content: value ?? "", isSaved: false } : it
      )
    );
  }

  // Persist the workspace: state + localStorage + the Pyodide virtual
  // filesystem, in one place, so every mutation (save, rename, delete,
  // duplicate, move, create) keeps all three in sync. The storage
  // write can fail when a lazily opened repo grows past the browser's
  // ~5 MB — then the session keeps working (state + Pyodide still
  // update) and the failure is noted once instead of crashing.
  function persistWorkspace(next: WorkspaceItem[]): boolean {
    setItems(next);
    let stored = true;
    try {
      localStorage.setItem("lp_workspace_tree", JSON.stringify(next));
    } catch {
      stored = false;
      if (!persistWarnedRef.current) {
        persistWarnedRef.current = true;
        setOutput((prev) => prev + "[Workspace is too big for the browser's storage — changes are kept for this session only.]\n");
      }
    }
    engine.syncAllFilesToPyodide(next);
    return stored;
  }

  // Restore the workspace that was backed up when a repo was opened
  // in the editor (File → Restore previous workspace).
  // Returns true when a backup was actually restored.
  function restoreWorkspaceBackup(): boolean {
    try {
      const raw = localStorage.getItem("lp_workspace_tree_backup");
      if (!raw) return false;
      const parsed = JSON.parse(raw) as WorkspaceItem[];
      if (!Array.isArray(parsed) || parsed.length === 0) return false;
      persistWorkspace(parsed);
      const firstFile = parsed.find((p) => p.type === "file");
      if (firstFile) setActiveFilePath(firstFile.path);
      localStorage.removeItem("lp_workspace_tree_backup");
      localStorage.removeItem("lp_open_repo_current");
      setOpenRepoState(null);
      clearRepoChanged();
      repoTreePathsRef.current.clear();
      setHasWorkspaceBackup(false);
      setOutput((prev) => prev + "[Restored your previous workspace.]\n");
      return true;
    } catch {
      return false;
    }
  }

  // Exit the open repo: back to the workspace that was there before
  // the repo opened — or the default workspace when there is no
  // backup. Always clears lp_open_repo_current, so a refresh does
  // NOT reopen the repo (yehi wajah hai ki refresh ke baad repo se
  // bahar nikalne ka button kaam nahi karta tha: openRepoState
  // wapas aa jata tha, par hasWorkspaceBackup false reh jata tha).
  // NOTE: backup ko localStorage se seedha check karte hain, state
  // se nahi — refresh ke baad bhi backup mil jata hai.
  function exitRepo() {
    if (!openRepoState) return;
    const repo = openRepoState.repo;
    if (!restoreWorkspaceBackup()) {
      // No backup (fresh workspace, ya backup pehle hi use ho chuka):
      // default workspace par wapas.
      persistWorkspace(DEFAULT_WORKSPACE);
      setActiveFilePath("main.py");
      localStorage.removeItem("lp_open_repo_current");
      setOpenRepoState(null);
      clearRepoChanged();
      repoTreePathsRef.current.clear();
      setHasWorkspaceBackup(false);
      setOutput((prev) => prev + `[Exited ${repo} — back to your workspace.]\n`);
    }
  }

  function saveCurrentFile() {
    if (!activeFile) return;
    const updated = items.map((it) =>
      it.path === activeFile.path ? { ...it, isSaved: true } : it
    );
    persistWorkspace(updated);
    setNeedsSaveWarning(null);
    setOutput((prev) => prev + `[Saved '${activeFile.path}']\n`);
  }

  // Silent save (used by Auto Save): no terminal spam — the status bar
  // and the file's saved-dot already show that it saved.
  function saveFileSilently(path: string) {
    const updated = items.map((it) =>
      it.path === path ? { ...it, isSaved: true } : it
    );
    persistWorkspace(updated);
  }

  function saveAllFiles() {
    const updated = items.map((it) =>
      it.type === "file" && !it.isSaved ? { ...it, isSaved: true } : it
    );
    persistWorkspace(updated);
    setNeedsSaveWarning(null);
  }
  return {
    openRepoState, repoLoadedToast, setRepoLoadedToast,
    loadingFilePath,
    changedRepoPathsRef, changedRepoCount, setChangedRepoCount,
    markRepoChanged, repoTreePathsRef, itemsRef, hasWorkspaceBackup,
    handleEditorChange, persistWorkspace, restoreWorkspaceBackup,
    exitRepo,
    saveCurrentFile, saveFileSilently, saveAllFiles,
  };
}
