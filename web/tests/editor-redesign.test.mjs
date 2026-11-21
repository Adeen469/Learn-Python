import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

// VS Code-style editor redesign (2026-11-21, Maalik's brief): a menu-bar
// header (File/Edit/Run — View and Terminal menus were removed in v2),
// right-click / long-press context menus for files + folders, auto-save,
// Format (black), rename / delete / duplicate / copy-path, resizable
// panels (drag + double-click reset), a status bar, draggable dock
// zones (Explorer / Terminal / AI move between left / right / bottom),
// and an AI panel (PromptBar + ThoughtLine, guide mode — a real AI
// assistant with no restrictions, plus a ⋮ menu for chat history and
// AI settings: skills + BYOK). Static source checks — the suite
// mirrors the source so a drift fails loudly instead of shipping a
// half-wired editor.

const page = read("src/app/editor/page.tsx");
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
const aiSkillsGen = read("src/lib/ai-skills.generated.ts");
const aiSkillsMeta = read("src/lib/ai-skills-meta.generated.ts");
const en = read("src/lib/i18n/en.ts");
const modules = read("src/components/ModulesPanel.tsx");

test("menu bar: File/Edit/Run only, Run = run without debugging + stop (wabepp)", () => {
  assert.ok(page.includes("<EditorMenuBar"), "page must render the menu bar");
  assert.ok(page.includes('id: "file"'), "File menu must exist");
  assert.ok(page.includes('id: "edit"'), "Edit menu must exist");
  assert.ok(page.includes('id: "run"'), "Run menu must exist");
  assert.ok(!page.includes('id: "view"'), "View menu must be gone (panels move by drag, not a menu)");
  assert.ok(!page.includes('id: "terminal"'), "Terminal menu must be gone (Clear lives in the Terminal panel header)");
  assert.ok(page.includes("runWithoutDebugging"), "Run menu must offer Run Without Debugging");
  assert.ok(page.includes('"Ctrl+F5"'), "Run Without Debugging must carry its Ctrl+F5 label");
  assert.ok(page.includes('id: "stop"'), "Run menu must offer Stop");
  assert.ok(page.includes("action: stopRunning"), "Run menu Stop must stop the run");
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
    assert.ok(!page.includes(banned), `web menu must not contain "${banned}" (app-only)`);
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
  assert.ok(page.includes('switchTab("files")'), "Explorer panel must offer the Files tab");
  assert.ok(page.includes('switchTab("modules")'), "Explorer panel must offer the Modules tab");
  // Stop moved to the Editor panel header (only while a run is live).
  assert.ok(page.includes("{isRunning && ("), "editor header must show Stop only while running");
  assert.ok(page.includes("onClick={stopRunning}"), "editor header Stop must stop the run");
});

test("context menu: component exists, wired to rows + root, web-only items", () => {
  assert.ok(page.includes("<EditorContextMenu"), "page must render the context menu");
  assert.ok(page.includes("onRowContextMenu"), "tree rows must open the context menu");
  assert.ok(branched.includes("onRowContextMenu"), "BranchedMenu must support onRowContextMenu");
  assert.ok(page.includes("openRootContextMenu"), "empty explorer area must open the root menu");
  assert.ok(contextMenu.includes("fixed inset-0 z-40"), "menu must have an overlay to close on outside tap");
  // Items present for files/folders.
  for (const key of ["menuRename", "menuDuplicate", "menuCopyPath", "menuDelete", "menuFormat"]) {
    assert.ok(page.includes(key), `context menu / file menu must use ${key}`);
  }
  // wabepp: OS-only items must NOT be in the website context menu.
  assert.ok(!contextMenu.includes("Reveal in File Explorer"), "context menu must not contain OS-only items");
  assert.ok(!page.includes("Reveal in File Explorer"), "page must not contain OS-only items");
});

test("auto-save: on by default, persisted, debounced silent save", () => {
  assert.ok(page.includes("lp_editor_autosave"), "auto-save preference must persist");
  assert.ok(page.includes("saveFileSilently"), "auto-save must use a silent save (no terminal spam)");
  assert.ok(page.includes("1200"), "auto-save must debounce (~1.2s)");
  assert.ok(page.includes("menuAutoSave"), "auto-save must be toggleable from the File menu");
});

