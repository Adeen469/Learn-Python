"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { type BranchedMenuItem } from "@/components/BranchedMenu";
import { EditorContextMenu, type ContextMenuItem } from "@/components/EditorContextMenu";
import { EditorMenuBar, type EditorMenu } from "@/components/EditorMenuBar";
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
import { type PromptBarModel } from "@/components/PromptBar";
import {
  ANTHROPIC_MODELS,
  GEMINI_FREE_MODELS,
  GROQ_FREE_MODELS,
  OPENAI_MODELS,
  OPENROUTER_MODELS,
} from "@/lib/ai";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronRight,
  FileCode,
  Folder,
  History,
  KeyRound,
  Loader2,
  Package,
  Pin,
  Save,
  Settings,
  Sparkles,
  Terminal,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { BUILTIN_AI_SKILL_META } from "@/lib/ai-skills-meta.generated";
import type {
  AiChat,
  AiChatMessage,
  AiPanelView,
  CentreView,
  PanelId,
  PanelZone,
  WorkspaceItem,
} from "@/app/editor/lib/editor-types";
import {
  buildRepoWorkspaceTree,
  DEFAULT_WORKSPACE,
  newId,
  readLocalJson,
} from "@/app/editor/lib/editor-utils";
import { usePyodideEngine, PY_WORKSPACE_ROOT } from "@/app/editor/hooks/usePyodideEngine";
import { TerminalPanel } from "@/app/editor/components/TerminalPanel";
import { EditorPanel } from "@/app/editor/components/EditorPanel";
import { AiPanel } from "@/app/editor/components/AiPanel";
import { ExplorerPanel } from "@/app/editor/components/ExplorerPanel";
import { PushDialog } from "@/app/editor/components/PushDialog";

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

  // AI panel chat (guide mode, POST /api/ai). A real AI assistant —
  // it answers anything, writes full code when asked, and fixes code
  // directly. Nothing is stored server-side: the current chat, past
  // chats, custom skills and the BYOK key live in this browser's
  // localStorage. Long files are truncated to the API's limit.


  type CustomAiSkill = { id: string; name: string; description: string; content: string };
  type AiByokProvider = "gemini" | "groq" | "anthropic" | "openai" | "openrouter" | "custom";
  // BYOK reference the editor sends: provider (+ base URL/model
  // for custom) only — NEVER a key. The key lives server-side
  // (lp_byok_keys, migration 009) and /api/ai loads it by
  // provider reference.
  type AiByok = { provider: AiByokProvider; key?: string; baseUrl?: string; model?: string };
  // One saved provider. Entries carry metadata only — no key lives
  // in this store anymore (keys are server-side). `key` stays
  // optional on the type only so a pre-migration localStorage entry
  // still parses and can be migrated on load (see the migration
  // effect below); it is stripped from state once the server save
  // succeeds and never sent in a request.
  type AiByokEntry = AiByok & { id: string; enabled: boolean };
  type AiByokStore = { enabled: boolean; entries: AiByokEntry[] };



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
  const [settingsSection, setSettingsSection] = useState<"menu" | "skills" | "models" | "byok">("menu");
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
  // BYOK store: a master switch plus a list of saved providers.
  // Entries are metadata only (provider + custom base URL/model) —
  // the keys live server-side. The old single-key shape
  // { provider, key } migrates to one enabled entry, so a saved key
  // keeps working (the migration effect POSTs it to the server).
  function readByokStore(): AiByokStore {
    const raw = readLocalJson<unknown>("lp_ai_byok", null);
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const r = raw as Record<string, unknown>;
      if (Array.isArray(r.entries)) {
        const entries = (r.entries as unknown[]).filter(
          (e): e is AiByokEntry =>
            !!e &&
            typeof e === "object" &&
            typeof (e as AiByokEntry).provider === "string" &&
            typeof (e as AiByokEntry).id === "string" &&
            typeof (e as AiByokEntry).enabled === "boolean"
        );
        return { enabled: r.enabled === true, entries };
      }
      if (typeof r.provider === "string" && typeof r.key === "string") {
        return {
          enabled: true,
          entries: [
            {
              id: newId(),
              provider: r.provider as AiByokProvider,
              key: r.key,
              ...(typeof r.baseUrl === "string" ? { baseUrl: r.baseUrl } : {}),
              ...(typeof r.model === "string" ? { model: r.model } : {}),
              enabled: true,
            },
          ],
        };
      }
    }
    return { enabled: false, entries: [] };
  }
  const [byokStore, setByokStore] = useState<AiByokStore>(() => readByokStore());
  // R2-L19: version stamp for the persisted BYOK store. Every write
  // stamps `v` (a timestamp); a tab that sees a NEWER stamp than its
  // own knows another tab owns the store and must not overwrite it
  // with stale state — otherwise a second tab re-persists keys the
  // first tab just deleted. byokKnownIdsRef tracks the entry ids
  // this tab has seen in storage, so the guard can tell a key this
  // tab created (keep) from one another tab deleted (drop).
  const byokVersionRef = useRef(0);
  const byokKnownIdsRef = useRef<Set<string>>(new Set());
  /** The same entry without its key (metadata only). */
  function stripByokKey(e: AiByokEntry): AiByokEntry {
    return {
      id: e.id,
      provider: e.provider,
      ...(e.baseUrl ? { baseUrl: e.baseUrl } : {}),
      ...(e.model ? { model: e.model } : {}),
      enabled: e.enabled,
    };
  }
  /** Persist the BYOK store with a fresh version stamp. */
  function writeByokStoreLocal(store: AiByokStore): void {
    const v = Date.now();
    try {
      localStorage.setItem("lp_ai_byok", JSON.stringify({ ...store, v }));
    } catch {
      // Storage unavailable — the state still holds the keys.
    }
    byokVersionRef.current = v;
    byokKnownIdsRef.current = new Set(store.entries.map((e) => e.id));
  }
  // BYOK server migration + sync (H8): keys used to live in
  // localStorage (lp_ai_byok) in plaintext. On first load after
  // this ships, any keys still there are POSTed once to
  // /api/byok/save (server-encrypted under BYOK_ENCRYPTION_KEY)
  // and then dropped from this browser — localStorage keeps only
  // provider metadata. The raw keys are read synchronously before
  // the first await, so the persist effect below cannot wipe them
  // mid-migration. R2-M14: the migration reads the same normalised
  // shape readByokStore() returns, so the old single-key shape
  // { provider, key } migrates too instead of being silently
  // deleted (its entries list is empty, so the old loop ran zero
  // times and still removed the key). R2-L19: each key is dropped
  // from the local copy as soon as ITS save succeeds, not
  // all-or-nothing at the end — a failed save keeps that key (and
  // only that key) for a retry next load. If the server save fails
  // (BYOK not set up yet), the local copy is left alone and the
  // migration retries on the next load, so a failed migration
  // never loses a key. The server list is also merged in, so keys
  // saved on another device show up here as providers (keys
  // themselves never come back down).
  const byokSyncRef = useRef(false);
  useEffect(() => {
    if (byokSyncRef.current) return;
    byokSyncRef.current = true;
    void (async () => {
      try {
        const store = readByokStore();
        const savedIds: string[] = [];
        for (const e of store.entries) {
          if (typeof e.key !== "string" || e.key.length < 10) continue;
          if (typeof e.provider !== "string") continue;
          const res = await fetch("/api/byok/save", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: e.provider,
              key: e.key,
              ...(typeof e.baseUrl === "string" ? { baseUrl: e.baseUrl } : {}),
              ...(typeof e.model === "string" ? { model: e.model } : {}),
            }),
          }).catch(() => null);
          if (res?.ok) {
            savedIds.push(e.id);
            // Drop just this key from the local copy right away —
            // the tab could close before the loop finishes.
            try {
              const remaining = readByokStore();
              writeByokStoreLocal({
                enabled: remaining.enabled,
                entries: remaining.entries.map((x) =>
                  x.id === e.id ? stripByokKey(x) : x
                ),
              });
            } catch {
              // Storage unavailable — the state strip below still
              // drops the key from the next persist.
            }
          }
        }
        if (savedIds.length > 0) {
          setByokStore((prev) => ({
            ...prev,
            entries: prev.entries.map((x) =>
              savedIds.includes(x.id) ? stripByokKey(x) : x
            ),
          }));
        }
      } catch {
        // Migration is best-effort: keys that did not save stay
        // local and retry next load. (No body-key fallback exists
        // server-side anymore, so an unsaved key simply cannot pay
        // for AI calls until the server store is ready.)
      }
      try {
        const res = await fetch("/api/byok/list", { credentials: "same-origin" });
        const data: unknown = await res.json().catch(() => null);
        const keys = (
          data as { keys?: Array<{ provider?: unknown; baseUrl?: unknown; model?: unknown }> } | null
        )?.keys;
        if (res.ok && Array.isArray(keys)) {
          setByokStore((prev) => {
            const have = new Set(prev.entries.map((e) => e.provider));
            const extra = keys
              .filter((k) => typeof k.provider === "string" && !have.has(k.provider as AiByokProvider))
              .map((k) => ({
                id: newId(),
                provider: k.provider as AiByokProvider,
                ...(typeof k.baseUrl === "string" && k.baseUrl
                  ? { baseUrl: k.baseUrl as string }
                  : {}),
                ...(typeof k.model === "string" && k.model ? { model: k.model as string } : {}),
                enabled: true,
              }));
            return extra.length > 0
              ? { ...prev, enabled: true, entries: [...prev.entries, ...extra] }
              : prev;
          });
        }
      } catch {
        // Offline or not signed in — the local providers still work.
      }
    })();
  }, []);
  // Models the selector shows by default (no BYOK): two free models
  // per provider — one best (result first, tokens don't matter) and
  // one efficient (fewest tokens). Gemini best is the 3.1 Pro
  // preview, efficient is 3.6 Flash; Groq best is the 120B model,
  // efficient the 20B one.
  const DEFAULT_SELECTOR_MODELS = [
    "gemini-3.1-pro-preview",
    "gemini-3.6-flash",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
  ];
  const [selectorModels, setSelectorModels] = useState<string[]>(() =>
    readLocalJson<string[]>("lp_ai_selector_models", DEFAULT_SELECTOR_MODELS)
  );
  // Add-skill + BYOK form fields (settings view).
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDesc, setNewSkillDesc] = useState("");
  const [newSkillContent, setNewSkillContent] = useState("");
  const [byokProvider, setByokProvider] = useState<AiByokProvider>(
    () => byokStore.entries[0]?.provider ?? "gemini"
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
      // R2-L18: cap retained chats at the last 20 — full AI
      // conversations sit in plaintext localStorage, so the pile
      // must not grow without bound.
      localStorage.setItem("lp_ai_chats", JSON.stringify(aiChats.slice(-20)));
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
  // R2-L19: never blindly overwrite the stored BYOK copy — another
  // tab may have deleted keys after this tab loaded. If the stored
  // copy carries a NEWER version stamp, adopt it (drop entries the
  // other tab removed, keep entries this tab created since — those
  // have ids the other tab never saw) instead of re-persisting this
  // tab's stale keys. If the store vanished entirely after this tab
  // last saw it, adopt the wipe the same way.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lp_ai_byok");
      if (!raw && (byokVersionRef.current > 0 || byokKnownIdsRef.current.size > 0)) {
        byokVersionRef.current = Date.now();
        byokKnownIdsRef.current = new Set();
        if (byokStore.entries.length > 0 || byokStore.enabled) {
          setByokStore({ enabled: false, entries: [] });
        }
        return;
      }
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      const storedV =
        parsed && typeof parsed === "object" && typeof (parsed as { v?: unknown }).v === "number"
          ? (parsed as { v: number }).v
          : 0;
      if (storedV > byokVersionRef.current) {
        byokVersionRef.current = storedV;
        const stored = readByokStore();
        const knownBefore = byokKnownIdsRef.current;
        const storedIds = new Set(stored.entries.map((e) => e.id));
        const mergedEntries = byokStore.entries.filter(
          (e) => storedIds.has(e.id) || !knownBefore.has(e.id)
        );
        byokKnownIdsRef.current = new Set([
          ...stored.entries.map((e) => e.id),
          ...mergedEntries.map((e) => e.id),
        ]);
        const enabled = mergedEntries.length > 0 ? byokStore.enabled : stored.enabled;
        const stateChanged =
          mergedEntries.length !== byokStore.entries.length || enabled !== byokStore.enabled;
        if (stateChanged) {
          // Adopting the newer store changed this tab's state —
          // the re-run persists the merged state.
          setByokStore({ enabled, entries: mergedEntries });
          return;
        }
        const differsFromStored =
          mergedEntries.length !== stored.entries.length ||
          mergedEntries.some((e, i) => e.id !== stored.entries[i]?.id) ||
          enabled !== stored.enabled;
        if (differsFromStored) {
          // This tab holds a newer local change the other tab
          // never saw (e.g. a toggled switch) — write the merged
          // state instead of dropping it.
          writeByokStoreLocal({ enabled, entries: mergedEntries });
        }
        return;
      }
      if (byokStore.entries.length > 0 || byokStore.enabled) {
        writeByokStoreLocal(byokStore);
      } else {
        localStorage.removeItem("lp_ai_byok");
        byokVersionRef.current = Date.now();
        byokKnownIdsRef.current = new Set();
      }
    } catch {
      // Storage full or unreadable — skip, the keys still work in memory.
    }
  }, [byokStore]);
  // R2-L19: another tab changed lp_ai_byok — adopt its version
  // promptly, so this tab's next persist cannot resurrect keys the
  // other tab deleted.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "lp_ai_byok") return;
      try {
        const parsed: unknown = e.newValue ? JSON.parse(e.newValue) : null;
        const v =
          parsed && typeof parsed === "object" && typeof (parsed as { v?: unknown }).v === "number"
            ? (parsed as { v: number }).v
            : 0;
        if (v > 0) byokVersionRef.current = Math.max(byokVersionRef.current, v);
        const incoming = readByokStore();
        const knownBefore = byokKnownIdsRef.current;
        const incomingIds = new Set(incoming.entries.map((x) => x.id));
        byokKnownIdsRef.current = new Set(incoming.entries.map((x) => x.id));
        setByokStore((prev) => {
          const merged = prev.entries.filter(
            (x) => incomingIds.has(x.id) || !knownBefore.has(x.id)
          );
          const enabled = merged.length > 0 ? prev.enabled : incoming.enabled;
          return merged.length !== prev.entries.length || enabled !== prev.enabled
            ? { enabled, entries: merged }
            : prev;
        });
      } catch {
        // Malformed storage event — ignore.
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("lp_ai_selector_models", JSON.stringify(selectorModels));
    } catch {
      // Storage full — skip.
    }
  }, [selectorModels]);

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

  // BYOK: keys live on the SERVER now (encrypted, migration 009).
  // Saving POSTs the key once to /api/byok/save; this browser keeps
  // only the provider (+ base URL/model for custom), so the key is
  // never in localStorage again. A key is used only when the master
  // switch is on AND that provider is enabled — otherwise the
  // request runs on the server keys alone. If the server save fails
  // (BYOK not set up yet, or not signed in), nothing is stored and
  // the typed key stays in the field for a retry.
  async function saveByokEntry() {
    const key = byokKey.trim();
    if (key.length < 10) return;
    if (byokProvider === "custom") {
      const baseUrl = byokBaseUrl.trim();
      const model = byokModel.trim();
      if (!baseUrl.startsWith("https://") || model.length === 0) return;
      const res = await fetch("/api/byok/save", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: byokProvider, key, baseUrl, model }),
      }).catch(() => null);
      if (!res || !res.ok) return;
      setByokStore((prev) => ({
        ...prev,
        entries: [...prev.entries, { id: newId(), provider: byokProvider, baseUrl, model, enabled: true }],
      }));
    } else {
      const res = await fetch("/api/byok/save", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: byokProvider, key }),
      }).catch(() => null);
      if (!res || !res.ok) return;
      setByokStore((prev) => ({
        ...prev,
        entries: [...prev.entries, { id: newId(), provider: byokProvider, enabled: true }],
      }));
    }
    setByokKey("");
    setByokBaseUrl("");
    setByokModel("");
  }
  function toggleByokEntry(id: string) {
    setByokStore((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e)),
    }));
  }
  function removeByokEntry(id: string) {
    const entry = byokStore.entries.find((e) => e.id === id);
    if (entry) {
      // Delete the server-held key too — removing the local entry
      // alone would leave the key usable. Best-effort: the local
      // entry is gone either way.
      void fetch(`/api/byok/delete?provider=${encodeURIComponent(entry.provider)}`, {
        method: "DELETE",
        credentials: "same-origin",
      }).catch(() => {});
    }
    setByokStore((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));
  }
  function setByokMaster(on: boolean) {
    setByokStore((prev) => ({ ...prev, enabled: on }));
  }

  // Model selector: which models show (AI Settings > Models).
  // Never empty — unticking the last one restores the defaults.
  function toggleSelectorModel(key: string) {
    setSelectorModels((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      return next.length === 0 ? DEFAULT_SELECTOR_MODELS : next;
    });
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

  // Model id → provider, from the server's allowlists (same ids as
  // src/lib/ai.ts). Picks which saved BYOK entry (if any) pays for
  // the picked model.
  function providerForModelId(model: string, customModels: string[]): AiByokProvider | null {
    if (GEMINI_FREE_MODELS.includes(model)) return "gemini";
    if (GROQ_FREE_MODELS.includes(model)) return "groq";
    if (ANTHROPIC_MODELS.includes(model)) return "anthropic";
    if (OPENAI_MODELS.includes(model)) return "openai";
    if (OPENROUTER_MODELS.includes(model)) return "openrouter";
    if (customModels.includes(model)) return "custom";
    return null;
  }

  // Best = best result, tokens don't matter. Efficient = fewest
  // tokens. These tags mark the curated models in AI Settings >
  // Models; the rest keep their picker tag.
  const BEST_MODEL_KEYS = new Set([
    "gemini-3.1-pro-preview",
    "openai/gpt-oss-120b",
    "claude-opus-5-5",
    "gpt-5.5",
    "openai/gpt-5.5",
  ]);
  const EFFICIENT_MODEL_KEYS = new Set([
    "gemini-3.6-flash",
    "openai/gpt-oss-20b",
    "claude-haiku-5-5",
    "gpt-5.4-mini",
    "google/gemini-3.6-flash",
  ]);

  // PromptBar models: every model the API accepts. The picker shows
  // only the models the user chose in AI Settings > Models
  // (defaults: the four free ones). An enabled custom BYOK entry
  // adds its own model to the list.
  const ALL_AI_PANEL_MODELS: PromptBarModel[] = [
    { key: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", tag: "Pro" },
    { key: "gemini-3.6-flash", name: "Gemini 3.6 Flash", tag: "Fast" },
    { key: "openai/gpt-oss-120b", name: "GPT-OSS 120B", tag: "Groq" },
    { key: "openai/gpt-oss-20b", name: "GPT-OSS 20B", tag: "Groq Fast" },
    { key: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", tag: "Anthropic" },
    { key: "claude-opus-5-5", name: "Claude Opus 5.5", tag: "Anthropic" },
    { key: "claude-haiku-5-5", name: "Claude Haiku 5.5", tag: "Anthropic Fast" },
    { key: "gpt-5.5", name: "GPT-5.5", tag: "OpenAI" },
    { key: "gpt-5.4-mini", name: "GPT-5.4 Mini", tag: "OpenAI Fast" },
    { key: "gpt-4o", name: "GPT-4o", tag: "OpenAI" },
    { key: "gpt-4o-mini", name: "GPT-4o Mini", tag: "OpenAI Fast" },
    { key: "openai/gpt-5.5", name: "GPT-5.5", tag: "OpenRouter" },
    { key: "anthropic/claude-sonnet-5-5", name: "Claude Sonnet 5.5", tag: "OpenRouter" },
    { key: "google/gemini-3.6-flash", name: "Gemini 3.6 Flash", tag: "OpenRouter" },
    { key: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", tag: "OpenRouter" },
  ];
  const AI_PANEL_MODELS: PromptBarModel[] = (() => {
    const visible = ALL_AI_PANEL_MODELS.filter((m) => selectorModels.includes(m.key));
    const custom = byokStore.enabled
      ? byokStore.entries
          .filter((e) => e.enabled && e.provider === "custom" && e.model)
          .map((e) => ({ key: e.model as string, name: e.model as string, tag: "Custom" }))
      : [];
    const list = [...visible, ...custom];
    return list.length > 0
      ? list
      : ALL_AI_PANEL_MODELS.filter((m) => DEFAULT_SELECTOR_MODELS.includes(m.key));
  })();

  // Models section groups: every allowlisted model, grouped by
  // provider. A provider without a usable key (no server key and no
  // enabled BYOK entry) is marked — its models can be ticked into
  // the selector but cannot answer until a key exists.
  const MODEL_GROUPS: { provider: AiByokProvider; name: string; needsKey: boolean; models: PromptBarModel[] }[] = (
    ["gemini", "groq", "anthropic", "openai", "openrouter"] as AiByokProvider[]
  ).map((provider) => ({
    provider,
    name: BYOK_PROVIDER_NAMES[provider],
    needsKey:
      provider !== "gemini" &&
      provider !== "groq" &&
      !(byokStore.enabled && byokStore.entries.some((e) => e.enabled && e.provider === provider)),
    models: ALL_AI_PANEL_MODELS.filter((m) => providerForModelId(m.key, []) === provider),
  }));
  function modelQualityTag(key: string): string | null {
    if (BEST_MODEL_KEYS.has(key)) return t.editorPage.aiModelsBest;
    if (EFFICIENT_MODEL_KEYS.has(key)) return t.editorPage.aiModelsEfficient;
    return null;
  }

  // The one BYOK entry (if any) that pays for a request with this
  // model: BYOK must be enabled, and only the enabled entry for the
  // model's provider is sent. The server contract is unchanged (one
  // byok object), so no server change is needed for multi-key support.
  // Reference only — the key itself lives server-side and /api/ai
  // loads it; no key ever leaves this browser anymore.
  function byokPayloadFor(modelKey: string): AiByok | undefined {
    if (!byokStore.enabled) return undefined;
    const customModels = byokStore.entries
      .filter((e) => e.enabled && e.provider === "custom" && e.model)
      .map((e) => e.model as string);
    const provider = providerForModelId(modelKey, customModels);
    const entry = provider
      ? byokStore.entries.find((e) => e.enabled && e.provider === provider)
      : undefined;
    if (!entry) return undefined;
    return entry.provider === "custom"
      ? { provider: entry.provider, baseUrl: entry.baseUrl, model: entry.model }
      : { provider: entry.provider };
  }

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
    const byokPayload = byokPayloadFor(opts.model?.key ?? "gemini-3.6-flash");
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
          model: opts.model?.key ?? "gemini-3.6-flash",
          effort: opts.effort,
          // Active skills: built-in ids resolve server-side; custom
          // skills ride along as name + instructions. BYOK rides
          // along only when the user enabled it — and only the
          // enabled entry for the picked model's provider, so every
          // other saved key stays in this browser.
          skillIds: activeSkillIds,
          skills: customSkills
            .filter((s) => activeSkillIds.includes(s.id))
            .map((s) => ({ name: s.name, content: s.content })),
          ...(byokPayload ? { byok: byokPayload } : {}),
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
    target: { kind: "file" | "folder" | "root" | "tab-file" | "tab-settings" | "tab-modules"; path: string };
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

  const activeFile =
    items.find((it) => it.type === "file" && it.path === activeFilePath) ||
    items.find((it) => it.type === "file");

  // Pyodide runtime engine (loading, Compile & Run, terminal,
  // engine.formatting) — see hooks/usePyodideEngine.ts.
  const engine = usePyodideEngine({
    items,
    activeFile,
    setItems,
    setActiveFilePath,
    setNeedsSaveWarning,
    setOutput,
    t,
  });

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

  // Pinned file tabs (VS Code-style): bulk closes never touch them,
  // and the tab shows a pin icon. In-memory, like the open-tabs list.
  const [pinnedPaths, setPinnedPaths] = useState<string[]>([]);

  // Close several file tabs at once (Close Others / to the Right /
  // Saved / All). The clicked tab is always kept — at least one file
  // tab stays open — and pinned tabs are never closed this way. If
  // the active file closes, the nearest remaining tab to its left
  // becomes active (else the first remaining tab).
  function applyTabClose(candidates: string[], keepPath: string) {
    const closable = candidates.filter((p) => p !== keepPath && !pinnedPaths.includes(p));
    if (closable.length === 0) return;
    const next = openFilePaths.filter((p) => !closable.includes(p));
    if (closable.includes(activeFilePath)) {
      const idx = openFilePaths.indexOf(activeFilePath);
      setActiveFilePath(next[Math.max(0, Math.min(idx - 1, next.length - 1))] ?? next[0]);
    }
    setOpenFilePaths(next);
  }

  // Reveal in Explorer View: show the file in the Explorer tree —
  // switch to the Files tab, open its folders, and scroll its row
  // into view. (The OS file explorer is app-only, wabepp.)
  function revealInExplorer(path: string) {
    setActiveFilePath(path);
    setCentreView("editor");
    switchTab("files");
    setPanelVisible("explorer", true);
    const folders: Record<string, boolean> = {};
    let acc = "";
    for (const part of path.split("/").slice(0, -1)) {
      acc = acc ? `${acc}/${part}` : part;
      folders[acc] = true;
    }
    setExpandedFolders((p) => ({ ...p, ...folders }));
    window.setTimeout(() => {
      document
        .querySelector(".branched-menu__head[data-active], .branched-menu__item[data-active]")
        ?.scrollIntoView({ block: "nearest" });
    }, 120);
  }

  function openTabContextMenu(
    e: React.MouseEvent,
    target: { kind: "tab-file" | "tab-settings" | "tab-modules"; path: string }
  ) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, target });
  }






  // Which repo the open workspace belongs to (null = the user's own
  // workspace). Restored on reload from lp_open_repo_current so lazy
  // files keep working after a refresh.
  const [openRepoState, setOpenRepoState] = useState<{ repo: string; branch: string } | null>(null);
  // Success toast after a repo opens: repo name + file count.
  // The tree is what loads here — file contents load lazily when
  // each file is opened, so the toast fires on the tree load, not
  // on every file. It dismisses itself after 5 seconds.
  const [repoLoadedToast, setRepoLoadedToast] = useState<{ repo: string; count: number } | null>(null);
  useEffect(() => {
    if (!repoLoadedToast) return;
    const timer = setTimeout(() => setRepoLoadedToast(null), 5000);
    return () => clearTimeout(timer);
  }, [repoLoadedToast]);
  // Files changed since the repo was opened (edits, new files, renames,
  // duplicates, drops) — the Push button commits exactly these, one
  // commit per file through /api/github/batch-commit (one request for
  // the whole push, chunked when needed; the server still makes one
  // commit per file). Saving to the browser is not pushing to GitHub:
  // the set only clears for files a push actually sent (or when a
  // different repo opens / the backup is restored).
  const changedRepoPathsRef = useRef<Set<string>>(new Set());
  const [changedRepoCount, setChangedRepoCount] = useState(0);
  function markRepoChanged(path: string) {
    if (!openRepoState) return;
    if (changedRepoPathsRef.current.has(path)) return;
    changedRepoPathsRef.current.add(path);
    setChangedRepoCount(changedRepoPathsRef.current.size);
  }
  function clearRepoChanged() {
    changedRepoPathsRef.current.clear();
    setChangedRepoCount(0);
  }
  // Paths the repo had when it was opened — a changed path missing
  // here is a new file, so the commit-message AI can tell adds
  // apart from updates.
  const repoTreePathsRef = useRef<Set<string>>(new Set());
  // Fresh mirror of the workspace for the lazy loader (lets it check
  // whether the file is still untouched before overwriting it).
  const itemsRef = useRef<WorkspaceItem[]>(DEFAULT_WORKSPACE);
  useEffect(() => {
    itemsRef.current = items;
  });
  // Whether the too-big-for-storage warning has been printed once.
  const persistWarnedRef = useRef(false);

  // Fetch a repo's file tree and open it as the workspace, like
  // GitHub's code view. Files load lazily when opened (see the
  // effect below) — the tree itself is the only thing fetched here.
  async function loadRepoTree(fullName: string) {
    // The server resolves the caller's stored GitHub token from
    // the session (migration 006) — no token leaves this browser.
    const [owner, name] = fullName.split("/");
    try {
      const res = await fetch(
        `/api/github/repo-tree?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(name)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load the repo");
      if (!data.files || data.files.length === 0) {
        setOutput((prev) => prev + `[${fullName} has no files to open in the editor.]\n`);
        return;
      }
      const repoItems = buildRepoWorkspaceTree(data.files);
      setItems(repoItems);
      clearRepoChanged();
      repoTreePathsRef.current = new Set(data.files.map((f: { path: string }) => f.path));
      try {
        localStorage.setItem(
          "lp_open_repo_current",
          JSON.stringify({ repo: data.repo, branch: data.branch })
        );
      } catch {}
      setOpenRepoState({ repo: data.repo, branch: data.branch });
      setRepoLoadedToast({ repo: data.repo, count: data.files.length });
      const firstFile = repoItems.find((p: WorkspaceItem) => p.type === "file");
      if (firstFile) setActiveFilePath(firstFile.path);
      setOutput((prev) => prev + `[Opened ${data.repo} in the editor — ${data.files.length} files. Click a file to load it. Previous workspace backed up, restore it from File → Restore previous workspace.]\n`);
    } catch (err: unknown) {
      setOutput((prev) => prev + `[Could not open ${fullName}: ${err instanceof Error ? err.message : String(err)}]\n`);
    }
  }

  // Whether a pre-repo workspace backup exists (File → Restore).
  const [hasWorkspaceBackup, setHasWorkspaceBackup] = useState(false);

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
    // A repo opened earlier (reload): its files may still be lazy —
    // restore which repo they belong to so clicking one loads it.
    try {
      const raw = localStorage.getItem("lp_open_repo_current");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.repo === "string" && typeof parsed.branch === "string") {
          setOpenRepoState(parsed);
        }
      }
    } catch {}
    // Repo handoff: the GitHub page stores just the repo's name in
    // sessionStorage (lp_open_repo) — the tree is fetched here, and
    // each file loads lazily when opened. The workspace being left
    // is backed up first (File → Restore previous workspace brings
    // it back).
    let openRepoName: string | null = null;
    try {
      const raw = sessionStorage.getItem("lp_open_repo");
      if (raw !== null) {
        sessionStorage.removeItem("lp_open_repo");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.repo === "string") {
          openRepoName = parsed.repo;
        }
      }
    } catch {}
    if (openRepoName) {
      try {
        localStorage.setItem("lp_workspace_tree_backup", JSON.stringify(base));
        setHasWorkspaceBackup(true);
      } catch {}
      setOutput((prev) => prev + `[Opening ${openRepoName}...]\n`);
      void loadRepoTree(openRepoName);
      return;
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

  // Lazy file loading: a repo file's content arrives only when the
  // file is opened. The lazy flag is the real guard (the ref only
  // stops a second fetch while one is in flight); if the user typed
  // into the empty file while it was loading, their text wins and
  // the fetch result is dropped.
  const loadingFileRef = useRef<string | null>(null);
  useEffect(() => {
    if (!openRepoState || !activeFile || !activeFile.lazy || !activeFile.sha) return;
    const path = activeFile.path;
    const sha = activeFile.sha;
    if (loadingFileRef.current === path) return;
    loadingFileRef.current = path;
    // The server resolves the caller's stored GitHub token from
    // the session (migration 006) — no token leaves this browser.
    const [owner, name] = openRepoState.repo.split("/");
    fetch(
      `/api/github/repo-file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(name)}&sha=${encodeURIComponent(sha)}&path=${encodeURIComponent(path)}&branch=${encodeURIComponent(openRepoState.branch)}`
    )
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Could not load file");
        }
        return res.text();
      })
      .then((content) => {
        const current = itemsRef.current.find((it) => it.path === path);
        if (!current || !current.lazy || current.content) return;
        const next = itemsRef.current.map((it) =>
          it.path === path ? { ...it, content, lazy: false, isSaved: true } : it
        );
        persistWorkspace(next);
      })
      .catch((err: unknown) => {
        setOutput((prev) => prev + `[Could not load ${path}: ${err instanceof Error ? err.message : String(err)}]\n`);
      })
      .finally(() => {
        loadingFileRef.current = null;
      });
  }, [activeFile, openRepoState]);

  function handleEditorChange(value: string | undefined) {
    if (!activeFile) return;
    setNeedsSaveWarning(null);
    markRepoChanged(activeFile.path);
    setItems((prev) =>
      prev.map((it) =>
        it.path === activeFile.path ? { ...it, content: value ?? "", isSaved: false } : it
      )
    );
  }

  // Persist the workspace: state + localStorage + the Pyodide virtual
  // filesystem, in one place, so every mutation (save, rename, delete,
  // duplicate, move, create) keeps all three in sync. The storage
  // write can fail when a lazily opened repo grows past the browser's
  // ~5 MB — then the session keeps working (state + Pyodide still
  // update) and the failure is noted once instead of crashing.
  function persistWorkspace(next: WorkspaceItem[]): boolean {
    setItems(next);
    let stored = true;
    try {
      localStorage.setItem("lp_workspace_tree", JSON.stringify(next));
    } catch {
      stored = false;
      if (!persistWarnedRef.current) {
        persistWarnedRef.current = true;
        setOutput((prev) => prev + "[Workspace is too big for the browser's storage — changes are kept for this session only.]\n");
      }
    }
    engine.syncAllFilesToPyodide(next);
    return stored;
  }

  // Restore the workspace that was backed up when a repo was opened
  // in the editor (File → Restore previous workspace).
  function restoreWorkspaceBackup() {
    try {
      const raw = localStorage.getItem("lp_workspace_tree_backup");
      if (!raw) return;
      const parsed = JSON.parse(raw) as WorkspaceItem[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      persistWorkspace(parsed);
      const firstFile = parsed.find((p) => p.type === "file");
      if (firstFile) setActiveFilePath(firstFile.path);
      localStorage.removeItem("lp_workspace_tree_backup");
      localStorage.removeItem("lp_open_repo_current");
      setOpenRepoState(null);
      clearRepoChanged();
      repoTreePathsRef.current.clear();
      setHasWorkspaceBackup(false);
      setOutput((prev) => prev + "[Restored your previous workspace.]\n");
    } catch {}
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

  // Push the repo's changes to GitHub: every file changed since the
  // repo was opened goes up in /api/github/batch-commit requests
  // (one request for the whole push, chunked when there are more
  // than 20 files or the body would pass the server's 5 MB cap),
  // all sharing the one commit message the user approved in the
  // push dialog. The server still makes one commit per file,
  // exactly as the old one-request-per-file push did — and it
  // reports every file's result, so a file that fails stays marked
  // changed and the next push retries just it. Nothing pushes on
  // its own: edits save to the browser only, and Run still saves
  // first exactly as before. A file that was never opened has no
  // loaded content, so it is skipped rather than pushed empty.
  const [pushing, setPushing] = useState(false);
  function splitChangedFiles() {
    const changed = [...changedRepoPathsRef.current];
    const ready = changed.filter((p) => {
      const it = itemsRef.current.find((x) => x.type === "file" && x.path === p);
      return it && (!it.lazy || (it.content ?? "") !== "");
    });
    return { ready, skipped: changed.filter((p) => !ready.includes(p)) };
  }
  function defaultCommitMessage(paths: string[]) {
    return paths.length === 1
      ? `Update ${paths[0]} from Learn Python editor`
      : `Update ${paths.length} files from Learn Python editor`;
  }
  // Batch-commit limits — must match the server
  // (src/app/api/github/batch-commit/route.ts): at most 20 files
  // per request, body capped at 5 MB. The byte budget below sits
  // under the cap to leave room for JSON escaping; the per-file
  // char cap is the server's zod limit, checked before batching so
  // one oversized file cannot fail its whole batch.
  const BATCH_COMMIT_MAX_FILES = 20;
  const BATCH_COMMIT_MAX_BYTES = 4_500_000;
  const BATCH_COMMIT_MAX_CONTENT_CHARS = 4_000_000;
  function chunkBatchFiles(files: { path: string; content: string }[]) {
    const oversized: { path: string; content: string }[] = [];
    const batches: { path: string; content: string }[][] = [];
    let current: { path: string; content: string }[] = [];
    let currentBytes = 200; // JSON envelope overhead
    const encoder = new TextEncoder();
    for (const file of files) {
      if (file.content.length > BATCH_COMMIT_MAX_CONTENT_CHARS) {
        oversized.push(file);
        continue;
      }
      const bytes =
        encoder.encode(file.content).length +
        encoder.encode(file.path).length +
        64; // per-file JSON overhead (keys, quotes, braces)
      if (
        current.length > 0 &&
        (current.length >= BATCH_COMMIT_MAX_FILES ||
          currentBytes + bytes > BATCH_COMMIT_MAX_BYTES)
      ) {
        batches.push(current);
        current = [];
        currentBytes = 200;
      }
      current.push(file);
      currentBytes += bytes;
    }
    if (current.length > 0) batches.push(current);
    return { batches, oversized };
  }
  async function pushRepoChanges(message: string) {
    if (!openRepoState || pushing) return;
    // The server resolves the caller's stored GitHub token from
    // the session (migration 006) — no token leaves this browser.
    const [owner, repo] = openRepoState.repo.split("/");
    const { ready, skipped } = splitChangedFiles();
    if (ready.length === 0) {
      setOutput((prev) =>
        prev +
        (skipped.length > 0
          ? `[Nothing to push — ${skipped.length} changed file(s) were never opened, so their content is not loaded yet.]\n`
          : "[No changes to push.]\n")
      );
      return;
    }
    setPushing(true);
    setOutput((prev) => prev + `[Pushing ${ready.length} file(s) to ${openRepoState.repo}...]\n`);
    const files = ready
      .map((path) => {
        const it = itemsRef.current.find((x) => x.type === "file" && x.path === path);
        return it ? { path, content: it.content ?? "" } : null;
      })
      .filter((f): f is { path: string; content: string } => f !== null);
    const { batches, oversized } = chunkBatchFiles(files);
    let pushed = 0;
    const failed: { path: string; error: string }[] = [];
    // Too big for the server to ever accept: fail it alone, with
    // the reason, instead of letting it fail its whole batch.
    for (const file of oversized) {
      failed.push({
        path: file.path,
        error: "File is larger than 4 MB — too big to commit from the editor",
      });
    }
    for (const batch of batches) {
      try {
        const res = await fetch("/api/github/batch-commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner,
            repo,
            branch: openRepoState.branch,
            message,
            files: batch,
          }),
        });
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const err =
            typeof data === "object" &&
            data !== null &&
            typeof (data as { error?: unknown }).error === "string"
              ? (data as { error: string }).error
              : "Push failed";
          for (const f of batch) failed.push({ path: f.path, error: err });
          continue;
        }
        const results =
          typeof data === "object" &&
          data !== null &&
          Array.isArray((data as { results?: unknown }).results)
            ? (data as { results: unknown[] }).results
            : [];
        const seen = new Set<string>();
        for (const r of results) {
          if (
            typeof r !== "object" ||
            r === null ||
            typeof (r as { path?: unknown }).path !== "string"
          )
            continue;
          const result = r as { path: string; ok?: unknown; error?: unknown };
          seen.add(result.path);
          if (result.ok === true) {
            pushed++;
            changedRepoPathsRef.current.delete(result.path);
          } else {
            failed.push({
              path: result.path,
              error:
                typeof result.error === "string" && result.error
                  ? result.error
                  : "Push failed",
            });
          }
        }
        // A file the server never reported is not assumed pushed —
        // it stays changed, so the next push retries it.
        for (const f of batch) {
          if (!seen.has(f.path)) {
            failed.push({ path: f.path, error: "No result from the server — retry to push it" });
          }
        }
      } catch {
        for (const f of batch) failed.push({ path: f.path, error: "Push failed" });
      }
    }
    setChangedRepoCount(changedRepoPathsRef.current.size);
    setPushing(false);
    setOutput(
      (prev) =>
        prev +
        `[Pushed ${pushed} of ${ready.length} file(s) to ${openRepoState.repo}${failed.length > 0 ? ` — failed: ${failed.map((f) => `${f.path} (${f.error})`).join(", ")}` : "."}${skipped.length > 0 ? ` Skipped ${skipped.length} unopened file(s).` : ""}]\n`
    );
  }

  // Push dialog: the commit message box opens with a plain default
  // already in it, and the AI refines it in the background (5s cap —
  // slower than that, or signed out, or no AI keys, and the default
  // simply stays). Typing in the box wins over the AI: once the user
  // edits it, an AI reply no longer overwrites it, and clearing the
  // box falls back to the default at confirm time.
  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [pushDialogFiles, setPushDialogFiles] = useState<{ ready: string[]; skipped: string[] }>({ ready: [], skipped: [] });
  const [commitMessage, setCommitMessage] = useState("");
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const messageEditedRef = useRef(false);
  const generationRef = useRef(0);
  function openPushDialog() {
    if (!openRepoState || pushing) return;
    const { ready, skipped } = splitChangedFiles();
    if (ready.length === 0) {
      setOutput((prev) =>
        prev +
        (skipped.length > 0
          ? `[Nothing to push — ${skipped.length} changed file(s) were never opened, so their content is not loaded yet.]\n`
          : "[No changes to push.]\n")
      );
      return;
    }
    messageEditedRef.current = false;
    setPushDialogFiles({ ready, skipped });
    setCommitMessage(defaultCommitMessage(ready));
    setPushDialogOpen(true);
    const gen = ++generationRef.current;
    void generateCommitMessage(ready, gen);
  }
  async function generateCommitMessage(paths: string[], gen: number) {
    const added = paths.filter((p) => !repoTreePathsRef.current.has(p));
    const updated = paths.filter((p) => repoTreePathsRef.current.has(p));
    const lines = [
      ...(added.length > 0 ? [`Added: ${added.join(", ")}`] : []),
      ...(updated.length > 0 ? [`Updated: ${updated.join(", ")}`] : []),
    ];
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    const commitByok = byokPayloadFor("gemini-3.6-flash");
    setGeneratingMessage(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "guide",
          question: `Write ONLY a short commit message (one line, max 72 characters, conventional-commits style like "feat: ..." or "fix: ...") for these changes in the ${openRepoState?.repo ?? "repo"} repository:\n${lines.join("\n")}\nReply with just the message, nothing else.`,
          model: "gemini-3.6-flash",
          effort: "Low",
          ...(commitByok ? { byok: commitByok } : {}),
        }),
        signal: controller.signal,
      });
      const data: unknown = await res.json().catch(() => null);
      const reply =
        typeof data === "object" && data !== null ? (data as { reply?: unknown }).reply : null;
      if (
        typeof reply === "string" &&
        reply.trim() &&
        gen === generationRef.current &&
        !messageEditedRef.current
      ) {
        setCommitMessage(reply.trim().split("\n")[0].slice(0, 72));
      }
    } catch {
      // AI unavailable, slower than 5s, or not signed in — the default
      // message is already in the box, so there is nothing to fix.
    } finally {
      window.clearTimeout(timer);
      setGeneratingMessage(false);
    }
  }
  async function confirmPush() {
    const message = commitMessage.trim() || defaultCommitMessage(pushDialogFiles.ready);
    setPushDialogOpen(false);
    await pushRepoChanges(message);
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
    if (item.type === "file") markRepoChanged(newPath);
    else
      updated
        .filter((it) => it.type === "file" && it.path.startsWith(newPath + "/"))
        .forEach((it) => markRepoChanged(it.path));
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
    copies.filter((c) => c.type === "file").forEach((c) => markRepoChanged(c.path));
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

  // The workspace file list is shadowed by the menu array inside
  // contextMenuItems, so the tab branch reads it through this alias.
  const workspaceItems = items;

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
    // Tab menu (right-click a bottom tab, VS Code-style). WABEPP:
    // only web-compatible actions live here. App-only (native APK /
    // Tauri EXE, NOT on the website): reopening with an external
    // editor, revealing in the OS file explorer, split editor,
    // moving the editor into a new OS window.
    if (kind === "tab-settings") {
      return [
        {
          id: "tab-close",
          label: t.editorPage.tabClose,
          action: () => {
            setSettingsTabOpen(false);
            setCentreView("editor");
          },
        },
      ];
    }
    if (kind === "tab-modules") {
      return [
        {
          id: "tab-close",
          label: t.editorPage.tabClose,
          action: () => switchTab("files"),
        },
      ];
    }
    if (kind === "tab-file") {
      const fileIndex = openFilePaths.indexOf(path);
      const toRight = fileIndex >= 0 ? openFilePaths.slice(fileIndex + 1) : [];
      const others = openFilePaths.filter((p) => p !== path);
      const saved = openFilePaths.filter((p) => {
        const it = workspaceItems.find((w) => w.type === "file" && w.path === p);
        return it?.isSaved;
      });
      const isPinned = pinnedPaths.includes(path);
      const nothingClosable = (list: string[]) =>
        list.length === 0 || list.every((p) => p === path || pinnedPaths.includes(p));
      return [
        {
          id: "tab-close",
          label: t.editorPage.tabClose,
          action: () => closeFileTab(path),
        },
        {
          id: "tab-close-others",
          label: t.editorPage.tabCloseOthers,
          disabled: nothingClosable(others),
          action: () => applyTabClose(others, path),
        },
        {
          id: "tab-close-right",
          label: t.editorPage.tabCloseToRight,
          disabled: nothingClosable(toRight),
          action: () => applyTabClose(toRight, path),
        },
        {
          id: "tab-close-saved",
          label: t.editorPage.tabCloseSaved,
          disabled: nothingClosable(saved),
          action: () => applyTabClose(saved, path),
        },
        {
          id: "tab-close-all",
          label: t.editorPage.tabCloseAll,
          disabled: nothingClosable(others),
          action: () => applyTabClose(others, path),
        },
        { id: "sep-1", label: "", separator: true },
        {
          id: "tab-copy-path",
          label: t.editorPage.menuCopyPath,
          action: () => copyPath(`${PY_WORKSPACE_ROOT}/${path}`),
        },
        {
          id: "tab-copy-relative-path",
          label: t.editorPage.tabCopyRelativePath,
          action: () => copyPath(path),
        },
        { id: "sep-2", label: "", separator: true },
        {
          id: "tab-reveal",
          label: t.editorPage.tabRevealInExplorer,
          action: () => revealInExplorer(path),
        },
        { id: "sep-3", label: "", separator: true },
        // No preview tabs in this editor — every tab is already kept
        // open, so Keep Open is shown greyed like VS Code shows it.
        {
          id: "tab-keep-open",
          label: t.editorPage.tabKeepOpen,
          disabled: true,
        },
        {
          id: "tab-pin",
          label: isPinned ? t.editorPage.tabUnpin : t.editorPage.tabPin,
          action: () =>
            setPinnedPaths((prev) =>
              isPinned ? prev.filter((p) => p !== path) : [...prev, path]
            ),
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
        disabled: engine.formatting || !engine.pyodideReady,
        action: () => engine.formatCurrentFile(),
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
    markRepoChanged(normalized);
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
      newItems.forEach((it) => markRepoChanged(it.path));
      setActiveFilePath(newItems[0].path);
      localStorage.setItem("lp_workspace_tree", JSON.stringify(merged));
      setOutput((prev) => prev + `[Imported ${newItems.length} file(s) via drag & drop]\n`);
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
        { id: "restore-workspace", label: t.editorPage.restoreWorkspace, disabled: !hasWorkspaceBackup, action: restoreWorkspaceBackup },
        { id: "sep-2", label: "", separator: true },
        { id: "rename", label: t.editorPage.menuRename, disabled: !activeFile, action: () => activeFile && startRename(activeFile.path) },
        { id: "duplicate", label: t.editorPage.menuDuplicate, disabled: !activeFile, action: () => activeFile && duplicateItem(activeFile.path) },
        { id: "copy-path", label: t.editorPage.menuCopyPath, disabled: !activeFile, action: () => activeFile && copyPath(activeFile.path) },
        { id: "sep-3", label: "", separator: true },
        { id: "format", label: t.editorPage.menuFormat, disabled: !activeFile || engine.formatting || !engine.pyodideReady, action: () => engine.formatCurrentFile() },
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
        { id: "format", label: t.editorPage.menuFormat, disabled: !activeFile || engine.formatting || !engine.pyodideReady, action: () => engine.formatCurrentFile() },
      ],
    },
    {
      id: "run",
      label: t.editorPage.menuRun,
      items: [
        { id: "run", label: t.editorPage.runWithoutDebugging, shortcut: "Ctrl+F5", disabled: engine.isRunning || engine.loadingEngine, action: () => engine.compileAndRun() },
        { id: "stop", label: t.editorPage.stop, disabled: !engine.isRunning, action: engine.stopRunning },
      ],
    },
  ];

  // Guests never see the editor — the gate effect above redirects to /.
  if (!enteredChecked) return null;


  // --- Dock panels (zone layout) ---
  // The side panels as JSX, placed into zones below by
  // renderDockPanel. The Editor is the centre and never moves.
  const explorerPanel = (<ExplorerPanel t={t} isExternalDragOver={isExternalDragOver} setIsExternalDragOver={setIsExternalDragOver} handleExternalDrop={handleExternalDrop} showNewFile={showNewFile} setShowNewFile={setShowNewFile} showNewFolder={showNewFolder} setShowNewFolder={setShowNewFolder} switchTab={switchTab} editorTab={editorTab} handleAddFile={handleAddFile} newFileInput={newFileInput} setNewFileInput={setNewFileInput} handleAddFolder={handleAddFolder} newFolderInput={newFolderInput} setNewFolderInput={setNewFolderInput} renamingPath={renamingPath} submitRename={submitRename} renameInput={renameInput} setRenameInput={setRenameInput} setRenamingPath={setRenamingPath} openRepoState={openRepoState} handleDragOverFolder={handleDragOverFolder} setDragOverTarget={setDragOverTarget} handleDropOnTarget={handleDropOnTarget} dragOverTarget={dragOverTarget} openRootContextMenu={openRootContextMenu} treeData={treeData} activeFilePath={activeFilePath} treeOpenSections={treeOpenSections} handleTreeSelect={handleTreeSelect} handleTreeToggle={handleTreeToggle} handleTreeDragStart={handleTreeDragStart} handleTreeDragOver={handleTreeDragOver} handleTreeDragLeave={handleTreeDragLeave} handleTreeDrop={handleTreeDrop} openRowContextMenu={openRowContextMenu} setDraggingPanel={setDraggingPanel} setDropZone={setDropZone} setShowExplorer={setShowExplorer} />);
  const terminalPanel = (<TerminalPanel t={t} output={output} setOutput={setOutput} activeFile={activeFile} engine={engine} terminalInputRef={terminalInputRef} setDraggingPanel={setDraggingPanel} setDropZone={setDropZone} setShowTerminal={setShowTerminal} />);
  // AI panel — history view (⋮ menu → Chat History): past chats,
  // newest first. Opening one swaps it into the chat; deleting it
  // removes it for good.

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
              {settingsSection === "skills"
                ? t.editorPage.aiSkillsTitle
                : settingsSection === "models"
                  ? t.editorPage.aiModelsTitle
                  : t.editorPage.aiByokTitle}
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
            onClick={() => setSettingsSection("models")}
            className="flex w-full items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-3 text-left hover:border-neutral-700"
          >
            <span className="text-sm font-medium text-neutral-100">{t.editorPage.aiModelsTitle}</span>
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
      {settingsSection === "models" && (
      <div className="space-y-3">
        <p className="text-xs text-neutral-500">{t.editorPage.aiModelsNote}</p>
        {MODEL_GROUPS.map((group) => (
          <div key={group.provider}>
            <p className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <span>{group.name}</span>
              {group.needsKey ? (
                <span className="font-normal normal-case tracking-normal text-amber-400">
                  {t.editorPage.aiModelsNeedsKey}
                </span>
              ) : null}
            </p>
            {group.models.map((m) => (
              <label
                key={m.key}
                className="mb-1 flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={selectorModels.includes(m.key)}
                  onChange={() => toggleSelectorModel(m.key)}
                  className="h-3.5 w-3.5 shrink-0 accent-white"
                />
                <span className="min-w-0 flex-1 text-sm text-neutral-100">{m.name}</span>
                <span className="shrink-0 rounded-md bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-neutral-300">
                  {modelQualityTag(m.key) ?? m.tag}
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
      )}
      {settingsSection === "byok" && (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {t.editorPage.aiByokTitle}
        </p>
        {/* Master switch: BYOK is used only when this is on. Keys
            live on the server now — this browser keeps only which
            providers are saved. */}
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
          <span className="text-sm font-medium text-neutral-100">{t.editorPage.aiByokEnable}</span>
          <input
            type="checkbox"
            checked={byokStore.enabled}
            onChange={(e) => setByokMaster(e.target.checked)}
            aria-label={t.editorPage.aiByokEnable}
            className="h-4 w-4 shrink-0 accent-white"
          />
        </label>
        {!byokStore.enabled ? (
          <p className="text-xs text-neutral-500">{t.editorPage.aiByokOffNote}</p>
        ) : null}
        {byokStore.entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          >
            <KeyRound className="h-4 w-4 shrink-0 text-neutral-400" />
            <span className="min-w-0 flex-1 text-sm text-neutral-200">
              {BYOK_PROVIDER_NAMES[entry.provider]}
              {entry.provider === "custom" && entry.model ? ` • ${entry.model}` : ""} • {t.editorPage.aiByokSaved}
            </span>
            <input
              type="checkbox"
              checked={entry.enabled}
              onChange={() => toggleByokEntry(entry.id)}
              aria-label={BYOK_PROVIDER_NAMES[entry.provider]}
              className="h-3.5 w-3.5 shrink-0 accent-white"
            />
            <button
              type="button"
              onClick={() => removeByokEntry(entry.id)}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-300 hover:bg-neutral-800"
            >
              {t.editorPage.aiByokRemove}
            </button>
          </div>
        ))}
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
          onClick={saveByokEntry}
          disabled={
            byokKey.trim().length < 10 ||
            (byokProvider === "custom" &&
              (!byokBaseUrl.trim().startsWith("https://") || byokModel.trim().length === 0))
          }
          className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-40"
        >
          {t.editorPage.aiByokSave}
        </button>
        <p className="text-xs text-neutral-500">{t.editorPage.aiByokNote}</p>
      </div>
      )}
        </div>
      </div>
    </div>
  );

  const aiPanel = (<AiPanel t={t} aiView={aiView} aiMessages={aiMessages} aiThinking={aiThinking} aiThoughtSeconds={aiThoughtSeconds} setAiThoughtSeconds={setAiThoughtSeconds} aiError={aiError} aiMenuOpen={aiMenuOpen} setAiMenuOpen={setAiMenuOpen} activeFile={activeFile} sendAiMessage={sendAiMessage} stopAi={stopAi} clearAiChat={clearAiChat} setAiView={setAiView} setCentreView={setCentreView} setSettingsSection={setSettingsSection} setSettingsTabOpen={setSettingsTabOpen} setPanelVisible={setPanelVisible} setDraggingPanel={setDraggingPanel} setDropZone={setDropZone} AI_PANEL_MODELS={AI_PANEL_MODELS} aiChats={aiChats} startNewChat={startNewChat} loadAiChat={loadAiChat} deleteAiChat={deleteAiChat} defaultModel="gemini-3.6-flash" />);

  const editorPanel = (<EditorPanel t={t} activeFile={activeFile} engine={engine} editorTheme={editorTheme} handleEditorChange={handleEditorChange} editorRef={editorRef} setCursorPos={setCursorPos} />);

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
        onLoad={() => engine.initPyodide((stage) => engine.setEngineStage(stage))}
        onError={() => {
          const msg = t.editorPage.pyodideLoadError;
          engine.setPyodideError(msg);
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
          left={
            /* Which repo this workspace belongs to — owner/repo,
               linking out to the repo on GitHub. Left side, after
               the menus — never beside the Explorer toggle. Shown
               only while a repo is open; a plain workspace shows
               nothing. */
            openRepoState ? (
              <a
                href={`https://github.com/${openRepoState.repo}`}
                target="_blank"
                rel="noreferrer"
                title={`${openRepoState.repo} (${openRepoState.branch}) — open on GitHub`}
                className="flex max-w-56 items-center gap-1.5 truncate rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 font-mono text-xs text-neutral-300 transition hover:border-neutral-600 hover:text-white"
              >
                {openRepoState.repo}
              </a>
            ) : undefined
          }
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
              <button
                type="button"
                onClick={openPushDialog}
                disabled={!openRepoState || pushing || changedRepoCount === 0}
                title={openRepoState ? t.editorPage.pushButton : t.editorPage.pushNeedsRepo}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  !openRepoState || changedRepoCount === 0
                    ? "text-neutral-600"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                {t.editorPage.pushButton}
                {changedRepoCount > 0 ? ` (${changedRepoCount})` : ""}
              </button>
            </>
          }
        />

        {/* Files / Modules now live in the Explorer panel's header
            (two small tabs there) — the separate tab bar above the
            editor is gone, so the header is a single bar. */}

        {/* Runtime load status: which CDN/step it is on + elapsed time,
            so a slow download reads as "working", not "stuck". */}
        {engine.loadingEngine && (
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs text-neutral-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span className="truncate">
              {engine.engineStage ?? t.editorPage.loadingEngine}
            </span>
            <span className="text-neutral-500 shrink-0">· {engine.engineElapsed}s</span>
            <button
              type="button"
              onClick={engine.cancelEngineLoad}
              className="ml-auto shrink-0 underline font-semibold text-neutral-300 hover:text-white"
            >
              {t.common.cancel}
            </button>
          </div>
        )}

        {engine.pyodideError && (
          <div className="flex items-center justify-between rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
            <span>{engine.pyodideError}</span>
            <button
              type="button"
              onClick={() => {
                engine.setPyodideError(null);
                engine.initPyodide();
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
                  <ModulesPanel pyodideRef={engine.pyodideRef} ensurePyodide={engine.ensurePyodideReady} />
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
            <span className={`h-1.5 w-1.5 rounded-full ${engine.pyodideReady ? "bg-emerald-400" : "bg-amber-400"}`} />
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
                  onContextMenu={(e) => openTabContextMenu(e, { kind: "tab-file", path })}
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
                    {pinnedPaths.includes(path) && <Pin className="h-3 w-3 shrink-0 text-neutral-300" />}
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
                onContextMenu={(e) => openTabContextMenu(e, { kind: "tab-settings", path: "" })}
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
                onContextMenu={(e) => openTabContextMenu(e, { kind: "tab-modules", path: "" })}
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

      {/* Push dialog: the commit message, AI-written, editable like
          GitHub's. The box opens with a plain default; the AI refines
          it within 5s (or the default stays). Clearing the box falls
          back to the default — a commit always has a message. */}
      {pushDialogOpen && openRepoState && (<PushDialog t={t} openRepoState={openRepoState} setPushDialogOpen={setPushDialogOpen} pushDialogFiles={pushDialogFiles} commitMessage={commitMessage} setCommitMessage={setCommitMessage} messageEditedRef={messageEditedRef} generatingMessage={generatingMessage} confirmPush={confirmPush} pushing={pushing} />)}

      {/* Repo-loaded toast: fires when the repo tree loads (file
          contents load lazily on open, so the toast is about the
          tree). Bottom-right, above the status bar, gone in 5s. */}
      {repoLoadedToast && (
        <div
          role="status"
          className="fixed bottom-16 right-4 z-50 flex max-w-sm items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-neutral-950 px-4 py-3 shadow-2xl shadow-black/60"
        >
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="min-w-0 flex-1 truncate text-xs text-neutral-200">
            {t.editorPage.repoLoadedToast(repoLoadedToast.repo, repoLoadedToast.count)}
          </span>
          <button
            type="button"
            onClick={() => setRepoLoadedToast(null)}
            aria-label="Dismiss"
            className="shrink-0 rounded-md p-1 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
