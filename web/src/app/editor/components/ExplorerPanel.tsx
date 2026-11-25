import type { Strings } from "@/lib/i18n";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Code2, Folder, FolderPlus, Package, Plus, Puzzle, Search, UploadCloud, X } from "lucide-react";
import BranchedMenu, { type BranchedMenuItem } from "@/components/BranchedMenu";
import { EditorPanelHeader } from "@/components/EditorPanelHeader";
import { ExtensionsPanel } from "./ExtensionsPanel";
import { filterExplorerTree, sortExplorerTree } from "../lib/editor-utils";
import type { PanelId, PanelZone } from "../lib/editor-types";

export type ExplorerPanelProps = {
  t: Strings;
  isExternalDragOver: boolean;
  setIsExternalDragOver: Dispatch<SetStateAction<boolean>>;
  handleExternalDrop: (e: React.DragEvent) => Promise<void>;
  showNewFile: boolean;
  setShowNewFile: Dispatch<SetStateAction<boolean>>;
  showNewFolder: boolean;
  setShowNewFolder: Dispatch<SetStateAction<boolean>>;
  switchTab: (tab: "files" | "modules") => void;
  editorTab: "files" | "modules";
  handleAddFile: (e: React.FormEvent) => void;
  newFileInput: string;
  setNewFileInput: Dispatch<SetStateAction<string>>;
  handleAddFolder: (e: React.FormEvent) => void;
  newFolderInput: string;
  setNewFolderInput: Dispatch<SetStateAction<string>>;
  renamingPath: string | null;
  submitRename: (e: React.FormEvent) => void;
  renameInput: string;
  setRenameInput: Dispatch<SetStateAction<string>>;
  setRenamingPath: Dispatch<SetStateAction<string | null>>;
  openRepoState: { repo: string; branch: string } | null;
  handleDragOverFolder: (e: React.DragEvent, targetFolderPath: string | "root") => void;
  setDragOverTarget: Dispatch<SetStateAction<string | null>>;
  handleDropOnTarget: (e: React.DragEvent, targetFolderPath: string | "root") => void;
  dragOverTarget: string | null;
  openRootContextMenu: (e: React.MouseEvent) => void;
  treeData: { menuItems: BranchedMenuItem[]; sectionPathByIndex: string[] };
  activeFilePath: string;
  treeOpenSections: number[];
  handleTreeSelect: (value: string) => void;
  handleTreeToggle: (index: number, open: boolean) => void;
  handleTreeDragStart: (e: React.DragEvent, value: string) => void;
  handleTreeDragOver: (e: React.DragEvent, value: string) => void;
  handleTreeDragLeave: (value: string) => void;
  handleTreeDrop: (e: React.DragEvent, value: string) => void;
  openRowContextMenu: (e: React.MouseEvent, path: string) => void;
  setDraggingPanel: Dispatch<SetStateAction<PanelId | null>>;
  setDropZone: Dispatch<SetStateAction<PanelZone | null>>;
  setShowExplorer: Dispatch<SetStateAction<boolean>>;
};

