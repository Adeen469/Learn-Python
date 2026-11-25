// The editor's AI panel state: chat, history, custom skills, the BYOK
// store + model catalog, and sendAiMessage. Moved verbatim from
// web/src/app/editor/page.tsx (F1 split) — no behaviour change.
// The hook owns every AI/BYOK name page.tsx used to declare inline;
// page.tsx destructures the subset it renders, and AiSettingsCard
// takes the whole object.
import { useEffect, useRef, useState } from "react";
import type { PromptBarModel } from "@/components/PromptBar";
import {
  ANTHROPIC_MODELS,
  GEMINI_FREE_MODELS,
  GROQ_FREE_MODELS,
  OPENAI_MODELS,
  OPENROUTER_MODELS,
  isOpenRouterFreeModelId,
} from "@/lib/ai";
import type { Strings } from "@/lib/i18n";
import {
  newId,
  readLocalJson,
  readScopedRaw,
  removeLocalKey,
  scopedStorageKey,
  writeLocalJson,
  writeScopedRaw,
} from "@/app/editor/lib/editor-utils";
import { ensureEditorScope } from "@/app/editor/lib/editor-storage";
import type {
  AiChat,
  AiChatMessage,
  AiPanelView,
  CentreView,
  WorkspaceItem,
} from "@/app/editor/lib/editor-types";

export type CustomAiSkill = { id: string; name: string; description: string; content: string };
export type AiByokProvider = "gemini" | "groq" | "anthropic" | "openai" | "openrouter" | "custom";

// All BYOK providers, in the order the add-form offers them.
// availableByokProviders (below) filters this to the providers
// without a saved key — one key per provider (Maalik 2026-11-25).
export const ALL_BYOK_PROVIDERS: AiByokProvider[] = [
  "gemini",
  "groq",
  "anthropic",
  "openai",
  "openrouter",
  "custom",
];

// Max BYOK keys per user (Maalik 2026-11-25). The server enforces
// this in src/lib/byok-store.ts (MAX_BYOK_KEYS_PER_USER); this
// client copy only drives the "X of 10" count — keep both at 10.
export const MAX_BYOK_KEYS_PER_USER_CLIENT = 10;
// BYOK reference the editor sends: provider (+ base URL/model
// for custom) only — NEVER a key. The key lives server-side
// (lp_byok_keys, migration 009) and /api/ai loads it by
// provider reference.
export type AiByok = { provider: AiByokProvider; key?: string; baseUrl?: string; model?: string };
// One saved provider. Entries carry metadata only — no key lives
// in this store anymore (keys are server-side). `key` stays
// optional on the type only so a pre-migration localStorage entry
// still parses and can be migrated on load (see the migration
// effect below); it is stripped from state once the server save
// succeeds and never sent in a request. `keyHint` is the last 4
// chars of the saved key (migration 013), shown as ••••1234.
export type AiByokEntry = AiByok & { id: string; enabled: boolean; keyHint?: string };
export type AiByokStore = { enabled: boolean; entries: AiByokEntry[] };

export type EditorAi = ReturnType<typeof useEditorAi>;

