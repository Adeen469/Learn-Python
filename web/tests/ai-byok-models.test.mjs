import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

// BYOK v2 + Models section (2026-11-21, Maalik's brief): BYOK is
// used only when the user enables it; several keys can be saved and
// each switched on/off; the model selector shows only the models the
// user chose in AI Settings > Models (defaults: two free Gemini +
// two free Groq models, one best + one efficient each); only the
// enabled entry for the picked model's provider ever leaves the
// browser. The server contract is unchanged (one byok object), so
// src/lib/ai.ts needs no change for multi-key support.

const page = read("src/app/editor/page.tsx");
// F1 split: the AI + BYOK layer lives in the editor-AI hook, the
// settings card JSX in its component — the page only wires them.
const aiHook = read("src/app/editor/hooks/useEditorAi.ts");
const aiCard = read("src/app/editor/components/AiSettingsCard.tsx");
const aiLib = read("src/lib/ai.ts");
const aiRoute = read("src/app/api/ai/route.ts");
const saveRoute = read("src/app/api/byok/save/route.ts");
const en = read("src/lib/i18n/en.ts");

test("BYOK v2: master switch + multiple keys, each switchable, legacy key migrates", () => {
  // The store is a switch plus a list — not a single key.
  assert.ok(aiHook.includes("type AiByokStore = { enabled: boolean; entries: AiByokEntry[] };"), "the BYOK store must hold a switch plus a list of keys");
  assert.ok(aiHook.includes("readByokStore"), "the store must load through one reader");
  assert.ok(aiHook.includes("setByokMaster"), "the master switch must have a setter");
  assert.ok(aiHook.includes("saveByokEntry"), "saving must add an entry to the list");
  assert.ok(aiHook.includes("toggleByokEntry"), "each entry must be switchable on/off");
  assert.ok(aiHook.includes("removeByokEntry"), "each entry must be removable");
  // The old single-key shape migrates to one enabled entry, so a
  // saved key keeps working instead of silently vanishing.
  assert.ok(aiHook.includes("migrates to one enabled entry"), "the migration must be documented in code");
  assert.ok(aiHook.includes("enabled: true,"), "the migrated legacy key must start enabled");
  assert.ok(!page.includes("const [byok, setByok]"), "no single-key state may remain");
  assert.ok(!page.includes("saveByok()"), "no single-key save may remain");
});

test("BYOK v2: only the enabled entry for the picked model is ever sent", () => {
  // The client maps the picked model to its provider, then sends
  // that provider's enabled entry — and nothing else.
  assert.ok(aiHook.includes("function providerForModelId"), "the client must map a model id to its provider");
  assert.ok(aiHook.includes("GEMINI_FREE_MODELS.includes(model)"), "Gemini models must map to Gemini");
  assert.ok(aiHook.includes("GROQ_FREE_MODELS.includes(model)"), "Groq models must map to Groq");
  assert.ok(aiHook.includes("function byokPayloadFor"), "one helper must build the per-request BYOK payload");
  assert.ok(aiHook.includes("if (!byokStore.enabled) return undefined;"), "a disabled master switch must send no key at all");
  assert.ok(aiHook.includes("entries.find((e) => e.enabled && e.provider === provider)"), "only an enabled entry for the picked provider may be sent");
  assert.ok(aiHook.includes("byokPayloadFor(opts.model?.key"), "the chat request must use the helper for the picked model");
  assert.ok(page.includes("byokPayloadFor(\"gemini-3.6-flash\")"), "the commit-message request must use the helper too");
  // The server still takes exactly one byok object — multi-key is a
  // client-side selection, not a new server contract. Since H8 the
  // key lives server-side (lp_byok_keys): the route loads it by
  // provider reference, and a key in the body is REJECTED (R2-M1)
  // — the old deprecated fallback is gone.
  assert.ok(aiLib.includes("byok?: AiByok;"), "the server request type must still carry one BYOK object");
  assert.ok(aiRoute.includes("getByokKey(user.email, body.byok.provider)"), "the route must load the BYOK key server-side by provider reference");
  assert.ok(aiRoute.includes("const key = stored?.key ?? null;"), "the route must use the stored key only — no body-key fallback");
  assert.ok(!aiRoute.includes("body.byok.key"), "the route must never read a body-supplied BYOK key");
  assert.ok(!aiLib.includes("byok.key = b.key"), "validation must never carry a body key through");
});

