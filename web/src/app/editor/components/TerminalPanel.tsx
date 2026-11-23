import type { Strings } from "@/lib/i18n";
import type { Dispatch, SetStateAction } from "react";
import { Terminal } from "lucide-react";
import { EditorPanelHeader } from "@/components/EditorPanelHeader";
import { HighlightedTerminal } from "@/lib/highlight";
import type { PanelId, PanelZone, WorkspaceItem } from "../lib/editor-types";
import type { PyodideEngine } from "../hooks/usePyodideEngine";

export type TerminalPanelProps = {
  t: Strings;
  output: string;
  setOutput: Dispatch<SetStateAction<string>>;
  activeFile: WorkspaceItem | undefined;
  engine: PyodideEngine;
  terminalInputRef: React.RefObject<HTMLInputElement | null>;
  setDraggingPanel: Dispatch<SetStateAction<PanelId | null>>;
  setDropZone: Dispatch<SetStateAction<PanelZone | null>>;
  setShowTerminal: Dispatch<SetStateAction<boolean>>;
};

export function TerminalPanel(props: TerminalPanelProps) {
  const { t, output, setOutput, activeFile, engine, terminalInputRef, setDraggingPanel, setDropZone, setShowTerminal } = props;

  return (
    <div className="w-full flex-1 min-h-0 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden">
      <EditorPanelHeader
        id="terminal"
        title={<><Terminal className="h-3.5 w-3.5 text-white" /> {t.editorPage.terminalLogs}</>}
        actions={
          <button
            type="button"
            draggable={false}
            onClick={() => setOutput("")}
            className="rounded px-1.5 py-0.5 text-[11px] text-neutral-500 hover:bg-neutral-800 hover:text-white transition"
          >
            {t.common.clear}
          </button>
        }
        onDragStart={setDraggingPanel}
        onDragEnd={() => { setDraggingPanel(null); setDropZone(null); }}
        onClose={() => setShowTerminal(false)}
        closeLabel={t.common.close}
      />
      <pre className="flex-1 w-full bg-black p-3.5 font-mono text-xs text-neutral-300 overflow-auto whitespace-pre-wrap selection:bg-neutral-800">
        <HighlightedTerminal output={output} />
      </pre>
      {/* VS Code-style command line: one line, prompt shows the
          active file path. `python <file>` / `run` execute a file
          (output lands here); anything else runs as Python in the
          live runtime; `clear` / `help` / `ls` are shell commands.
          The old Program-input box and the separate >>> line are
          gone — this line is the terminal's only input. */}
      <div className="border-t border-neutral-800 bg-black px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-emerald-400 shrink-0 truncate max-w-[45%]">
            {activeFile?.path ?? "~"} $
          </span>
          <input
            type="text"
            ref={terminalInputRef}
            value={engine.terminalInput}
            onChange={(e) => engine.setTerminalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") engine.runTerminalCommand();
            }}
            placeholder={
              engine.pyodideReady
                ? t.editorPage.terminalCommandPlaceholder
                : t.editorPage.terminalInputLoadingPlaceholder
            }
            disabled={!engine.pyodideReady || engine.terminalBusy || engine.isRunning}
            className="w-full min-w-0 bg-transparent font-mono text-xs text-white placeholder-neutral-600 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
