// Pyodide runtime engine for the editor: loading the WASM runtime,
// Compile & Run, the terminal command line, and formatting (black).
// Moved verbatim from web/src/app/editor/page.tsx (editor split) —
// the page owns the workspace / AI / push state and passes what the
// engine needs in; the engine owns only runtime + run state.
import { useEffect, useRef, useState } from "react";
import type { Strings } from "@/lib/i18n";
import { loadPyodideRuntime, withTimeout } from "@/lib/pyodide-install";
import { restoreStoredPackages } from "@/lib/package-storage";
import { parsePythonError, parsePythonWarnings } from "../lib/editor-utils";
import type { WorkspaceItem } from "../lib/editor-types";

// Pyodide virtual filesystem root (shared with the editor page,
// which uses it for the tab "copy path" action).
export const PY_WORKSPACE_ROOT = "/home/pyodide";

// One editor marker from a run: the failing/warning line plus the
// message the hover shows. The page turns these into Monaco
// markers (severity Error/Warning) on the run file's model.
export type RunDiagnostic = { line: number; message: string; severity: "error" | "warning" };
export type RunDiagnostics = { path: string; items: RunDiagnostic[] } | null;

export function usePyodideEngine(opts: {
  items: WorkspaceItem[];
  activeFile: WorkspaceItem | undefined;
  setItems: React.Dispatch<React.SetStateAction<WorkspaceItem[]>>;
  setActiveFilePath: (path: string) => void;
  setNeedsSaveWarning: (v: string | null) => void;
  setOutput: React.Dispatch<React.SetStateAction<string>>;
  t: Strings;
}) {
  const { items, activeFile, setItems, setActiveFilePath, setNeedsSaveWarning, setOutput, t } = opts;

  // Terminal command line: one command per Enter — `python <file>`,
  // `run`, `ls`, `clear`, `help`, or Python in the live runtime.
  // Disabled while a command or a file run is in flight — both
  // redirect sys.stdout, so they must not overlap.
  const [isRunning, setIsRunning] = useState(false);
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalBusy, setTerminalBusy] = useState(false);
  const [pyodideError, setPyodideError] = useState<string | null>(null);

  // Diagnostics from the last run (error line + warning lines, if
  // any) — the page turns these into Monaco markers on the run
  // file's model. Cleared when the next run starts.
  const [runDiagnostics, setRunDiagnostics] = useState<RunDiagnostics>(null);

  // Format (black via micropip): installed once per session, then
  // reused; formatting is the in-progress flag for the button/menu.
  const blackReadyRef = useRef(false);
  const [formatting, setFormatting] = useState(false);

  const pyodideRef = useRef<any>(null);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState(false);
  // Live load status: which step the runtime load is on ("Downloading
  // runtime from jsDelivr…") and how many seconds it has been going.
  // The old bare "Loading Engine" spinner read as frozen on slow
  // connections — this line proves the download is alive.
  const [engineStage, setEngineStage] = useState<string | null>(null);
  const [engineElapsed, setEngineElapsed] = useState(0);
  // Single-flight init: without this, two callers (the <Script> onLoad
  // and an Install click) could start two Pyodide loads at once, and a
  // click before the script finished just gave up with "not ready".
  const pyodideInitPromiseRef = useRef<Promise<any> | null>(null);
  // Generation of the in-flight runtime load: Cancel (or a fresh
  // retry) bumps it, so a stale load finishing late cannot flip the
  // loading state or mark its runtime ready after the user moved on.
  const loadGenerationRef = useRef(0);
  // Stage listeners for the in-flight init: the Modules tab registers
  // one when the user clicks Install, so the progress bar can show
  // WHICH CDN is being tried and how far the load got — the old
  // frozen "Starting Python runtime…" at 10% told the user nothing.
  const initStageListenersRef = useRef<Set<(stage: string) => void>>(
    new Set()
  );
  // SIGINT buffer for the Stop button. Only works when SharedArrayBuffer
  // is available (needs cross-origin isolation); otherwise Stop stays
  // disabled and the UI says so instead of pretending to stop the run.
  const interruptBufferRef = useRef<Uint8Array | null>(null);

  // Elapsed-seconds ticker while the runtime loads: the number ticking
  // up proves the load is alive (downloading, not frozen).
  useEffect(() => {
    if (!loadingEngine) return;
    const timer = window.setInterval(
      () => setEngineElapsed((s) => s + 1),
      1000
    );
    return () => window.clearInterval(timer);
  }, [loadingEngine]);

  async function initPyodide(onStage?: (stage: string) => void) {
    if (pyodideRef.current) return pyodideRef.current;
    // A caller joining the in-flight init still gets later stages.
    // Guard the type: next/script calls onLoad with the DOM load
    // Event as its first argument, so passing initPyodide straight
    // to the Script's onLoad used to register that Event as a
    // "stage listener" — and the first emitStage() then called the
    // Event as a function, killing the whole runtime load with
    // "t is not a function" before the download even started.
    // Only real functions may join.
    if (onStage && typeof onStage === "function") {
      initStageListenersRef.current.add(onStage);
    }
    if (pyodideInitPromiseRef.current) {
      try {
        return await pyodideInitPromiseRef.current;
      } catch {
        // The shared init failed: a joiner must get null (not a
        // throw), or its install crashes mid-flow and leaves its
        // button stuck on "Installing…" with a frozen bar forever —
        // exactly what happened to scikit-image on 2026-11-16, when
        // the 12:10 init failed and the joining install never
        // cleaned up.
        return null;
      } finally {
        if (onStage) initStageListenersRef.current.delete(onStage);
      }
    }
    const emitStage = (stage: string) => {
      // The status line reads engineStage directly, so it must update
      // even when the load was started by a caller that passed no
      // listener (e.g. Compile & Run calls initPyodide() bare, before
      // the <Script> onLoad ever registers one) — otherwise the line
      // falls back to the bare "Loading Engine" and a slow download
      // reads as frozen. That is exactly what the user's 433s
      // screenshot showed: the runtime was mid-download on unpkg,
      // but the line said only "Loading Engine".
      setEngineStage(stage);
      initStageListenersRef.current.forEach((fn) => fn(stage));
    };
    // This attempt's generation: a Cancel (or a fresh retry) bumps
    // loadGenerationRef, so only the latest attempt may flip state.
    const gen = ++loadGenerationRef.current;
    const promise = (async () => {
      // Load the runtime with CDN fallback (jsDelivr, then unpkg):
      // the jsDelivr download alone used to stall for minutes on
      // some networks and hang the whole install. loadPyodideRuntime
      // gives each CDN 5 minutes and tries the next one on a stall.
      setLoadingEngine(true);
      setEngineElapsed(0);
      setEngineStage(null);
      const pyodide = await loadPyodideRuntime(emitStage);
      // A cancelled/stale attempt must not mark its runtime ready
      // after the user moved on (or a fresh retry started).
      if (gen !== loadGenerationRef.current) return null;
      // Stop button support, when the browser allows SharedArrayBuffer.
      try {
        if (typeof SharedArrayBuffer !== "undefined") {
          const buf = new Uint8Array(new SharedArrayBuffer(1));
          pyodide.setInterruptBuffer(buf);
          interruptBufferRef.current = buf;
        }
      } catch {}
      // micropip's wheel download has no timeout either — cap it.
      emitStage(t.modulesPage.stageLoadingMicropip);
      await withTimeout(
        pyodide.loadPackage("micropip"),
        60_000,
        t.editorPage.micropipTimeoutError
      );
      pyodideRef.current = pyodide;
      setPyodideReady(true);
      setPyodideError(null);
      emitStage(t.modulesPage.stageRuntimeReady);
      setOutput((prev) => prev + "✓ Python runtime (Pyodide 0.27.2) loaded successfully.\n");

      // Saved packages are restored in the BACKGROUND, not awaited
      // here: a stalled wheel re-download used to block init itself,
      // so the runtime never became ready and every Install click
      // waited on the same stuck promise (the "Installing…" that
      // never ends). Each package is capped at 90s inside
      // restoreStoredPackages and never blocks init.
      restoreStoredPackages(pyodide, (pkg, status, error) => {
        if (status === "loading") setOutput((prev) => prev + `[Loading installed package '${pkg}'...]\n`);
        if (status === "done") setOutput((prev) => prev + `[Package '${pkg}' ready]\n`);
        if (status === "error") setOutput((prev) => prev + `[Failed loading '${pkg}': ${error}]\n`);
      }).catch(() => {});
      return pyodide;
    })();
    pyodideInitPromiseRef.current = promise;
    try {
      return await promise;
    } catch (err: unknown) {
      // Let the next attempt retry instead of caching the failure.
      pyodideInitPromiseRef.current = null;
      const msg = err instanceof Error ? err.message : String(err);
      setPyodideError(msg);
      setOutput((prev) => prev + `✗ Failed to load runtime: ${msg}\n`);
      return null;
    } finally {
      if (onStage) initStageListenersRef.current.delete(onStage);
      // Only the latest attempt may clear the loading state: a stale
      // attempt finishing late must not hide a fresh retry's spinner.
      if (gen === loadGenerationRef.current) {
        setLoadingEngine(false);
        setEngineStage(null);
      }
    }
  }

  // Stop waiting on a stalled runtime download: invalidate the
  // in-flight attempt (its late finish is ignored by the generation
  // guard) and clear the loading state, so Run / retry can start a
  // fresh load instead of staring at the spinner for up to 10 min.
  function cancelEngineLoad() {
    loadGenerationRef.current++;
    pyodideInitPromiseRef.current = null;
    setLoadingEngine(false);
    setEngineStage(null);
    setEngineElapsed(0);
  }

  // Shared by the Modules tab: loads the runtime if needed, true when ready.
  // `onStage` gets each init step (which CDN is being tried, timeouts,
  // success) so the Modules progress bar shows real progress.
  async function ensurePyodideReady(
    onStage?: (stage: string) => void
  ): Promise<boolean> {
    const py = await initPyodide(onStage);
    return !!py;
  }

  function stopRunning() {
    const buf = interruptBufferRef.current;
    if (buf) {
      buf[0] = 2; // SIGINT — interrupts the running Python code.
      setOutput((prev) => prev + "[Stop requested — interrupting the running code…]\n");
    }
  }

  // --- Format (black, via micropip, on demand) ---
  // black is a pure-Python package, so it installs through the same
  // micropip path the Modules tab already uses. It installs once per
  // session (blackReadyRef), then formats in-process — no network on
  // later formats. A failed install leaves a clear terminal message
  // instead of silently doing nothing.
  async function formatCurrentFile() {
    if (!activeFile || formatting) return;
    if (!pyodideReady || !pyodideRef.current) {
      setOutput((prev) => prev + `${t.editorPage.formatNotReady}\n`);
      return;
    }
    setFormatting(true);
    try {
      const py = pyodideRef.current;
      if (!blackReadyRef.current) {
        setOutput((prev) => prev + "Installing formatter (black)…\n");
        const micropip = py.pyimport("micropip");
        await micropip.install("black");
        blackReadyRef.current = true;
      }
      const code = activeFile.content ?? "";
      py.globals.set("__lp_format_code", code);
      const formatted = py.runPython(
        `import black\nblack.format_str(__lp_format_code, mode=black.Mode())`
      ) as string;
      if (typeof formatted === "string" && formatted !== code) {
        setItems((prev) =>
          prev.map((it) =>
            it.path === activeFile.path
              ? { ...it, content: formatted, isSaved: false }
              : it
          )
        );
        setOutput((prev) => prev + `[Formatted '${activeFile.path}']\n`);
      } else {
        setOutput((prev) => prev + `[Already formatted '${activeFile.path}']\n`);
      }
    } catch (e) {
      console.warn("Format failed:", e);
      setOutput((prev) => prev + `${t.editorPage.formatFailed}\n`);
    } finally {
      setFormatting(false);
    }
  }

  function syncAllFilesToPyodide(workspaceItems: WorkspaceItem[]) {
    if (!pyodideRef.current) return;
    const py = pyodideRef.current;
    try {
      const folders = workspaceItems.filter((i) => i.type === "folder");
      for (const f of folders) {
        try {
          py.FS.mkdirTree(`${PY_WORKSPACE_ROOT}/${f.path}`);
        } catch {}
      }
      const files = workspaceItems.filter((i) => i.type === "file");
      for (const f of files) {
        try {
          const parts = f.path.split("/");
          if (parts.length > 1) {
            const dir = parts.slice(0, -1).join("/");
            try {
              py.FS.mkdirTree(`${PY_WORKSPACE_ROOT}/${dir}`);
            } catch {}
          }
          py.FS.writeFile(`${PY_WORKSPACE_ROOT}/${f.path}`, f.content ?? "");
        } catch (e) {
          console.warn("FS write:", f.path, e);
        }
      }
    } catch (e) {
      console.warn("Pyodide sync error:", e);
    }
  }

  async function compileAndRun(file?: WorkspaceItem) {
    // A file may be passed in (the terminal's `python <file>`)
    // — otherwise the active file runs.
    const targetFile = file ?? activeFile;
    if (!targetFile) return;

    // Auto-save on Run: the old code refused to run an unsaved file and
    // made the user click Save first. Running now saves first instead.
    const toRun = items.map((it) =>
      it.path === targetFile.path ? { ...it, content: targetFile.content ?? "", isSaved: true } : it
    );
    setItems(toRun);
    localStorage.setItem("lp_workspace_tree", JSON.stringify(toRun));
    setNeedsSaveWarning(null);
    const code = targetFile.content ?? "";

    if (!pyodideRef.current) {
      setOutput((prev) => prev + "Python runtime is loading, please wait...\n");
      const py = await initPyodide();
      if (!py) return;
    }

    setIsRunning(true);
    setRunDiagnostics(null);
    setOutput(`=== Executing ${targetFile.path} ===\n`);

    try {
      const py = pyodideRef.current;
      syncAllFilesToPyodide(toRun);

      // Run from the workspace root so `import utils` (and any other
      // local module) resolves, and make sure that root is on sys.path.
      py.runPython(`
import sys, os
os.chdir("/home/pyodide")
if "/home/pyodide" not in sys.path:
    sys.path.insert(0, "/home/pyodide")
`);

      // Capture stdout/stderr. stdin is empty — the Program-input box
      // was removed, so a program that calls input() raises EOFError.
      py.runPython(`
import sys
import io
sys.__lp_stdout__ = sys.stdout
sys.__lp_stderr__ = sys.stderr
sys.__lp_stdin__ = sys.stdin
class LPOutputBuffer(io.StringIO):
    pass
sys.stdout = LPOutputBuffer()
sys.stderr = sys.stdout
sys.stdin = io.StringIO("")
`);

      await py.runPythonAsync(code);

      const captured = py.runPython("sys.stdout.getvalue()");
      setOutput((prev) => prev + (captured || "(Execution completed with no output)\n") + "\n=== Finished (Exit 0) ===\n");
      // A clean run can still warn (warnings.warn) — mark those lines.
      const runWarnings = parsePythonWarnings(typeof captured === "string" ? captured : "");
      if (runWarnings.length > 0) {
        setRunDiagnostics({
          path: targetFile.path,
          items: runWarnings.map((w) => ({ ...w, severity: "warning" as const })),
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Keep whatever the program printed before it crashed.
      let captured = "";
      try {
        captured = pyodideRef.current?.runPython("sys.stdout.getvalue()") ?? "";
      } catch {}
      // Mark the failing line (red) plus any warning lines (yellow)
      // printed before the crash — the page shows them as squiggles.
      // Pyodide's error message is empty here: the traceback goes to
      // stderr, which lands in the captured output — so the frames
      // are parsed from the capture, with the message as fallback.
      const runError = parsePythonError(msg) ?? parsePythonError(captured);
      const runWarnings = parsePythonWarnings(captured);
      const diagnosticItems: RunDiagnostic[] = [
        ...runWarnings.map((w) => ({ ...w, severity: "warning" as const })),
        ...(runError ? [{ ...runError, severity: "error" as const }] : []),
      ];
      if (diagnosticItems.length > 0) {
        setRunDiagnostics({ path: targetFile.path, items: diagnosticItems });
      }
      setOutput(
        (prev) =>
          prev +
          (captured ? captured + "\n" : "") +
          `Traceback (most recent call last):\n${msg}\n=== Execution Failed ===\n`
      );
    } finally {
      try {
        pyodideRef.current?.runPython(
          "sys.stdout = sys.__lp_stdout__\n" +
            "sys.stderr = sys.__lp_stderr__\n" +
            "sys.stdin = sys.__lp_stdin__"
        );
      } catch {}
      setIsRunning(false);
    }
  }

  // What `help` prints in the terminal (plain English, like the
  // drop-zone labels — not an i18n string).
  const TERMINAL_HELP = [
    "python <file.py>  run a file — its output appears here",
    "run               run the active file",
    "ls                list the workspace files",
    "pwd               show the active file path",
    "clear             clear the terminal",
    "help              show this list",
    "<python code>     run Python in the live runtime, e.g. 2 + 2",
    "",
  ].join("\n");

  // VS Code-style terminal command line: one line, prompt shows the
  // active file path. Shell commands first — `python <file>` runs a
  // file (its output lands here), `run` runs the active file, `ls`
  // lists the workspace, `pwd` shows the active file, `clear`
  // empties the terminal, `help` lists all of these — and anything
  // else runs as Python in the live runtime (REPL-style: expressions
  // print their repr, statements run silently, print() is captured).
  // stdout is redirected only for the duration of the call and
  // restored in `finally`, so a crash cannot leave it captured.
  async function runTerminalCommand() {
    const raw = terminalInput.trim();
    if (!raw || terminalBusy) return;
    setTerminalInput("");
    const prompt = `${activeFile?.path ?? "~"} $`;
    setOutput((prev) => prev + `${prompt} ${raw}\n`);
    const [head, ...rest] = raw.split(/\s+/);
    const arg = rest.join(" ").trim();
    if (head === "clear") {
      setOutput("");
      return;
    }
    if (head === "help") {
      setOutput((prev) => prev + TERMINAL_HELP);
      return;
    }
    if (head === "ls") {
      const files = items.filter((it) => it.type === "file").map((it) => it.path);
      setOutput((prev) => prev + (files.length > 0 ? files.join("\n") + "\n" : "(no files)\n"));
      return;
    }
    if (head === "pwd") {
      setOutput((prev) => prev + `${activeFile?.path ?? "~"}\n`);
      return;
    }
    if (head === "run") {
      await compileAndRun();
      return;
    }
    if (head === "python" || head === "python3" || head === "py") {
      if (!arg) {
        setOutput((prev) => prev + "usage: python <file.py>\n");
        return;
      }
      const target = items.find(
        (it) => it.type === "file" && (it.path === arg || it.path === arg.replace(/^\.\//, ""))
      );
      if (!target) {
        setOutput((prev) => prev + `python: can't open file '${arg}': [Errno 2] No such file or directory\n`);
        return;
      }
      setActiveFilePath(target.path);
      await compileAndRun(target);
      return;
    }
    // Anything else: Python in the live runtime.
    const py = pyodideRef.current;
    if (!py) {
      setOutput((prev) => prev + `${t.editorPage.terminalNotReady}\n`);
      return;
    }
    setTerminalBusy(true);
    try {
      const result = await py.runPythonAsync(`
import sys, io
_lp_term_out = io.StringIO()
_lp_term_old = sys.stdout
sys.stdout = _lp_term_out
_lp_term_repr = ""
try:
    try:
        _lp_term_val = eval(compile(${JSON.stringify(raw)}, "<terminal>", "eval"))
        if _lp_term_val is not None:
            _lp_term_repr = repr(_lp_term_val)
    except SyntaxError:
        exec(compile(${JSON.stringify(raw)}, "<terminal>", "exec"))
finally:
    sys.stdout = _lp_term_old
_lp_term_result = _lp_term_out.getvalue()
if _lp_term_repr != "":
    if _lp_term_result != "" and not _lp_term_result.endswith("\\n"):
        _lp_term_result += "\\n"
    _lp_term_result += _lp_term_repr
_lp_term_result
`);
      let text = typeof result === "string" ? result : "";
      if (text.length > 2000) {
        text = text.slice(0, 2000) + "\n…(output truncated)";
      }
      if (text) {
        setOutput((prev) => prev + text + (text.endsWith("\n") ? "" : "\n"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutput((prev) => prev + `${msg}\n`);
    } finally {
      setTerminalBusy(false);
    }
  }

  return {
    pyodideRef,
    pyodideReady,
    loadingEngine,
    engineStage,
    engineElapsed,
    pyodideError,
    setPyodideError,
    setEngineStage,
    isRunning,
    runDiagnostics,
    terminalBusy,
    terminalInput,
    setTerminalInput,
    formatting,
    interruptBufferRef,
    initPyodide,
    ensurePyodideReady,
    cancelEngineLoad,
    stopRunning,
    compileAndRun,
    runTerminalCommand,
    syncAllFilesToPyodide,
    formatCurrentFile,
  };
}

export type PyodideEngine = ReturnType<typeof usePyodideEngine>;
