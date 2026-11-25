// PDF viewer built on pdf.js: pages render to canvas with a text
// layer (selectable text), and the header above it carries the
// toolbar Maalik asked for (Edge-style, minus translate / draw /
// eraser; "Ask Copilot" is "Ask AI" and opens the editor AI with
// this document as its reference). Every control works — none is
// decorative. Annotations (highlights, text notes) are session-only:
// a PDF cannot be saved back, so they live in memory until the
// file is closed.
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Highlighter,
  Maximize2,
  Minus,
  MoreHorizontal,
  PanelLeft,
  PenLine,
  Plus,
  Printer,
  RotateCw,
  Search,
  Sparkles,
  Square,
  Type,
  Volume2,
  X,
} from "lucide-react";
import type { PDFDocumentProxy, PDFPageProxy, PageViewport, TextLayer as PdfTextLayer } from "pdfjs-dist";
import type { Strings } from "@/lib/i18n";
import { TetrominoLoader } from "./TetrominoLoader";
import type { FileViewerSource } from "./FileViewer";

export type PdfAskAiContext = { fileName: string; text: string };

export type PdfViewerProps = {
  t: Strings;
  fileName: string;
  source: FileViewerSource;
  loadErrorText: string;
  onAskAi: (ctx: PdfAskAiContext) => void;
};

// A rectangle in PDF points (origin bottom-left, unrotated page
// space) — rotation-proof, because the page viewport converts it
// back to screen pixels on every render.
export type PdfRect = { x1: number; y1: number; x2: number; y2: number };
export type PdfNote = { id: string; x: number; y: number; text: string };

const AI_CONTEXT_MAX = 8000; // /api/ai caps `code` at MAX_INPUT_CHARS.
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    // The worker MUST be a real asset URL: the `?url` dynamic
    // import bundled the worker as a JS chunk instead, so
    // `worker.default` was undefined and the workerSrc setter
    // threw ("Invalid `workerSrc` type.") — every PDF failed to
    // load with a silent "Could not preview this file." The
    // `new URL(..., import.meta.url)` pattern is the documented
    // webpack way: the worker file is emitted as a static asset
    // and this becomes its same-origin public URL (CSP
    // `worker-src 'self'` covers it, no CDN, no public/ copy).
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }
  return pdfjs;
}

