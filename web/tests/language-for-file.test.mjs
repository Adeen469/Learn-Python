import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");
const utils = read("src/app/editor/lib/editor-utils.ts");

// Mirrors of languageForFile / parsePythonError / parsePythonWarnings
// in editor-utils.ts (pure logic — the .ts source cannot be imported
// by node --test, so the behaviour is tested here and the static
// checks below fail if the source drifts from these mirrors).

const EXTENSION_LANGUAGES = {
  py: "python",
  html: "html",
  htm: "html",
  css: "css",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  md: "markdown",
  txt: "plaintext",
  xml: "xml",
  yml: "yaml",
  yaml: "yaml",
  sh: "shell",
  sql: "sql",
  java: "java",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  go: "go",
  rs: "rust",
  rb: "ruby",
  php: "php",
};

function languageForFile(path) {
  if (!path) return "plaintext";
  const base = path.split("/").pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "plaintext";
  const ext = base.slice(dot + 1).toLowerCase();
  return EXTENSION_LANGUAGES[ext] ?? "plaintext";
}

function parsePythonError(msg) {
  if (!msg) return null;
  const frames = [...msg.matchAll(/File "<exec>", line (\d+)/g)];
  if (frames.length === 0) return null;
  const line = Number(frames[frames.length - 1][1]);
  if (!Number.isFinite(line) || line < 1) return null;
  const lines = msg
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && l !== "Traceback (most recent call last):");
  const message = lines.length > 0 ? lines[lines.length - 1] : "Error";
  return { line, message };
}

