// Static checks over the BranchedMenu file tree (React Bits) in the
// Code Editor. The editor's workspace tree is a BranchedMenu: folders
// are sections, files are children/leaves. Fully static (reads the
// .ts/.tsx files as text) — no TS import needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(webDir, p), "utf8");

test("BranchedMenu is vendored as TypeScript with its CSS (React Bits)", () => {
  assert.ok(existsSync(join(webDir, "src/components/BranchedMenu.tsx")), "BranchedMenu.tsx must exist");
  assert.ok(existsSync(join(webDir, "src/components/BranchedMenu.css")), "BranchedMenu.css must exist");
  const c = read("src/components/BranchedMenu.tsx");
  assert.ok(c.includes("'use client'"), "BranchedMenu must be a client component");
  assert.ok(c.includes("import './BranchedMenu.css'"), "BranchedMenu must import its CSS");
  assert.ok(c.includes("export default function BranchedMenu"), "BranchedMenu must be the default export");
  assert.ok(c.includes("BranchedMenuItem"), "BranchedMenu must export a typed item interface");
  assert.ok(c.includes("BranchedMenuProps"), "BranchedMenu must export a typed props interface");
  // The hugeicons dependencies are already installed (no new install).
  const pkg = JSON.parse(read("package.json"));
  assert.ok(pkg.dependencies["@hugeicons/react"], "@hugeicons/react must be a dependency");
  assert.ok(pkg.dependencies["@hugeicons/core-free-icons"], "@hugeicons/core-free-icons must be a dependency");
  assert.ok(existsSync(join(webDir, "node_modules/@hugeicons/react/package.json")), "@hugeicons/react must be installed");
  assert.ok(existsSync(join(webDir, "node_modules/@hugeicons/core-free-icons/package.json")), "@hugeicons/core-free-icons must be installed");
  // Upstream structure preserved: the accent marker, the SVG branch
  // lines, the fold animation.
  assert.ok(c.includes("branched-menu__marker"), "BranchedMenu must keep the active-row marker");
  assert.ok(c.includes("branched-menu__lines"), "BranchedMenu must keep the SVG branch lines");
  assert.ok(c.includes("branched-menu__reach"), "BranchedMenu must keep the accent reach lines");
  const css = read("src/components/BranchedMenu.css");
  assert.ok(css.includes("grid-template-rows"), "BranchedMenu must keep the fold animation");
  assert.ok(css.includes(".branched-menu__marker"), "the CSS must style the marker");
  assert.ok(css.includes(".branched-menu__reach"), "the CSS must style the reach lines");
});

test("BranchedMenu keeps the editor tree's behaviour (controlled, drag)", () => {
  const c = read("src/components/BranchedMenu.tsx");
  // Controlled active + open: the editor's activeFilePath and
  // expandedFolders drive the highlight and the fold state, so
  // creating or deleting a file updates them.
  assert.ok(c.includes("activeValue"), "BranchedMenu must accept a controlled activeValue");
  assert.ok(c.includes("openSections"), "BranchedMenu must accept controlled openSections");
  assert.ok(c.includes("activeValue !== undefined ? activeValue : activeInternal"), "a controlled activeValue must win over internal state");
  assert.ok(c.includes("openSections !== undefined ? toSet(openSections) : openInternal"), "controlled openSections must win over internal state");
  // Per-row trailing actions are supported by the component (renderRowActions),
  // but the editor does not use them — there is no delete button in the tree.
  assert.ok(c.includes("renderRowActions"), "BranchedMenu must accept renderRowActions");
  assert.ok(c.includes("branched-menu__actions"), "the row actions must have their own container");
  // Drag & drop: rows are draggable, folders are drop targets, the
  // dragged-over row is highlighted.
  assert.ok(c.includes("onRowDragStart"), "BranchedMenu must accept onRowDragStart");
  assert.ok(c.includes("onRowDragOver"), "BranchedMenu must accept onRowDragOver");
  assert.ok(c.includes("onRowDragLeave"), "BranchedMenu must accept onRowDragLeave");
  assert.ok(c.includes("onRowDrop"), "BranchedMenu must accept onRowDrop");
  assert.ok(c.includes("dragOverValue"), "BranchedMenu must accept dragOverValue for the drop-target highlight");
  assert.ok(c.includes("data-drag-over"), "the dragged-over row must carry data-drag-over");
  assert.ok(c.includes("draggable: !!onRowDragStart"), "rows must be draggable only when a drag handler is provided");
  // Section heads keep the editor's folder row look: fold chevron +
  // folder icon + label.
  assert.ok(c.includes("ChevronDown"), "section heads must show a ChevronDown when open");
  assert.ok(c.includes("ChevronRight"), "section heads must show a ChevronRight when folded");
  assert.ok(c.includes("branched-menu__head-chevron"), "the chevron must be styled");
  assert.ok(c.includes("branched-menu__head-icon"), "section heads must carry the folder icon");
  // Labels are ReactNode so the editor can put an unsaved dot next
  // to a file name; icons accept lucide elements or Hugeicons data.
  assert.ok(c.includes("label: ReactNode"), "item labels must be ReactNode (unsaved dot)");
  assert.ok(c.includes("IconSvgElement"), "item icons must accept Hugeicons icon data");
  // Full-width modifier for the explorer column.
  assert.ok(read("src/components/BranchedMenu.css").includes(".branched-menu--full"), "the CSS must have the full-width modifier");
  assert.ok(read("src/components/BranchedMenu.css").includes("[data-drag-over]"), "the CSS must style the drop-target highlight");
});