function pageText(items: Array<{ str?: string; hasEOL?: boolean }>): string {
  let out = "";
  for (const it of items) {
    if (typeof it.str === "string") out += it.str;
    if (it.hasEOL) out += "\n";
  }
  return out;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function rectToViewport(r: PdfRect, viewport: PageViewport): { x: number; y: number; w: number; h: number } {
  const [ax, ay] = viewport.convertToViewportPoint(r.x1, r.y1);
  const [bx, by] = viewport.convertToViewportPoint(r.x2, r.y2);
  return {
    x: Math.min(ax, bx),
    y: Math.min(ay, by),
    w: Math.abs(bx - ax),
    h: Math.abs(by - ay),
  };
}

// One rendered page: canvas + text layer + overlays (search marks,
// highlight annotations, text notes). The text layer is never
// mutated — search marks are overlay rects read off Ranges, so
// zooming or rotating just re-derives them.
function PdfPage({
  doc,
  pageNum,
  scale,
  rotation,
  searchMatches,
  currentMatch,
  highlights,
  notes,
  showHighlights,
  showNotes,
  placingText,
  onPlaceText,
  onNoteChange,
  onNoteDelete,
  onTextContent,
  onViewport,
  registerEl,
  onPageRendered,
}: {
  doc: PDFDocumentProxy;
  pageNum: number;
  scale: number;
  rotation: number;
  searchMatches: Array<{ start: number; end: number }>;
  currentMatch: { start: number; end: number } | null;
  highlights: PdfRect[];
  notes: PdfNote[];
  showHighlights: boolean;
  showNotes: boolean;
  placingText: boolean;
  onPlaceText: (pageNum: number, point: { x: number; y: number }) => void;
  onNoteChange: (pageNum: number, note: PdfNote) => void;
  onNoteDelete: (pageNum: number, id: string) => void;
  onTextContent: (pageNum: number, text: string) => void;
  onViewport: (pageNum: number, viewport: PageViewport) => void;
  registerEl: (pageNum: number, el: HTMLDivElement | null) => void;
  // Fired once this page's canvas has actually painted — the
  // viewer keeps its loader up until the first page renders, so
  // the pane never flashes blank between "document loaded" and
  // "content on screen".
  onPageRendered?: (pageNum: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [viewport, setViewport] = useState<PageViewport | null>(null);
  const [searchRects, setSearchRects] = useState<Array<{ x: number; y: number; w: number; h: number; current: boolean }>>([]);
  const [textDivs, setTextDivs] = useState<HTMLElement[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

  // Render canvas + text layer. A new render cancels the old one.
  useEffect(() => {
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<void> } | null = null;
    let textLayer: PdfTextLayer | null = null;
    void (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const page: PDFPageProxy = await doc.getPage(pageNum);
        if (cancelled) return;
        const vp = page.getViewport({ scale, rotation });
        setSize({ w: vp.width, h: vp.height });
        setViewport(vp);
        onViewport(pageNum, vp);
        const canvas = canvasRef.current;
        const textLayerDiv = textLayerRef.current;
        if (!canvas || !textLayerDiv) return;
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.floor(vp.width * outputScale));
        canvas.height = Math.max(1, Math.floor(vp.height * outputScale));
        canvas.style.width = `${vp.width}px`;
        canvas.style.height = `${vp.height}px`;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        renderTask = page.render({
          canvas,
          canvasContext: ctx,
          viewport: vp,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        });
        void renderTask.promise
          .then(() => {
            if (!cancelled) onPageRendered?.(pageNum);
          })
          .catch(() => {
            // Cancelled renders throw — nothing to report.
          });
        const textContent = await page.getTextContent();
        if (cancelled) return;
        onTextContent(pageNum, pageText(textContent.items as Array<{ str?: string; hasEOL?: boolean }>));
        textLayerDiv.innerHTML = "";
        textLayer = new pdfjs.TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport: vp,
        });
        await textLayer.render();
        if (cancelled) return;
        setTextDivs([...textLayer.textDivs]);
      } catch {
        // Cancelled renders throw; a real failure surfaces as a
        // blank page and the viewer's load error already covers a
        // bad document, so there is nothing else to report here.
      }
    })();
    return () => {
      cancelled = true;
      try {
        renderTask?.cancel();
      } catch {
        // Already finished — nothing to cancel.
      }
      try {
        textLayer?.cancel();
      } catch {
        // Already finished — nothing to cancel.
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, pageNum, scale, rotation]);

  // Search marks: exact rects for every match on this page, read
  // off Ranges over the text-layer spans (no DOM mutation, so a
  // zoom or rotate just re-derives them).
  useEffect(() => {
    if (searchMatches.length === 0 || textDivs.length === 0 || !wrapRef.current) {
      setSearchRects([]);
      return;
    }
    const wrapBox = wrapRef.current.getBoundingClientRect();
    const rects: Array<{ x: number; y: number; w: number; h: number; current: boolean }> = [];
    // Offsets of each text item in the page's joined text.
    let offset = 0;
    const items = textDivs.map((div) => {
      const text = div.textContent ?? "";
      const start = offset;
      offset += text.length;
      return { div, start, end: offset };
    });
    for (const m of searchMatches) {
      const isCurrent = currentMatch !== null && m.start === currentMatch.start && m.end === currentMatch.end;
      for (const item of items) {
        const s = Math.max(m.start, item.start);
        const e = Math.min(m.end, item.end);
        if (s >= e) continue;
        const node = item.div.firstChild;
        if (!node || node.nodeType !== Node.TEXT_NODE) continue;
        try {
          const range = document.createRange();
          range.setStart(node, s - item.start);
          range.setEnd(node, e - item.start);
          for (const r of Array.from(range.getClientRects())) {
            if (r.width === 0 && r.height === 0) continue;
            rects.push({
              x: r.left - wrapBox.left,
              y: r.top - wrapBox.top,
              w: r.width,
              h: r.height,
              current: isCurrent,
            });
          }
        } catch {
          // A range over a changed node — skip that fragment.
        }
      }
    }
    setSearchRects(rects);
  }, [searchMatches, currentMatch, textDivs]);

  // The current match scrolls into view (single page: inside the
  // pane; continuous: the page itself is scrolled to by the parent).
  const currentRectRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (currentMatch) currentRectRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [currentMatch, searchRects]);

  return (
    <div
      ref={(el) => {
        wrapRef.current = el;
        registerEl(pageNum, el);
      }}
      data-pdf-page={pageNum}
      className="relative shrink-0 bg-white shadow-lg"
      style={size ? { width: size.w, height: size.h } : { width: 600, height: 800 }}
      onClick={(e) => {
        if (!placingText || !viewport || !wrapRef.current) return;
        const box = wrapRef.current.getBoundingClientRect();
        const [x, y] = viewport.convertToPdfPoint(e.clientX - box.left, e.clientY - box.top);
        onPlaceText(pageNum, { x, y });
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        ref={textLayerRef}
        className="lp-pdf-textlayer absolute inset-0 overflow-hidden"
        style={{ cursor: placingText ? "crosshair" : undefined }}
      />
      {/* Search marks */}
      {searchRects.map((r, i) => (
        <div
          key={`s-${i}`}
          ref={r.current ? currentRectRef : undefined}
          className="pointer-events-none absolute rounded-[1px]"
          style={{
            left: r.x,
            top: r.y,
            width: Math.max(2, r.w),
            height: Math.max(2, r.h),
            background: r.current ? "rgba(249, 115, 22, 0.55)" : "rgba(59, 130, 246, 0.35)",
          }}
        />
      ))}
      {/* Highlight annotations (PDF-point rects, viewport-converted) */}
      {showHighlights &&
        viewport &&
        highlights.map((r, i) => {
          const v = rectToViewport(r, viewport);
          return (
            <div
              key={`h-${i}`}
              className="pointer-events-none absolute rounded-[1px]"
              style={{ left: v.x, top: v.y, width: Math.max(2, v.w), height: Math.max(2, v.h), background: "rgba(250, 204, 21, 0.5)" }}
            />
          );
        })}
      {/* Text notes */}
      {showNotes &&
        viewport &&
        notes.map((n) => {
          const [x, y] = viewport.convertToViewportPoint(n.x, n.y);
          const editing = editingNoteId === n.id;
          return (
            <div
              key={n.id}
              className="absolute z-10 max-w-56 rounded border border-yellow-600/60 bg-yellow-100 px-2 py-1 text-xs text-yellow-900 shadow"
              style={{ left: x, top: y }}
              onClick={(e) => e.stopPropagation()}
            >
              {editing ? (
                <textarea
                  autoFocus
                  value={draftText}
                  rows={3}
                  onChange={(e) => setDraftText(e.target.value)}
                  onBlur={() => {
                    onNoteChange(pageNum, { ...n, text: draftText });
                    setEditingNoteId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onNoteChange(pageNum, { ...n, text: draftText });
                      setEditingNoteId(null);
                    }
                    if (e.key === "Escape") setEditingNoteId(null);
                  }}
                  className="w-full resize-none bg-transparent outline-none"
                />
              ) : (
                <div className="flex items-start gap-1">
                  <span
                    className="flex-1 whitespace-pre-wrap break-words"
                    onClick={() => {
                      setDraftText(n.text);
                      setEditingNoteId(n.id);
                    }}
                  >
                    {n.text || "…"}
                  </span>
                  <button
                    type="button"
                    aria-label="Delete note"
                    onClick={() => onNoteDelete(pageNum, n.id)}
                    className="rounded p-0.5 text-yellow-700 hover:bg-yellow-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

// ------------------------------------------------------------------
// PdfViewer
// ------------------------------------------------------------------
export function PdfViewer({ t, fileName, source, loadErrorText, onAskAi }: PdfViewerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loadError, setLoadError] = useState(false);
  // True once the first page's canvas has actually painted — the
  // loader stays up until content is on screen, never just until
  // the document object exists.
  const [renderedOnce, setRenderedOnce] = useState(false);
  const [fileSize, setFileSize] = useState(0);
  const [docTitle, setDocTitle] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [fitMode, setFitMode] = useState<"page" | "width" | "custom">("page");
  const [pageSize, setPageSize] = useState<{ w: number; h: number } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState<"single" | "continuous">("single");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [matches, setMatches] = useState<Array<{ page: number; start: number; end: number }>>([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(-1);
  const [highlights, setHighlights] = useState<Record<number, PdfRect[]>>({});
  const [notes, setNotes] = useState<Record<number, PdfNote[]>>({});
  const [annotateOn, setAnnotateOn] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [placingText, setPlacingText] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [menuOpen, setMenuOpen] = useState<"view" | "more" | "filter" | null>(null);
  const [propsOpen, setPropsOpen] = useState(false);
  const [printImages, setPrintImages] = useState<string[] | null>(null);
  const [printBusy, setPrintBusy] = useState(false);
  const pageTextsRef = useRef<Map<number, string>>(new Map());
  const [extractedCount, setExtractedCount] = useState(0);
  const viewportsRef = useRef<Map<number, PageViewport>>(new Map());
  const pageElsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const scrollRafRef = useRef(0);

  // Load the document (fetch bytes once; pdf.js parses from memory).
  useEffect(() => {
    let cancelled = false;
    setDoc(null);
    setNumPages(0);
    setLoadError(false);
    setRenderedOnce(false);
    setPage(1);
    setFitMode("page");
    setHighlights({});
    setNotes({});
    setMatches([]);
    setCurrentMatchIdx(-1);
    setFindQuery("");
    setFindOpen(false);
    setThumbs([]);
    pageTextsRef.current = new Map();
    setExtractedCount(0);
    void (async () => {
      try {
        if (source.type !== "url") throw new Error("pdf needs bytes");
        const pdfjs = await loadPdfjs();
        const buf = await (await fetch(source.url)).arrayBuffer();
        if (cancelled) return;
        setFileSize(buf.byteLength);
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buf) });
        const d = await loadingTask.promise;
        if (cancelled) return;
        setDoc(d);
        setNumPages(d.numPages);
        try {
          const meta = await d.getMetadata();
          const info = (meta?.info ?? {}) as { Title?: string };
          if (typeof info.Title === "string" && info.Title) setDocTitle(info.Title);
        } catch {
          // Metadata is best-effort.
        }
        // Background text extraction (Ask AI + search + read aloud).
        void (async () => {
          for (let n = 1; n <= d.numPages; n++) {
            if (cancelled) break;
            try {
              const p = await d.getPage(n);
              const tc = await p.getTextContent();
              pageTextsRef.current.set(
                n,
                pageText(tc.items as Array<{ str?: string; hasEOL?: boolean }>)
              );
              setExtractedCount((c) => c + 1);
            } catch {
              // One unreadable page must not block the rest.
            }
          }
        })();
      } catch {
        if (!cancelled) setLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
      try {
        speechSynthesis.cancel();
      } catch {
        // No speech — nothing to stop.
      }
      setSpeaking(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  // First-page size (rotated) — the fit calculation's input.
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    void (async () => {
      try {
        const p = await doc.getPage(1);
        if (cancelled) return;
        const vp = p.getViewport({ scale: 1, rotation });
        setPageSize({ w: vp.width, h: vp.height });
      } catch {
        // Fit falls back to the container size alone.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, rotation]);

  // Fit follows the pane: on resize (or a fit-mode / page-size /
  // rotation change) the scale is recomputed from the container.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || fitMode === "custom" || !pageSize) return;
    const apply = () => {
      const cw = el.clientWidth - 32;
      const ch = el.clientHeight - 32;
      if (cw <= 0 || ch <= 0) return;
      setScale(
        fitMode === "page"
          ? Math.min(cw / pageSize.w, ch / pageSize.h)
          : cw / pageSize.w
      );
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitMode, pageSize]);

  // Search: every match of the query across the extracted pages.
  useEffect(() => {
    const q = findQuery.trim().toLowerCase();
    if (!q) {
      setMatches([]);
      setCurrentMatchIdx(-1);
      return;
    }
    const found: Array<{ page: number; start: number; end: number }> = [];
    for (const [n, text] of [...pageTextsRef.current.entries()].sort((a, b) => a[0] - b[0])) {
      const lower = text.toLowerCase();
      let i = lower.indexOf(q);
      while (i !== -1) {
        found.push({ page: n, start: i, end: i + q.length });
        i = lower.indexOf(q, i + Math.max(1, q.length));
      }
    }
    setMatches(found);
    setCurrentMatchIdx(found.length > 0 ? 0 : -1);
  }, [findQuery, extractedCount]);

  // Jumping to the current match changes the page (single mode) or
  // scrolls to it (continuous mode).
  useEffect(() => {
    if (currentMatchIdx < 0 || currentMatchIdx >= matches.length) return;
    const m = matches[currentMatchIdx];
    setPage(m.page);
    if (viewMode === "continuous") {
      pageElsRef.current.get(m.page)?.scrollIntoView({ block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMatchIdx]);

  // Continuous mode: the page number follows the scroll position.
  const onScroll = () => {
    if (viewMode !== "continuous") return;
    cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      let best = 1;
      let bestDist = Infinity;
      for (const [n, pageEl] of pageElsRef.current.entries()) {
        const d = Math.abs(pageEl.getBoundingClientRect().top - top - 8);
        if (d < bestDist) {
          bestDist = d;
          best = n;
        }
      }
      setPage((prev) => (prev === best ? prev : best));
    });
  };

  // Thumbnails, rendered when the sidebar opens.
  useEffect(() => {
    if (!sidebarOpen || !doc) {
      setThumbs([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const out: string[] = [];
      for (let n = 1; n <= numPages; n++) {
        if (cancelled) break;
        try {
          const p = await doc.getPage(n);
          const vp = p.getViewport({ scale: 0.18 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.floor(vp.width));
          canvas.height = Math.max(1, Math.floor(vp.height));
          const ctx = canvas.getContext("2d");
          if (!ctx) break;
          await p.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
          out.push(canvas.toDataURL("image/png"));
          setThumbs([...out]);
        } catch {
          break;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sidebarOpen, doc, numPages]);

  const zoomBy = (factor: number) => {
    setFitMode("custom");
    setScale((s) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(s * factor * 100) / 100)));
  };
  const fitToPage = () => setFitMode("page");
  const goToPage = (n: number) => {
    const next = Math.min(numPages, Math.max(1, n || 1));
    setPage(next);
    if (viewMode === "continuous") {
      pageElsRef.current.get(next)?.scrollIntoView({ block: "start" });
    }
  };

  // Highlight: the user's current selection in the text layer
  // becomes yellow overlay rects (PDF points, so a rotate or zoom
  // keeps them in place). Needs a selection — with none, the
  // button simply has nothing to highlight.
  const highlightSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !rootRef.current || !sel.anchorNode) return;
    if (!rootRef.current.contains(sel.anchorNode)) return;
    const pageEl = (sel.anchorNode as Node).parentElement?.closest?.("[data-pdf-page]") as HTMLElement | null;
    if (!pageEl) return;
    const n = Number(pageEl.dataset.pdfPage ?? "0");
    const viewport = viewportsRef.current.get(n);
    if (!viewport) return;
    const box = pageEl.getBoundingClientRect();
    const rects: PdfRect[] = [];
    for (const r of Array.from(sel.getRangeAt(0).getClientRects())) {
      if (r.width === 0 && r.height === 0) continue;
      const [x1, y1] = viewport.convertToPdfPoint(r.left - box.left, r.top - box.top);
      const [x2, y2] = viewport.convertToPdfPoint(r.right - box.left, r.bottom - box.top);
      rects.push({
        x1: Math.min(x1, x2),
        y1: Math.min(y1, y2),
        x2: Math.max(x1, x2),
        y2: Math.max(y1, y2),
      });
    }
    if (rects.length === 0) return;
    setAnnotateOn(true);
    setShowHighlights(true);
    setHighlights((prev) => ({ ...prev, [n]: [...(prev[n] ?? []), ...rects] }));
    sel.removeAllRanges();
  };

  // Read aloud: the current page's text through speechSynthesis.
  const toggleReadAloud = () => {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = (pageTextsRef.current.get(page) ?? "").trim();
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    speechRef.current = utter;
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  // Print: every page as an image in a print-only root, then the
  // browser's print dialog. The root is display:none on screen and
  // only the print stylesheet shows it.
  const printPdf = async () => {
    if (!doc || printBusy) return;
    setPrintBusy(true);
    try {
      const images: string[] = [];
      for (let n = 1; n <= numPages; n++) {
        const p = await doc.getPage(n);
        const vp = p.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await p.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
        images.push(canvas.toDataURL("image/png"));
      }
      setPrintImages(images);
      // Let React paint the print root before opening the dialog.
      await new Promise((r) => setTimeout(r, 50));
      window.print();
      const cleanup = () => setPrintImages(null);
      window.addEventListener("afterprint", cleanup, { once: true });
      setTimeout(cleanup, 10000);
    } finally {
      setPrintBusy(false);
    }
  };

  const savePdf = () => {
    if (source.type !== "url") return;
    const a = document.createElement("a");
    a.href = source.url;
    a.download = fileName.split("/").pop() ?? "document.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Ask AI: the CURRENT document is the reference and the AI
  // answers the USER'S question about it — no fixed summary. The
  // user's text selection in the PDF, when there is one, is the
  // most specific reference; otherwise the whole document text
  // (capped at the API's 8k input limit).
  const askAi = () => {
    let text = "";
    const sel = window.getSelection();
    if (
      sel &&
      !sel.isCollapsed &&
      sel.anchorNode &&
      rootRef.current?.contains(sel.anchorNode)
    ) {
      text = sel.toString().trim();
    }
    if (!text) {
      const parts: string[] = [];
      for (let n = 1; n <= numPages; n++) {
        const t = pageTextsRef.current.get(n);
        if (t) parts.push(t);
      }
      text = parts.join("\n");
    }
    const full = `Document: ${fileName}\n\n${text}`.slice(0, AI_CONTEXT_MAX);
    onAskAi({ fileName, text: full });
  };

  const matchesForPage = (n: number) =>
    matches.filter((m) => m.page === n).map((m) => ({ start: m.start, end: m.end }));
  const currentMatch =
    currentMatchIdx >= 0 && currentMatchIdx < matches.length
      ? matches[currentMatchIdx]
      : null;
  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <p className="text-center text-xs text-neutral-500">{loadErrorText}</p>
      </div>
    );
  }
  if (!doc) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <TetrominoLoader />
      </div>
    );
  }

  const menuBackdrop = menuOpen ? (
    <button
      type="button"
      aria-label="Close menu"
      className="fixed inset-0 z-40 cursor-default"
      onClick={() => setMenuOpen(null)}
    />
  ) : null;

  return (
    <div ref={rootRef} className="relative flex h-full w-full flex-col overflow-hidden bg-neutral-950">
      <style>{`.lp-pdf-textlayer span{color:transparent;position:absolute;white-space:pre;cursor:text;transform-origin:0% 0%}.lp-pdf-textlayer ::selection{background:rgba(0,100,255,.25)}`}</style>
      {menuBackdrop}
      {/* Header toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-800 bg-black/60 px-2 py-1.5">
        <ToolButton title={t.editorPage.pdfSidebar} onClick={() => setSidebarOpen((v) => !v)} active={sidebarOpen}>
          <PanelLeft className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          title={t.editorPage.pdfSearch}
          onClick={() => setFindOpen((v) => !v)}
          active={findOpen}
        >
          <Search className="h-4 w-4" />
        </ToolButton>
        <ToolButton title={t.editorPage.pdfHighlight} onClick={highlightSelection}>
          <Highlighter className="h-4 w-4" />
        </ToolButton>
        <div className="relative">
          <ToolButton title={t.editorPage.pdfFilter} onClick={() => setMenuOpen(menuOpen === "filter" ? null : "filter")} active={menuOpen === "filter"}>
            <Filter className="h-4 w-4" />
          </ToolButton>
          {menuOpen === "filter" && (
            <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-neutral-700 bg-neutral-900 p-1 shadow-xl">
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800">
                <input type="checkbox" checked={showHighlights} onChange={(e) => setShowHighlights(e.target.checked)} className="accent-neutral-300" />
                {t.editorPage.pdfFilterHighlights}
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800">
                <input type="checkbox" checked={showNotes} onChange={(e) => setShowNotes(e.target.checked)} className="accent-neutral-300" />
                {t.editorPage.pdfFilterTextNotes}
              </label>
            </div>
          )}
        </div>
        <ToolButton
          title={t.editorPage.pdfAddText}
          onClick={() => {
            setPlacingText((v) => !v);
            if (!placingText) setAnnotateOn(true);
          }}
          active={placingText}
        >
          <Type className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          title={speaking ? t.editorPage.pdfStopReading : t.editorPage.pdfReadAloud}
          onClick={toggleReadAloud}
          disabled={!speechSupported}
          active={speaking}
        >
          {speaking ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-neutral-800" />
        <ToolButton title={t.editorPage.imageZoomOut} onClick={() => zoomBy(1 / 1.25)} disabled={scale <= ZOOM_MIN}>
          <Minus className="h-4 w-4" />
        </ToolButton>
        <span className="w-11 text-center text-[11px] font-medium text-neutral-300">{Math.round(scale * 100)}%</span>
        <ToolButton title={t.editorPage.imageZoomIn} onClick={() => zoomBy(1.25)} disabled={scale >= ZOOM_MAX}>
          <Plus className="h-4 w-4" />
        </ToolButton>
        <ToolButton title={t.editorPage.imageFit} onClick={fitToPage} active={fitMode === "page"}>
          <Maximize2 className="h-4 w-4" />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-neutral-800" />
        <ToolButton title={t.editorPage.pdfPageOf(page, numPages)} onClick={() => goToPage(page - 1)} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </ToolButton>
        <input
          key={page}
          defaultValue={page}
          inputMode="numeric"
          aria-label={t.editorPage.pdfPageOf(page, numPages)}
          onBlur={(e) => goToPage(Number(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-11 rounded border border-neutral-700 bg-neutral-900 px-1 py-1 text-center text-[11px] text-neutral-200 outline-none focus:border-neutral-500"
        />
        <span className="text-[11px] text-neutral-400">/ {numPages}</span>
        <ToolButton title={t.editorPage.pdfPageOf(page, numPages)} onClick={() => goToPage(page + 1)} disabled={page >= numPages}>
          <ChevronRight className="h-4 w-4" />
        </ToolButton>
        <ToolButton title={t.editorPage.pdfRotate} onClick={() => setRotation((r) => (r + 90) % 360)}>
          <RotateCw className="h-4 w-4" />
        </ToolButton>
        <div className="relative">
          <ToolButton title={t.editorPage.pdfView} onClick={() => setMenuOpen(menuOpen === "view" ? null : "view")} active={menuOpen === "view"}>
            <Eye className="h-4 w-4" />
          </ToolButton>
          {menuOpen === "view" && (
            <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-neutral-700 bg-neutral-900 p-1 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setViewMode("single");
                  setMenuOpen(null);
                }}
                className={`w-full rounded px-2 py-1.5 text-left text-xs hover:bg-neutral-800 ${viewMode === "single" ? "font-medium text-white" : "text-neutral-300"}`}
              >
                {t.editorPage.pdfSinglePage}
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("continuous");
                  setMenuOpen(null);
                }}
                className={`w-full rounded px-2 py-1.5 text-left text-xs hover:bg-neutral-800 ${viewMode === "continuous" ? "font-medium text-white" : "text-neutral-300"}`}
              >
                {t.editorPage.pdfContinuous}
              </button>
              <div className="my-1 h-px bg-neutral-800" />
              <button
                type="button"
                onClick={() => {
                  setFitMode("width");
                  setMenuOpen(null);
                }}
                className="w-full rounded px-2 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800"
              >
                {t.editorPage.pdfFitWidth}
              </button>
            </div>
          )}
        </div>
        <span className="mx-1 h-5 w-px bg-neutral-800" />
        <button
          type="button"
          onClick={askAi}
          title={t.editorPage.pdfAskAi}
          className="flex items-center gap-1 rounded-lg border border-neutral-700 px-2 py-1.5 text-[11px] font-medium text-neutral-200 hover:bg-neutral-800"
        >
          <Sparkles className="h-3.5 w-3.5" /> {t.editorPage.pdfAskAi}
        </button>
        <span className="mx-1 h-5 w-px bg-neutral-800" />
        <ToolButton title={t.editorPage.pdfPrint} onClick={() => void printPdf()} disabled={printBusy}>
          <Printer className="h-4 w-4" />
        </ToolButton>
        <ToolButton title={t.editorPage.pdfSave} onClick={savePdf}>
          <Download className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          title={t.editorPage.pdfAnnotate}
          onClick={() => setAnnotateOn((v) => !v)}
          active={annotateOn}
        >
          <PenLine className="h-4 w-4" />
        </ToolButton>
        <div className="relative">
          <ToolButton title={t.editorPage.pdfMore} onClick={() => setMenuOpen(menuOpen === "more" ? null : "more")} active={menuOpen === "more"}>
            <MoreHorizontal className="h-4 w-4" />
          </ToolButton>
          {menuOpen === "more" && (
            <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-neutral-700 bg-neutral-900 p-1 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setPropsOpen(true);
                  setMenuOpen(null);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-neutral-200 hover:bg-neutral-800"
              >
                <FileText className="h-3.5 w-3.5" /> {t.editorPage.pdfDocProperties}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (source.type === "url") window.open(source.url, "_blank", "noopener");
                  setMenuOpen(null);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-neutral-200 hover:bg-neutral-800"
              >
                <ExternalLink className="h-3.5 w-3.5" /> {t.editorPage.pdfOpenNewTab}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Find bar */}
      {findOpen && (
        <div className="flex items-center gap-1 border-b border-neutral-800 bg-black/60 px-2 py-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <input
            autoFocus
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (matches.length > 0) {
                  setCurrentMatchIdx((i) => (i + 1) % matches.length);
                }
              }
              if (e.key === "Escape") setFindOpen(false);
            }}
            placeholder={t.editorPage.pdfSearch}
            aria-label={t.editorPage.pdfSearch}
            className="min-w-0 flex-1 rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-200 outline-none focus:border-neutral-500"
          />
          <span className="w-16 shrink-0 text-center text-[11px] text-neutral-400">
            {matches.length > 0
              ? `${currentMatchIdx + 1} / ${matches.length}`
              : findQuery
                ? t.editorPage.pdfNoMatches
                : ""}
          </span>
          <ToolButton
            title={t.editorPage.pdfSearch}
            onClick={() => {
              if (matches.length > 0) setCurrentMatchIdx((i) => (i - 1 + matches.length) % matches.length);
            }}
            disabled={matches.length === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            title={t.editorPage.pdfSearch}
            onClick={() => {
              if (matches.length > 0) setCurrentMatchIdx((i) => (i + 1) % matches.length);
            }}
            disabled={matches.length === 0}
          >
            <ChevronDown className="h-4 w-4" />
          </ToolButton>
          <ToolButton title={t.editorPage.pdfSearch} onClick={() => setFindOpen(false)}>
            <X className="h-4 w-4" />
          </ToolButton>
        </div>
      )}
      {/* Document properties */}
      {propsOpen && (
        <div className="absolute right-2 top-12 z-50 w-72 rounded-lg border border-neutral-700 bg-neutral-900 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
              <FileText className="h-3.5 w-3.5" /> {t.editorPage.pdfDocProperties}
            </span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setPropsOpen(false)}
              className="rounded p-0.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <dl className="space-y-1 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-neutral-500">Title</dt>
              <dd className="truncate text-right text-neutral-200">{docTitle ?? fileName.split("/").pop()}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-neutral-500">Pages</dt>
              <dd className="text-neutral-200">{numPages}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-neutral-500">Size</dt>
              <dd className="text-neutral-200">
                {fileSize >= 1024 * 1024
                  ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
                  : `${Math.max(1, Math.round(fileSize / 1024))} KB`}
              </dd>
            </div>
          </dl>
        </div>
      )}
      {/* Body: thumbnails + pages */}
      <div className="flex min-h-0 flex-1">
        {sidebarOpen && (
          <div className="w-36 shrink-0 overflow-y-auto border-r border-neutral-800 bg-black/40 p-2">
            {thumbs.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <TetrominoLoader />
              </div>
            ) : (
              thumbs.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToPage(i + 1)}
                  className={`mb-2 block w-full rounded border p-1 ${page === i + 1 ? "border-neutral-400 bg-neutral-800" : "border-neutral-800 hover:border-neutral-600"}`}
                >
                  <img src={src} alt={`Page ${i + 1}`} className="w-full" />
                  <span className="mt-1 block text-center text-[10px] text-neutral-400">{i + 1}</span>
                </button>
              ))
            )}
          </div>
        )}
        <div ref={scrollRef} onScroll={onScroll} className="relative min-h-0 flex-1 overflow-auto">
          {viewMode === "single" ? (
            <div className="flex min-h-full w-full justify-center p-4">
              <div className="m-auto">
                <PdfPage
                  doc={doc}
                  pageNum={page}
                  scale={scale}
                  rotation={rotation}
                  searchMatches={matchesForPage(page)}
                  currentMatch={currentMatch && currentMatch.page === page ? { start: currentMatch.start, end: currentMatch.end } : null}
                  highlights={annotateOn && showHighlights ? (highlights[page] ?? []) : []}
                  notes={annotateOn && showNotes ? (notes[page] ?? []) : []}
                  showHighlights={annotateOn && showHighlights}
                  showNotes={annotateOn && showNotes}
                  placingText={placingText}
                  onPlaceText={(n, point) => {
                    setNotes((prev) => ({
                      ...prev,
                      [n]: [...(prev[n] ?? []), { id: `note-${Date.now()}`, x: point.x, y: point.y, text: "" }],
                    }));
                    setPlacingText(false);
                  }}
                  onNoteChange={(n, note) =>
                    setNotes((prev) => ({
                      ...prev,
                      [n]: (prev[n] ?? []).map((x) => (x.id === note.id ? note : x)),
                    }))
                  }
                  onNoteDelete={(n, id) =>
                    setNotes((prev) => ({
                      ...prev,
                      [n]: (prev[n] ?? []).filter((x) => x.id !== id),
                    }))
                  }
                  onTextContent={(n, text) => {
                    if (!pageTextsRef.current.has(n)) {
                      pageTextsRef.current.set(n, text);
                      setExtractedCount((c) => c + 1);
                    }
                  }}
                  onViewport={(n, vp) => {
                    viewportsRef.current.set(n, vp);
                  }}
                  registerEl={(n, el) => {
                    if (el) pageElsRef.current.set(n, el);
                    else pageElsRef.current.delete(n);
                  }}
                  onPageRendered={() => setRenderedOnce(true)}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 p-4">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
                <PdfPage
                  key={n}
                  doc={doc}
                  pageNum={n}
                  scale={scale}
                  rotation={rotation}
                  searchMatches={matchesForPage(n)}
                  currentMatch={currentMatch && currentMatch.page === n ? { start: currentMatch.start, end: currentMatch.end } : null}
                  highlights={annotateOn && showHighlights ? (highlights[n] ?? []) : []}
                  notes={annotateOn && showNotes ? (notes[n] ?? []) : []}
                  showHighlights={annotateOn && showHighlights}
                  showNotes={annotateOn && showNotes}
                  placingText={placingText}
                  onPlaceText={(pn, point) => {
                    setNotes((prev) => ({
                      ...prev,
                      [pn]: [...(prev[pn] ?? []), { id: `note-${Date.now()}`, x: point.x, y: point.y, text: "" }],
                    }));
                    setPlacingText(false);
                  }}
                  onNoteChange={(pn, note) =>
                    setNotes((prev) => ({
                      ...prev,
                      [pn]: (prev[pn] ?? []).map((x) => (x.id === note.id ? note : x)),
                    }))
                  }
                  onNoteDelete={(pn, id) =>
                    setNotes((prev) => ({
                      ...prev,
                      [pn]: (prev[pn] ?? []).filter((x) => x.id !== id),
                    }))
                  }
                  onTextContent={(pn, text) => {
                    if (!pageTextsRef.current.has(pn)) {
                      pageTextsRef.current.set(pn, text);
                      setExtractedCount((c) => c + 1);
                    }
                  }}
                  onViewport={(pn, vp) => {
                    viewportsRef.current.set(pn, vp);
                  }}
                  registerEl={(pn, el) => {
                    if (el) pageElsRef.current.set(pn, el);
                    else pageElsRef.current.delete(pn);
                  }}
                  onPageRendered={() => setRenderedOnce(true)}
                />
              ))}
            </div>
          )}
          {/* Loading: the tetromino loader stays over the pages until
              the first page's canvas has actually painted — no blank
              pane, no premature error. It never comes back for a
              zoom/rotate re-render (renderedOnce stays true). */}
          {!renderedOnce && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-950">
              <TetrominoLoader />
            </div>
          )}
        </div>
      </div>
      {/* Print-only root (display:none on screen; the print sheet shows it) */}
      {printImages && (
        <>
          <style>{`@media print{body *{visibility:hidden !important}#lp-pdf-print-root{display:block !important;position:absolute;left:0;top:0;width:100%;visibility:visible !important}#lp-pdf-print-root *{visibility:visible !important}#lp-pdf-print-root img{display:block;width:100%;margin-bottom:16px;page-break-after:always}#lp-pdf-print-root img:last-child{page-break-after:auto}}`}</style>
          <div id="lp-pdf-print-root" style={{ display: "none" }} aria-hidden="true">
            {printImages.map((src, i) => (
              <img key={i} src={src} alt={`Page ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ToolButton({
  title,
  onClick,
  active,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active || undefined}
      onClick={onClick}
      disabled={disabled}
      className={`rounded p-1.5 ${
        active ? "bg-neutral-700 text-white" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}