export function ExplorerPanel(props: ExplorerPanelProps) {
  const { t, isExternalDragOver, setIsExternalDragOver, handleExternalDrop, showNewFile, setShowNewFile, showNewFolder, setShowNewFolder, switchTab, editorTab, handleAddFile, newFileInput, setNewFileInput, handleAddFolder, newFolderInput, setNewFolderInput, renamingPath, submitRename, renameInput, setRenameInput, setRenamingPath, openRepoState, handleDragOverFolder, setDragOverTarget, handleDropOnTarget, dragOverTarget, openRootContextMenu, treeData, activeFilePath, treeOpenSections, handleTreeSelect, handleTreeToggle, handleTreeDragStart, handleTreeDragOver, handleTreeDragLeave, handleTreeDrop, openRowContextMenu, setDraggingPanel, setDropZone, setShowExplorer } = props;

  // Explorer search (VS Code-style): live case-insensitive filter on
  // file/folder names, folders first (A–Z) then files (A–Z) — display
  // only, the workspace data never changes. Filtering/sorting returns
  // a new item list, so section indices shift: values are unique paths,
  // so the visible→original index map is built from them. While a query
  // is active every visible folder is forced open, so a match is always
  // reachable (its parent folder shows even when folded).
  const [searchQuery, setSearchQuery] = useState("");
  const searching = searchQuery.trim().length > 0;
  // Extensions tab: local to this panel (the Files/Modules tabs switch
  // the centre column via the page; Extensions swaps this panel's own
  // body to the catalog). Picking Files/Modules returns to the tree.
  const [explorerView, setExplorerView] = useState<"tree" | "extensions">("tree");
  const visibleItems = useMemo(
    () => sortExplorerTree(filterExplorerTree(treeData.menuItems, searchQuery)),
    [treeData.menuItems, searchQuery]
  );
  const visibleIndexByOriginal = useMemo(() => {
    const originalIndexByValue = new Map(treeData.menuItems.map((item, i) => [item.value ?? "", i]));
    return visibleItems.map((item) => originalIndexByValue.get(item.value ?? "") ?? -1);
  }, [treeData.menuItems, visibleItems]);
  const visibleOpenSections = searching
    ? visibleItems.map((item, i) => (item.children ? i : -1)).filter((i) => i >= 0)
    : treeOpenSections.map((orig) => visibleIndexByOriginal.indexOf(orig)).filter((i) => i >= 0);
  function handleVisibleToggle(visibleIndex: number, open: boolean) {
    const orig = visibleIndexByOriginal[visibleIndex];
    if (orig !== undefined && orig >= 0) handleTreeToggle(orig, open);
  }

  return (
    <div
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setIsExternalDragOver(true);
      }}
      onDragLeave={() => setIsExternalDragOver(false)}
      onDrop={handleExternalDrop}
      className={`w-full flex-1 min-h-0 rounded-xl border flex flex-col overflow-hidden transition relative ${
        isExternalDragOver
          ? "border-white bg-neutral-900 ring-2 ring-white/20"
          : "border-neutral-800 bg-neutral-950"
      }`}
    >
      <EditorPanelHeader
        id="explorer"
        title={<><Folder className="h-3.5 w-3.5 text-neutral-300" /> {t.editorPage.explorer}</>}
        actions={
          <>
            <button
              type="button"
              draggable={false}
              onClick={() => setShowNewFile(!showNewFile)}
              title={t.editorPage.newFile}
              className="rounded p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              draggable={false}
              onClick={() => setShowNewFolder(!showNewFolder)}
              title={t.editorPage.newFolder}
              className="rounded p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          </>
        }
        onDragStart={setDraggingPanel}
        onDragEnd={() => { setDraggingPanel(null); setDropZone(null); }}
        onClose={() => setShowExplorer(false)}
        closeLabel={t.common.close}
      />
      {/* Files / Modules / Extensions tabs — the switch lives in the
          Explorer header now (the separate tab bar above the editor is
          gone). Files shows the tree; Modules opens the package
          manager in the centre; Extensions swaps this panel's body to
          the extensions catalog. */}
      <div className="flex gap-1 border-b border-neutral-800 p-1.5">
        <button
          type="button"
          onClick={() => { setExplorerView("tree"); switchTab("files"); }}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${explorerView === "tree" && editorTab === "files" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
        >
          <Code2 className="mr-1 inline h-3.5 w-3.5" />{t.editorPage.filesTab}
        </button>
        <button
          type="button"
          onClick={() => { setExplorerView("tree"); switchTab("modules"); }}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${explorerView === "tree" && editorTab === "modules" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
        >
          <Package className="mr-1 inline h-3.5 w-3.5" />{t.editorPage.modulesTab}
        </button>
        <button
          type="button"
          onClick={() => setExplorerView("extensions")}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${explorerView === "extensions" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
        >
          <Puzzle className="mr-1 inline h-3.5 w-3.5" />{t.editorPage.extensionsTab}
        </button>
      </div>

      {explorerView === "extensions" ? (
        <ExtensionsPanel t={t} />
      ) : (
      <>
      {/* Explorer search — a search icon inside the input, a clear (×)
          button once text is typed. Live-filters the tree below. */}
      <div className="px-2 pt-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.editorPage.explorerSearchPlaceholder}
            aria-label={t.editorPage.explorerSearchPlaceholder}
            className="w-full rounded border border-neutral-800 bg-neutral-950 py-1 pl-7 pr-7 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              title={t.common.clear}
              aria-label={t.common.clear}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inline create inputs */}
      {showNewFile && (
        <form onSubmit={handleAddFile} className="p-2 border-b border-neutral-800 bg-black">
          <input
            type="text"
            autoFocus
            placeholder={t.editorPage.newFilePlaceholder}
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
            placeholder={t.editorPage.newFolderPlaceholder}
            value={newFolderInput}
            onChange={(e) => setNewFolderInput(e.target.value)}
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs font-mono text-white placeholder-neutral-600 focus:border-white focus:outline-none"
          />
        </form>
      )}

      {/* Inline rename (from the context menu / File menu): the
          input is pre-filled with the current name. */}
      {renamingPath && (
        <form
          onSubmit={submitRename}
          className="p-2 border-b border-neutral-800 bg-black"
        >
          <input
            type="text"
            autoFocus
            placeholder={t.editorPage.renamePlaceholder}
            value={renameInput}
            onChange={(e) => setRenameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setRenamingPath(null);
            }}
            onBlur={() => setRenamingPath(null)}
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs font-mono text-white placeholder-neutral-600 focus:border-white focus:outline-none"
          />
        </form>
      )}

      {/* Root Drop Zone — while a repo is open this line is the
          repo's name (owner/repo, branch in the tooltip), now a
          link that opens the repo on GitHub; otherwise it is the
          plain-workspace drop hint. The div stays the root drop
          target either way. */}
      <div
        onDragOver={(e) => handleDragOverFolder(e, "root")}
        onDragLeave={() => setDragOverTarget(null)}
        onDrop={(e) => handleDropOnTarget(e, "root")}
        className={`px-3 py-1 text-[10px] font-mono tracking-wider transition ${
          dragOverTarget === "root"
            ? "bg-white text-black font-semibold rounded mx-2 my-1"
            : "text-neutral-600"
        }`}
      >
        {openRepoState ? (
          <a
            href={`https://github.com/${openRepoState.repo}`}
            target="_blank"
            rel="noreferrer"
            draggable={false}
            className="block truncate text-sm font-medium text-inherit hover:underline"
            title={`${openRepoState.repo} (${openRepoState.branch}) — open on GitHub`}
          >
            {openRepoState.repo}
          </a>
        ) : (
          <span className="uppercase">{t.editorPage.workspaceRootDropHint}</span>
        )}
      </div>

      {/* Tree Items: React Bits BranchedMenu — top-level files
          are leaves, folders are sections with branch lines.
          Selecting a file opens it; folding a folder, dragging
          files between folders, and the per-row delete button
          all keep the old tree's behaviour. Right-click (or a
          long-press on mobile) opens the context menu. */}
      <div
        className="flex-1 overflow-auto p-2"
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) return;
          handleDragOverFolder(e, "root");
        }}
        onDragLeave={() => setDragOverTarget(null)}
        onDrop={(e) => {
          if (e.dataTransfer.types.includes("Files")) return;
          handleDropOnTarget(e, "root");
        }}
        onContextMenu={openRootContextMenu}
        style={{ WebkitTouchCallout: "none" }}
      >
        {/* No-match empty state while searching; otherwise the
            filtered + sorted tree (folders first, then files). */}
        {searching && visibleItems.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-neutral-500">
            {t.editorPage.explorerSearchNoMatch(searchQuery.trim())}
          </p>
        ) : (
          <BranchedMenu
            items={visibleItems}
            activeValue={activeFilePath}
            openSections={visibleOpenSections}
            onSelect={(value) => handleTreeSelect(value)}
            onToggle={handleVisibleToggle}
            onRowDragStart={handleTreeDragStart}
            onRowDragOver={handleTreeDragOver}
            onRowDragLeave={handleTreeDragLeave}
            onRowDrop={handleTreeDrop}
            onRowContextMenu={(e, value) => openRowContextMenu(e, value)}
            dragOverValue={dragOverTarget}
            className="branched-menu--full"
            color="#f5f5f5"
            accentColor="#f5f5f5"
            lineColor="#3f3f46"
            width={280}
          />
        )}
      </div>

      {/* Drag & Drop Hint */}
      <div className="border-t border-neutral-900 p-2.5 text-center text-[10px] text-neutral-500 flex items-center justify-center gap-1.5">
        <UploadCloud className="h-3.5 w-3.5" />
        <span>{t.editorPage.dragFilesHint}</span>
      </div>
      </>
      )}
    </div>
  );
}
