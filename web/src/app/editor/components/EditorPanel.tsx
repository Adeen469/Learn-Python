import type { Strings } from "@/lib/i18n";
import type { Dispatch, SetStateAction } from "react";
import Editor from "@monaco-editor/react";
import { FileCode, Square } from "lucide-react";
import type { WorkspaceItem } from "../lib/editor-types";
import type { PyodideEngine } from "../hooks/usePyodideEngine";

export type EditorPanelProps = {
  t: Strings;
  activeFile: WorkspaceItem | undefined;
  engine: PyodideEngine;
  editorTheme: "lp-dark" | "lp-light";
  handleEditorChange: (value: string | undefined) => void;
  editorRef: { current: any };
  setCursorPos: Dispatch<SetStateAction<{ line: number; col: number }>>;
};

export function EditorPanel(props: EditorPanelProps) {
  const { t, activeFile, engine, editorTheme, handleEditorChange, editorRef, setCursorPos } = props;

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
          Python 3.12 (WASM) • Monaco Editor
        </span>
      </div>

      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language="python"
          theme={editorTheme}
          value={activeFile?.content ?? ""}
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
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              useShadows: false,
            },
          }}
        />
      </div>
    </div>
  );
}