test("Models section: breadcrumb, best models per provider, selector tick state", () => {
  assert.ok(aiCard.includes('"models"'), "settings must gain a Models section");
  assert.ok(aiCard.includes("aiModelsTitle"), "the Models section must have a breadcrumb title");
  assert.ok(aiHook.includes("MODEL_GROUPS"), "models must be grouped by provider");
  assert.ok(aiHook.includes("aiModelsBest"), "best models must be tagged Best");
  assert.ok(aiHook.includes("aiModelsEfficient"), "efficient models must be tagged Efficient");
  assert.ok(aiCard.includes("aiModelsNeedsKey"), "providers without a usable key must be marked");
  assert.ok(aiHook.includes("toggleSelectorModel"), "each model must be tickable into the selector");
  assert.ok(aiHook.includes("next.length === 0 ? DEFAULT_SELECTOR_MODELS : next"), "the selector must never end up empty");
  assert.ok(en.includes("aiModelsTitle:"), "en.ts must define the Models title");
  assert.ok(en.includes("aiModelsNote:"), "en.ts must define the Models note");
});

test("default selector: two free Gemini + two free Groq models, best + efficient each", () => {
  // Best = best result, tokens don't matter. Efficient = fewest
  // tokens. Gemini best is the 3.1 Pro preview, efficient 3.6 Flash;
  // Groq best is the 120B model, efficient the 20B one.
  assert.ok(aiHook.includes('"gemini-3.1-pro-preview"'), "Gemini best must be the 3.1 Pro preview");
  assert.ok(aiHook.includes('"gemini-3.6-flash"'), "Gemini efficient must be 3.6 Flash");
  assert.ok(aiHook.includes('"openai/gpt-oss-120b"'), "Groq best must be the 120B model");
  assert.ok(aiHook.includes('"openai/gpt-oss-20b"'), "Groq efficient must be the 20B model");
  assert.ok(aiHook.includes("const DEFAULT_SELECTOR_MODELS = ["), "the four defaults must live in one constant");
  // The default picked model must be one of the four shown.
  assert.ok(page.includes('defaultModel="gemini-3.6-flash"'), "the default picked model must be 3.6 Flash");
  assert.ok(aiHook.includes('model: opts.model?.key ?? "gemini-3.6-flash"'), "the request fallback must match the default picked model");
  // The preview Pro model must not be the picker default (the
  // proven 3.6 Flash is), and no retired model may survive.
  assert.ok(!page.includes('defaultModel="gemini-3.1-pro-preview"'), "the preview Pro model must not be the picker default");
  assert.ok(!page.includes('"gemini-2.5-pro"'), "the retired 2.5 Pro must not survive anywhere");
  // Free-tier guardrails still hold: no retired Llama chat models.
  assert.ok(!aiLib.includes("llama-3.1-8b-instant") || aiLib.includes("do NOT add them back"), "retired Llama models must stay out");
  assert.ok(!page.includes("llama-3.1-8b-instant"), "the picker must not list retired Llama models");
});

test("BYOK v2 keeps the old guarantees: server-held keys, browser-only metadata, skills ride along", () => {
  // Keys live on the server (migration 009, encrypted); this
  // browser keeps only provider metadata, version-stamped (R2-L19),
  // so a second tab cannot re-persist keys the first tab deleted —
  // and a key itself is never in localStorage anymore.
  assert.ok(aiHook.includes('writeByokStoreLocal(byokStore)'), "provider metadata must persist to this browser only, version-stamped");
  // Per-user (Fix C, 2026-11-25): the persisted copy goes through
  // the scoped helper now, so it lands under the signed-in user's
  // key — the version stamp itself is unchanged.
  assert.ok(aiHook.includes('writeScopedRaw("lp_ai_byok", JSON.stringify({ ...store, v }))'), "the persisted copy must carry a version stamp");
  assert.ok(aiHook.includes('writeLocalJson("lp_ai_selector_models"'), "selector choices must persist to this browser only");
  // The copy must tell the truth: keys are saved encrypted on the
  // server and work on any device after sign-in — never "saved on
  // this device" / "never stored on the server" (that stale copy is
  // why users believed keys were per-device).
  assert.ok(en.includes("Saved on the server"), "the saved label must say the key is saved on the server");
  assert.ok(en.includes("works on any device after sign-in"), "the saved label must say it works on any device after sign-in");
  assert.ok(en.includes("Saved encrypted on the server, tied to your account"), "the note must say keys are saved encrypted on the server");
  assert.ok(en.includes("the key itself never comes back to the browser"), "the note must say the key never comes back to the browser");
  assert.ok(!en.includes("Saved on this device"), "no copy may claim a key is saved on this device");
  assert.ok(!en.includes("never stored on the server"), "no copy may claim a key is never stored on the server");
  // Skills still ride along with every guide request.
  assert.ok(aiHook.includes("skillIds: activeSkillIds"), "skills must still be sent with the request");
});

