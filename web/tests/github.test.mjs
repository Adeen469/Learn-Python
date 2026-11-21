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
const repoTreeRoute = () => read("src/app/api/github/repo-tree/route.ts");
const repoFileRoute = () => read("src/app/api/github/repo-file/route.ts");
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
  assert.ok(p.includes("JSON.stringify({ repo: repo.full_name })"), "the page must hand the editor just the repo's name (the editor fetches the tree itself)");
  assert.ok(!p.includes("/api/github/repo-files"), "the page must not fetch the repo's files itself");
  assert.ok(p.includes('router.push("/editor")'), "the page must navigate to the editor");
  assert.ok(p.includes('role="button"'), "the repo card must be clickable");
  assert.ok(p.includes("onClick={() => openRepoInEditor(r)}"), "the card click must open that repo");
  assert.ok(p.includes("t.githubPage.openInEditor"), "the card must say it opens in the editor");
  assert.ok(p.includes("e.stopPropagation()"), "the external GitHub link must not trigger the card click");
});

test("the commit route accepts file contents up to ~4 MB", () => {
  const r = read("src/app/api/github/commit/route.ts");
  assert.ok(r.includes("content: z.string().max(4_000_000)"), "a pushed file may be up to ~4 MB (Vercel caps request bodies at 4.5 MB)");
  assert.ok(r.includes("commitFileToRepo"), "the route must commit through the shared helper");
});

test("the repo tree + single-file routes serve a repo lazily", () => {
  assert.ok(lib().includes("export async function getRepoTree"), "the lib must fetch a repo's file tree");
  assert.ok(lib().includes("export async function getRepoFileContent"), "the lib must fetch one file's content");
  assert.ok(lib().includes("REPO_OPEN_MAX_BYTES = 50 * 1024 * 1024"), "a file may be up to 50 MB");
  assert.ok(!lib().includes("REPO_OPEN_MAX_FILES"), "there must be no file-count limit");
  assert.ok(!lib().includes("export async function getRepoFiles"), "the fetch-everything helper must be gone");
  assert.ok(lib().includes('recursive: "true"'), "the tree fetch must walk the whole tree");
  assert.ok(repoTreeRoute().includes("getRepoTree"), "the tree route must serve the repo's tree");
  assert.ok(repoFileRoute().includes("getRepoFileContent"), "the file route must serve one file's content");
  assert.ok(repoFileRoute().includes("ReadableStream"), "the file route must stream (Vercel caps buffered responses at 4.5 MB)");
  assert.ok(repoFileRoute().includes("maxDuration = 60"), "the routes must allow time for the GitHub calls");
});

test("the token link pre-checks ONLY the repo and delete_repo scopes", () => {
  const p = page();
  // Least privilege (security audit 2026-11-21): the app only reads
  // and writes repositories, plus deletes them from the editor's
  // Delete button — so the link pre-checks exactly two scopes.
  // Extract the scopes list itself — the page's comments still name
  // the old dangerous scopes, so a whole-file search would
  // false-positive.
  const m = p.match(/const GITHUB_TOKEN_SCOPES = \[([^\]]*)\]/);
  assert.ok(m, "the scopes list must be a literal array");
  const listed = m[1];
  assert.ok(listed.includes('"repo"'), "the list must include repo");
  assert.ok(listed.includes('"delete_repo"'), "the list must include delete_repo (the editor Delete button needs it)");
  for (const scope of [
    "admin:org", "admin:enterprise", "manage_billing",
    "admin:gpg_key", "admin:ssh_signing_key", "codespace", "copilot",
    "workflow", "write:packages", "gist", "admin:public_key",
  ]) {
    assert.ok(!listed.includes(scope), `the token link must NOT pre-check ${scope}`);
  }
  assert.ok(p.includes("GITHUB_TOKEN_URL"), "the link must be built from the scopes list");
  // The warning text moved to i18n (en.ts githubPage.tokenExplainer);
  // the page must render that key, and the English value must say
  // only the repo and delete_repo scopes are checked, the token can
  // delete repos, and must stay private.
  assert.ok(p.includes("t.githubPage.tokenExplainer"), "the page must show the token explainer");
  assert.ok(en().includes("repo and delete_repo scopes"), "the page must say only the repo and delete_repo scopes are checked");
  assert.ok(en().includes("and delete them"), "the page must say the token can delete repos");
  assert.ok(en().includes("keep it private"), "the page must warn the token must stay private");
});

test("the delete-repo route validates slugs, rate-limits and deletes via Octokit", () => {
  const r = read("src/app/api/github/delete-repo/route.ts");
  assert.ok(r.includes("deleteUserRepo"), "the route must delete through the lib");
  assert.ok(r.includes("isValidGithubSlug"), "the route must validate owner/repo");
  assert.ok(r.includes("checkRateLimit"), "deleting must be rate-limited");
  assert.ok(r.includes("Resource not accessible by personal access token"), "a token without delete_repo must get its own error");
  assert.ok(r.includes("Only the repo owner can delete it"), "a collaborator must get its own error");
  const libSrc = lib();
  assert.ok(libSrc.includes("deleteUserRepo"), "the lib must export a delete helper");
  assert.ok(libSrc.includes("repos.delete"), "the helper must call repos.delete");
});

