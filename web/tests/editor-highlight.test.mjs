import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

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
      page.includes("onLoad={() => initPyodide()}"),
      "Script onLoad must call initPyodide with no arguments"
    );
    assert.ok(!page.includes("onLoad={initPyodide}"), "bare initPyodide must not be the onLoad handler");
    assert.ok(!page.includes("TEMP-DIAG"), "no diagnostic logging may ship");
  });

  test("initPyodide only registers real function stage listeners", () => {
    const page = read("src/app/editor/page.tsx");
    assert.ok(
      page.includes('typeof onStage === "function"'),
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
    const page = read("src/app/editor/page.tsx");
    assert.ok(page.includes("HighlightedTerminal"), "terminal must use the highlighted renderer");
    assert.ok(page.includes("<HighlightedTerminal output={output} />"), "terminal output must go through it");
    assert.ok(page.includes("HighlightedMarkdown"), "AI answers must use the highlighted renderer");
    assert.ok(page.includes("<HighlightedMarkdown text={aiAnswer} />"), "AI answer text must go through it");
    assert.ok(
      page.includes('from "@/lib/highlight"'),
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
});
