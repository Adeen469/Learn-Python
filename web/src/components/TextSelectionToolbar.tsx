"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Languages,
  Loader2,
  Maximize2,
  Minimize2,
  Sparkles,
  X,
} from "lucide-react";
import { LANGUAGES, useLanguage } from "@/lib/i18n";

/**
 * Floating toolbar for text selected inside a lesson (/learn/[slug]).
 * Appears above the selection with three actions:
 *   - Ask to AI: opens a draggable, minimizable card with the AI's
 *     explanation of the selected text (via /api/ai, tutor mode).
 *     The card is dragged by its header and can be minimized to a
 *     slim bar (maximize restores it) or closed.
 *   - Translate: a dropdown of the 11 app languages; picking one
 *     replaces the selected text IN PLACE in the lesson with its
 *     translation (the translated text is tinted + dotted-underlined;
 *     clicking it restores the original text). The lesson content is
 *     React-rendered, so the replacement is a temporary DOM view —
 *     it disappears on a re-render/navigation, as expected.
 *   - Copy: copies the selected text to the clipboard.
 *
 * The selected text (and its Range) is captured into state when the
 * toolbar shows — clicking a toolbar button moves focus and can
 * collapse the live selection, so actions must not re-read
 * window.getSelection(). The toolbar only shows for selections
 * inside the lesson <article>, never inside inputs, the toolbar
 * itself, or the AI card.
 */

interface SelectionState {
  text: string;
  top: number;
  left: number;
}

interface AiResult {
  title: string;
  text: string;
  loading: boolean;
  error: string | null;
}

const TOOLBAR_HEIGHT = 44;
const CARD_WIDTH = 420;

function defaultCardPos(): { x: number; y: number } {
  return {
    x: Math.max(8, window.innerWidth - CARD_WIDTH - 24),
    y: Math.max(8, window.innerHeight - 260),
  };
}

