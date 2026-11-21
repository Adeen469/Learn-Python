// GENERATED — do not edit by hand. Run `node scripts/generate-ai-skills.mjs`
// after changing any file in src/lib/ai-skills/. Same source as
// ai-skills.generated.ts, but without the skill bodies, so client
// components can list the built-in skills without bundling their text.
export interface BuiltinAiSkillMeta {
  id: string;
  name: string;
  description: string;
}
export const BUILTIN_AI_SKILL_META: BuiltinAiSkillMeta[] = [
  {
    "id": "gstack",
    "name": "gstack",
    "description": "Router for the gstack skill suite. (gstack)"
  },
  {
    "id": "ponytail",
    "name": "ponytail",
    "description": "Forces the laziest solution that actually works, simplest, shortest, most minimal. Channels a senior dev who has seen everything: question whether the task needs to exist at all (YAGNI), reach for the standard library before custom code, native platform features before dependencies, one line before fifty. Supports intensity levels: lite, full (default), ultra. Use on ANY coding task: writing, adding, refactoring, fixing, reviewing, or designing code, and choosing libraries or dependencies. Also use whenever the user says \"ponytail\", \"be lazy\", \"lazy mode\", \"simplest solution\", \"minimal solution\", \"yagni\", \"do less\", or \"shortest path\", or complains about over-engineering, bloat, boilerplate, or unnecessary dependencies. Do NOT use for non-coding requests (general knowledge, prose, translation, summaries, recipes)."
  },
  {
    "id": "ponytail-audit",
    "name": "ponytail-audit",
    "description": "Whole-repo audit for over-engineering. Like ponytail-review, but scans the entire codebase instead of a diff: a ranked list of what to delete, simplify, or replace with stdlib/native equivalents. Use when the user says \"audit this codebase\", \"audit for over-engineering\", \"what can I delete from this repo\", \"find bloat\", \"ponytail-audit\", or \"/ponytail-audit\". One-shot report, does not apply fixes."
  },
  {
    "id": "ponytail-debt",
    "name": "ponytail-debt",
    "description": "Harvest every `ponytail:` comment in the codebase into a debt ledger, so the deliberate shortcuts and deferrals ponytail leaves behind get tracked instead of rotting into \"later means never\". Use when the user says \"ponytail debt\", \"/ponytail-debt\", \"what did ponytail defer\", \"list the shortcuts\", \"ponytail ledger\", or \"what did we mark to do later\". One-shot report, changes nothing."
  },
  {
    "id": "ponytail-gain",
    "name": "ponytail-gain",
    "description": "Show ponytail's measured impact as a compact scoreboard: less code, less cost, more speed, from the benchmark medians. One-shot display, not a persistent mode, and not a per-repo number. Trigger: /ponytail-gain, \"ponytail gain\", \"what does ponytail save\", \"show ponytail impact\", \"ponytail scoreboard\"."
  },
  {
    "id": "ponytail-help",
    "name": "ponytail-help",
    "description": "Quick-reference card for all ponytail modes, skills, and commands. One-shot display, not a persistent mode. Trigger: /ponytail-help, \"ponytail help\", \"what ponytail commands\", \"how do I use ponytail\"."
  },
  {
    "id": "ponytail-review",
    "name": "ponytail-review",
    "description": "Code review focused exclusively on over-engineering. Finds what to delete: reinvented standard library, unneeded dependencies, speculative abstractions, dead flexibility. One line per finding: location, what to cut, what replaces it. Use when the user says \"review for over-engineering\", \"what can we delete\", \"is this over-engineered\", \"simplify review\", or invokes /ponytail-review. Complements correctness-focused review, this one only hunts complexity."
  }
];