test("BYOK save (R3-C SSRF): a custom base URL is validated before it is stored", () => {
  // The fetch-time guard in lib/ai.ts is the last line of defence,
  // but an unsafe URL must never reach the store: the save route
  // reuses isSafeCustomBaseUrl (https-only, no credentials, no
  // private/loopback/link-local/reserved target, DNS failure fails
  // closed) and refuses the save BEFORE saveByokKey runs.
  assert.ok(
    saveRoute.includes('isSafeCustomBaseUrl'),
    "the save route must call isSafeCustomBaseUrl for a custom base URL"
  );
  assert.ok(
    saveRoute.indexOf("isSafeCustomBaseUrl(baseUrl)") < saveRoute.indexOf("saveByokKey("),
    "the SSRF check must run before the key is saved"
  );
  assert.ok(
    saveRoute.includes("Custom base URL must be a public https endpoint"),
    "a rejected base URL must be refused with a clear error"
  );
});

test("BYOK master switch can turn on with no saved keys (R2-L19 wipe guard)", () => {
  // The persist effect adopts a cross-tab wipe only when this tab
  // still holds entries — an enabled switch with zero entries is a
  // legitimate local state, and the wipe branch must not reset it.
  // Before this fix the branch reset { enabled: false, entries: [] }
  // whenever the stored copy was missing, so the master switch
  // flipped straight back off for a user with no saved key.
  assert.ok(
    aiHook.includes("if (byokStore.entries.length > 0) {\n          setByokStore({ enabled: false, entries: [] });"),
    "the wipe adoption must only reset when this tab still holds entries"
  );
  assert.ok(
    !aiHook.includes("if (byokStore.entries.length > 0 || byokStore.enabled) {\n          setByokStore({ enabled: false, entries: [] });"),
    "the wipe adoption must not reset an enabled switch with zero entries"
  );
});

test("BYOK server-save (2026-11-25): a failed save is shown, never silent", () => {
  // Saving POSTs the key to /api/byok/save; when the server refuses
  // (not signed in, BYOK not set up yet) the typed key stays in the
  // field AND the server's error is shown — a failed save used to
  // fail silently, so the user could believe a key was saved when
  // it was not.
  assert.ok(aiHook.includes("const [byokError, setByokError] = useState<string | null>(null);"), "the hook must hold the last BYOK save/remove error");
  assert.ok(aiHook.includes("setByokError(await saveError(res));"), "a failed save must surface the server's error");
  assert.ok(aiHook.includes("setByokError(null);"), "a new save attempt must clear the old error");
  assert.ok(aiCard.includes("byokError"), "the settings card must read the BYOK error");
  assert.ok(aiCard.includes('{byokError ? ('), "the settings card must render the error under the Save button");
  assert.ok(aiCard.includes('role="alert"'), "the error must be announced as an alert");
});

