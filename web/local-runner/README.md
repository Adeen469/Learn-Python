# Learn-Python local runner

The browser editor runs Python in Pyodide, which cannot run `tkinter`,
`turtle`, or anything needing a real terminal or display. This runner
fixes that: it runs your editor code with the real Python on your PC.

## Setup (once)

1. Install Python from https://www.python.org/downloads/ (tick
   "Add Python to PATH" during install).
2. Download this file:
   https://raw.githubusercontent.com/Adeen469/Learn-Python/main/web/local-runner/runner.py
3. Run it:
   ```
   python runner.py
   ```
   Leave that window open while you code. Stop it with Ctrl+C when done.

## Use

In the editor, turn on **Run on my PC** (top-right) and press Run. Your
code runs on your PC — `tkinter` windows open on your desktop, and the
output lands in the editor terminal. Turn it off to go back to the fast
browser Python.

## Notes

- Stdlib only: no pip install, no dependencies, no cost.
- The runner binds `127.0.0.1` only and answers only the Learn-Python
  site — no other website can use it. It runs whatever code the editor
  sends, so only run it while you are using the editor.
- Runs are capped at 5 minutes; close GUI windows to see their output.
- The full local terminal is a desktop-app feature — the desktop app is
  coming 12 Jan 2027. This runner is the way to get it now.
