import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8").replace(/\r\n/g, "\n");

// The editor split (2026-11-23): the Pyodide engine lives in the hook,
// the terminal JSX in TerminalPanel, the AI panel in AiPanel — the
// static checks below read the file that actually holds each piece.
const hook = read("src/app/editor/hooks/usePyodideEngine.ts");
const terminalPanel = read("src/app/editor/components/TerminalPanel.tsx");
const aiPanel = read("src/app/editor/components/AiPanel.tsx");

// --- Inline mirrors of web/src/lib/highlight.tsx (pure logic, no JSX)
// so node --test can verify behaviour without a build. Keep the regexes
// and sets identical to the source; the static tests below fail if the
// source drifts from these mirrors.

const TOKEN_COLORS = {
  keyword: "#569cd6",
  string: "#ce9178",
  comment: "#6a9955",
  number: "#b5cea8",
  builtin: "#dcdcaa",
  plain: "#d4d4d4",
};

const KEYWORDS = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue",
  "def", "del", "elif", "else", "except", "finally", "for", "from",
  "global", "if", "import", "in", "is", "lambda", "nonlocal", "not",
  "or", "pass", "raise", "return", "try", "while", "with", "yield",
  "None", "True", "False",
]);

const BUILTINS = new Set([
  "print", "len", "range", "input", "str", "int", "float", "bool",
  "list", "dict", "set", "tuple", "type", "open", "abs", "sum",
  "min", "max", "enumerate", "zip", "map", "filter", "sorted",
  "reversed", "isinstance", "issubclass", "super", "self", "cls",
  "round", "chr", "ord",
]);

const TOKEN_RE =
  /(#[^\n]*)|((?:[fFrRbBuU]{0,2}"""[\s\S]*?"""|[fFrRbBuU]{0,2}'''[\s\S]*?'''|[fFrRbBuU]{0,2}"(?:[^"\\\n]|\\.)*"|[fFrRbBuU]{0,2}'(?:[^'\\\n]|\\.)*'))|(@[A-Za-z_][A-Za-z0-9_.]*)|(\b(?:0[xX][0-9a-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

function tokenizePython(code) {
  const tokens = [];
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  let m;
  while ((m = TOKEN_RE.exec(code)) !== null) {
    if (m.index > last) tokens.push({ text: code.slice(last, m.index), kind: "plain" });
    const g = m;
    let kind = "plain";
    if (g[1] !== undefined) kind = "comment";
    else if (g[2] !== undefined) kind = "string";
    else if (g[3] !== undefined) kind = "keyword";
    else if (g[4] !== undefined) kind = "number";
    else if (g[5] !== undefined) {
      const word = g[5];
      if (KEYWORDS.has(word)) kind = "keyword";
      else if (BUILTINS.has(word)) kind = "builtin";
      else if (code[m.index + word.length] === "(") kind = "builtin";
      else kind = "plain";
    }
    tokens.push({ text: m[0], kind });
    last = m.index + m[0].length;
  }
  if (last < code.length) tokens.push({ text: code.slice(last), kind: "plain" });
  return tokens;
}

function splitFencedBlocks(text) {
  const blocks = [];
  const lines = text.split("\n");
  let prose = [];
  let code = null;
  let lang = "";
  const flushProse = () => {
    const joined = prose.join("\n").trim();
    if (joined) blocks.push({ type: "prose", lang: "", text: joined });
    prose = [];
  };
  for (const line of lines) {
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      if (code === null) {
        flushProse();
        code = [];
        lang = fence[1] || "";
      } else {
        blocks.push({ type: "code", lang, text: code.join("\n") });
        code = null;
        lang = "";
      }
    } else if (code !== null) {
      code.push(line);
    } else {
      prose.push(line);
    }
  }
  if (code !== null) blocks.push({ type: "code", lang, text: code.join("\n") });
  flushProse();
  return blocks;
}

function classifyTerminalLine(line, inTraceback) {
  if (/^Traceback \(most recent call last\):\s*$/.test(line)) {
    return { kind: "traceback-head", inTraceback: true };
  }
  if (inTraceback) {
    if (/^\s*File\s+".*", line \d+/.test(line)) {
      return { kind: "traceback-file", inTraceback: true };
    }
    if (/^\s+\S/.test(line)) {
      return { kind: "traceback-code", inTraceback: true };
    }
    if (/^[A-Za-z_][\w.]*(\.\w+)?:/.test(line) || /^[A-Za-z_][\w.]*Error/.test(line)) {
      return { kind: "traceback-error", inTraceback: false };
    }
    return { kind: "plain", inTraceback: false };
  }
  return { kind: "plain", inTraceback: false };
}

