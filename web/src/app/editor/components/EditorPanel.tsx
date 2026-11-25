import type { Strings } from "@/lib/i18n";
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import Editor from "@monaco-editor/react";
import { FileCode, Square } from "lucide-react";
import { TetrominoLoader } from "./TetrominoLoader";
import { FileViewer, type FileViewerSource } from "./FileViewer";
import type { PdfAskAiContext } from "./PdfViewer";
import type { WorkspaceItem } from "../lib/editor-types";
import type { PyodideEngine } from "../hooks/usePyodideEngine";
import { useInstalledExtensions } from "../hooks/useExtensions";
import { loadDroppedFile } from "../lib/dropped-files";
import { ensureEditorScope } from "../lib/editor-storage";
import {
  extensionForFile,
  readOpenRepo,
  repoBinaryFileUrl,
  viewerKindForFile,
} from "../lib/editor-extensions";
import { languageForFile } from "../lib/editor-utils";

export type EditorPanelProps = {
  t: Strings;
  activeFile: WorkspaceItem | undefined;
  engine: PyodideEngine;
  editorTheme: "lp-dark" | "lp-light";
  handleEditorChange: (value: string | undefined) => void;
  editorRef: { current: any };
  monacoRef: { current: any };
  setCursorPos: Dispatch<SetStateAction<{ line: number; col: number }>>;
  // True while the active file's content is being fetched (lazy
  // repo load) — the editor shows the tetromino loader until it
  // arrives. False for instant switches: no fetch, no loader.
  loadingFile: boolean;
  // PDF viewer only: Ask AI with the current document as reference.
  onAskAi?: (ctx: PdfAskAiContext) => void;
};