test("BYOK remove awaits the server delete (2026-11-25)", () => {
  // Removing a provider must delete the server-held key too — and
  // the local entry is removed only when the server confirms the
  // delete, so a failed delete never tells the user a possibly
  // compromised key is gone while it is still usable by /api/ai.
  const start = aiHook.indexOf("async function removeByokEntry");
  assert.ok(start >= 0, "removeByokEntry must exist");
  const fn = aiHook.slice(start, aiHook.indexOf("function setByokMaster", start));
  assert.ok(fn.includes("await fetch(`/api/byok/delete?provider="), "remove must await the server DELETE");
  assert.ok(fn.includes("if (!res || !res.ok) {"), "remove must check the DELETE result");
  assert.ok(fn.includes("setByokError("), "a failed delete must show the error");
  assert.ok(
    fn.indexOf("setByokStore((prev) => ({ ...prev, entries: prev.entries.filter") > fn.indexOf("if (!res || !res.ok) {"),
    "the local entry must be removed only after the server confirms the delete"
  );
  assert.ok(!fn.includes("void fetch("), "remove must not fire-and-forget the server delete");
});

test("BYOK masked hints (migration 013): last 4 chars, never the key", () => {
  // The UI proves which key is saved (••••1234) without ever
  // showing it: each row keeps the last 4 chars as key_hint.
  const migration = read("supabase/migrations/013_byok_github_key_hints.sql");
  assert.ok(migration.includes("alter table public.lp_byok_keys"), "migration 013 must touch lp_byok_keys");
  assert.ok(migration.includes("add column if not exists key_hint text;"), "migration 013 must add key_hint");
  assert.ok(migration.includes("alter table public.lp_github_tokens"), "migration 013 must touch lp_github_tokens");
  const store = read("src/lib/byok-store.ts");
  assert.ok(store.includes("keyHint: string | null;"), "the list metadata must carry the hint");
  assert.ok(store.includes("key_hint: last4(key)"), "saving must store the last 4 chars as the hint");
  assert.ok(store.includes('select("provider,base_url,model,key_hint")'), "listing must read the hint back");
  assert.ok(store.includes("keyHint:"), "listing must map the hint into the metadata");
  // Before 013 runs the column does not exist — saves and lists
  // must retry without it instead of breaking the feature.
  assert.ok(store.includes("retry once without the hint"), "saving must retry without the hint before 013 runs");
  assert.ok(store.includes("retry without it instead of reporting no"), "listing must retry without the hint before 013 runs");
  // The hook carries the hint through the merge and the save, and
  // the card shows it masked.
  assert.ok(aiHook.includes("keyHint?: string"), "entries must carry the hint");
  assert.ok(aiHook.includes("keyHint: key.slice(-4)"), "a just-saved entry must show its own hint at once");
  assert.ok(aiHook.includes("keyHint: s.keyHint as string"), "the server-list merge must carry the hint");
  assert.ok(aiCard.includes("••••{entry.keyHint}"), "the card must show the hint masked as ••••1234");
  // The hint rule, mirrored: exactly the last 4 chars, nothing else.
  const last4 = (s) => s.trim().slice(-4);
  assert.equal(last4("sk-ant-123456"), "3456", "the hint must be the last 4 chars");
  assert.equal(last4("ghp_abcdefghij"), "ghij", "the hint must be the last 4 chars for tokens too");
});

test("BYOK list re-syncs when the BYOK settings page opens (2026-11-25)", () => {
  // A key saved on another device while this tab was open must show
  // up without a reload: the mount sync runs once, so opening the
  // BYOK page re-fetches the server list.
  assert.ok(aiHook.includes("async function fetchServerByokKeys()"), "the list merge must be a shared function");
  assert.ok(aiHook.includes("await fetchServerByokKeys();"), "the mount sync must use the shared list merge");
  assert.ok(
    aiHook.includes('if (prevSettingsSectionRef.current !== "byok" && settingsSection === "byok")'),
    "opening the BYOK page must trigger a re-sync"
  );
  assert.ok(aiHook.includes("void fetchServerByokKeys();"), "the section-open effect must call the list merge");
});

