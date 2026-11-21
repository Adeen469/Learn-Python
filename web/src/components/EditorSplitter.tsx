'use client';

import { useRef, useState } from "react";

// Draggable divider between two editor panels (Explorer | Editor |
// Terminal), like the splitters in VS Code. Drag resizes the panel;
// double-click resets it to its default size. Pointer events cover
// mouse and touch, so it works on mobile too.

interface EditorSplitterProps {
  /** Called with the pixel delta while dragging (horizontal for a
      vertical splitter, vertical for a horizontal one). */
  onDrag: (deltaPx: number) => void;
  /** Called on double-click — the parent resets to the default size. */
  onReset: () => void;
  disabled?: boolean;
  label: string;
  /** "vertical" splits left/right (default); "horizontal" splits
      top/bottom (the bottom dock zone). */
  orientation?: "vertical" | "horizontal";
}

export function EditorSplitter({ onDrag, onReset, disabled, label, orientation = "vertical" }: EditorSplitterProps) {
  const dragRef = useRef<{ start: number; last: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const horizontal = orientation === "horizontal";

  if (disabled) return null;

  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation={orientation}
      title={`${label} — drag to resize, double-click to reset`}
      onPointerDown={(e) => {
        e.preventDefault();
        const pos = horizontal ? e.clientY : e.clientX;
        dragRef.current = { start: pos, last: pos };
        setDragging(true);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = dragRef.current;
        if (!d) return;
        const pos = horizontal ? e.clientY : e.clientX;
        const delta = pos - d.last;
        d.last = pos;
        if (delta !== 0) onDrag(delta);
      }}
      onPointerUp={() => {
        dragRef.current = null;
        setDragging(false);
      }}
      onPointerCancel={() => {
        dragRef.current = null;
        setDragging(false);
      }}
      onDoubleClick={onReset}
      className={`relative shrink-0 touch-none select-none ${
        horizontal
          ? "h-[5px] w-full cursor-row-resize"
          : "hidden w-[5px] cursor-col-resize md:block"
      } ${dragging ? "bg-white/40" : "bg-transparent hover:bg-white/25"}`}
    />
  );
}
