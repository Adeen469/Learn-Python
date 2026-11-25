import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Runtime tests for the Explorer search/sort + extensions helpers:
// Node 24 type-strips .ts on import, so these test the real code
// (the modules only use erasable `import type` otherwise).
import {
  filterExplorerTree,
  sortExplorerTree,
  editorStorageScope,
  readLocalJson,
  readScopedRaw,
  scopedStorageKey,
  setEditorStorageScope,
  writeLocalJson,
} from "../src/app/editor/lib/editor-utils.ts";
import {
  EDITOR_EXTENSIONS,
  extensionForFile,
  readOpenRepo,
  setEditorScope,
  stripTransientBlobUrls,
  toggleExtensionId,
  viewerKindForFile,
} from "../src/app/editor/lib/editor-extensions.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

// VS Code-style editor redesign (2026-11-21, Maalik's brief): a menu-bar
// header (File/Edit/Run — View and Terminal menus were removed in v2),
// right-click / long-press context menus for files + folders, auto-save,
// Format (black), rename / delete / duplicate / copy-path, resizable
// panels (drag + double-click reset), a status bar, draggable dock
// zones (Explorer / Terminal / AI move between left / right / bottom),
// and an AI panel (PromptBar + ThoughtLine, default AI — a real AI
// assistant with no restrictions, plus a ⋮ menu for chat history and
// AI settings: skills + BYOK). Static source checks — the suite
// mirrors the source so a drift fails loudly instead of shipping a
// half-wired editor.

const page = read("src/app/editor/page.tsx");
// The editor split (2026-11-23): engine in the hook, panels in
// components — the static checks below read the file that holds each piece.
const hook = read("src/app/editor/hooks/usePyodideEngine.ts");
// F1 split: AI + BYOK in the editor-AI hook, settings card in its
// component, menus in the menu lib, repo loading in the repo hook,
// dock layout in the dock hook.
const aiHook = read("src/app/editor/hooks/useEditorAi.ts");
const aiCard = read("src/app/editor/components/AiSettingsCard.tsx");
const menus = read("src/app/editor/lib/editor-menus.ts");
const repo = read("src/app/editor/hooks/useWorkspaceRepo.ts");
const dock = read("src/app/editor/hooks/useDockPanels.ts");
const terminalPanel = read("src/app/editor/components/TerminalPanel.tsx");
const editorPanel = read("src/app/editor/components/EditorPanel.tsx");
const aiPanel = read("src/app/editor/components/AiPanel.tsx");
const explorerPanel = read("src/app/editor/components/ExplorerPanel.tsx");
const pushDialog = read("src/app/editor/components/PushDialog.tsx");
const menuBar = read("src/components/EditorMenuBar.tsx");
const contextMenu = read("src/components/EditorContextMenu.tsx");
const splitter = read("src/components/EditorSplitter.tsx");
const panelHeader = read("src/components/EditorPanelHeader.tsx");
const branched = read("src/components/BranchedMenu.tsx");
const promptBar = read("src/components/PromptBar.tsx");
const promptBarCss = read("src/components/PromptBar.css");
const thoughtLine = read("src/components/ThoughtLine.tsx");
const aiLib = read("src/lib/ai.ts");
const aiRoute = read("src/app/api/ai/route.ts");
const orModelsRoute = read("src/app/api/ai/openrouter-models/route.ts");
const aiSkillsGen = read("src/lib/ai-skills.generated.ts");
const aiSkillsMeta = read("src/lib/ai-skills-meta.generated.ts");
const en = read("src/lib/i18n/en.ts");
const modules = read("src/components/ModulesPanel.tsx");

test("menu bar: File/Edit/Run only, Run = run without debugging + stop (wabepp)", () => {
  assert.ok(page.includes("<EditorMenuBar"), "page must render the menu bar");
  assert.ok(menus.includes('id: "file"'), "File menu must exist");
  assert.ok(menus.includes('id: "edit"'), "Edit menu must exist");
  assert.ok(menus.includes('id: "run"'), "Run menu must exist");
  assert.ok(!menus.includes('id: "view"'), "View menu must be gone (panels move by drag, not a menu)");
  assert.ok(!menus.includes('id: "terminal"'), "Terminal menu must be gone (Clear lives in the Terminal panel header)");
  assert.ok(menus.includes("runWithoutDebugging"), "Run menu must offer Run Without Debugging");
  assert.ok(menus.includes('"Ctrl+F5"'), "Run Without Debugging must carry its Ctrl+F5 label");
  assert.ok(menus.includes('id: "stop"'), "Run menu must offer Stop");
  assert.ok(menus.includes("action: engine.stopRunning"), "Run menu Stop must stop the run");
  assert.ok(menuBar.includes('role="menubar"'), "menu bar must use menubar role");
  // wabepp: OS-only items must NOT be in the website menu. The VS Code
  // Run-menu debugger entries are app-only (native APK / Tauri EXE).
  for (const banned of [
    "Reveal in File Explorer",
    "Open in Integrated Terminal",
    "Open With",
    "Start Debugging",
    "Step Over",
    "Step Into",
    "Step Out",
    "Toggle Breakpoint",
    "Add Configuration",
    "Open Configurations",
  ]) {
    assert.ok(!menus.includes(banned), `web menu must not contain "${banned}" (app-only)`);
    assert.ok(!menuBar.includes(banned), `menu bar must not contain "${banned}" (app-only)`);
  }
  // Panel toggle buttons live in the menu bar's right side: Terminal
  // + Explorer (replacing the old Auto Save button — its toggle now
  // lives in the File menu only). Each reopens its panel after the
  // header X closed it.
  const menuRight = page.slice(page.indexOf("right={"), page.indexOf("Files / Modules now live"));
  assert.ok(menuRight.includes("terminalButton"), "menu bar must offer a Terminal toggle");
  assert.ok(menuRight.includes("setShowTerminal"), "Terminal toggle must show/hide the Terminal panel");
  assert.ok(menuRight.includes("t.editorPage.explorer"), "menu bar must offer an Explorer toggle");
  assert.ok(menuRight.includes("setShowExplorer"), "Explorer toggle must show/hide the Explorer panel");
  assert.ok(!menuRight.includes("menuAutoSave"), "Auto Save button must be gone from the menu bar (File menu only)");
});

test("control bar + standalone tab bar are gone; Files/Modules live in the Explorer panel", () => {
  // The old single-shot AI (Explain / Find-bug buttons + answer card)
  // is gone — the AI panel replaces it.
  for (const dead of ["askEditorAi", "aiAnswer", "aiLoading", "aiTruncated"]) {
    assert.ok(!page.includes(dead), `dead single-shot AI state "${dead}" must be removed`);
  }
  // "aiMode" as a bare identifier — the Models settings keys
  // (aiModelsTitle, …) contain it as a substring and are alive.
  assert.ok(!/\baiMode\b/.test(page), 'dead single-shot AI state "aiMode" must be removed');
  // Files/Modules tabs now sit inside the Explorer panel header.
  assert.ok(explorerPanel.includes('switchTab("files")'), "Explorer panel must offer the Files tab");
  assert.ok(explorerPanel.includes('switchTab("modules")'), "Explorer panel must offer the Modules tab");
  // Stop moved to the Editor panel header (only while a run is live).
  assert.ok(editorPanel.includes("{engine.isRunning && ("), "editor header must show Stop only while running");
  assert.ok(editorPanel.includes("onClick={engine.stopRunning}"), "editor header Stop must stop the run");
});

test("context menu: component exists, wired to rows + root, web-only items", () => {
  assert.ok(page.includes("<EditorContextMenu"), "page must render the context menu");
  assert.ok(explorerPanel.includes("onRowContextMenu"), "tree rows must open the context menu");
  assert.ok(branched.includes("onRowContextMenu"), "BranchedMenu must support onRowContextMenu");
  assert.ok(page.includes("openRootContextMenu"), "empty explorer area must open the root menu");
  assert.ok(contextMenu.includes("fixed inset-0 z-40"), "menu must have an overlay to close on outside tap");
  // Items present for files/folders.
  for (const key of ["menuRename", "menuDuplicate", "menuCopyPath", "menuDelete", "menuFormat"]) {
    assert.ok(menus.includes(key), `context menu / file menu must use ${key}`);
  }
  // wabepp: OS-only items must NOT be in the website context menu.
  assert.ok(!contextMenu.includes("Reveal in File Explorer"), "context menu must not contain OS-only items");
  assert.ok(!menus.includes("Reveal in File Explorer"), "menus must not contain OS-only items");
});

test("auto-save: on by default, persisted, debounced silent save", () => {
  assert.ok(page.includes("lp_editor_autosave"), "auto-save preference must persist");
  assert.ok(page.includes("saveFileSilently"), "auto-save must use a silent save (no terminal spam)");
  assert.ok(page.includes("1200"), "auto-save must debounce (~1.2s)");
  assert.ok(menus.includes("menuAutoSave"), "auto-save must be toggleable from the File menu");
});

test("format: black via micropip, installed once per session", () => {
  assert.ok(menus.includes("formatCurrentFile"), "format action must exist");
  assert.ok(hook.includes("black.format_str"), "format must use black");
  assert.ok(hook.includes("micropip"), "black must install via micropip");
  assert.ok(hook.includes("blackReadyRef"), "black must install once per session");
  assert.ok(en.includes("formatFailed"), "format failure must have a message");
});

test("rename / delete / duplicate / copy-path actions exist", () => {
  for (const fn of ["startRename", "submitRename", "deleteItem", "duplicateItem", "copyPath"]) {
    assert.ok(page.includes(`function ${fn}`), `${fn} must exist`);
  }
  assert.ok(page.includes("keepOneFileError"), "delete must refuse to remove the last file");
  assert.ok(page.includes("navigator.clipboard.writeText"), "copy path must use the clipboard");
});

test("resizable panels: splitters, persisted widths, double-click reset", () => {
  assert.ok(page.includes("<EditorSplitter"), "page must render splitters");
  assert.ok(splitter.includes("onDoubleClick"), "splitter must reset on double-click");
  assert.ok(splitter.includes("setPointerCapture"), "splitter must use pointer capture (mouse + touch)");
  assert.ok(splitter.includes("orientation"), "splitter must support a horizontal orientation (bottom zone)");
  assert.ok(splitter.includes("cursor-row-resize"), "horizontal splitter must use a row-resize cursor");
  assert.ok(page.includes("lp_editor_explorer_w"), "explorer width must persist");
  assert.ok(page.includes("lp_editor_terminal_w"), "terminal width must persist");
  assert.ok(dock.includes("lp_editor_bottom_h"), "bottom-zone height must persist");
  assert.ok(dock.includes("? v : 150"), "bottom zone must default to 150px so the editor stays tall on laptop screens");
  assert.ok(dock.includes("if (v === 220) return 150"), "a saved 220 (old default) must migrate to the new 150 default");
  assert.ok(dock.includes("editorRef.current?.layout()"), "Monaco must be re-laid-out when the dock geometry changes");
  assert.ok(page.includes("var(--explorer-w)"), "explorer width must come from a CSS var (desktop only)");
  assert.ok(page.includes("var(--terminal-w)"), "terminal width must come from a CSS var (desktop only)");
  assert.ok(page.includes("showExplorer"), "explorer must be toggleable (panel close)");
  assert.ok(page.includes("showTerminal"), "terminal must be toggleable (panel close)");
});