test("repo-tree and repo-file validate owner, repo, sha and path", () => {
  const libSrc = lib();
  assert.ok(libSrc.includes("isValidGithubSlug"), "lib must export a slug validator");
  assert.ok(libSrc.includes("isValidGithubSha"), "lib must export a sha validator");
  assert.ok(libSrc.includes("isValidGithubPath"), "lib must export a path validator");
  assert.ok(libSrc.includes("/^[0-9a-f]{40}$/"), "a blob sha must be 40 hex chars");
  assert.ok(repoTreeRoute().includes("isValidGithubSlug"), "repo-tree must validate owner/repo");
  assert.ok(repoFileRoute().includes("isValidGithubSha"), "repo-file must validate the sha");
  assert.ok(repoFileRoute().includes("isValidGithubPath"), "repo-file must validate the path");
});

test("the GitHub token lives on the server, never in the browser", () => {
  const p = page();
  // The token is never written to localStorage again — the page
  // POSTs it once to /api/github/token, and the one-time migration
  // deletes any pre-move copy from the browser.
  assert.ok(!p.includes('localStorage.setItem("lp_github_token"'), "the page must never store a token in the browser");
  assert.ok(p.includes('"/api/github/token"'), "the page must save the token through the server route");
  assert.ok(p.includes('localStorage.removeItem("lp_github_token")'), "the page must delete the browser copy after the move");
  assert.ok(p.includes("/api/github/token/status"), "the page must check the server for a stored token");
  // No GitHub call from this page carries an Authorization header —
  // the server resolves the stored token from the session. (The
  // comment above fetchRepos says the same in words; the colon
  // distinguishes a real header from the comment.)
  assert.ok(!p.includes("Authorization:"), "no GitHub call from the page may send a token");
  // The connected banner no longer shows a token prefix (the server
  // never returns the token), and the copy says so.
  assert.ok(p.includes("t.githubPage.connected"), "the page must show the connected state");
  assert.ok(en().includes("stored encrypted on the server"), "the copy must say the token is stored encrypted on the server");
  assert.ok(en().includes("never lives in this browser"), "the copy must say the token never lives in the browser");
  assert.ok(p.includes("t.githubPage.tokenStorageNotReady"), "the page must show a setup message when storage is not configured");
});

test("the token lib encrypts, binds to the session and fails closed", () => {
  const libSrc = read("src/lib/github-token.ts");
  assert.ok(libSrc.includes("lp_github_tokens"), "tokens must live in lp_github_tokens");
  assert.ok(libSrc.includes("encryptTotpSecret"), "the token must be encrypted at rest");
  assert.ok(libSrc.includes("decryptTotpSecret"), "the token must be decrypted server-side only");
  assert.ok(libSrc.includes('onConflict: "user_email"'), "one token per user, replaced on reconnect");
  assert.ok(libSrc.includes("resolveSessionGithubToken"), "routes must resolve the token from the session");
  assert.ok(libSrc.includes("isValidGithubTokenFormat"), "only real PAT formats may be saved");
  assert.ok(libSrc.includes("ghp_"), "classic PATs must be accepted");
  assert.ok(libSrc.includes("github_pat_"), "fine-grained PATs must be accepted");
  // Fail-closed: no Authorization header is read anywhere in the lib.
  assert.ok(!libSrc.includes("authorization"), "the lib must never read a client-supplied token");
  const save = read("src/app/api/github/token/route.ts");
  assert.ok(save.includes("saveGithubToken"), "POST must save through the lib");
  assert.ok(save.includes("checkRateLimit"), "saving a token must be rate-limited");
  assert.ok(save.includes("getSessionUser"), "saving a token must require a signed-in user");
  assert.ok(!save.includes("localStorage"), "the save route must never touch the browser");
  const status = read("src/app/api/github/token/status/route.ts");
  assert.ok(status.includes("connected"), "status must report connected");
  assert.ok(status.includes("configured"), "status must report whether storage is configured");
  assert.ok(!status.includes("token_encrypted"), "status must never return the token");
});

test("every GitHub route resolves the server token and takes no Bearer token", () => {
  for (const rel of [
    "src/app/api/github/repos/route.ts",
    "src/app/api/github/repo-tree/route.ts",
    "src/app/api/github/repo-file/route.ts",
    "src/app/api/github/commit/route.ts",
    "src/app/api/github/delete-repo/route.ts",
  ]) {
    const src = read(rel);
    assert.ok(src.includes("resolveSessionGithubToken"), `${rel} must resolve the server-held token`);
    assert.ok(!src.includes("getAuthToken"), `${rel} must not parse a Bearer token`);
    assert.ok(!src.includes('req.headers.get("authorization")'), `${rel} must not read an Authorization header`);
  }
});