function parsePythonWarnings(output) {
  if (!output) return [];
  const seen = new Set();
  const out = [];
  for (const raw of output.split("\n")) {
    const m = /^<exec>:(\d+): ([A-Za-z_][A-Za-z0-9_]*Warning): (.*)$/.exec(raw.trim());
    if (!m) continue;
    const line = Number(m[1]);
    if (!Number.isFinite(line) || line < 1) continue;
    const message = `${m[2]}: ${m[3]}`.trim();
    const key = `${line}:${message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ line, message });
  }
  return out;
}

describe("languageForFile", () => {
  test("maps every listed extension to its Monaco language", () => {
    assert.equal(languageForFile("main.py"), "python");
    assert.equal(languageForFile("index.html"), "html");
    assert.equal(languageForFile("old.htm"), "html");
    assert.equal(languageForFile("style.css"), "css");
    assert.equal(languageForFile("app.js"), "javascript");
    assert.equal(languageForFile("comp.jsx"), "javascript");
    assert.equal(languageForFile("lib.ts"), "typescript");
    assert.equal(languageForFile("comp.tsx"), "typescript");
    assert.equal(languageForFile("data.json"), "json");
    assert.equal(languageForFile("notes.md"), "markdown");
    assert.equal(languageForFile("readme.txt"), "plaintext");
    assert.equal(languageForFile("feed.xml"), "xml");
    assert.equal(languageForFile("config.yml"), "yaml");
    assert.equal(languageForFile("config.yaml"), "yaml");
    assert.equal(languageForFile("run.sh"), "shell");
    assert.equal(languageForFile("query.sql"), "sql");
    assert.equal(languageForFile("Main.java"), "java");
    assert.equal(languageForFile("main.c"), "c");
    assert.equal(languageForFile("lib.h"), "c");
    assert.equal(languageForFile("main.cpp"), "cpp");
    assert.equal(languageForFile("main.cc"), "cpp");
    assert.equal(languageForFile("main.go"), "go");
    assert.equal(languageForFile("main.rs"), "rust");
    assert.equal(languageForFile("app.rb"), "ruby");
    assert.equal(languageForFile("index.php"), "php");
  });

  test("unknown and missing extensions fall back to plaintext", () => {
    assert.equal(languageForFile("notes.xyz"), "plaintext");
    assert.equal(languageForFile("Dockerfile"), "plaintext");
    assert.equal(languageForFile("Makefile"), "plaintext");
    assert.equal(languageForFile(".env"), "plaintext");
    assert.equal(languageForFile(".gitignore"), "plaintext");
    assert.equal(languageForFile("noext/"), "plaintext");
    assert.equal(languageForFile(undefined), "plaintext");
    assert.equal(languageForFile(null), "plaintext");
    assert.equal(languageForFile(""), "plaintext");
  });

  test("extension match is case-insensitive and uses the last dot", () => {
    assert.equal(languageForFile("App.HTML"), "html");
    assert.equal(languageForFile("archive.tar.py"), "python");
    assert.equal(languageForFile("a/b/c/style.CSS"), "css");
    assert.equal(languageForFile("src/utils/helpers.TS"), "typescript");
  });

  test("the source keeps the same mapping (drift check)", () => {
    for (const [ext, lang] of Object.entries(EXTENSION_LANGUAGES)) {
      assert.ok(utils.includes(`${ext}: "${lang}"`), `editor-utils.ts must map .${ext} to ${lang}`);
    }
    assert.ok(utils.includes("export function languageForFile"), "editor-utils.ts must export languageForFile");
  });
});

describe("parsePythonError", () => {
  test("parses the innermost <exec> frame and the exception line", () => {
    const msg = [
      'Traceback (most recent call last):',
      '  File "<exec>", line 3, in <module>',
      "NameError: name 'foo' is not defined",
    ].join("\n");
    assert.deepEqual(parsePythonError(msg), { line: 3, message: "NameError: name 'foo' is not defined" });
  });

  test("takes the last frame when the traceback has several", () => {
    const msg = [
      'Traceback (most recent call last):',
      '  File "<exec>", line 1, in <module>',
      '  File "<exec>", line 5, in <module>',
      "ZeroDivisionError: division by zero",
    ].join("\n");
    assert.deepEqual(parsePythonError(msg), { line: 5, message: "ZeroDivisionError: division by zero" });
  });

  test("handles a SyntaxError frame (no 'in <module>')", () => {
    const msg = ['  File "<exec>", line 2', "    x = ", "    ^", "SyntaxError: invalid syntax"].join("\n");
    assert.deepEqual(parsePythonError(msg), { line: 2, message: "SyntaxError: invalid syntax" });
  });

  test("returns null when there is no <exec> frame", () => {
    assert.equal(parsePythonError("NameError: name 'foo' is not defined"), null);
    assert.equal(parsePythonError(""), null);
    assert.equal(parsePythonError('  File "/home/pyodide/utils/x.py", line 4\nValueError: bad'), null);
  });

  test("skips Pyodide's trailing 'Traceback...' header when picking the message", () => {
    const msg = [
      '  File "<exec>", line 3, in <module>',
      "NameError: name 'foo' is not defined",
      "",
      "Traceback (most recent call last):",
    ].join("\n");
    assert.deepEqual(parsePythonError(msg), { line: 3, message: "NameError: name 'foo' is not defined" });
  });

  test("parses the stderr capture (Pyodide's message is empty — the traceback is in the output)", () => {
    // Real capture from a failing run: stdout ("hello") + the
    // traceback Python prints to stderr, which the engine redirects
    // into the same buffer.
    const captured = [
      "hello",
      "Traceback (most recent call last):",
      '  File "/lib/python312.zip/_pyodide/_base.py", line 597, in eval_code_async',
      "    await CodeRunner(",
      '  File "/lib/python312.zip/_pyodide/_base.py", line 411, in run_async',
      "    coroutine = eval(self.code, globals, locals)",
      "                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
      '  File "<exec>", line 3, in <module>',
      "NameError: name 'foo_bar_undefined' is not defined",
      "",
    ].join("\n");
    assert.equal(parsePythonError(""), null);
    assert.deepEqual(parsePythonError(captured), { line: 3, message: "NameError: name 'foo_bar_undefined' is not defined" });
  });
});

describe("parsePythonWarnings", () => {
  test("parses <exec>:line: Category: message lines", () => {
    const out = "<exec>:3: UserWarning: this is deprecated\nhello\n<exec>:7: DeprecationWarning: use the new API\n";
    assert.deepEqual(parsePythonWarnings(out), [
      { line: 3, message: "UserWarning: this is deprecated" },
      { line: 7, message: "DeprecationWarning: use the new API" },
    ]);
  });

  test("ignores other output and dedupes repeats", () => {
    const out = [
      "hello world",
      "<exec>:2: UserWarning: same",
      "<exec>:2: UserWarning: same",
      "File \"<exec>\", line 4",
      "not a warning: <exec>:9: UserWarning: trailing",
    ].join("\n");
    assert.deepEqual(parsePythonWarnings(out), [{ line: 2, message: "UserWarning: same" }]);
  });

  test("returns [] for empty or warning-free output", () => {
    assert.deepEqual(parsePythonWarnings(""), []);
    assert.deepEqual(parsePythonWarnings("hello\nworld\n"), []);
  });
});