test("draggable dock: panels move between zones (AI is side-only, Terminal/Explorer go anywhere)", () => {
  assert.ok(
    terminalPanel.includes("<EditorPanelHeader") &&
    explorerPanel.includes("<EditorPanelHeader") &&
    aiPanel.includes("<EditorPanelHeader"),
    "panels must render the draggable header"
  );
  assert.ok(panelHeader.includes("draggable"), "panel header must be draggable");
  assert.ok(panelHeader.includes("lp-panel:"), "panel drag must carry its id in the drag data");
  assert.ok(dock.includes("lp_editor_panel_zones"), "panel zones must persist");
  assert.ok(page.includes("movePanelToZone"), "dropping a panel must move it to the zone");
  assert.ok(page.includes("renderDockPanel"), "zones must render panels through renderDockPanel");
  assert.ok(page.includes("Dock left"), "left drop zone must exist while dragging");
  assert.ok(page.includes("Dock right"), "right drop zone must exist while dragging");
  assert.ok(page.includes("Dock bottom"), "bottom drop zone must exist while dragging");
  assert.ok(dock.includes('const [showAi, setShowAi] = useState(true)'), "AI panel must be visible by default");
  // AI is a side panel only — it never docks at the bottom.
  assert.ok(dock.includes('if (id === "ai" && zone === "bottom") return;'), "AI must refuse the bottom zone");
  assert.ok(page.includes('draggingPanel !== "ai"'), "bottom drop zone must hide while dragging AI");
  assert.ok(dock.includes('if (z.ai === "bottom") z.ai = "right";'), "a saved AI bottom zone must reset to the right side");
  // Terminal opens at the bottom by default (fresh users).
  assert.ok(dock.includes('terminal: "bottom"'), "Terminal must open at the bottom by default");
  // The bottom zone lives under the editor only (VS Code): the side
  // panels keep their full height.
  assert.ok(!page.includes("bottom-1/4"), "side drop overlays must span the full height, not stop at 3/4");
  assert.ok(page.includes("leftPanels.length > 0 ? explorerWidth : 0"), "bottom drop zone must span the centre column only");
  const centre = page.slice(page.indexOf("Centre column:"), page.indexOf("Resize right panels"));
  assert.ok(centre.includes('orientation="horizontal"'), "the bottom zone must sit inside the centre column, under the editor");
  assert.ok(centre.includes("bottomPanels.length > 0"), "the bottom zone must render inside the centre column");
  // Tight gutters: the dock gaps are gap-2 (8px), not gap-3 (12px).
  assert.ok(!page.includes("gap-3"), "no 12px dock gutter may remain");
  assert.ok(page.includes("flex flex-col gap-2"), "dock columns must use the tight gap");
  // The AI empty state sits in the middle of the panel, not pinned to
  // the top with a void below it.
  assert.ok(aiPanel.includes("flex min-h-full flex-col justify-center"), "AI empty state must be vertically centred");
});

test("fit to screen: viewport-height layout on desktop, each panel scrolls on its own", () => {
  // The page is exactly one viewport tall on desktop (md+) — the
  // whole page never scrolls; each panel scrolls internally.
  assert.ok(page.includes("md:h-dvh md:overflow-hidden"), "page root must be exactly viewport height on desktop");
  assert.ok(page.includes("flex-1 min-h-0 max-w-[1600px]"), "main must shrink inside the viewport-height root");
  assert.ok(page.includes("relative flex min-h-[620px] flex-1 flex-col gap-2 md:min-h-0"), "dock must shrink on desktop (no 620px floor)");
  assert.ok(page.includes("flex min-h-[620px] flex-1 flex-col gap-2 md:flex-row md:min-h-0"), "dock row must shrink on desktop");
  assert.ok(menuBar.includes("shrink-0"), "menu bar must not be squeezed when the viewport is short");
  // Status bar must not be squeezed either.
  const statusBar = page.slice(
    page.indexOf("Status bar (VS Code-style)"),
    page.indexOf("{/* Right-click / long-press context menu")
  );
  assert.ok(statusBar.includes("shrink-0"), "status bar must not be squeezed");
  // Each panel scrolls on its own: tree, terminal output, AI body,
  // and the Modules tab inside a single scrolling div.
  assert.ok(explorerPanel.includes("flex-1 overflow-auto p-2"), "file tree must scroll inside its panel");
  assert.ok(terminalPanel.includes("overflow-auto whitespace-pre-wrap"), "terminal output must scroll inside its panel");
  assert.ok(aiPanel.includes("flex-1 min-h-0 overflow-y-auto p-3"), "AI messages must scroll inside their panel");
  assert.ok(modules.includes("flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto"), "Modules tab must scroll inside one div");
});

test("AI panel: PromptBar + ThoughtLine wired to the default AI (a real AI, no restrictions)", () => {
  assert.ok(aiPanel.includes("<PromptBar"), "AI panel must render the PromptBar");
  assert.ok(aiPanel.includes("<ThoughtLine"), "AI panel must render the ThoughtLine while thinking");
  // The ThoughtLine must stay mounted while messages exist: if it
  // unmounted the moment thinking stopped, its settle effect would
  // never run and the "Thought for Xs" line would never appear.
  assert.ok(
    aiPanel.includes("aiMessages.length > 0"),
    "ThoughtLine must stay mounted while messages exist so it can settle"
  );
  assert.ok(page.includes("sendAiMessage"), "AI panel must send through sendAiMessage");
  assert.ok(!page.includes('mode: "guide"'), "AI panel must not send a mode — one default AI answers every prompt");
  assert.ok(page.includes("AI_PANEL_MODELS"), "AI panel must offer the model picker");
  assert.ok(page.includes('defaultModel="gemini-3.6-flash"'), "Gemini 3.6 Flash must be the default model (proven live; the 3.1 Pro preview is best, not default)");
  // The model menu must scroll: 15 models no longer fit on screen.
  assert.ok(promptBarCss.includes("max-height: 288px"), "model menu must cap its height so it can scroll");
  assert.ok(promptBarCss.includes("overflow-y: auto"), "model menu must scroll instead of growing off-screen");
  // Menu buttons must focus the input BEFORE opening the menu: the
  // textarea's onFocus closes menus, so focusing after opening would
  // close the menu just opened (the picker would never appear on a
  // fresh editor where the input was never focused).
  const menuButtonOrder = [
    ['aria-label="Add files and sources"', "setPlusOpen(v => !v)"],
    ['aria-label="Choose model"', "setModelOpen(v => !v)"],
    ['aria-label="Choose effort"', "setEffortOpen(v => !v)"],
  ];
  for (const [label, toggle] of menuButtonOrder) {
    const start = promptBar.indexOf(label);
    assert.ok(start >= 0, `PromptBar must have a ${label} button`);
    const block = promptBar.slice(start, promptBar.indexOf("</button>", start));
    assert.ok(
      block.indexOf("focusInput();") >= 0 && block.indexOf("focusInput();") < block.indexOf(toggle),
      `${label} must focus the input before toggling its menu open`
    );
  }
  assert.ok(aiPanel.includes('sparkColor="#8e8e8e"'), "PromptBar must use Maalik's spark colour");
  assert.ok(aiPanel.includes("onSend={sendAiMessage}"), "PromptBar send must go to the AI handler");
  assert.ok(aiPanel.includes("onStop={stopAi}"), "PromptBar stop must abort the in-flight request");
  assert.ok(page.includes("aiButton"), "menu bar must carry the AI toggle button");
  assert.ok(page.includes('if (id === "ai") return aiPanel'), "the AI panel must dock in the side zones");
  assert.ok(page.includes("clearAiChat"), "AI panel must offer Clear chat");
  // Every model Maalik asked for (Gemini + Groq + Anthropic + OpenAI
  // + OpenRouter) in the picker, plus the backend allowlist.
  for (const id of [
    "gemini-3.1-pro-preview", "gemini-3.6-flash",
    "openai/gpt-oss-120b", "openai/gpt-oss-20b",
    "claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-5-5",
    "gpt-5.5", "gpt-5.4-mini", "gpt-4o", "gpt-4o-mini",
    "google/gemma-4-31b-it:free", "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free", "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-3.5-super-vl:free", "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "baidu/ernie-5.5-flash-preview:free", "inclusionai/ling-3.2-flash:free",
    "recursive/flint-v1.0:free", "particle-ai/particle-1:free", "liquid/lfm-3-1.7b:free",
  ]) {
    assert.ok(aiHook.includes(`"${id}"`), `AI picker must list ${id}`);
    assert.ok(aiLib.includes(`"${id}"`), `backend allowlist must include ${id}`);
  }
  // The vendored components carry Maalik's defaults.
  assert.ok(promptBar.includes("sparkColor = '#8e8e8e'"), "PromptBar default spark colour must be #8e8e8e");
  assert.ok(thoughtLine.includes("fontSize = 15"), "ThoughtLine default font size must be 15");
  // The "Thought for Xs" line must start minimised and small, sized
  // to the app — the user taps the header to expand it.
  assert.ok(aiPanel.includes("fontSize={13}"), "AI panel must size the ThoughtLine to the app (13px)");
  assert.ok(aiPanel.includes("defaultOpen={false}"), "ThoughtLine must start minimised while thinking");
  assert.ok(thoughtLine.includes("defaultOpen"), "ThoughtLine must support a defaultOpen prop");
  assert.ok(thoughtLine.includes("useState(defaultOpen)"), "the trace must start in the defaultOpen state");
  // The default backend prompt is a real AI assistant —
  // it writes full code when asked, with no restrictions, and
  // there is no mode switch anywhere in the backend.
  assert.ok(!aiLib.includes('case "guide"'), "backend must have no guide mode");
  assert.ok(!aiLib.includes("AiMode"), "backend must have no AiMode type");
  assert.ok(
    aiLib.includes("You are a real AI assistant"),
    "default prompt must be a real AI assistant"
  );
  assert.ok(
    aiLib.includes("Write the full code when they ask for it"),
    "default prompt must write the full code when asked"
  );
  assert.ok(
    !aiLib.includes("NEVER write or generate the code solution"),
    "guide prompt must not forbid generating code any more"
  );
});