test("format: black via micropip, installed once per session", () => {
  assert.ok(page.includes("formatCurrentFile"), "format action must exist");
  assert.ok(page.includes("black.format_str"), "format must use black");
  assert.ok(page.includes("micropip"), "black must install via micropip");
  assert.ok(page.includes("blackReadyRef"), "black must install once per session");
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
  assert.ok(page.includes("lp_editor_bottom_h"), "bottom-zone height must persist");
  assert.ok(page.includes("? v : 150"), "bottom zone must default to 150px so the editor stays tall on laptop screens");
  assert.ok(page.includes("if (v === 220) return 150"), "a saved 220 (old default) must migrate to the new 150 default");
  assert.ok(page.includes("editorRef.current?.layout()"), "Monaco must be re-laid-out when the dock geometry changes");
  assert.ok(page.includes("var(--explorer-w)"), "explorer width must come from a CSS var (desktop only)");
  assert.ok(page.includes("var(--terminal-w)"), "terminal width must come from a CSS var (desktop only)");
  assert.ok(page.includes("showExplorer"), "explorer must be toggleable (panel close)");
  assert.ok(page.includes("showTerminal"), "terminal must be toggleable (panel close)");
});

test("draggable dock: panels move between zones (AI is side-only, Terminal/Explorer go anywhere)", () => {
  assert.ok(page.includes("<EditorPanelHeader"), "panels must render the draggable header");
  assert.ok(panelHeader.includes("draggable"), "panel header must be draggable");
  assert.ok(panelHeader.includes("lp-panel:"), "panel drag must carry its id in the drag data");
  assert.ok(page.includes("lp_editor_panel_zones"), "panel zones must persist");
  assert.ok(page.includes("movePanelToZone"), "dropping a panel must move it to the zone");
  assert.ok(page.includes("renderDockPanel"), "zones must render panels through renderDockPanel");
  assert.ok(page.includes("Dock left"), "left drop zone must exist while dragging");
  assert.ok(page.includes("Dock right"), "right drop zone must exist while dragging");
  assert.ok(page.includes("Dock bottom"), "bottom drop zone must exist while dragging");
  assert.ok(page.includes('const [showAi, setShowAi] = useState(true)'), "AI panel must be visible by default");
  // AI is a side panel only — it never docks at the bottom.
  assert.ok(page.includes('if (id === "ai" && zone === "bottom") return;'), "AI must refuse the bottom zone");
  assert.ok(page.includes('draggingPanel !== "ai"'), "bottom drop zone must hide while dragging AI");
  assert.ok(page.includes('if (z.ai === "bottom") z.ai = "right";'), "a saved AI bottom zone must reset to the right side");
  // Terminal opens at the bottom by default (fresh users).
  assert.ok(page.includes('terminal: "bottom"'), "Terminal must open at the bottom by default");
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
  assert.ok(page.includes("flex min-h-full flex-col justify-center"), "AI empty state must be vertically centred");
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
  assert.ok(page.includes("flex-1 overflow-auto p-2"), "file tree must scroll inside its panel");
  assert.ok(page.includes("overflow-auto whitespace-pre-wrap"), "terminal output must scroll inside its panel");
  assert.ok(page.includes("flex-1 min-h-0 overflow-y-auto p-3"), "AI messages must scroll inside their panel");
  assert.ok(modules.includes("flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto"), "Modules tab must scroll inside one div");
});

