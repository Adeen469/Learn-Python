"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { AppNavbar } from "@/components/AppNavbar";
import BranchedMenu, { type BranchedMenuItem } from "@/components/BranchedMenu";
import { EditorContextMenu, type ContextMenuItem } from "@/components/EditorContextMenu";
import { EditorMenuBar, type EditorMenu } from "@/components/EditorMenuBar";
import { EditorPanelHeader } from "@/components/EditorPanelHeader";
import { EditorSplitter } from "@/components/EditorSplitter";
import { ModulesPanel } from "@/components/ModulesPanel";
import { fetchSessionUser } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n";
import {
  THEME_CHANGED_EVENT,
  getStoredTheme,
} from "@/lib/theme";
import { restoreStoredPackages } from "@/lib/package-storage";
import { loadPyodideRuntime, withTimeout } from "@/lib/pyodide-install";
import {
  HighlightedMarkdown,
  HighlightedTerminal,
} from "@/lib/highlight";
import PromptBar, { type PromptBarModel } from "@/components/PromptBar";
import ThoughtLine from "@/components/ThoughtLine";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronRight,
  Code2,
  FileCode,
  Folder,
  FolderPlus,
  History,
  KeyRound,
  Loader2,
  MoreVertical,
  Package,
  Play,
  Plus,
  Save,
  Settings,
  Sparkles,
  Square,
  Terminal,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { BUILTIN_AI_SKILL_META } from "@/lib/ai-skills-meta.generated";

export interface WorkspaceItem {
  id: string;
  name: string;
  path: string; // e.g. "main.py" or "utils/math_helpers.py"
  type: "file" | "folder";
  content?: string;
  isSaved?: boolean;
}

const DEFAULT_WORKSPACE: WorkspaceItem[] = [
  {
    id: "f-root-main",
    name: "main.py",
    path: "main.py",
    type: "file",
    isSaved: true,
    content: `# Welcome to LP Python IDE
# Real Monaco Code Editor with syntax highlighting, auto-complete & minimap.
# Constraint: Save file before compiling/running!

import sys
import math
from utils.math_helpers import quadratic_roots

print("Python WebAssembly Engine:", sys.version.split()[0])

roots = quadratic_roots(1, -7, 12)
print("Roots of x^2 - 7x + 12 = 0 are:", roots)

for i in range(1, 6):
    print(f"Cube of {i} is {i**3}")
`,
  },
  {
    id: "folder-utils",
    name: "utils",
    path: "utils",
    type: "folder",
  },
  {
    id: "f-utils-init",
    name: "__init__.py",
    path: "utils/__init__.py",
    type: "file",
    isSaved: true,
    content: ``,
  },
  {
    id: "f-utils-math",
    name: "math_helpers.py",
    path: "utils/math_helpers.py",
    type: "file",
    isSaved: true,
    content: `import math

def quadratic_roots(a, b, c):
    disc = b**2 - 4*a*c
    if disc < 0:
        return None
    return ((-b + math.sqrt(disc)) / (2*a), (-b - math.sqrt(disc)) / (2*a))
`,
  },
];

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
  }
}