test("AI panel ⋮ menu: chat history + AI settings card (skills + BYOK)", () => {
  // The ⋮ menu in the AI panel header.
  assert.ok(aiPanel.includes("MoreVertical"), "AI panel header must carry a ⋮ menu button");
  assert.ok(aiPanel.includes("aiMenuHistory"), "⋮ menu must offer Chat History");
  assert.ok(aiPanel.includes("aiMenuSettings"), "⋮ menu must offer AI Settings");
  assert.ok(page.includes("aiView"), "AI panel must switch between chat/history views");
  assert.ok(aiPanel.includes('aiView === "history"'), "history view must exist");
  assert.ok(aiPanel.includes("aiBackToChat"), "history view must offer a way back to chat");
  // AI Settings is NOT a panel view any more — it opens as a separate
  // card in the code editor's place (not movable, not a dock panel).
  assert.ok(!page.includes('aiView === "settings"'), "settings must not be an AI panel view any more");
  assert.ok(page.includes("aiSettingsCard"), "the settings card must exist");
  assert.ok(page.includes('centreView === "ai-settings"'), "settings must open as a card in the centre");
  assert.ok(page.includes('setCentreView("ai-settings")'), "⋮ menu AI Settings must open the centre card");
  assert.ok(aiCard.includes("aiBackToEditor"), "the settings card must offer a way back to the editor");
  assert.ok(aiCard.includes("max-w-2xl"), "the settings card content must stay readable on wide screens");
  // Settings is a drill-down menu, not a dropdown: the card first
  // lists Skills / BYOK, tapping a row opens that sub-page with a
  // breadcrumb ("AI Settings > Skills"), and the back arrow returns
  // to the menu.
  assert.ok(aiCard.includes("settingsSection"), "the settings card must navigate between menu / skills / byok");
  assert.ok(aiCard.includes('setSettingsSection("skills")'), "the menu must open the Skills sub-page");
  assert.ok(aiCard.includes('setSettingsSection("byok")'), "the menu must open the BYOK sub-page");
  assert.ok(aiCard.includes('setSettingsSection("menu")'), "a sub-page must offer a way back to the menu");
  assert.ok(aiCard.includes('settingsSection === "skills"'), "the skills list must render only on its sub-page");
  assert.ok(aiCard.includes('settingsSection === "byok"'), "the BYOK form must render only on its sub-page");
  assert.ok(aiCard.includes('{" > "}'), "a sub-page must show the breadcrumb separator");
  assert.ok(aiCard.includes("ChevronRight"), "menu rows must show a chevron to the sub-page");
  assert.ok(!page.includes("showSkills"), "the old dropdown toggle must be gone");
  // Chat history: persisted in this browser, restorable, deletable.
  assert.ok(aiHook.includes("lp_ai_chats"), "past chats must persist in localStorage");
  assert.ok(aiHook.includes("lp_ai_current_chat"), "the in-progress chat must survive a reload");
  assert.ok(aiHook.includes("saveCurrentChatToHistory"), "clearing / switching must save the chat first");
  assert.ok(page.includes("loadAiChat"), "a saved chat must be restorable");
  assert.ok(page.includes("deleteAiChat"), "a saved chat must be deletable");
  assert.ok(page.includes("startNewChat"), "history must offer a new chat");
  // Skills: built-in list from the generated meta module (content-free,
  // so the skill bodies never ship to the browser), custom skills the
  // user adds, toggles for both.
  assert.ok(aiCard.includes("BUILTIN_AI_SKILL_META"), "settings must list the built-in skills from the meta module");
  assert.ok(aiHook.includes("lp_ai_custom_skills"), "custom skills must persist in localStorage");
  assert.ok(aiHook.includes("lp_ai_active_skills"), "active skill ids must persist in localStorage");
  assert.ok(aiHook.includes("toggleSkill"), "each skill must be togglable");
  assert.ok(aiHook.includes("addCustomSkill"), "the user must be able to add a skill");
  assert.ok(aiHook.includes("deleteCustomSkill"), "a custom skill must be deletable");
  assert.ok(aiCard.includes("aiSkillName"), "add-skill form must ask for a name");
  assert.ok(aiCard.includes("aiSkillContent"), "add-skill form must ask for instructions");
  // BYOK: provider + key, saved encrypted on the server (the
  // browser keeps only the provider + masked hint). Six providers
  // now: Gemini, Groq, Anthropic, OpenAI, OpenRouter and a custom
  // OpenAI-compatible endpoint (base URL + model + key). One key
  // per provider: the add-form only offers providers without a
  // saved key, so the options come from the hook's provider list
  // via availableByokProviders, not hardcoded <option> rows.
  assert.ok(aiHook.includes("lp_ai_byok"), "BYOK metadata must persist in localStorage (keys live server-side now)");
  assert.ok(aiCard.includes("byokProvider"), "BYOK must offer a provider choice");
  assert.ok(aiHook.includes("export const ALL_BYOK_PROVIDERS"), "the hook must define the provider list");
  assert.ok(aiCard.includes("availableByokProviders"), "the card must offer only the providers without a saved key");
  for (const provider of ["gemini", "groq", "anthropic", "openai", "openrouter", "custom"]) {
    assert.ok(aiHook.includes(`"${provider}"`), `BYOK must offer ${provider}`);
  }
  assert.ok(aiCard.includes("byokBaseUrl"), "custom BYOK must ask for a base URL");
  assert.ok(aiCard.includes("byokModel"), "custom BYOK must ask for a model");
  assert.ok(aiCard.includes("aiByokBaseUrl"), "custom BYOK must label the base URL field");
  assert.ok(aiCard.includes("aiByokModel"), "custom BYOK must label the model field");
  assert.ok(aiHook.includes("saveByok"), "BYOK must be saveable");
  assert.ok(aiHook.includes("removeByok"), "BYOK must be removable");
  assert.ok(aiCard.includes('type="password"'), "the BYOK key field must be a password field");
  // A 503 must show the server's own reason (no keys vs. every
  // provider failed) — the old message blamed the keys for every 503,
  // even when keys were configured and the calls just failed.
  assert.ok(
    aiHook.includes("serverError ?? t.editorPage.aiUnavailableMessage"),
    "a 503 must show the server's own reason, not the generic keys message"
  );
  // The request must carry skills + BYOK to the API.
  assert.ok(aiHook.includes("skillIds: activeSkillIds"), "the request must send the active built-in skill ids");
  assert.ok(aiHook.includes("skills: customSkills"), "the request must send the active custom skills");
  assert.ok(page.includes("byok"), "the request must send the BYOK provider reference when saved");
  assert.ok(aiHook.includes("{ provider: entry.provider }"), "the BYOK payload must carry only the provider reference, never the key");
  // The server resolves built-in ids (default: ponytail) and applies
  // BYOK in-memory only — never storing or logging the key.
  assert.ok(aiRoute.includes("BUILTIN_AI_SKILLS"), "route must resolve built-in skill ids server-side");
  assert.ok(aiRoute.includes("DEFAULT_ACTIVE_SKILL_IDS"), "route must default to ponytail when no ids are sent");
  assert.ok(!aiRoute.includes("body.mode ==="), "skills must not be gated on a mode — one default AI applies them whenever sent");
  assert.ok(aiRoute.includes("const key = stored?.key ?? null;"), "route must use the stored BYOK key only — a body key is rejected (R2-M1)");
  assert.ok(!aiRoute.includes("body.byok.key"), "route must never read a body-supplied BYOK key");
  assert.ok(aiRoute.includes("config.geminiKey = key"), "route must use a Gemini BYOK key when given");
  assert.ok(aiRoute.includes("config.groqKey = key"), "route must use a Groq BYOK key when given");
  assert.ok(aiRoute.includes("config.anthropicKey = key"), "route must use an Anthropic BYOK key when given");
  assert.ok(aiRoute.includes("config.openaiKey = key"), "route must use an OpenAI BYOK key when given");
  assert.ok(aiRoute.includes("config.openrouterKey = key"), "route must use an OpenRouter BYOK key when given");
  assert.ok(aiRoute.includes("config.customKey = key"), "route must use a custom BYOK key when given");
  assert.ok(aiRoute.includes("config.customBaseUrl = stored?.baseUrl ?? null;"), "custom BYOK base URL must come from the server store (R2-M1)");
  assert.ok(aiRoute.includes("config.customModel = stored?.model ?? null;"), "custom BYOK model must come from the server store (R2-M1)");
  assert.ok(aiRoute.includes("maxDuration = 60"), "route must allow 60s for the multi-provider fallback chain");
  assert.ok(!aiRoute.includes("console.log"), "route must never log request data (a BYOK key must never leak)");
  // The generated skill modules: 7 unique built-in skills (the
  // PONYTAIL_SKILL_1.md duplicate is not shipped twice), ponytail on
  // by default; the client meta module carries no skill bodies.
  for (const id of [
    "ponytail", "ponytail-audit", "ponytail-debt", "ponytail-gain",
    "ponytail-help", "ponytail-review", "gstack",
  ]) {
    assert.ok(aiSkillsGen.includes(`"id": "${id}"`), `generated skills must include ${id}`);
    assert.ok(aiSkillsMeta.includes(`"id": "${id}"`), `generated skill meta must include ${id}`);
  }
  assert.ok(aiSkillsGen.includes('"id": "ponytail"'), "ponytail must be a built-in skill");
  assert.ok(aiSkillsGen.includes('DEFAULT_ACTIVE_SKILL_IDS: string[] = ["ponytail"]'), "ponytail must be the default active skill");
  assert.ok(!aiSkillsMeta.includes("Stop at the first rung"), "the client meta module must not carry skill bodies");
  assert.ok(aiSkillsGen.includes("Forces the laziest solution"), "the server module must carry the ponytail body");
  // The /debug default question must ask for the fix (real AI now).
  assert.ok(
    aiHook.includes("Find the bug in this code, explain why it breaks, and show me the fixed code."),
    "/debug must ask for the fixed code, not just a pointer"
  );
  assert.ok(
    !page.includes("don't fix it for me"),
    "the old don't-fix-it /debug default must be gone"
  );
});

