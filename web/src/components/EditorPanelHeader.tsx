'use client';

import type { ReactNode } from "react";
import { GripVertical, X } from "lucide-react";

// Draggable header for a dockable editor side panel (Explorer,
// Terminal, AI). Drag the header onto the left / right / bottom drop
// zones to dock the panel there. The header's own buttons are NOT
// draggable, so they stay clickable.

export type DockPanelId = "explorer" | "terminal" | "ai";

interface EditorPanelHeaderProps {
  id: DockPanelId;
  /** Header title (icon + text). */
  title: ReactNode;
  /** Extra header buttons (new file, clear, …). Not draggable. */
  actions?: ReactNode;
  onDragStart: (id: DockPanelId) => void;
  onDragEnd: () => void;
  onClose: () => void;
  closeLabel: string;
}

export function EditorPanelHeader({
  id,
  title,
  actions,
  onDragStart,
  onDragEnd,
  onClose,
  closeLabel,
}: EditorPanelHeaderProps) {
  return (
    <div
      className="flex shrink-0 cursor-grab select-none items-center gap-1 border-b border-neutral-800 bg-black/60 px-2 py-1.5 active:cursor-grabbing"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", `lp-panel:${id}`);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(id);
      }}
      onDragEnd={onDragEnd}
      title="Drag to move this panel"
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
      <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </span>
      <span className="flex-1" />
      {actions}
      <button
        type="button"
        draggable={false}
        onClick={onClose}
        aria-label={closeLabel}
        title={closeLabel}
        className="shrink-0 rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