test("migration 006 creates the token table with RLS and no public policy", () => {
  const migration = read("supabase/migrations/006_github_token_storage.sql");
  assert.ok(migration.includes("lp_github_tokens"), "006 must create the token table");
  assert.ok(migration.includes("user_email text primary key"), "one token per user");
  assert.ok(migration.includes("token_encrypted text not null"), "the token must be stored encrypted");
  assert.ok(migration.includes("row level security"), "the table must have RLS");
});

test("a repo card opens a right-click / long-press menu with five actions", () => {
  const p = page();
  // The card itself is the trigger: right-click on PC, long-press
  // on mobile — both fire contextmenu, so one handler covers both
  // (the same pattern the editor's file tree uses).
  assert.ok(p.includes("onContextMenu"), "the repo card must open a menu on right-click / long-press");
  assert.ok(p.includes("setRepoMenu({ repo: r, x: e.clientX, y: e.clientY })"), "the menu must open at the pointer");
  assert.ok(p.includes("<EditorContextMenu"), "the menu must be the shared context menu");
  // The five actions, in order: open in the editor, open on
  // GitHub, copy the link, favourite, then Delete (danger, last,
  // after a divider) — Delete never sits open on the card itself.
  assert.ok(p.includes("t.githubPage.repoMenuOpenEditor"), "the menu must offer Open in code editor");
  assert.ok(p.includes("t.githubPage.repoMenuOpenGithub"), "the menu must offer Open in GitHub");
  assert.ok(p.includes("t.githubPage.repoMenuCopyLink"), "the menu must offer Copy link");
  assert.ok(p.includes("t.githubPage.repoMenuFav"), "the menu must offer Add to favourites");
  assert.ok(p.includes("t.githubPage.repoMenuUnfav"), "the menu must offer Remove from favourites");
  assert.ok(p.includes("t.githubPage.repoMenuDelete"), "the menu must offer Delete");
  assert.ok(p.includes('id: "delete"'), "the Delete item must exist");
  assert.ok(p.includes("danger: true"), "Delete must be marked destructive");
  assert.ok(p.includes("window.open(repoMenu.repo.html_url"), "Open in GitHub must open the repo's GitHub URL");
  assert.ok(p.includes("navigator.clipboard.writeText(repo.html_url)"), "Copy link must copy the repo's GitHub URL");
  assert.ok(p.includes("document.execCommand(\"copy\")"), "Copy link must fall back when the clipboard API fails");
  // Favourites live in this browser only and sort first; a
  // favourited repo carries a filled star on its card.
  assert.ok(p.includes('localStorage.getItem("lp_github_favs")'), "favourites must load from this browser");
  assert.ok(p.includes('localStorage.setItem("lp_github_favs"'), "favourites must persist in this browser");
  assert.ok(p.includes("sortedRepos"), "favourites must sort first in the list");
  assert.ok(p.includes('fill="currentColor"'), "a favourited repo must show a filled star");
  // The menu labels must exist in English.
  for (const key of [
    "repoMenuOpenEditor", "repoMenuOpenGithub", "repoMenuCopyLink",
    "repoMenuFav", "repoMenuUnfav", "repoMenuDelete", "repoLinkCopied",
    "repoDeleted",
  ]) {
    assert.ok(en().includes(`${key}:`), `en.ts must define ${key}`);
  }
});

test("deleting a repo from the menu needs the typed owner/repo name", () => {
  const p = page();
  // Delete moved here from the editor's menu bar: a permanent
  // action belongs where repos are managed, not beside Push.
  // GitHub-style guard: the Delete button stays disabled until the
  // user types the exact full name, because deleting is permanent.
  assert.ok(p.includes('deleteConfirmText.trim() !== deleteTarget.full_name'), "Delete must stay disabled until the exact owner/repo is typed");
  assert.ok(p.includes("/api/github/delete-repo"), "the delete must go through the delete route");
  assert.ok(p.includes('method: "DELETE"'), "the delete must use DELETE");
  assert.ok(p.includes("t.editorPage.deleteRepoWarning"), "the dialog must warn deleting is permanent");
  assert.ok(p.includes("t.editorPage.deleteRepoOwnerNote"), "the dialog must say only the owner can delete");
  assert.ok(p.includes("t.editorPage.deleteRepoScopeNote"), "the dialog must say the token needs delete_repo");
  // After a successful delete the repo leaves the list (and the
  // favourites, and the commit form's selection).
  assert.ok(p.includes("setRepos((prev) => prev.filter((r) => r.id !== deleteTarget.id))"), "a deleted repo must leave the list");
  assert.ok(p.includes("setSelectedRepo(null)"), "a deleted repo must leave the commit form's selection");
  assert.ok(p.includes("t.githubPage.repoDeleted"), "a deleted repo must show a confirmation");
  // The shared dialog copy keys must exist in English.
  for (const key of [
    "deleteRepoButton", "deleteRepoTitle", "deleteRepoWarning",
    "deleteRepoOwnerNote", "deleteRepoScopeNote", "deleteRepoConfirmLabel",
    "deleteRepoConfirmPlaceholder", "deleteRepoDeleting",
  ]) {
    assert.ok(en().includes(`${key}:`), `en.ts must define ${key}`);
  }
});