test("status bar: runtime, file, save state, cursor position", () => {
  assert.ok(page.includes("statusPython"), "status bar must show the Python runtime");
  assert.ok(page.includes("cursorPos"), "status bar must show the cursor position");
  assert.ok(page.includes("Ln {cursorPos.line}"), "status bar must show line number");
  assert.ok(editorPanel.includes("onMount"), "editor must expose its instance (Undo/Redo/Find + cursor)");
  assert.ok(page.includes('getAction("actions.find")'), "Find must use Monaco's find action");
  // Auto Save lives in the menu-bar toggle only — the status bar used
  // to repeat it ("Auto Save · Saved"), a duplicate.
  const statusBar = page.slice(
    page.indexOf("Status bar (VS Code-style)"),
    page.indexOf("{/* Right-click / long-press context menu")
  );
  assert.ok(!statusBar.includes("menuAutoSave"), "status bar must not repeat the Auto Save toggle");
  assert.ok(statusBar.includes("t.editorPage.saved"), "status bar must still show the saved state");
  // Open tabs live in the status bar at the bottom (VS Code-style):
  // one per open file, plus AI Settings / Modules while those views
  // are open. Clicking a tab switches to it, × closes it.
  assert.ok(statusBar.includes("openFilePaths.map"), "the status bar must render one tab per open file");
  assert.ok(statusBar.includes("closeFileTab"), "a file tab must offer a close button");
  assert.ok(statusBar.includes("openFilePaths.length > 1"), "the last file tab must not offer a close button");
  assert.ok(statusBar.includes("settingsTabOpen"), "AI Settings must appear as a tab while it is open");
  assert.ok(statusBar.includes('editorTab === "modules"'), "Modules must appear as a tab while it is open");
  assert.ok(statusBar.includes("FileCode"), "a file tab must show a file icon");
  // One effect keeps the file tabs in sync: opening a file adds its
  // tab, deleting one drops it, renaming one follows the new path.
  assert.ok(page.includes("const [openFilePaths, setOpenFilePaths]"), "open file tabs must be tracked in state");
  assert.ok(page.includes("live.includes(activeFile.path)"), "opening a file must add its tab");
  assert.ok(page.includes("items.some((it) => it.type === \"file\" && it.path === p)"), "deleting a file must drop its tab");
  assert.ok(aiPanel.includes('setSettingsTabOpen(true)'), "opening settings must open its tab");
  // Right-click a bottom tab opens the VS Code-style tab menu (web
  // actions only, wabepp): closes, copy path, reveal, pin.
  assert.ok(statusBar.includes("openTabContextMenu"), "a tab must open its context menu on right-click");
  assert.ok(menus.includes('kind === "tab-file"'), "a file tab must have its own menu");
  assert.ok(menus.includes('kind === "tab-settings"'), "the settings tab must have its own menu");
  assert.ok(page.includes("applyTabClose"), "bulk closes must share one helper (pins + keep-one-tab)");
  assert.ok(page.includes("pinnedPaths"), "pinned tabs must be tracked (bulk closes skip them)");
  assert.ok(page.includes("revealInExplorer"), "a file tab must offer Reveal in Explorer View");
  assert.ok(page.includes("scrollIntoView"), "reveal must scroll the file's tree row into view");
  assert.ok(menus.includes("App-only (native APK"), "the app-only menu items must be listed, not built on the website");
});

test("Push opens a dialog with an AI-written commit message the user can edit (nothing pushes on its own)", () => {
  assert.ok(page.includes("openPushDialog"), "the Push button must open a dialog first, not push directly");
  assert.ok(page.includes("pushRepoChanges"), "the dialog's confirm must run the push");
  assert.ok(page.includes("/api/github/batch-commit"), "the push must go through the batch-commit route (one request per push)");
  assert.ok(page.includes("changedRepoPathsRef"), "only files changed since the repo opened must push");
  assert.ok(repo.includes("markRepoChanged(activeFile.path)"), "editing a file must mark it changed");
  assert.ok(page.includes("t.editorPage.pushButton"), "the menu bar must have a Push button");
  assert.ok(page.includes("UploadCloud"), "the Push button must carry an upload icon");
  assert.ok(page.includes("disabled={!openRepoState || pushing || changedRepoCount === 0}"), "Push must stay disabled without an open repo, while pushing, or with no changes");
  // Push hides entirely with no repo open (not just disabled) — a
  // plain workspace has nothing to push, so the button is gone.
  const pushAt = page.indexOf("onClick={openPushDialog}");
  assert.ok(pushAt > 0 && page.slice(Math.max(0, pushAt - 400), pushAt).includes("{openRepoState && ("), "the Push button must only render while a repo is open");
  assert.ok(page.includes("generateCommitMessage"), "the dialog must ask the AI for a commit message");
  assert.ok(page.includes("setTimeout(() => controller.abort(), 5000)"), "the AI message must give up after 5 seconds and keep the default");
  assert.ok(page.includes("messageEditedRef"), "typing in the box must win over a late AI reply");
  assert.ok(pushDialog.includes("push-commit-message"), "the message box must be a labelled, editable field");
  assert.ok(pushDialog.includes("t.editorPage.pushDialogTitle"), "the dialog must have a title");
  assert.ok(page.includes("t.common.cancel"), "the dialog must offer Cancel");
  assert.ok(page.includes("No changes to push"), "pushing with no changes must say so instead of calling GitHub");
  assert.ok(page.includes("never opened, so their content is not loaded yet"), "a changed file that was never opened must be skipped, not pushed empty");
  assert.ok(hook.includes("Auto-save on Run"), "Run must still save first — the push changes nothing about running");
});

test("opening a repo from GitHub loads its tree lazily (with a backup + restore)", () => {
  assert.ok(repo.includes("lp_open_repo"), "the editor must accept a repo handoff from the GitHub page");
  assert.ok(repo.includes("buildRepoWorkspaceTree"), "the tree must become workspace items (folders first, files lazy)");
  assert.ok(repo.includes("loadRepoTree"), "the editor must fetch the repo's tree itself");
  assert.ok(repo.includes("/api/github/repo-tree?owner="), "the tree must come from the server");
  assert.ok(repo.includes("/api/github/repo-file?owner="), "a file's content must load when it is opened");
  assert.ok(repo.includes("lp_open_repo_current"), "the open repo must survive a reload");
  assert.ok(repo.includes("lp_workspace_tree_backup"), "opening a repo must back the current workspace up first");
  assert.ok(repo.includes("restoreWorkspaceBackup"), "the backup must be restorable");
  assert.ok(menus.includes("t.editorPage.restoreWorkspace"), "File menu must offer Restore previous workspace");
  assert.ok(page.includes("hasWorkspaceBackup"), "Restore must only enable when a backup exists");
  assert.ok(repo.includes("too big for the browser's storage"), "an over-full workspace must warn once instead of crashing");
});

test("i18n: the new editor keys exist in English", () => {
  for (const key of [
    "menuFile", "menuEdit", "menuView", "menuRun", "menuTerminal",
    "menuSaveAll", "menuRename", "menuDelete", "menuDuplicate",
    "menuCopyPath", "menuFormat", "menuAutoSave", "menuUndo", "menuRedo",
    "menuFind", "menuClearTerminal", "menuFocusTerminal", "formatting",
    "formatFailed", "formatNotReady", "renamePlaceholder", "autoSaved",
    "statusPython",
    // Tab menu (right-click a bottom tab).
    "tabClose", "tabCloseOthers", "tabCloseToRight", "tabCloseSaved",
    "tabCloseAll", "tabCopyRelativePath", "tabRevealInExplorer",
    "tabKeepOpen", "tabPin", "tabUnpin",
    // v2: Run menu + AI panel + drag hints.
    "runWithoutDebugging", "aiButton", "aiPanelTitle", "aiPlaceholder",
    "aiWelcome", "aiClearChat", "aiGuideNote", "aiStepReading",
    "aiStepThinking", "aiStepDrafting", "aiThinkingLabel", "aiClosePanel",
    "aiDragHint",
    // AI panel ⋮ menu: history + settings (skills + BYOK).
    "aiMenuOptions", "aiMenuHistory", "aiMenuSettings", "aiBackToChat",
    "aiBackToEditor",
    "aiHistoryTitle", "aiHistoryEmpty", "aiNewChat", "aiSettingsTitle",
    "aiSkillsTitle", "aiSkillsBuiltin", "aiSkillsCustom", "aiSkillAdd",
    "aiSkillName", "aiSkillDescription", "aiSkillContent", "aiByokTitle",
    "aiByokProvider", "aiByokKey", "aiByokSave", "aiByokSaved",
    "aiByokRemove", "aiByokNote", "aiByokBaseUrl", "aiByokModel",
  ]) {
    assert.ok(en.includes(`${key}:`), `en.ts must define ${key}`);
  }
});

test("the menu bar shows an Exit button on the left and has no Delete button", () => {
  // A repo opened from the GitHub page must be escapable at a glance:
  // the menu bar shows an Exit button on the LEFT, right after the
  // File/Edit/Run menus — never beside the Explorer toggle. The repo
  // name itself moved out of the menu bar: it now lives at the top
  // of the Explorer file list, as a link to the repo on GitHub (see
  // the Explorer test below). Delete does NOT live here anymore:
  // it moved to the GitHub page's repo right-click menu, so a
  // permanent action never sits beside Push. Nothing shows for a
  // plain local workspace (the button is gated on openRepoState).
  assert.ok(page.includes("exitRepo"), "the Exit button must be wired up");
  assert.ok(page.includes("t.editorPage.exitRepo"), "the Exit button label must come from i18n");
  assert.ok(page.includes("t.editorPage.exitRepoTitle"), "the Exit button must carry its tooltip");
  assert.ok(page.includes("onClick={exitRepo}"), "the Exit button must call exitRepo");
  assert.ok(page.includes("left={"), "the Exit button must be passed as the menu bar's left slot");
  assert.ok(
    page.indexOf("onClick={exitRepo}") < page.indexOf("right={"),
    "the Exit button must sit before the right-side group in the menu bar"
  );
  assert.ok(menuBar.includes("left?: ReactNode"), "the menu bar must accept a left slot");
  assert.ok(
    menuBar.indexOf("left &&") < menuBar.indexOf("ml-auto"),
    "the menu bar must render the left slot before the right group"
  );
  assert.ok(!page.includes("deleteRepoButton"), "the editor must not have a Delete repo button anymore");
  assert.ok(!page.includes("/api/github/delete-repo"), "the editor must not call the delete route anymore");
});

test("the Explorer names the open repo above its file list", () => {
  // While a repo is open, the root line above the tree shows the
  // repo's owner/repo (branch in the tooltip) instead of the plain
  // workspace drop hint — the repo is always named at the top of
  // its files. The line stays the root drop target either way, and
  // the name keeps its case (no uppercase transform). The name is
  // a link that opens the repo on GitHub in a new tab.
  assert.ok(explorerPanel.includes("openRepoState.repo} (${openRepoState.branch})"), "the Explorer header must show repo + branch");
  assert.ok(explorerPanel.includes("https://github.com/${openRepoState.repo}"), "the Explorer repo name must link to the repo on GitHub");
  assert.ok(explorerPanel.includes("workspaceRootDropHint"), "a plain workspace must still show the drop hint");
});

