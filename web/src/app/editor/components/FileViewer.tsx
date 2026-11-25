// File viewer for installed editor extensions: shows a file in the
// editor pane instead of the Monaco text editor. Native elements for
// image / video / audio / PDF (no new dependency); SheetJS for Excel
// and mammoth for Word, both dynamically imported so they only load
// when a spreadsheet or document is actually opened.
import { useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import type { Strings } from "@/lib/i18n";
import { TetrominoLoader } from "./TetrominoLoader";
import { PdfViewer, type PdfAskAiContext } from "./PdfViewer";
import type { ExtensionKind } from "../lib/editor-extensions";

export type FileViewerSource = { type: "url"; url: string } | { type: "text"; text: string };

export type FileViewerProps = {
  t: Strings;
  fileName: string;
  kind: ExtensionKind;
  source: FileViewerSource;
  loadErrorText: string;
  // PDF only: the viewer calls this when the user taps Ask AI, with
  // the current document's text as the reference for their question.
  onAskAi?: (ctx: PdfAskAiContext) => void;
};

// First sheet only, capped — a huge spreadsheet must not build a
// giant DOM. The cap note tells the user rows were cut.
const EXCEL_MAX_ROWS = 200;
const EXCEL_MAX_COLS = 50;

function ExcelViewer({ source, loadErrorText }: { source: FileViewerSource; loadErrorText: string }) {
  const [state, setState] = useState<{ status: "loading" } | { status: "ready"; rows: string[][]; truncated: boolean } | { status: "error" }>({ status: "loading" });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const XLSX = await import("xlsx");
        const workbook =
          source.type === "url"
            ? XLSX.read(await (await fetch(source.url)).arrayBuffer(), { type: "array" })
            : XLSX.read(source.text, { type: "string" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) throw new Error("empty workbook");
        const all = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" }) as string[][];
        const rows = all.slice(0, EXCEL_MAX_ROWS).map((r) => r.slice(0, EXCEL_MAX_COLS));
        if (!cancelled) {
          setState({ status: "ready", rows, truncated: all.length > EXCEL_MAX_ROWS });
        }
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);
  if (state.status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <TetrominoLoader />
      </div>
    );
  }
  if (state.status === "error") {
    return <p className="p-4 text-center text-xs text-neutral-500">{loadErrorText}</p>;
  }
  return (
    <div className="h-full w-full overflow-auto p-2">
      <table className="w-full border-collapse text-xs text-neutral-200">
        <tbody>
          {state.rows.map((row, i) => (
            <tr key={i} className={i === 0 ? "bg-neutral-900 font-medium text-white" : ""}>
              {row.map((cell, j) => (
                <td key={j} className="max-w-48 truncate border border-neutral-800 px-2 py-1">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {state.truncated && (
        <p className="p-2 text-[11px] text-neutral-500">Showing the first {EXCEL_MAX_ROWS} rows.</p>
      )}
    </div>
  );
}

function WordViewer({ source, loadErrorText }: { source: FileViewerSource; loadErrorText: string }) {
  const [state, setState] = useState<{ status: "loading" } | { status: "ready"; html: string } | { status: "error" }>({ status: "loading" });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (source.type !== "url") throw new Error("docx needs bytes");
        const mammoth = await import("mammoth");
        const { value } = await mammoth.convertToHtml({
          arrayBuffer: await (await fetch(source.url)).arrayBuffer(),
        });
        if (!cancelled) setState({ status: "ready", html: value });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);
  if (state.status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <TetrominoLoader />
      </div>
    );
  }
  if (state.status === "error") {
    return <p className="p-4 text-center text-xs text-neutral-500">{loadErrorText}</p>;
  }
  // mammoth only generates safe tags (p, h1–h6, tables, lists) from
  // the document — no scripts or event handlers survive it.
  return (
    <div className="h-full w-full overflow-auto p-4 text-sm leading-relaxed text-neutral-200 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_p]:mb-2 [&_table]:mb-2 [&_td]:border [&_td]:border-neutral-800 [&_td]:px-2 [&_td]:py-1">
      <div dangerouslySetInnerHTML={{ __html: state.html }} />
    </div>
  );
}

// Image viewer with zoom + pan: buttons and the mouse wheel zoom
// around the centre (1×–8×); dragging moves the image once it is
// zoomed past fit. Fit resets both zoom and pan. The wrapper is
// overflow-hidden, so a zoomed image can never run past the pane
// edge — it just pans inside the frame.
const IMAGE_MAX_ZOOM = 8;

function ImageViewer({ source, fileName, t }: { source: string; fileName: string; t: Strings }) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  // A different file starts back at fit.
  useEffect(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [fileName]);
  const zoomBy = (factor: number) => {
    const next = Math.min(IMAGE_MAX_ZOOM, Math.max(1, Math.round(scale * factor * 100) / 100));
    if (next === 1) setPan({ x: 0, y: 0 });
    setScale(next);
  };
  const fit = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      onWheel={(e) => zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2)}
    >
      <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-lg border border-neutral-700 bg-black/70 px-1 py-1">
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.25)}
          disabled={scale <= 1}
          title={t.editorPage.imageZoomOut}
          aria-label={t.editorPage.imageZoomOut}
          className="rounded p-1 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-11 text-center text-[11px] font-medium text-neutral-300">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={() => zoomBy(1.25)}
          disabled={scale >= IMAGE_MAX_ZOOM}
          title={t.editorPage.imageZoomIn}
          aria-label={t.editorPage.imageZoomIn}
          className="rounded p-1 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={fit}
          title={t.editorPage.imageFit}
          aria-label={t.editorPage.imageFit}
          className="ml-0.5 flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-neutral-200 hover:bg-neutral-800"
        >
          <Maximize2 className="h-3.5 w-3.5" /> {t.editorPage.imageFit}
        </button>
      </div>
      <img
        src={source}
        alt={fileName}
        draggable={false}
        className="max-h-full max-w-full object-contain"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "center",
          cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
          touchAction: "none",
        }}
        onPointerDown={(e) => {
          if (scale <= 1) return;
          dragRef.current = { x: e.clientX, y: e.clientY };
          setDragging(true);
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          const start = dragRef.current;
          if (!start) return;
          setPan((p) => ({ x: p.x + e.clientX - start.x, y: p.y + e.clientY - start.y }));
          dragRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={() => {
          dragRef.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          dragRef.current = null;
          setDragging(false);
        }}
      />
    </div>
  );
}