test("AI panel: PromptBar + ThoughtLine wired to guide mode (a real AI, no restrictions)", () => {
  assert.ok(page.includes("<PromptBar"), "AI panel must render the PromptBar");
  assert.ok(page.includes("<ThoughtLine"), "AI panel must render the ThoughtLine while thinking");
  // The ThoughtLine must stay mounted while messages exist: if it
  // unmounted the moment thinking stopped, its settle effect would
  // never run and the "Thought for Xs" line would never appear.
  assert.ok(
    page.includes("aiMessages.length > 0"),
    "ThoughtLine must stay mounted while messages exist so it can settle"
  );
  assert.ok(page.includes("sendAiMessage"), "AI panel must send through sendAiMessage");
  assert.ok(page.includes('mode: "guide"'), "AI panel must ask in guide mode (a real AI assistant)");
  assert.ok(page.includes("AI_PANEL_MODELS"), "AI panel must offer the model picker");
  assert.ok(page.includes('defaultModel="gemini-2.5-pro"'), "Gemini 2.5 Pro must be the default model (best of the four default selector models, BYOK v2)");
  // The model menu must scroll: 23 models no longer fit on screen.
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
  assert.ok(page.includes('sparkColor="#8e8e8e"'), "PromptBar must use Maalik's spark colour");
  assert.ok(page.includes("onSend={sendAiMessage}"), "PromptBar send must go to the guide handler");
  assert.ok(page.includes("onStop={stopAi}"), "PromptBar stop must abort the in-flight request");
  assert.ok(page.includes("aiButton"), "menu bar must carry the AI toggle button");
  assert.ok(page.includes('if (id === "ai") return aiPanel'), "the AI panel must dock in the side zones");
  assert.ok(page.includes("clearAiChat"), "AI panel must offer Clear chat");
  // Every model Maalik asked for (Gemini + Groq + Anthropic + OpenAI
  // + OpenRouter) in the picker, plus the backend allowlist.
  for (const id of [
    "gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-pro",
    "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite",
    "openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b", "qwen/qwen3.8-27b",
    "claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-5-5",
    "gpt-5.5", "gpt-5.4-mini", "gpt-4o", "gpt-4o-mini",
    "openai/gpt-5.5", "anthropic/claude-sonnet-5-5", "google/gemini-2.5-flash",
    "meta-llama/llama-3.3-70b-instruct",
  ]) {
    assert.ok(page.includes(`"${id}"`), `AI picker must list ${id}`);
    assert.ok(aiLib.includes(`"${id}"`), `backend allowlist must include ${id}`);
  }
  // The vendored components carry Maalik's defaults.
  assert.ok(promptBar.includes("sparkColor = '#8e8e8e'"), "PromptBar default spark colour must be #8e8e8e");
  assert.ok(thoughtLine.includes("fontSize = 15"), "ThoughtLine default font size must be 15");
  // The "Thought for Xs" line must start minimised and small, sized
  // to the app — the user taps the header to expand it.
  assert.ok(page.includes("fontSize={13}"), "AI panel must size the ThoughtLine to the app (13px)");
  assert.ok(page.includes("defaultOpen={false}"), "ThoughtLine must start minimised while thinking");
  assert.ok(thoughtLine.includes("defaultOpen"), "ThoughtLine must support a defaultOpen prop");
  assert.ok(thoughtLine.includes("useState(defaultOpen)"), "the trace must start in the defaultOpen state");
  // Guide mode itself: the backend prompt is a real AI assistant —
  // it writes full code when asked, with no restrictions.
  assert.ok(aiLib.includes('case "guide"'), "backend must have a guide mode");
  assert.ok(
    aiLib.includes("You are a real AI assistant"),
    "guide prompt must be a real AI assistant"
  );
  assert.ok(
    aiLib.includes("Write the full code when they ask for it"),
    "guide prompt must write the full code when asked"
  );
  assert.ok(
    !aiLib.includes("NEVER write or generate the code solution"),
    "guide prompt must not forbid generating code any more"
  );
});

