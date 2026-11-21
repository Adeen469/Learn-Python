'use client';

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// VS Code-style context menu for the editor's file tree: opens on
// right-click (PC) or long-press (mobile) — both fire the `contextmenu`
// event, so one handler covers both. Only web-compatible actions live
// here (wabepp rule).

export interface ContextMenuItem {
  id: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  /** Destructive action (Delete) — red label. */
  danger?: boolean;
  /** Renders a divider instead of a clickable item. */
  separator?: boolean;
  action?: () => void;
}

interface EditorContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function EditorContextMenu({ x, y, items, onClose }: EditorContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  // Clamp the menu inside the viewport once its size is known.
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      left: Math.max(4, Math.min(x, window.innerWidth - rect.width - 4)),
      top: Math.max(4, Math.min(y, window.innerHeight - rect.height - 4)),
    });
  }, [x, y]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Transparent overlay: a tap/click anywhere else closes the menu
          without selecting whatever is underneath. */}
      <div
        className="fixed inset-0 z-40"
        onPointerDown={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        ref={menuRef}
        role="menu"
        style={{ left: pos.left, top: pos.top }}
        className="fixed z-50 min-w-[220px] overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 py-1 shadow-2xl shadow-black/60"
      >
        {items.map((item) =>
          item.separator ? (
            <div key={item.id} className="mx-2 my-1 border-t border-neutral-800" />
          ) : (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                onClose();
                item.action?.();
              }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition disabled:opacity-40 ${
                item.danger
                  ? "text-red-300 hover:bg-red-500/10"
                  : "text-neutral-200 hover:bg-neutral-800"
              }`}
            >
              <span className="flex-1 truncate">{item.label}</span>
              {item.shortcut && (
                <span className="shrink-0 font-mono text-[10px] text-neutral-500">{item.shortcut}</span>
              )}
            </button>
          )
        )}
      </div>
    </>
  );
}
