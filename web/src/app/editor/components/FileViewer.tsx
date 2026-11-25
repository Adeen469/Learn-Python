// File viewer for installed editor extensions: shows a file in the
// editor pane instead of the Monaco text editor. Native elements for
// image / video / audio / PDF (no new dependency); SheetJS for Excel
// and mammoth for Word, both dynamically imported so they only load
// when a spreadsheet or document is actually opened.
import { useEffect, useState } from "react";
import { TetrominoLoader } from "./TetrominoLoader";
import type { ExtensionKind } from "../lib/editor-extensions";

export type FileViewerSource = { type: "url"; url: string } | { type: "text"; text: string };

export type FileViewerProps = {
  fileName: string;
  kind: ExtensionKind;
  source: FileViewerSource;
  loadErrorText: string;
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

export function FileViewer({ fileName, kind, source, loadErrorText }: FileViewerProps) {
  if (kind === "image" && source.type === "url") {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
        <img src={source.url} alt={fileName} className="max-h-full max-w-full object-contain" />
      </div>
    );
  }
  if (kind === "video" && source.type === "url") {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
        <video src={source.url} controls className="max-h-full max-w-full" />
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
    return <embed src={source.url} type="application/pdf" className="h-full w-full" title={fileName} />;
  }
  if (kind === "excel") {
    return <ExcelViewer source={source} loadErrorText={loadErrorText} />;
  }
  if (kind === "word") {
    return <WordViewer source={source} loadErrorText={loadErrorText} />;
  }
  return null;
}
