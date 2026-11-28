import assert from "node:assert/strict";
import test from "node:test";
import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const runnerPath = join(webRoot, "local-runner", "runner.py");

// Inline mirror of needsLocalRunner in
// web/src/app/editor/lib/local-runner.ts (no TS imports in tests).
const UNSUPPORTED_MODULES = ["tkinter", "turtle", "_tkinter"];
function needsLocalRunner(code) {
  for (const line of code.split("\n")) {
    const m = line.match(/^\s*(?:import\s+([\w.]+)|from\s+([\w.]+)\s+import)\b/);
    const mod = (m?.[1] ?? m?.[2] ?? "").split(".")[0];
    if (mod && UNSUPPORTED_MODULES.includes(mod)) return mod;
  }
  return null;
}

test("needsLocalRunner: tkinter / turtle imports need the PC", () => {
  assert.equal(needsLocalRunner("import tkinter as tk\n"), "tkinter");
  assert.equal(needsLocalRunner("from tkinter import Button\n"), "tkinter");
  assert.equal(needsLocalRunner("import turtle\n"), "turtle");
  assert.equal(needsLocalRunner("import tkinter.ttk\n"), "tkinter");
});

test("needsLocalRunner: plain code and mentions do not need the PC", () => {
  assert.equal(needsLocalRunner("print('hello')\n"), null);
  assert.equal(needsLocalRunner("# import tkinter\n"), null);
  assert.equal(needsLocalRunner('x = "import tkinter"\n'), null);
  assert.equal(needsLocalRunner("import os, sys\n"), null);
  assert.equal(needsLocalRunner("from math import sqrt\n"), null);
});

test("local-runner source: localhost-only, Origin allow-list, no new deps", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(runnerPath, "utf8");
  assert.match(src, /127\.0\.0\.1/);
  assert.doesNotMatch(src, /0\.0\.0\.0/);
  assert.match(src, /learnpythonprogram\.vercel\.app/);
  assert.match(src, /--self-test/);
  assert.doesNotMatch(src, /^import (requests|flask|fastapi)/m);
  // The site's CSP must let the editor fetch the loopback runner —
  // without this the browser blocks the call (CSP violation) and the
  // run silently reports "runner not running".
  const config = readFileSync(join(webRoot, "next.config.ts"), "utf8");
  assert.match(config, /connect-src[^"]*http:\/\/127\.0\.0\.1:8765/);
  assert.match(config, /connect-src[^"]*http:\/\/localhost:8765/);
});

const hasPython = (() => {
  try {
    return spawnSync("python3", ["--version"], { encoding: "utf8" }).status === 0;
  } catch {
    return false;
  }
})();

test("runner: ping + run + multi-file import + bad origin refused", { skip: !hasPython }, async () => {
  const port = 18765;
  const child = spawn("python3", [runnerPath, "--port", String(port)], { stdio: "ignore" });
  try {
    // Wait for /ping (up to 10s).
    let up = false;
    for (let i = 0; i < 50 && !up; i++) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/ping`);
        up = r.ok;
      } catch {
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    assert.ok(up, "runner did not come up");

    const ping = await (await fetch(`http://127.0.0.1:${port}/ping`)).json();
    assert.equal(ping.ok, true);

    // Multi-file run: main.py imports a workspace helper.
    const run = await (
      await fetch(`http://127.0.0.1:${port}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [
            { path: "main.py", content: "from helper import greet\nprint(greet())\n" },
            { path: "helper.py", content: "def greet():\n    return 'hello from pc'\n" },
          ],
          entry: "main.py",
        }),
      })
    ).json();
    assert.equal(run.exit_code, 0);
    assert.equal(run.timed_out, false);
    assert.equal(run.stdout.trim(), "hello from pc");

    // Failing run reports stderr + exit code.
    const fail = await (
      await fetch(`http://127.0.0.1:${port}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [{ path: "main.py", content: "raise ValueError('boom')\n" }],
          entry: "main.py",
        }),
      })
    ).json();
    assert.equal(fail.exit_code, 1);
    assert.match(fail.stderr, /ValueError: boom/);

    // A foreign website's preflight is refused.
    const pre = await fetch(`http://127.0.0.1:${port}/run`, {
      method: "OPTIONS",
      headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "POST" },
    });
    assert.equal(pre.status, 403);

    // The site's own origin is allowed through.
    const okPre = await fetch(`http://127.0.0.1:${port}/run`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://learnpythonprogram.vercel.app",
        "Access-Control-Request-Method": "POST",
      },
    });
    assert.equal(okPre.status, 204);
  } finally {
    child.kill();
  }
});

test("runner: --self-test passes", { skip: !hasPython }, async () => {
  const r = spawnSync("python3", [runnerPath, "--self-test"], { encoding: "utf8", timeout: 30000 });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /self-test OK/);
});
