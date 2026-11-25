import type { Strings } from "@/lib/i18n";
import type { Dispatch, SetStateAction } from "react";
import { Code2, Folder, FolderPlus, Package, Plus, UploadCloud } from "lucide-react";
import BranchedMenu, { type BranchedMenuItem } from "@/components/BranchedMenu";
import { EditorPanelHeader } from "@/components/EditorPanelHeader";
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
      {/* Files / Modules tabs — the switch lives in the Explorer
          header now (the separate tab bar above the editor is
          gone). Files shows the tree; Modules opens the package
          manager in the centre. */}
      <div className="flex gap-1 border-b border-neutral-800 p-1.5">
        <button
          type="button"
          onClick={() => switchTab("files")}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${editorTab === "files" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
        >
          <Code2 className="mr-1 inline h-3.5 w-3.5" />{t.editorPage.filesTab}
        </button>
        <button
          type="button"
          onClick={() => switchTab("modules")}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${editorTab === "modules" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
        >
          <Package className="mr-1 inline h-3.5 w-3.5" />{t.editorPage.modulesTab}
        </button>
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
        <BranchedMenu
          items={treeData.menuItems}
          activeValue={activeFilePath}
          openSections={treeOpenSections}
          onSelect={(value) => handleTreeSelect(value)}
          onToggle={handleTreeToggle}
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
      </div>

      {/* Drag & Drop Hint */}
      <div className="border-t border-neutral-900 p-2.5 text-center text-[10px] text-neutral-500 flex items-center justify-center gap-1.5">
        <UploadCloud className="h-3.5 w-3.5" />
        <span>{t.editorPage.dragFilesHint}</span>
      </div>
    </div>
  );
}