test("the editor never holds the GitHub token in the browser", () => {
  // The token lives on the server (migration 006): repo open, lazy
  // file load and push all go through session-authenticated routes
  // with no token in the browser and no Authorization header.
  // (Delete lives on the GitHub page now — same rule there.)
  assert.ok(!page.includes('localStorage.getItem("lp_github_token")'), "the editor must never read a token from the browser");
  assert.ok(!page.includes("Authorization"), "no editor GitHub call may send a token");
  assert.ok(repo.includes("/api/github/repo-tree?owner="), "repo open must go through the session route");
  assert.ok(repo.includes("/api/github/repo-file?owner="), "lazy file load must go through the session route");
});

test("a repo opening shows a success toast with its name and file count", () => {
  // When the repo tree loads, the editor must pop a toast with the
  // repo name and how many files it has — the tree is what loads
  // here, file contents load lazily when each file is opened, so
  // the toast fires on the tree load, not on every file.
  assert.ok(page.includes("repoLoadedToast"), "the editor must render a repo-loaded toast");
  assert.ok(repo.includes("setRepoLoadedToast({ repo: data.repo, count: data.files.length })"), "the toast must fire when the tree load succeeds");
  assert.ok(repo.includes("setTimeout(() => setRepoLoadedToast(null), 5000)"), "the toast must dismiss itself after 5 seconds");
  assert.ok(page.includes('role="status"'), "the toast must be a status region");
  assert.ok(en.includes("repoLoadedToast: (repo, count)"), "en.ts must define the toast message");
  assert.ok(en.includes("loaded — ${count} file(s)"), "the toast must name the repo and count its files");
  // Refresh-restore: the tree comes back from localStorage, so the
  // fresh-open toast above never runs — the toast must fire here
  // too, or a reloaded repo never shows "loaded" at all.
  assert.ok(repo.includes("setRepoLoadedToast({ repo: restoredRepo.repo, count: repoFileCount })"), "the toast must also fire when a repo is restored after a refresh");
  assert.ok(repo.includes('p.type === "file" && p.sha'), "the restore toast must only count real repo files (they carry a sha), never a plain workspace");
});

test("a file loading from GitHub shows the tetromino loader until its content arrives", () => {
  // Clicking a repo file fetches its content — until then the editor
  // sat empty with no feedback at all. A centred loader now covers
  // the code area while the fetch is in flight, and hides when the
  // content lands (or the fetch fails).
  assert.ok(repo.includes("loadingFilePath"), "the workspace hook must track which file is fetching");
  assert.ok(repo.includes("setLoadingFilePath(path)"), "the loader state must turn on when the fetch starts");
  assert.ok(repo.includes("setLoadingFilePath(null)"), "the loader state must clear when the fetch settles");
  assert.ok(page.includes("loadingFile={loadingFilePath === activeFilePath}"), "only the file actually loading gets the loader");
  assert.ok(editorPanel.includes("loadingFile"), "the editor panel must take a loading flag");
  // Maalik, 2026-11-25: the spinner ring out, the tetromino
  // "Compose" loader in (dev.to #15) — four blocks sliding into
  // the composed logo. The ring must be gone entirely.
  assert.ok(editorPanel.includes("<TetrominoLoader />"), "the editor panel must render the tetromino loader while the file loads");
  assert.ok(!editorPanel.includes("animate-spin"), "the old spinner ring must be gone");
  assert.ok(!editorPanel.includes("rounded-full border-2"), "the old circular ring must be gone");
  assert.ok(editorPanel.includes("loading={null}"), "the Monaco editor must render no loading text of its own — the loader alone is the loading feedback");
  const loader = read("src/app/editor/components/TetrominoLoader.tsx");
  assert.ok(loader.includes('role="status"'), "the loader must be a status region");
  assert.ok(loader.includes('aria-label="Loading file"'), "the loader must be labelled for screen readers");
  assert.ok(loader.includes("box1") && loader.includes("box2") && loader.includes("box3") && loader.includes("box4"), "the loader must render all four tetromino pieces");
  const loaderCss = read("src/app/editor/components/TetrominoLoader.css");
  assert.ok(loaderCss.includes("@keyframes tetromino1") && loaderCss.includes("@keyframes tetromino4"), "the loader CSS must define the four piece animations");
  assert.ok(loaderCss.includes("width: 48px") && loaderCss.includes("height: 56px"), "the pieces must be scaled ~50% of the original 96x112px");
  // Colours inverted for the black editor background: the original
  // black sides (%23010101) are invisible on black — light sides,
  // dark top face instead.
  assert.ok(loaderCss.includes("%23f5f5f5"), "the block sides must be light so they read on black");
  assert.ok(loaderCss.includes("%230a0a0a"), "the top face must stay dark for the 3D depth");
  assert.ok(!loaderCss.includes("%23010101"), "the original black sides must be gone");
});

test("ThoughtLine: the working label is plain text, never a transparent-fill shimmer", () => {
  // 2026-11-21: on Maalik's screen the 'Thinking…' label was
  // invisible while the AI thought (only '4.3s' showed), while
  // 'Thought for 10.1s' showed fine once done. The working label
  // used a shimmer — transparent text fill over a
  // background-clip:text gradient — and when that gradient does
  // not paint, the text stays transparent: invisible. Plain text
  // with the breathing opacity is the whole effect now.
  const css = read("src/components/ThoughtLine.css");
  assert.ok(!css.includes("-webkit-text-fill-color: transparent"), "the working label must never use a transparent text fill");
  assert.ok(!css.includes("background-clip: text"), "the working label must never depend on a background-clip:text gradient");
  assert.ok(!css.includes("color-mix"), "the label must not depend on color-mix");
  assert.ok(css.includes(".thought-line__breath"), "the breath wrapper must still exist for the thinking pulse");
});

test("R2-M14/R2-L19: BYOK migration migrates the legacy shape per-entry, with a cross-tab guard", () => {
  // R2-M14: the migration reads the same normalised shape
  // readByokStore() returns — the old single-key { provider, key }
  // shape migrates instead of being silently deleted.
  assert.ok(aiHook.includes("const store = readByokStore();"), "migration must read the normalised store shape");
  assert.ok(!aiHook.includes("let migrated = true;"), "the all-or-nothing migrated flag must be gone");
  // R2-L19: each key is dropped from the local copy as soon as ITS
  // save succeeds — no whole-store removeItem on migration.
  assert.ok(aiHook.includes("savedIds.push(e.id)"), "each successful save must be tracked per entry");
  assert.ok(aiHook.includes("stripByokKey(x)"), "saved keys must be stripped per entry");
  assert.ok(!aiHook.includes("if (migrated) {"), "the all-or-nothing 'drop everything once all save' block must be gone");
  // R2-L19: a version stamp + storage event so a second tab cannot
  // re-persist deleted keys.
  assert.ok(aiHook.includes("byokVersionRef"), "the store must carry a version stamp ref");
  assert.ok(aiHook.includes("byokKnownIdsRef"), "the guard must track which entry ids this tab has seen");
  assert.ok(aiHook.includes('window.addEventListener("storage", onStorage)'), "a storage event must sync the store across tabs");
  assert.ok(aiHook.includes("writeByokStoreLocal(byokStore)"), "persists must go through the stamped writer");
});

test("R2-L18: lp_ai_chats retention is capped when persisting", () => {
  assert.ok(aiHook.includes("aiChats.slice(-20)"), "only the last 20 chats may be persisted");
});

test("AI Settings > Models: OpenRouter free-model search (search icon, add any free model)", () => {
  // Maalik, 2026-11-25: the OPENROUTER section lists only the 11
  // curated free models — the user must be able to add ANY free
  // OpenRouter model. A search icon in the OPENROUTER group header
  // opens a search over the live catalog (free only).
  assert.ok(aiCard.includes("toggleOrSearch"), "the settings card must wire the search toggle");
  assert.ok(aiCard.includes("aria-label={t.editorPage.aiModelsSearchPlaceholder}"), "the search icon must be labelled");
  assert.ok(aiCard.includes("orSearchOpen"), "the search panel must render when open");
  assert.ok(aiCard.includes("orSearchQuery"), "the search must have a query input");
  assert.ok(aiCard.includes("addOpenRouterModel"), "each result must have an Add action");
  assert.ok(aiCard.includes("aiModelsSearchAdded"), "a model already in the list must show as Added, not a second Add");
  // The browser cannot fetch openrouter.ai itself (the CSP
  // connect-src blocks it) — the hook calls the server route, which
  // proxies the public catalog and returns only the free chat models.
  assert.ok(aiHook.includes('fetch("/api/ai/openrouter-models"'), "the search must fetch the catalog through the server route, not openrouter.ai directly");
  assert.ok(!aiHook.includes("https://openrouter.ai/api/v1/models"), "the browser must never fetch the catalog directly — the CSP blocks it");
  assert.ok(orModelsRoute.includes("https://openrouter.ai/api/v1/models"), "the route must fetch the live OpenRouter catalog");
  assert.ok(orModelsRoute.includes('pricing?.prompt !== "0"'), "only models with a free prompt price may be listed");
  assert.ok(orModelsRoute.includes('pricing?.completion !== "0"'), "only models with a free completion price may be listed");
  assert.ok(orModelsRoute.includes('rec.id === "openrouter/free"'), "the router entry must not be offered as a model");
  assert.ok(orModelsRoute.includes('endsWith("->text")'), "only models that can answer a chat may be listed (Lyria audio is $0 but not chat)");
  assert.ok(orModelsRoute.includes('checkIpLimit(req, "or-models"'), "the route must be rate-limited per IP");
  assert.ok(aiHook.includes("lp_ai_added_models"), "added models must persist in this browser");
  assert.ok(aiHook.includes("isOpenRouterFreeModelId"), "added ids must be validated as :free slugs");
  // A user-added model joins the catalog and the OpenRouter group,
  // and the OpenRouter BYOK entry pays for it.
  assert.ok(aiHook.includes("addedModels.filter((m) => !BASE_AI_PANEL_MODELS.some((b) => b.key === m.key))"), "added models must join the panel catalog without duplicating a curated id");
  assert.ok(aiHook.includes('if (isOpenRouterFreeModelId(model)) return "openrouter";'), "a user-added :free id must resolve to the OpenRouter provider");
  // The server accepts a user-added free id ONLY with an OpenRouter
  // BYOK reference — never on the server key.
  assert.ok(aiLib.includes("isOpenRouterFreeModelId"), "lib/ai.ts must define the :free check");
  assert.ok(aiLib.includes('body.byok?.provider === "openrouter"'), "validation must require OpenRouter BYOK for a user-added free id");
  assert.ok(aiLib.includes("isUserFreeModel"), "the validation rule must gate on the user-added free id");
  assert.ok(aiLib.includes("isOpenRouterModelId(selected)"), "the OpenRouter leg must route a user-added free id");
  // i18n: the search strings exist in English.
  assert.ok(en.includes("aiModelsSearchPlaceholder"), "the search placeholder string must exist");
  assert.ok(en.includes("aiModelsSearchAdd"), "the Add string must exist");
  assert.ok(en.includes("aiModelsSearchNoResults"), "the no-results string must exist");
});