test("AI panel ⋮ menu: chat history + AI settings card (skills + BYOK)", () => {
  // The ⋮ menu in the AI panel header.
  assert.ok(page.includes("MoreVertical"), "AI panel header must carry a ⋮ menu button");
  assert.ok(page.includes("aiMenuHistory"), "⋮ menu must offer Chat History");
  assert.ok(page.includes("aiMenuSettings"), "⋮ menu must offer AI Settings");
  assert.ok(page.includes("aiView"), "AI panel must switch between chat/history views");
  assert.ok(page.includes('aiView === "history"'), "history view must exist");
  assert.ok(page.includes("aiBackToChat"), "history view must offer a way back to chat");
  // AI Settings is NOT a panel view any more — it opens as a separate
  // card in the code editor's place (not movable, not a dock panel).
  assert.ok(!page.includes('aiView === "settings"'), "settings must not be an AI panel view any more");
  assert.ok(page.includes("aiSettingsCard"), "the settings card must exist");
  assert.ok(page.includes('centreView === "ai-settings"'), "settings must open as a card in the centre");
  assert.ok(page.includes('setCentreView("ai-settings")'), "⋮ menu AI Settings must open the centre card");
  assert.ok(page.includes("aiBackToEditor"), "the settings card must offer a way back to the editor");
  assert.ok(page.includes("max-w-2xl"), "the settings card content must stay readable on wide screens");
  // Settings is a drill-down menu, not a dropdown: the card first
  // lists Skills / BYOK, tapping a row opens that sub-page with a
  // breadcrumb ("AI Settings > Skills"), and the back arrow returns
  // to the menu.
  assert.ok(page.includes("settingsSection"), "the settings card must navigate between menu / skills / byok");
  assert.ok(page.includes('setSettingsSection("skills")'), "the menu must open the Skills sub-page");
  assert.ok(page.includes('setSettingsSection("byok")'), "the menu must open the BYOK sub-page");
  assert.ok(page.includes('setSettingsSection("menu")'), "a sub-page must offer a way back to the menu");
  assert.ok(page.includes('settingsSection === "skills"'), "the skills list must render only on its sub-page");
  assert.ok(page.includes('settingsSection === "byok"'), "the BYOK form must render only on its sub-page");
  assert.ok(page.includes('{" > "}'), "a sub-page must show the breadcrumb separator");
  assert.ok(page.includes("ChevronRight"), "menu rows must show a chevron to the sub-page");
  assert.ok(!page.includes("showSkills"), "the old dropdown toggle must be gone");
  // Chat history: persisted in this browser, restorable, deletable.
  assert.ok(page.includes("lp_ai_chats"), "past chats must persist in localStorage");
  assert.ok(page.includes("lp_ai_current_chat"), "the in-progress chat must survive a reload");
  assert.ok(page.includes("saveCurrentChatToHistory"), "clearing / switching must save the chat first");
  assert.ok(page.includes("loadAiChat"), "a saved chat must be restorable");
  assert.ok(page.includes("deleteAiChat"), "a saved chat must be deletable");
  assert.ok(page.includes("startNewChat"), "history must offer a new chat");
  // Skills: built-in list from the generated meta module (content-free,
  // so the skill bodies never ship to the browser), custom skills the
  // user adds, toggles for both.
  assert.ok(page.includes("BUILTIN_AI_SKILL_META"), "settings must list the built-in skills from the meta module");
  assert.ok(page.includes("lp_ai_custom_skills"), "custom skills must persist in localStorage");
  assert.ok(page.includes("lp_ai_active_skills"), "active skill ids must persist in localStorage");
  assert.ok(page.includes("toggleSkill"), "each skill must be togglable");
  assert.ok(page.includes("addCustomSkill"), "the user must be able to add a skill");
  assert.ok(page.includes("deleteCustomSkill"), "a custom skill must be deletable");
  assert.ok(page.includes("aiSkillName"), "add-skill form must ask for a name");
  assert.ok(page.includes("aiSkillContent"), "add-skill form must ask for instructions");
  // BYOK: provider + key, stored in this browser only, sent per request.
  // Six providers now: Gemini, Groq, Anthropic, OpenAI, OpenRouter and
  // a custom OpenAI-compatible endpoint (base URL + model + key).
  assert.ok(page.includes("lp_ai_byok"), "the BYOK key must persist in localStorage");
  assert.ok(page.includes("byokProvider"), "BYOK must offer a provider choice");
  for (const provider of ["gemini", "groq", "anthropic", "openai", "openrouter", "custom"]) {
    assert.ok(page.includes(`value="${provider}"`), `BYOK must offer ${provider}`);
  }
  assert.ok(page.includes("byokBaseUrl"), "custom BYOK must ask for a base URL");
  assert.ok(page.includes("byokModel"), "custom BYOK must ask for a model");
  assert.ok(page.includes("aiByokBaseUrl"), "custom BYOK must label the base URL field");
  assert.ok(page.includes("aiByokModel"), "custom BYOK must label the model field");
  assert.ok(page.includes("saveByok"), "BYOK must be saveable");
  assert.ok(page.includes("removeByok"), "BYOK must be removable");
  assert.ok(page.includes('type="password"'), "the BYOK key field must be a password field");
  // A 503 must show the server's own reason (no keys vs. every
  // provider failed) — the old message blamed the keys for every 503,
  // even when keys were configured and the calls just failed.
  assert.ok(
    page.includes("serverError ?? t.editorPage.aiUnavailableMessage"),
    "a 503 must show the server's own reason, not the generic keys message"
  );
  // The request must carry skills + BYOK to the API.
  assert.ok(page.includes("skillIds: activeSkillIds"), "the request must send the active built-in skill ids");
  assert.ok(page.includes("skills: customSkills"), "the request must send the active custom skills");
  assert.ok(page.includes("byok"), "the request must send the BYOK key when saved");
  // The server resolves built-in ids (default: ponytail) and applies
  // BYOK in-memory only — never storing or logging the key.
  assert.ok(aiRoute.includes("BUILTIN_AI_SKILLS"), "route must resolve built-in skill ids server-side");
  assert.ok(aiRoute.includes("DEFAULT_ACTIVE_SKILL_IDS"), "route must default to ponytail when no ids are sent");
  assert.ok(aiRoute.includes("body.mode === \"guide\""), "skills must apply to guide mode only");
  assert.ok(aiRoute.includes("config.geminiKey = body.byok.key"), "route must use a Gemini BYOK key when given");
  assert.ok(aiRoute.includes("config.groqKey = body.byok.key"), "route must use a Groq BYOK key when given");
  assert.ok(aiRoute.includes("config.anthropicKey = body.byok.key"), "route must use an Anthropic BYOK key when given");
  assert.ok(aiRoute.includes("config.openaiKey = body.byok.key"), "route must use an OpenAI BYOK key when given");
  assert.ok(aiRoute.includes("config.openrouterKey = body.byok.key"), "route must use an OpenRouter BYOK key when given");
  assert.ok(aiRoute.includes("config.customKey = body.byok.key"), "route must use a custom BYOK key when given");
  assert.ok(aiRoute.includes("config.customBaseUrl = body.byok.baseUrl"), "route must use a custom BYOK base URL when given");
  assert.ok(aiRoute.includes("config.customModel = body.byok.model"), "route must use a custom BYOK model when given");
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
    page.includes("Find the bug in this code, explain why it breaks, and show me the fixed code."),
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
  assert.ok(page.includes("onMount"), "editor must expose its instance (Undo/Redo/Find + cursor)");
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
  assert.ok(page.includes('setSettingsTabOpen(true)'), "opening settings must open its tab");
  // Right-click a bottom tab opens the VS Code-style tab menu (web
  // actions only, wabepp): closes, copy path, reveal, pin.
  assert.ok(statusBar.includes("openTabContextMenu"), "a tab must open its context menu on right-click");
  assert.ok(page.includes('kind === "tab-file"'), "a file tab must have its own menu");
  assert.ok(page.includes('kind === "tab-settings"'), "the settings tab must have its own menu");
  assert.ok(page.includes("applyTabClose"), "bulk closes must share one helper (pins + keep-one-tab)");
  assert.ok(page.includes("pinnedPaths"), "pinned tabs must be tracked (bulk closes skip them)");
  assert.ok(page.includes("revealInExplorer"), "a file tab must offer Reveal in Explorer View");
  assert.ok(page.includes("scrollIntoView"), "reveal must scroll the file's tree row into view");
  assert.ok(page.includes("App-only (native APK"), "the app-only menu items must be listed, not built on the website");
});

