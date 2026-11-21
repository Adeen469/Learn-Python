'use client';

import { isValidElement, useLayoutEffect, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  CursorPointer01Icon,
  Download04Icon,
  Layers01Icon,
  Notification03Icon,
  PaintBoardIcon,
  Rocket01Icon,
  Settings02Icon,
  TextFontIcon
} from '@hugeicons/core-free-icons';
import './BranchedMenu.css';

// BranchedMenu — vendored from React Bits (reactbits.dev), converted
// to TypeScript. A nav of foldable sections whose children hang off a
// trunk line with curved SVG branches; an accent marker glides to the
// active row.
//
// Local adaptations (kept minimal, marked where they land):
// - label is ReactNode (not just string) so the editor tree can put
//   an unsaved-dot next to a file name; section items may carry an
//   optional icon (the editor passes the lucide Folder icon).
// - Section heads render the fold chevron (ChevronDown/Right) + the
//   section icon, preserving the editor tree's folder row look.
// - activeValue / openSections: optional controlled props. When the
//   parent passes them, the component follows the parent's state
//   (the editor's activeFilePath / expandedFolders) instead of its
//   own internal state, so creating or deleting a file updates the
//   highlight and the fold state. Without them the upstream
//   uncontrolled behaviour (defaultOpen / defaultActive) applies.
// - renderRowActions: optional per-row trailing content (the editor
//   renders each row's delete button there). Rows are wrapped in a
//   row container only when it is provided, so the upstream DOM is
//   untouched otherwise. A button cannot live inside a button, so
//   the actions sit beside the row button, not inside it.
// - Drag props (onRowDragStart / onRowDragOver / onRowDragLeave /
//   onRowDrop + dragOverValue): the editor's internal drag & drop
//   (move a file/folder into a folder) needs draggable rows and
//   folder drop targets. Rows are draggable only when a drag-start
//   handler is provided; the row whose value equals dragOverValue
//   gets data-drag-over for the drop-target highlight.
// - className "branched-menu--full" (see the CSS) makes the menu
//   fill its container instead of shrinking to its content — the
//   editor's explorer column wants full-width rows.

const DEFAULT_ITEMS: BranchedMenuItem[] = [
  {
    label: 'Getting started',
    children: [
      { value: 'install', label: 'Installation', icon: Download04Icon },
      { value: 'quick', label: 'Quick start', icon: Rocket01Icon },
      { value: 'config', label: 'Configuration', icon: Settings02Icon },
      { value: 'theming', label: 'Theming', icon: PaintBoardIcon }
    ]
  },
  {
    label: 'Components',
    children: [
      { value: 'buttons', label: 'Buttons', icon: CursorPointer01Icon },
      { value: 'typography', label: 'Typography', icon: TextFontIcon },
      { value: 'overlays', label: 'Overlays', icon: Layers01Icon },
      { value: 'toasts', label: 'Toasts', icon: Notification03Icon }
    ]
  }
];
const PAD = 6;
const MARK = 16;

export interface BranchedMenuItem {
  label: ReactNode;
  value?: string;
  /** Optional icon rendered beside the label (lucide element or a Hugeicons icon). */
  icon?: ReactNode | IconSvgElement;
  /** Children make this a foldable section; without them it is a selectable leaf. */
  children?: BranchedMenuItem[];
}

export interface BranchedMenuProps {
  items?: BranchedMenuItem[];
  defaultOpen?: number | number[];
  defaultActive?: string;
  /** Controlled active value (a child's or leaf's value). Overrides the internal state. */
  activeValue?: string;
  /** Controlled open section indices. Overrides the internal open set. */
  openSections?: number[];
  onSelect?: (value: string, item: BranchedMenuItem) => void;
  onToggle?: (index: number, open: boolean) => void;
  color?: string;
  accentColor?: string;
  lineColor?: string;
  width?: number;
  rowHeight?: number;
  indent?: number;
  trunk?: number;
  radius?: number;
  lineWidth?: number;
  fontSize?: number;
  drawDuration?: number;
  foldDuration?: number;
  className?: string;
  /** Optional trailing content per row (e.g. a delete button). */
  renderRowActions?: (item: BranchedMenuItem) => ReactNode;
  onRowDragStart?: (e: DragEvent, value: string, item: BranchedMenuItem) => void;
  onRowDragOver?: (e: DragEvent, value: string, item: BranchedMenuItem) => void;
  onRowDragLeave?: (value: string, item: BranchedMenuItem) => void;
  onRowDrop?: (e: DragEvent, value: string, item: BranchedMenuItem) => void;
  /** Value of the row currently dragged over (drop-target highlight). */
  dragOverValue?: string | null;
  /** Right-click / long-press on a row (both fire `contextmenu`) — the
      editor opens its VS Code-style context menu for that row. */
  onRowContextMenu?: (e: ReactMouseEvent, value: string, item: BranchedMenuItem) => void;
}

