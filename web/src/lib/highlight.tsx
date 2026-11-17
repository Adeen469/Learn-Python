// Lightweight Python syntax highlighting for the places where code is
// shown as plain text — the AI answer panel (replies contain ```python
// fences) and the Terminal Logs (Python tracebacks contain code lines).
// The main editor already has Monaco; this is only for small snippets,
// so there is no new dependency — a single-pass tokenizer with the same
// muted vs-dark palette Monaco uses, so snippets match the editor.
//
// Colors are deliberately muted (no saturated gradients, no bright
// accents) to fit the app's black/neutral look.

import type { ReactNode } from "react";

export const TOKEN_COLORS = {
  keyword: "#569cd6", // def, if, return, import, ...
  string: "#ce9178", // "..." / '...' / f"..."
  comment: "#6a9955", // # ...
  number: "#b5cea8", // 18, 3.14
  builtin: "#dcdcaa", // print(), len(), range(), name()
  plain: "#d4d4d4",
} as const;

export type TokenKind = keyof typeof TOKEN_COLORS;

export interface Token {
  text: string;
  kind: TokenKind;
}

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

// One pass, in priority order: a `#` inside a string is not a comment,
// and a keyword inside a string is not a keyword. Numbered groups
// (named groups need a newer TS target than this project sets):
// 1 comment, 2 string, 3 decorator, 4 number, 5 word.
const TOKEN_RE =
  /(#[^\n]*)|((?:[fFrRbBuU]{0,2}"""[\s\S]*?"""|[fFrRbBuU]{0,2}'''[\s\S]*?'''|[fFrRbBuU]{0,2}"(?:[^"\\\n]|\\.)*"|[fFrRbBuU]{0,2}'(?:[^'\\\n]|\\.)*'))|(@[A-Za-z_][A-Za-z0-9_.]*)|(\b(?:0[xX][0-9a-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

/** Split Python source into coloured tokens. Pure — safe to test. */
export function tokenizePython(code: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(code)) !== null) {
    if (m.index > last) {
      tokens.push({ text: code.slice(last, m.index), kind: "plain" });
    }
    const g = m;
    let kind: TokenKind = "plain";
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
  if (last < code.length) {
    tokens.push({ text: code.slice(last), kind: "plain" });
  }
  return tokens;
}

/** Render tokenized Python as coloured spans. */
export function HighlightedPython({ code }: { code: string }) {
  const tokens = tokenizePython(code);
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: TOKEN_COLORS[t.kind] }}>
          {t.text}
        </span>
      ))}
    </>
  );
}

export interface FencedBlock {
  type: "prose" | "code";
  lang: string;
  text: string;
}

/**
 * Split text on ``` fences (```python, ```py, or bare ```). An unclosed
 * fence runs to the end. Pure — safe to test.
 */
export function splitFencedBlocks(text: string): FencedBlock[] {
  const blocks: FencedBlock[] = [];
  const lines = text.split("\n");
  let prose: string[] = [];
  let code: string[] | null = null;
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
  if (code !== null) {
    blocks.push({ type: "code", lang, text: code.join("\n") });
  }
  flushProse();
  return blocks;
}

/**
 * Render AI-reply text: prose stays prose, ```python fences become
 * highlighted code blocks. Only Python (or unlabelled) fences are
 * tokenized — anything else renders as plain mono text.
 */
export function HighlightedMarkdown({ text }: { text: string }) {
  const blocks = splitFencedBlocks(text);
  return (
    <>
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <pre
            key={i}
            className="mt-3 overflow-x-auto rounded-lg border border-neutral-800 bg-black p-3 font-mono text-xs leading-relaxed whitespace-pre"
          >
            {b.lang && b.lang !== "python" && b.lang !== "py" ? (
              <span style={{ color: TOKEN_COLORS.plain }}>{b.text}</span>
            ) : (
              <HighlightedPython code={b.text} />
            )}
          </pre>
        ) : (
          <p key={i} className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
            {b.text}
          </p>
        )
      )}
    </>
  );
}

export type TerminalLineKind =
  | "plain"
  | "traceback-head"
  | "traceback-file"
  | "traceback-code"
  | "traceback-error"
  | "status";

/**
 * Classify one Terminal Logs line. Tracebacks get structure:
 *   Traceback (most recent call last):
 *     File "main.py", line 3, in <module>
 *       <code line>
 *   NameError: name 'x' is not defined
 * Program output and status lines (===, ✓, ✗, [Saved ...]) stay plain.
 * `inTraceback` tracks whether we are between the head and the error
 * line, so indented program output is never mistaken for code.
 */
export function classifyTerminalLine(
  line: string,
  inTraceback: boolean
): { kind: TerminalLineKind; inTraceback: boolean } {
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

const FILE_LINE_RE =
  /^(\s*File\s+)("[^"]*")(,\s*line\s+)(\d+)(.*)$/;

/** Render one terminal line with its traceback colours. */
function TerminalLine({ line, kind }: { line: string; kind: TerminalLineKind }) {
  switch (kind) {
    case "traceback-head":
      return <span style={{ color: "#f87171" }}>{line}</span>;
    case "traceback-error":
      return <span style={{ color: "#fca5a5" }}>{line}</span>;
    case "traceback-file": {
      const m = line.match(FILE_LINE_RE);
      if (!m) return <span style={{ color: "#a3a3a3" }}>{line}</span>;
      return (
        <span>
          <span style={{ color: "#a3a3a3" }}>{m[1]}</span>
          <span style={{ color: TOKEN_COLORS.string }}>{m[2]}</span>
          <span style={{ color: "#a3a3a3" }}>{m[3]}</span>
          <span style={{ color: TOKEN_COLORS.number }}>{m[4]}</span>
          <span style={{ color: "#a3a3a3" }}>{m[5]}</span>
        </span>
      );
    }
    case "traceback-code":
      return <HighlightedPython code={line} />;
    default:
      return <span>{line}</span>;
  }
}

/**
 * Render the whole Terminal Logs output: tracebacks get their code
 * lines highlighted, everything else renders exactly as before.
 */
export function HighlightedTerminal({ output }: { output: string }) {
  const lines = output.split("\n");
  let inTraceback = false;
  return (
    <>
      {lines.map((line, i) => {
        const c = classifyTerminalLine(line, inTraceback);
        inTraceback = c.inTraceback;
        return (
          <span key={i}>
            <TerminalLine line={line} kind={c.kind} />
            {i < lines.length - 1 ? "\n" : ""}
          </span>
        );
      })}
    </>
  );
}