// --- Explorer search + sort (Maalik 2026-11-25) ---
// VS Code-style search box above the tree: live case-insensitive
// filter; folders first (A–Z), then files (A–Z), recursive — display
// only, the workspace data never changes.

const searchTree = () => [
  { value: "gen_seed.py", label: "gen_seed.py" },
  {
    value: "a",
    label: "a",
    children: [
      { value: "a/README.md", label: "README.md" },
      { value: "a/main.py", label: "main.py" },
      { value: "a/sub/deep.py", label: "sub/deep.py" },
    ],
  },
  { value: "Dockerfile", label: "Dockerfile" },
];

test("explorer search: file match keeps only the match, folder match keeps all its children", () => {
  const byName = filterExplorerTree(searchTree(), "main");
  assert.equal(byName.length, 1, "only folder a survives a 'main' query");
  assert.equal(byName[0].value, "a");
  assert.deepEqual(
    byName[0].children.map((c) => c.value),
    ["a/main.py"],
    "only the matching child stays"
  );
  const byFolder = filterExplorerTree(searchTree(), "a");
  // "a" is the folder name — the whole folder stays with all children.
  const folder = byFolder.find((it) => it.value === "a");
  assert.ok(folder, "folder a must match its own name");
  assert.equal(folder.children.length, 3, "a matching folder keeps all its children");
});

test("explorer search: parent folder of a match is shown, case-insensitive, empty query is the full tree", () => {
  const upper = filterExplorerTree(searchTree(), "MAIN");
  assert.equal(upper.length, 1, "matching must be case-insensitive");
  assert.equal(upper[0].value, "a", "the parent folder of the match is shown");
  const none = filterExplorerTree(searchTree(), "zzz-no-such-file");
  assert.deepEqual(none, [], "no match means an empty tree (empty state)");
  const items = searchTree();
  assert.equal(filterExplorerTree(items, ""), items, "an empty query returns the input unchanged");
  assert.equal(filterExplorerTree(items, "   "), items, "a blank query returns the input unchanged");
});

test("explorer sort: folders first (A–Z), then files (A–Z), case-insensitive, recursive", () => {
  const sorted = sortExplorerTree(searchTree());
  assert.deepEqual(
    sorted.map((it) => it.value),
    ["a", "Dockerfile", "gen_seed.py"],
    "folder a first, then files A–Z"
  );
  const mixed = sortExplorerTree([
    { value: "b.py", label: "b.py" },
    { value: "z", label: "z", children: [] },
    { value: "A.py", label: "A.py" },
    { value: "M", label: "M", children: [] },
  ]);
  assert.deepEqual(
    mixed.map((it) => it.value),
    ["M", "z", "A.py", "b.py"],
    "folders A–Z first, then files A–Z, case-insensitive"
  );
  const folder = sorted.find((it) => it.value === "a");
  assert.deepEqual(
    folder.children.map((c) => c.value),
    ["a/main.py", "a/README.md", "a/sub/deep.py"],
    "a folder's own files first (A–Z), then its sub-folder files"
  );
});

test("explorer sort: input is never mutated; filter + sort compose (folders first)", () => {
  const items = searchTree();
  const before = JSON.stringify(items);
  sortExplorerTree(items);
  filterExplorerTree(items, "py");
  assert.equal(JSON.stringify(items), before, "sort/filter must not mutate the tree");
  const composed = sortExplorerTree(filterExplorerTree(searchTree(), "py"));
  assert.deepEqual(
    composed.map((it) => it.value),
    ["a", "gen_seed.py"],
    "filtered results stay sorted folders-first"
  );
});

test("explorer search UI: search box, clear button, empty state, forced-open folders", () => {
  assert.ok(explorerPanel.includes("explorerSearchPlaceholder"), "the search input must use the i18n placeholder");
  assert.ok(explorerPanel.includes('type="text"'), "the search box must be a text input");
  assert.ok(explorerPanel.includes("setSearchQuery(\"\")"), "a clear button must reset the query");
  assert.ok(explorerPanel.includes("explorerSearchNoMatch"), "a no-match empty state must render while searching");
  assert.ok(
    explorerPanel.includes("visibleItems.map((item, i) => (item.children ? i : -1))"),
    "while searching, every visible folder must be forced open so a match is reachable"
  );
  assert.ok(explorerPanel.includes("sortExplorerTree(filterExplorerTree("), "filter and sort must compose on the displayed tree");
  assert.ok(explorerPanel.includes("handleVisibleToggle"), "folding must translate visible indices back to the page's indices");
});

// --- Extensions tab + viewers (Maalik 2026-11-25) ---

test("extensions catalog: six viewers covering all common formats of each kind", () => {
  const byId = Object.fromEntries(EDITOR_EXTENSIONS.map((e) => [e.id, e]));
  assert.deepEqual(Object.keys(byId).sort(), [
    "audio-player",
    "excel-viewer",
    "image-viewer",
    "pdf-viewer",
    "video-player",
    "word-viewer",
  ]);
  assert.deepEqual(byId["pdf-viewer"].formats, ["pdf"]);
  assert.deepEqual(byId["excel-viewer"].formats, ["xlsx", "xls", "csv"]);
  assert.deepEqual(byId["word-viewer"].formats, ["docx"]);
  for (const f of ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico", "avif"]) {
    assert.ok(byId["image-viewer"].formats.includes(f), `image viewer must handle .${f}`);
  }
  for (const f of ["mp4", "webm", "mkv", "mov", "avi", "m4v"]) {
    assert.ok(byId["video-player"].formats.includes(f), `video player must handle .${f}`);
  }
  for (const f of ["mp3", "wav", "ogg", "flac", "m4a", "aac"]) {
    assert.ok(byId["audio-player"].formats.includes(f), `audio player must handle .${f}`);
  }
});

test("extensions routing: viewer only when its extension is installed", () => {
  assert.equal(extensionForFile("x.png")?.id, "image-viewer");
  assert.equal(extensionForFile("x.PDF")?.id, "pdf-viewer", "matching must be case-insensitive");
  assert.equal(extensionForFile("sheet.xlsx")?.id, "excel-viewer");
  assert.equal(extensionForFile("doc.docx")?.id, "word-viewer");
  assert.equal(extensionForFile("clip.mkv")?.id, "video-player");
  assert.equal(extensionForFile("song.MP3")?.id, "audio-player");
  assert.equal(extensionForFile("main.py"), null, "code files have no viewer");
  assert.equal(viewerKindForFile("x.png", []), null, "not installed means the text editor, as today");
  assert.equal(viewerKindForFile("x.png", ["image-viewer"]), "image");
  assert.equal(viewerKindForFile("x.pdf", ["image-viewer"]), null, "the wrong extension installed must not route");
  assert.equal(viewerKindForFile("x.pdf", ["pdf-viewer"]), "pdf");
});

test("extensions install state: toggle is pure, no duplicates", () => {
  assert.deepEqual(toggleExtensionId([], "image-viewer", true), ["image-viewer"]);
  assert.deepEqual(toggleExtensionId(["image-viewer"], "image-viewer", true), ["image-viewer"], "installing twice must not duplicate");
  assert.deepEqual(toggleExtensionId(["image-viewer", "pdf-viewer"], "image-viewer", false), ["pdf-viewer"]);
  assert.deepEqual(toggleExtensionId([], "pdf-viewer", false), []);
});

// --- PDF / image / video viewer fix (Maalik 2026-11-25) ---
// The viewer was installed but PDFs/images/videos opened as raw
// binary garbage in Monaco: dropped files were text-decoded, the
// pane never routed them to a viewer, and the CSP blocked every
// PDF <embed> outright (object-src 'none'). The embed is gone now
// — pdf.js renders to canvas, so the CSP loosenings were reverted
// and the viewer grew the header toolbar (Ask AI included).

test("viewer fix: blob: URLs are stripped when a workspace is restored", () => {
  const items = [
    { path: "a.pdf", blobUrl: "blob:http://localhost/123" },
    { path: "b.png", blobUrl: "data:image/png;base64,AAA" },
    { path: "c.py" },
  ];
  const stripped = stripTransientBlobUrls(items);
  assert.equal(stripped[0].blobUrl, undefined, "a blob: URL dies on reload, so it must not be restored");
  assert.equal(stripped[1].blobUrl, "data:image/png;base64,AAA", "a data: URL is durable and must stay");
  assert.equal(stripped[2].blobUrl, undefined, "a file with no blob URL is untouched");
  assert.equal(items[0].blobUrl, "blob:http://localhost/123", "the input list must not be mutated");
});

test("viewer fix: dropped binary files keep raw bytes, PDF renders on pdf.js (no embed, CSP tight again), viewers fit the frame", () => {
  const config = read("next.config.ts");
  const fileViewer = read("src/app/editor/components/FileViewer.tsx");
  const types = read("src/app/editor/lib/editor-types.ts");
  assert.ok(config.includes('"object-src \'none\'"'), "with the <embed> gone (pdf.js renders to canvas), object-src goes back to 'none'");
  assert.ok(!config.includes('"object-src \'self\' blob:"'), "the embed's object-src loosening must be gone");
  assert.ok(config.includes('"frame-src https://www.youtube-nocookie.com https://www.youtube.com"'), "frame-src drops blob: (the embed's nested frame is gone); YouTube embeds keep their origins");
  assert.ok(config.includes('"img-src \'self\' data: blob:'), "dropped images still render from blob: URLs, so img-src keeps blob:");
  assert.ok(config.includes('"media-src \'self\' blob:"'), "dropped video/audio still render from blob: URLs, so media-src keeps blob:");
  assert.ok(!fileViewer.includes("<embed"), "no native PDF <embed> anymore — it cannot host the custom header");
  assert.ok(fileViewer.includes("PdfViewer"), "the PDF branch must render the pdf.js viewer");
  assert.ok(page.includes("extensionForFile(fileName)"), "the drop handler must check the viewer catalog before reading a file");
  assert.ok(page.includes("await file.arrayBuffer()"), "dropped binary files must be read as bytes, never text-decoded");
  assert.ok(page.includes("URL.createObjectURL"), "dropped binary bytes must live behind a blob: URL for the viewer");
  assert.ok(page.includes("blobUrl"), "the dropped item must carry its blob URL");
  assert.ok(!page.includes("newItems.forEach((it) => markRepoChanged(it.path))"), "binary drops must not be marked repo-changed (the push path only sends text)");
  assert.ok(types.includes("blobUrl?: string"), "WorkspaceItem must carry the dropped file's blob URL");
  assert.ok(editorPanel.includes("activeFile.blobUrl"), "the editor pane must route a dropped binary file to its viewer");
  assert.ok(editorPanel.includes('wrappingStrategy: "advanced"'), "Monaco must break unbroken binary lines anywhere, or they run past the frame");
  assert.ok(fileViewer.includes("onWheel"), "the image viewer must zoom on the mouse wheel");
  assert.ok(fileViewer.includes("onPointerDown"), "the image viewer must pan by dragging when zoomed");
  assert.ok(fileViewer.includes("imageFit"), "the image viewer must have a visible Fit button");
  assert.ok(fileViewer.includes('className="h-full w-full object-contain"'), "the video must fill the pane and resize with it (contain-fit)");
  const repoHook = read("src/app/editor/hooks/useWorkspaceRepo.ts");
  assert.ok(repoHook.includes("stripTransientBlobUrls"), "restoring a workspace must drop dead blob: URLs");
});