test("BYOK copy is truthful in every language (2026-11-25)", () => {
  // Every language file must say the key is saved on the server and
  // works on any device — the stale "saved on this device" / "never
  // stored on the server" copy in any language would mislead that
  // language's users into re-entering keys per device.
  for (const f of ["ar", "de", "en", "es", "fr", "hi-roman", "ja", "ko", "pt", "ru", "zh"]) {
    const lang = read(`src/lib/i18n/${f}.ts`);
    const saved = lang.match(/aiByokSaved: "(.*)",/);
    const note = lang.match(/aiByokNote: "(.*)",/);
    assert.ok(saved, `${f} must define aiByokSaved`);
    assert.ok(note, `${f} must define aiByokNote`);
    assert.ok(saved[1].includes("Saved on the server"), `${f} aiByokSaved must say the key is saved on the server`);
    assert.ok(saved[1].includes("works on any device after sign-in"), `${f} aiByokSaved must say it works on any device after sign-in`);
    assert.ok(note[1].includes("Saved encrypted on the server"), `${f} aiByokNote must say keys are saved encrypted on the server`);
    assert.ok(!saved[1].includes("this device"), `${f} aiByokSaved must not claim the key is saved on this device`);
    assert.ok(!note[1].includes("never stored on the server"), `${f} aiByokNote must not claim keys are never stored on the server`);
  }
});

test("BYOK one key per provider: the server rejects a duplicate save, replace is allowed (2026-11-25)", () => {
  // Maalik: once OpenRouter is saved, OpenRouter cannot be added
  // again — but replacing the saved key is still allowed. The
  // server enforces it, so a second tab (or a forged request)
  // cannot create a duplicate provider entry.
  const store = read("src/lib/byok-store.ts");
  assert.ok(store.includes("MAX_BYOK_KEYS_PER_USER"), "the store must define the cap constant");
  // The rule, mirrored in JS: add = reject when the provider is
  // already saved; replace = always allowed; a new provider = ok.
  const canSave = (existingProviders, provider, replace) =>
    replace === true || !existingProviders.includes(provider);
  assert.equal(canSave(["openrouter"], "openrouter", false), false, "adding a second OpenRouter key must be rejected");
  assert.equal(canSave(["openrouter"], "openrouter", true), true, "replacing the saved OpenRouter key must be allowed");
  assert.equal(canSave(["openrouter"], "groq", false), true, "a different provider must still be addable");
  assert.equal(canSave([], "openrouter", false), true, "the first key for a provider must be addable");
  // The server: the save route lists the user's keys first and
  // 409s a non-replace duplicate; replace is an explicit flag.
  assert.ok(saveRoute.includes("replace: z.boolean().optional()"), "the save schema must accept an explicit replace flag");
  assert.ok(saveRoute.includes("const replace = parsed.data.replace === true;"), "replace must be read from the validated body");
  assert.ok(saveRoute.includes("await listByokKeys(user.email)"), "the save route must list the user's existing keys before saving");
  assert.ok(
    saveRoute.includes("existing.some((k) => k.provider === provider)"),
    "the save route must check whether this provider already has a key"
  );
  assert.ok(saveRoute.includes("if (!replace) {"), "the duplicate check must not apply to a replace");
  assert.ok(saveRoute.includes("status: 409"), "a duplicate save must be rejected with 409");
  assert.ok(
    saveRoute.includes("already has a saved key"),
    "the 409 must say the provider already has a saved key"
  );
  assert.ok(saveRoute.includes("await saveByokKey(user.email, provider,"), "a replace must still reach the upsert (overwrite) path");
});

test("BYOK max 10 keys per user: the server rejects any save past 10 (2026-11-25)", () => {
  // Maalik: a user can save at most 10 BYOK keys in total.
  // With one key per provider and 6 providers the provider rule
  // binds first today; the cap is the hard ceiling if more
  // providers are added — and it is enforced server-side.
  const store = read("src/lib/byok-store.ts");
  const cap = store.match(/export const MAX_BYOK_KEYS_PER_USER = (\d+);/);
  assert.ok(cap, "the store must export MAX_BYOK_KEYS_PER_USER");
  assert.equal(Number(cap[1]), 10, "the cap must be 10");
  // The rule, mirrored in JS: a non-replace save at/over the cap
  // is rejected; a replace never grows the count, so it is allowed.
  const canSave = (count, replace) => replace === true || count < 10;
  assert.equal(canSave(9, false), true, "9 keys: one more must be allowed");
  assert.equal(canSave(10, false), false, "10 keys: an 11th must be rejected");
  assert.equal(canSave(10, true), true, "10 keys: replacing an existing one must still be allowed");
  // The server: the save route compares the user's key count
  // against the cap and 409s a non-replace save past it.
  assert.ok(saveRoute.includes("MAX_BYOK_KEYS_PER_USER"), "the save route must use the cap constant");
  assert.ok(
    saveRoute.includes("existing.length >= MAX_BYOK_KEYS_PER_USER"),
    "the save route must count the user's keys against the cap"
  );
  assert.ok(saveRoute.includes("You can save up to"), "the cap 409 must state the limit");
  // Client and server must agree on the number.
  assert.ok(
    aiHook.includes("export const MAX_BYOK_KEYS_PER_USER_CLIENT = 10;"),
    "the client must carry the same cap (10) for the count display"
  );
});