export function useEditorAi({ t, activeFile }: { t: Strings; activeFile: WorkspaceItem | undefined }) {
  // AI panel chat (default AI, POST /api/ai). A real AI assistant —
  // it answers anything, writes full code when asked, and fixes code
  // directly. Nothing is stored server-side: the current chat, past
  // chats, custom skills and the BYOK key live in this browser's
  // localStorage. Long files are truncated to the API's limit.





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
  // Per-user restore (Fix C) has run: the state below was re-read
  // from the signed-in user's scope. The BYOK server migration
  // waits for this, so it reads the user's own store — not the
  // empty guest one the initializers saw.
  const [aiScopeReady, setAiScopeReady] = useState(false);
  const aiAbortRef = useRef<AbortController | null>(null);
  // Ask AI (PDF viewer): the CURRENT document's text is the
  // reference for the user's next question — the AI answers what
  // THEY ask about it, not a fixed summary. Set when the user taps
  // Ask AI in the PDF toolbar; cleared when the active file
  // changes (the reference follows the current document) or when
  // the user removes the chip in the AI panel.
  const [aiDocContext, setAiDocContext] = useState<{ fileName: string; text: string } | null>(null);
  useEffect(() => {
    setAiDocContext(null);
  }, [activeFile?.path]);

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
  /** The same entry without its key (metadata only). The masked
      hint survives the strip — it is display-only, never a key. */
  function stripByokKey(e: AiByokEntry): AiByokEntry {
    return {
      id: e.id,
      provider: e.provider,
      ...(e.baseUrl ? { baseUrl: e.baseUrl } : {}),
      ...(e.model ? { model: e.model } : {}),
      ...(e.keyHint ? { keyHint: e.keyHint } : {}),
      ...(typeof e.key === "string" && e.key.length >= 4
        ? { keyHint: e.key.slice(-4) }
        : {}),
      enabled: e.enabled,
    };
  }
  /** Persist the BYOK store with a fresh version stamp. */
  function writeByokStoreLocal(store: AiByokStore): void {
    const v = Date.now();
    // Per-user (Fix C): the store persists under the signed-in
    // user's scope.
    writeScopedRaw("lp_ai_byok", JSON.stringify({ ...store, v }));
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
  //
  // fetchServerByokKeys is the shared list-merge: the mount sync
  // below runs it once, and opening the BYOK settings page runs it
  // again, so a key saved on another device while this tab was
  // open shows up without a reload. Merging is by provider: new
  // providers are added (enabled), and a provider already listed
  // gains the server's masked hint when it lacks one.
  async function fetchServerByokKeys(): Promise<void> {
    try {
      const res = await fetch("/api/byok/list", { credentials: "same-origin" });
      const data: unknown = await res.json().catch(() => null);
      const keys = (
        data as {
          keys?: Array<{
            provider?: unknown;
            baseUrl?: unknown;
            model?: unknown;
            keyHint?: unknown;
          }>;
        } | null
      )?.keys;
      if (!res.ok || !Array.isArray(keys)) return;
      setByokStore((prev) => {
        const serverByProvider = new Map(
          keys
            .filter((k) => typeof k.provider === "string")
            .map((k) => [k.provider as AiByokProvider, k])
        );
        let hintChanged = false;
        const entries = prev.entries.map((e) => {
          const s = serverByProvider.get(e.provider);
          if (s && typeof s.keyHint === "string" && s.keyHint && !e.keyHint) {
            hintChanged = true;
            return { ...e, keyHint: s.keyHint as string };
          }
          return e;
        });
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
            ...(typeof k.keyHint === "string" && k.keyHint
              ? { keyHint: k.keyHint as string }
              : {}),
            enabled: true,
          }));
        if (extra.length > 0) {
          return { ...prev, enabled: true, entries: [...entries, ...extra] };
        }
        return hintChanged ? { ...prev, entries } : prev;
      });
    } catch {
      // Offline or not signed in — the local providers still work.
    }
  }
  const byokSyncRef = useRef(false);
  // Runs only after the per-user restore below (aiScopeReady): the
  // migration must read the signed-in user's own BYOK store, not
  // the empty guest one the initializers saw.
  useEffect(() => {
    if (!aiScopeReady) return;
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
          // 409 counts as migrated too: it means the server already
          // holds a key for this provider (a duplicate legacy
          // entry — one key per provider) or the 10-key cap was
          // hit. Either way the local duplicate must be dropped,
          // not retried on every load forever; the server's key
          // stays authoritative for that provider.
          if (res?.ok || res?.status === 409) {
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
      // Merge the server list (keys saved on another device show
      // up here as providers; keys themselves never come back down).
      await fetchServerByokKeys();
    })();
  }, [aiScopeReady]);
  // Re-sync the server key list whenever the BYOK settings page
  // opens: a key saved on another device while this tab was open
  // must show up without a reload (the mount sync above runs once).
  const prevSettingsSectionRef = useRef(settingsSection);
  useEffect(() => {
    if (prevSettingsSectionRef.current !== "byok" && settingsSection === "byok") {
      void fetchServerByokKeys();
    }
    prevSettingsSectionRef.current = settingsSection;
  }, [settingsSection]);
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
  // Models the user added from the OpenRouter search (AI Settings >
  // Models): {key, name} pairs, validated on load — a stored entry
  // counts only when its id is a valid ":free" slug with a
  // non-empty name, so a tampered or stale entry never reaches the
  // picker or the server.
  function readAddedModels(): PromptBarModel[] {
    const stored = readLocalJson<unknown>("lp_ai_added_models", []);
    if (!Array.isArray(stored)) return [];
    const seen = new Set<string>();
    const out: PromptBarModel[] = [];
    for (const m of stored) {
      if (
        !!m &&
        typeof m === "object" &&
        typeof (m as PromptBarModel).key === "string" &&
        isOpenRouterFreeModelId((m as PromptBarModel).key) &&
        typeof (m as PromptBarModel).name === "string" &&
        (m as PromptBarModel).name.trim().length > 0 &&
        !seen.has((m as PromptBarModel).key)
      ) {
        seen.add((m as PromptBarModel).key);
        out.push({ key: (m as PromptBarModel).key, name: (m as PromptBarModel).name, tag: "OpenRouter" });
      }
    }
    return out;
  }
  const [addedModels, setAddedModels] = useState<PromptBarModel[]>(readAddedModels);
  // Per-user restore (Fix C): the initializers above ran before the
  // storage scope resolved (guest scope → fallbacks), so re-read
  // every AI state from the signed-in user's scope once it resolves.
  // Until this runs the panel shows empty state — the page renders
  // nothing before its auth gate resolves anyway, so nothing wrong
  // ever paints. Sets aiScopeReady so the BYOK server migration
  // above runs against the user's own store.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await ensureEditorScope();
      if (cancelled) return;
      setAiMessages(readStoredAiMessages());
      setAiChats(readLocalJson<AiChat[]>("lp_ai_chats", []));
      setCustomSkills(readLocalJson<CustomAiSkill[]>("lp_ai_custom_skills", []));
      setActiveSkillIds(readLocalJson<string[]>("lp_ai_active_skills", ["ponytail"]));
      setByokStore(readByokStore());
      setSelectorModels(readLocalJson<string[]>("lp_ai_selector_models", DEFAULT_SELECTOR_MODELS));
      setAddedModels(readAddedModels());
      setAiScopeReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  // Last BYOK save/remove failure, shown under the Save button —
  // a failed save used to fail silently (the typed key just stayed
  // in the field), so the user could believe a key was saved when
  // it was not (not signed in, BYOK not set up yet). The text is
  // the server's error string, like aiError.
  const [byokError, setByokError] = useState<string | null>(null);
  // Replace target: the provider whose saved key the form is about
  // to replace. One key per provider (Maalik 2026-11-25) — the
  // add-form only offers providers without a key, so the only way
  // to save a key for a taken provider is Replace on its row,
  // which sends replace: true and overwrites that provider's key
  // instead of adding a second entry. Null = adding a new key.
  const [byokReplaceTarget, setByokReplaceTarget] =
    useState<AiByokProvider | null>(null);
  // Providers the add-form may offer: those without a saved entry.
  const availableByokProviders = ALL_BYOK_PROVIDERS.filter(
    (p) => !byokStore.entries.some((e) => e.provider === p)
  );
  // If the form's provider gains a saved key (saved here, on
  // another device, or merged in), move the form to the first free
  // provider — the select only lists free providers, so a taken
  // value would render blank. Skipped while replacing: the form
  // is locked to the provider being replaced.
  useEffect(() => {
    if (byokReplaceTarget) return;
    if (byokStore.entries.some((e) => e.provider === byokProvider)) {
      const free = ALL_BYOK_PROVIDERS.find(
        (p) => !byokStore.entries.some((e) => e.provider === p)
      );
      if (free) setByokProvider(free);
    }
  }, [byokStore.entries, byokReplaceTarget, byokProvider]);
  function startByokReplace(provider: AiByokProvider) {
    setByokError(null);
    setByokKey("");
    setByokProvider(provider);
    setByokReplaceTarget(provider);
  }
  function cancelByokReplace() {
    setByokReplaceTarget(null);
  }

  // Persist AI panel state to this browser only (never the server),
  // under the signed-in user's scope (Fix C).
  useEffect(() => {
    writeLocalJson("lp_ai_current_chat", aiMessages);
  }, [aiMessages]);
  useEffect(() => {
    // R2-L18: cap retained chats at the last 20 — full AI
    // conversations sit in plaintext localStorage, so the pile
    // must not grow without bound.
    writeLocalJson("lp_ai_chats", aiChats.slice(-20));
  }, [aiChats]);
  useEffect(() => {
    writeLocalJson("lp_ai_custom_skills", customSkills);
  }, [customSkills]);
  useEffect(() => {
    writeLocalJson("lp_ai_active_skills", activeSkillIds);
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
      const raw = readScopedRaw("lp_ai_byok");
      if (!raw && (byokVersionRef.current > 0 || byokKnownIdsRef.current.size > 0)) {
        byokVersionRef.current = Date.now();
        byokKnownIdsRef.current = new Set();
        // Adopt the wipe only when this tab still holds entries: an
        // enabled switch with zero entries is a legitimate local
        // state, and resetting it here made the master switch
        // un-turn-on-able with no saved key (the toggle flipped
        // straight back off). With no entries, fall through so the
        // write below persists the enabled switch instead.
        if (byokStore.entries.length > 0) {
          setByokStore({ enabled: false, entries: [] });
          return;
        }
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
        removeLocalKey("lp_ai_byok");
        // Reset the version to 0, NOT Date.now(): this tab has no
        // store at all — it never saw one, or it just adopted a
        // wipe. Stamping a fresh timestamp here made the tab look
        // like one that HAD a store and lost it, so the wipe
        // branch above deleted the next entries that appeared
        // while localStorage was still empty — the first save on
        // a fresh profile, or a server-list merge on a fresh
        // device — as a phantom "another tab deleted it". Version
        // 0 means "nothing seen": any real stored version still
        // wins the compare above, and a genuine wipe is still
        // adopted via the known-ids half of the wipe branch.
        byokVersionRef.current = 0;
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
      // Per-user (Fix C): the event key is the scoped key.
      if (e.key !== scopedStorageKey("lp_ai_byok")) return;
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
    writeLocalJson("lp_ai_selector_models", selectorModels);
  }, [selectorModels]);
  useEffect(() => {
    writeLocalJson("lp_ai_added_models", addedModels);
  }, [addedModels]);

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
  // only the provider (+ base URL/model for custom) and the masked
  // hint (last 4 chars), so the key is never in localStorage again.
  // A key is used only when the master switch is on AND that
  // provider is enabled — otherwise the request runs on the server
  // keys alone. If the server save fails (BYOK not set up yet, or
  // not signed in), nothing is stored, the typed key stays in the
  // field for a retry, and the server's error is shown — a failed
  // save must never look like a saved key. One key per provider:
  // the form only offers free providers, and a save for a taken
  // provider goes through as a replace (replace: true) — the
  // server rejects a non-replace duplicate with 409.
  async function saveByokEntry() {
    const key = byokKey.trim();
    if (key.length < 10) return;
    setByokError(null);
    const replacing = byokReplaceTarget === byokProvider;
    const saveError = async (res: Response | null): Promise<string> => {
      if (!res) return "Could not reach the server — check your connection and try again.";
      const data: unknown = await res.json().catch(() => null);
      const msg =
        data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : null;
      return msg ?? "Could not save the key — please try again.";
    };
    // Store the saved entry locally (provider + hint only, never
    // the key): a replace overwrites the existing row for that
    // provider in place, an add appends a new row.
    const storeSavedEntry = (baseUrl?: string, model?: string) => {
      setByokStore((prev) => {
        const idx = prev.entries.findIndex((e) => e.provider === byokProvider);
        if (replacing && idx >= 0) {
          const next = [...prev.entries];
          next[idx] = {
            ...next[idx],
            ...(baseUrl !== undefined ? { baseUrl } : {}),
            ...(model !== undefined ? { model } : {}),
            keyHint: key.slice(-4),
            enabled: true,
          };
          return { ...prev, entries: next };
        }
        return {
          ...prev,
          entries: [
            ...prev.entries,
            {
              id: newId(),
              provider: byokProvider,
              ...(baseUrl !== undefined ? { baseUrl } : {}),
              ...(model !== undefined ? { model } : {}),
              keyHint: key.slice(-4),
              enabled: true,
            },
          ],
        };
      });
    };
    if (byokProvider === "custom") {
      const baseUrl = byokBaseUrl.trim();
      const model = byokModel.trim();
      if (!baseUrl.startsWith("https://") || model.length === 0) return;
      const res = await fetch("/api/byok/save", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: byokProvider, key, baseUrl, model, replace: replacing }),
      }).catch(() => null);
      if (!res || !res.ok) {
        setByokError(await saveError(res));
        return;
      }
      storeSavedEntry(baseUrl, model);
    } else {
      const res = await fetch("/api/byok/save", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: byokProvider, key, replace: replacing }),
      }).catch(() => null);
      if (!res || !res.ok) {
        setByokError(await saveError(res));
        return;
      }
      storeSavedEntry();
    }
    setByokReplaceTarget(null);
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
  async function removeByokEntry(id: string) {
    const entry = byokStore.entries.find((e) => e.id === id);
    if (!entry) return;
    // Delete the server-held key too — removing the local entry
    // alone would leave the key usable. The delete is awaited and
    // the local entry is removed only when the server confirms it:
    // a failed delete keeps the entry (and shows the error) instead
    // of telling the user a possibly-compromised key is gone while
    // it is still stored and usable by /api/ai.
    setByokError(null);
    const res = await fetch(`/api/byok/delete?provider=${encodeURIComponent(entry.provider)}`, {
      method: "DELETE",
      credentials: "same-origin",
    }).catch(() => null);
    if (!res || !res.ok) {
      const data: unknown = res ? await res.json().catch(() => null) : null;
      const msg =
        data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : null;
      setByokError(msg ?? "Could not delete the key — please try again.");
      return;
    }
    setByokStore((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));
    // The removed row may have been the replace target — a
    // replace of a deleted key would be a plain add instead.
    if (byokReplaceTarget === entry.provider) setByokReplaceTarget(null);
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

  // OpenRouter free-model search (AI Settings > Models): the live
  // catalog, served by /api/ai/openrouter-models — the browser
  // cannot fetch openrouter.ai itself (the CSP `connect-src`
  // blocks it), so the route proxies the public catalog and
  // returns only the free chat models. Fetched once, when the
  // search first opens; tapping Add puts the model in the catalog
  // and ticks it into the selector. A model already in the catalog
  // shows as Added instead of a second Add.
  type OpenRouterSearchModel = { id: string; name: string };
  const [orSearchOpen, setOrSearchOpen] = useState(false);
  const [orSearchQuery, setOrSearchQuery] = useState("");
  const [orSearchFree, setOrSearchFree] = useState<OpenRouterSearchModel[] | null>(null);
  const [orSearchLoading, setOrSearchLoading] = useState(false);
  const [orSearchError, setOrSearchError] = useState(false);
  function toggleOrSearch() {
    if (!orSearchOpen && orSearchFree === null && !orSearchLoading) {
      void fetchOpenRouterFreeModels();
    }
    setOrSearchOpen((prev) => !prev);
  }
  async function fetchOpenRouterFreeModels() {
    setOrSearchLoading(true);
    setOrSearchError(false);
    try {
      const res = await fetch("/api/ai/openrouter-models", { credentials: "same-origin" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: unknown = await res.json();
      const models = (data as { models?: unknown })?.models;
      if (!Array.isArray(models)) throw new Error("bad catalog shape");
      const free: OpenRouterSearchModel[] = [];
      for (const m of models) {
        if (
          !!m &&
          typeof m === "object" &&
          typeof (m as { id?: unknown }).id === "string" &&
          typeof (m as { name?: unknown }).name === "string" &&
          (m as { name: string }).name.trim().length > 0
        ) {
          free.push({ id: (m as { id: string }).id, name: (m as { name: string }).name });
        }
      }
      setOrSearchFree(free);
    } catch {
      setOrSearchError(true);
    } finally {
      setOrSearchLoading(false);
    }
  }
  // Search results: the free catalog, filtered by name or id
  // (case-insensitive substring). Empty query shows every free
  // model — the free list is small (~14).
  const orSearchResults: OpenRouterSearchModel[] = (orSearchFree ?? []).filter((m) => {
    const q = orSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
  });
  function addOpenRouterModel(id: string, name: string) {
    if (!isOpenRouterFreeModelId(id)) return;
    setAddedModels((prev) =>
      prev.some((m) => m.key === id) ? prev : [...prev, { key: id, name, tag: "OpenRouter" }]
    );
    setSelectorModels((prev) => (prev.includes(id) ? prev : [...prev, id]));
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
    // A user-added model from the Models search: its id is a
    // ":free" slug by construction, so it is an OpenRouter model
    // and the OpenRouter BYOK entry pays for it.
    if (isOpenRouterFreeModelId(model)) return "openrouter";
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
  ]);
  const EFFICIENT_MODEL_KEYS = new Set([
    "gemini-3.6-flash",
    "openai/gpt-oss-20b",
    "claude-haiku-5-5",
    "gpt-5.4-mini",
  ]);

  // PromptBar models: every model the API accepts. The picker shows
  // only the models the user chose in AI Settings > Models
  // (defaults: the four free ones). An enabled custom BYOK entry
  // adds its own model to the list.
  const BASE_AI_PANEL_MODELS: PromptBarModel[] = [
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
    { key: "google/gemma-4-31b-it:free", name: "Gemma 4 31B", tag: "OpenRouter" },
    { key: "google/gemma-4-26b-a4b-it:free", name: "Gemma 4 26B", tag: "OpenRouter" },
    { key: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "Nemotron 3 Ultra", tag: "OpenRouter" },
    { key: "nvidia/nemotron-3.5-lightning:free", name: "Nemotron 3.5 Lightning", tag: "OpenRouter" },
    { key: "nvidia/nemotron-3.5-super-vl:free", name: "Nemotron 3.5 Super VL", tag: "OpenRouter" },
    { key: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "Nemotron 3 Nano Omni", tag: "OpenRouter" },
    { key: "baidu/ernie-5.5-flash-preview:free", name: "ERNIE 5.5 Flash", tag: "OpenRouter" },
    { key: "inclusionai/ling-3.2-flash:free", name: "Ling 3.2 Flash", tag: "OpenRouter" },
    { key: "recursive/flint-v1.0:free", name: "Flint 1.0", tag: "OpenRouter" },
    { key: "particle-ai/particle-1:free", name: "Particle 1", tag: "OpenRouter" },
    { key: "liquid/lfm-3-1.7b:free", name: "LFM 3 1.7B", tag: "OpenRouter" },
  ];
  // Plus the models the user added from the OpenRouter search —
  // they join the catalog (and the Models list + picker) exactly
  // like the curated ones. An added id that later joins the
  // curated list (the free list rotates) must not show twice.
  const ALL_AI_PANEL_MODELS: PromptBarModel[] = [
    ...BASE_AI_PANEL_MODELS,
    ...addedModels.filter((m) => !BASE_AI_PANEL_MODELS.some((b) => b.key === m.key)),
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
    // The PDF Ask AI context replaces the active file's content as
    // the reference: a PDF has no text content, so without this the
    // AI would answer with no document at all.
    const code = aiDocContext ? aiDocContext.text : (activeFile?.content ?? "");
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
        // Show the server's own reason when it has one — a 400 like
        // "No saved key for this provider — add one in AI Settings
        // > BYOK" (OpenRouter model picked, no key saved) or a 429
        // rate limit is actionable, and the old code hid every one
        // of them behind "Something went wrong", so the user could
        // never tell a missing key from a broken call.
        const serverError =
          typeof data === "object" && data !== null && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : null;
        setAiError(serverError ?? t.common.genericError);
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

  return {
    aiMessages, setAiMessages, aiThinking, setAiThinking,
    aiThoughtSeconds, setAiThoughtSeconds, aiError, setAiError,
    aiView, setAiView, centreView, setCentreView,
    settingsSection, setSettingsSection, aiMenuOpen, setAiMenuOpen,
    aiChats, setAiChats, customSkills, setCustomSkills,
    activeSkillIds, setActiveSkillIds, byokStore, setByokStore,
    selectorModels, setSelectorModels,
    newSkillName, setNewSkillName, newSkillDesc, setNewSkillDesc,
    newSkillContent, setNewSkillContent,
    byokProvider, setByokProvider, byokKey, setByokKey,
    byokBaseUrl, setByokBaseUrl, byokModel, setByokModel,
    byokError, setByokError,
    byokReplaceTarget, startByokReplace, cancelByokReplace,
    availableByokProviders, MAX_BYOK_KEYS_PER_USER_CLIENT,
    saveCurrentChatToHistory, startNewChat, loadAiChat, deleteAiChat,
    toggleSkill, addCustomSkill, deleteCustomSkill,
    saveByokEntry, toggleByokEntry, removeByokEntry, setByokMaster,
    toggleSelectorModel, providerForModelId, modelQualityTag, byokPayloadFor,
    addedModels, orSearchOpen, toggleOrSearch, orSearchQuery, setOrSearchQuery,
    orSearchResults, orSearchLoading, orSearchError, addOpenRouterModel,
    sendAiMessage, stopAi, clearAiChat,
    aiDocContext, setAiDocContext,
    BYOK_PROVIDER_NAMES, BEST_MODEL_KEYS, EFFICIENT_MODEL_KEYS,
    ALL_AI_PANEL_MODELS, AI_PANEL_MODELS, MODEL_GROUPS,
  };
}
