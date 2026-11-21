// Generate src/lib/ai-skills.generated.ts from the .md skill files in
// src/lib/ai-skills/ (the source of truth — downloaded once from the
// user's Drive folder, NOT connected to Drive at runtime).
//
// Each skill file has YAML frontmatter with at least `name` and a folded
// `description: >` block; the body after the frontmatter is the skill's
// instructions. The generated module is what the server imports, so the
// skill text is bundled at build time (no runtime file reads on Vercel).
// Run after changing any skill file: `node scripts/generate-ai-skills.mjs`
// (also wired into `prebuild` in package.json, so Vercel regenerates it).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "ai-skills");
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "ai-skills.generated.ts");
const metaOut = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "ai-skills-meta.generated.ts");

function parseSkill(text) {
  const normalized = text.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("skill file has no YAML frontmatter");
  const [, front, body] = match;
  const lines = front.split("\n");
  let name = "";
  let description = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nameMatch = /^name:\s*(.+?)\s*$/.exec(line);
    if (nameMatch) name = nameMatch[1];
    const inlineDesc = /^description:\s*(.+?)\s*$/.exec(line);
    if (inlineDesc && inlineDesc[1] !== ">") description = inlineDesc[1];
    if (/^description:\s*>\s*$/.test(line)) {
      // Folded scalar: following indented lines, joined with spaces,
      // until the next `key:` line or the end of the frontmatter.
      const parts = [];
      for (let j = i + 1; j < lines.length; j++) {
        const cont = lines[j];
        if (!/^\s+\S/.test(cont)) break;
        if (/^\s*[a-z][a-z0-9-]*:/.test(cont)) break;
        parts.push(cont.trim());
      }
      description = parts.join(" ");
    }
  }
  if (!name) throw new Error("skill file has no frontmatter name");
  if (!description) throw new Error(`skill ${name} has no frontmatter description`);
  return { id: name, name, description, content: body.trim() };
}

const files = readdirSync(dir)
  .filter((f) => f.endsWith(".md"))
  .sort();
if (files.length === 0) throw new Error("no skill files found in src/lib/ai-skills");
const skills = files.map((f) => parseSkill(readFileSync(join(dir, f), "utf8")));
skills.sort((a, b) => a.id.localeCompare(b.id));

const header = `// GENERATED — do not edit by hand. Run \`node scripts/generate-ai-skills.mjs\`
// after changing any file in src/lib/ai-skills/. The .md files are the
// source of truth (downloaded once from the user's Drive folder — the app
// never connects to Drive at runtime); this module is what the server
// imports, so the skill text is bundled at build time.
export interface BuiltinAiSkill {
  id: string;
  name: string;
  description: string;
  content: string;
}
export const BUILTIN_AI_SKILLS: BuiltinAiSkill[] = ${JSON.stringify(skills, null, 2)};
/** Skill ids active by default in the editor AI panel. */
export const DEFAULT_ACTIVE_SKILL_IDS: string[] = ["ponytail"];
`;
writeFileSync(out, header);
console.log(`wrote ${out} (${skills.length} skills: ${skills.map((s) => s.id).join(", ")})`);
// A second, content-free module for client components (the settings
// list only needs id/name/description). Importing the full module in
// a client component would ship every skill's text to the browser.
const metaHeader = `// GENERATED — do not edit by hand. Run \`node scripts/generate-ai-skills.mjs\`
// after changing any file in src/lib/ai-skills/. Same source as
// ai-skills.generated.ts, but without the skill bodies, so client
// components can list the built-in skills without bundling their text.
export interface BuiltinAiSkillMeta {
  id: string;
  name: string;
  description: string;
}
export const BUILTIN_AI_SKILL_META: BuiltinAiSkillMeta[] = ${JSON.stringify(
  skills.map((s) => ({ id: s.id, name: s.name, description: s.description })),
  null,
  2
)};
`;
writeFileSync(metaOut, metaHeader);
console.log(`wrote ${metaOut}`);