test("BYOK UI: a saved provider is never offered again; replace is a button on the row (2026-11-25)", () => {
  // The add-form's provider dropdown must only list providers
  // without a saved key — a saved provider cannot be picked
  // again, so the user cannot even attempt a duplicate add.
  assert.ok(aiHook.includes("const availableByokProviders = ALL_BYOK_PROVIDERS.filter("), "the hook must compute the free providers");
  assert.ok(
    aiHook.includes("(p) => !byokStore.entries.some((e) => e.provider === p)"),
    "a provider with a saved entry must be excluded from the free list"
  );
  assert.ok(
    aiCard.includes("(byokReplaceTarget ? [byokReplaceTarget] : availableByokProviders).map((p) => ("),
    "the select must offer only free providers (or the replace target while replacing)"
  );
  assert.ok(aiCard.includes("disabled={byokReplaceTarget !== null}"), "the select must be locked while replacing");
  // Replace is a first-class action on each saved row.
  assert.ok(aiCard.includes("onClick={() => startByokReplace(entry.provider)}"), "each saved row must have a Replace button");
  assert.ok(aiCard.includes("{t.editorPage.aiByokReplace}"), "the Replace button must use the i18n label");
  assert.ok(aiHook.includes("function startByokReplace(provider: AiByokProvider)"), "the hook must provide startByokReplace");
  assert.ok(aiHook.includes("setByokReplaceTarget(provider);"), "starting a replace must lock the form to that provider");
  assert.ok(aiCard.includes("onClick={cancelByokReplace}"), "a replace must be cancellable");
  // The save must tell the server it is a replace, and a replace
  // must overwrite the row in place, not append a second entry.
  assert.ok(aiHook.includes("const replacing = byokReplaceTarget === byokProvider;"), "the save must know whether it is a replace");
  assert.ok(aiHook.includes("replace: replacing"), "the save body must carry the replace flag");
  assert.ok(aiHook.includes("if (replacing && idx >= 0) {"), "a replace must update the existing row in place");
  // If the form's provider gains a key (another device, a merge),
  // the form must move to a free provider instead of showing a
  // blank select for a taken provider.
  assert.ok(aiHook.includes("if (byokStore.entries.some((e) => e.provider === byokProvider))"), "the hook must notice when the form provider becomes taken");
  // Removing the row being replaced must clear the replace target.
  assert.ok(aiHook.includes("if (byokReplaceTarget === entry.provider) setByokReplaceTarget(null);"), "removing the replace target must cancel the replace");
});

test("BYOK UI: the 10-key limit is shown as a count (2026-11-25)", () => {
  // The user must see the limit, not discover it by a rejected
  // save: "Keys saved: X of 10" under the saved rows, and a note
  // when every provider already has a key.
  assert.ok(
    aiCard.includes("t.editorPage.aiByokKeysUsed(byokStore.entries.length, MAX_BYOK_KEYS_PER_USER_CLIENT)"),
    "the card must show the saved-keys count against the cap"
  );
  assert.ok(aiCard.includes("{t.editorPage.aiByokAllSaved}"), "the card must note when every provider already has a key");
  assert.ok(
    aiCard.includes("byokReplaceTarget || availableByokProviders.length > 0 ? ("),
    "the add-form must hide when no provider is free and no replace is active"
  );
  for (const f of ["ar", "de", "en", "es", "fr", "hi-roman", "ja", "ko", "pt", "ru", "zh"]) {
    const lang = read(`src/lib/i18n/${f}.ts`);
    assert.ok(lang.includes('aiByokReplace: "Replace",'), `${f} must define aiByokReplace`);
    assert.ok(lang.includes("aiByokKeysUsed:"), `${f} must define aiByokKeysUsed`);
    assert.ok(lang.includes('aiByokAllSaved: "Every provider already has a saved key.",'), `${f} must define aiByokAllSaved`);
    const used = lang.match(/aiByokKeysUsed: \(used: number, max: number\) => `(.*)`/);
    assert.ok(used, `${f} aiByokKeysUsed must be a (used, max) function`);
    assert.ok(used[1].includes("${used}") && used[1].includes("${max}"), `${f} aiByokKeysUsed must interpolate both numbers`);
  }
});