test("Push opens a dialog with an AI-written commit message the user can edit (nothing pushes on its own)", () => {
  assert.ok(page.includes("openPushDialog"), "the Push button must open a dialog first, not push directly");
  assert.ok(page.includes("pushRepoChanges"), "the dialog's confirm must run the push");
  assert.ok(page.includes("/api/github/commit"), "the push must go through the existing commit route");
  assert.ok(page.includes("changedRepoPathsRef"), "only files changed since the repo opened must push");
  assert.ok(page.includes("markRepoChanged(activeFile.path)"), "editing a file must mark it changed");
  assert.ok(page.includes("t.editorPage.pushButton"), "the menu bar must have a Push button");
  assert.ok(page.includes("UploadCloud"), "the Push button must carry an upload icon");
  assert.ok(page.includes("disabled={!openRepoState || pushing || changedRepoCount === 0}"), "Push must stay disabled without an open repo, while pushing, or with no changes");
  assert.ok(page.includes("generateCommitMessage"), "the dialog must ask the AI for a commit message");
  assert.ok(page.includes("setTimeout(() => controller.abort(), 5000)"), "the AI message must give up after 5 seconds and keep the default");
  assert.ok(page.includes("messageEditedRef"), "typing in the box must win over a late AI reply");
  assert.ok(page.includes("push-commit-message"), "the message box must be a labelled, editable field");
  assert.ok(page.includes("t.editorPage.pushDialogTitle"), "the dialog must have a title");
  assert.ok(page.includes("t.common.cancel"), "the dialog must offer Cancel");
  assert.ok(page.includes("No changes to push"), "pushing with no changes must say so instead of calling GitHub");
  assert.ok(page.includes("never opened, so their content is not loaded yet"), "a changed file that was never opened must be skipped, not pushed empty");
  assert.ok(page.includes("Auto-save on Run"), "Run must still save first — the push changes nothing about running");
});

