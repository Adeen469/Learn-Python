"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { type BranchedMenuItem } from "@/components/BranchedMenu";
import { EditorContextMenu, type ContextMenuItem } from "@/components/EditorContextMenu";
import { EditorMenuBar, type EditorMenu } from "@/components/EditorMenuBar";
import { EditorSplitter } from "@/components/EditorSplitter";
import { ModulesPanel } from "@/components/ModulesPanel";
import { fetchSessionUser } from "@/lib/auth-client";
import SignInGate from "@/components/SignInGate";
import { useLanguage } from "@/lib/i18n";
import {
  THEME_CHANGED_EVENT,
  getStoredTheme,
} from "@/lib/theme";
import {
  PENDING_OPEN_FILE_KEY,
  VOICE_EDITOR_DONE_EVENT,
  VOICE_EDITOR_EVENT,
} from "@/lib/tutor-commands";
import { restoreStoredPackages } from "@/lib/package-storage";
import { loadPyodideRuntime, withTimeout } from "@/lib/pyodide-install";
import {
  AlertCircle,
  Check,
  FileCode,
  Folder,
  History,
  Loader2,
  Package,
  Pin,
  Save,
  Settings,
  Sparkles,
  Terminal,
  UploadCloud,
  X,
} from "lucide-react";
import type {
  AiChat,
  AiChatMessage,
  AiPanelView,
  CentreView,
  PanelId,
  PanelZone,
  WorkspaceItem,
} from "@/app/editor/lib/editor-types";
import {
  DEFAULT_WORKSPACE,
  newId,
  readLocalJson,
  writeLocalJson,
} from "@/app/editor/lib/editor-utils";
import { setEditorScope } from "@/app/editor/lib/editor-extensions";
import { usePyodideEngine } from "@/app/editor/hooks/usePyodideEngine";
import { useEditorAi } from "@/app/editor/hooks/useEditorAi";
import { useWorkspaceRepo } from "@/app/editor/hooks/useWorkspaceRepo";
import { useDockPanels } from "@/app/editor/hooks/useDockPanels";
import { buildContextMenuItems, buildEditorMenus, type EditorContextMenuState } from "@/app/editor/lib/editor-menus";
import { AiSettingsCard } from "@/app/editor/components/AiSettingsCard";
import { TerminalPanel } from "@/app/editor/components/TerminalPanel";
import { EditorPanel } from "@/app/editor/components/EditorPanel";
import { AiPanel } from "@/app/editor/components/AiPanel";
import { ExplorerPanel } from "@/app/editor/components/ExplorerPanel";
import { PushDialog } from "@/app/editor/components/PushDialog";
import { extensionForFile } from "@/app/editor/lib/editor-extensions";
import { deleteDroppedFile, saveDroppedFile } from "@/app/editor/lib/dropped-files";

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
  }
}

