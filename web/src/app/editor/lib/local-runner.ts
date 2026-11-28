// Local runner client: talks to the tiny runner.py server on the user's
// PC (web/local-runner/runner.py). Pyodide cannot run tkinter/turtle or
// a real terminal; the runner runs the workspace with the PC's real
// Python instead. Plain English strings, not i18n keys — the same as the
// terminal help text.

export const LOCAL_RUNNER_PORT = 8765;
export const LOCAL_RUNNER_URL = `http://127.0.0.1:${LOCAL_RUNNER_PORT}`;
export const LOCAL_RUNNER_DOWNLOAD_URL =
  "https://raw.githubusercontent.com/Adeen469/Learn-Python/main/web/local-runner/runner.py";
// The runner kills runs at this limit; close GUI windows to see output.
export const LOCAL_RUNNER_TIMEOUT_MS = 120_000;

export type LocalRunFile = { path: string; content: string };
export type LocalRunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
};

// Modules Pyodide does not ship (tkinter is removed from the Pyodide
// standard library; turtle needs it). Code importing these needs the PC.
const UNSUPPORTED_MODULES = ["tkinter", "turtle", "_tkinter"];

// The module a snippet needs real Python for, or null. Matches real
// import statements at line start; a mention inside a comment or string
// does not count (ponytail: a full parser is overkill here).
export function needsLocalRunner(code: string): string | null {
  for (const line of code.split("\n")) {
    const m = line.match(/^\s*(?:import\s+([\w.]+)|from\s+([\w.]+)\s+import)\b/);
    const mod = (m?.[1] ?? m?.[2] ?? "").split(".")[0];
    if (mod && UNSUPPORTED_MODULES.includes(mod)) return mod;
  }
  return null;
}

// Is the runner up? Fast (1.5s) so a missing runner never stalls a run.
export async function pingLocalRunner(): Promise<boolean> {
  try {
    const c = new AbortController();
    const timer = setTimeout(() => c.abort(), 1500);
    try {
      const res = await fetch(`${LOCAL_RUNNER_URL}/ping`, { signal: c.signal });
      return res.ok;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return false;
  }
}

export async function runOnLocalRunner(
  files: LocalRunFile[],
  entry: string,
  timeoutMs: number = LOCAL_RUNNER_TIMEOUT_MS
): Promise<LocalRunResult> {
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), timeoutMs + 10_000);
  try {
    const res = await fetch(`${LOCAL_RUNNER_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files,
        entry,
        timeout: Math.ceil(timeoutMs / 1000),
      }),
      signal: c.signal,
    });
    if (!res.ok) throw new Error(`runner replied ${res.status}`);
    const j = (await res.json()) as {
      stdout?: string;
      stderr?: string;
      exit_code?: number;
      timed_out?: boolean;
    };
    return {
      stdout: j.stdout ?? "",
      stderr: j.stderr ?? "",
      exitCode: j.exit_code ?? 1,
      timedOut: !!j.timed_out,
    };
  } finally {
    clearTimeout(timer);
  }
}

// Shown when the user runs in PC mode but the runner is not up, and
// when browser-mode code imports a module only real Python has.
export const LOCAL_RUNNER_NOT_RUNNING = [
  "Local runner is not running — this code needs the real Python on your PC.",
  "1. Download runner.py:",
  `   ${LOCAL_RUNNER_DOWNLOAD_URL}`,
  "2. Run it on your PC: python runner.py",
  "3. Turn on 'Run on my PC' in the editor and run again.",
  "The full local terminal is a desktop-app feature — the desktop app is",
  "coming 12 Jan 2027. The runner is the way to get it now.",
].join("\n");