export function EditorPanel(props: EditorPanelProps) {
  const { t, activeFile, engine, editorTheme, handleEditorChange, editorRef, monacoRef, setCursorPos, loadingFile, onAskAi } = props;

  // File viewer (installed extensions): when the active file's type is
  // covered by an installed extension, the pane shows that viewer
  // instead of Monaco. Repo files stream their bytes through the
  // repo-file API (same token/SHA checks as the text read); dropped
  // binary files carry a blob: URL from the drop handler, so the
  // viewer renders their raw bytes; local SVG/CSV files render from
  // their text content.
  const { installed } = useInstalledExtensions();
  const kind = activeFile ? viewerKindForFile(activeFile.path, installed) : null;
  const viewerName = kind ? (extensionForFile(activeFile?.path ?? "")?.name ?? "") : "";
  // A dropped binary file's blob: URL dies on reload (the restore
  // strips it), so after a refresh the file has no live source at
  // all. Rehydrate its bytes from IndexedDB (saved at drop time)
  // and mint a fresh blob URL for the viewer. While the lookup runs
  // the pane shows the loader, never a blank editor or a premature
  // error; if nothing was ever persisted (a file dropped before this
  // shipped), the pane shows the load error instead of blank Monaco.
  const [rehydratedUrl, setRehydratedUrl] = useState<string | null>(null);
  const [rehydrating, setRehydrating] = useState(false);
  const rehydratedRef = useRef<string | null>(null);
  useEffect(() => {
    setRehydratedUrl(null);
    setRehydrating(false);
    if (!activeFile || !kind) return;
    const repo = readOpenRepo();
    if (repo && activeFile.sha) return;
    if (activeFile.blobUrl) return;
    const ext = activeFile.path.split(".").pop()?.toLowerCase() ?? "";
    if ((ext === "svg" || ext === "csv") && activeFile.content) return;
    setRehydrating(true);
    let cancelled = false;
    // Per-user (Fix C): the dropped bytes live under the signed-in
    // user's scope — wait for it before reading, or a second
    // account on this browser would rehydrate the first user's
    // files (or miss its own).
    void (async () => {
      await ensureEditorScope();
      if (cancelled) return;
      await loadDroppedFile(activeFile.path)
        .then((blob) => {
          if (cancelled) return;
          setRehydrating(false);
          if (blob) {
            const url = URL.createObjectURL(blob);
            rehydratedRef.current = url;
            setRehydratedUrl(url);
          }
        })
        .catch(() => {
          if (!cancelled) setRehydrating(false);
        });
    })();
    return () => {
      cancelled = true;
      if (rehydratedRef.current) {
        URL.revokeObjectURL(rehydratedRef.current);
        rehydratedRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile?.path, installed]);
  const viewer = useMemo(() => {
    if (!activeFile || !kind) return null;
    const extension = extensionForFile(activeFile.path);
    const name = extension?.name ?? "";
    const repo = readOpenRepo();
    if (repo && activeFile.sha) {
      const source: FileViewerSource = {
        type: "url",
        url: repoBinaryFileUrl(repo.repo, repo.branch, activeFile.path, activeFile.sha),
      };
      return { kind, name, source };
    }
    const url = activeFile.blobUrl ?? rehydratedUrl;
    if (url) {
      return { kind, name, source: { type: "url", url } as FileViewerSource };
    }
    const ext = activeFile.path.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "svg" && activeFile.content) {
      return {
        kind,
        name,
        source: {
          type: "url",
          url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(activeFile.content)}`,
        } as FileViewerSource,
      };
    }
    if (ext === "csv" && activeFile.content) {
      return { kind, name, source: { type: "text", text: activeFile.content } as FileViewerSource };
    }
    return null;
  }, [activeFile, installed, kind, rehydratedUrl]);

  return (
    <div className="min-h-[420px] sm:min-h-[480px] md:min-h-0 flex-1 min-w-0 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 bg-black/60">
        <span className="text-xs font-mono text-neutral-300 flex items-center gap-2 min-w-0">
          <FileCode className="h-3.5 w-3.5 text-white shrink-0" />
          <span className="truncate">{activeFile?.path} {!activeFile?.isSaved && t.editorPage.unsavedBadge}</span>
        </span>
        {engine.isRunning && (
          <button
            type="button"
            onClick={engine.stopRunning}
            disabled={!engine.interruptBufferRef.current}
            title={engine.interruptBufferRef.current ? t.editorPage.stopHint : t.editorPage.stopUnavailableHint}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-red-500/50 bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-200 hover:bg-red-500/20 transition disabled:opacity-50"
          >
            <Square className="h-3 w-3 fill-current" /> {t.editorPage.stop}
          </button>
        )}
        <span className="hidden text-[11px] text-neutral-500 font-mono sm:inline shrink-0 ml-2">
          {viewer ? viewer.name : viewerName || "Python 3.12 (WASM) • Monaco Editor"}
        </span>
      </div>

      <div className="flex-1 w-full min-w-0 relative overflow-hidden">
        {loadingFile && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950/60">
            <TetrominoLoader />
          </div>
        )}
        {viewer ? (
          <FileViewer
            t={t}
            fileName={activeFile?.path ?? ""}
            kind={viewer.kind}
            source={viewer.source}
            loadErrorText={t.editorPage.viewerLoadError}
            onAskAi={onAskAi}
          />
        ) : rehydrating ? (
          <div className="flex h-full w-full items-center justify-center">
            <TetrominoLoader />
          </div>
        ) : kind ? (
          <div className="flex h-full w-full items-center justify-center p-4">
            <p className="text-center text-xs text-neutral-500">{t.editorPage.viewerLoadError}</p>
          </div>
        ) : (
          <Editor
            height="100%"
            language={languageForFile(activeFile?.path)}
          theme={editorTheme}
          value={activeFile?.content ?? ""}
          loading={null}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editorRef.current = editor;
            // Cursor position for the status bar (Ln / Col).
            editor.onDidChangeCursorPosition((e: any) => {
              setCursorPos({
                line: e.position.lineNumber,
                col: e.position.column,
              });
            });
          }}
          beforeMount={(monaco) => {
            // The page needs the monaco namespace for run markers
            // (setModelMarkers) — stored next to editorRef.
            monacoRef.current = monaco;
            // lp-dark: vs-dark + scrollbars matched to the app's
            // white-pill scrollbar (same as globals.css).
            monaco.editor.defineTheme("lp-dark", {
              base: "vs-dark",
              inherit: true,
              rules: [],
              colors: {
                "scrollbarSliderBackground": "#ffffff73",
                "scrollbarSliderHoverBackground": "#ffffffe6",
                "scrollbarSliderActiveBackground": "#ffffff",
                "scrollbarShadow": "#00000000",
                "minimapSliderBackground": "#ffffff33",
                "minimapSliderHoverBackground": "#ffffff73",
                "minimapSliderActiveBackground": "#ffffffbf",
              },
            });
            // lp-light: the same, on the light base — dark pill
            // on a light editor.
            monaco.editor.defineTheme("lp-light", {
              base: "vs",
              inherit: true,
              rules: [],
              colors: {
                "scrollbarSliderBackground": "#00000073",
                "scrollbarSliderHoverBackground": "#000000e6",
                "scrollbarSliderActiveBackground": "#000000",
                "scrollbarShadow": "#00000000",
                "minimapSliderBackground": "#00000033",
                "minimapSliderHoverBackground": "#00000073",
                "minimapSliderActiveBackground": "#000000bf",
              },
            });
          }}
          options={{
            fontSize: 13,
            lineNumbers: "on",
            minimap: { enabled: true, side: "right" },
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            parameterHints: { enabled: true },
            folding: true,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 4,
            insertSpaces: true,
            renderWhitespace: "selection",
            wordWrap: "on",
            // Binary garbage is one unbroken token with no wrap
            // opportunities — the default "simple" strategy can
            // leave such a line running past the pane edge. "advanced"
            // breaks anywhere, so nothing ever escapes the frame.
            wrappingStrategy: "advanced",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              useShadows: false,
            },
          }}
        />
        )}
      </div>
    </div>
  );
}