export default function CodeEditorPage() {
  const [editorTheme, setEditorTheme] = useState<"lp-dark" | "lp-light">(() =>
    typeof window === "undefined" || getStoredTheme() === "dark" ? "lp-dark" : "lp-light"
  );

  // Follow the theme toggle (Settings → Appearance) live.
  useEffect(() => {
    const sync = () => {
      setEditorTheme(getStoredTheme() === "light" ? "lp-light" : "lp-dark");
    };
    window.addEventListener(THEME_CHANGED_EVENT, sync);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, sync);
  }, []);
  const router = useRouter();
  const { t } = useLanguage();
  const [items, setItems] = useState<WorkspaceItem[]>(DEFAULT_WORKSPACE);
  const [activeFilePath, setActiveFilePath] = useState<string>("main.py");

  const activeFile =
    items.find((it) => it.type === "file" && it.path === activeFilePath) ||
    items.find((it) => it.type === "file");

  // Auth gate: a guest sees the sign-in gate screen (warning +
  // Sign in button), not a silent bounce to the landing page.
  // Renders nothing until the session check resolves — no app UI
  // flash, and no editor content for guests.
  const [enteredChecked, setEnteredChecked] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetchSessionUser().then((user) => {
      if (cancelled) return;
      if (!user) {
        setIsGuest(true);
        setEnteredChecked(true);
        return;
      }
      // Per-user (Fix C): the open-repo read in the viewer uses
      // this scope. The workspace/AI restore effects resolve the
      // same user via ensureEditorScope (same cached /api/auth/me
      // call), so the two scopes always agree.
      setEditorScope(user.email);
      setEnteredChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  // "Files | Modules" tabs — Modules lives INSIDE the editor now, not on a
  // separate page. /modules redirects here with ?tab=modules.
  const [editorTab, setEditorTab] = useState<"files" | "modules">("files");
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "modules") setEditorTab("modules");
  }, []);

  function switchTab(tab: "files" | "modules") {
    setEditorTab(tab);
    const url = tab === "modules" ? "/editor?tab=modules" : "/editor";
    window.history.replaceState(null, "", url);
  }
  const [output, setOutput] = useState<string>("Ready. Write or edit code, then 'Compile & Run'.\n");

  // AI panel state (chat, BYOK, models) — see hooks/useEditorAi.ts.
  const ai = useEditorAi({ t, activeFile });
  const {
    aiMessages, aiThinking, aiThoughtSeconds, setAiThoughtSeconds, aiError,
    aiView, setAiView, centreView, setCentreView,
    setSettingsSection, aiMenuOpen, setAiMenuOpen,
    aiChats, AI_PANEL_MODELS, byokPayloadFor,
    sendAiMessage, stopAi, clearAiChat,
    startNewChat, loadAiChat, deleteAiChat,
    aiDocContext, setAiDocContext,
  } = ai;

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

  // --- VS Code-style redesign: menu bar, context menus, auto-save,
  // Format, resizable panels (wabepp: web-only actions here; anything
  // needing the OS lives in the native APK / Tauri EXE, not the site).
  // Auto Save: on by default, persisted; an edit auto-saves after a
  // short debounce instead of waiting for the Save button.
  const [autoSave, setAutoSave] = useState<boolean>(() =>
    typeof window === "undefined" ||
    window.localStorage.getItem("lp_editor_autosave") !== "off"
  );
  // Right-click / long-press context menu: position + target.
  const [contextMenu, setContextMenu] = useState<EditorContextMenuState>(null);
  // Inline rename: the item being renamed + its input value.
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");
  // Resizable panels (Explorer left, Terminal bottom): widths in px,
  // persisted; drag a splitter to resize, double-click to reset.
  const [explorerWidth, setExplorerWidth] = useState<number>(() => {
    if (typeof window === "undefined") return 280;
    const v = Number(window.localStorage.getItem("lp_editor_explorer_w"));
    return Number.isFinite(v) && v >= 200 && v <= 480 ? v : 280;
  });
  const [terminalWidth, setTerminalWidth] = useState<number>(() => {
    if (typeof window === "undefined") return 320;
    const v = Number(window.localStorage.getItem("lp_editor_terminal_w"));
    return Number.isFinite(v) && v >= 240 && v <= 560 ? v : 320;
  });
  const editorRef = useRef<any>(null);
  // Monaco namespace (set in EditorPanel's beforeMount) — the page
  // needs it for run markers (setModelMarkers).
  const monacoRef = useRef<any>(null);
  // Dockable-panel layout — see hooks/useDockPanels.ts.
  const dock = useDockPanels({ editorRef });
  const {
    showExplorer, setShowExplorer, showTerminal, setShowTerminal,
    showAi, setShowAi, panelZones, setPanelZones,
    draggingPanel, setDraggingPanel, dropZone, setDropZone, dockRef,
    bottomHeight, setBottomHeight,
    isPanelVisible, setPanelVisible, movePanelToZone,
  } = dock;
  // Monaco editor instance (Undo / Redo / Find + cursor position for
  // the status bar) and the >>> terminal input (Focus Terminal).
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const terminalInputRef = useRef<HTMLInputElement | null>(null);


  // Pyodide runtime engine (loading, Compile & Run, terminal,
  // engine.formatting) — see hooks/usePyodideEngine.ts.
  const engine = usePyodideEngine({
    items,
    activeFile,
    setItems,
    setActiveFilePath,
    setNeedsSaveWarning,
    setOutput,
    t,
  });

  // Open tabs in the bottom bar (VS Code-style): one per file the user
  // opened, plus AI Settings while it is open. A single effect keeps
  // the list in sync — every place that activates a file (tree, new
  // file, try-it, terminal, rename, delete) flows through
  // activeFile/items, so no call site needs to touch the tabs.
  const [openFilePaths, setOpenFilePaths] = useState<string[]>(["main.py"]);
  const [settingsTabOpen, setSettingsTabOpen] = useState(false);
  useEffect(() => {
    setOpenFilePaths((prev) => {
      const live = prev.filter((p) => items.some((it) => it.type === "file" && it.path === p));
      const next =
        !activeFile || live.includes(activeFile.path) ? live : [...live, activeFile.path];
      return next.length === prev.length && next.every((p, i) => p === prev[i]) ? prev : next;
    });
  }, [activeFile?.path, items]);

  // Close a file tab. The last file tab cannot close — the editor
  // always keeps one file open (same rule as Delete).
  function closeFileTab(path: string) {
    if (openFilePaths.length <= 1) return;
    const idx = openFilePaths.indexOf(path);
    const next = openFilePaths.filter((p) => p !== path);
    if (activeFilePath === path) setActiveFilePath(openFilePaths[idx - 1] ?? next[0]);
    setOpenFilePaths(next);
  }

  // Pinned file tabs (VS Code-style): bulk closes never touch them,
  // and the tab shows a pin icon. In-memory, like the open-tabs list.
  const [pinnedPaths, setPinnedPaths] = useState<string[]>([]);

  // Close several file tabs at once (Close Others / to the Right /
  // Saved / All). The clicked tab is always kept — at least one file
  // tab stays open — and pinned tabs are never closed this way. If
  // the active file closes, the nearest remaining tab to its left
  // becomes active (else the first remaining tab).
  function applyTabClose(candidates: string[], keepPath: string) {
    const closable = candidates.filter((p) => p !== keepPath && !pinnedPaths.includes(p));
    if (closable.length === 0) return;
    const next = openFilePaths.filter((p) => !closable.includes(p));
    if (closable.includes(activeFilePath)) {
      const idx = openFilePaths.indexOf(activeFilePath);
      setActiveFilePath(next[Math.max(0, Math.min(idx - 1, next.length - 1))] ?? next[0]);
    }
    setOpenFilePaths(next);
  }

  // Reveal in Explorer View: show the file in the Explorer tree —
  // switch to the Files tab, open its folders, and scroll its row
  // into view. (The OS file explorer is app-only, wabepp.)
  function revealInExplorer(path: string) {
    setActiveFilePath(path);
    setCentreView("editor");
    switchTab("files");
    setPanelVisible("explorer", true);
    const folders: Record<string, boolean> = {};
    let acc = "";
    for (const part of path.split("/").slice(0, -1)) {
      acc = acc ? `${acc}/${part}` : part;
      folders[acc] = true;
    }
    setExpandedFolders((p) => ({ ...p, ...folders }));
    window.setTimeout(() => {
      document
        .querySelector(".branched-menu__head[data-active], .branched-menu__item[data-active]")
        ?.scrollIntoView({ block: "nearest" });
    }, 120);
  }

  function openTabContextMenu(
    e: React.MouseEvent,
    target: { kind: "tab-file" | "tab-settings" | "tab-modules"; path: string }
  ) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, target });
  }






  // Workspace + repo layer — see hooks/useWorkspaceRepo.ts.
  const repo = useWorkspaceRepo({
    items, setItems, activeFilePath, setActiveFilePath, activeFile,
    engine, setOutput, setNeedsSaveWarning,
  });
  const {
    openRepoState, repoLoadedToast, setRepoLoadedToast,
    loadingFilePath,
    changedRepoPathsRef, changedRepoCount, setChangedRepoCount,
    markRepoChanged, repoTreePathsRef, itemsRef, hasWorkspaceBackup,
    handleEditorChange, persistWorkspace, restoreWorkspaceBackup,
    exitRepo,
    saveCurrentFile, saveFileSilently, saveAllFiles,
  } = repo;

  // Push the repo's changes to GitHub: every file changed since the
  // repo was opened goes up in /api/github/batch-commit requests
  // (one request for the whole push, chunked when there are more
  // than 20 files or the body would pass the server's 5 MB cap),
  // all sharing the one commit message the user approved in the
  // push dialog. The server still makes one commit per file,
  // exactly as the old one-request-per-file push did — and it
  // reports every file's result, so a file that fails stays marked
  // changed and the next push retries just it. Nothing pushes on
  // its own: edits save to the browser only, and Run still saves
  // first exactly as before. A file that was never opened has no
  // loaded content, so it is skipped rather than pushed empty.
  const [pushing, setPushing] = useState(false);
  function splitChangedFiles() {
    const changed = [...changedRepoPathsRef.current];
    const ready = changed.filter((p) => {
      const it = itemsRef.current.find((x) => x.type === "file" && x.path === p);
      return it && (!it.lazy || (it.content ?? "") !== "");
    });
    return { ready, skipped: changed.filter((p) => !ready.includes(p)) };
  }
  function defaultCommitMessage(paths: string[]) {
    return paths.length === 1
      ? `Update ${paths[0]} from Learn Python editor`
      : `Update ${paths.length} files from Learn Python editor`;
  }
  // Batch-commit limits — must match the server
  // (src/app/api/github/batch-commit/route.ts): at most 20 files
  // per request, body capped at 5 MB. The byte budget below sits
  // under the cap to leave room for JSON escaping; the per-file
  // char cap is the server's zod limit, checked before batching so
  // one oversized file cannot fail its whole batch.
  const BATCH_COMMIT_MAX_FILES = 20;
  const BATCH_COMMIT_MAX_BYTES = 4_500_000;
  const BATCH_COMMIT_MAX_CONTENT_CHARS = 4_000_000;
  function chunkBatchFiles(files: { path: string; content: string }[]) {
    const oversized: { path: string; content: string }[] = [];
    const batches: { path: string; content: string }[][] = [];
    let current: { path: string; content: string }[] = [];
    let currentBytes = 200; // JSON envelope overhead
    const encoder = new TextEncoder();
    for (const file of files) {
      if (file.content.length > BATCH_COMMIT_MAX_CONTENT_CHARS) {
        oversized.push(file);
        continue;
      }
      const bytes =
        encoder.encode(file.content).length +
        encoder.encode(file.path).length +
        64; // per-file JSON overhead (keys, quotes, braces)
      if (
        current.length > 0 &&
        (current.length >= BATCH_COMMIT_MAX_FILES ||
          currentBytes + bytes > BATCH_COMMIT_MAX_BYTES)
      ) {
        batches.push(current);
        current = [];
        currentBytes = 200;
      }
      current.push(file);
      currentBytes += bytes;
    }
    if (current.length > 0) batches.push(current);
    return { batches, oversized };
  }
  async function pushRepoChanges(message: string) {
    if (!openRepoState || pushing) return;
    // The server resolves the caller's stored GitHub token from
    // the session (migration 006) — no token leaves this browser.
    const [owner, repo] = openRepoState.repo.split("/");
    const { ready, skipped } = splitChangedFiles();
    if (ready.length === 0) {
      setOutput((prev) =>
        prev +
        (skipped.length > 0
          ? `[Nothing to push — ${skipped.length} changed file(s) were never opened, so their content is not loaded yet.]\n`
          : "[No changes to push.]\n")
      );
      return;
    }
    setPushing(true);
    setOutput((prev) => prev + `[Pushing ${ready.length} file(s) to ${openRepoState.repo}...]\n`);
    const files = ready
      .map((path) => {
        const it = itemsRef.current.find((x) => x.type === "file" && x.path === path);
        return it ? { path, content: it.content ?? "" } : null;
      })
      .filter((f): f is { path: string; content: string } => f !== null);
    const { batches, oversized } = chunkBatchFiles(files);
    let pushed = 0;
    const failed: { path: string; error: string }[] = [];
    // Too big for the server to ever accept: fail it alone, with
    // the reason, instead of letting it fail its whole batch.
    for (const file of oversized) {
      failed.push({
        path: file.path,
        error: "File is larger than 4 MB — too big to commit from the editor",
      });
    }
    for (const batch of batches) {
      try {
        const res = await fetch("/api/github/batch-commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner,
            repo,
            branch: openRepoState.branch,
            message,
            files: batch,
          }),
        });
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const err =
            typeof data === "object" &&
            data !== null &&
            typeof (data as { error?: unknown }).error === "string"
              ? (data as { error: string }).error
              : "Push failed";
          for (const f of batch) failed.push({ path: f.path, error: err });
          continue;
        }
        const results =
          typeof data === "object" &&
          data !== null &&
          Array.isArray((data as { results?: unknown }).results)
            ? (data as { results: unknown[] }).results
            : [];
        const seen = new Set<string>();
        for (const r of results) {
          if (
            typeof r !== "object" ||
            r === null ||
            typeof (r as { path?: unknown }).path !== "string"
          )
            continue;
          const result = r as { path: string; ok?: unknown; error?: unknown };
          seen.add(result.path);
          if (result.ok === true) {
            pushed++;
            changedRepoPathsRef.current.delete(result.path);
          } else {
            failed.push({
              path: result.path,
              error:
                typeof result.error === "string" && result.error
                  ? result.error
                  : "Push failed",
            });
          }
        }
        // A file the server never reported is not assumed pushed —
        // it stays changed, so the next push retries it.
        for (const f of batch) {
          if (!seen.has(f.path)) {
            failed.push({ path: f.path, error: "No result from the server — retry to push it" });
          }
        }
      } catch {
        for (const f of batch) failed.push({ path: f.path, error: "Push failed" });
      }
    }
    setChangedRepoCount(changedRepoPathsRef.current.size);
    setPushing(false);
    setOutput(
      (prev) =>
        prev +
        `[Pushed ${pushed} of ${ready.length} file(s) to ${openRepoState.repo}${failed.length > 0 ? ` — failed: ${failed.map((f) => `${f.path} (${f.error})`).join(", ")}` : "."}${skipped.length > 0 ? ` Skipped ${skipped.length} unopened file(s).` : ""}]\n`
    );
  }

  // Push dialog: the commit message box opens with a plain default
  // already in it, and the AI refines it in the background (5s cap —
  // slower than that, or signed out, or no AI keys, and the default
  // simply stays). Typing in the box wins over the AI: once the user
  // edits it, an AI reply no longer overwrites it, and clearing the
  // box falls back to the default at confirm time.
  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [pushDialogFiles, setPushDialogFiles] = useState<{ ready: string[]; skipped: string[] }>({ ready: [], skipped: [] });
  const [commitMessage, setCommitMessage] = useState("");
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const messageEditedRef = useRef(false);
  const generationRef = useRef(0);
  function openPushDialog() {
    if (!openRepoState || pushing) return;
    const { ready, skipped } = splitChangedFiles();
    if (ready.length === 0) {
      setOutput((prev) =>
        prev +
        (skipped.length > 0
          ? `[Nothing to push — ${skipped.length} changed file(s) were never opened, so their content is not loaded yet.]\n`
          : "[No changes to push.]\n")
      );
      return;
    }
    messageEditedRef.current = false;
    setPushDialogFiles({ ready, skipped });
    setCommitMessage(defaultCommitMessage(ready));
    setPushDialogOpen(true);
    const gen = ++generationRef.current;
    void generateCommitMessage(ready, gen);
  }
  async function generateCommitMessage(paths: string[], gen: number) {
    const added = paths.filter((p) => !repoTreePathsRef.current.has(p));
    const updated = paths.filter((p) => repoTreePathsRef.current.has(p));
    const lines = [
      ...(added.length > 0 ? [`Added: ${added.join(", ")}`] : []),
      ...(updated.length > 0 ? [`Updated: ${updated.join(", ")}`] : []),
    ];
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    const commitByok = byokPayloadFor("gemini-3.6-flash");
    setGeneratingMessage(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Write ONLY a short commit message (one line, max 72 characters, conventional-commits style like "feat: ..." or "fix: ...") for these changes in the ${openRepoState?.repo ?? "repo"} repository:\n${lines.join("\n")}\nReply with just the message, nothing else.`,
          model: "gemini-3.6-flash",
          effort: "Low",
          ...(commitByok ? { byok: commitByok } : {}),
        }),
        signal: controller.signal,
      });
      const data: unknown = await res.json().catch(() => null);
      const reply =
        typeof data === "object" && data !== null ? (data as { reply?: unknown }).reply : null;
      if (
        typeof reply === "string" &&
        reply.trim() &&
        gen === generationRef.current &&
        !messageEditedRef.current
      ) {
        setCommitMessage(reply.trim().split("\n")[0].slice(0, 72));
      }
    } catch {
      // AI unavailable, slower than 5s, or not signed in — the default
      // message is already in the box, so there is nothing to fix.
    } finally {
      window.clearTimeout(timer);
      setGeneratingMessage(false);
    }
  }
  async function confirmPush() {
    const message = commitMessage.trim() || defaultCommitMessage(pushDialogFiles.ready);
    setPushDialogOpen(false);
    await pushRepoChanges(message);
  }

  // Auto Save: when the active file is edited and Auto Save is on,
  // save it after a short debounce. The timer resets on every
  // keystroke, so a burst of typing saves once, after the pause.
  useEffect(() => {
    if (!autoSave || !activeFile || activeFile.isSaved) return;
    const timer = window.setTimeout(() => {
      saveFileSilently(activeFile.path);
    }, 1200);
    return () => window.clearTimeout(timer);
    // Re-run when the content or the save state changes; the active
    // path is what gets saved, so it is a dependency too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave, activeFile?.path, activeFile?.content, activeFile?.isSaved]);

  // VS Code keyboard shortcuts (app-level — Monaco's own editor
  // shortcuts already work when the editor is focused, so only the
  // app actions are wired here). One window listener, global like
  // VS Code: it works from anywhere in the app. The ref holds the
  // latest handlers so the listener never goes stale; the menu bar
  // shows the same labels (editor-menus.ts). Cmd works on Mac via
  // (ctrlKey || metaKey). Not wired: Ctrl+W / Ctrl+N / Ctrl+T
  // (the browser owns them and will not let a page stop them) and
  // Ctrl+P / Ctrl+Shift+P (they need a Quick Open / Command Palette
  // UI, which does not exist yet).
  const shortcutsRef = useRef({
    saveCurrentFile, saveAllFiles,
    compileAndRun: engine.compileAndRun,
    formatCurrentFile: engine.formatCurrentFile,
    isRunning: engine.isRunning, loadingEngine: engine.loadingEngine,
    formatting: engine.formatting, pyodideReady: engine.pyodideReady,
    activeFile, setShowTerminal, setShowExplorer,
    setCentreView, setSettingsSection, setSettingsTabOpen, setAiMenuOpen,
  });
  useEffect(() => {
    shortcutsRef.current = {
      saveCurrentFile, saveAllFiles,
      compileAndRun: engine.compileAndRun,
      formatCurrentFile: engine.formatCurrentFile,
      isRunning: engine.isRunning, loadingEngine: engine.loadingEngine,
      formatting: engine.formatting, pyodideReady: engine.pyodideReady,
      activeFile, setShowTerminal, setShowExplorer,
      setCentreView, setSettingsSection, setSettingsTabOpen, setAiMenuOpen,
    };
  });
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const s = shortcutsRef.current;
      const key = e.key.toLowerCase();
      if (mod && !e.shiftKey && !e.altKey && key === "s") {
        // Ctrl+S — save (same guard as the File menu). The
        // preventDefault stops the browser's save-page dialog.
        e.preventDefault();
        if (s.activeFile && !s.activeFile.isSaved) s.saveCurrentFile();
      } else if (mod && e.shiftKey && !e.altKey && key === "s") {
        // Ctrl+Shift+S — save all files.
        e.preventDefault();
        s.saveAllFiles();
      } else if (mod && !e.shiftKey && !e.altKey && key === "f5") {
        // Ctrl+F5 — run without debugging (same guard as the Run
        // menu). The preventDefault stops the browser's hard reload.
        e.preventDefault();
        if (!s.isRunning && !s.loadingEngine) s.compileAndRun();
      } else if (!mod && e.shiftKey && e.altKey && (key === "f" || key === "ƒ")) {
        // Shift+Alt+F — format (same guard as the File menu).
        // "ƒ" is what macOS Option+F types.
        e.preventDefault();
        if (s.activeFile && !s.formatting && s.pyodideReady) s.formatCurrentFile();
      } else if (mod && !e.shiftKey && !e.altKey && key === "`") {
        // Ctrl+` — toggle terminal.
        e.preventDefault();
        s.setShowTerminal((v) => !v);
      } else if (mod && !e.shiftKey && !e.altKey && key === "j") {
        // Ctrl+J — toggle panel (the terminal lives at the bottom).
        e.preventDefault();
        s.setShowTerminal((v) => !v);
      } else if (mod && !e.shiftKey && !e.altKey && key === "b") {
        // Ctrl+B — toggle Explorer.
        e.preventDefault();
        s.setShowExplorer((v) => !v);
      } else if (mod && e.shiftKey && !e.altKey && key === "e") {
        // Ctrl+Shift+E — show Explorer.
        e.preventDefault();
        s.setShowExplorer(true);
      } else if (mod && !e.shiftKey && !e.altKey && key === ",") {
        // Ctrl+, — open Settings (same opener as the AI menu's
        // Settings item).
        e.preventDefault();
        s.setCentreView("ai-settings");
        s.setSettingsSection("menu");
        s.setSettingsTabOpen(true);
        s.setAiMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Voice site control (Virtual Tutor): run / save / open a file by
  // name, dispatched as lp-voice-editor events from the tutor. The
  // page answers with lp-voice-editor-done so the tutor can confirm
  // honestly. A pending file (the tutor navigated here from another
  // page first) is consumed once the workspace items have loaded.
  useEffect(() => {
    const reply = (detail: Record<string, unknown>) => {
      window.dispatchEvent(new CustomEvent(VOICE_EDITOR_DONE_EVENT, { detail }));
    };
    const findFile = (wantedRaw: string) => {
      const wanted = wantedRaw.toLowerCase();
      return items
        .filter((it) => it.type === "file")
        .find((it) => {
          const base = it.path.split("/").pop()?.toLowerCase() ?? "";
          return base === wanted || base === `${wanted}.py` || base.startsWith(wanted);
        });
    };
    const onVoice = (event: Event) => {
      const detail = (event as CustomEvent).detail as { action?: string; name?: string } | undefined;
      const s = shortcutsRef.current;
      if (detail?.action === "run") {
        if (s.isRunning || s.loadingEngine) {
          reply({ ok: true, busy: true });
          return;
        }
        void s.compileAndRun();
        reply({ ok: true });
        return;
      }
      if (detail?.action === "save") {
        s.saveCurrentFile();
        reply({ ok: true });
        return;
      }
      if (detail?.action === "open-file" && typeof detail.name === "string") {
        const hit = findFile(detail.name);
        if (hit) {
          setActiveFilePath(hit.path);
          reply({ ok: true, path: hit.path });
        } else {
          reply({ ok: false });
        }
      }
    };
    window.addEventListener(VOICE_EDITOR_EVENT, onVoice);
    try {
      const pending = sessionStorage.getItem(PENDING_OPEN_FILE_KEY);
      if (pending) {
        const hit = findFile(pending);
        if (hit) {
          sessionStorage.removeItem(PENDING_OPEN_FILE_KEY);
          setActiveFilePath(hit.path);
        }
      }
    } catch {
      // Private mode — the editor just opens as usual.
    }
    return () => window.removeEventListener(VOICE_EDITOR_EVENT, onVoice);
  }, [items]);

  // Run diagnostics → editor markers: when a run fails, the error
  // line gets a red squiggle (warnings get a yellow one); hovering
  // the marker shows the message. Markers clear on the next run and
  // when the active file changes — they belong to the run's file.
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel?.();
    if (!model) return;
    const d = engine.runDiagnostics;
    if (!d || d.path !== activeFilePath) {
      monaco.editor.setModelMarkers(model, "lp-python", []);
      return;
    }
    const lineCount = model.getLineCount();
    const markers = d.items.map((it) => {
      const line = Math.min(Math.max(1, it.line), lineCount);
      return {
        severity: it.severity === "warning" ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
        message: it.message,
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: model.getLineLength(line) + 1,
      };
    });
    monaco.editor.setModelMarkers(model, "lp-python", markers);
  }, [engine.runDiagnostics, activeFilePath]);

  // Persist the resizable panel widths so a reload keeps the layout.
  useEffect(() => {
    localStorage.setItem("lp_editor_explorer_w", String(explorerWidth));
  }, [explorerWidth]);
  useEffect(() => {
    localStorage.setItem("lp_editor_terminal_w", String(terminalWidth));
  }, [terminalWidth]);


  // --- Rename / Delete / Duplicate / Copy Path (context menu + File menu) ---
  function startRename(path: string) {
    const item = items.find((i) => i.path === path);
    if (!item) return;
    setRenamingPath(path);
    setRenameInput(item.name);
  }

  function submitRename(e: React.FormEvent) {
    e.preventDefault();
    if (!renamingPath) return;
    const item = items.find((i) => i.path === renamingPath);
    if (!item) {
      setRenamingPath(null);
      return;
    }
    const clean = renameInput.trim();
    if (!clean || clean === item.name) {
      setRenamingPath(null);
      return;
    }
    // A file keeps its extension if the user typed a bare name.
    const newName =
      item.type === "file" && !clean.includes(".")
        ? `${clean}.py`
        : clean;
    const parent = renamingPath.includes("/")
      ? renamingPath.slice(0, renamingPath.lastIndexOf("/"))
      : "";
    const newPath = parent ? `${parent}/${newName}` : newName;
    if (newPath !== renamingPath && items.some((i) => i.path === newPath)) {
      alert(t.editorPage.fileExistsError);
      return;
    }
    const updated = items.map((it) => {
      if (it.path === renamingPath) {
        return { ...it, name: newName, path: newPath, isSaved: false };
      }
      if (item.type === "folder" && it.path.startsWith(renamingPath + "/")) {
        const rel = it.path.slice(renamingPath.length + 1);
        return { ...it, path: `${newPath}/${rel}`, isSaved: false };
      }
      return it;
    });
    persistWorkspace(updated);
    if (item.type === "file") markRepoChanged(newPath);
    else
      updated
        .filter((it) => it.type === "file" && it.path.startsWith(newPath + "/"))
        .forEach((it) => markRepoChanged(it.path));
    if (activeFilePath === renamingPath) setActiveFilePath(newPath);
    // Keep the bottom tabs in sync with the rename (a file, or every
    // file under a renamed folder).
    setOpenFilePaths((prev) =>
      prev.map((p) =>
        p === renamingPath
          ? newPath
          : p.startsWith(renamingPath + "/")
            ? `${newPath}${p.slice(renamingPath.length)}`
            : p
      )
    );
    if (item.type === "folder") {
      setExpandedFolders((p) => {
        const next = { ...p };
        delete next[renamingPath];
        next[newPath] = true;
        return next;
      });
    }
    setRenamingPath(null);
    setOutput((prev) => prev + `[Renamed '${renamingPath}' → '${newPath}']\n`);
  }

  function deleteItem(path: string) {
    const item = items.find((i) => i.path === path);
    if (!item) return;
    const remaining = items.filter(
      (it) => it.path !== path && !it.path.startsWith(path + "/")
    );
    if (!remaining.some((it) => it.type === "file")) {
      alert(t.editorPage.keepOneFileError);
      return;
    }
    persistWorkspace(remaining);
    // A dropped file's bytes live in IndexedDB (they survive a
    // refresh) — deleting the file must drop them too, or the
    // bytes linger forever under a path that no longer exists.
    // (No-op for repo/text files, which were never saved there.)
    // A folder delete takes its children with it, so clear those
    // too.
    for (const it of items) {
      if (it.path === path || it.path.startsWith(path + "/")) void deleteDroppedFile(it.path);
    }
    if (activeFilePath === path || activeFilePath.startsWith(path + "/")) {
      const first = remaining.find((it) => it.type === "file");
      if (first) setActiveFilePath(first.path);
    }
    setOutput((prev) => prev + `[Deleted '${path}']\n`);
  }

  // "Copy" in the context menu = Duplicate: a copy of the file (or the
  // folder with its files) beside the original, opened right away.
  function duplicateItem(path: string) {
    const item = items.find((i) => i.path === path);
    if (!item) return;
    const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
    const stem =
      item.type === "file"
        ? item.name.replace(/\.py$/, "")
        : item.name;
    const ext = item.type === "file" && item.name.endsWith(".py") ? ".py" : "";
    let n = 1;
    let newName = `${stem} copy${ext}`;
    let newPath = parent ? `${parent}/${newName}` : newName;
    while (items.some((i) => i.path === newPath)) {
      n += 1;
      newName = `${stem} copy ${n}${ext}`;
      newPath = parent ? `${parent}/${newName}` : newName;
    }
    const copies: WorkspaceItem[] = [];
    if (item.type === "file") {
      copies.push({
        id: "f-dup-" + Date.now(),
        name: newName,
        path: newPath,
        type: "file",
        isSaved: true,
        content: item.content ?? "",
      });
    } else {
      copies.push({
        id: "folder-dup-" + Date.now(),
        name: newName,
        path: newPath,
        type: "folder",
      });
      for (const child of items.filter(
        (it) => it.type === "file" && it.path.startsWith(path + "/")
      )) {
        const rel = child.path.slice(path.length + 1);
        copies.push({
          id: "f-dup-" + Date.now() + "-" + rel,
          name: child.name,
          path: `${newPath}/${rel}`,
          type: "file",
          isSaved: true,
          content: child.content ?? "",
        });
      }
    }
    const next = [...items, ...copies];
    persistWorkspace(next);
    copies.filter((c) => c.type === "file").forEach((c) => markRepoChanged(c.path));
    if (item.type === "file") setActiveFilePath(newPath);
    setOutput((prev) => prev + `[Copied '${path}' → '${newPath}']\n`);
  }

  async function copyPath(path: string) {
    try {
      await navigator.clipboard.writeText(path);
      setOutput((prev) => prev + `[Copied path '${path}']\n`);
    } catch {
      setOutput((prev) => prev + `[Could not copy path — clipboard unavailable]\n`);
    }
  }

  // --- Context menu (right-click PC / long-press mobile) ---
  function openRowContextMenu(e: React.MouseEvent, path: string) {
    const item = items.find((i) => i.path === path);
    if (!item) return;
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      target: { kind: item.type, path },
    });
  }

  function openRootContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      target: { kind: "root", path: "" },
    });
  }

  // The workspace file list is shadowed by the menu array inside
  // contextMenuItems, so the tab branch reads it through this alias.
  const workspaceItems = items;

  function contextMenuItems(): ContextMenuItem[] {
    return buildContextMenuItems({
      t, contextMenu, workspaceItems, openFilePaths, pinnedPaths, setPinnedPaths,
      closeFileTab, applyTabClose, copyPath, revealInExplorer, switchTab,
      setSettingsTabOpen, setCentreView, setActiveFilePath,
      setShowNewFile, setShowNewFolder, engine,
      startRename, duplicateItem, deleteItem,
    });
  }

  // --- Menu bar actions (Edit / View / Run / Terminal) ---
  function undoEdit() {
    try {
      editorRef.current?.trigger("keyboard", "undo", null);
    } catch {}
  }
  function redoEdit() {
    try {
      editorRef.current?.trigger("keyboard", "redo", null);
    } catch {}
  }
  function findInEditor() {
    try {
      editorRef.current?.getAction("actions.find")?.run();
    } catch {}
  }

  // Workspace files are synced into the Pyodide virtual filesystem so
  // `import utils` (and any other local module) resolves when the code
  // runs. They MUST be written to ABSOLUTE paths under /home/pyodide
  // (Pyodide's working directory): relative paths resolved against an
  // unexpected CWD, and the nested utils/ writes failed with
  // ErrnoError, so `import utils` raised ModuleNotFoundError even
  // though the runtime had loaded fine (2026-11-19).

  function handleAddFile(e: React.FormEvent) {
    e.preventDefault();
    const clean = newFileInput.trim();
    if (!clean) return;
    const normalized = clean.endsWith(".py") ? clean : `${clean}.py`;
    if (items.some((i) => i.path === normalized)) {
      alert(t.editorPage.fileExistsError);
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
    markRepoChanged(normalized);
    setActiveFilePath(normalized);
    setNewFileInput("");
    setShowNewFile(false);
    writeLocalJson("lp_workspace_tree", next);
  }

  function handleAddFolder(e: React.FormEvent) {
    e.preventDefault();
    const clean = newFolderInput.trim().replace(/\/+$/, "");
    if (!clean) return;
    if (items.some((i) => i.path === clean)) {
      alert(t.editorPage.folderExistsError);
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
    writeLocalJson("lp_workspace_tree", next);
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
      alert(t.editorPage.itemExistsInLocationError(itemName));
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
    writeLocalJson("lp_workspace_tree", updated);
    setDraggedItemPath(null);
    setOutput((prev) => prev + `[Moved '${sourceItem.name}' to ${targetFolderPath === "root" ? "root" : targetFolderPath}]\n`);
  }

  // --- File tree (React Bits BranchedMenu) ---
  // BranchedMenu supports one folder level: top-level files are
  // leaves, each top-level folder is a section whose children are the
  // files under it. A nested folder's files are flattened into the
  // parent section with their path relative to the folder (e.g.
  // "sub/file.py"), so every file stays visible and selectable. The
  // section index ↔ folder path map lets onToggle update
  // expandedFolders (the single source of truth for fold state).
  const treeFileIcon = <FileCode className="h-3.5 w-3.5 text-neutral-300 shrink-0" />;
  const treeFolderIcon = <Folder className="h-3.5 w-3.5 text-neutral-300 shrink-0" />;
  function treeFileLabel(displayName: string, isSaved: boolean | undefined) {
    return (
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate">{displayName}</span>
        {!isSaved && (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title={t.editorPage.unsavedTooltip} />
        )}
      </span>
    );
  }
  const treeData = (() => {
    const menuItems: BranchedMenuItem[] = [];
    const sectionPathByIndex: string[] = [];
    for (const item of items) {
      if (item.type === "file" && !item.path.includes("/")) {
        menuItems.push({ value: item.path, label: treeFileLabel(item.name, item.isSaved), icon: treeFileIcon });
      } else if (item.type === "folder" && !item.path.includes("/")) {
        const children = items
          .filter((i) => i.type === "file" && i.path.startsWith(item.path + "/"))
          .map((f) => ({
            value: f.path,
            label: treeFileLabel(f.path.slice(item.path.length + 1), f.isSaved),
            icon: treeFileIcon,
          }));
        sectionPathByIndex[menuItems.length] = item.path;
        menuItems.push({ value: item.path, label: item.name, icon: treeFolderIcon, children });
      }
    }
    return { menuItems, sectionPathByIndex };
  })();
  // Controlled open sections: a folder is open unless the user
  // folded it (expandedFolders[path] === false). Mirrors the old
  // tree's `expandedFolders[item.path] ?? true` default.
  const treeOpenSections = treeData.sectionPathByIndex
    .map((p, i) => ((expandedFolders[p] ?? true) ? i : -1))
    .filter((i) => i >= 0);

  // BranchedMenu callbacks — the same behaviour the old flat tree
  // had: picking a file opens it, folding a folder updates
  // expandedFolders, dragging moves items between folders (only
  // folders are drop targets), each row has its own delete button.
  function handleTreeSelect(value: string) {
    setActiveFilePath(value);
    setNeedsSaveWarning(null);
  }
  function handleTreeToggle(index: number, open: boolean) {
    const path = treeData.sectionPathByIndex[index];
    if (path) setExpandedFolders((p) => ({ ...p, [path]: open }));
  }
  function handleTreeDragStart(e: React.DragEvent, value: string) {
    const item = items.find((i) => i.path === value);
    if (item) handleDragStart(e, item);
  }
  // VS Code-style: dropping on a file means its parent folder
  // (root for a top-level file).
  function parentFolderOf(value: string): string | "root" {
    return value.includes("/") ? value.slice(0, value.lastIndexOf("/")) : "root";
  }
  function handleTreeDragOver(e: React.DragEvent, value: string) {
    const item = items.find((i) => i.path === value);
    if (item?.type === "folder") handleDragOverFolder(e, value);
    else if (item?.type === "file") handleDragOverFolder(e, parentFolderOf(value));
  }
  function handleTreeDragLeave(value: string) {
    const item = items.find((i) => i.path === value);
    if (item?.type === "folder") setDragOverTarget(null);
  }
  function handleTreeDrop(e: React.DragEvent, value: string) {
    const item = items.find((i) => i.path === value);
    if (item?.type === "folder") handleDropOnTarget(e, value);
    else if (item?.type === "file") handleDropOnTarget(e, parentFolderOf(value));
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
      const fileName = file.name;

      if (items.some((it) => it.path === fileName)) continue;
      if (extensionForFile(fileName)) {
        // Binary viewer file (PDF/image/video/...): file.text()
        // would UTF-8-decode the raw bytes and corrupt them — the
        // PDF opened as binary garbage in Monaco for exactly this
        // reason. Keep the raw bytes behind a blob: URL for the
        // viewer instead, with empty text content. A binary drop is
        // NOT marked repo-changed: the push path sends text content,
        // so it could only ever commit an empty file.
        const blob = new Blob([await file.arrayBuffer()], {
          type: file.type || "application/octet-stream",
        });
        const blobUrl = URL.createObjectURL(blob);
        // Persist the bytes (IndexedDB): a blob: URL dies on reload
        // and the restore strips it, so without this the file opens
        // blank in Monaco after a refresh. Fire-and-forget — the
        // in-session blob URL works either way.
        void saveDroppedFile(fileName, blob);
        newItems.push({
          id: "f-drop-" + Date.now() + "-" + i,
          name: fileName,
          path: fileName,
          type: "file",
          content: "",
          isSaved: true,
          blobUrl,
        });
      } else {
        const text = await file.text();
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
      newItems.forEach((it) => {
        if (!it.blobUrl) markRepoChanged(it.path);
      });
      setActiveFilePath(newItems[0].path);
      writeLocalJson("lp_workspace_tree", merged);
      setOutput((prev) => prev + `[Imported ${newItems.length} file(s) via drag & drop]\n`);
    }
  }




  // --- Menu bar (VS Code-style header) ---
  // Web-only actions (wabepp): nothing here needs the OS. The
  // OS-dependent entries (revealing a file in the OS explorer,
  // opening the OS terminal, opening a file with another app, and the
  // debugger entries — starting a debug session, stepping through
  // code, breakpoints) are app-only (native APK / Tauri EXE) and stay
  // out of this menu. The
  // Run menu is therefore just the web-working actions: run the file
  // and stop it. View and Terminal menus are gone — panels are
  // shown/hidden and dragged from their own headers now.
  const menus: EditorMenu[] = buildEditorMenus({
    t, activeFile, engine, autoSave, setAutoSave, hasWorkspaceBackup,
    restoreWorkspaceBackup, saveCurrentFile, saveAllFiles,
    startRename, duplicateItem, copyPath, undoEdit, redoEdit, findInEditor,
    setShowNewFile, setShowNewFolder,
  });

  // Guests never see the editor — the gate screen above replaces
  // the old silent redirect to /.
  if (!enteredChecked) return null;
  if (isGuest) return <SignInGate />;


  // --- Dock panels (zone layout) ---
  // The side panels as JSX, placed into zones below by
  // renderDockPanel. The Editor is the centre and never moves.
  const explorerPanel = (<ExplorerPanel t={t} isExternalDragOver={isExternalDragOver} setIsExternalDragOver={setIsExternalDragOver} handleExternalDrop={handleExternalDrop} showNewFile={showNewFile} setShowNewFile={setShowNewFile} showNewFolder={showNewFolder} setShowNewFolder={setShowNewFolder} switchTab={switchTab} editorTab={editorTab} handleAddFile={handleAddFile} newFileInput={newFileInput} setNewFileInput={setNewFileInput} handleAddFolder={handleAddFolder} newFolderInput={newFolderInput} setNewFolderInput={setNewFolderInput} renamingPath={renamingPath} submitRename={submitRename} renameInput={renameInput} setRenameInput={setRenameInput} setRenamingPath={setRenamingPath} openRepoState={openRepoState} handleDragOverFolder={handleDragOverFolder} setDragOverTarget={setDragOverTarget} handleDropOnTarget={handleDropOnTarget} dragOverTarget={dragOverTarget} openRootContextMenu={openRootContextMenu} treeData={treeData} activeFilePath={activeFilePath} treeOpenSections={treeOpenSections} handleTreeSelect={handleTreeSelect} handleTreeToggle={handleTreeToggle} handleTreeDragStart={handleTreeDragStart} handleTreeDragOver={handleTreeDragOver} handleTreeDragLeave={handleTreeDragLeave} handleTreeDrop={handleTreeDrop} openRowContextMenu={openRowContextMenu} setDraggingPanel={setDraggingPanel} setDropZone={setDropZone} setShowExplorer={setShowExplorer} />);
  const terminalPanel = (<TerminalPanel t={t} output={output} setOutput={setOutput} activeFile={activeFile} engine={engine} terminalInputRef={terminalInputRef} setDraggingPanel={setDraggingPanel} setDropZone={setDropZone} setShowTerminal={setShowTerminal} />);
  // AI panel — history view (⋮ menu → Chat History): past chats,
  // newest first. Opening one swaps it into the chat; deleting it
  // removes it for good.

  // AI Settings card — see components/AiSettingsCard.tsx.
  const aiSettingsCard = <AiSettingsCard t={t} ai={ai} />;

  const aiPanel = (<AiPanel t={t} aiView={aiView} aiMessages={aiMessages} aiThinking={aiThinking} aiThoughtSeconds={aiThoughtSeconds} setAiThoughtSeconds={setAiThoughtSeconds} aiError={aiError} aiMenuOpen={aiMenuOpen} setAiMenuOpen={setAiMenuOpen} activeFile={activeFile} sendAiMessage={sendAiMessage} stopAi={stopAi} clearAiChat={clearAiChat} setAiView={setAiView} setCentreView={setCentreView} setSettingsSection={setSettingsSection} setSettingsTabOpen={setSettingsTabOpen} setPanelVisible={setPanelVisible} setDraggingPanel={setDraggingPanel} setDropZone={setDropZone} AI_PANEL_MODELS={AI_PANEL_MODELS} aiChats={aiChats} startNewChat={startNewChat} loadAiChat={loadAiChat} deleteAiChat={deleteAiChat} defaultModel="gemini-3.6-flash" aiDocContext={aiDocContext} setAiDocContext={setAiDocContext} />);

  // Ask AI (PDF viewer): attach the current document as the AI's
  // reference and open the panel, so the user asks their question
  // about it — the AI answers from the document, per their prompt.
  const handlePdfAskAi = (ctx: { fileName: string; text: string }) => {
    setAiDocContext(ctx);
    setShowAi(true);
  };
  const editorPanel = (<EditorPanel t={t} activeFile={activeFile} engine={engine} editorTheme={editorTheme} handleEditorChange={handleEditorChange} editorRef={editorRef} monacoRef={monacoRef} setCursorPos={setCursorPos} loadingFile={loadingFilePath === activeFilePath} onAskAi={handlePdfAskAi} />);

  const dockPanels = (["explorer", "terminal", "ai"] as PanelId[]).filter((id) => isPanelVisible(id));
  const leftPanels = dockPanels.filter((id) => panelZones[id] === "left");
  const rightPanels = dockPanels.filter((id) => panelZones[id] === "right");
  const bottomPanels = dockPanels.filter((id) => panelZones[id] === "bottom");

  function renderDockPanel(id: PanelId) {
    if (id === "explorer") return explorerPanel;
    if (id === "terminal") return terminalPanel;
    if (id === "ai") return aiPanel;
    return null;
  }

  return (
    // pb-20 clears the mobile bottom nav bar (md:pb-0: PC has no bottom bar).
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0 md:h-dvh md:overflow-hidden">
      <Script
        src="/pyodide/pyodide.js"
        // Never pass initPyodide directly: next/script calls onLoad
        // with the DOM load Event, and initPyodide would take that
        // Event for a stage-listener function — see the guard above.
        // The arrow passes a real stage listener instead, so the
        // status line below can show which CDN is being tried.
        onLoad={() => engine.initPyodide((stage) => engine.setEngineStage(stage))}
        onError={() => {
          const msg = t.editorPage.pyodideLoadError;
          engine.setPyodideError(msg);
          setOutput((prev) => prev + `✗ ${msg}\n`);
        }}
      />
      <AppNavbar />

      <main
        className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto p-4 flex flex-col gap-2"
        style={
          {
            "--explorer-w": `${explorerWidth}px`,
            "--terminal-w": `${terminalWidth}px`,
          } as React.CSSProperties
        }
      >
        {/* VS Code-style menu bar (the editor header): File / Edit /
            View / Run / Terminal. Web-only actions (wabepp). */}
        <EditorMenuBar
          menus={menus}
          left={
            /* Exit the open repo — same look as the File / Edit /
               Run buttons (no border, background only on hover).
               Shown only while a repo is open; a plain workspace
               shows nothing. Hover shows "Exit from the repo". */
            openRepoState ? (
              <button
                type="button"
                onClick={exitRepo}
                title={t.editorPage.exitRepoTitle}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
              >
                {t.editorPage.exitRepo}
              </button>
            ) : undefined
          }
          right={
            <>
              <button
                type="button"
                onClick={() => setShowAi((v) => !v)}
                title={t.editorPage.aiPanelTitle}
                aria-pressed={showAi}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  showAi ? "bg-neutral-800 text-white" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t.editorPage.aiButton}
              </button>
              <button
                type="button"
                onClick={() => setShowTerminal((v) => !v)}
                title={t.editorPage.terminalLogs}
                aria-pressed={showTerminal}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  showTerminal ? "bg-neutral-800 text-white" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                {t.editorPage.terminalButton}
              </button>
              <button
                type="button"
                onClick={() => setShowExplorer((v) => !v)}
                title={t.editorPage.explorer}
                aria-pressed={showExplorer}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  showExplorer ? "bg-neutral-800 text-white" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Folder className="h-3.5 w-3.5" />
                {t.editorPage.explorer}
              </button>
              {/* Push hides with no repo open (like Exit on the left):
                  a plain workspace has nothing to push, so the button
                  is gone entirely instead of sitting there disabled. */}
              {openRepoState && (
              <button
                type="button"
                onClick={openPushDialog}
                disabled={!openRepoState || pushing || changedRepoCount === 0}
                title={openRepoState ? t.editorPage.pushButton : t.editorPage.pushNeedsRepo}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  !openRepoState || changedRepoCount === 0
                    ? "text-neutral-600"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                {t.editorPage.pushButton}
                {changedRepoCount > 0 ? ` (${changedRepoCount})` : ""}
              </button>
              )}
            </>
          }
        />

        {/* Files / Modules now live in the Explorer panel's header
            (two small tabs there) — the separate tab bar above the
            editor is gone, so the header is a single bar. */}

        {/* Runtime load status: which CDN/step it is on + elapsed time,
            so a slow download reads as "working", not "stuck". */}
        {engine.loadingEngine && (
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs text-neutral-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span className="truncate">
              {engine.engineStage ?? t.editorPage.loadingEngine}
            </span>
            <span className="text-neutral-500 shrink-0">· {engine.engineElapsed}s</span>
            <button
              type="button"
              onClick={engine.cancelEngineLoad}
              className="ml-auto shrink-0 underline font-semibold text-neutral-300 hover:text-white"
            >
              {t.common.cancel}
            </button>
          </div>
        )}

        {engine.pyodideError && (
          <div className="flex items-center justify-between rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
            <span>{engine.pyodideError}</span>
            <button
              type="button"
              onClick={() => {
                engine.setPyodideError(null);
                engine.initPyodide();
              }}
              className="underline font-semibold hover:text-white ml-3"
            >
              {t.common.retry}
            </button>
          </div>
        )}

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
              {t.editorPage.saveNow}
            </button>
          </div>
        )}

        {/* VS Code-style layout: side panels (Explorer / AI) run the
            full height; the centre column holds the editor on top
            and the bottom-docked panels (Terminal) under it. On
            mobile the panels stack and the splitters hide; on desktop
            drag a splitter to resize and double-click it to reset. */}
        {/* Dockable panels (VS Code-style): Explorer, Terminal and AI
            live in zones — left, right, or bottom. Drag a panel by
            its header onto a zone to move it there; drag a splitter
            to resize, double-click it to reset. On mobile the panels
            stack and the splitters hide. */}
        <div
          ref={dockRef}
          className="relative flex min-h-[620px] flex-1 flex-col gap-2 md:min-h-0"
          onDragOver={() => setDropZone(null)}
        >
          <div className="flex min-h-[620px] flex-1 flex-col gap-2 md:flex-row md:min-h-0">
            {/* Left zone */}
            {leftPanels.length > 0 && (
              <div className="flex w-full flex-col gap-2 md:w-[var(--explorer-w)] md:shrink-0 md:min-h-0">
                {leftPanels.map((id) => (
                  <div key={id} className="flex min-h-0 min-w-0 flex-1 flex-col">
                    {renderDockPanel(id)}
                  </div>
                ))}
              </div>
            )}
            <EditorSplitter
              disabled={leftPanels.length === 0}
              label="Resize left panels"
              onDrag={(d) => setExplorerWidth((w) => Math.min(480, Math.max(200, w + d)))}
              onReset={() => setExplorerWidth(280)}
            />
            {/* Centre column: the editor (or the package manager on
                Modules) on top, bottom-docked panels under it — the
                terminal sits under the editor only, like VS Code, so
                the side panels keep their full height. */}
            <div className="flex min-h-[420px] min-w-0 flex-1 flex-col gap-2 sm:min-h-[480px] md:min-h-0">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                {centreView === "ai-settings" ? (
                  aiSettingsCard
                ) : editorTab === "files" ? (
                  editorPanel
                ) : (
                  <ModulesPanel pyodideRef={engine.pyodideRef} ensurePyodide={engine.ensurePyodideReady} />
                )}
              </div>
              {/* Bottom zone (under the editor only) */}
              {bottomPanels.length > 0 && (
                <>
                  <EditorSplitter
                    orientation="horizontal"
                    label="Resize bottom panels"
                    onDrag={(d) => setBottomHeight((h) => Math.min(480, Math.max(120, h - d)))}
                    onReset={() => setBottomHeight(150)}
                  />
                  <div className="flex shrink-0 gap-2" style={{ height: bottomHeight }}>
                    {bottomPanels.map((id) => (
                      <div key={id} className="flex min-h-0 min-w-0 flex-1 flex-col">
                        {renderDockPanel(id)}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <EditorSplitter
              disabled={rightPanels.length === 0}
              label="Resize right panels"
              onDrag={(d) => setTerminalWidth((w) => Math.min(560, Math.max(240, w - d)))}
              onReset={() => setTerminalWidth(320)}
            />
            {/* Right zone */}
            {rightPanels.length > 0 && (
              <div className="flex w-full flex-col gap-2 md:w-[var(--terminal-w)] md:shrink-0 md:min-h-0">
                {rightPanels.map((id) => (
                  <div key={id} className="flex min-h-0 min-w-0 flex-1 flex-col">
                    {renderDockPanel(id)}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Drop zones — only while a panel is being dragged. */}
          {draggingPanel && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropZone("left"); }}
                onDrop={(e) => { e.preventDefault(); movePanelToZone(draggingPanel, "left"); setDraggingPanel(null); setDropZone(null); }}
                className={`absolute bottom-0 left-0 top-0 z-20 flex w-1/4 items-center justify-center border-2 border-dashed ${dropZone === "left" ? "border-white/70 bg-white/10" : "border-white/20 bg-white/[0.03]"}`}
              >
                <span className="rounded bg-black/70 px-2 py-1 text-[11px] font-medium text-white">Dock left</span>
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropZone("right"); }}
                onDrop={(e) => { e.preventDefault(); movePanelToZone(draggingPanel, "right"); setDraggingPanel(null); setDropZone(null); }}
                className={`absolute bottom-0 right-0 top-0 z-20 flex w-1/4 items-center justify-center border-2 border-dashed ${dropZone === "right" ? "border-white/70 bg-white/10" : "border-white/20 bg-white/[0.03]"}`}
              >
                <span className="rounded bg-black/70 px-2 py-1 text-[11px] font-medium text-white">Dock right</span>
              </div>
              {/* The bottom zone is not offered for the AI panel:
                  AI is a side panel only, so while it is dragged
                  there is nowhere to drop it at the bottom. */}
              {draggingPanel !== "ai" && (
                <div
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropZone("bottom"); }}
                  onDrop={(e) => { e.preventDefault(); movePanelToZone(draggingPanel, "bottom"); setDraggingPanel(null); setDropZone(null); }}
                  style={{ left: leftPanels.length > 0 ? explorerWidth : 0, right: rightPanels.length > 0 ? terminalWidth : 0 }}
                  className={`absolute bottom-0 z-20 flex h-1/4 items-center justify-center border-2 border-dashed ${dropZone === "bottom" ? "border-white/70 bg-white/10" : "border-white/20 bg-white/[0.03]"}`}
                >
                  <span className="rounded bg-black/70 px-2 py-1 text-[11px] font-medium text-white">Dock bottom</span>
                </div>
              )}
            </>
          )}
        </div>
        {/* Status bar (VS Code-style): runtime, open tabs, save state,
            cursor position. The tabs live here at the bottom — one per
            open file, plus AI Settings / Modules while those views are
            open. (Auto Save lives in the menu-bar toggle only —
            repeating it here was a duplicate.) */}
        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-[11px] font-mono text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${engine.pyodideReady ? "bg-emerald-400" : "bg-amber-400"}`} />
            {t.editorPage.statusPython}
          </span>
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {openFilePaths.map((path) => {
              const name = path.split("/").pop() ?? path;
              const isActive =
                centreView === "editor" && editorTab === "files" && activeFile?.path === path;
              return (
                <span
                  key={path}
                  onContextMenu={(e) => openTabContextMenu(e, { kind: "tab-file", path })}
                  className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 ${isActive ? "border-neutral-700 bg-neutral-800 text-neutral-100" : "border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilePath(path);
                      setCentreView("editor");
                      switchTab("files");
                    }}
                    title={path}
                    className="flex items-center gap-1.5"
                  >
                    {pinnedPaths.includes(path) && <Pin className="h-3 w-3 shrink-0 text-neutral-300" />}
                    <FileCode className="h-3.5 w-3.5 shrink-0" />
                    <span>{name}</span>
                  </button>
                  {openFilePaths.length > 1 && (
                    <button
                      type="button"
                      onClick={() => closeFileTab(path)}
                      aria-label={`Close ${name}`}
                      className="rounded p-0.5 text-neutral-500 hover:bg-neutral-700 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            })}
            {settingsTabOpen && (
              <span
                onContextMenu={(e) => openTabContextMenu(e, { kind: "tab-settings", path: "" })}
                className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 ${centreView === "ai-settings" ? "border-neutral-700 bg-neutral-800 text-neutral-100" : "border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"}`}
              >
                <button
                  type="button"
                  onClick={() => setCentreView("ai-settings")}
                  title={t.editorPage.aiSettingsTitle}
                  className="flex items-center gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.editorPage.aiSettingsTitle}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTabOpen(false);
                    setCentreView("editor");
                  }}
                  aria-label={`Close ${t.editorPage.aiSettingsTitle}`}
                  className="rounded p-0.5 text-neutral-500 hover:bg-neutral-700 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {editorTab === "modules" && (
              <span
                onContextMenu={(e) => openTabContextMenu(e, { kind: "tab-modules", path: "" })}
                className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 ${centreView === "editor" ? "border-neutral-700 bg-neutral-800 text-neutral-100" : "border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    switchTab("modules");
                    setCentreView("editor");
                  }}
                  title={t.editorPage.modulesTab}
                  className="flex items-center gap-1.5"
                >
                  <Package className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.editorPage.modulesTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("files")}
                  aria-label={`Close ${t.editorPage.modulesTab}`}
                  className="rounded p-0.5 text-neutral-500 hover:bg-neutral-700 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </span>
          <span className="ml-auto flex items-center gap-4">
            <span>
              {activeFile?.isSaved ? t.editorPage.saved : t.editorPage.unsavedBadge}
            </span>
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
          </span>
        </div>
      </main>

      {/* Right-click / long-press context menu (files, folders, root). */}
      {contextMenu && (
        <EditorContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Push dialog: the commit message, AI-written, editable like
          GitHub's. The box opens with a plain default; the AI refines
          it within 5s (or the default stays). Clearing the box falls
          back to the default — a commit always has a message. */}
      {pushDialogOpen && openRepoState && (<PushDialog t={t} openRepoState={openRepoState} setPushDialogOpen={setPushDialogOpen} pushDialogFiles={pushDialogFiles} commitMessage={commitMessage} setCommitMessage={setCommitMessage} messageEditedRef={messageEditedRef} generatingMessage={generatingMessage} confirmPush={confirmPush} pushing={pushing} />)}

      {/* Repo-loaded toast: fires when the repo tree loads (file
          contents load lazily on open, so the toast is about the
          tree). Bottom-right, above the status bar, gone in 5s. */}
      {repoLoadedToast && (
        <div
          role="status"
          className="fixed bottom-16 right-4 z-50 flex max-w-sm items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-neutral-950 px-4 py-3 shadow-2xl shadow-black/60"
        >
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="min-w-0 flex-1 truncate text-xs text-neutral-200">
            {t.editorPage.repoLoadedToast(repoLoadedToast.repo, repoLoadedToast.count)}
          </span>
          <button
            type="button"
            onClick={() => setRepoLoadedToast(null)}
            aria-label="Dismiss"
            className="shrink-0 rounded-md p-1 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