export function FileViewer({ t, fileName, kind, source, loadErrorText, onAskAi }: FileViewerProps) {
  if (kind === "image" && source.type === "url") {
    return <ImageViewer source={source.url} fileName={fileName} t={t} />;
  }
  if (kind === "video" && source.type === "url") {
    // The video fills the pane like the code editor does — h-full
    // w-full + object-contain, so it follows pane resizes
    // automatically (big pane, big video; small pane, small video)
    // and can never run past the frame.
    return (
      <div className="flex h-full w-full items-center justify-center overflow-hidden">
        <video src={source.url} controls className="h-full w-full object-contain" />
      </div>
    );
  }
  if (kind === "audio" && source.type === "url") {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <audio src={source.url} controls />
      </div>
    );
  }
  if (kind === "pdf" && source.type === "url") {
    // pdf.js (canvas + text layer) instead of the native embed
    // element: the embed's built-in toolbar cannot host the custom
    // header and gives no control over zoom, search or pages.
    return (
      <PdfViewer
        t={t}
        fileName={fileName}
        source={source}
        loadErrorText={loadErrorText}
        onAskAi={onAskAi ?? (() => {})}
      />
    );
  }
  if (kind === "excel") {
    return <ExcelViewer source={source} loadErrorText={loadErrorText} />;
  }
  if (kind === "word") {
    return <WordViewer source={source} loadErrorText={loadErrorText} />;
  }
  return null;
}
