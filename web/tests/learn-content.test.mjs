// Static checks over the Learn content (topic tutorials + reference
// entries). Mirrors the old tutorials-content suite, but for the
// W3Schools-style topic structure: every sidebar topic must have
// exactly one content entry, and every entry must be complete.
// Fully static (reads the .ts files as text) — no TS import needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const learnDir = join(webDir, "src/lib/learn");

const TUTORIAL_FILES = [
  "learn-basics.ts",
  "learn-functions-advanced.ts",
  "learn-classes.ts",
  "learn-file-modules.ts",
  "learn-matplotlib.ts",
  "learn-ml.ts",
  "learn-dsa.ts",
  "learn-databases.ts",
];
const REFERENCE_FILES = [
  "ref-builtins.ts",
  "ref-string-methods.ts",
  "ref-collection-methods.ts",
  "ref-file-keywords.ts",
  "ref-modules.ts",
];

function read(name) {
  return readFileSync(join(learnDir, name), "utf8").replace(/\r\n/g, "\n");
}

/** Slugs declared in a file, in order. */
function slugsIn(text) {
  return [...text.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

/** Split a content file into one chunk per entry (each starts at `slug:`). */
function entriesIn(text) {
  const parts = text.split(/(?=slug:\s*")/);
  return parts.filter((p) => /slug:\s*"/.test(p));
}

test("all Learn content files exist", () => {
  for (const f of [...TUTORIAL_FILES, ...REFERENCE_FILES, "sidebar.ts", "types.ts", "index.ts"]) {
    assert.ok(existsSync(join(learnDir, f)), `missing ${f}`);
  }
});

test("every sidebar topic has exactly one content entry", () => {
  const sidebarSlugs = slugsIn(read("sidebar.ts"));
  assert.equal(new Set(sidebarSlugs).size, 812, "sidebar must list 812 unique topics");
  const tutorialSlugs = TUTORIAL_FILES.flatMap((f) => slugsIn(read(f)));
  const referenceSlugs = REFERENCE_FILES.flatMap((f) => slugsIn(read(f)));
  assert.equal(tutorialSlugs.length, 268, `expected 268 tutorials, got ${tutorialSlugs.length}`);
  assert.equal(referenceSlugs.length, 544, `expected 544 references, got ${referenceSlugs.length}`);
  assert.equal(new Set(tutorialSlugs).size, 268, "duplicate tutorial slug");
  assert.equal(new Set(referenceSlugs).size, 544, "duplicate reference slug");
  const inSidebar = new Set(sidebarSlugs);
  for (const s of [...tutorialSlugs, ...referenceSlugs]) {
    assert.ok(inSidebar.has(s), `content slug not in sidebar: ${s}`);
  }
  const overlap = tutorialSlugs.filter((s) => new Set(referenceSlugs).has(s));
  assert.deepEqual(overlap, [], `slugs in both: ${overlap.join(", ")}`);
  const covered = new Set([...tutorialSlugs, ...referenceSlugs]);
  const missing = sidebarSlugs.filter((s) => !covered.has(s));
  assert.deepEqual(missing, [], `topics without content: ${missing.slice(0, 10).join(", ")}`);
});

test("every tutorial is complete", () => {
  for (const f of TUTORIAL_FILES) {
    for (const entry of entriesIn(read(f))) {
      const slug = entry.match(/slug:\s*"([^"]+)"/)[1];
      assert.ok(/intro:\s*"/.test(entry), `${slug}: no intro`);
      const codeBlocks = (entry.match(/type:\s*"code"/g) || []).length;
      const outputs = (entry.match(/output:\s*["`]/g) || []).length;
      assert.ok(codeBlocks >= 2, `${slug}: only ${codeBlocks} code blocks`);
      assert.ok(outputs >= codeBlocks, `${slug}: ${codeBlocks} code blocks but ${outputs} outputs`);
      assert.ok(/practice:\s*\[/.test(entry), `${slug}: no practice`);
      assert.ok(/summary:\s*\[/.test(entry), `${slug}: no summary`);
      assert.ok(!/type:\s*"code"[^}]*output:\s*undefined/.test(entry), `${slug}: undefined output`);
    }
  }
});

test("every reference entry is complete", () => {
  for (const f of REFERENCE_FILES) {
    for (const entry of entriesIn(read(f))) {
      const slug = entry.match(/slug:\s*"([^"]+)"/)[1];
      assert.ok(/description:\s*"/.test(entry), `${slug}: no description`);
      assert.ok(/exampleCode:\s*`/.test(entry), `${slug}: no example code`);
    }
  }
});

test("no placeholders in Learn content", () => {
  for (const f of [...TUTORIAL_FILES, ...REFERENCE_FILES]) {
    const text = read(f);
    assert.ok(!/\bTODO\b/.test(text), `${f}: contains TODO`);
    assert.ok(!/coming soon/i.test(text), `${f}: contains 'coming soon'`);
    assert.ok(!/lorem ipsum/i.test(text), `${f}: contains lorem ipsum`);
  }
});

test("lesson pages show a text-selection toolbar (Ask to AI, Translate dropdown, Copy)", () => {
  const toolbar = readFileSync(join(webDir, "src/components/TextSelectionToolbar.tsx"), "utf8");
  // The three actions Maalik asked for.
  assert.ok(toolbar.includes("t.selectionToolbar.askAi"), "the toolbar must have an Ask to AI action");
  assert.ok(toolbar.includes("t.selectionToolbar.translate"), "the toolbar must have a Translate action");
  assert.ok(toolbar.includes("t.selectionToolbar.copy"), "the toolbar must have a Copy action");
  // Translate is a dropdown of the 11 app languages.
  assert.ok(toolbar.includes("LANGUAGES.map"), "the Translate dropdown must list the app languages");
  assert.ok(toolbar.includes("translateOpen"), "the Translate dropdown must open/close");
  // Ask to AI goes through the existing /api/ai route with the
  // single default AI — no mode field is sent.
  assert.ok(toolbar.includes('"/api/ai"'), "Ask to AI must call the existing /api/ai route");
  assert.ok(!toolbar.includes('mode: "tutor"'), "Ask to AI must not send a mode — one default AI answers every prompt");
  assert.ok(toolbar.includes("Explain this text from the Python lesson"), "Ask to AI must send the selected text with the lesson title");
  // Translate replaces the selected text IN PLACE in the lesson — never
  // a separate panel. The translated span restores the original on click.
  assert.ok(toolbar.includes("Translate this text to"), "Translate must ask the AI to translate the selected text");
  assert.ok(toolbar.includes("replaceSelectionWithTranslation"), "Translate must replace the selected text in place");
  assert.ok(toolbar.includes("deleteContents"), "the in-place translation must remove the selected text");
  assert.ok(toolbar.includes("insertNode"), "the in-place translation must insert the translated text at the selection");
  assert.ok(toolbar.includes("data-translated"), "the translated text must be marked so it can be restored");
  assert.ok(toolbar.includes("data-original"), "the translated text must carry the original text for restore");
  assert.ok(toolbar.includes("t.selectionToolbar.showOriginal"), "the translated text must say clicking it shows the original");
  assert.ok(toolbar.includes("t.selectionToolbar.translating"), "the toolbar must show a Translating state while the translation loads");
  // Ask to AI opens a card that is MOVEABLE (drag by header) and can be
  // MINIMIZED (collapse to the header bar, maximize restores it).
  assert.ok(toolbar.includes("onCardHeaderPointerDown"), "the AI card must be draggable by its header");
  assert.ok(toolbar.includes("pointermove"), "dragging the AI card must track pointer movement");
  assert.ok(toolbar.includes("cardMinimized"), "the AI card must support a minimized state");
  assert.ok(toolbar.includes("t.selectionToolbar.minimize"), "the AI card must have a minimize action");
  assert.ok(toolbar.includes("t.selectionToolbar.maximize"), "the AI card must have a maximize action");
  assert.ok(toolbar.includes("cursor-grab"), "the AI card header must look draggable");
  // Copy uses the clipboard and shows feedback.
  assert.ok(toolbar.includes("navigator.clipboard.writeText"), "Copy must write the selected text to the clipboard");
  assert.ok(toolbar.includes("t.selectionToolbar.copied"), "Copy must show a Copied state");
  // The toolbar only appears for real text selected inside the lesson article.
  assert.ok(toolbar.includes('closest("article")'), "the toolbar must only trigger inside the lesson article");
  assert.ok(toolbar.includes("getSelection"), "the toolbar must read the live text selection");
  assert.ok(toolbar.includes("getBoundingClientRect"), "the toolbar must position itself above the selection");
  // A click on the Translate button re-runs the selection check with the
  // SAME text — the dropdown must stay open (it only closes on a new
  // selection or when the selection clears).
  assert.ok(toolbar.includes("sameSelection"), "the toolbar must keep the Translate dropdown open when the same selection is re-confirmed");
  assert.ok(toolbar.includes("selectionTextRef"), "the toolbar must track the current selection text to detect a new selection");
  // The Translate dropdown opens BELOW the toolbar (top-full), never
  // above it — above the toolbar it would clip off the top of the
  // viewport when the selection is near the top of the page.
  assert.ok(toolbar.includes("top-full"), "the Translate dropdown must open below the toolbar so it never clips off the top of the viewport");
  // The AI card shows the answer with its own Copy + Close.
  assert.ok(toolbar.includes("t.selectionToolbar.aiAnswerTitle"), "the AI card must title AI answers");
  assert.ok(toolbar.includes("t.selectionToolbar.translationTitle"), "the AI card must title translation errors");
  assert.ok(toolbar.includes("t.selectionToolbar.thinking"), "the AI card must show a thinking state");
  // The lesson page renders the toolbar.
  const page = readFileSync(join(webDir, "src/app/learn/[slug]/page.tsx"), "utf8");
  assert.ok(page.includes("TextSelectionToolbar"), "the lesson page must render the selection toolbar");
  assert.ok(page.includes('from "@/components/TextSelectionToolbar"'), "the lesson page must import the toolbar");
  // i18n: the keys must exist in the type and all 11 languages.
  const index = readFileSync(join(webDir, "src/lib/i18n/index.tsx"), "utf8");
  assert.ok(index.includes("selectionToolbar: {"), "the Strings type must have a selectionToolbar section");
  for (const lang of ["en", "hi-roman", "fr", "ja", "ko", "es", "de", "pt", "ru", "ar", "zh"]) {
    const s = readFileSync(join(webDir, `src/lib/i18n/${lang}.ts`), "utf8");
    assert.ok(s.includes("selectionToolbar: {"), `${lang} must have a selectionToolbar section`);
    assert.ok(s.includes("askAi:"), `${lang} must have selectionToolbar.askAi`);
    assert.ok(s.includes("translate:"), `${lang} must have selectionToolbar.translate`);
    assert.ok(s.includes("translationTitle:"), `${lang} must have selectionToolbar.translationTitle`);
    assert.ok(s.includes("translating:"), `${lang} must have selectionToolbar.translating`);
    assert.ok(s.includes("showOriginal:"), `${lang} must have selectionToolbar.showOriginal`);
    assert.ok(s.includes("minimize:"), `${lang} must have selectionToolbar.minimize`);
    assert.ok(s.includes("maximize:"), `${lang} must have selectionToolbar.maximize`);
  }
  const en = readFileSync(join(webDir, "src/lib/i18n/en.ts"), "utf8");
  assert.ok(en.includes('askAi: "Ask to AI"'), "the English Ask to AI label must be 'Ask to AI'");
});

test("lesson pages are full width (no width caps)", () => {
  // The outer learn container must not cap the width, and the lesson
  // article must not cap its own width either — the content stretches
  // to the edges on wide screens (Maalik's order, 2026-11-19).
  const layout = readFileSync(join(webDir, "src/app/learn/layout.tsx"), "utf8");
  assert.ok(!layout.includes("max-w-6xl"), "the learn container must not cap the width at max-w-6xl");
  assert.ok(!layout.includes("max-w-"), "the learn container must not have any max-w cap");
  const page = readFileSync(join(webDir, "src/app/learn/[slug]/page.tsx"), "utf8");
  assert.ok(!page.includes("<article className=\"mx-auto max-w-3xl\">"), "the lesson article must not cap the width at max-w-3xl");
  assert.ok(page.includes("<article>"), "the lesson article must render without a width cap");
});

test("the lessons route has its own loading skeleton (not the dashboard one)", () => {
  // The lessons page must skeleton the lesson article (heading +
  // paragraphs + code block), not the dashboard layout (video area +
  // progress cards) from the root loading.tsx — that looked like the
  // courses page while a lesson loaded (Maalik's order, 2026-11-19).
  const loading = readFileSync(join(webDir, "src/app/learn/loading.tsx"), "utf8");
  assert.ok(loading.includes("<article"), "the lessons loading skeleton must be an article");
  assert.ok(loading.includes("animate-pulse"), "the lessons loading skeleton must pulse");
  assert.ok(!loading.includes("aspect-video"), "the lessons skeleton must not show a video area");
  assert.ok(!loading.includes("lg:grid-cols-3"), "the lessons skeleton must not use the dashboard 3-column layout");
});

test("lesson code blocks are syntax-highlighted and carry a Try-it button", () => {
  // Every code example must be syntax-highlighted (not plain white
  // text) and must carry its own "Try it in the editor" button that
  // opens that exact snippet in the editor — the single top-of-lesson
  // button is gone (Maalik's order, 2026-11-19).
  const page = readFileSync(join(webDir, "src/app/learn/[slug]/page.tsx"), "utf8");
  assert.ok(page.includes("highlightPython"), "the lesson page must use the Python highlighter");
  assert.ok(page.includes("{highlightPython(code)}"), "each code block must render highlighted code");
  assert.ok(page.includes('sessionStorage.setItem("lp_try_it_code"'), "the Try-it button must hand the snippet to the editor via sessionStorage");
  assert.ok(page.includes('href="/editor"'), "each code block must link to the editor");
  assert.ok(!page.includes('<Code2 className="h-4 w-4" /> {t.learnPage.tryInEditor}'), "the top-of-lesson Try-it button must be gone");
  const hl = readFileSync(join(webDir, "src/lib/python-highlight.tsx"), "utf8");
  assert.ok(hl.includes("text-violet-300"), "keywords must be coloured violet");
  assert.ok(hl.includes("text-emerald-300"), "strings must be coloured green");
  assert.ok(hl.includes("text-neutral-500"), "comments must be coloured grey");
  assert.ok(hl.includes("text-orange-300"), "numbers must be coloured orange");
  assert.ok(hl.includes("text-sky-300"), "builtins and function calls must be coloured blue");
});

test("the editor opens a Try-it snippet as try-it.py", () => {
  // A lesson's Try-it button stores the snippet in sessionStorage and
  // the editor opens it as try-it.py without touching the user's other
  // workspace files (Maalik's order, 2026-11-19). The mount effect
  // that reads the handoff lives in the workspace/repo hook (F1 split).
  const editor = readFileSync(join(webDir, "src/app/editor/hooks/useWorkspaceRepo.ts"), "utf8");
  assert.ok(editor.includes('sessionStorage.getItem("lp_try_it_code")'), "the editor must read the Try-it handoff");
  assert.ok(editor.includes('sessionStorage.removeItem("lp_try_it_code")'), "the editor must consume the handoff once");
  assert.ok(editor.includes('"try-it.py"'), "the snippet must open as try-it.py");
  assert.ok(editor.includes('setActiveFilePath("try-it.py")'), "try-it.py must become the active file");
});

test("the lesson header puts Mark as complete on the same row as the title (right side)", () => {
  // Maalik's order, 2026-11-19: the button must sit on the same
  // vertical line as the lesson name, on the opposite (right) side —
  // not in a row below the intro.
  const page = readFileSync(join(webDir, "src/app/learn/[slug]/page.tsx"), "utf8");
  assert.ok(page.includes('className="flex flex-wrap items-center justify-between gap-3"'), "the header must be a flex row with the title left and the button right");
  assert.ok(!page.includes('<div className="mt-4 flex flex-wrap items-center gap-2">'), "the old below-the-intro button row must be gone");
});

test("the code-block output is white, not green", () => {
  // Maalik's order, 2026-11-19: keep the OUTPUT text white.
  const page = readFileSync(join(webDir, "src/app/learn/[slug]/page.tsx"), "utf8");
  assert.ok(page.includes('text-neutral-100">{output}</code>') || page.includes('text-neutral-100">'), "the output must be white");
  assert.ok(!page.includes('text-emerald-300/90">{output}'), "the output must not be green");
});

test("the desktop sidebar sticks exactly below the navbar (69px) so it never shifts on scroll", () => {
  // Maalik's order, 2026-11-19: the sidebar used to slide ~12px when
  // the lesson scrolled, because it stuck at top-57px while the
  // navbar is 69px tall. The sticky offset and height must match the
  // measured navbar height. The offline banner adds its own height on
  // top when it shows (2026-11-22) — the 69px base never changes.
  const sb = readFileSync(join(webDir, "src/components/LearnSidebar.tsx"), "utf8");
  assert.ok(sb.includes("top-[calc(69px+var(--offline-banner-h,0px))]"), "the sidebar must stick at the real navbar height (69px) plus the offline banner when it shows");
  assert.ok(sb.includes("h-[calc(100vh-69px-var(--offline-banner-h,0px))]"), "the sidebar height must use the same 69px plus banner");
  assert.ok(!sb.includes("top-[57px]"), "the old 57px offset must be gone");
});

test("the breadcrumb row carries a Next button to the lesson after the last completed one", () => {
  // Maalik's order, 2026-11-19: a short "Next" button sits above the
  // Mark-as-complete button, aligned with the breadcrumb on the right,
  // and jumps to the lesson after the last completed one (in
  // curriculum order — no timestamps needed). It hides when there is
  // no next lesson, or when it would point at the page itself.
  const page = readFileSync(join(webDir, "src/app/learn/[slug]/page.tsx"), "utf8");
  assert.ok(page.includes("lastCompletedIdx"), "the page must find the furthest-along completed lesson");
  assert.ok(page.includes("continueTopic"), "the page must compute the lesson after the last completed one");
  assert.ok(page.includes("showContinue"), "the button must hide when there is no next lesson");
  assert.ok(!page.includes("continueTopic.slug !== slug"), "the button must NOT hide on the page it points to — it shows on every lesson page, completed or not (Maalik, 2026-11-19)");
  assert.ok(page.includes('className="flex flex-wrap items-center justify-between gap-3"'), "the breadcrumb row must put the button on the right");
  assert.ok(page.includes("t.lesson.upNext"), "the button must use the short Up Next label (Maalik's pick, 2026-11-19)");
  assert.ok(page.includes('href={`/learn/${continueTopic.slug}`}'), "the button must link to the next lesson");
});

test("the breadcrumb row carries a Resume button to the lesson left off — only when it differs from Up Next", () => {
  // Maalik's decision, 2026-11-22 (delegated): keep both — Resume
  // (solid) + Up Next (outline), dynamic names, shown together only
  // when they point at different lessons. Resume needs last-visited
  // tracking: the visit is recorded on arrival, but the button keeps
  // the value from BEFORE this visit, so it never vanishes the moment
  // the page is recorded.
  const page = readFileSync(join(webDir, "src/app/learn/[slug]/page.tsx"), "utf8");
  assert.ok(page.includes("lp_last_visited"), "visits must be recorded under lp_last_visited");
  assert.ok(page.includes("resumeSlug"), "the page must keep the pre-visit lesson as the resume target");
  assert.ok(page.includes("resumeTopic"), "the page must resolve the resume slug to a topic");
  assert.ok(page.includes("showResume"), "Resume must hide when there is nothing useful to resume");
  assert.ok(page.includes("resumeTopic.slug !== slug"), "Resume must not point at the page itself");
  assert.ok(page.includes("resumeTopic.slug !== continueTopic?.slug"), "Resume must hide when Up Next already points there");
  assert.ok(page.includes("t.lesson.resume"), "the button must use the Resume label");
  assert.ok(page.includes('href={`/learn/${resumeTopic.slug}`}'), "the button must link to the resumed lesson");
  assert.ok(page.includes("bg-white px-2.5 py-1.5 text-xs font-medium text-black"), "Resume must be the solid button");
  const en = readFileSync(join(webDir, "src/lib/i18n/en.ts"), "utf8");
  assert.ok(en.includes('resume: "Resume:"'), "the Resume label must read Resume:");
});

// ---- Issue 5: lazy loading (no page ships every language / lesson) ----

const NON_EN_LANGS = ["hi-roman", "fr", "ja", "ko", "es", "de", "pt", "ru", "ar", "zh"];
const OVERLAY_CHUNKS = [
  "tutorials-basics-1",
  "tutorials-basics-2",
  "tutorials-functions-matplotlib",
  "tutorials-classes-filemodules",
  "tutorials-ml-databases-dsa",
  "references-modules",
  "references-others",
];

test("lazy i18n: only English is statically imported; other languages load on demand", () => {
  // Every page used to ship all 11 UI locales + titles + blurbs.
  // Now only English (the fallback and the default) is static; each
  // other language's Strings + titles + blurbs arrive via dynamic
  // import() when that language becomes active, and the provider
  // keeps rendering English until the chunk arrives.
  const index = readFileSync(join(webDir, "src/lib/i18n/index.tsx"), "utf8");
  for (const lang of NON_EN_LANGS) {
    assert.ok(!index.includes(`from "./${lang}"`), `must not statically import ./${lang}`);
    assert.ok(!index.includes(`from "./titles/${lang}"`), `must not statically import ./titles/${lang}`);
    assert.ok(!index.includes(`from "./blurbs/${lang}"`), `must not statically import ./blurbs/${lang}`);
    assert.ok(index.includes(`import("./${lang}")`), `must dynamically import ./${lang}`);
    assert.ok(index.includes(`import("./titles/${lang}")`), `must dynamically import ./titles/${lang}`);
    assert.ok(index.includes(`import("./blurbs/${lang}")`), `must dynamically import ./blurbs/${lang}`);
  }
  assert.ok(index.includes('from "./en"'), "English strings must stay statically imported");
  assert.ok(index.includes('from "./titles/en"'), "English titles must stay statically imported");
  assert.ok(index.includes('from "./blurbs/en"'), "English blurbs must stay statically imported");
  assert.ok(!index.includes('import("./en")'), "English must stay static, never dynamic");
  assert.ok(index.includes("loadLanguageBundle(lang)"), "the provider must load the active language's bundle");
  assert.ok(index.includes("EN_BUNDLE"), "English must be the bundle while a locale loads");
  // Public API unchanged.
  assert.ok(index.includes("export function getCurrentStrings()"), "getCurrentStrings must stay exported");
  assert.ok(index.includes("export function useLanguage()"), "useLanguage must stay exported");
  assert.ok(index.includes("export const LANGUAGES"), "LANGUAGES must stay exported");
});

test("lazy learn overlays: a language's translation chunks load on demand only", () => {
  // All ~70 overlay chunks used to be statically imported. Now none
  // is: loadTranslations(lang) fetches that language's 7 chunks with
  // dynamic import(), merges them once, and the sync getters keep
  // returning {} (English fallback) until they arrive.
  const src = readFileSync(join(webDir, "src/lib/learn/i18n/index.ts"), "utf8");
  for (const lang of NON_EN_LANGS) {
    for (const chunk of OVERLAY_CHUNKS) {
      assert.ok(
        !src.includes(`} from "./${lang}/${chunk}"`),
        `must not statically import ./${lang}/${chunk}`
      );
      assert.ok(
        src.includes(`import("./${lang}/${chunk}")`),
        `must dynamically import ./${lang}/${chunk}`
      );
    }
  }
  assert.ok(src.includes("export function loadTranslations"), "loadTranslations must be exported");
  assert.ok(src.includes("export function getTutorialTranslations"), "getTutorialTranslations must stay sync and exported");
  assert.ok(src.includes("export function getReferenceTranslations"), "getReferenceTranslations must stay sync and exported");
  assert.ok(src.includes('if (lang === "en") return {};'), "English must still return empty maps");
});

test("lazy learn corpus: one chunk per slug, resolved from the sidebar", () => {
  // The whole ~21k-line corpus used to be statically merged into
  // ALL_TUTORIALS / ALL_REFERENCES. Now no chunk file is statically
  // imported, the getters are async, and the slug -> chunk map comes
  // from the sidebar (section + group), which the lesson page already
  // imports. This test re-resolves every sidebar topic through the
  // tables in index.ts and checks it lands on the chunk file that
  // actually contains that slug — so a topic added to a new group, or
  // a group moved to another file, fails here instead of silently
  // loading the wrong chunk (or none).
  const src = readFileSync(join(webDir, "src/lib/learn/index.ts"), "utf8");
  for (const f of [...TUTORIAL_FILES, ...REFERENCE_FILES]) {
    const base = f.replace(/\.ts$/, "");
    assert.ok(!src.includes(`from "./${base}"`), `must not statically import ./${base}`);
    assert.ok(src.includes(`import("./${base}")`), `must dynamically import ./${base}`);
  }
  assert.ok(!src.includes("ALL_TUTORIALS"), "the merged ALL_TUTORIALS array must be gone");
  assert.ok(!src.includes("ALL_REFERENCES"), "the merged ALL_REFERENCES array must be gone");
  assert.ok(src.includes("export async function getLearnTutorial"), "getLearnTutorial must be async");
  assert.ok(src.includes("export async function getLearnReference"), "getLearnReference must be async");

  // Counts must keep working without loading the corpus, and must
  // match the slugs actually in the chunk files.
  const tutorialSlugs = TUTORIAL_FILES.flatMap((f) => slugsIn(read(f)));
  const referenceSlugs = REFERENCE_FILES.flatMap((f) => slugsIn(read(f)));
  const tCount = Number(src.match(/TUTORIAL_COUNT = (\d+)/)?.[1]);
  const rCount = Number(src.match(/REFERENCE_COUNT = (\d+)/)?.[1]);
  assert.equal(tCount, tutorialSlugs.length, `TUTORIAL_COUNT must be ${tutorialSlugs.length}`);
  assert.equal(rCount, referenceSlugs.length, `REFERENCE_COUNT must be ${referenceSlugs.length}`);
  assert.ok(src.includes("export function tutorialCount()"), "tutorialCount must stay exported");
  assert.ok(src.includes("export function referenceCount()"), "referenceCount must stay exported");

  // Parse the routing tables out of index.ts (plain "key": "value" pairs).
  const table = (name) => {
    const block = src.match(new RegExp(`const ${name}[^=]*= \\{([\\s\\S]*?)\\n\\};`))?.[1];
    assert.ok(block, `${name} table must exist in index.ts`);
    return Object.fromEntries([...block.matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));
  };
  const sectionChunk = table("SECTION_CHUNK");
  const groupChunk = table("GROUP_CHUNK");

  // Sidebar topics in order, tracking the current section + group.
  const sidebar = read("sidebar.ts");
  const slugToFile = {};
  for (const f of [...TUTORIAL_FILES, ...REFERENCE_FILES]) {
    for (const s of slugsIn(read(f))) slugToFile[s] = f.replace(/\.ts$/, "");
  }
  let section = null;
  let group = null;
  let checked = 0;
  for (const line of sidebar.split("\n")) {
    const id = line.match(/id: "([^"]+)"/);
    if (id) section = id[1];
    if (/topics: \[/.test(line)) {
      group = line.match(/title: "([^"]+)"/)?.[1] ?? null;
    }
    // A group line holds all of its topics on one line, so take
    // every slug on the line, not just the first.
    for (const m of line.matchAll(/slug: "([^"]+)"/g)) {
      const slug = m[1];
      const resolved = groupChunk[`${section}::${group}`] ?? sectionChunk[section];
      assert.ok(resolved, `${slug}: no chunk for section ${section} / group ${group}`);
      assert.equal(resolved, slugToFile[slug], `${slug} must resolve to ${slugToFile[slug]}, not ${resolved}`);
      checked++;
    }
  }
  assert.equal(checked, 812, `must check all 812 sidebar topics, checked ${checked}`);
});

test("lesson page awaits the lesson chunk and keeps the not-written case", () => {
  const page = readFileSync(join(webDir, "src/app/learn/[slug]/page.tsx"), "utf8");
  assert.ok(page.includes("await getLearnTutorial(slug)"), "the page must await the tutorial chunk");
  assert.ok(page.includes("await getLearnReference(slug)"), "the page must await the reference chunk when there is no tutorial");
  assert.ok(!page.includes("const rawTutorial = getLearnTutorial(slug)"), "the page must not call the loader synchronously during render");
  assert.ok(page.includes("contentReady"), "the page must track whether the chunk has arrived");
  assert.ok(page.includes("animate-pulse"), "the page must show a loading state while the chunk loads");
  assert.ok(page.includes("t.learnPage.tutorialBeingPrepared"), "the not-written-yet case must stay");
  assert.ok(page.includes("contentFailed"), "a failed chunk load must be a distinct state, not 'not written yet'");
  assert.ok(page.includes("t.common.retry"), "a failed chunk load must offer a retry");
});

test("topic slugs list matches the sidebar exactly (order + count)", () => {
  // The navbar / offline warmer only need ordered slugs, so they
  // import the small LEARN_TOPIC_SLUGS list instead of the whole
  // sidebar tree. That list is a second copy of the sidebar order,
  // so it must be pinned here: any topic added, removed, reordered
  // or renamed in sidebar.ts fails this test until topic-slugs.ts
  // is regenerated from it (same extractor, in order).
  const sidebarSlugs = slugsIn(read("sidebar.ts"));
  const slugsSrc = read("topic-slugs.ts");
  const listed = [...slugsSrc.matchAll(/^  "([^"]+)",$/gm)].map((m) => m[1]);
  assert.equal(listed.length, 812, `expected 812 slugs, got ${listed.length}`);
  assert.deepEqual(listed, sidebarSlugs, "LEARN_TOPIC_SLUGS must list the sidebar slugs in order");
  // The count is a literal (not .length) so chunks importing only
  // the count do not drag the 812-string array along.
  const count = Number(slugsSrc.match(/LEARN_TOPIC_COUNT = (\d+)/)?.[1]);
  assert.equal(count, 812, `LEARN_TOPIC_COUNT must be 812, got ${count}`);
  assert.equal(count, listed.length, "LEARN_TOPIC_COUNT must match the list");
  assert.ok(!slugsSrc.includes("LEARN_TOPIC_COUNT = LEARN_TOPIC_SLUGS.length"), "the count must stay a literal, never .length");
});

test("lazy lesson index: shared chunks never statically import the sidebar tree", () => {
  // The full sidebar tree (53KB) used to ride the shared layout +
  // navbar chunks on every page: OfflineWarmer (root layout) pulls
  // offline-downloads, and the navbar pulled LEARN_SECTIONS for its
  // Continue button. Now the shared chunks carry only the ~17KB
  // slug list; the tree loads only on Learn pages (LearnSidebar /
  // lib/learn/index) and inside getSavedLessons, when the Settings
  // saved-lessons list actually renders.
  const normalize = (text) => text.replace(/\r\n/g, "\n");
  const downloads = normalize(readFileSync(join(webDir, "src/lib/offline-downloads.ts"), "utf8"));
  const navbar = normalize(readFileSync(join(webDir, "src/components/AppNavbar.tsx"), "utf8"));
  const popup = normalize(readFileSync(join(webDir, "src/components/OfflineDownloadPopup.tsx"), "utf8"));
  for (const [name, src] of [["offline-downloads", downloads], ["AppNavbar", navbar], ["OfflineDownloadPopup", popup]]) {
    assert.ok(!src.includes('from "@/lib/learn/sidebar"'), `${name} must not statically import the sidebar tree`);
  }
  assert.ok(!navbar.includes("ALL_LEARN_TOPICS"), "AppNavbar must not reference ALL_LEARN_TOPICS");
  assert.ok(!popup.includes("ALL_LEARN_TOPICS"), "OfflineDownloadPopup must not reference ALL_LEARN_TOPICS");
  // offline-downloads names ALL_LEARN_TOPICS only inside
  // getSavedLessons (the Settings list): the dynamic import plus
  // its two uses. Everywhere else the slug list is the source.
  const fn = downloads.match(/export async function getSavedLessons\(\)[\s\S]*?\n}\n/)?.[0];
  assert.ok(fn, "getSavedLessons must exist");
  assert.ok(fn.includes('const { ALL_LEARN_TOPICS } = await import("@/lib/learn/sidebar")'), "the tree must load via dynamic import inside getSavedLessons");
  const outside = downloads.replace(fn, "");
  assert.ok(!outside.includes("ALL_LEARN_TOPICS"), "no code outside getSavedLessons may reference ALL_LEARN_TOPICS");
  // The warmer uses the slug list, and only the Settings list loads
  // the full tree — dynamically, never statically.
  assert.ok(downloads.includes('from "@/lib/learn/topic-slugs"'), "offline-downloads must use the slug list");
  assert.ok(downloads.includes('import("@/lib/learn/sidebar")'), "the full tree must load dynamically for the saved-lessons list");
  assert.ok(downloads.includes("getSavedLessons"), "getSavedLessons must stay exported");
  assert.ok(downloads.includes("export function readWarmProgress"), "readWarmProgress must stay sync and exported");
  // The navbar Continue button resolves from slugs only.
  assert.ok(navbar.includes('from "@/lib/learn/topic-slugs"'), "the navbar must use the slug list");
  assert.ok(navbar.includes("LEARN_TOPIC_SLUGS.find"), "Continue must find the first uncompleted slug");
  assert.ok(navbar.replace(/\s+/g, " ").includes('?? "python-home"'), "Continue must fall back to python-home when everything is done");
  // The popup needs the count only.
  assert.ok(popup.includes("LEARN_TOPIC_COUNT"), "the popup must use the topic count");
});