test("viewer fix i18n: image zoom keys exist in every language", () => {
  for (const lang of ["ar", "de", "en", "es", "fr", "hi-roman", "ja", "ko", "pt", "ru", "zh"]) {
    const file = read(`src/lib/i18n/${lang}.ts`);
    for (const key of ["imageZoomIn", "imageZoomOut", "imageFit"]) {
      assert.ok(file.includes(key), `${lang} must define ${key}`);
    }
  }
});

test("pdf.js viewer: header toolbar (all controls), Ask AI with the document as reference", () => {
  const pdfViewer = read("src/app/editor/components/PdfViewer.tsx");
  const fileViewer = read("src/app/editor/components/FileViewer.tsx");
  const editorPanel = read("src/app/editor/components/EditorPanel.tsx");
  const aiHook = read("src/app/editor/hooks/useEditorAi.ts");
  const aiPanel = read("src/app/editor/components/AiPanel.tsx");
  const page = read("src/app/editor/page.tsx");
  const index = read("src/lib/i18n/index.tsx");
  // pdf.js, lazily loaded, canvas + text layer, bundled worker.
  assert.ok(pdfViewer.includes('await import("pdfjs-dist")'), "pdf.js must load lazily, only when a PDF opens");
  assert.ok(pdfViewer.includes('"pdfjs-dist/build/pdf.worker.min.mjs"'), "the worker must be a bundled asset URL (same-origin, offline-safe)");
  assert.ok(pdfViewer.includes("import.meta.url"), "the worker URL must resolve against the module URL, so the build emits the worker as a real .mjs asset");
  assert.ok(!pdfViewer.includes('?url"'), "the ?url import must be gone — webpack bundled it as a JS chunk, so no worker asset was ever emitted and every PDF failed");
  assert.ok(pdfViewer.includes("new pdfjs.TextLayer"), "pages render with a text layer (selectable text for search/highlight/Ask AI)");
  assert.ok(pdfViewer.includes("page.render"), "pages render to canvas");
  assert.ok(!pdfViewer.includes("<embed"), "no native embed inside the viewer either");
  // Header controls — every one from Maalik's list, none removed.
  for (const key of ["pdfSidebar", "pdfSearch", "pdfHighlight", "pdfFilter", "pdfAddText", "pdfReadAloud", "pdfRotate", "pdfView", "pdfPrint", "pdfSave", "pdfAnnotate", "pdfMore", "pdfAskAi"]) {
    assert.ok(pdfViewer.includes(key), `the header must have ${key}`);
  }
  assert.ok(pdfViewer.includes("pdfPageOf"), "page navigation must show Page X of Y");
  assert.ok(pdfViewer.includes("pdfSinglePage") && pdfViewer.includes("pdfContinuous"), "the View menu must offer single page and continuous");
  assert.ok(pdfViewer.includes("pdfFitWidth"), "the View menu must offer fit to width");
  assert.ok(pdfViewer.includes("speechSynthesis"), "read aloud must use speechSynthesis (real, not a stub)");
  assert.ok(pdfViewer.includes("window.print()"), "print must open the browser print dialog");
  assert.ok(pdfViewer.includes("window.open(source.url"), "open in new tab must open the PDF URL");
  // Removed tools must have no keys and no buttons: translate,
  // sketching/draw, eraser are out by his order.
  assert.ok(!index.includes("pdfTranslate") && !index.includes("pdfDraw") && !index.includes("pdfEraser"), "translate/draw/eraser must not exist as toolbar keys");
  // Ask AI wiring: viewer -> FileViewer -> EditorPanel -> page ->
  // AI hook (document text as the request's reference) -> panel chip.
  assert.ok(pdfViewer.includes("onAskAi"), "the viewer must call onAskAi with the document text");
  assert.ok(pdfViewer.includes("Document: ${fileName}"), "the context must name the document it comes from");
  assert.ok(fileViewer.includes("onAskAi"), "FileViewer must pass Ask AI through to the PDF viewer");
  assert.ok(editorPanel.includes("onAskAi"), "EditorPanel must pass Ask AI through to FileViewer");
  assert.ok(page.includes("handlePdfAskAi"), "the page must attach the document and open the AI panel");
  assert.ok(page.includes("setAiDocContext"), "the page must set the document context");
  assert.ok(aiHook.includes("aiDocContext"), "the AI hook must hold the document context");
  assert.ok(aiHook.includes('aiDocContext ? aiDocContext.text : (activeFile?.content ?? "")'), "the AI request must use the document text as its reference instead of the (empty) PDF content");
  assert.ok(aiHook.includes("setAiDocContext(null)"), "the context must clear when the active file changes");
  assert.ok(aiPanel.includes("aiDocContext"), "the AI panel must show the attached document chip");
  assert.ok(aiPanel.includes("pdfDocContext"), "the chip must label the document");
});

test("pdf viewer i18n: toolbar keys exist in every language", () => {
  for (const lang of ["ar", "de", "en", "es", "fr", "hi-roman", "ja", "ko", "pt", "ru", "zh"]) {
    const file = read(`src/lib/i18n/${lang}.ts`);
    for (const key of ["pdfSidebar", "pdfSearch", "pdfHighlight", "pdfFilter", "pdfAddText", "pdfReadAloud", "pdfStopReading", "pdfRotate", "pdfView", "pdfPrint", "pdfSave", "pdfAnnotate", "pdfMore", "pdfAskAi", "pdfPageOf", "pdfSinglePage", "pdfContinuous", "pdfFitWidth", "pdfDocProperties", "pdfOpenNewTab", "pdfNoMatches", "pdfFilterHighlights", "pdfFilterTextNotes", "pdfDocContext"]) {
      assert.ok(file.includes(key), `${lang} must define ${key}`);
    }
  }
});

test("extensions UI + viewer wiring: tab, catalog, viewer pane, binary API", () => {
  const extensionsPanel = read("src/app/editor/components/ExtensionsPanel.tsx");
  const fileViewer = read("src/app/editor/components/FileViewer.tsx");
  const repoFileRoute = read("src/app/api/github/repo-file/route.ts");
  const githubLib = read("src/lib/github.ts");
  const pkg = JSON.parse(read("package.json"));
  assert.ok(explorerPanel.includes("extensionsTab"), "a third Extensions tab must sit next to Files/Modules");
  assert.ok(explorerPanel.includes("ExtensionsPanel"), "the tab must swap the panel body to the catalog");
  assert.ok(explorerPanel.includes('explorerView === "extensions"'), "the tab state must live in the panel, not the page");
  assert.ok(extensionsPanel.includes("extensionInstall"), "each card must have an Install button");
  assert.ok(extensionsPanel.includes("extensionInstalled"), "installed cards must show Installed");
  assert.ok(extensionsPanel.includes("extensionUninstall"), "installed cards must offer Uninstall");
  assert.ok(extensionsPanel.includes("lp_editor_extensions") || extensionsPanel.includes("useInstalledExtensions"), "install state must persist per-browser");
  assert.ok(editorPanel.includes("FileViewer"), "the editor pane must show the viewer for installed extensions");
  assert.ok(editorPanel.includes("viewerKindForFile"), "the viewer must route by file type and install state");
  assert.ok(editorPanel.includes("viewerLoadError"), "viewer errors must use the i18n string");
  assert.ok(fileViewer.includes('await import("xlsx")'), "Excel parsing must lazy-load SheetJS");
  assert.ok(fileViewer.includes('await import("mammoth")'), "Word parsing must lazy-load mammoth");
  assert.ok(fileViewer.includes("<img"), "images must render natively");
  assert.ok(fileViewer.includes("<video"), "video must render natively");
  assert.ok(fileViewer.includes("<audio"), "audio must render natively");
  assert.ok(fileViewer.includes("PdfViewer"), "PDF must render in the pdf.js viewer (custom header, zoom/search/pages)");
  assert.ok(!fileViewer.includes("<embed"), "the native <embed> is gone — it cannot host the custom header");
  assert.ok(pkg.dependencies["pdfjs-dist"], "pdfjs-dist must be a dependency");
  assert.ok(pkg.dependencies.xlsx, "xlsx must be a dependency");
  assert.ok(pkg.dependencies.mammoth, "mammoth must be a dependency");
  assert.ok(repoFileRoute.includes('binary") === "1"'), "the repo-file API must serve raw bytes in binary mode");
  assert.ok(repoFileRoute.includes("getRepoFileBytes"), "binary mode must use the shared blob fetch");
  assert.ok(githubLib.includes("export async function getRepoFileBytes"), "the lib must expose a bytes fetch (same SHA/size checks as text)");
  assert.ok(repo.includes("viewerKindForFile(path, readInstalledExtensions())"), "the lazy text loader must skip binary viewer files when installed");
});

test("explorer i18n: search + extensions keys exist in every language", () => {
  for (const lang of ["ar", "de", "en", "es", "fr", "hi-roman", "ja", "ko", "pt", "ru", "zh"]) {
    const file = read(`src/lib/i18n/${lang}.ts`);
    for (const key of ["explorerSearchPlaceholder", "explorerSearchNoMatch", "extensionsTab", "extensionInstall", "extensionInstalled", "extensionUninstall", "viewerLoadError"]) {
      assert.ok(file.includes(key), `${lang} must define ${key}`);
    }
  }
});