test("opening a repo from GitHub loads its tree lazily (with a backup + restore)", () => {
  assert.ok(page.includes("lp_open_repo"), "the editor must accept a repo handoff from the GitHub page");
  assert.ok(page.includes("buildRepoWorkspaceTree"), "the tree must become workspace items (folders first, files lazy)");
  assert.ok(page.includes("loadRepoTree"), "the editor must fetch the repo's tree itself");
  assert.ok(page.includes("/api/github/repo-tree?owner="), "the tree must come from the server");
  assert.ok(page.includes("/api/github/repo-file?owner="), "a file's content must load when it is opened");
  assert.ok(page.includes("lp_open_repo_current"), "the open repo must survive a reload");
  assert.ok(page.includes("lp_workspace_tree_backup"), "opening a repo must back the current workspace up first");
  assert.ok(page.includes("restoreWorkspaceBackup"), "the backup must be restorable");
  assert.ok(page.includes("t.editorPage.restoreWorkspace"), "File menu must offer Restore previous workspace");
  assert.ok(page.includes("hasWorkspaceBackup"), "Restore must only enable when a backup exists");
  assert.ok(page.includes("too big for the browser's storage"), "an over-full workspace must warn once instead of crashing");
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

test("the menu bar shows the open repo on the left and has no Delete button", () => {
  // A repo opened from the GitHub page must be visible at a glance:
  // the menu bar shows owner/repo on the LEFT, right after the
  // File/Edit/Run menus — never beside the Explorer toggle — linking
  // out to the repo on GitHub. Delete does NOT live here anymore:
  // it moved to the GitHub page's repo right-click menu, so a
  // permanent action never sits beside Push. Nothing shows for a
  // plain local workspace (the badge is gated on openRepoState).
  assert.ok(page.includes("openRepoState.repo"), "the badge must read the open repo");
  assert.ok(page.includes("https://github.com/${openRepoState.repo}"), "the badge must link to the repo on GitHub");
  assert.ok(page.includes("left={"), "the badge must be passed as the menu bar's left slot");
  assert.ok(
    page.indexOf("https://github.com/${openRepoState.repo}") < page.indexOf("right={"),
    "the badge must sit before the right-side group in the menu bar"
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
  // the name keeps its case (no uppercase transform).
  assert.ok(page.includes("openRepoState.repo} (${openRepoState.branch})"), "the Explorer header must show repo + branch");
  assert.ok(page.includes("workspaceRootDropHint"), "a plain workspace must still show the drop hint");
});

test("the editor never holds the GitHub token in the browser", () => {
  // The token lives on the server (migration 006): repo open, lazy
  // file load and push all go through session-authenticated routes
  // with no token in the browser and no Authorization header.
  // (Delete lives on the GitHub page now — same rule there.)
  assert.ok(!page.includes('localStorage.getItem("lp_github_token")'), "the editor must never read a token from the browser");
  assert.ok(!page.includes("Authorization"), "no editor GitHub call may send a token");
  assert.ok(page.includes("/api/github/repo-tree?owner="), "repo open must go through the session route");
  assert.ok(page.includes("/api/github/repo-file?owner="), "lazy file load must go through the session route");
});

test("a repo opening shows a success toast with its name and file count", () => {
  // When the repo tree loads, the editor must pop a toast with the
  // repo name and how many files it has — the tree is what loads
  // here, file contents load lazily when each file is opened, so
  // the toast fires on the tree load, not on every file.
  assert.ok(page.includes("repoLoadedToast"), "the editor must render a repo-loaded toast");
  assert.ok(page.includes("setRepoLoadedToast({ repo: data.repo, count: data.files.length })"), "the toast must fire when the tree load succeeds");
  assert.ok(page.includes("setTimeout(() => setRepoLoadedToast(null), 5000)"), "the toast must dismiss itself after 5 seconds");
  assert.ok(page.includes('role="status"'), "the toast must be a status region");
  assert.ok(en.includes("repoLoadedToast: (repo, count)"), "en.ts must define the toast message");
  assert.ok(en.includes("loaded — ${count} file(s)"), "the toast must name the repo and count its files");
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