export function TextSelectionToolbar({ lessonTitle }: { lessonTitle: string }) {
  const { t } = useLanguage();
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [resultCopied, setResultCopied] = useState(false);
  const [cardPos, setCardPos] = useState<{ x: number; y: number } | null>(null);
  const [cardMinimized, setCardMinimized] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const translateRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const askingRef = useRef(false);
  const selectionTextRef = useRef<string | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Read the current selection and, when it is real text inside the
  // lesson article, show the toolbar above it.
  function updateFromSelection() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setSelection(null);
      setTranslateOpen(false);
      selectionTextRef.current = null;
      return;
    }
    const text = sel.toString().trim();
    if (!text) {
      setSelection(null);
      setTranslateOpen(false);
      selectionTextRef.current = null;
      return;
    }
    const anchor = sel.anchorNode as Node | null;
    const anchorEl =
      anchor instanceof Element ? anchor : anchor?.parentElement ?? null;
    // Never trigger inside an input, the toolbar, or the AI card.
    if (
      !anchorEl ||
      anchorEl.closest("input, textarea, [contenteditable]") ||
      anchorEl.closest("[data-selection-toolbar], [data-selection-card]")
    ) {
      return;
    }
    // Only inside the lesson article.
    const article = anchorEl.closest("article");
    if (!article) {
      setSelection(null);
      setTranslateOpen(false);
      selectionTextRef.current = null;
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    // Above the selection; below it when there is no room above.
    const top =
      rect.top > TOOLBAR_HEIGHT + 16
        ? Math.max(8, rect.top - TOOLBAR_HEIGHT - 8)
        : rect.bottom + 8;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, 90),
      window.innerWidth - 90
    );
    // The mouseup that follows a click on the Translate button re-runs
    // this with the SAME selection — keep the dropdown open in that
    // case. Only a genuinely new selection closes it.
    const sameSelection = selectionTextRef.current === text;
    selectionTextRef.current = text;
    setSelection({ text, top, left });
    if (!sameSelection) setTranslateOpen(false);
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onMouseUp = () => {
      timer = setTimeout(updateFromSelection, 10);
    };
    const onSelectionChange = () => {
      // Keyboard selections (Shift+arrows) fire no mouseup.
      if (timer) clearTimeout(timer);
      timer = setTimeout(updateFromSelection, 120);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelection(null);
        setTranslateOpen(false);
        setResult(null);
      }
    };
    const onScroll = () => {
      // A stale floating position is worse than none.
      setSelection(null);
      setTranslateOpen(false);
    };
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        !target.closest("[data-selection-toolbar], [data-selection-card]")
      ) {
        setTranslateOpen(false);
      }
    };
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copySelection() {
    if (!selection) return;
    try {
      await navigator.clipboard.writeText(selection.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — the text is still selected to copy by hand.
    }
  }

  async function copyResult() {
    if (!result || result.loading || !result.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setResultCopied(true);
      window.setTimeout(() => setResultCopied(false), 1500);
    } catch {
      // Clipboard unavailable.
    }
  }

  function openCard(title: string) {
    // First open goes bottom-right; later opens keep the card where
    // the user left it.
    setCardPos((prev) => prev ?? defaultCardPos());
    setCardMinimized(false);
    setResult({ title, text: "", loading: true, error: null });
  }

  async function askAi(question: string, title: string) {
    if (askingRef.current) return;
    askingRef.current = true;
    setTranslateOpen(false);
    openCard(title);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "tutor", question }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (res.status === 401) {
        setResult({ title, text: "", loading: false, error: t.selectionToolbar.errorSessionExpired });
        return;
      }
      if (!res.ok || typeof data !== "object" || data === null) {
        setResult({ title, text: "", loading: false, error: t.selectionToolbar.errorGeneric });
        return;
      }
      const reply = (data as { reply?: unknown }).reply;
      if (typeof reply !== "string" || !reply.trim()) {
        setResult({ title, text: "", loading: false, error: t.selectionToolbar.errorGeneric });
        return;
      }
      setResult({ title, text: reply.trim(), loading: false, error: null });
    } catch {
      setResult({ title, text: "", loading: false, error: t.selectionToolbar.errorGeneric });
    } finally {
      askingRef.current = false;
    }
  }

  function askAboutSelection() {
    if (!selection) return;
    askAi(
      `Explain this text from the Python lesson "${lessonTitle}":\n\n${selection.text}`,
      t.selectionToolbar.aiAnswerTitle
    );
  }

  // Replace the selected text in place with its translation. The
  // translated span carries the original text and restores it on click.
  function replaceSelectionWithTranslation(translated: string, original: string) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0).cloneRange();
    const span = document.createElement("span");
    span.setAttribute("data-translated", "true");
    span.setAttribute("data-original", original);
    span.setAttribute("title", t.selectionToolbar.showOriginal);
    span.className =
      "cursor-pointer rounded bg-sky-500/15 px-0.5 underline decoration-dotted decoration-sky-400/70 underline-offset-2";
    span.textContent = translated;
    span.addEventListener("click", () => {
      const textNode = document.createTextNode(
        span.getAttribute("data-original") ?? span.textContent ?? ""
      );
      span.replaceWith(textNode);
    });
    range.deleteContents();
    range.insertNode(span);
    window.getSelection()?.removeAllRanges();
    setSelection(null);
    setTranslateOpen(false);
    selectionTextRef.current = null;
  }

  async function translateSelection(langCode: string, langLabel: string, langEnglishName: string) {
    if (!selection || translating) return;
    const original = selection.text;
    const title = t.selectionToolbar.translationTitle(langLabel);
    setTranslateOpen(false);
    setTranslating(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "tutor",
          question: `Translate this text to ${langEnglishName}. Reply with ONLY the translation, no extra explanation:\n\n${original}`,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (res.status === 401) {
        openCard(title);
        setResult({ title, text: "", loading: false, error: t.selectionToolbar.errorSessionExpired });
        return;
      }
      if (!res.ok || typeof data !== "object" || data === null) {
        openCard(title);
        setResult({ title, text: "", loading: false, error: t.selectionToolbar.errorGeneric });
        return;
      }
      const reply = (data as { reply?: unknown }).reply;
      if (typeof reply !== "string" || !reply.trim()) {
        openCard(title);
        setResult({ title, text: "", loading: false, error: t.selectionToolbar.errorGeneric });
        return;
      }
      replaceSelectionWithTranslation(reply.trim(), original);
    } catch {
      openCard(title);
      setResult({ title, text: "", loading: false, error: t.selectionToolbar.errorGeneric });
    } finally {
      setTranslating(false);
    }
  }

  // Drag the AI card by its header (not by its header buttons).
  function onCardHeaderPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("button")) return;
    const pos = cardPos ?? defaultCardPos();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const card = cardRef.current;
      const w = card?.offsetWidth ?? CARD_WIDTH;
      const h = card?.offsetHeight ?? 200;
      setCardPos({
        x: Math.min(Math.max(d.origX + (ev.clientX - d.startX), -w + 80), window.innerWidth - 80),
        y: Math.min(Math.max(d.origY + (ev.clientY - d.startY), 0), window.innerHeight - 48),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <>
      {selection && (
        <div
          ref={toolbarRef}
          data-selection-toolbar
          role="toolbar"
          aria-label={t.selectionToolbar.askAi}
          className="fixed z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-neutral-700 bg-neutral-950/95 p-1 shadow-xl shadow-black/60 backdrop-blur"
          style={{ top: selection.top, left: selection.left }}
        >
          <button
            type="button"
            onClick={askAboutSelection}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t.selectionToolbar.askAi}
          </button>
          <span className="h-4 w-px bg-neutral-800" aria-hidden="true" />
          <div ref={translateRef} className="relative">
            <button
              type="button"
              onClick={() => setTranslateOpen((v) => !v)}
              aria-expanded={translateOpen}
              disabled={translating}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
            >
              {translating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Languages className="h-3.5 w-3.5" />
              )}
              {translating ? t.selectionToolbar.translating : t.selectionToolbar.translate}
            </button>
            {translateOpen && (
              <div
                data-selection-toolbar
                className="absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950 shadow-xl shadow-black/60"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => translateSelection(lang.code, lang.label, lang.englishName)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-neutral-200 transition hover:bg-neutral-800 hover:text-white"
                  >
                    <span>{lang.label}</span>
                    <span className="text-[11px] text-neutral-500">{lang.englishName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="h-4 w-px bg-neutral-800" aria-hidden="true" />
          <button
            type="button"
            onClick={copySelection}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t.selectionToolbar.copied : t.selectionToolbar.copy}
          </button>
        </div>
      )}

      {result && cardPos && (
        <div
          ref={cardRef}
          data-selection-card
          role="dialog"
          aria-label={result.title}
          className="fixed z-50 flex max-h-[70vh] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl shadow-black/70"
          style={{ left: cardPos.x, top: cardPos.y }}
        >
          <div
            onPointerDown={onCardHeaderPointerDown}
            className="flex shrink-0 cursor-grab touch-none items-center gap-2 border-b border-neutral-800 px-4 py-3 active:cursor-grabbing"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-white">
              {result.title}
            </h3>
            <button
              type="button"
              onClick={() => setCardMinimized((v) => !v)}
              aria-label={cardMinimized ? t.selectionToolbar.maximize : t.selectionToolbar.minimize}
              className="rounded-lg border border-neutral-800 p-1.5 text-neutral-400 transition hover:border-neutral-600 hover:text-white"
            >
              {cardMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              aria-label={t.selectionToolbar.close}
              className="rounded-lg border border-neutral-800 p-1.5 text-neutral-400 transition hover:border-neutral-600 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {!cardMinimized && (
            <div className="overflow-y-auto p-4">
              {result.loading ? (
                <p className="flex items-center gap-2 text-sm text-neutral-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.selectionToolbar.thinking}
                </p>
              ) : result.error ? (
                <p className="text-sm leading-relaxed text-red-300">{result.error}</p>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
                    {result.text}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={copyResult}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition hover:border-neutral-600 hover:text-white"
                    >
                      {resultCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {resultCopied ? t.selectionToolbar.copied : t.selectionToolbar.copy}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
