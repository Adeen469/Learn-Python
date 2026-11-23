// The dockable-panel layout: which side panels are visible, which
// zone each lives in, drag state, bottom height, and the Monaco
// re-layout effect. Moved verbatim from web/src/app/editor/page.tsx
// (F1 split) — no behaviour change.
import { useEffect, useRef, useState } from "react";
import type { PanelId, PanelZone } from "@/app/editor/lib/editor-types";

export function useDockPanels({ editorRef }: { editorRef: { current: any } }) {
  const [showExplorer, setShowExplorer] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  // AI panel (the new AI button toggles it). Visible by default so
  // the user sees the assistant right away.
  const [showAi, setShowAi] = useState(true);

  // Draggable panels (VS Code-style docking): each side panel lives
  // in a zone — left, right, or bottom. Drag a panel by its header
  // and drop it on a zone to move it there. Persisted, so a reload
  // keeps the layout. The Editor (Monaco) is the centre and never
  // moves; ModulesPanel takes the centre when the Modules tab is on.


  const [panelZones, setPanelZones] = useState<Record<PanelId, PanelZone>>(() => {
    const fallback: Record<PanelId, PanelZone> = { explorer: "left", terminal: "bottom", ai: "right" };
    if (typeof window === "undefined") return fallback;
    try {
      const saved = JSON.parse(localStorage.getItem("lp_editor_panel_zones") || "null") as unknown;
      if (!saved || typeof saved !== "object") return fallback;
      const z = { ...fallback };
      for (const id of ["explorer", "terminal", "ai"] as PanelId[]) {
        const v = (saved as Record<string, unknown>)[id];
        if (v === "left" || v === "right" || v === "bottom") z[id] = v;
      }
      // AI is a side panel only — a saved bottom zone for it is reset.
      if (z.ai === "bottom") z.ai = "right";
      return z;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    localStorage.setItem("lp_editor_panel_zones", JSON.stringify(panelZones));
  }, [panelZones]);
  // Which panel is being dragged + which zone the pointer is over.
  const [draggingPanel, setDraggingPanel] = useState<PanelId | null>(null);
  const [dropZone, setDropZone] = useState<PanelZone | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  // Bottom zone height (px), persisted; resized by the horizontal
  // splitter above it. Default 150: on a laptop-height screen the
  // editor is only ~300px tall under a 220px terminal (about 13
  // lines), so the terminal takes less room and the editor shows
  // ~19 lines instead.
  const [bottomHeight, setBottomHeight] = useState<number>(() => {
    if (typeof window === "undefined") return 150;
    const v = Number(window.localStorage.getItem("lp_editor_bottom_h"));
    // 220 was the old default: a saved 220 means the user never
    // dragged the splitter, so take the new default instead.
    if (v === 220) return 150;
    return Number.isFinite(v) && v >= 120 && v <= 480 ? v : 150;
  });
  useEffect(() => {
    localStorage.setItem("lp_editor_bottom_h", String(bottomHeight));
  }, [bottomHeight]);

  // Re-measure Monaco whenever the dock geometry moves (terminal
  // open/close, drag-resize, panel moves). automaticLayout usually
  // catches a resize, but a stale layout would clip the bottom
  // lines of the file — so force a layout pass here as well.
  useEffect(() => {
    editorRef.current?.layout();
  }, [bottomHeight, panelZones, showExplorer, showTerminal, showAi]);

  function isPanelVisible(id: PanelId): boolean {
    return id === "explorer" ? showExplorer : id === "terminal" ? showTerminal : showAi;
  }
  function setPanelVisible(id: PanelId, v: boolean) {
    if (id === "explorer") setShowExplorer(v);
    else if (id === "terminal") setShowTerminal(v);
    else setShowAi(v);
  }
  function movePanelToZone(id: PanelId, zone: PanelZone) {
    // AI is a side panel only — it never docks at the bottom.
    if (id === "ai" && zone === "bottom") return;
    setPanelZones((p) => ({ ...p, [id]: zone }));
  }
  return {
    showExplorer, setShowExplorer, showTerminal, setShowTerminal,
    showAi, setShowAi, panelZones, setPanelZones,
    draggingPanel, setDraggingPanel, dropZone, setDropZone, dockRef,
    bottomHeight, setBottomHeight,
    isPanelVisible, setPanelVisible, movePanelToZone,
  };
}
