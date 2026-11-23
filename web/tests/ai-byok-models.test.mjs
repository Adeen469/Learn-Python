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

test("BYOK v2 keeps the old guarantees: browser-only keys, skills ride along", () => {
  // Keys are persisted to this browser only, never the server —
  // through the version-stamped writer (R2-L19), so a second tab
  // cannot re-persist keys the first tab deleted.
  assert.ok(aiHook.includes('writeByokStoreLocal(byokStore)'), "keys must persist to this browser only, version-stamped");
  assert.ok(aiHook.includes('localStorage.setItem("lp_ai_byok", JSON.stringify({ ...store, v }))'), "the persisted copy must carry a version stamp");
  assert.ok(aiHook.includes('localStorage.setItem("lp_ai_selector_models"'), "selector choices must persist to this browser only");
  // The privacy note must say keys are sent only when BYOK is on.
  assert.ok(en.includes("only when BYOK is on"), "the privacy note must state the new rule");
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