test("BYOK migration: a 409 (already saved) drops the local duplicate instead of retrying forever (2026-11-25)", () => {
  // A legacy localStorage copy can hold two entries for one
  // provider. The first migrates; the second now gets a 409 from
  // the one-key-per-provider rule. That 409 must count as
  // migrated — the server already holds that provider's key, so
  // the local duplicate is dropped instead of retrying on every
  // load forever.
  assert.ok(aiHook.includes("if (res?.ok || res?.status === 409) {"), "the migration loop must treat a 409 as migrated");
});

test("BYOK wipe guard: a fresh tab must not wipe its first save / first server merge (2026-11-25)", () => {
  // Found while screenshotting the server save: the first save on
  // a fresh profile (master off, nothing in localStorage) vanished
  // the moment it was saved, and a server-list merge on a fresh
  // device would vanish the same way. Cause: the persist effect's
  // empty-store branch stamped byokVersionRef = Date.now(), so a
  // tab that NEVER had a store looked like one that HAD one and
  // lost it — and the wipe branch above ("adopt the wipe when the
  // stored copy is missing") deleted the next entries that
  // appeared as a phantom "another tab deleted it". The fix: the
  // empty-store branch resets the version to 0 ("nothing seen").
  // A genuine wipe is still adopted: that path runs on known ids
  // (this tab saw entries before) or a version from a real write.
  const emptyBranch = aiHook.match(
    /removeLocalKey\("lp_ai_byok"\);([\s\S]*?)byokKnownIdsRef\.current = new Set\(\);/
  );
  assert.ok(emptyBranch, "the empty-store branch must exist");
  assert.ok(
    emptyBranch[1].includes("byokVersionRef.current = 0;"),
    "the empty-store branch must reset the version to 0, not stamp a fresh timestamp"
  );
  assert.ok(
    !emptyBranch[1].includes("byokVersionRef.current = Date.now()"),
    "the empty-store branch must not stamp a fresh version (that re-arms the wipe)"
  );
  // The wipe branch itself is unchanged: it still adopts a wipe
  // when the stored copy is missing and this tab had seen a store.
  assert.ok(
    aiHook.includes("if (!raw && (byokVersionRef.current > 0 || byokKnownIdsRef.current.size > 0)) {"),
    "the wipe branch must still trigger when this tab had seen a store"
  );
  // The rule, mirrored: wipe iff the stored copy is gone AND this
  // tab had seen a store (version from a real write, or known ids)
  // AND it still holds entries.
  const wouldWipe = ({ raw, version, knownIds, entries }) =>
    !raw && (version > 0 || knownIds.size > 0) && entries.length > 0;
  assert.equal(
    wouldWipe({ raw: null, version: 0, knownIds: new Set(), entries: [{ id: "a" }] }),
    false,
    "fresh tab, first save: must survive (nothing was ever seen)"
  );
  assert.equal(
    wouldWipe({ raw: null, version: 0, knownIds: new Set(["a"]), entries: [{ id: "a" }] }),
    true,
    "tab that saw entries, store gone: must adopt the wipe"
  );
  assert.equal(
    wouldWipe({ raw: "{}", version: 100, knownIds: new Set(["a"]), entries: [{ id: "a" }] }),
    false,
    "stored copy present: must never wipe"
  );
  assert.equal(
    wouldWipe({ raw: null, version: 0, knownIds: new Set(), entries: [] }),
    false,
    "no entries held: nothing to wipe"
  );
});
