// Menu bar + right-click context menu builders. Moved verbatim from
// web/src/app/editor/page.tsx (F1 split) — no behaviour change.
// Each builder takes the state/handlers it closes over as one args
// object and destructures it, so the bodies are unchanged.
import type { Dispatch, SetStateAction } from "react";
import type { EditorMenu } from "@/components/EditorMenuBar";
import type { ContextMenuItem } from "@/components/EditorContextMenu";
import type { Strings } from "@/lib/i18n";
import { PY_WORKSPACE_ROOT } from "@/app/editor/hooks/usePyodideEngine";
import type { CentreView, WorkspaceItem } from "@/app/editor/lib/editor-types";
import type { usePyodideEngine } from "@/app/editor/hooks/usePyodideEngine";

export type EditorContextMenuState = {
  x: number;
  y: number;
  target: {
    kind: "file" | "folder" | "root" | "tab-file" | "tab-settings" | "tab-modules";
    path: string;
  };
} | null;

type Engine = ReturnType<typeof usePyodideEngine>;

export function buildEditorMenus(args: {
  t: Strings;
  activeFile: WorkspaceItem | undefined;
  engine: Engine;
  autoSave: boolean;
  setAutoSave: (v: boolean) => void;
  hasWorkspaceBackup: boolean;
  restoreWorkspaceBackup: () => void;
  saveCurrentFile: () => void;
  saveAllFiles: () => void;
  startRename: (path: string) => void;
  duplicateItem: (path: string) => void;
  copyPath: (path: string) => Promise<void>;
  undoEdit: () => void;
  redoEdit: () => void;
  findInEditor: () => void;
  setShowNewFile: (v: boolean) => void;
  setShowNewFolder: (v: boolean) => void;
}): EditorMenu[] {
  const {
    t, activeFile, engine, autoSave, setAutoSave, hasWorkspaceBackup,
    restoreWorkspaceBackup, saveCurrentFile, saveAllFiles,
    startRename, duplicateItem, copyPath, undoEdit, redoEdit, findInEditor,
    setShowNewFile, setShowNewFolder,
  } = args;
  return [
    {
      id: "file",
      label: t.editorPage.menuFile,
      items: [
        { id: "new-file", label: t.editorPage.newFile, action: () => setShowNewFile(true) },
        { id: "new-folder", label: t.editorPage.newFolder, action: () => setShowNewFolder(true) },
        { id: "sep-1", label: "", separator: true },
        { id: "save", label: t.editorPage.saveFileRequired, shortcut: "Ctrl+S", disabled: !activeFile || activeFile.isSaved, action: saveCurrentFile },
        { id: "save-all", label: t.editorPage.menuSaveAll, shortcut: "Ctrl+Shift+S", action: saveAllFiles },
        { id: "restore-workspace", label: t.editorPage.restoreWorkspace, disabled: !hasWorkspaceBackup, action: restoreWorkspaceBackup },
        { id: "sep-2", label: "", separator: true },
        { id: "rename", label: t.editorPage.menuRename, disabled: !activeFile, action: () => activeFile && startRename(activeFile.path) },
        { id: "duplicate", label: t.editorPage.menuDuplicate, disabled: !activeFile, action: () => activeFile && duplicateItem(activeFile.path) },
        { id: "copy-path", label: t.editorPage.menuCopyPath, disabled: !activeFile, action: () => activeFile && copyPath(activeFile.path) },
        { id: "sep-3", label: "", separator: true },
        { id: "format", label: t.editorPage.menuFormat, shortcut: "Shift+Alt+F", disabled: !activeFile || engine.formatting || !engine.pyodideReady, action: () => engine.formatCurrentFile() },
        { id: "sep-4", label: "", separator: true },
        {
          id: "auto-save",
          label: t.editorPage.menuAutoSave,
          checked: autoSave,
          action: () => {
            const next = !autoSave;
            setAutoSave(next);
            localStorage.setItem("lp_editor_autosave", next ? "on" : "off");
          },
        },
      ],
    },
    {
      id: "edit",
      label: t.editorPage.menuEdit,
      items: [
        { id: "undo", label: t.editorPage.menuUndo, shortcut: "Ctrl+Z", disabled: !activeFile, action: undoEdit },
        { id: "redo", label: t.editorPage.menuRedo, shortcut: "Ctrl+Y", disabled: !activeFile, action: redoEdit },
        { id: "sep-1", label: "", separator: true },
        { id: "find", label: t.editorPage.menuFind, shortcut: "Ctrl+F", disabled: !activeFile, action: findInEditor },
        { id: "format", label: t.editorPage.menuFormat, shortcut: "Shift+Alt+F", disabled: !activeFile || engine.formatting || !engine.pyodideReady, action: () => engine.formatCurrentFile() },
      ],
    },
    {
      id: "run",
      label: t.editorPage.menuRun,
      items: [
        { id: "run", label: t.editorPage.runWithoutDebugging, shortcut: "Ctrl+F5", disabled: engine.isRunning || engine.loadingEngine, action: () => engine.compileAndRun() },
        { id: "stop", label: t.editorPage.stop, disabled: !engine.isRunning, action: engine.stopRunning },
      ],
    },
  ];
}