export default function CodeEditorPage() {
  const [editorTheme, setEditorTheme] = useState<"lp-dark" | "lp-light">(() =>
    typeof window === "undefined" || getStoredTheme() === "dark" ? "lp-dark" : "lp-light"
  );

  // Follow the theme toggle (Settings → Appearance) live.
  useEffect(() => {
    const sync = () => {
      setEditorTheme(getStoredTheme() === "light" ? "lp-light" : "lp-dark");
    };
    window.addEventListener(THEME_CHANGED_EVENT, sync);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, sync);
  }, []);
  const router = useRouter();
  const { t } = useLanguage();
  const [items, setItems] = useState<WorkspaceItem[]>(DEFAULT_WORKSPACE);
  const [activeFilePath, setActiveFilePath] = useState<string>("main.py");

  // Auth gate: guests see only the landing page (route /). Renders
  // nothing until the session check resolves — no app UI flash.
  const [enteredChecked, setEnteredChecked] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetchSessionUser().then((user) => {
      if (cancelled) return;
      if (!user) {
        router.replace("/");
        return;
      }
      setEnteredChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  // "Files | Modules" tabs — Modules lives INSIDE the editor now, not on a
  // separate page. /modules redirects here with ?tab=modules.
  const [editorTab, setEditorTab] = useState<"files" | "modules">("files");
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "modules") setEditorTab("modules");
  }, []);

  function switchTab(tab: "files" | "modules") {
    setEditorTab(tab);
    const url = tab === "modules" ? "/editor?tab=modules" : "/editor";
    window.history.replaceState(null, "", url);
  }
  const [output, setOutput] = useState<string>("Ready. Write or edit code, then 'Compile & Run'.\n");
  const [isRunning, setIsRunning] = useState(false);
  // Terminal command line: one command per Enter — `python <file>`,
  // `run`, `ls`, `clear`, `help`, or Python in the live runtime.
  // Disabled while a command or a file run is in flight — both
  // redirect sys.stdout, so they must not overlap.
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalBusy, setTerminalBusy] = useState(false);
  const [pyodideError, setPyodideError] = useState<string | null>(null);

  // AI panel chat (guide mode, POST /api/ai). A real AI assistant —
  // it answers anything, writes full code when asked, and fixes code
  // directly. Nothing is stored server-side: the current chat, past
  // chats, custom skills and the BYOK key live in this browser's
  // localStorage. Long files are truncated to the API's limit.
  type AiChatMessage = { role: "user" | "ai"; text: string };
  type AiChat = { id: string; title: string; createdAt: number; messages: AiChatMessage[] };
  type CustomAiSkill = { id: string; name: string; description: string; content: string };
  type AiByokProvider = "gemini" | "groq" | "anthropic" | "openai" | "openrouter" | "custom";
  type AiByok = { provider: AiByokProvider; key: string; baseUrl?: string; model?: string };
  type AiPanelView = "chat" | "history";
  /** Centre column view: the editor, or the AI Settings card in the
      editor's place (not movable — it replaces the editor until the
      user goes back). */
  type CentreView = "editor" | "ai-settings";

  function readLocalJson<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  function readStoredAiMessages(): AiChatMessage[] {
    const stored = readLocalJson<unknown>("lp_ai_current_chat", []);
    if (!Array.isArray(stored)) return [];
    return stored.filter(
      (m): m is AiChatMessage =>
        typeof m === "object" &&
        m !== null &&
        ((m as AiChatMessage).role === "user" || (m as AiChatMessage).role === "ai") &&
        typeof (m as AiChatMessage).text === "string"
    );
  }
  function newId(): string {
    try {
      return crypto.randomUUID();
    } catch {
      return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>(readStoredAiMessages);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiThoughtSeconds, setAiThoughtSeconds] = useState<number | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiAbortRef = useRef<AbortController | null>(null);

  // AI panel views: chat (default) and history — switched from the ⋮
  // menu in the panel header. Settings opens as a card in the centre
  // column instead (see centreView below).
  const [aiView, setAiView] = useState<AiPanelView>("chat");
  const [centreView, setCentreView] = useState<CentreView>("editor");
  // Drill-down inside the settings card: the card first shows a menu
  // (Skills / BYOK), tapping one opens that sub-page with a breadcrumb
  // ("AI Settings > Skills"), and the back arrow returns to the menu.
  const [settingsSection, setSettingsSection] = useState<"menu" | "skills" | "byok">("menu");
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [aiChats, setAiChats] = useState<AiChat[]>(() =>
    readLocalJson<AiChat[]>("lp_ai_chats", [])
  );
  const [customSkills, setCustomSkills] = useState<CustomAiSkill[]>(() =>
    readLocalJson<CustomAiSkill[]>("lp_ai_custom_skills", [])
  );
  const [activeSkillIds, setActiveSkillIds] = useState<string[]>(() =>
    readLocalJson<string[]>("lp_ai_active_skills", ["ponytail"])
  );
  const [byok, setByok] = useState<AiByok | null>(() =>
    readLocalJson<AiByok | null>("lp_ai_byok", null)
  );
  // Add-skill + BYOK form fields (settings view).
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDesc, setNewSkillDesc] = useState("");
  const [newSkillContent, setNewSkillContent] = useState("");
  const [byokProvider, setByokProvider] = useState<AiByokProvider>(
    () => readLocalJson<AiByok | null>("lp_ai_byok", null)?.provider ?? "gemini"
  );
  const [byokKey, setByokKey] = useState("");
  const [byokBaseUrl, setByokBaseUrl] = useState("");
  const [byokModel, setByokModel] = useState("");

  // Persist AI panel state to this browser only (never the server).
  useEffect(() => {
    try {
      localStorage.setItem("lp_ai_current_chat", JSON.stringify(aiMessages));
    } catch {
      // Storage full — skip, the chat still works in memory.
    }
  }, [aiMessages]);
  useEffect(() => {
    try {
      localStorage.setItem("lp_ai_chats", JSON.stringify(aiChats));
    } catch {
      // Storage full — skip.
    }
  }, [aiChats]);
  useEffect(() => {
    try {
      localStorage.setItem("lp_ai_custom_skills", JSON.stringify(customSkills));
    } catch {
      // Storage full — skip.
    }
  }, [customSkills]);
  useEffect(() => {
    try {
      localStorage.setItem("lp_ai_active_skills", JSON.stringify(activeSkillIds));
    } catch {
      // Storage full — skip.
    }
  }, [activeSkillIds]);
  useEffect(() => {
    try {
      if (byok) localStorage.setItem("lp_ai_byok", JSON.stringify(byok));
      else localStorage.removeItem("lp_ai_byok");
    } catch {
      // Storage full — skip.
    }
  }, [byok]);

  // Chat history: the current chat is saved into the list (title =
  // first user message) whenever the user starts a new chat, clears,
  // or opens a saved one — clearing never silently loses a chat.
  function saveCurrentChatToHistory() {
    if (aiMessages.length === 0) return;
    const firstUser = aiMessages.find((m) => m.role === "user");
    const title =
      (firstUser?.text ?? "Chat").replace(/\s+/g, " ").trim().slice(0, 60) || "Chat";
    const chat: AiChat = { id: newId(), title, createdAt: Date.now(), messages: aiMessages };
    setAiChats((prev) => [chat, ...prev].slice(0, 50));
  }
  function startNewChat() {
    stopAi();
    saveCurrentChatToHistory();
    setAiMessages([]);
    setAiError(null);
    setAiThoughtSeconds(null);
    setAiView("chat");
  }
  function loadAiChat(chat: AiChat) {
    stopAi();
    saveCurrentChatToHistory();
    setAiChats((prev) => prev.filter((c) => c.id !== chat.id));
    setAiMessages(chat.messages);
    setAiError(null);
    setAiThoughtSeconds(null);
    setAiView("chat");
  }
  function deleteAiChat(id: string) {
    setAiChats((prev) => prev.filter((c) => c.id !== id));
  }

  // Skills: toggle a built-in or custom skill on/off; add/delete
  // custom skills (a new custom skill starts active).
  function toggleSkill(id: string) {
    setActiveSkillIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }
  function addCustomSkill() {
    const name = newSkillName.trim();
    const content = newSkillContent.trim();
    if (!name || !content) return;
    const skill: CustomAiSkill = {
      id: `custom-${Date.now()}`,
      name: name.slice(0, 60),
      description: newSkillDesc.trim().slice(0, 200),
      content: content.slice(0, 8000),
    };
    setCustomSkills((prev) => [...prev, skill]);
    setActiveSkillIds((prev) => [...prev, skill.id]);
    setNewSkillName("");
    setNewSkillDesc("");
    setNewSkillContent("");
  }
  function deleteCustomSkill(id: string) {
    setCustomSkills((prev) => prev.filter((s) => s.id !== id));
    setActiveSkillIds((prev) => prev.filter((s) => s !== id));
  }

  // BYOK: the key lives in this browser only and is sent with each
  // /api/ai request; the server uses it in-memory and never stores it.
  // Custom also needs its base URL + model id.
  function saveByok() {
    const key = byokKey.trim();
    if (key.length < 10) return;
    if (byokProvider === "custom") {
      const baseUrl = byokBaseUrl.trim();
      const model = byokModel.trim();
      if (!baseUrl.startsWith("https://") || model.length === 0) return;
      setByok({ provider: byokProvider, key, baseUrl, model });
    } else {
      setByok({ provider: byokProvider, key });
    }
    setByokKey("");
    setByokBaseUrl("");
    setByokModel("");
  }
  function removeByok() {
    setByok(null);
  }

  // BYOK provider display names (brand names — same in every language).
  const BYOK_PROVIDER_NAMES: Record<AiByokProvider, string> = {
    gemini: "Gemini",
    groq: "Groq",
    anthropic: "Anthropic",
    openai: "OpenAI",
    openrouter: "OpenRouter",
    custom: "Custom",
  };

  // PromptBar models: every model the API accepts. The picker shows
  // the display name + tag. A saved custom provider adds its own
  // model to the list.
  const AI_PANEL_MODELS: PromptBarModel[] = [
    { key: "gemini-3.8-flash", name: "Gemini 3.8 Flash", tag: "Flagship" },
    { key: "gemini-3.6-flash", name: "Gemini 3.6 Flash", tag: "Fast" },
    { key: "gemini-3.5-flash", name: "Gemini 3.5 Flash", tag: "Fast" },
    { key: "gemini-2.5-pro", name: "Gemini 2.5 Pro", tag: "Pro" },
    { key: "gemini-2.5-flash", name: "Gemini 2.5 Flash", tag: "Fast" },
    { key: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", tag: "Fastest" },
    { key: "gemini-2.0-flash", name: "Gemini 2.0 Flash", tag: "Fast" },
    { key: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash-Lite", tag: "Fastest" },
    { key: "openai/gpt-oss-120b", name: "GPT-OSS 120B", tag: "Groq" },
    { key: "openai/gpt-oss-20b", name: "GPT-OSS 20B", tag: "Groq Fast" },
    { key: "qwen/qwen3.6-27b", name: "Qwen 3.6 27B", tag: "Groq" },
    { key: "qwen/qwen3.8-27b", name: "Qwen 3.8 27B", tag: "Groq" },
    { key: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", tag: "Anthropic" },
    { key: "claude-opus-5-5", name: "Claude Opus 5.5", tag: "Anthropic" },
    { key: "claude-haiku-5-5", name: "Claude Haiku 5.5", tag: "Anthropic Fast" },
    { key: "gpt-5.5", name: "GPT-5.5", tag: "OpenAI" },
    { key: "gpt-5.4-mini", name: "GPT-5.4 Mini", tag: "OpenAI Fast" },
    { key: "gpt-4o", name: "GPT-4o", tag: "OpenAI" },
    { key: "gpt-4o-mini", name: "GPT-4o Mini", tag: "OpenAI Fast" },
    { key: "openai/gpt-5.5", name: "GPT-5.5", tag: "OpenRouter" },
    { key: "anthropic/claude-sonnet-5-5", name: "Claude Sonnet 5.5", tag: "OpenRouter" },
    { key: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", tag: "OpenRouter" },
    { key: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", tag: "OpenRouter" },
    ...(byok?.provider === "custom" && byok.model
      ? [{ key: byok.model, name: byok.model, tag: "Custom" }]
      : []),
  ];

  async function sendAiMessage(
    text: string,
    opts: { model: PromptBarModel | undefined; effort: string },
  ) {
    const raw = text.trim();
    if (!raw || aiThinking) return;
    // Slash commands from the PromptBar: /explain, /debug, /hint.
    // The rest of the line is the question; with nothing after the
    // command the default question for that command is used.
    let question = raw;
    if (raw.startsWith("/explain")) {
      question =
        raw.slice("/explain".length).trim() ||
        "Explain this code to me, step by step.";
    } else if (raw.startsWith("/debug")) {
      question =
        raw.slice("/debug".length).trim() ||
        "Find the bug in this code, explain why it breaks, and show me the fixed code.";
    } else if (raw.startsWith("/hint")) {
      question =
        raw.slice("/hint".length).trim() ||
        "Give me a hint for the next step — explain the idea, don't write the code.";
    }
    const code = activeFile?.content ?? "";
    const truncated = code.length > 8000;
    const history = aiMessages.slice(-8).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      text: m.text,
    }));
    setAiMessages((prev) => [...prev, { role: "user", text: raw }]);
    setAiError(null);
    setAiThoughtSeconds(null);
    setAiThinking(true);
    const controller = new AbortController();
    aiAbortRef.current = controller;
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "guide",
          question,
          code: truncated ? code.slice(0, 8000) : code,
          history,
          model: opts.model?.key ?? "gemini-3.8-flash",
          effort: opts.effort,
          // Active skills: built-in ids resolve server-side; custom
          // skills ride along as name + instructions. BYOK (if the
          // user saved one) is used in-memory for this request only.
          skillIds: activeSkillIds,
          skills: customSkills
            .filter((s) => activeSkillIds.includes(s.id))
            .map((s) => ({ name: s.name, content: s.content })),
          ...(byok ? { byok } : {}),
        }),
        signal: controller.signal,
      });
      const data: unknown = await res.json().catch(() => null);
      if (res.status === 503) {
        // Show the server's own reason (no keys vs. every provider
        // failed) — the old message blamed the keys for every 503,
        // even when keys were configured and the calls just failed.
        const serverError =
          typeof data === "object" && data !== null && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : null;
        setAiError(serverError ?? t.editorPage.aiUnavailableMessage);
        return;
      }
      if (res.status === 401) {
        setAiError(t.tutor.errorSessionExpired);
        return;
      }
      if (!res.ok || typeof data !== "object" || data === null) {
        setAiError(t.common.genericError);
        return;
      }
      const reply = (data as { reply?: unknown }).reply;
      if (typeof reply !== "string" || !reply.trim()) {
        setAiError(t.editorPage.aiEmptyReplyError);
        return;
      }
      setAiMessages((prev) => [...prev, { role: "ai", text: reply.trim() }]);
    } catch {
      if (controller.signal.aborted) return;
      setAiError(t.tutor.errorGeneric);
    } finally {
      setAiThinking(false);
      aiAbortRef.current = null;
    }
  }

  function stopAi() {
    aiAbortRef.current?.abort();
  }

  function clearAiChat() {
    stopAi();
    // Save the chat into history first — clearing never loses it.
    saveCurrentChatToHistory();
    setAiMessages([]);
    setAiError(null);
    setAiThoughtSeconds(null);
  }

  const [needsSaveWarning, setNeedsSaveWarning] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ utils: true });

  // Creation dialogs
  const [newFileInput, setNewFileInput] = useState("");
  const [newFolderInput, setNewFolderInput] = useState("");
  const [showNewFile, setShowNewFile] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);

  // Drag and drop states
  const [draggedItemPath, setDraggedItemPath] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [isExternalDragOver, setIsExternalDragOver] = useState(false);

  // --- VS Code-style redesign: menu bar, context menus, auto-save,
  // Format, resizable panels (wabepp: web-only actions here; anything
  // needing the OS lives in the native APK / Tauri EXE, not the site).
  // Auto Save: on by default, persisted; an edit auto-saves after a
  // short debounce instead of waiting for the Save button.
  const [autoSave, setAutoSave] = useState<boolean>(() =>
    typeof window === "undefined" ||
    window.localStorage.getItem("lp_editor_autosave") !== "off"
  );
  // Right-click / long-press context menu: position + target.
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    target: { kind: "file" | "folder" | "root"; path: string };
  } | null>(null);
  // Inline rename: the item being renamed + its input value.
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");
  // Resizable panels (Explorer left, Terminal bottom): widths in px,
  // persisted; drag a splitter to resize, double-click to reset.
  const [explorerWidth, setExplorerWidth] = useState<number>(() => {
    if (typeof window === "undefined") return 280;
    const v = Number(window.localStorage.getItem("lp_editor_explorer_w"));
    return Number.isFinite(v) && v >= 200 && v <= 480 ? v : 280;
  });
  const [terminalWidth, setTerminalWidth] = useState<number>(() => {
    if (typeof window === "undefined") return 320;
    const v = Number(window.localStorage.getItem("lp_editor_terminal_w"));
    return Number.isFinite(v) && v >= 240 && v <= 560 ? v : 320;
  });
  const [showExplorer, setShowExplorer] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  // AI panel (the new AI button toggles it). Visible by default so
  // the user sees the assistant right away.
  const [showAi, setShowAi] = useState(true);

  // Draggable panels (VS Code-style docking): each side panel lives
  // in a zone — left, right, or bottom. Drag a panel by its header
  // and drop it on a zone to move it there. Persisted, so a reload
  // keeps the layout. The Editor (Monaco) is the centre and never
  // moves; ModulesPanel takes the centre when the Modules tab is on.
  type PanelZone = "left" | "right" | "bottom";
  type PanelId = "explorer" | "terminal" | "ai";
  const [panelZones, setPanelZones] = useState<Record<PanelId, PanelZone>>(() => {
    const fallback: Record<PanelId, PanelZone> = { explorer: "left", terminal: "bottom", ai: "right" };
    if (typeof window === "undefined") return fallback;
    try {
      const saved = JSON.parse(localStorage.getItem("lp_editor_panel_zones") || "null") as unknown;
      if (!saved || typeof saved !== "object") return fallback;
      const z = { ...fallback };
      for (const id of ["explorer", "terminal", "ai"] as PanelId[]) {
        const v = (saved as Record<string, unknown>)[id];
        if (v === "left" || v === "right" || v === "bottom") z[id] = v;
      }
      // AI is a side panel only — a saved bottom zone for it is reset.
      if (z.ai === "bottom") z.ai = "right";
      return z;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    localStorage.setItem("lp_editor_panel_zones", JSON.stringify(panelZones));
  }, [panelZones]);
  // Which panel is being dragged + which zone the pointer is over.
  const [draggingPanel, setDraggingPanel] = useState<PanelId | null>(null);
  const [dropZone, setDropZone] = useState<PanelZone | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  // Bottom zone height (px), persisted; resized by the horizontal
  // splitter above it. Default 150: on a laptop-height screen the
  // editor is only ~300px tall under a 220px terminal (about 13
  // lines), so the terminal takes less room and the editor shows
  // ~19 lines instead.
  const [bottomHeight, setBottomHeight] = useState<number>(() => {
    if (typeof window === "undefined") return 150;
    const v = Number(window.localStorage.getItem("lp_editor_bottom_h"));
    // 220 was the old default: a saved 220 means the user never
    // dragged the splitter, so take the new default instead.
    if (v === 220) return 150;
    return Number.isFinite(v) && v >= 120 && v <= 480 ? v : 150;
  });
  useEffect(() => {
    localStorage.setItem("lp_editor_bottom_h", String(bottomHeight));
  }, [bottomHeight]);

  // Re-measure Monaco whenever the dock geometry moves (terminal
  // open/close, drag-resize, panel moves). automaticLayout usually
  // catches a resize, but a stale layout would clip the bottom
  // lines of the file — so force a layout pass here as well.
  useEffect(() => {
    editorRef.current?.layout();
  }, [bottomHeight, panelZones, showExplorer, showTerminal, showAi]);

  function isPanelVisible(id: PanelId): boolean {
    return id === "explorer" ? showExplorer : id === "terminal" ? showTerminal : showAi;
  }
  function setPanelVisible(id: PanelId, v: boolean) {
    if (id === "explorer") setShowExplorer(v);
    else if (id === "terminal") setShowTerminal(v);
    else setShowAi(v);
  }
  function movePanelToZone(id: PanelId, zone: PanelZone) {
    // AI is a side panel only — it never docks at the bottom.
    if (id === "ai" && zone === "bottom") return;
    setPanelZones((p) => ({ ...p, [id]: zone }));
  }
  // Monaco editor instance (Undo / Redo / Find + cursor position for
  // the status bar) and the >>> terminal input (Focus Terminal).
  const editorRef = useRef<any>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const terminalInputRef = useRef<HTMLInputElement | null>(null);
  // Format (black via micropip): installed once per session, then
  // reused; formatting is the in-progress flag for the button/menu.
  const blackReadyRef = useRef(false);
  const [formatting, setFormatting] = useState(false);

  const pyodideRef = useRef<any>(null);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState(false);
  // Live load status: which step the runtime load is on ("Downloading
  // runtime from jsDelivr…") and how many seconds it has been going.
  // The old bare "Loading Engine" spinner read as frozen on slow
  // connections — this line proves the download is alive.
  const [engineStage, setEngineStage] = useState<string | null>(null);
  const [engineElapsed, setEngineElapsed] = useState(0);
  // Single-flight init: without this, two callers (the <Script> onLoad
  // and an Install click) could start two Pyodide loads at once, and a
  // click before the script finished just gave up with "not ready".
  const pyodideInitPromiseRef = useRef<Promise<any> | null>(null);
  // Generation of the in-flight runtime load: Cancel (or a fresh
  // retry) bumps it, so a stale load finishing late cannot flip the
  // loading state or mark its runtime ready after the user moved on.
  const loadGenerationRef = useRef(0);
  // Stage listeners for the in-flight init: the Modules tab registers
  // one when the user clicks Install, so the progress bar can show
  // WHICH CDN is being tried and how far the load got — the old
  // frozen "Starting Python runtime…" at 10% told the user nothing.
  const initStageListenersRef = useRef<Set<(stage: string) => void>>(
    new Set()
  );
  // SIGINT buffer for the Stop button. Only works when SharedArrayBuffer
  // is available (needs cross-origin isolation); otherwise Stop stays
  // disabled and the UI says so instead of pretending to stop the run.
  const interruptBufferRef = useRef<Uint8Array | null>(null);

  const activeFile =
    items.find((it) => it.type === "file" && it.path === activeFilePath) ||
    items.find((it) => it.type === "file");

  // Open tabs in the bottom bar (VS Code-style): one per file the user
  // opened, plus AI Settings while it is open. A single effect keeps
  // the list in sync — every place that activates a file (tree, new
  // file, try-it, terminal, rename, delete) flows through
  // activeFile/items, so no call site needs to touch the tabs.
  const [openFilePaths, setOpenFilePaths] = useState<string[]>(["main.py"]);
  const [settingsTabOpen, setSettingsTabOpen] = useState(false);
  useEffect(() => {
    setOpenFilePaths((prev) => {
      const live = prev.filter((p) => items.some((it) => it.type === "file" && it.path === p));
      const next =
        !activeFile || live.includes(activeFile.path) ? live : [...live, activeFile.path];
      return next.length === prev.length && next.every((p, i) => p === prev[i]) ? prev : next;
    });
  }, [activeFile?.path, items]);

  // Close a file tab. The last file tab cannot close — the editor
  // always keeps one file open (same rule as Delete).
  function closeFileTab(path: string) {
    if (openFilePaths.length <= 1) return;
    const idx = openFilePaths.indexOf(path);
    const next = openFilePaths.filter((p) => p !== path);
    if (activeFilePath === path) setActiveFilePath(openFilePaths[idx - 1] ?? next[0]);
    setOpenFilePaths(next);
  }

  // Elapsed-seconds ticker while the runtime loads: the number ticking
  // up proves the load is alive (downloading, not frozen).
  useEffect(() => {
    if (!loadingEngine) return;
    const timer = window.setInterval(
      () => setEngineElapsed((s) => s + 1),
      1000
    );
    return () => window.clearInterval(timer);
  }, [loadingEngine]);

  async function initPyodide(onStage?: (stage: string) => void) {
    if (pyodideRef.current) return pyodideRef.current;
    // A caller joining the in-flight init still gets later stages.
    // Guard the type: next/script calls onLoad with the DOM load
    // Event as its first argument, so passing initPyodide straight
    // to the Script's onLoad used to register that Event as a
    // "stage listener" — and the first emitStage() then called the
    // Event as a function, killing the whole runtime load with
    // "t is not a function" before the download even started.
    // Only real functions may join.
    if (onStage && typeof onStage === "function") {
      initStageListenersRef.current.add(onStage);
    }
    if (pyodideInitPromiseRef.current) {
      try {
        return await pyodideInitPromiseRef.current;
      } catch {
        // The shared init failed: a joiner must get null (not a
        // throw), or its install crashes mid-flow and leaves its
        // button stuck on "Installing…" with a frozen bar forever —
        // exactly what happened to scikit-image on 2026-11-16, when
        // the 12:10 init failed and the joining install never
        // cleaned up.
        return null;
      } finally {
        if (onStage) initStageListenersRef.current.delete(onStage);
      }
    }
    const emitStage = (stage: string) => {
      // The status line reads engineStage directly, so it must update
      // even when the load was started by a caller that passed no
      // listener (e.g. Compile & Run calls initPyodide() bare, before
      // the <Script> onLoad ever registers one) — otherwise the line
      // falls back to the bare "Loading Engine" and a slow download
      // reads as frozen. That is exactly what the user's 433s
      // screenshot showed: the runtime was mid-download on unpkg,
      // but the line said only "Loading Engine".
      setEngineStage(stage);
      initStageListenersRef.current.forEach((fn) => fn(stage));
    };
    // This attempt's generation: a Cancel (or a fresh retry) bumps
    // loadGenerationRef, so only the latest attempt may flip state.
    const gen = ++loadGenerationRef.current;
    const promise = (async () => {
      // Load the runtime with CDN fallback (jsDelivr, then unpkg):
      // the jsDelivr download alone used to stall for minutes on
      // some networks and hang the whole install. loadPyodideRuntime
      // gives each CDN 5 minutes and tries the next one on a stall.
      setLoadingEngine(true);
      setEngineElapsed(0);
      setEngineStage(null);
      const pyodide = await loadPyodideRuntime(emitStage);
      // A cancelled/stale attempt must not mark its runtime ready
      // after the user moved on (or a fresh retry started).
      if (gen !== loadGenerationRef.current) return null;
      // Stop button support, when the browser allows SharedArrayBuffer.
      try {
        if (typeof SharedArrayBuffer !== "undefined") {
          const buf = new Uint8Array(new SharedArrayBuffer(1));
          pyodide.setInterruptBuffer(buf);
          interruptBufferRef.current = buf;
        }
      } catch {}
      // micropip's wheel download has no timeout either — cap it.
      emitStage(t.modulesPage.stageLoadingMicropip);
      await withTimeout(
        pyodide.loadPackage("micropip"),
        60_000,
        t.editorPage.micropipTimeoutError
      );
      pyodideRef.current = pyodide;
      setPyodideReady(true);
      setPyodideError(null);
      emitStage(t.modulesPage.stageRuntimeReady);
      setOutput((prev) => prev + "✓ Python runtime (Pyodide 0.27.2) loaded successfully.\n");

      // Saved packages are restored in the BACKGROUND, not awaited
      // here: a stalled wheel re-download used to block init itself,
      // so the runtime never became ready and every Install click
      // waited on the same stuck promise (the "Installing…" that
      // never ends). Each package is capped at 90s inside
      // restoreStoredPackages and never blocks init.
      restoreStoredPackages(pyodide, (pkg, status, error) => {
        if (status === "loading") setOutput((prev) => prev + `[Loading installed package '${pkg}'...]\n`);
        if (status === "done") setOutput((prev) => prev + `[Package '${pkg}' ready]\n`);
        if (status === "error") setOutput((prev) => prev + `[Failed loading '${pkg}': ${error}]\n`);
      }).catch(() => {});
      return pyodide;
    })();
    pyodideInitPromiseRef.current = promise;
    try {
      return await promise;
    } catch (err: unknown) {
      // Let the next attempt retry instead of caching the failure.
      pyodideInitPromiseRef.current = null;
      const msg = err instanceof Error ? err.message : String(err);
      setPyodideError(msg);
      setOutput((prev) => prev + `✗ Failed to load runtime: ${msg}\n`);
      return null;
    } finally {
      if (onStage) initStageListenersRef.current.delete(onStage);
      // Only the latest attempt may clear the loading state: a stale
      // attempt finishing late must not hide a fresh retry's spinner.
      if (gen === loadGenerationRef.current) {
        setLoadingEngine(false);
        setEngineStage(null);
      }
    }
  }

  // Stop waiting on a stalled runtime download: invalidate the
  // in-flight attempt (its late finish is ignored by the generation
  // guard) and clear the loading state, so Run / retry can start a
  // fresh load instead of staring at the spinner for up to 10 min.
  function cancelEngineLoad() {
    loadGenerationRef.current++;
    pyodideInitPromiseRef.current = null;
    setLoadingEngine(false);
    setEngineStage(null);
    setEngineElapsed(0);
  }

  // Shared by the Modules tab: loads the runtime if needed, true when ready.
  // `onStage` gets each init step (which CDN is being tried, timeouts,
  // success) so the Modules progress bar shows real progress.
  async function ensurePyodideReady(
    onStage?: (stage: string) => void
  ): Promise<boolean> {
    const py = await initPyodide(onStage);
    return !!py;
  }

  function stopRunning() {
    const buf = interruptBufferRef.current;
    if (buf) {
      buf[0] = 2; // SIGINT — interrupts the running Python code.
      setOutput((prev) => prev + "[Stop requested — interrupting the running code…]\n");
    }
  }

  // Load from localStorage, plus the "Try it" handoff: a lesson code
  // block stores its snippet in sessionStorage (lp_try_it_code) and
  // links here — open it as try-it.py so the user's workspace files
  // are untouched and the snippet is the active file.
  useEffect(() => {
    const saved = localStorage.getItem("lp_workspace_tree");
    let base = DEFAULT_WORKSPACE;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) base = parsed;
      } catch {}
    }
    let tryCode: string | null = null;
    try {
      tryCode = sessionStorage.getItem("lp_try_it_code");
      if (tryCode !== null) sessionStorage.removeItem("lp_try_it_code");
    } catch {}
    if (tryCode !== null) {
      const tryFile: WorkspaceItem = {
        id: "f-try-it",
        name: "try-it.py",
        path: "try-it.py",
        type: "file",
        content: tryCode,
        isSaved: false,
      };
      setItems([tryFile, ...base.filter((p: WorkspaceItem) => p.path !== "try-it.py")]);
      setActiveFilePath("try-it.py");
      return;
    }
    if (saved) {
      setItems(base);
      const firstFile = base.find((p: WorkspaceItem) => p.type === "file");
      if (firstFile) setActiveFilePath(firstFile.path);
    }
  }, []);

  function handleEditorChange(value: string | undefined) {
    if (!activeFile) return;
    setNeedsSaveWarning(null);
    setItems((prev) =>
      prev.map((it) =>
        it.path === activeFile.path ? { ...it, content: value ?? "", isSaved: false } : it
      )
    );
  }

  // Persist the workspace: state + localStorage + the Pyodide virtual
  // filesystem, in one place, so every mutation (save, rename, delete,
  // duplicate, move, create) keeps all three in sync.
  function persistWorkspace(next: WorkspaceItem[]) {
    setItems(next);
    localStorage.setItem("lp_workspace_tree", JSON.stringify(next));
    syncAllFilesToPyodide(next);
  }

  function saveCurrentFile() {
    if (!activeFile) return;
    const updated = items.map((it) =>
      it.path === activeFile.path ? { ...it, isSaved: true } : it
    );
    persistWorkspace(updated);
    setNeedsSaveWarning(null);
    setOutput((prev) => prev + `[Saved '${activeFile.path}']\n`);
  }

  // Silent save (used by Auto Save): no terminal spam — the status bar
  // and the file's saved-dot already show that it saved.
  function saveFileSilently(path: string) {
    const updated = items.map((it) =>
      it.path === path ? { ...it, isSaved: true } : it
    );
    persistWorkspace(updated);
  }

  function saveAllFiles() {
    const updated = items.map((it) =>
      it.type === "file" && !it.isSaved ? { ...it, isSaved: true } : it
    );
    persistWorkspace(updated);
    setNeedsSaveWarning(null);
  }

  // Auto Save: when the active file is edited and Auto Save is on,
  // save it after a short debounce. The timer resets on every
  // keystroke, so a burst of typing saves once, after the pause.
  useEffect(() => {
    if (!autoSave || !activeFile || activeFile.isSaved) return;
    const timer = window.setTimeout(() => {
      saveFileSilently(activeFile.path);
    }, 1200);
    return () => window.clearTimeout(timer);
    // Re-run when the content or the save state changes; the active
    // path is what gets saved, so it is a dependency too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave, activeFile?.path, activeFile?.content, activeFile?.isSaved]);

  // Persist the resizable panel widths so a reload keeps the layout.
  useEffect(() => {
    localStorage.setItem("lp_editor_explorer_w", String(explorerWidth));
  }, [explorerWidth]);
  useEffect(() => {
    localStorage.setItem("lp_editor_terminal_w", String(terminalWidth));
  }, [terminalWidth]);

  // --- Format (black, via micropip, on demand) ---
  // black is a pure-Python package, so it installs through the same
  // micropip path the Modules tab already uses. It installs once per
  // session (blackReadyRef), then formats in-process — no network on
  // later formats. A failed install leaves a clear terminal message
  // instead of silently doing nothing.
  async function formatCurrentFile() {
    if (!activeFile || formatting) return;
    if (!pyodideReady || !pyodideRef.current) {
      setOutput((prev) => prev + `${t.editorPage.formatNotReady}\n`);
      return;
    }
    setFormatting(true);
    try {
      const py = pyodideRef.current;
      if (!blackReadyRef.current) {
        setOutput((prev) => prev + "Installing formatter (black)…\n");
        const micropip = py.pyimport("micropip");
        await micropip.install("black");
        blackReadyRef.current = true;
      }
      const code = activeFile.content ?? "";
      py.globals.set("__lp_format_code", code);
      const formatted = py.runPython(
        `import black\nblack.format_str(__lp_format_code, mode=black.Mode())`
      ) as string;
      if (typeof formatted === "string" && formatted !== code) {
        setItems((prev) =>
          prev.map((it) =>
            it.path === activeFile.path
              ? { ...it, content: formatted, isSaved: false }
              : it
          )
        );
        setOutput((prev) => prev + `[Formatted '${activeFile.path}']\n`);
      } else {
        setOutput((prev) => prev + `[Already formatted '${activeFile.path}']\n`);
      }
    } catch (e) {
      console.warn("Format failed:", e);
      setOutput((prev) => prev + `${t.editorPage.formatFailed}\n`);
    } finally {
      setFormatting(false);
    }
  }

  // --- Rename / Delete / Duplicate / Copy Path (context menu + File menu) ---
  function startRename(path: string) {
    const item = items.find((i) => i.path === path);
    if (!item) return;
    setRenamingPath(path);
    setRenameInput(item.name);
  }

  function submitRename(e: React.FormEvent) {
    e.preventDefault();
    if (!renamingPath) return;
    const item = items.find((i) => i.path === renamingPath);
    if (!item) {
      setRenamingPath(null);
      return;
    }
    const clean = renameInput.trim();
    if (!clean || clean === item.name) {
      setRenamingPath(null);
      return;
    }
    // A file keeps its extension if the user typed a bare name.
    const newName =
      item.type === "file" && !clean.includes(".")
        ? `${clean}.py`
        : clean;
    const parent = renamingPath.includes("/")
      ? renamingPath.slice(0, renamingPath.lastIndexOf("/"))
      : "";
    const newPath = parent ? `${parent}/${newName}` : newName;
    if (newPath !== renamingPath && items.some((i) => i.path === newPath)) {
      alert(t.editorPage.fileExistsError);
      return;
    }
    const updated = items.map((it) => {
      if (it.path === renamingPath) {
        return { ...it, name: newName, path: newPath, isSaved: false };
      }
      if (item.type === "folder" && it.path.startsWith(renamingPath + "/")) {
        const rel = it.path.slice(renamingPath.length + 1);
        return { ...it, path: `${newPath}/${rel}`, isSaved: false };
      }
      return it;
    });
    persistWorkspace(updated);
    if (activeFilePath === renamingPath) setActiveFilePath(newPath);
    // Keep the bottom tabs in sync with the rename (a file, or every
    // file under a renamed folder).
    setOpenFilePaths((prev) =>
      prev.map((p) =>
        p === renamingPath
          ? newPath
          : p.startsWith(renamingPath + "/")
            ? `${newPath}${p.slice(renamingPath.length)}`
            : p
      )
    );
    if (item.type === "folder") {
      setExpandedFolders((p) => {
        const next = { ...p };
        delete next[renamingPath];
        next[newPath] = true;
        return next;
      });
    }
    setRenamingPath(null);
    setOutput((prev) => prev + `[Renamed '${renamingPath}' → '${newPath}']\n`);
  }

  function deleteItem(path: string) {
    const item = items.find((i) => i.path === path);
    if (!item) return;
    const remaining = items.filter(
      (it) => it.path !== path && !it.path.startsWith(path + "/")
    );
    if (!remaining.some((it) => it.type === "file")) {
      alert(t.editorPage.keepOneFileError);
      return;
    }
    persistWorkspace(remaining);
    if (activeFilePath === path || activeFilePath.startsWith(path + "/")) {
      const first = remaining.find((it) => it.type === "file");
      if (first) setActiveFilePath(first.path);
    }
    setOutput((prev) => prev + `[Deleted '${path}']\n`);
  }

  // "Copy" in the context menu = Duplicate: a copy of the file (or the
  // folder with its files) beside the original, opened right away.
  function duplicateItem(path: string) {
    const item = items.find((i) => i.path === path);
    if (!item) return;
    const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
    const stem =
      item.type === "file"
        ? item.name.replace(/\.py$/, "")
        : item.name;
    const ext = item.type === "file" && item.name.endsWith(".py") ? ".py" : "";
    let n = 1;
    let newName = `${stem} copy${ext}`;
    let newPath = parent ? `${parent}/${newName}` : newName;
    while (items.some((i) => i.path === newPath)) {
      n += 1;
      newName = `${stem} copy ${n}${ext}`;
      newPath = parent ? `${parent}/${newName}` : newName;
    }
    const copies: WorkspaceItem[] = [];
    if (item.type === "file") {
      copies.push({
        id: "f-dup-" + Date.now(),
        name: newName,
        path: newPath,
        type: "file",
        isSaved: true,
        content: item.content ?? "",
      });
    } else {
      copies.push({
        id: "folder-dup-" + Date.now(),
        name: newName,
        path: newPath,
        type: "folder",
      });
      for (const child of items.filter(
        (it) => it.type === "file" && it.path.startsWith(path + "/")
      )) {
        const rel = child.path.slice(path.length + 1);
        copies.push({
          id: "f-dup-" + Date.now() + "-" + rel,
          name: child.name,
          path: `${newPath}/${rel}`,
          type: "file",
          isSaved: true,
          content: child.content ?? "",
        });
      }
    }
    const next = [...items, ...copies];
    persistWorkspace(next);
    if (item.type === "file") setActiveFilePath(newPath);
    setOutput((prev) => prev + `[Copied '${path}' → '${newPath}']\n`);
  }

  async function copyPath(path: string) {
    try {
      await navigator.clipboard.writeText(path);
      setOutput((prev) => prev + `[Copied path '${path}']\n`);
    } catch {
      setOutput((prev) => prev + `[Could not copy path — clipboard unavailable]\n`);
    }
  }

  // --- Context menu (right-click PC / long-press mobile) ---
  function openRowContextMenu(e: React.MouseEvent, path: string) {
    const item = items.find((i) => i.path === path);
    if (!item) return;
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      target: { kind: item.type, path },
    });
  }

  function openRootContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      target: { kind: "root", path: "" },
    });
  }

  function contextMenuItems(): ContextMenuItem[] {
    if (!contextMenu) return [];
    const { kind, path } = contextMenu.target;
    if (kind === "root") {
      return [
        {
          id: "new-file",
          label: t.editorPage.newFile,
          action: () => setShowNewFile(true),
        },
        {
          id: "new-folder",
          label: t.editorPage.newFolder,
          action: () => setShowNewFolder(true),
        },
      ];
    }
    const isFile = kind === "file";
    const items: ContextMenuItem[] = [];
    if (!isFile) {
      items.push(
        {
          id: "new-file",
          label: t.editorPage.newFile,
          action: () => {
            setActiveFilePath(path);
            setShowNewFile(true);
          },
        },
        {
          id: "new-folder",
          label: t.editorPage.newFolder,
          action: () => setShowNewFolder(true),
        },
        { id: "sep-1", label: "", separator: true }
      );
    }
    if (isFile) {
      items.push({
        id: "format",
        label: t.editorPage.menuFormat,
        disabled: formatting || !pyodideReady,
        action: () => formatCurrentFile(),
      });
    }
    items.push(
      {
        id: "rename",
        label: t.editorPage.menuRename,
        action: () => startRename(path),
      },
      {
        id: "duplicate",
        label: t.editorPage.menuDuplicate,
        action: () => duplicateItem(path),
      },
      {
        id: "copy-path",
        label: t.editorPage.menuCopyPath,
        action: () => copyPath(path),
      },
      { id: "sep-2", label: "", separator: true },
      {
        id: "delete",
        label: t.editorPage.menuDelete,
        danger: true,
        action: () => deleteItem(path),
      }
    );
    return items;
  }

  // --- Menu bar actions (Edit / View / Run / Terminal) ---
  function undoEdit() {
    try {
      editorRef.current?.trigger("keyboard", "undo", null);
    } catch {}
  }
  function redoEdit() {
    try {
      editorRef.current?.trigger("keyboard", "redo", null);
    } catch {}
  }
  function findInEditor() {
    try {
      editorRef.current?.getAction("actions.find")?.run();
    } catch {}
  }

  // Workspace files are synced into the Pyodide virtual filesystem so
  // `import utils` (and any other local module) resolves when the code
  // runs. They MUST be written to ABSOLUTE paths under /home/pyodide
  // (Pyodide's working directory): relative paths resolved against an
  // unexpected CWD, and the nested utils/ writes failed with
  // ErrnoError, so `import utils` raised ModuleNotFoundError even
  // though the runtime had loaded fine (2026-11-19).
  const PY_WORKSPACE_ROOT = "/home/pyodide";
  function syncAllFilesToPyodide(workspaceItems: WorkspaceItem[]) {
    if (!pyodideRef.current) return;
    const py = pyodideRef.current;
    try {
      const folders = workspaceItems.filter((i) => i.type === "folder");
      for (const f of folders) {
        try {
          py.FS.mkdirTree(`${PY_WORKSPACE_ROOT}/${f.path}`);
        } catch {}
      }
      const files = workspaceItems.filter((i) => i.type === "file");
      for (const f of files) {
        try {
          const parts = f.path.split("/");
          if (parts.length > 1) {
            const dir = parts.slice(0, -1).join("/");
            try {
              py.FS.mkdirTree(`${PY_WORKSPACE_ROOT}/${dir}`);
            } catch {}
          }
          py.FS.writeFile(`${PY_WORKSPACE_ROOT}/${f.path}`, f.content ?? "");
        } catch (e) {
          console.warn("FS write:", f.path, e);
        }
      }
    } catch (e) {
      console.warn("Pyodide sync error:", e);
    }
  }

  function handleAddFile(e: React.FormEvent) {
    e.preventDefault();
    const clean = newFileInput.trim();
    if (!clean) return;
    const normalized = clean.endsWith(".py") ? clean : `${clean}.py`;
    if (items.some((i) => i.path === normalized)) {
      alert(t.editorPage.fileExistsError);
      return;
    }
    const newFile: WorkspaceItem = {
      id: "f-" + Date.now(),
      name: normalized.split("/").pop()!,
      path: normalized,
      type: "file",
      isSaved: true,
      content: `# ${normalized}\n`,
    };
    const next = [...items, newFile];
    setItems(next);
    setActiveFilePath(normalized);
    setNewFileInput("");
    setShowNewFile(false);
    localStorage.setItem("lp_workspace_tree", JSON.stringify(next));
  }

  function handleAddFolder(e: React.FormEvent) {
    e.preventDefault();
    const clean = newFolderInput.trim().replace(/\/+$/, "");
    if (!clean) return;
    if (items.some((i) => i.path === clean)) {
      alert(t.editorPage.folderExistsError);
      return;
    }
    const newFolder: WorkspaceItem = {
      id: "folder-" + Date.now(),
      name: clean.split("/").pop()!,
      path: clean,
      type: "folder",
    };
    const next = [...items, newFolder];
    setItems(next);
    setExpandedFolders((prev) => ({ ...prev, [clean]: true }));
    setNewFolderInput("");
    setShowNewFolder(false);
    localStorage.setItem("lp_workspace_tree", JSON.stringify(next));
  }

  // --- Drag and Drop: Internal moving between folders ---
  function handleDragStart(e: React.DragEvent, item: WorkspaceItem) {
    e.dataTransfer.setData("text/plain", item.path);
    setDraggedItemPath(item.path);
  }

  function handleDragOverFolder(e: React.DragEvent, targetFolderPath: string | "root") {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(targetFolderPath);
  }

  function handleDropOnTarget(e: React.DragEvent, targetFolderPath: string | "root") {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);

    const sourcePath = e.dataTransfer.getData("text/plain") || draggedItemPath;
    if (!sourcePath) return;

    const sourceItem = items.find((i) => i.path === sourcePath);
    if (!sourceItem) return;

    // Can't drop folder into itself or its own subfolder
    if (sourceItem.type === "folder" && (targetFolderPath === sourceItem.path || targetFolderPath.startsWith(sourceItem.path + "/"))) {
      return;
    }

    const itemName = sourceItem.name;
    const newPath = targetFolderPath === "root" ? itemName : `${targetFolderPath}/${itemName}`;

    if (newPath === sourceItem.path) return;

    if (items.some((i) => i.path === newPath)) {
      alert(t.editorPage.itemExistsInLocationError(itemName));
      return;
    }

    const updated = items.map((it) => {
      if (it.path === sourceItem.path) {
        return { ...it, path: newPath, isSaved: false };
      }
      if (sourceItem.type === "folder" && it.path.startsWith(sourceItem.path + "/")) {
        const subRelative = it.path.slice(sourceItem.path.length + 1);
        return { ...it, path: `${newPath}/${subRelative}`, isSaved: false };
      }
      return it;
    });

    setItems(updated);
    if (activeFilePath === sourceItem.path) {
      setActiveFilePath(newPath);
    }
    if (targetFolderPath !== "root") {
      setExpandedFolders((p) => ({ ...p, [targetFolderPath]: true }));
    }
    localStorage.setItem("lp_workspace_tree", JSON.stringify(updated));
    setDraggedItemPath(null);
    setOutput((prev) => prev + `[Moved '${sourceItem.name}' to ${targetFolderPath === "root" ? "root" : targetFolderPath}]\n`);
  }

  // --- File tree (React Bits BranchedMenu) ---
  // BranchedMenu supports one folder level: top-level files are
  // leaves, each top-level folder is a section whose children are the
  // files under it. A nested folder's files are flattened into the
  // parent section with their path relative to the folder (e.g.
  // "sub/file.py"), so every file stays visible and selectable. The
  // section index ↔ folder path map lets onToggle update
  // expandedFolders (the single source of truth for fold state).
  const treeFileIcon = <FileCode className="h-3.5 w-3.5 text-neutral-300 shrink-0" />;
  const treeFolderIcon = <Folder className="h-3.5 w-3.5 text-neutral-300 shrink-0" />;
  function treeFileLabel(displayName: string, isSaved: boolean | undefined) {
    return (
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate">{displayName}</span>
        {!isSaved && (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title={t.editorPage.unsavedTooltip} />
        )}
      </span>
    );
  }
  const treeData = (() => {
    const menuItems: BranchedMenuItem[] = [];
    const sectionPathByIndex: string[] = [];
    for (const item of items) {
      if (item.type === "file" && !item.path.includes("/")) {
        menuItems.push({ value: item.path, label: treeFileLabel(item.name, item.isSaved), icon: treeFileIcon });
      } else if (item.type === "folder" && !item.path.includes("/")) {
        const children = items
          .filter((i) => i.type === "file" && i.path.startsWith(item.path + "/"))
          .map((f) => ({
            value: f.path,
            label: treeFileLabel(f.path.slice(item.path.length + 1), f.isSaved),
            icon: treeFileIcon,
          }));
        sectionPathByIndex[menuItems.length] = item.path;
        menuItems.push({ value: item.path, label: item.name, icon: treeFolderIcon, children });
      }
    }
    return { menuItems, sectionPathByIndex };
  })();
  // Controlled open sections: a folder is open unless the user
  // folded it (expandedFolders[path] === false). Mirrors the old
  // tree's `expandedFolders[item.path] ?? true` default.
  const treeOpenSections = treeData.sectionPathByIndex
    .map((p, i) => ((expandedFolders[p] ?? true) ? i : -1))
    .filter((i) => i >= 0);

  // BranchedMenu callbacks — the same behaviour the old flat tree
  // had: picking a file opens it, folding a folder updates
  // expandedFolders, dragging moves items between folders (only
  // folders are drop targets), each row has its own delete button.
  function handleTreeSelect(value: string) {
    setActiveFilePath(value);
    setNeedsSaveWarning(null);
  }
  function handleTreeToggle(index: number, open: boolean) {
    const path = treeData.sectionPathByIndex[index];
    if (path) setExpandedFolders((p) => ({ ...p, [path]: open }));
  }
  function handleTreeDragStart(e: React.DragEvent, value: string) {
    const item = items.find((i) => i.path === value);
    if (item) handleDragStart(e, item);
  }
  function handleTreeDragOver(e: React.DragEvent, value: string) {
    const item = items.find((i) => i.path === value);
    if (item?.type === "folder") handleDragOverFolder(e, value);
  }
  function handleTreeDragLeave(value: string) {
    const item = items.find((i) => i.path === value);
    if (item?.type === "folder") setDragOverTarget(null);
  }
  function handleTreeDrop(e: React.DragEvent, value: string) {
    const item = items.find((i) => i.path === value);
    if (item?.type === "folder") handleDropOnTarget(e, value);
  }

  // --- Drag and Drop: External File Upload from user's Desktop/OS ---
  async function handleExternalDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsExternalDragOver(false);

    const filesList = e.dataTransfer.files;
    if (!filesList || filesList.length === 0) return;

    const newItems: WorkspaceItem[] = [];
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const text = await file.text();
      const fileName = file.name;

      if (!items.some((it) => it.path === fileName)) {
        newItems.push({
          id: "f-drop-" + Date.now() + "-" + i,
          name: fileName,
          path: fileName,
          type: "file",
          content: text,
          isSaved: true,
        });
      }
    }

    if (newItems.length > 0) {
      const merged = [...items, ...newItems];
      setItems(merged);
      setActiveFilePath(newItems[0].path);
      localStorage.setItem("lp_workspace_tree", JSON.stringify(merged));
      setOutput((prev) => prev + `[Imported ${newItems.length} file(s) via drag & drop]\n`);
    }
  }

  async function compileAndRun(file?: WorkspaceItem) {
    // A file may be passed in (the terminal's `python <file>`)
    // — otherwise the active file runs.
    const targetFile = file ?? activeFile;
    if (!targetFile) return;

    // Auto-save on Run: the old code refused to run an unsaved file and
    // made the user click Save first. Running now saves first instead.
    const toRun = items.map((it) =>
      it.path === targetFile.path ? { ...it, content: targetFile.content ?? "", isSaved: true } : it
    );
    setItems(toRun);
    localStorage.setItem("lp_workspace_tree", JSON.stringify(toRun));
    setNeedsSaveWarning(null);
    const code = targetFile.content ?? "";

    if (!pyodideRef.current) {
      setOutput((prev) => prev + "Python runtime is loading, please wait...\n");
      const py = await initPyodide();
      if (!py) return;
    }

    setIsRunning(true);
    setOutput(`=== Executing ${targetFile.path} ===\n`);

    try {
      const py = pyodideRef.current;
      syncAllFilesToPyodide(toRun);

      // Run from the workspace root so `import utils` (and any other
      // local module) resolves, and make sure that root is on sys.path.
      py.runPython(`
import sys, os
os.chdir("/home/pyodide")
if "/home/pyodide" not in sys.path:
    sys.path.insert(0, "/home/pyodide")
`);

      // Capture stdout/stderr. stdin is empty — the Program-input box
      // was removed, so a program that calls input() raises EOFError.
      py.runPython(`
import sys
import io
sys.__lp_stdout__ = sys.stdout
sys.__lp_stderr__ = sys.stderr
sys.__lp_stdin__ = sys.stdin
class LPOutputBuffer(io.StringIO):
    pass
sys.stdout = LPOutputBuffer()
sys.stderr = sys.stdout
sys.stdin = io.StringIO("")
`);

      await py.runPythonAsync(code);

      const captured = py.runPython("sys.stdout.getvalue()");
      setOutput((prev) => prev + (captured || "(Execution completed with no output)\n") + "\n=== Finished (Exit 0) ===\n");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Keep whatever the program printed before it crashed.
      let captured = "";
      try {
        captured = pyodideRef.current?.runPython("sys.stdout.getvalue()") ?? "";
      } catch {}
      setOutput(
        (prev) =>
          prev +
          (captured ? captured + "\n" : "") +
          `Traceback (most recent call last):\n${msg}\n=== Execution Failed ===\n`
      );
    } finally {
      try {
        pyodideRef.current?.runPython(
          "sys.stdout = sys.__lp_stdout__\n" +
            "sys.stderr = sys.__lp_stderr__\n" +
            "sys.stdin = sys.__lp_stdin__"
        );
      } catch {}
      setIsRunning(false);
    }
  }

  // What `help` prints in the terminal (plain English, like the
  // drop-zone labels — not an i18n string).
  const TERMINAL_HELP = [
    "python <file.py>  run a file — its output appears here",
    "run               run the active file",
    "ls                list the workspace files",
    "pwd               show the active file path",
    "clear             clear the terminal",
    "help              show this list",
    "<python code>     run Python in the live runtime, e.g. 2 + 2",
    "",
  ].join("\n");

  // VS Code-style terminal command line: one line, prompt shows the
  // active file path. Shell commands first — `python <file>` runs a
  // file (its output lands here), `run` runs the active file, `ls`
  // lists the workspace, `pwd` shows the active file, `clear`
  // empties the terminal, `help` lists all of these — and anything
  // else runs as Python in the live runtime (REPL-style: expressions
  // print their repr, statements run silently, print() is captured).
  // stdout is redirected only for the duration of the call and
  // restored in `finally`, so a crash cannot leave it captured.
  async function runTerminalCommand() {
    const raw = terminalInput.trim();
    if (!raw || terminalBusy) return;
    setTerminalInput("");
    const prompt = `${activeFile?.path ?? "~"} $`;
    setOutput((prev) => prev + `${prompt} ${raw}\n`);
    const [head, ...rest] = raw.split(/\s+/);
    const arg = rest.join(" ").trim();
    if (head === "clear") {
      setOutput("");
      return;
    }
    if (head === "help") {
      setOutput((prev) => prev + TERMINAL_HELP);
      return;
    }
    if (head === "ls") {
      const files = items.filter((it) => it.type === "file").map((it) => it.path);
      setOutput((prev) => prev + (files.length > 0 ? files.join("\n") + "\n" : "(no files)\n"));
      return;
    }
    if (head === "pwd") {
      setOutput((prev) => prev + `${activeFile?.path ?? "~"}\n`);
      return;
    }
    if (head === "run") {
      await compileAndRun();
      return;
    }
    if (head === "python" || head === "python3" || head === "py") {
      if (!arg) {
        setOutput((prev) => prev + "usage: python <file.py>\n");
        return;
      }
      const target = items.find(
        (it) => it.type === "file" && (it.path === arg || it.path === arg.replace(/^\.\//, ""))
      );
      if (!target) {
        setOutput((prev) => prev + `python: can't open file '${arg}': [Errno 2] No such file or directory\n`);
        return;
      }
      setActiveFilePath(target.path);
      await compileAndRun(target);
      return;
    }
    // Anything else: Python in the live runtime.
    const py = pyodideRef.current;
    if (!py) {
      setOutput((prev) => prev + `${t.editorPage.terminalNotReady}\n`);
      return;
    }
    setTerminalBusy(true);
    try {
      const result = await py.runPythonAsync(`
import sys, io
_lp_term_out = io.StringIO()
_lp_term_old = sys.stdout
sys.stdout = _lp_term_out
_lp_term_repr = ""
try:
    try:
        _lp_term_val = eval(compile(${JSON.stringify(raw)}, "<terminal>", "eval"))
        if _lp_term_val is not None:
            _lp_term_repr = repr(_lp_term_val)
    except SyntaxError:
        exec(compile(${JSON.stringify(raw)}, "<terminal>", "exec"))
finally:
    sys.stdout = _lp_term_old
_lp_term_result = _lp_term_out.getvalue()
if _lp_term_repr != "":
    if _lp_term_result != "" and not _lp_term_result.endswith("\\n"):
        _lp_term_result += "\\n"
    _lp_term_result += _lp_term_repr
_lp_term_result
`);
      let text = typeof result === "string" ? result : "";
      if (text.length > 2000) {
        text = text.slice(0, 2000) + "\n…(output truncated)";
      }
      if (text) {
        setOutput((prev) => prev + text + (text.endsWith("\n") ? "" : "\n"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutput((prev) => prev + `${msg}\n`);
    } finally {
      setTerminalBusy(false);
    }
  }

  // --- Menu bar (VS Code-style header) ---
  // Web-only actions (wabepp): nothing here needs the OS. The
  // OS-dependent entries (revealing a file in the OS explorer,
  // opening the OS terminal, opening a file with another app, and the
  // debugger entries — starting a debug session, stepping through
  // code, breakpoints) are app-only (native APK / Tauri EXE) and stay
  // out of this menu. The
  // Run menu is therefore just the web-working actions: run the file
  // and stop it. View and Terminal menus are gone — panels are
  // shown/hidden and dragged from their own headers now.
  const menus: EditorMenu[] = [
    {
      id: "file",
      label: t.editorPage.menuFile,
      items: [
        { id: "new-file", label: t.editorPage.newFile, action: () => setShowNewFile(true) },
        { id: "new-folder", label: t.editorPage.newFolder, action: () => setShowNewFolder(true) },
        { id: "sep-1", label: "", separator: true },
        { id: "save", label: t.editorPage.saveFileRequired, shortcut: "Ctrl+S", disabled: !activeFile || activeFile.isSaved, action: saveCurrentFile },
        { id: "save-all", label: t.editorPage.menuSaveAll, action: saveAllFiles },
        { id: "sep-2", label: "", separator: true },
        { id: "rename", label: t.editorPage.menuRename, disabled: !activeFile, action: () => activeFile && startRename(activeFile.path) },
        { id: "duplicate", label: t.editorPage.menuDuplicate, disabled: !activeFile, action: () => activeFile && duplicateItem(activeFile.path) },
        { id: "copy-path", label: t.editorPage.menuCopyPath, disabled: !activeFile, action: () => activeFile && copyPath(activeFile.path) },
        { id: "sep-3", label: "", separator: true },
        { id: "format", label: t.editorPage.menuFormat, disabled: !activeFile || formatting || !pyodideReady, action: () => formatCurrentFile() },
        { id: "sep-4", label: "", separator: true },
        {
          id: "auto-save",
          label: t.editorPage.menuAutoSave,
          checked: autoSave,
          action: () => {
            const next = !autoSave;
            setAutoSave(next);
            localStorage.setItem("lp_editor_autosave", next ? "on" : "off");
          },
        },
      ],
    },
    {
      id: "edit",
      label: t.editorPage.menuEdit,
      items: [
        { id: "undo", label: t.editorPage.menuUndo, shortcut: "Ctrl+Z", disabled: !activeFile, action: undoEdit },
        { id: "redo", label: t.editorPage.menuRedo, shortcut: "Ctrl+Y", disabled: !activeFile, action: redoEdit },
        { id: "sep-1", label: "", separator: true },
        { id: "find", label: t.editorPage.menuFind, shortcut: "Ctrl+F", disabled: !activeFile, action: findInEditor },
        { id: "format", label: t.editorPage.menuFormat, disabled: !activeFile || formatting || !pyodideReady, action: () => formatCurrentFile() },
      ],
    },
    {
      id: "run",
      label: t.editorPage.menuRun,
      items: [
        { id: "run", label: t.editorPage.runWithoutDebugging, shortcut: "Ctrl+F5", disabled: isRunning || loadingEngine, action: () => compileAndRun() },
        { id: "stop", label: t.editorPage.stop, disabled: !isRunning, action: stopRunning },
      ],
    },
  ];

  // Guests never see the editor — the gate effect above redirects to /.
  if (!enteredChecked) return null;


  // --- Dock panels (zone layout) ---
  // The side panels as JSX, placed into zones below by
  // renderDockPanel. The Editor is the centre and never moves.
  const explorerPanel = (
      <div
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          setIsExternalDragOver(true);
        }}
        onDragLeave={() => setIsExternalDragOver(false)}
        onDrop={handleExternalDrop}
        className={`w-full flex-1 min-h-0 rounded-xl border flex flex-col overflow-hidden transition relative ${
          isExternalDragOver
            ? "border-white bg-neutral-900 ring-2 ring-white/20"
            : "border-neutral-800 bg-neutral-950"
        }`}
      >
        <EditorPanelHeader
          id="explorer"
          title={<><Folder className="h-3.5 w-3.5 text-neutral-300" /> {t.editorPage.explorer}</>}
          actions={
            <>
              <button
                type="button"
                draggable={false}
                onClick={() => setShowNewFile(!showNewFile)}
                title={t.editorPage.newFile}
                className="rounded p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                draggable={false}
                onClick={() => setShowNewFolder(!showNewFolder)}
                title={t.editorPage.newFolder}
                className="rounded p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </>
          }
          onDragStart={setDraggingPanel}
          onDragEnd={() => { setDraggingPanel(null); setDropZone(null); }}
          onClose={() => setShowExplorer(false)}
          closeLabel={t.common.close}
        />
        {/* Files / Modules tabs — the switch lives in the Explorer
            header now (the separate tab bar above the editor is
            gone). Files shows the tree; Modules opens the package
            manager in the centre. */}
        <div className="flex gap-1 border-b border-neutral-800 p-1.5">
          <button
            type="button"
            onClick={() => switchTab("files")}
            className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${editorTab === "files" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
          >
            <Code2 className="mr-1 inline h-3.5 w-3.5" />{t.editorPage.filesTab}
          </button>
          <button
            type="button"
            onClick={() => switchTab("modules")}
            className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${editorTab === "modules" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
          >
            <Package className="mr-1 inline h-3.5 w-3.5" />{t.editorPage.modulesTab}
          </button>
        </div>

        {/* Inline create inputs */}
        {showNewFile && (
          <form onSubmit={handleAddFile} className="p-2 border-b border-neutral-800 bg-black">
            <input
              type="text"
              autoFocus
              placeholder={t.editorPage.newFilePlaceholder}
              value={newFileInput}
              onChange={(e) => setNewFileInput(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs font-mono text-white placeholder-neutral-600 focus:border-white focus:outline-none"
            />
          </form>
        )}

        {showNewFolder && (
          <form onSubmit={handleAddFolder} className="p-2 border-b border-neutral-800 bg-black">
            <input
              type="text"
              autoFocus
              placeholder={t.editorPage.newFolderPlaceholder}
              value={newFolderInput}
              onChange={(e) => setNewFolderInput(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs font-mono text-white placeholder-neutral-600 focus:border-white focus:outline-none"
            />
          </form>
        )}

        {/* Inline rename (from the context menu / File menu): the
            input is pre-filled with the current name. */}
        {renamingPath && (
          <form
            onSubmit={submitRename}
            className="p-2 border-b border-neutral-800 bg-black"
          >
            <input
              type="text"
              autoFocus
              placeholder={t.editorPage.renamePlaceholder}
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setRenamingPath(null);
              }}
              onBlur={() => setRenamingPath(null)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs font-mono text-white placeholder-neutral-600 focus:border-white focus:outline-none"
            />
          </form>
        )}

        {/* Root Drop Zone */}
        <div
          onDragOver={(e) => handleDragOverFolder(e, "root")}
          onDragLeave={() => setDragOverTarget(null)}
          onDrop={(e) => handleDropOnTarget(e, "root")}
          className={`px-3 py-1 text-[10px] uppercase font-mono tracking-wider transition ${
            dragOverTarget === "root"
              ? "bg-white text-black font-semibold rounded mx-2 my-1"
              : "text-neutral-600"
          }`}
        >
          {t.editorPage.workspaceRootDropHint}
        </div>

        {/* Tree Items: React Bits BranchedMenu — top-level files
            are leaves, folders are sections with branch lines.
            Selecting a file opens it; folding a folder, dragging
            files between folders, and the per-row delete button
            all keep the old tree's behaviour. Right-click (or a
            long-press on mobile) opens the context menu. */}
        <div
          className="flex-1 overflow-auto p-2"
          onContextMenu={openRootContextMenu}
          style={{ WebkitTouchCallout: "none" }}
        >
          <BranchedMenu
            items={treeData.menuItems}
            activeValue={activeFilePath}
            openSections={treeOpenSections}
            onSelect={(value) => handleTreeSelect(value)}
            onToggle={handleTreeToggle}
            onRowDragStart={handleTreeDragStart}
            onRowDragOver={handleTreeDragOver}
            onRowDragLeave={handleTreeDragLeave}
            onRowDrop={handleTreeDrop}
            onRowContextMenu={(e, value) => openRowContextMenu(e, value)}
            dragOverValue={dragOverTarget}
            className="branched-menu--full"
            color="#f5f5f5"
            accentColor="#f5f5f5"
            lineColor="#3f3f46"
            width={280}
          />
        </div>

        {/* Drag & Drop Hint */}
        <div className="border-t border-neutral-900 p-2.5 text-center text-[10px] text-neutral-500 flex items-center justify-center gap-1.5">
          <UploadCloud className="h-3.5 w-3.5" />
          <span>{t.editorPage.dragFilesHint}</span>
        </div>
      </div>
  );
  const terminalPanel = (
      <div className="w-full flex-1 min-h-0 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden">
        <EditorPanelHeader
          id="terminal"
          title={<><Terminal className="h-3.5 w-3.5 text-white" /> {t.editorPage.terminalLogs}</>}
          actions={
            <button
              type="button"
              draggable={false}
              onClick={() => setOutput("")}
              className="rounded px-1.5 py-0.5 text-[11px] text-neutral-500 hover:bg-neutral-800 hover:text-white transition"
            >
              {t.common.clear}
            </button>
          }
          onDragStart={setDraggingPanel}
          onDragEnd={() => { setDraggingPanel(null); setDropZone(null); }}
          onClose={() => setShowTerminal(false)}
          closeLabel={t.common.close}
        />
        <pre className="flex-1 w-full bg-black p-3.5 font-mono text-xs text-neutral-300 overflow-auto whitespace-pre-wrap selection:bg-neutral-800">
          <HighlightedTerminal output={output} />
        </pre>
        {/* VS Code-style command line: one line, prompt shows the
            active file path. `python <file>` / `run` execute a file
            (output lands here); anything else runs as Python in the
            live runtime; `clear` / `help` / `ls` are shell commands.
            The old Program-input box and the separate >>> line are
            gone — this line is the terminal's only input. */}
        <div className="border-t border-neutral-800 bg-black px-3.5 py-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-emerald-400 shrink-0 truncate max-w-[45%]">
              {activeFile?.path ?? "~"} $
            </span>
            <input
              type="text"
              ref={terminalInputRef}
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runTerminalCommand();
              }}
              placeholder={
                pyodideReady
                  ? t.editorPage.terminalCommandPlaceholder
                  : t.editorPage.terminalInputLoadingPlaceholder
              }
              disabled={!pyodideReady || terminalBusy || isRunning}
              className="w-full min-w-0 bg-transparent font-mono text-xs text-white placeholder-neutral-600 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
      </div>
  );
  // AI panel — history view (⋮ menu → Chat History): past chats,
  // newest first. Opening one swaps it into the chat; deleting it
  // removes it for good.
  const aiHistoryView = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAiView("chat")}
          aria-label={t.editorPage.aiBackToChat}
          title={t.editorPage.aiBackToChat}
          className="shrink-0 rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="flex-1 text-sm font-semibold text-neutral-200">
          {t.editorPage.aiHistoryTitle}
        </span>
        <button
          type="button"
          onClick={startNewChat}
          className="shrink-0 rounded-md bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition"
        >
          {t.editorPage.aiNewChat}
        </button>
      </div>
      {aiChats.length === 0 ? (
        <p className="text-xs text-neutral-500">{t.editorPage.aiHistoryEmpty}</p>
      ) : (
        aiChats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          >
            <button
              type="button"
              onClick={() => loadAiChat(chat)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block truncate text-sm text-neutral-100">{chat.title}</span>
              <span className="block text-[11px] text-neutral-500">
                {new Date(chat.createdAt).toLocaleDateString()}
              </span>
            </button>
            <button
              type="button"
              onClick={() => deleteAiChat(chat.id)}
              aria-label={t.editorPage.menuDelete}
              title={t.editorPage.menuDelete}
              className="shrink-0 rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))
      )}
    </div>
  );

  // AI Settings card — opened from the ⋮ menu, it takes the code
  // editor's place in the centre column (not movable, not a dock
  // panel): a drill-down menu (Skills / BYOK) — each row opens its own
  // sub-page. Everything here lives in this browser; the server never
  // stores a skill or a key.
  const aiSettingsCard = (
    <div className="min-h-[420px] sm:min-h-[480px] md:min-h-0 flex-1 min-w-0 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2 bg-black/60">
        <button
          type="button"
          onClick={() => {
            if (settingsSection === "menu") setCentreView("editor");
            else setSettingsSection("menu");
          }}
          aria-label={t.editorPage.aiBackToEditor}
          title={t.editorPage.aiBackToEditor}
          className="shrink-0 rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="flex-1 text-sm font-semibold text-neutral-200">
          {settingsSection === "menu" ? (
            t.editorPage.aiSettingsTitle
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSettingsSection("menu")}
                className="text-neutral-400 hover:text-white"
              >
                {t.editorPage.aiSettingsTitle}
              </button>
              <span className="text-neutral-500">{" > "}</span>
              {settingsSection === "skills" ? t.editorPage.aiSkillsTitle : t.editorPage.aiByokTitle}
            </>
          )}
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-2xl space-y-4">
      {settingsSection === "menu" && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setSettingsSection("skills")}
            className="flex w-full items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-3 text-left hover:border-neutral-700"
          >
            <span className="text-sm font-medium text-neutral-100">{t.editorPage.aiSkillsTitle}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
          </button>
          <button
            type="button"
            onClick={() => setSettingsSection("byok")}
            className="flex w-full items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-3 text-left hover:border-neutral-700"
          >
            <span className="text-sm font-medium text-neutral-100">{t.editorPage.aiByokTitle}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
          </button>
        </div>
      )}
      {settingsSection === "skills" && (
      <div className="space-y-2">
        <p className="text-xs font-medium text-neutral-500">{t.editorPage.aiSkillsBuiltin}</p>
        {BUILTIN_AI_SKILL_META.map((skill) => (
          <label
            key={skill.id}
            className="flex cursor-pointer items-start gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          >
            <input
              type="checkbox"
              checked={activeSkillIds.includes(skill.id)}
              onChange={() => toggleSkill(skill.id)}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-white"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-neutral-100">{skill.name}</span>
              <span className="block text-xs text-neutral-500">{skill.description}</span>
            </span>
          </label>
        ))}
        <p className="text-xs font-medium text-neutral-500">{t.editorPage.aiSkillsCustom}</p>
        {customSkills.map((skill) => (
          <div
            key={skill.id}
            className="flex items-start gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          >
            <input
              type="checkbox"
              checked={activeSkillIds.includes(skill.id)}
              onChange={() => toggleSkill(skill.id)}
              aria-label={skill.name}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-white"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-neutral-100">{skill.name}</span>
              {skill.description ? (
                <span className="block text-xs text-neutral-500">{skill.description}</span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={() => deleteCustomSkill(skill.id)}
              aria-label={t.editorPage.menuDelete}
              title={t.editorPage.menuDelete}
              className="shrink-0 rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <input
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder={t.editorPage.aiSkillName}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-neutral-600"
        />
        <input
          value={newSkillDesc}
          onChange={(e) => setNewSkillDesc(e.target.value)}
          placeholder={t.editorPage.aiSkillDescription}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-neutral-600"
        />
        <textarea
          value={newSkillContent}
          onChange={(e) => setNewSkillContent(e.target.value)}
          placeholder={t.editorPage.aiSkillContent}
          rows={4}
          className="w-full resize-y rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-neutral-600"
        />
        <button
          type="button"
          onClick={addCustomSkill}
          disabled={!newSkillName.trim() || !newSkillContent.trim()}
          className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-40"
        >
          {t.editorPage.aiSkillAdd}
        </button>
      </div>
      )}
      {settingsSection === "byok" && (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {t.editorPage.aiByokTitle}
        </p>
        {byok ? (
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
            <KeyRound className="h-4 w-4 shrink-0 text-neutral-400" />
            <span className="min-w-0 flex-1 text-sm text-neutral-200">
              {BYOK_PROVIDER_NAMES[byok.provider]}
              {byok.provider === "custom" && byok.model ? ` • ${byok.model}` : ""} • {t.editorPage.aiByokSaved}
            </span>
            <button
              type="button"
              onClick={removeByok}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-300 hover:bg-neutral-800"
            >
              {t.editorPage.aiByokRemove}
            </button>
          </div>
        ) : (
          <>
            <select
              value={byokProvider}
              onChange={(e) => setByokProvider(e.target.value as AiByokProvider)}
              aria-label={t.editorPage.aiByokProvider}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
            >
              <option value="gemini">Gemini</option>
              <option value="groq">Groq</option>
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="openrouter">OpenRouter</option>
              <option value="custom">Custom</option>
            </select>
            {byokProvider === "custom" ? (
              <>
                <input
                  type="url"
                  value={byokBaseUrl}
                  onChange={(e) => setByokBaseUrl(e.target.value)}
                  placeholder={t.editorPage.aiByokBaseUrl}
                  autoComplete="off"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-neutral-600"
                />
                <input
                  type="text"
                  value={byokModel}
                  onChange={(e) => setByokModel(e.target.value)}
                  placeholder={t.editorPage.aiByokModel}
                  autoComplete="off"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-neutral-600"
                />
              </>
            ) : null}
            <input
              type="password"
              value={byokKey}
              onChange={(e) => setByokKey(e.target.value)}
              placeholder={t.editorPage.aiByokKey}
              autoComplete="off"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-neutral-600"
            />
            <button
              type="button"
              onClick={saveByok}
              disabled={
                byokKey.trim().length < 10 ||
                (byokProvider === "custom" &&
                  (!byokBaseUrl.trim().startsWith("https://") || byokModel.trim().length === 0))
              }
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-40"
            >
              {t.editorPage.aiByokSave}
            </button>
          </>
        )}
        <p className="text-xs text-neutral-500">{t.editorPage.aiByokNote}</p>
      </div>
      )}
        </div>
      </div>
    </div>
  );

  const aiPanel = (
    <div className="w-full flex-1 min-h-0 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden">
      <EditorPanelHeader
        id="ai"
        title={
          <>
            <Sparkles className="h-4 w-4 text-neutral-400" />
            <span>{t.editorPage.aiPanelTitle}</span>
          </>
        }
        actions={
          <>
            <button
              type="button"
              onClick={clearAiChat}
              title={t.editorPage.aiClearChat}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
            >
              {t.editorPage.aiClearChat}
            </button>
            <div className="relative shrink-0">
              <button
                type="button"
                draggable={false}
                onClick={() => setAiMenuOpen((o) => !o)}
                aria-label={t.editorPage.aiMenuOptions}
                title={t.editorPage.aiMenuOptions}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {aiMenuOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setAiMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-40 mt-1 w-44 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setAiView("history");
                        setAiMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                    >
                      <History className="h-3.5 w-3.5 text-neutral-400" />
                      {t.editorPage.aiMenuHistory}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCentreView("ai-settings");
                        setSettingsSection("menu");
                        setSettingsTabOpen(true);
                        setAiMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 border-t border-neutral-800 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                    >
                      <Settings className="h-3.5 w-3.5 text-neutral-400" />
                      {t.editorPage.aiMenuSettings}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </>
        }
        onDragStart={setDraggingPanel}
        onDragEnd={() => {
          setDraggingPanel(null);
          setDropZone(null);
        }}
        onClose={() => setPanelVisible("ai", false)}
        closeLabel={t.editorPage.aiClosePanel}
      />
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {aiView === "history" ? (
          aiHistoryView
        ) : (
          <>
        {aiMessages.length === 0 && !aiThinking && aiThoughtSeconds === null ? (
          <div className="flex min-h-full flex-col justify-center space-y-2">
            <p className="text-sm text-neutral-300">{t.editorPage.aiWelcome}</p>
            <p className="text-xs text-neutral-500">{t.editorPage.aiGuideNote}</p>
          </div>
        ) : null}
        {aiMessages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-xl rounded-br-sm bg-neutral-800 px-3 py-2 text-sm text-neutral-100 whitespace-pre-wrap break-words">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="rounded-xl bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
              <HighlightedMarkdown text={m.text} />
            </div>
          ),
        )}
        {aiThinking || aiThoughtSeconds !== null || aiMessages.length > 0 ? (
          <ThoughtLine
            working={aiThinking}
            label={t.editorPage.aiThinkingLabel}
            steps={[
              t.editorPage.aiStepReading,
              t.editorPage.aiStepThinking,
              t.editorPage.aiStepDrafting,
            ]}
            fontSize={13}
            defaultOpen={false}
            onSettle={(seconds) => setAiThoughtSeconds(seconds)}
          />
        ) : null}
        {aiError ? <p className="text-xs text-red-400">{aiError}</p> : null}
          </>
        )}
      </div>
      {aiView === "chat" ? (
      <div className="shrink-0 border-t border-neutral-800 p-2">
        <PromptBar
          placeholder={t.editorPage.aiPlaceholder}
          sources={[
            {
              key: "files",
              name: "Current file",
              description: activeFile ? activeFile.path : "No file open",
              icon: <Code2 className="h-4 w-4" />,
              attach: true,
            },
          ]}
          commands={[
            { key: "explain", name: "/explain", description: "Explain the current file" },
            { key: "debug", name: "/debug", description: "Find the bug in this code" },
            { key: "hint", name: "/hint", description: "Hint for the next step" },
          ]}
          models={AI_PANEL_MODELS}
          defaultModel="gemini-3.8-flash"
          efforts={["Low", "Medium", "High", "Extra", "Max"]}
          defaultEffort="Medium"
          busy={aiThinking}
          onSend={sendAiMessage}
          onStop={stopAi}
          onAttach={() => (activeFile ? [activeFile.path] : [])}
          background="#27272a"
          color="#f5f5f5"
          menuBackground="#323236"
          sparkColor="#8e8e8e"
          width={400}
          radius={16}
          maxRows={5}
        />
      </div>
      ) : null}
    </div>
  );

  const editorPanel = (
      <div className="min-h-[420px] sm:min-h-[480px] md:min-h-0 flex-1 min-w-0 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 bg-black/60">
          <span className="text-xs font-mono text-neutral-300 flex items-center gap-2 min-w-0">
            <FileCode className="h-3.5 w-3.5 text-white shrink-0" />
            <span className="truncate">{activeFile?.path} {!activeFile?.isSaved && t.editorPage.unsavedBadge}</span>
          </span>
          {isRunning && (
            <button
              type="button"
              onClick={stopRunning}
              disabled={!interruptBufferRef.current}
              title={interruptBufferRef.current ? t.editorPage.stopHint : t.editorPage.stopUnavailableHint}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-red-500/50 bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-200 hover:bg-red-500/20 transition disabled:opacity-50"
            >
              <Square className="h-3 w-3 fill-current" /> {t.editorPage.stop}
            </button>
          )}
          <span className="hidden text-[11px] text-neutral-500 font-mono sm:inline shrink-0 ml-2">
            Python 3.12 (WASM) • Monaco Editor
          </span>
        </div>

        <div className="flex-1 w-full relative">
          <Editor
            height="100%"
            language="python"
            theme={editorTheme}
            value={activeFile?.content ?? ""}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
              // Cursor position for the status bar (Ln / Col).
              editor.onDidChangeCursorPosition((e: any) => {
                setCursorPos({
                  line: e.position.lineNumber,
                  col: e.position.column,
                });
              });
            }}
            beforeMount={(monaco) => {
              // lp-dark: vs-dark + scrollbars matched to the app's
              // white-pill scrollbar (same as globals.css).
              monaco.editor.defineTheme("lp-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                  "scrollbarSliderBackground": "#ffffff73",
                  "scrollbarSliderHoverBackground": "#ffffffe6",
                  "scrollbarSliderActiveBackground": "#ffffff",
                  "scrollbarShadow": "#00000000",
                  "minimapSliderBackground": "#ffffff33",
                  "minimapSliderHoverBackground": "#ffffff73",
                  "minimapSliderActiveBackground": "#ffffffbf",
                },
              });
              // lp-light: the same, on the light base — dark pill
              // on a light editor.
              monaco.editor.defineTheme("lp-light", {
                base: "vs",
                inherit: true,
                rules: [],
                colors: {
                  "scrollbarSliderBackground": "#00000073",
                  "scrollbarSliderHoverBackground": "#000000e6",
                  "scrollbarSliderActiveBackground": "#000000",
                  "scrollbarShadow": "#00000000",
                  "minimapSliderBackground": "#00000033",
                  "minimapSliderHoverBackground": "#00000073",
                  "minimapSliderActiveBackground": "#000000bf",
                },
              });
            }}
            options={{
              fontSize: 13,
              lineNumbers: "on",
              minimap: { enabled: true, side: "right" },
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              parameterHints: { enabled: true },
              folding: true,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 4,
              insertSpaces: true,
              renderWhitespace: "selection",
              wordWrap: "on",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                useShadows: false,
              },
            }}
          />
        </div>
      </div>
  );

  const dockPanels = (["explorer", "terminal", "ai"] as PanelId[]).filter((id) => isPanelVisible(id));
  const leftPanels = dockPanels.filter((id) => panelZones[id] === "left");
  const rightPanels = dockPanels.filter((id) => panelZones[id] === "right");
  const bottomPanels = dockPanels.filter((id) => panelZones[id] === "bottom");

  function renderDockPanel(id: PanelId) {
    if (id === "explorer") return explorerPanel;
    if (id === "terminal") return terminalPanel;
    if (id === "ai") return aiPanel;
    return null;
  }

  return (
    // pb-20 clears the mobile bottom nav bar (md:pb-0: PC has no bottom bar).
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0 md:h-dvh md:overflow-hidden">
      <Script
        src="/pyodide/pyodide.js"
        // Never pass initPyodide directly: next/script calls onLoad
        // with the DOM load Event, and initPyodide would take that
        // Event for a stage-listener function — see the guard above.
        // The arrow passes a real stage listener instead, so the
        // status line below can show which CDN is being tried.
        onLoad={() => initPyodide((stage) => setEngineStage(stage))}
        onError={() => {
          const msg = t.editorPage.pyodideLoadError;
          setPyodideError(msg);
          setOutput((prev) => prev + `✗ ${msg}\n`);
        }}
      />
      <AppNavbar />

      <main
        className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto p-4 flex flex-col gap-2"
        style={
          {
            "--explorer-w": `${explorerWidth}px`,
            "--terminal-w": `${terminalWidth}px`,
          } as React.CSSProperties
        }
      >
        {/* VS Code-style menu bar (the editor header): File / Edit /
            View / Run / Terminal. Web-only actions (wabepp). */}
        <EditorMenuBar
          menus={menus}
          right={
            <>
              <button
                type="button"
                onClick={() => setShowAi((v) => !v)}
                title={t.editorPage.aiPanelTitle}
                aria-pressed={showAi}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  showAi ? "bg-neutral-800 text-white" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t.editorPage.aiButton}
              </button>
              <button
                type="button"
                onClick={() => setShowTerminal((v) => !v)}
                title={t.editorPage.terminalLogs}
                aria-pressed={showTerminal}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  showTerminal ? "bg-neutral-800 text-white" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                {t.editorPage.terminalButton}
              </button>
              <button
                type="button"
                onClick={() => setShowExplorer((v) => !v)}
                title={t.editorPage.explorer}
                aria-pressed={showExplorer}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  showExplorer ? "bg-neutral-800 text-white" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Folder className="h-3.5 w-3.5" />
                {t.editorPage.explorer}
              </button>
            </>
          }
        />

        {/* Files / Modules now live in the Explorer panel's header
            (two small tabs there) — the separate tab bar above the
            editor is gone, so the header is a single bar. */}

        {/* Runtime load status: which CDN/step it is on + elapsed time,
            so a slow download reads as "working", not "stuck". */}
        {loadingEngine && (
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs text-neutral-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span className="truncate">
              {engineStage ?? t.editorPage.loadingEngine}
            </span>
            <span className="text-neutral-500 shrink-0">· {engineElapsed}s</span>
            <button
              type="button"
              onClick={cancelEngineLoad}
              className="ml-auto shrink-0 underline font-semibold text-neutral-300 hover:text-white"
            >
              {t.common.cancel}
            </button>
          </div>
        )}

        {pyodideError && (
          <div className="flex items-center justify-between rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
            <span>{pyodideError}</span>
            <button
              type="button"
              onClick={() => {
                setPyodideError(null);
                initPyodide();
              }}
              className="underline font-semibold hover:text-white ml-3"
            >
              {t.common.retry}
            </button>
          </div>
        )}

        {/* Warning banner */}
        {needsSaveWarning && (
          <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span>{needsSaveWarning}</span>
            </div>
            <button
              type="button"
              onClick={saveCurrentFile}
              className="underline font-semibold hover:text-white ml-3"
            >
              {t.editorPage.saveNow}
            </button>
          </div>
        )}

        {/* VS Code-style layout: side panels (Explorer / AI) run the
            full height; the centre column holds the editor on top
            and the bottom-docked panels (Terminal) under it. On
            mobile the panels stack and the splitters hide; on desktop
            drag a splitter to resize and double-click it to reset. */}
        {/* Dockable panels (VS Code-style): Explorer, Terminal and AI
            live in zones — left, right, or bottom. Drag a panel by
            its header onto a zone to move it there; drag a splitter
            to resize, double-click it to reset. On mobile the panels
            stack and the splitters hide. */}
        <div
          ref={dockRef}
          className="relative flex min-h-[620px] flex-1 flex-col gap-2 md:min-h-0"
          onDragOver={() => setDropZone(null)}
        >
          <div className="flex min-h-[620px] flex-1 flex-col gap-2 md:flex-row md:min-h-0">
            {/* Left zone */}
            {leftPanels.length > 0 && (
              <div className="flex w-full flex-col gap-2 md:w-[var(--explorer-w)] md:shrink-0 md:min-h-0">
                {leftPanels.map((id) => (
                  <div key={id} className="flex min-h-0 min-w-0 flex-1 flex-col">
                    {renderDockPanel(id)}
                  </div>
                ))}
              </div>
            )}
            <EditorSplitter
              disabled={leftPanels.length === 0}
              label="Resize left panels"
              onDrag={(d) => setExplorerWidth((w) => Math.min(480, Math.max(200, w + d)))}
              onReset={() => setExplorerWidth(280)}
            />
            {/* Centre column: the editor (or the package manager on
                Modules) on top, bottom-docked panels under it — the
                terminal sits under the editor only, like VS Code, so
                the side panels keep their full height. */}
            <div className="flex min-h-[420px] min-w-0 flex-1 flex-col gap-2 sm:min-h-[480px] md:min-h-0">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                {centreView === "ai-settings" ? (
                  aiSettingsCard
                ) : editorTab === "files" ? (
                  editorPanel
                ) : (
                  <ModulesPanel pyodideRef={pyodideRef} ensurePyodide={ensurePyodideReady} />
                )}
              </div>
              {/* Bottom zone (under the editor only) */}
              {bottomPanels.length > 0 && (
                <>
                  <EditorSplitter
                    orientation="horizontal"
                    label="Resize bottom panels"
                    onDrag={(d) => setBottomHeight((h) => Math.min(480, Math.max(120, h - d)))}
                    onReset={() => setBottomHeight(150)}
                  />
                  <div className="flex shrink-0 gap-2" style={{ height: bottomHeight }}>
                    {bottomPanels.map((id) => (
                      <div key={id} className="flex min-h-0 min-w-0 flex-1 flex-col">
                        {renderDockPanel(id)}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <EditorSplitter
              disabled={rightPanels.length === 0}
              label="Resize right panels"
              onDrag={(d) => setTerminalWidth((w) => Math.min(560, Math.max(240, w - d)))}
              onReset={() => setTerminalWidth(320)}
            />
            {/* Right zone */}
            {rightPanels.length > 0 && (
              <div className="flex w-full flex-col gap-2 md:w-[var(--terminal-w)] md:shrink-0 md:min-h-0">
                {rightPanels.map((id) => (
                  <div key={id} className="flex min-h-0 min-w-0 flex-1 flex-col">
                    {renderDockPanel(id)}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Drop zones — only while a panel is being dragged. */}
          {draggingPanel && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropZone("left"); }}
                onDrop={(e) => { e.preventDefault(); movePanelToZone(draggingPanel, "left"); setDraggingPanel(null); setDropZone(null); }}
                className={`absolute bottom-0 left-0 top-0 z-20 flex w-1/4 items-center justify-center border-2 border-dashed ${dropZone === "left" ? "border-white/70 bg-white/10" : "border-white/20 bg-white/[0.03]"}`}
              >
                <span className="rounded bg-black/70 px-2 py-1 text-[11px] font-medium text-white">Dock left</span>
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropZone("right"); }}
                onDrop={(e) => { e.preventDefault(); movePanelToZone(draggingPanel, "right"); setDraggingPanel(null); setDropZone(null); }}
                className={`absolute bottom-0 right-0 top-0 z-20 flex w-1/4 items-center justify-center border-2 border-dashed ${dropZone === "right" ? "border-white/70 bg-white/10" : "border-white/20 bg-white/[0.03]"}`}
              >
                <span className="rounded bg-black/70 px-2 py-1 text-[11px] font-medium text-white">Dock right</span>
              </div>
              {/* The bottom zone is not offered for the AI panel:
                  AI is a side panel only, so while it is dragged
                  there is nowhere to drop it at the bottom. */}
              {draggingPanel !== "ai" && (
                <div
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropZone("bottom"); }}
                  onDrop={(e) => { e.preventDefault(); movePanelToZone(draggingPanel, "bottom"); setDraggingPanel(null); setDropZone(null); }}
                  style={{ left: leftPanels.length > 0 ? explorerWidth : 0, right: rightPanels.length > 0 ? terminalWidth : 0 }}
                  className={`absolute bottom-0 z-20 flex h-1/4 items-center justify-center border-2 border-dashed ${dropZone === "bottom" ? "border-white/70 bg-white/10" : "border-white/20 bg-white/[0.03]"}`}
                >
                  <span className="rounded bg-black/70 px-2 py-1 text-[11px] font-medium text-white">Dock bottom</span>
                </div>
              )}
            </>
          )}
        </div>
        {/* Status bar (VS Code-style): runtime, open tabs, save state,
            cursor position. The tabs live here at the bottom — one per
            open file, plus AI Settings / Modules while those views are
            open. (Auto Save lives in the menu-bar toggle only —
            repeating it here was a duplicate.) */}
        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-[11px] font-mono text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${pyodideReady ? "bg-emerald-400" : "bg-amber-400"}`} />
            {t.editorPage.statusPython}
          </span>
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {openFilePaths.map((path) => {
              const name = path.split("/").pop() ?? path;
              const isActive =
                centreView === "editor" && editorTab === "files" && activeFile?.path === path;
              return (
                <span
                  key={path}
                  className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 ${isActive ? "border-neutral-700 bg-neutral-800 text-neutral-100" : "border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilePath(path);
                      setCentreView("editor");
                      switchTab("files");
                    }}
                    title={path}
                    className="flex items-center gap-1.5"
                  >
                    <FileCode className="h-3.5 w-3.5 shrink-0" />
                    <span>{name}</span>
                  </button>
                  {openFilePaths.length > 1 && (
                    <button
                      type="button"
                      onClick={() => closeFileTab(path)}
                      aria-label={`Close ${name}`}
                      className="rounded p-0.5 text-neutral-500 hover:bg-neutral-700 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            })}
            {settingsTabOpen && (
              <span
                className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 ${centreView === "ai-settings" ? "border-neutral-700 bg-neutral-800 text-neutral-100" : "border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"}`}
              >
                <button
                  type="button"
                  onClick={() => setCentreView("ai-settings")}
                  title={t.editorPage.aiSettingsTitle}
                  className="flex items-center gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.editorPage.aiSettingsTitle}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTabOpen(false);
                    setCentreView("editor");
                  }}
                  aria-label={`Close ${t.editorPage.aiSettingsTitle}`}
                  className="rounded p-0.5 text-neutral-500 hover:bg-neutral-700 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {editorTab === "modules" && (
              <span
                className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 ${centreView === "editor" ? "border-neutral-700 bg-neutral-800 text-neutral-100" : "border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    switchTab("modules");
                    setCentreView("editor");
                  }}
                  title={t.editorPage.modulesTab}
                  className="flex items-center gap-1.5"
                >
                  <Package className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.editorPage.modulesTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("files")}
                  aria-label={`Close ${t.editorPage.modulesTab}`}
                  className="rounded p-0.5 text-neutral-500 hover:bg-neutral-700 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </span>
          <span className="ml-auto flex items-center gap-4">
            <span>
              {activeFile?.isSaved ? t.editorPage.saved : t.editorPage.unsavedBadge}
            </span>
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
          </span>
        </div>
      </main>

      {/* Right-click / long-press context menu (files, folders, root). */}
      {contextMenu && (
        <EditorContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