// PDF preview fix (2026-11-25, manifest-120): the c21312c viewer
// shipped two live failures on the same dropped PDF — the viewer
// showed "Could not preview this file." (the pdf.js worker never
// loaded AND the CSP blocked fetch(blob:)), and after a hard
// refresh the PDF opened blank in Monaco (the dropped bytes were
// never persisted). The AI panel also hid a missing BYOK key
// behind "Something went wrong". These checks pin the fixes.

test("pdf fix: pdf.js worker loads as a real same-origin asset (no ?url default-export guess)", () => {
  const pdfViewer = read("src/app/editor/components/PdfViewer.tsx");
  assert.ok(
    pdfViewer.includes('"pdfjs-dist/build/pdf.worker.min.mjs"') && pdfViewer.includes("import.meta.url"),
    "the worker must resolve through the documented webpack asset pattern (new URL(path, import.meta.url)), so the build emits a real .mjs file",
  );
  assert.ok(!pdfViewer.includes('?url")'), "the ?url import must be gone — webpack bundled it as a JS chunk, so no worker asset was ever emitted");
  assert.ok(!pdfViewer.includes("= worker.default"), "worker.default must be gone — the worker module has a named export only, so .default was undefined and pdf.js threw inside the load");
});

test("pdf fix: CSP connect-src allows blob: (the viewer fetches the file's bytes)", () => {
  const config = read("next.config.ts");
  assert.ok(
    config.includes('"connect-src \'self\' blob:'),
    "fetch(blob:) is governed by connect-src, not img/media-src — without blob: here every dropped/repo PDF is CSP-blocked and fails with 'Could not preview this file.'",
  );
  assert.ok(config.includes('"object-src \'none\'"'), "object-src stays 'none' — the embed is still gone");
});

test("pdf fix: dropped file bytes persist in IndexedDB and rehydrate after a hard refresh", () => {
  const dropped = read("src/app/editor/lib/dropped-files.ts");
  assert.ok(dropped.includes("lp-dropped-files"), "the store must be the editor's own IndexedDB database");
  assert.ok(dropped.includes("export async function saveDroppedFile"), "drops must save their bytes");
  assert.ok(dropped.includes("export async function loadDroppedFile"), "a restored file must load its bytes back");
  assert.ok(dropped.includes("export async function deleteDroppedFile"), "removing a dropped file must drop its bytes too");
  assert.ok(page.includes("saveDroppedFile"), "the drop handler must persist the bytes at drop time");
  assert.ok(page.includes("deleteDroppedFile"), "deleting a dropped file must clear its persisted bytes");
  const editorPanel = read("src/app/editor/components/EditorPanel.tsx");
  assert.ok(editorPanel.includes("loadDroppedFile"), "the pane must rehydrate dropped bytes on open");
  assert.ok(editorPanel.includes("rehydratedUrl"), "the viewer must use the rehydrated blob URL when the stored one died on reload");
  assert.ok(editorPanel.includes("rehydrating"), "while the bytes load, the pane must show the loader, not a blank editor");
});

test("pdf fix: the viewer shows the tetromino loader until the first page has actually painted", () => {
  const pdfViewer = read("src/app/editor/components/PdfViewer.tsx");
  assert.ok(pdfViewer.includes("renderedOnce"), "the viewer must track whether a page has painted");
  assert.ok(pdfViewer.includes("onPageRendered"), "a page must report back once its canvas has painted");
  assert.ok(pdfViewer.includes("!renderedOnce"), "the loader overlay must stay up until the first paint, not just until the document object exists");
  const fileViewer = read("src/app/editor/components/FileViewer.tsx");
  assert.ok(fileViewer.includes("TetrominoLoader"), "image/video viewers must use the same tetromino loader while their content loads");
  assert.ok(fileViewer.includes("onLoad"), "the image viewer must clear its loader on load");
  assert.ok(fileViewer.includes("onLoadedData"), "the video player must clear its loader when the first frame is ready");
  assert.ok(fileViewer.includes("loadErrorText"), "a viewer whose source fails must show the load error, not a blank pane or a stuck loader");
});

test("ai fix: the client shows the server's own error instead of the generic one (missing BYOK key must say so)", () => {
  const aiHook = read("src/app/editor/hooks/useEditorAi.ts");
  // The 503 branch already surfaced the server message; a 400
  // (no saved BYOK key for the picked provider) fell through to
  // "Something went wrong", so the user could never tell a missing
  // key from a broken call.
  assert.ok(aiHook.includes("serverError"), "a non-OK reply must surface the server's error string when it has one");
  assert.ok(aiHook.includes("(data as { error: string }).error"), "the server's error field must be the string shown (e.g. the 400 'No saved key for this provider' from a missing BYOK key)");
  assert.ok(aiHook.includes("t.common.genericError"), "the generic error stays as the fallback when the server sent no message");
});

test("per-user editor storage: keys are namespaced by the signed-in user, and a fresh user sees nothing of the first", () => {
  // The helpers touch the global localStorage lazily, so a stub
  // installed here (before any call) is what they see.
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => {
      store.set(k, String(v));
    },
    removeItem: (k) => {
      store.delete(k);
    },
  };
  try {
    setEditorStorageScope("alice@example.com");
    assert.equal(editorStorageScope(), "alice@example.com");
    assert.equal(scopedStorageKey("lp_workspace_tree"), "lp_workspace_tree::alice@example.com");
    writeLocalJson("lp_workspace_tree", [{ path: "main.py" }]);
    assert.equal(
      store.get("lp_workspace_tree::alice@example.com"),
      JSON.stringify([{ path: "main.py" }])
    );
    assert.equal(store.has("lp_workspace_tree"), false, "no bare key may ever be written");
    // Bob, same browser: nothing of Alice's.
    setEditorStorageScope("bob@example.com");
    assert.deepEqual(readLocalJson("lp_workspace_tree", []), []);
    assert.equal(readScopedRaw("lp_workspace_tree"), null);
    // Alice's data is still there under her scope.
    setEditorStorageScope("alice@example.com");
    assert.deepEqual(readLocalJson("lp_workspace_tree", []), [{ path: "main.py" }]);
    // Guest sees nothing either.
    setEditorStorageScope("guest");
    assert.deepEqual(readLocalJson("lp_workspace_tree", []), []);
  } finally {
    delete globalThis.localStorage;
    setEditorStorageScope("guest");
  }
});

test("per-user editor storage: a legacy bare key is adopted once into the signed-in user's scope, never into guest", () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => {
      store.set(k, String(v));
    },
    removeItem: (k) => {
      store.delete(k);
    },
  };
  try {
    store.set("lp_workspace_tree", JSON.stringify([{ path: "main.py" }]));
    setEditorStorageScope("guest");
    assert.deepEqual(readLocalJson("lp_workspace_tree", []), []);
    assert.equal(store.has("lp_workspace_tree"), true, "guest must not adopt");
    setEditorStorageScope("alice@example.com");
    assert.deepEqual(readLocalJson("lp_workspace_tree", []), [{ path: "main.py" }]);
    assert.equal(store.has("lp_workspace_tree"), false, "adoption removes the bare key");
    assert.equal(store.has("lp_workspace_tree::alice@example.com"), true);
  } finally {
    delete globalThis.localStorage;
    setEditorStorageScope("guest");
  }
});

test("per-user editor: the default workspace is a generic welcome seed, never a user's files", () => {
  const utils = read("src/app/editor/lib/editor-utils.ts");
  assert.ok(
    !utils.includes("Python_Unit_3_Assignment_Answers"),
    "the seed must not contain a user's files"
  );
  assert.ok(
    utils.includes("Welcome to LP Python IDE"),
    "the seed stays the generic welcome file"
  );
});

test("per-user editor: workspace restore, AI restore and repo writes all wait for the session scope", () => {
  const repo = read("src/app/editor/hooks/useWorkspaceRepo.ts");
  assert.ok(
    repo.includes("await ensureEditorScope()"),
    "the workspace restore must resolve the scope first"
  );
  assert.ok(
    repo.includes('writeLocalJson("lp_open_repo_current"'),
    "the open repo must persist under the user's scope"
  );
  assert.ok(
    repo.includes('readScopedRaw("lp_workspace_tree")'),
    "the tree must restore from the user's scope"
  );
  assert.ok(
    repo.includes('readScopedRaw("lp_workspace_tree_backup")'),
    "the backup must restore from the user's scope"
  );
  const ai = read("src/app/editor/hooks/useEditorAi.ts");
  assert.ok(
    ai.includes("aiScopeReady"),
    "the AI hook must gate its server migration on the per-user restore"
  );
  assert.ok(
    ai.includes('writeLocalJson("lp_ai_chats"'),
    "AI chats must persist under the user's scope"
  );
  assert.ok(
    ai.includes('writeLocalJson("lp_ai_current_chat"'),
    "the current chat must persist under the user's scope"
  );
  assert.ok(
    ai.includes('writeLocalJson("lp_ai_byok"') || ai.includes('writeScopedRaw("lp_ai_byok"'),
    "the BYOK store must persist under the user's scope"
  );
  const dropped = read("src/app/editor/lib/dropped-files.ts");
  assert.ok(
    dropped.includes("droppedKey(path)"),
    "dropped bytes must be keyed per user"
  );
  const page = read("src/app/editor/page.tsx");
  assert.ok(
    page.includes("setEditorScope(user.email)"),
    "the page must set the extensions scope from the session"
  );
  assert.ok(
    page.includes('writeLocalJson("lp_workspace_tree"'),
    "the page's workspace writes must use the scoped helper"
  );
  const extensions = read("src/app/editor/lib/editor-extensions.ts");
  assert.ok(
    extensions.includes("openRepoKey()"),
    "the open-repo read must use the scoped key"
  );
  const panel = read("src/app/editor/components/EditorPanel.tsx");
  assert.ok(
    panel.includes("await ensureEditorScope()"),
    "the viewer must wait for the scope before rehydrating dropped bytes"
  );
});

test("per-user editor: the open-repo read is scoped once the page sets the scope", () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => {
      store.set(k, String(v));
    },
    removeItem: (k) => {
      store.delete(k);
    },
  };
  try {
    store.set(
      "lp_open_repo_current",
      JSON.stringify({ repo: "someone/else", branch: "main" })
    );
    // Before the scope is set, the legacy bare key is read (the
    // viewer only uses it for files carrying a sha).
    assert.deepEqual(readOpenRepo(), { repo: "someone/else", branch: "main" });
    // After the page sets the scope, the legacy key is invisible.
    setEditorScope("bob@example.com");
    assert.equal(readOpenRepo(), null);
    store.set(
      "lp_open_repo_current::bob@example.com",
      JSON.stringify({ repo: "bob/repo", branch: "main" })
    );
    assert.deepEqual(readOpenRepo(), { repo: "bob/repo", branch: "main" });
  } finally {
    delete globalThis.localStorage;
  }
});