export function buildContextMenuItems(args: {
  t: Strings;
  contextMenu: EditorContextMenuState;
  workspaceItems: WorkspaceItem[];
  openFilePaths: string[];
  pinnedPaths: string[];
  setPinnedPaths: Dispatch<SetStateAction<string[]>>;
  closeFileTab: (path: string) => void;
  applyTabClose: (candidates: string[], keepPath: string) => void;
  copyPath: (path: string) => Promise<void>;
  revealInExplorer: (path: string) => void;
  switchTab: (tab: "files" | "modules") => void;
  setSettingsTabOpen: (v: boolean) => void;
  setCentreView: (v: CentreView) => void;
  setActiveFilePath: (v: string) => void;
  setShowNewFile: (v: boolean) => void;
  setShowNewFolder: (v: boolean) => void;
  engine: Engine;
  startRename: (path: string) => void;
  duplicateItem: (path: string) => void;
  deleteItem: (path: string) => void;
}): ContextMenuItem[] {
  const {
    t, contextMenu, workspaceItems, openFilePaths, pinnedPaths, setPinnedPaths,
    closeFileTab, applyTabClose, copyPath, revealInExplorer, switchTab,
    setSettingsTabOpen, setCentreView, setActiveFilePath,
    setShowNewFile, setShowNewFolder, engine,
    startRename, duplicateItem, deleteItem,
  } = args;
    if (!contextMenu) return [];
    const { kind, path } = contextMenu.target;
    if (kind === "root") {
      return [
        {
          id: "new-file",
          label: t.editorPage.newFile,
          action: () => setShowNewFile(true),
        },
        {
          id: "new-folder",
          label: t.editorPage.newFolder,
          action: () => setShowNewFolder(true),
        },
      ];
    }
    // Tab menu (right-click a bottom tab, VS Code-style). WABEPP:
    // only web-compatible actions live here. App-only (native APK /
    // Tauri EXE, NOT on the website): reopening with an external
    // editor, revealing in the OS file explorer, split editor,
    // moving the editor into a new OS window.
    if (kind === "tab-settings") {
      return [
        {
          id: "tab-close",
          label: t.editorPage.tabClose,
          action: () => {
            setSettingsTabOpen(false);
            setCentreView("editor");
          },
        },
      ];
    }
    if (kind === "tab-modules") {
      return [
        {
          id: "tab-close",
          label: t.editorPage.tabClose,
          action: () => switchTab("files"),
        },
      ];
    }
    if (kind === "tab-file") {
      const fileIndex = openFilePaths.indexOf(path);
      const toRight = fileIndex >= 0 ? openFilePaths.slice(fileIndex + 1) : [];
      const others = openFilePaths.filter((p) => p !== path);
      const saved = openFilePaths.filter((p) => {
        const it = workspaceItems.find((w) => w.type === "file" && w.path === p);
        return it?.isSaved;
      });
      const isPinned = pinnedPaths.includes(path);
      const nothingClosable = (list: string[]) =>
        list.length === 0 || list.every((p) => p === path || pinnedPaths.includes(p));
      return [
        {
          id: "tab-close",
          label: t.editorPage.tabClose,
          action: () => closeFileTab(path),
        },
        {
          id: "tab-close-others",
          label: t.editorPage.tabCloseOthers,
          disabled: nothingClosable(others),
          action: () => applyTabClose(others, path),
        },
        {
          id: "tab-close-right",
          label: t.editorPage.tabCloseToRight,
          disabled: nothingClosable(toRight),
          action: () => applyTabClose(toRight, path),
        },
        {
          id: "tab-close-saved",
          label: t.editorPage.tabCloseSaved,
          disabled: nothingClosable(saved),
          action: () => applyTabClose(saved, path),
        },
        {
          id: "tab-close-all",
          label: t.editorPage.tabCloseAll,
          disabled: nothingClosable(others),
          action: () => applyTabClose(others, path),
        },
        { id: "sep-1", label: "", separator: true },
        {
          id: "tab-copy-path",
          label: t.editorPage.menuCopyPath,
          action: () => copyPath(`${PY_WORKSPACE_ROOT}/${path}`),
        },
        {
          id: "tab-copy-relative-path",
          label: t.editorPage.tabCopyRelativePath,
          action: () => copyPath(path),
        },
        { id: "sep-2", label: "", separator: true },
        {
          id: "tab-reveal",
          label: t.editorPage.tabRevealInExplorer,
          action: () => revealInExplorer(path),
        },
        { id: "sep-3", label: "", separator: true },
        // No preview tabs in this editor — every tab is already kept
        // open, so Keep Open is shown greyed like VS Code shows it.
        {
          id: "tab-keep-open",
          label: t.editorPage.tabKeepOpen,
          disabled: true,
        },
        {
          id: "tab-pin",
          label: isPinned ? t.editorPage.tabUnpin : t.editorPage.tabPin,
          action: () =>
            setPinnedPaths((prev) =>
              isPinned ? prev.filter((p) => p !== path) : [...prev, path]
            ),
        },
      ];
    }
    const isFile = kind === "file";
    const items: ContextMenuItem[] = [];
    if (!isFile) {
      items.push(
        {
          id: "new-file",
          label: t.editorPage.newFile,
          action: () => {
            setActiveFilePath(path);
            setShowNewFile(true);
          },
        },
        {
          id: "new-folder",
          label: t.editorPage.newFolder,
          action: () => setShowNewFolder(true),
        },
        { id: "sep-1", label: "", separator: true }
      );
    }
    if (isFile) {
      items.push({
        id: "format",
        label: t.editorPage.menuFormat,
        disabled: engine.formatting || !engine.pyodideReady,
        action: () => engine.formatCurrentFile(),
      });
    }
    items.push(
      {
        id: "rename",
        label: t.editorPage.menuRename,
        action: () => startRename(path),
      },
      {
        id: "duplicate",
        label: t.editorPage.menuDuplicate,
        action: () => duplicateItem(path),
      },
      {
        id: "copy-path",
        label: t.editorPage.menuCopyPath,
        action: () => copyPath(path),
      },
      { id: "sep-2", label: "", separator: true },
      {
        id: "delete",
        label: t.editorPage.menuDelete,
        danger: true,
        action: () => deleteItem(path),
      }
    );
    return items;
}