const kinds = (code) => tokenizePython(code).map((t) => `${t.text}=>${t.kind}`);

describe("python tokenizer", () => {
  test("keywords, builtins, numbers, plain names", () => {
    assert.deepEqual(kinds("def foo(x):\n    return x + 18"), [
      "def=>keyword", " =>plain", "foo=>builtin", "(=>plain", "x=>plain",
      "):\n    =>plain", "return=>keyword", " =>plain",
      "x=>plain", " + =>plain", "18=>number",
    ]);
    assert.equal(kinds("print(len([1, 2]))").filter((k) => k.endsWith("builtin")).length, 2);
  });

  test("strings win over comment and keyword rules", () => {
    const toks = tokenizePython('s = "not # a comment and not if"  # real comment');
    const strings = toks.filter((t) => t.kind === "string");
    assert.equal(strings.length, 1);
    assert.equal(strings[0].text, '"not # a comment and not if"');
    assert.equal(toks[toks.length - 1].kind, "comment");
    assert.equal(tokenizePython('name = f"hi {user}"')[2].kind, "string");
  });

  test("triple-quoted strings span lines, escapes stay inside", () => {
    const toks = tokenizePython('doc = """line one\nline two"""\nx = "a\\"b"');
    assert.equal(toks.filter((t) => t.kind === "string").length, 2);
    assert.equal(toks[0].kind, "plain"); // 'doc = ' is plain/keyword-free
  });

  test("decorators, hex and floats", () => {
    assert.ok(kinds("@app.route").includes("@app.route=>keyword"));
    assert.ok(kinds("x = 0xFF").includes("0xFF=>number"));
    assert.ok(kinds("pi = 3.14").includes("3.14=>number"));
  });

  test("colours are the muted vs-dark palette", () => {
    assert.equal(TOKEN_COLORS.keyword, "#569cd6");
    assert.equal(TOKEN_COLORS.string, "#ce9178");
    assert.equal(TOKEN_COLORS.comment, "#6a9955");
    for (const c of Object.values(TOKEN_COLORS)) {
      assert.match(c, /^#[0-9a-f]{6}$/);
    }
  });
});

describe("fenced code blocks (AI answers)", () => {
  test("prose + python fence + prose", () => {
    const blocks = splitFencedBlocks(
      "The bug is the missing colon.\n```python\nif x:\n    print(x)\n```\nFix it like that."
    );
    assert.equal(blocks.length, 3);
    assert.equal(blocks[0].type, "prose");
    assert.equal(blocks[1].type, "code");
    assert.equal(blocks[1].lang, "python");
    assert.equal(blocks[1].text, "if x:\n    print(x)");
    assert.equal(blocks[2].type, "prose");
  });

  test("unclosed fence runs to the end, bare fence has no lang", () => {
    const blocks = splitFencedBlocks("Here:\n```\nprint(1)");
    assert.equal(blocks.length, 2);
    assert.equal(blocks[1].type, "code");
    assert.equal(blocks[1].lang, "");
    assert.equal(blocks[1].text, "print(1)");
  });

  test("prose without fences is one block", () => {
    assert.deepEqual(splitFencedBlocks("Just words, no code."), [
      { type: "prose", lang: "", text: "Just words, no code." },
    ]);
  });
});

describe("terminal traceback classification", () => {
  test("a full traceback classifies line by line", () => {
    const lines = [
      "=== Executing main.py ===",
      "Traceback (most recent call last):",
      '  File "main.py", line 3, in <module>',
      "    print(age)",
      "NameError: name 'age' is not defined",
      "=== Execution Failed ===",
    ];
    let state = false;
    const got = lines.map((l) => {
      const c = classifyTerminalLine(l, state);
      state = c.inTraceback;
      return c.kind;
    });
    assert.deepEqual(got, [
      "plain",
      "traceback-head",
      "traceback-file",
      "traceback-code",
      "traceback-error",
      "plain",
    ]);
  });

  test("indented program output outside a traceback stays plain", () => {
    const c = classifyTerminalLine("    indented output", false);
    assert.equal(c.kind, "plain");
    assert.equal(c.inTraceback, false);
  });

  test("status lines stay plain", () => {
    for (const l of [
      "✓ Python runtime (Pyodide 0.27.2) loaded successfully.",
      "✗ Failed to load runtime: t is not a function",
      "[Saved 'main.py']",
    ]) {
      assert.equal(classifyTerminalLine(l, false).kind, "plain");
    }
  });
});

describe("editor fixes — static checks", () => {
  test("next/script onLoad must not pass the load Event into initPyodide", () => {
    const page = read("src/app/editor/page.tsx");
    assert.ok(
      page.includes("onLoad={() => engine.initPyodide((stage) => engine.setEngineStage(stage))}"),
      "Script onLoad must call initPyodide with a real stage-listener function, so the load status line can show which CDN is being tried"
    );
    assert.ok(!page.includes("onLoad={initPyodide}"), "bare initPyodide must not be the onLoad handler");
    assert.ok(!page.includes("onLoad={engine.initPyodide}"), "bare engine.initPyodide must not be the onLoad handler either");
    assert.ok(!page.includes("TEMP-DIAG"), "no diagnostic logging may ship");
  });

  test("initPyodide only registers real function stage listeners", () => {
    assert.ok(
      hook.includes('typeof onStage === "function"'),
      "initPyodide must guard onStage before adding it to the listener set"
    );
  });

  test("CSP allows the Monaco stylesheet from jsDelivr", () => {
    const config = read("next.config.ts");
    const styleSrc = config.match(/"style-src[^"]*"/)?.[0] ?? "";
    assert.ok(
      styleSrc.includes("https://cdn.jsdelivr.net"),
      "style-src must allow cdn.jsdelivr.net (Monaco editor.main.css)"
    );
  });

  test("editor page highlights code everywhere it is displayed", () => {
    assert.ok(terminalPanel.includes("HighlightedTerminal"), "terminal must use the highlighted renderer");
    assert.ok(terminalPanel.includes("<HighlightedTerminal output={output} />"), "terminal output must go through it");
    assert.ok(aiPanel.includes("HighlightedMarkdown"), "AI answers must use the highlighted renderer");
    assert.ok(aiPanel.includes("<HighlightedMarkdown text={m.text} />"), "AI panel messages must go through it");
    assert.ok(
      terminalPanel.includes('from "@/lib/highlight"') && aiPanel.includes('from "@/lib/highlight"'),
      "highlight components must come from the shared lib"
    );
  });

  test("highlight lib exports the pieces the page needs", () => {
    const lib = read("src/lib/highlight.tsx");
    for (const name of [
      "export function tokenizePython",
      "export function splitFencedBlocks",
      "export function classifyTerminalLine",
      "export function HighlightedPython",
      "export function HighlightedMarkdown",
      "export function HighlightedTerminal",
    ]) {
      assert.ok(lib.includes(name), `highlight.tsx must export ${name}`);
    }
    assert.ok(!lib.includes("linear-gradient"), "no gradients in the highlight styling");
  });

  test("runtime load shows its stage and elapsed seconds while Loading Engine", () => {
    const page = read("src/app/editor/page.tsx");
    assert.ok(hook.includes("const [engineStage, setEngineStage]"), "engineStage state must exist");
    assert.ok(hook.includes("const [engineElapsed, setEngineElapsed]"), "engineElapsed state must exist");
    assert.ok(
      hook.includes("setInterval(\n      () => setEngineElapsed((s) => s + 1),\n      1000"),
      "a 1s ticker must advance the elapsed seconds while loading"
    );
    assert.ok(
      page.includes("{engine.loadingEngine && ("),
      "a status line must render only while the engine is loading"
    );
    assert.ok(
      page.includes("{engine.engineStage ?? t.editorPage.loadingEngine}"),
      "the status line must show the live stage (which CDN/step), falling back to Loading Engine"
    );
    assert.ok(
      page.includes("· {engine.engineElapsed}s"),
      "the status line must show the elapsed seconds so a slow download reads as working, not stuck"
    );
    assert.ok(
      hook.includes(
        "if (gen === loadGenerationRef.current) {\n        setLoadingEngine(false);\n        setEngineStage(null);\n      }"
      ),
      "the stage must clear when the latest load finishes (guarded so a stale attempt cannot hide a fresh retry's spinner)"
    );
  });

  test("terminal has one VS Code-style command line (file-path prompt, shell commands + Python)", () => {
    const page = read("src/app/editor/page.tsx");
    assert.ok(hook.includes("const [terminalInput, setTerminalInput]"), "terminalInput state must exist");
    assert.ok(hook.includes("const [terminalBusy, setTerminalBusy]"), "terminalBusy state must exist");
    assert.ok(hook.includes("async function runTerminalCommand()"), "runTerminalCommand must exist");
    assert.ok(
      terminalPanel.includes('if (e.key === "Enter") engine.runTerminalCommand();'),
      "Enter in the terminal input must run the command"
    );
    assert.ok(
      terminalPanel.includes("disabled={!engine.pyodideReady || engine.terminalBusy || engine.isRunning}"),
      "the terminal input must stay disabled until the runtime is ready and while a command or file run is in flight"
    );
    // The Program-input box and the >>> line are gone — one line only.
    assert.ok(!page.includes("t.editorPage.programInputLabel"), "the Program input box must be gone");
    assert.ok(!page.includes("t.editorPage.programInputPlaceholder"), "the Program input placeholder must be gone");
    assert.ok(!page.includes("&gt;&gt;&gt;"), "the >>> prompt must be gone");
    assert.ok(!page.includes("programInput"), "no programInput state may remain");
    assert.ok(!terminalPanel.includes("programInput"), "no programInput may remain in the terminal panel either");
    // The prompt shows the active file path.
    assert.ok(terminalPanel.includes('{activeFile?.path ?? "~"} $'), "the prompt must show the active file path");
    // Shell commands.
    assert.ok(hook.includes('if (head === "clear")'), "'clear' must empty the terminal");
    assert.ok(hook.includes('if (head === "help")'), "'help' must list the commands");
    assert.ok(hook.includes('if (head === "ls")'), "'ls' must list the workspace files");
    assert.ok(hook.includes('if (head === "pwd")'), "'pwd' must show the active file path");
    assert.ok(hook.includes('if (head === "run")'), "'run' must run the active file");
    assert.ok(hook.includes('head === "python"'), "'python <file>' must run a file");
    assert.ok(hook.includes("await compileAndRun(target)"), "python <file> must run the named file");
    assert.ok(hook.includes("can't open file"), "python <file> must report a missing file");
    assert.ok(hook.includes("async function compileAndRun(file?: WorkspaceItem)"), "compileAndRun must accept a file to run");
    // Anything else is still Python in the live runtime.
    assert.ok(
      hook.includes('eval(compile(${JSON.stringify(raw)}, "<terminal>", "eval"))'),
      "expressions must run through eval so their repr prints (2 + 2 -> 4)"
    );
    assert.ok(
      hook.includes('exec(compile(${JSON.stringify(raw)}, "<terminal>", "exec"))'),
      "statements must fall back to exec when eval raises SyntaxError"
    );
    assert.ok(
      hook.includes("_lp_term_repr = repr(_lp_term_val)"),
      "an expression result must print its repr, not nothing"
    );
    assert.ok(
      terminalPanel.includes("t.editorPage.terminalCommandPlaceholder"),
      "the input must use the new command placeholder when ready"
    );
    assert.ok(
      terminalPanel.includes("t.editorPage.terminalInputLoadingPlaceholder"),
      "the input must say the runtime is still loading when it is not ready"
    );
  });

  test("terminal input i18n keys exist in the type and every language", () => {
    const type = read("src/lib/i18n/index.tsx");
    for (const key of [
      "terminalCommandPlaceholder: string;",
      "terminalInputLoadingPlaceholder: string;",
      "terminalNotReady: string;",
    ]) {
      assert.ok(type.includes(key), `Strings type must declare ${key}`);
    }
    for (const lang of ["en", "hi-roman", "fr", "de", "es", "pt", "ru", "ja", "ko", "zh", "ar"]) {
      const text = read(`src/lib/i18n/${lang}.ts`);
      for (const key of ["terminalCommandPlaceholder:", "terminalInputLoadingPlaceholder:", "terminalNotReady:"]) {
        assert.ok(text.includes(key), `${lang}.ts must define ${key}`);
      }
    }
  });
});

test("the load status line always shows the real stage, even when the load was started bare", () => {
  // Root cause of the user's 433s screenshot: Compile & Run calls
  // initPyodide() with NO stage listener, and the <Script> onLoad
  // listener is only registered when pyodide.js loads — so when the
  // script is slow, emitStage had no listeners and the line fell back
  // to the bare "Loading Engine" while the download was mid-flight.
  // emitStage must update engineStage directly, not only listeners.
  const emit = hook.match(/const emitStage = \(stage: string\) => \{[\s\S]*?\n    \};/);
  assert.ok(emit, "emitStage must be defined in initPyodide");
  assert.ok(
    emit[0].includes("setEngineStage(stage)"),
    "emitStage must call setEngineStage(stage) directly so the status line always shows the stage"
  );
  assert.ok(
    emit[0].includes("initStageListenersRef.current.forEach"),
    "emitStage must still notify the registered listeners (Modules tab)"
  );
});

test("a stalled runtime load can be cancelled, and a stale load cannot flip state", () => {
  const page = read("src/app/editor/page.tsx");
  // Generation guard.
  assert.ok(hook.includes("const loadGenerationRef = useRef(0);"), "a load-generation ref must exist");
  assert.ok(hook.includes("const gen = ++loadGenerationRef.current;"), "each fresh load must claim a generation");
  assert.ok(
    hook.includes("if (gen !== loadGenerationRef.current) return null;"),
    "a stale load finishing late must not mark its runtime ready"
  );
  assert.ok(
    hook.includes("if (gen === loadGenerationRef.current) {"),
    "only the latest attempt may clear the loading state in the finally"
  );
  // Cancel.
  assert.ok(hook.includes("function cancelEngineLoad()"), "a cancelEngineLoad function must exist");
  assert.ok(hook.includes("loadGenerationRef.current++;"), "cancel must invalidate the in-flight attempt");
  assert.ok(hook.includes("pyodideInitPromiseRef.current = null;"), "cancel must clear the shared init promise so a retry starts fresh");
  // The status line carries the Cancel button.
  assert.ok(page.includes("onClick={engine.cancelEngineLoad}"), "the status line must have a Cancel button wired to cancelEngineLoad");
  assert.ok(page.includes("{t.common.cancel}"), "the Cancel button must use the i18n cancel label");
  // The cancel label exists in the type and every language.
  const type = read("src/lib/i18n/index.tsx");
  assert.ok(type.includes("cancel: string;"), "the Strings type must carry common.cancel");
  for (const lang of ["en", "hi-roman", "fr", "ja", "ko", "es", "de", "pt", "ru", "ar", "zh"]) {
    const dict = read(`src/lib/i18n/${lang}.ts`);
    assert.ok(/cancel: "[^"]+",/.test(dict), `${lang} must define common.cancel`);
  }
});

test("workspace files are written to absolute /home/pyodide paths so local imports resolve", () => {
  // 2026-11-19: the runtime loaded but `import utils` raised
  // ModuleNotFoundError — the nested utils/ writes used relative
  // paths and failed with ErrnoError. Absolute paths under
  // /home/pyodide (Pyodide's working directory) plus a chdir +
  // sys.path insert before the run make local modules resolve.
  const page = read("src/app/editor/page.tsx");
  assert.ok(
    hook.includes('const PY_WORKSPACE_ROOT = "/home/pyodide";'),
    "the workspace root must be the absolute /home/pyodide path"
  );
  assert.ok(
    hook.includes("py.FS.mkdirTree(`${PY_WORKSPACE_ROOT}/${f.path}`)"),
    "folders must be created under the absolute workspace root"
  );
  assert.ok(
    hook.includes("py.FS.writeFile(`${PY_WORKSPACE_ROOT}/${f.path}`, f.content ?? \"\");"),
    "files must be written under the absolute workspace root"
  );
  assert.ok(
    hook.includes('os.chdir("/home/pyodide")'),
    "the run must chdir into the workspace root"
  );
  assert.ok(
    hook.includes('sys.path.insert(0, "/home/pyodide")'),
    "the workspace root must be inserted into sys.path before the run"
  );
  assert.ok(
    !/py\.FS\.writeFile\(f\.path,/.test(page),
    "no relative-path FS.writeFile(f.path, ...) may remain"
  );
  assert.ok(
    !/py\.FS\.writeFile\(f\.path,/.test(hook),
    "no relative-path FS.writeFile(f.path, ...) may remain in the engine either"
  );
});
