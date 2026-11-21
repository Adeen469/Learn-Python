'use client';

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

// VS Code-style menu bar for the Code Editor: File / Edit / View / Run /
// Terminal. Each menu opens a dropdown; clicking another menu while one
// is open switches to it, hovering switches too (VS Code behaviour).
// Only web-compatible actions live here (wabepp rule) — anything that
// needs the OS belongs in the native APK / Tauri EXE, not the website.

export interface EditorMenuItem {
  id: string;
  label: string;
  shortcut?: string;
  /** Toggle state (e.g. Auto Save) — shows a checkmark. */
  checked?: boolean;
  disabled?: boolean;
  /** Destructive action (Delete) — red label. */
  danger?: boolean;
  /** Renders a divider instead of a clickable item. */
  separator?: boolean;
  action?: () => void;
}

export interface EditorMenu {
  id: string;
  label: string;
  items: EditorMenuItem[];
}

interface EditorMenuBarProps {
  menus: EditorMenu[];
  /** Right-side content (auto-save indicator). */
  right?: ReactNode;
}

export function EditorMenuBar({ menus, right }: EditorMenuBarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  // Close on a click outside the bar, or on Escape.
  useEffect(() => {
    if (!openMenuId) return;
    const onPointerDown = (e: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenuId]);

  function runItem(item: EditorMenuItem) {
    if (item.disabled || item.separator) return;
    setOpenMenuId(null);
    item.action?.();
  }

  return (
    <div
      ref={barRef}
      className="relative flex items-center gap-0.5 rounded-xl border border-neutral-800 bg-neutral-950 px-2 py-1 select-none"
      role="menubar"
      aria-label="Editor menu"
    >
      {menus.map((menu) => {
        const open = openMenuId === menu.id;
        return (
          <div key={menu.id} className="relative">
            <button
              type="button"
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={open}
              onClick={() => setOpenMenuId(open ? null : menu.id)}
              onMouseEnter={() => {
                if (openMenuId) setOpenMenuId(menu.id);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                open ? "bg-neutral-800 text-white" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {menu.label}
            </button>
            {open && (
              <div
                role="menu"
                className="absolute left-0 top-full z-50 mt-1 min-w-[220px] overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 py-1 shadow-2xl shadow-black/60"
              >
                {menu.items.map((item) =>
                  item.separator ? (
                    <div key={item.id} className="mx-2 my-1 border-t border-neutral-800" />
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      disabled={item.disabled}
                      onClick={() => runItem(item)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition disabled:opacity-40 ${
                        item.danger
                          ? "text-red-300 hover:bg-red-500/10"
                          : "text-neutral-200 hover:bg-neutral-800"
                      }`}
                    >
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                        {item.checked && <Check className="h-3.5 w-3.5 text-white" />}
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.shortcut && (
                        <span className="shrink-0 font-mono text-[10px] text-neutral-500">{item.shortcut}</span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}
