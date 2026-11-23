// AI Settings card — opened from the AI panel's ⋮ menu, it takes the
// code editor's place in the centre column (not movable, not a dock
// panel): a drill-down menu (Skills / BYOK) — each row opens its own
// sub-page. Everything here lives in this browser; the server never
// stores a skill or a key. Moved verbatim from page.tsx (F1 split).
import type { Strings } from "@/lib/i18n";
import { ArrowLeft, ChevronRight, KeyRound, Trash2 } from "lucide-react";
import { BUILTIN_AI_SKILL_META } from "@/lib/ai-skills-meta.generated";
import type { EditorAi } from "../hooks/useEditorAi";
import type { AiByokProvider } from "../hooks/useEditorAi";

export function AiSettingsCard({ t, ai }: { t: Strings; ai: EditorAi }) {
  const {
    settingsSection, setSettingsSection, setCentreView,
    customSkills, activeSkillIds, toggleSkill, deleteCustomSkill,
    newSkillName, setNewSkillName, newSkillDesc, setNewSkillDesc,
    newSkillContent, setNewSkillContent, addCustomSkill,
    MODEL_GROUPS, selectorModels, toggleSelectorModel, modelQualityTag,
    byokStore, setByokMaster, toggleByokEntry, removeByokEntry,
    BYOK_PROVIDER_NAMES, byokProvider, setByokProvider,
    byokKey, setByokKey, byokBaseUrl, setByokBaseUrl,
    byokModel, setByokModel, saveByokEntry,
  } = ai;
  return (
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
}
