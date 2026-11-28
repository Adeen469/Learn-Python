#!/usr/bin/env python3
"""Learn-Python local runner — runs editor code with the real Python on your PC.

The browser editor runs Python in Pyodide (WebAssembly), which cannot run
tkinter, turtle, or anything needing a real terminal or display. This tiny
script fixes that: it serves the editor's code to the Python already on
your PC, so `import tkinter` just works and windows open on your desktop.

Usage:
    python runner.py [--port 8765]

Then, in the editor, turn on "Run on my PC" and press Run.

Security — read this before running it:
- Binds 127.0.0.1 only: reachable from your own PC, never from your network.
- Answers only the Learn-Python site (Origin allow-list) plus clients
  with no Origin (curl). Any other website is refused with 403.
- It runs whatever code the editor sends, so only run it while you are
  using the editor, and stop it with Ctrl+C when you are done.

Stdlib only — no pip install, no dependencies.
"""
import argparse
import http.server
import json
import os
import subprocess
import sys
import tempfile
import threading

DEFAULT_PORT = 8765
# Runs are killed after this many seconds; the client may ask for less.
MAX_TIMEOUT = 300

# Origins allowed to call the runner. The site is one; localhost:3000 is
# local dev. Anything else (another website) gets 403 — a random site must
# not be able to run code on your PC. Requests with no Origin (curl, the
# self-test) are allowed.
ALLOWED_ORIGINS = {
    "https://learnpythonprogram.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
}


class RunnerHandler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *args):  # keep the terminal quiet
        pass

    def _origin_ok(self):
        origin = self.headers.get("Origin")
        return origin is None or origin in ALLOWED_ORIGINS

    def _send_json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        # CORS preflight from the site (cross-origin: site -> localhost).
        origin = self.headers.get("Origin")
        if origin not in ALLOWED_ORIGINS:
            self.send_response(403)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "content-type")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        if self.path != "/ping":
            self._send_json(404, {"error": "not found"})
            return
        if not self._origin_ok():
            self._send_json(403, {"error": "origin not allowed"})
            return
        self._send_json(200, {"ok": True, "python": sys.version.split()[0]})

    def do_POST(self):
        if self.path != "/run":
            self._send_json(404, {"error": "not found"})
            return
        if not self._origin_ok():
            self._send_json(403, {"error": "origin not allowed"})
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            req = json.loads(self.rfile.read(length) or b"{}")
            files = req.get("files") or []
            entry = str(req.get("entry") or "main.py")
            timeout = min(max(int(req.get("timeout") or 120), 1), MAX_TIMEOUT)
        except Exception:
            self._send_json(400, {"error": "bad request"})
            return
        if not files or not any(f.get("path") == entry for f in files):
            self._send_json(400, {"error": "entry file missing"})
            return
        result = run_files(files, entry, timeout)
        self._send_json(200, result)


def run_files(files, entry, timeout):
    """Write the workspace files to a temp dir and run entry with this Python.

    The subprocess inherits this process's session, so a tkinter window
    opens on the user's desktop. Runs are killed at `timeout` seconds.
    """
    with tempfile.TemporaryDirectory(prefix="lp-runner-") as tmp:
        for f in files:
            path = os.path.join(tmp, str(f.get("path", "")).lstrip("/"))
            os.makedirs(os.path.dirname(path) or tmp, exist_ok=True)
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(f.get("content") or "")
        try:
            proc = subprocess.run(
                [sys.executable, entry],
                cwd=tmp,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
            return {
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "exit_code": proc.returncode,
                "timed_out": False,
            }
        except subprocess.TimeoutExpired as e:
            return {
                "stdout": e.stdout.decode() if isinstance(e.stdout, bytes) else (e.stdout or ""),
                "stderr": e.stderr.decode() if isinstance(e.stderr, bytes) else (e.stderr or ""),
                "exit_code": 124,
                "timed_out": True,
            }


def serve(port):
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), RunnerHandler)
    print(f"Learn-Python local runner on http://127.0.0.1:{port} (Ctrl+C to stop)")
    print("In the editor, turn on 'Run on my PC' and press Run.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


def self_test():
    """One runnable check: boots the server on a scratch port and runs code."""
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), RunnerHandler)
    port = server.server_address[1]
    threading.Thread(target=server.serve_forever, daemon=True).start()
    import urllib.request

    def call(method, path, body=None, headers=None):
        req = urllib.request.Request(
            f"http://127.0.0.1:{port}{path}",
            data=json.dumps(body).encode() if body is not None else None,
            method=method,
            headers={"Content-Type": "application/json", **(headers or {})},
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                return r.status, json.loads(r.read() or b"{}")
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read() or b"{}")

    status, ping = call("GET", "/ping")
    assert status == 200 and ping["ok"], f"ping failed: {ping}"
    status, out = call("POST", "/run", {
        "files": [
            {"path": "main.py", "content": "from helper import greet\nprint(greet())\n"},
            {"path": "helper.py", "content": "def greet():\n    return 'hello from pc'\n"},
        ],
        "entry": "main.py",
    })
    assert status == 200 and out["stdout"].strip() == "hello from pc", f"run failed: {out}"
    assert out["exit_code"] == 0 and not out["timed_out"], out
    status, _ = call("OPTIONS", "/run", headers={"Origin": "https://evil.example"})
    assert status == 403, f"bad origin not refused: {status}"
    server.shutdown()
    print("self-test OK")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Learn-Python local runner")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    else:
        serve(args.port)
