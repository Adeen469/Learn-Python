// Static checks over the GitHub Integration page (src/app/github/page.tsx)
// and its create-repo API route. Fully static (reads the .ts/.tsx files
// as text) — no TS import needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(webDir, rel), "utf8");
const page = () => read("src/app/github/page.tsx");
const route = () => read("src/app/api/github/repos/route.ts");
const lib = () => read("src/lib/github.ts");
const repoFilesRoute = () => read("src/app/api/github/repo-files/route.ts");
const en = () => read("src/lib/i18n/en.ts");

test("the form and the server reject the same repo names", () => {
  const serverRegex = route().match(/name: z\.string\(\)\.min\(1\)\.max\(100\)\.regex\((\/[^/]+\/)\)/);
  assert.ok(serverRegex, "the server must validate the repo name with a regex");
  assert.ok(page().includes(`REPO_NAME_RE = ${serverRegex[1]}`), "the form must check the exact same regex as the server");
});

test("a bad name is caught on the form with a message that names the problem", () => {
  const p = page();
  assert.ok(p.includes("repoNameError"), "the form must validate the name live");
  // The message text moved to i18n (en.ts githubPage.repoNameInvalidChars);
  // the form must render that key, and the English value must say both
  // what is banned and what is allowed.
  assert.ok(p.includes("t.githubPage.repoNameInvalidChars"), "the form must show the invalid-name message");
  assert.ok(en().includes("can't contain spaces or special characters"), "the error must say spaces and special characters are not allowed");
  assert.ok(en().includes("only letters, numbers, - _ . are allowed"), "the error must say what IS allowed");
  assert.ok(p.includes("aria-invalid={!!repoNameError(newRepoName, t)}"), "the input must be marked invalid");
  assert.ok(p.includes("disabled={creating || !!repoNameError(newRepoName, t)}"), "Create must stay disabled while the name is invalid");
  assert.ok(p.includes("if (repoNameError(newRepoName, t)) return;"), "the submit handler must refuse a bad name even if the button is forced");
});

test("both create-repo options are unchecked by default and the user can change them", () => {
  const p = page();
  assert.ok(p.includes("const [isPublic, setIsPublic] = useState(false)"), "Public must be off by default (private unless the user opts in)");
  assert.ok(p.includes("const [autoInit, setAutoInit] = useState(false)"), "Initialize with README must be off by default");
  assert.ok(p.includes('id="isPublic"'), "the public option must be a checkbox the user can change");
  assert.ok(p.includes('id="autoInit"'), "the README option must be a checkbox the user can change");
  assert.ok(p.includes("isPrivate: !isPublic"), "unchecking Public must create a private repo");
  assert.ok(p.includes("autoInit,"), "the README choice must reach the server, not a hardcoded true");
  assert.ok(!p.includes("autoInit: true"), "the README must not be hardcoded on");
});

test("the form offers GitHub's own .gitignore + license dropdowns (None by default)", () => {
  const p = page();
  assert.ok(p.includes("GITIGNORE_TEMPLATES"), "the form must offer .gitignore templates");
  assert.ok(p.includes('"Python"'), "the .gitignore list must include Python");
  assert.ok(p.includes("LICENSE_TEMPLATES"), "the form must offer licenses");
  assert.ok(p.includes('id: "mit"'), "the license list must include MIT");
  assert.ok(p.includes("t.githubPage.gitignoreLabel"), "the .gitignore dropdown must be labelled");
  assert.ok(p.includes("t.githubPage.licenseLabel"), "the license dropdown must be labelled");
  assert.ok(p.includes("gitignoreTemplate: gitignoreTemplate || undefined"), "a picked .gitignore must reach the server");
  assert.ok(p.includes("licenseTemplate: licenseTemplate || undefined"), "a picked license must reach the server");
  // The server accepts them and the lib forwards them to GitHub.
  assert.ok(route().includes("gitignoreTemplate: z.string().max(100).optional()"), "the server must accept a .gitignore template");
  assert.ok(route().includes("licenseTemplate: z.string().max(100).optional()"), "the server must accept a license template");
  assert.ok(lib().includes("gitignore_template: params.gitignoreTemplate || undefined"), "the lib must forward the .gitignore template");
  assert.ok(lib().includes("license_template: params.licenseTemplate || undefined"), "the lib must forward the license template");
});

test("clicking a repo opens it in the code editor", () => {
  const p = page();
  assert.ok(p.includes("openRepoInEditor"), "clicking a repo must open it in the editor");
  assert.ok(p.includes("/api/github/repo-files?owner="), "the page must fetch the repo's files from the server");
  assert.ok(p.includes('"lp_open_repo"'), "the page must hand the files to the editor via sessionStorage");
  assert.ok(p.includes('router.push("/editor")'), "the page must navigate to the editor");
  assert.ok(p.includes('role="button"'), "the repo card must be clickable");
  assert.ok(p.includes("onClick={() => openRepoInEditor(r)}"), "the card click must open that repo");
  assert.ok(p.includes("t.githubPage.openInEditor"), "the card must say it opens in the editor");
  assert.ok(p.includes("t.githubPage.repoNoFiles"), "an empty repo must explain it has no files to open");
  assert.ok(p.includes("e.stopPropagation()"), "the external GitHub link must not trigger the card click");
});

test("the repo-files route returns a repo's files with caps", () => {
  assert.ok(lib().includes("export async function getRepoFiles"), "the lib must fetch a repo's files");
  assert.ok(lib().includes("REPO_OPEN_MAX_FILES = 100"), "the fetch must cap the file count");
  assert.ok(lib().includes("REPO_OPEN_MAX_BYTES = 100_000"), "the fetch must skip big files");
  assert.ok(lib().includes('recursive: "true"'), "the fetch must walk the whole tree");
  assert.ok(repoFilesRoute().includes("getRepoFiles"), "the route must serve the repo's files");
  assert.ok(repoFilesRoute().includes("maxDuration = 60"), "the route must allow time for the blob fetches");
});

test("the token link opens GitHub with every scope pre-checked", () => {
  const p = page();
  // Every top-level scope GitHub lists must be in the link, so the
  // token page opens with all of them checked.
  for (const scope of [
    "repo", "workflow",
    "write:packages", "read:packages", "delete:packages",
    "admin:org", "admin:public_key", "admin:repo_hook", "admin:org_hook",
    "gist", "notifications", "user", "delete_repo",
    "write:discussion", "read:discussion", "admin:enterprise",
    "audit_log", "codespace", "copilot",
    "write:network_configurations", "project",
    "admin:gpg_key", "admin:ssh_signing_key",
  ]) {
    assert.ok(p.includes(scope), `the token link must pre-check ${scope}`);
  }
  assert.ok(p.includes("GITHUB_TOKEN_URL"), "the link must be built from the scopes list");
  // The warning text moved to i18n (en.ts githubPage.tokenExplainer);
  // the page must render that key, and the English value must say the
  // token has full access and must stay private.
  assert.ok(p.includes("t.githubPage.tokenExplainer"), "the page must show the token explainer");
  assert.ok(en().includes("full access to your account"), "the page must say the token has full access");
  assert.ok(en().includes("keep it private"), "the page must warn the token must stay private");
});
