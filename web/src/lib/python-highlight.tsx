import type { ReactNode } from "react";

// Lightweight Python syntax highlighter for lesson code blocks — no
// external dependency (no prism/highlight.js), just a small scanner
// over the source. Strings are recognised before comments, so a `#`
// inside a string is not treated as a comment.
const KEYWORDS = new Set([
  "def", "class", "if", "elif", "else", "for", "while", "return",
  "import", "from", "as", "try", "except", "finally", "with", "lambda",
  "pass", "break", "continue", "and", "or", "not", "in", "is",
  "None", "True", "False", "global", "nonlocal", "assert", "del",
  "raise", "yield", "async", "await",
]);

const BUILTINS = new Set([
  "print", "len", "range", "str", "int", "float", "list", "dict",
  "set", "tuple", "type", "input", "open", "sum", "min", "max",
  "abs", "round", "bool", "bytes", "enumerate", "zip",
]);

function isWordChar(ch: string): boolean {
  return /[A-Za-z0-9_]/.test(ch);
}

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

/** Split Python source into coloured spans. An identifier followed by
 *  `(` is a function call and gets the builtin colour too. */
export function highlightPython(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;
  let i = 0;
  const n = code.length;
  const push = (text: string, cls?: string) => {
    if (!text) return;
    out.push(cls ? <span key={key++} className={cls}>{text}</span> : text);
  };
  while (i < n) {
    const ch = code[i];
    // Comment: # to end of line (only outside strings — strings are
    // consumed first, so a # inside one never reaches here).
    if (ch === "#") {
      let j = i;
      while (j < n && code[j] !== "\n") j++;
      push(code.slice(i, j), "text-neutral-500");
      i = j;
      continue;
    }
    // String: triple-quoted (may span lines) or single/double-quoted.
    if (ch === '"' || ch === "'") {
      const triple = code.slice(i, i + 3) === ch + ch + ch;
      if (triple) {
        const end = code.indexOf(ch + ch + ch, i + 3);
        const j = end === -1 ? n : end + 3;
        push(code.slice(i, j), "text-emerald-300");
        i = j;
        continue;
      }
      let j = i + 1;
      while (j < n && code[j] !== "\n") {
        if (code[j] === "\\") { j += 2; continue; }
        if (code[j] === ch) { j++; break; }
        j++;
      }
      push(code.slice(i, j), "text-emerald-300");
      i = j;
      continue;
    }
    // Number: digits, optionally with underscores and a decimal part.
    if (isDigit(ch)) {
      let j = i;
      while (j < n && (isDigit(code[j]) || code[j] === "_")) j++;
      if (code[j] === "." && isDigit(code[j + 1] ?? "")) {
        j++;
        while (j < n && (isDigit(code[j]) || code[j] === "_")) j++;
      }
      push(code.slice(i, j), "text-orange-300");
      i = j;
      continue;
    }
    // Word: keyword, builtin, function call, or plain identifier.
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < n && isWordChar(code[j])) j++;
      const word = code.slice(i, j);
      let k = j;
      while (k < n && (code[k] === " " || code[k] === "\t")) k++;
      const isCall = code[k] === "(";
      if (KEYWORDS.has(word)) push(word, "text-violet-300");
      else if (BUILTINS.has(word) || isCall) push(word, "text-sky-300");
      else push(word);
      i = j;
      continue;
    }
    // Anything else (operators, punctuation, whitespace): plain.
    push(ch);
    i++;
  }
  return out;
}