const renderIcon = (icon: ReactNode | IconSvgElement) =>
  isValidElement(icon) ? icon : <HugeiconsIcon icon={icon as IconSvgElement} size={16} strokeWidth={1.8} />;
const toSet = (open: number | number[] | undefined) =>
  new Set(Array.isArray(open) ? open : open !== undefined && open >= 0 ? [open] : []);

export default function BranchedMenu({
  items = DEFAULT_ITEMS,
  defaultOpen = 0,
  defaultActive = '',
  activeValue,
  openSections,
  onSelect,
  onToggle,
  color = '#f5f5f5',
  accentColor = '#f5f5f5',
  lineColor = '#3f3f46',
  width = 240,
  rowHeight = 36,
  indent = 40,
  trunk = 14,
  radius = 10,
  lineWidth = 1.5,
  fontSize = 14,
  drawDuration = 400,
  foldDuration = 300,
  className = '',
  renderRowActions,
  onRowDragStart,
  onRowDragOver,
  onRowDragLeave,
  onRowDrop,
  dragOverValue = null,
  onRowContextMenu
}: BranchedMenuProps) {
  const [openInternal, setOpenInternal] = useState(() => toSet(defaultOpen));
  const open = openSections !== undefined ? toSet(openSections) : openInternal;
  const [activeInternal, setActiveInternal] = useState(() => {
    if (defaultActive) return defaultActive;
    const first = items.find((it, i) => it.children && toSet(defaultOpen).has(i));
    return first?.children?.[0]?.value ?? '';
  });
  const active = activeValue !== undefined ? activeValue : activeInternal;
  const navRef = useRef<HTMLElement | null>(null);
  const heads = useRef<(HTMLButtonElement | null)[]>([]);
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const latest = useRef<{ onSelect?: BranchedMenuProps['onSelect']; onToggle?: BranchedMenuProps['onToggle'] }>({});
  latest.current = { onSelect, onToggle };

  const activeSection = items.findIndex((it) => it.children?.some((kid) => kid.value === active));
  const markerShown = activeSection >= 0 && open.has(activeSection);
  useLayoutEffect(() => {
    const place = (glide: boolean) => {
      const m = markerRef.current;
      const el = heads.current[activeSection];
      if (!m) return;
      const on = markerShown && el;
      if (!glide) m.style.transition = 'none';
      if (on) m.style.top = `${el.offsetTop + (el.offsetHeight - MARK) / 2}px`;
      m.toggleAttribute('data-on', Boolean(on));
      if (!glide) {
        void m.offsetHeight;
        m.style.transition = '';
      }
    };
    place(true);
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      place(false);
    });
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [activeSection, markerShown, items, fontSize, rowHeight]);

  const select = (value: string, item: BranchedMenuItem) => {
    if (activeValue === undefined) setActiveInternal(value);
    latest.current.onSelect?.(value, item);
  };
  const toggle = (i: number) => {
    const isOpen = !open.has(i);
    if (openSections === undefined) {
      setOpenInternal((prev) => {
        const next = new Set(prev);
        if (isOpen) next.add(i);
        else next.delete(i);
        return next;
      });
    }
    latest.current.onToggle?.(i, isOpen);
  };

  const r = Math.min(radius, rowHeight / 2 - 2);
  const endX = indent - 8;
  const rowY = (k: number) => PAD + k * rowHeight + rowHeight / 2;
  const branch = (k: number) => `M ${trunk} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const reach = (k: number) => `M ${trunk} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const length = (k: number) => rowY(k) - r + (Math.PI * r) / 2 + (endX - trunk - r);

  // Drag wiring for one row: rows are draggable only when the parent
  // gave us a drag-start handler; the drop-target highlight follows
  // dragOverValue. `value` is the row's stable id (a file/folder path
  // in the editor tree).
  const rowDragProps = (value: string, item: BranchedMenuItem) => ({
    draggable: !!onRowDragStart,
    onDragStart: onRowDragStart ? (e: DragEvent) => onRowDragStart(e, value, item) : undefined,
    onDragOver: onRowDragOver ? (e: DragEvent) => onRowDragOver(e, value, item) : undefined,
    onDragLeave: onRowDragLeave ? () => onRowDragLeave(value, item) : undefined,
    onDrop: onRowDrop ? (e: DragEvent) => onRowDrop(e, value, item) : undefined,
    'data-drag-over': dragOverValue !== null && dragOverValue === value ? '' : undefined,
  });

  // Right-click / long-press on a row. Both fire `contextmenu`, so one
  // handler covers PC and mobile. preventDefault stops the browser's
  // own menu (and the mobile callout); the parent opens its menu.
  const rowContextMenuProps = (value: string, item: BranchedMenuItem) => ({
    onContextMenu: onRowContextMenu
      ? (e: ReactMouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          onRowContextMenu(e, value, item);
        }
      : undefined,
  });

  // Wrap a row button with its trailing actions when the parent
  // renders any; otherwise return the button unwrapped (upstream DOM).
  // `key` lands on the wrapper so React's list keys stay correct.
  const withActions = (button: ReactNode, item: BranchedMenuItem, rowClass: string, dragValue: string, key: string) =>
    renderRowActions ? (
      <div
        key={key}
        className={rowClass}
        data-drag-over={dragOverValue !== null && dragOverValue === dragValue ? '' : undefined}
      >
        {button}
        <span className="branched-menu__actions">{renderRowActions(item)}</span>
      </div>
    ) : (
      button
    );

  return (
    <nav
      ref={navRef}
      className={`branched-menu${className ? ` ${className}` : ''}`}
      style={
        {
          '--bm-w': `${width}px`,
          '--bm-ink': color,
          '--bm-accent': accentColor,
          '--bm-line': lineColor,
          '--bm-font': `${fontSize}px`,
          '--bm-row': `${rowHeight}px`,
          '--bm-indent': `${indent}px`,
          '--bm-line-w': lineWidth,
          '--bm-draw': `${drawDuration}ms`,
          '--bm-fold': `${foldDuration}ms`
        } as CSSProperties
      }
    >
      <span ref={markerRef} className="branched-menu__marker" aria-hidden="true" />
      {items.map((item, i) => {
        const kids = item.children;
        const isOpen = kids ? open.has(i) : false;
        const leafValue = item.value ?? (typeof item.label === 'string' ? item.label : '');
        const leafActive = !kids && leafValue === active;
        const bodyH = kids ? PAD * 2 + kids.length * rowHeight : 0;
        const headButton = (
          <button
            ref={(el) => {
              heads.current[i] = el;
            }}
            type="button"
            className="branched-menu__head"
            aria-expanded={kids ? isOpen : undefined}
            aria-current={leafActive ? 'true' : undefined}
            data-active={leafActive ? '' : undefined}
            onClick={() => (kids ? toggle(i) : select(leafValue, item))}
            {...rowDragProps(leafValue, item)}
            {...rowContextMenuProps(leafValue, item)}
          >
            {kids ? (
              isOpen ? (
                <ChevronDown className="branched-menu__head-chevron" aria-hidden="true" />
              ) : (
                <ChevronRight className="branched-menu__head-chevron" aria-hidden="true" />
              )
            ) : null}
            {item.icon ? (
              <span className="branched-menu__head-icon" aria-hidden="true">
                {renderIcon(item.icon)}
              </span>
            ) : null}
            <span className="branched-menu__head-label">{item.label}</span>
          </button>
        );
        return (
          <div key={item.value ?? (typeof item.label === 'string' ? item.label : `section-${i}`)} className="branched-menu__section" data-open={isOpen ? '' : undefined}>
            {withActions(headButton, item, 'branched-menu__head-row', leafValue, `head-${leafValue || i}`)}
            {kids ? (
              <div className="branched-menu__body">
                <div className="branched-menu__fold">
                  <div className="branched-menu__tree" style={{ height: bodyH }}>
                    <svg className="branched-menu__lines" width={indent} height={bodyH} aria-hidden="true">
                      <path className="branched-menu__base" d={`M ${trunk} 0 V ${rowY(kids.length - 1) - r}`} />
                      {kids.map((kid, k) => (
                        <path key={kid.value ?? `branch-${k}`} className="branched-menu__base" d={branch(k)} />
                      ))}
                      {kids.map((kid, k) => (
                        <path
                          key={kid.value ?? `reach-${k}`}
                          className="branched-menu__reach"
                          d={reach(k)}
                          style={{
                            strokeDasharray: length(k),
                            strokeDashoffset: kid.value === active ? 0 : length(k)
                          }}
                        />
                      ))}
                    </svg>
                    {kids.map((kid, k) => {
                      const kidValue = kid.value ?? '';
                      const kidButton = (
                        <button
                          key={kid.value ?? `kid-${k}`}
                          type="button"
                          className="branched-menu__item"
                          aria-current={kid.value === active ? 'true' : undefined}
                          data-active={kid.value === active ? '' : undefined}
                          tabIndex={isOpen ? 0 : -1}
                          onClick={() => select(kidValue, kid)}
                          {...rowDragProps(kidValue, kid)}
                          {...rowContextMenuProps(kidValue, kid)}
                        >
                          {kid.icon ? (
                            <span className="branched-menu__icon" aria-hidden="true">
                              {renderIcon(kid.icon)}
                            </span>
                          ) : null}
                          <span className="branched-menu__label">{kid.label}</span>
                        </button>
                      );
                      return withActions(kidButton, kid, 'branched-menu__item-row', kidValue, `item-${kidValue || k}`);
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