test("the editor page renders its file tree as a BranchedMenu", () => {
  const page = read("src/app/editor/page.tsx");
  assert.ok(page.includes('from "@/components/BranchedMenu"'), "the editor page must import BranchedMenu");
  assert.ok(page.includes("<BranchedMenu"), "the editor page must render a BranchedMenu");
  // The tree is built from the flat workspace list: top-level files
  // are leaves, top-level folders are sections.
  assert.ok(page.includes("treeData"), "the editor must build BranchedMenu items from the workspace");
  assert.ok(page.includes("sectionPathByIndex"), "the editor must map section indices back to folder paths");
  assert.ok(page.includes("treeOpenSections"), "the editor must pass controlled open sections");
  assert.ok(page.includes("activeValue={activeFilePath}"), "the active file must drive BranchedMenu's highlight");
  assert.ok(page.includes("openSections={treeOpenSections}"), "expandedFolders must drive BranchedMenu's fold state");
  // Selecting a file opens it (same as the old tree's click).
  assert.ok(page.includes("handleTreeSelect"), "the editor must handle BranchedMenu selection");
  assert.ok(page.includes("setActiveFilePath(value)"), "selecting a file must open it in the editor");
  assert.ok(page.includes("setNeedsSaveWarning(null)"), "selecting a file must clear the save warning");
  // Folding a folder updates expandedFolders.
  assert.ok(page.includes("handleTreeToggle"), "the editor must handle BranchedMenu folding");
  assert.ok(page.includes("setExpandedFolders((p) => ({ ...p, [path]: open }))"), "folding must update expandedFolders");
  // Drag & drop is preserved: rows are draggable, only folders are
  // drop targets, the dragged-over folder highlights.
  assert.ok(page.includes("onRowDragStart={handleTreeDragStart}"), "the tree must wire drag start");
  assert.ok(page.includes("onRowDragOver={handleTreeDragOver}"), "the tree must wire drag over");
  assert.ok(page.includes("onRowDrop={handleTreeDrop}"), "the tree must wire drop");
  assert.ok(page.includes("dragOverValue={dragOverTarget}"), "the tree must pass the drag-over target");
  assert.ok(page.includes('if (item?.type === "folder") handleDragOverFolder'), "only folders must be drop targets on drag over");
  assert.ok(page.includes('if (item?.type === "folder") handleDropOnTarget'), "only folders must be drop targets on drop");
  // No delete button in the file tree (Maalik's order): the editor must
  // not pass renderRowActions, must not call handleDeleteItem, and must
  // not import the Trash2 icon for a row delete button.
  assert.ok(!page.includes("renderRowActions"), "the tree must not render per-row actions (no delete button)");
  assert.ok(!page.includes("handleDeleteItem"), "the tree must not have a delete handler");
  assert.ok(!page.includes("Trash2"), "the tree must not use the Trash2 delete icon");
  // The unsaved dot stays on file names.
  assert.ok(page.includes("treeFileLabel"), "the tree must build file labels with the unsaved dot");
  assert.ok(page.includes("bg-amber-400"), "the unsaved dot must keep its amber colour");
  // The explorer chrome around the tree is untouched: header with
  // New File / New Folder, the create inputs, the root drop zone,
  // and the drag hint footer.
  assert.ok(page.includes("t.editorPage.explorer"), "the Explorer header must stay");
  assert.ok(page.includes("setShowNewFile(!showNewFile)"), "the New File button must stay");
  assert.ok(page.includes("setShowNewFolder(!showNewFolder)"), "the New Folder button must stay");
  assert.ok(page.includes("handleAddFile"), "the new-file form must stay");
  assert.ok(page.includes("handleAddFolder"), "the new-folder form must stay");
  assert.ok(page.includes("t.editorPage.workspaceRootDropHint"), "the root drop zone must stay");
  assert.ok(page.includes("t.editorPage.dragFilesHint"), "the drag hint footer must stay");
  // The old flat list is gone (and its visibility helper with it).
  assert.ok(!page.includes("isItemVisible"), "the old flat-list visibility helper must be gone");
  assert.ok(!page.includes("items.filter(isItemVisible)"), "the old flat tree list must be gone");
  assert.ok(!page.includes("GripVertical"), "the old drag grip must be gone");
});
