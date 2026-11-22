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

test("stored tokens use a dedicated encryption key, with a lazy migration off the session secret", () => {
  const lib = read("src/lib/github-token.ts");
  // The key must be a dedicated GITHUB_TOKEN_KEY when set, so a
  // session-secret leak alone no longer opens the stored tokens.
  assert.ok(lib.includes("process.env.GITHUB_TOKEN_KEY"), "the token key must prefer a dedicated GITHUB_TOKEN_KEY");
  assert.ok(lib.includes("getTokenEncryptionSecret"), "the key choice must live in one helper");
  // A token encrypted under the old SESSION_SECRET key must still
  // read — then be re-encrypted under the dedicated key, so the
  // old key stops working for it from here on.
  assert.ok(lib.includes("decryptTotpSecret(secret, data.token_encrypted)"), "the read must fall back to the session secret for legacy rows");
  assert.ok(lib.includes("token_encrypted: encryptTotpSecret(key, plain)"), "a legacy row must be re-encrypted under the dedicated key");
  // Save must encrypt under the dedicated key, and fail closed
  // when it is unset — never fall back to the session secret.
  const saveStart = lib.indexOf("export async function saveGithubToken");
  const saveEnd = lib.indexOf("export async function", saveStart + 10);
  const save = lib.slice(saveStart, saveEnd === -1 ? undefined : saveEnd);
  assert.ok(
    save.includes("const key = getTokenEncryptionSecret();"),
    "save must read the dedicated key with no session-secret fallback"
  );
  assert.ok(save.includes("if (!key) return false"), "save must fail closed when the dedicated key is unset");
  assert.ok(save.includes("token_encrypted: encryptTotpSecret(key, token)"), "save must encrypt under the dedicated key");
  assert.ok(lib.includes("return { token, email: user.email }"), "the resolver must return the caller's email for auditing");
});

test("migration 007 audits token use and stores the token expiry", () => {
  const migration = read("supabase/migrations/007_github_token_audit.sql");
  assert.ok(migration.includes("lp_github_token_audit"), "007 must create the audit table");
  assert.ok(migration.includes("user_email text not null"), "the audit must record who");
  assert.ok(migration.includes("action text not null"), "the audit must record what");
  assert.ok(migration.includes("row level security"), "the audit table must have RLS");
  assert.ok(migration.includes("expires_at timestamptz"), "007 must add the expiry column to the token table");
  const lib = read("src/lib/github-token.ts");
  assert.ok(lib.includes("logGithubTokenUse"), "the lib must offer an audit writer");
  assert.ok(lib.includes('.from("lp_github_token_audit").insert'), "the audit writer must insert into the audit table");
  // The audit write must never break the action it records.
  assert.ok(lib.includes("catch {}"), "the audit writer must swallow its own failures");
  // Every mutating route must log after success — reads don't.
  const tokenRoute = read("src/app/api/github/token/route.ts");
  assert.ok(tokenRoute.includes('logGithubTokenUse(user.email, "token_saved"'), "saving a token must be audited");
  assert.ok(tokenRoute.includes('logGithubTokenUse(user.email, "token_deleted"'), "deleting a token must be audited");
  const deleteRoute = read("src/app/api/github/delete-repo/route.ts");
  assert.ok(deleteRoute.includes('logGithubTokenUse(email, "repo_deleted"'), "deleting a repo must be audited");
  const commitRoute = read("src/app/api/github/commit/route.ts");
  assert.ok(commitRoute.includes('logGithubTokenUse(email, "commit"'), "a commit must be audited");
  const reposRoute = read("src/app/api/github/repos/route.ts");
  assert.ok(reposRoute.includes('logGithubTokenUse(email, "repo_created"'), "creating a repo must be audited");
});

test("saving a token checks it live with GitHub and the page warns before it expires", () => {
  const lib = read("src/lib/github-token.ts");
  // The probe asks GitHub whether the token works and reads its
  // expiry from the authentication-token-expiration header.
  assert.ok(lib.includes("https://api.github.com/user"), "the probe must call GitHub");
  assert.ok(lib.includes("github-authentication-token-expiration"), "the probe must read GitHub's expiry header");
  assert.ok(lib.includes("10_000"), "the probe must time out instead of hanging the save");
  const tokenRoute = read("src/app/api/github/token/route.ts");
  assert.ok(tokenRoute.includes("probeGithubToken"), "saving must probe the token first");
  assert.ok(tokenRoute.includes("GitHub rejected this token"), "a token GitHub rejects must be refused");
  assert.ok(tokenRoute.includes("probe.expiresAt"), "the expiry must be stored with the token");
  // The status answer carries the expiry; the page warns at 14
  // days or less (and says so plainly once it has lapsed).
  const statusRoute = read("src/app/api/github/token/status/route.ts");
  assert.ok(statusRoute.includes("expiresAt"), "the status must return the token expiry");
  const p = page();
  assert.ok(p.includes("tokenExpiresAt"), "the page must track the token expiry");
  assert.ok(p.includes("tokenExpiresDaysLeft <= 14"), "the page must warn while there is still time to renew");
  assert.ok(p.includes("t.githubPage.tokenExpired"), "the page must say plainly once the token has lapsed");
  assert.ok(p.includes("t.githubPage.tokenExpiringSoon"), "the page must warn before the token lapses");
  for (const key of ["tokenExpiringSoon", "tokenExpired"]) {
    assert.ok(en().includes(`${key}:`), `en.ts must define ${key}`);
  }
});

test("M11: GitHub routes check the owner against the token's own identity", () => {
  const libSrc = lib();
  // The lib resolves who the token belongs to (GET /user + orgs)
  // and caches it briefly per token, keyed by a hash — never the
  // token itself — so the check is not a GitHub call per request.
  assert.ok(libSrc.includes("getGithubIdentity"), "the lib must resolve the token's GitHub identity");
  assert.ok(libSrc.includes("users.getAuthenticated"), "the identity must come from GET /user");
  assert.ok(libSrc.includes("orgs.listForAuthenticatedUser"), "the identity must include the user's orgs");
  assert.ok(libSrc.includes("createHash"), "the identity cache must be keyed by a hash of the token, not the token");
  assert.ok(libSrc.includes("IDENTITY_TTL_MS"), "the identity cache must expire (short TTL)");
  assert.ok(libSrc.includes("assertGithubOwnerAllowed"), "the lib must offer an owner check");
  assert.ok(libSrc.includes("owner === identity.login"), "the token owner's own login must be allowed");
  assert.ok(libSrc.includes("identity.orgs.includes(owner)"), "the token owner's orgs must be allowed");
  // Every route that takes an owner must run the check before it
  // touches the repo. The repos routes take no owner (list/create
  // are the token owner's own), so there is nothing to check there.
  for (const rel of [
    "src/app/api/github/commit/route.ts",
    "src/app/api/github/repo-tree/route.ts",
    "src/app/api/github/repo-file/route.ts",
    "src/app/api/github/delete-repo/route.ts",
  ]) {
    const src = read(rel);
    assert.ok(src.includes("assertGithubOwnerAllowed"), `${rel} must check the owner against the token identity`);
    assert.ok(src.includes("only"), `${rel} must refuse an owner outside the token's identity`);
    assert.ok(src.includes('"You can only'), `${rel} must refuse with a 403`);
  }
});

test("M12: repo-file verifies the path points at the SHA before fetching the blob", () => {
  const libSrc = lib();
  // The path's metadata (getContent) is fetched first and its SHA
  // compared, so a blob from another branch or history cannot be
  // read by SHA alone — and an oversize file is refused on the
  // metadata size, before the blob is downloaded at all.
  const getContentAt = libSrc.indexOf("repos.getContent");
  const getBlobAt = libSrc.indexOf("git.getBlob");
  assert.ok(getContentAt !== -1, "the file fetch must look up the path first");
  assert.ok(getBlobAt !== -1, "the file fetch must still fetch the blob");
  assert.ok(getContentAt < getBlobAt, "the path lookup must run BEFORE the blob fetch");
  assert.ok(libSrc.includes("meta.sha !== params.sha"), "the path's SHA must match the requested SHA");
  const sizeCheckAt = libSrc.indexOf("meta.size");
  assert.ok(sizeCheckAt !== -1 && sizeCheckAt < getBlobAt, "the size must be checked on the metadata, before the blob download");
  assert.ok(libSrc.includes('githubHttpError(404, "File not found or no access")'), "a SHA mismatch must answer 404, not leak which half was wrong");
});

test("M13: GitHub routes map Octokit failures to generic statuses, never raw messages", () => {
  const libSrc = lib();
  assert.ok(libSrc.includes("mapGithubError"), "the lib must map GitHub errors to generic responses");
  assert.ok(libSrc.includes('"Repo not found or no access"'), "a 404 must say only 'Repo not found or no access'");
  assert.ok(libSrc.includes("status === 401"), "a 401 must map to 401");
  assert.ok(libSrc.includes("status === 403"), "a 403 must map to 403");
  assert.ok(libSrc.includes("status === 429"), "a 429 must map to 429");
  assert.ok(libSrc.includes("status: 502"), "an unexpected upstream failure must map to 502");
  for (const rel of [
    "src/app/api/github/commit/route.ts",
    "src/app/api/github/repo-tree/route.ts",
    "src/app/api/github/repo-file/route.ts",
    "src/app/api/github/repos/route.ts",
  ]) {
    const src = read(rel);
    assert.ok(src.includes("mapGithubError"), `${rel} must map errors instead of relaying them`);
    assert.ok(!src.includes("error: msg"), `${rel} must never return a raw error message`);
  }
  // delete-repo keeps its two user-actionable 403s (scope vs
  // owner) but its fallback must be the generic mapper too.
  const del = read("src/app/api/github/delete-repo/route.ts");
  assert.ok(del.includes("mapGithubError"), "delete-repo must map unexpected errors generically");
  assert.ok(del.includes("Resource not accessible by personal access token"), "delete-repo must keep the missing-scope hint");
  assert.ok(del.includes("Only the repo owner can delete it"), "delete-repo must keep the owner-only hint");
  assert.ok(!del.includes("return NextResponse.json({ error: msg }"), "delete-repo must not fall back to the raw message");
});

test("M14: the token probe fails closed — only an explicit 2xx counts as valid", () => {
  const libSrc = read("src/lib/github-token.ts");
  assert.ok(libSrc.includes("unverified"), "the probe must distinguish 'could not verify' from 'invalid'");
  assert.ok(libSrc.includes("if (!res.ok)"), "any non-2xx that is not 401/403 must not count as valid");
  assert.ok(libSrc.includes("return { valid: false, expiresAt: null, unverified: true }"), "an unverified probe must be invalid");
  // The network-failure catch must fail closed too — never valid.
  const catchAt = libSrc.indexOf("Network failure / timeout");
  assert.ok(catchAt !== -1, "the probe's catch must say it fails closed");
  assert.ok(libSrc.slice(catchAt).includes("unverified: true"), "the probe's catch must return unverified, not valid");
  const tokenRoute = read("src/app/api/github/token/route.ts");
  assert.ok(tokenRoute.includes("probe.unverified"), "saving must check the unverified outcome");
  assert.ok(tokenRoute.includes("Could not verify the token"), "an unverified probe must tell the user to try again");
  assert.ok(tokenRoute.includes("status: 503"), "an unverified probe must answer 503, not save the token");
  // The save must happen only after the probe passes.
  assert.ok(tokenRoute.indexOf("probe.unverified") < tokenRoute.lastIndexOf("saveGithubToken"), "the probe gate must run before the save");
});

test("M15: token status and token delete are rate-limited like token save", () => {
  const status = read("src/app/api/github/token/status/route.ts");
  assert.ok(status.includes("checkRateLimit"), "token status must be rate-limited");
  assert.ok(status.includes("github-token:"), "token status must use the token bucket");
  const tokenRoute = read("src/app/api/github/token/route.ts");
  const deleteStart = tokenRoute.indexOf("export async function DELETE");
  assert.ok(deleteStart !== -1, "the token route must have a DELETE handler");
  const del = tokenRoute.slice(deleteStart);
  assert.ok(del.includes("checkRateLimit"), "token delete must be rate-limited");
  assert.ok(del.includes("github-token:"), "token delete must use the token bucket");
});

test("L9: the repo tree is capped at 5,000 entries with a truncated flag", () => {
  const libSrc = lib();
  assert.ok(libSrc.includes("REPO_TREE_MAX_ENTRIES = 5_000"), "the tree must cap at 5,000 entries");
  assert.ok(libSrc.includes("slice(0, REPO_TREE_MAX_ENTRIES)"), "only the first 5,000 entries may be returned");
  assert.ok(libSrc.includes("truncated:"), "the tree must say when it was cut short");
  assert.ok(!libSrc.includes("capped only by GitHub"), "the old 'capped only by GitHub' comment must be gone");
  assert.ok(repoTreeRoute().includes("getRepoTree"), "the tree route must serve the capped tree");
});

test("L14: read and write GitHub routes use separate rate-limit buckets", () => {
  for (const rel of [
    "src/app/api/github/repo-tree/route.ts",
    "src/app/api/github/repo-file/route.ts",
  ]) {
    const src = read(rel);
    assert.ok(src.includes("github-read:"), `${rel} must use the read bucket`);
    assert.ok(!src.includes("github:${"), `${rel} must not share the old github: bucket`);
  }
  const reposRoute = route();
  assert.ok(reposRoute.includes('"github-read"'), "listing repos must use the read bucket");
  assert.ok(reposRoute.includes('"github-write"'), "creating a repo must use the write bucket");
  const commitRoute = read("src/app/api/github/commit/route.ts");
  assert.ok(commitRoute.includes("github-write:"), "committing must use the write bucket");
  assert.ok(!commitRoute.includes("github:${"), "committing must not share the old github: bucket");
  // Writes also get a per-user bucket, so one user behind a shared
  // NAT cannot starve another user's commits.
  assert.ok(commitRoute.includes("github-write:${email}"), "commits must also be limited per user");
  assert.ok(reposRoute.includes("github-write:${email}"), "repo creation must also be limited per user");
});

test("L17: a failed token migration deletes the browser copy and never refills the input", () => {
  const p = page();
  assert.ok(p.includes("for (let attempt = 0; attempt < 2; attempt++)"), "the migration must retry once, then give up");
  // The local copy is removed on every path out of the migration —
  // success, rejection, and network failure alike.
  const migrateStart = p.indexOf("async function migrateLocalToken");
  const migrateEnd = p.indexOf("useEffect(() => {", migrateStart);
  const migrate = p.slice(migrateStart, migrateEnd);
  const removals = (migrate.match(/localStorage\.removeItem\("lp_github_token"\)/g) || []).length;
  assert.ok(removals >= 2, "the migration must delete the browser copy on success and on failure");
  assert.ok(!p.includes("setToken(stored)"), "the page must never put the stored token back into the paste field");
});

test("M17: GitHub POST routes reject oversized bodies before parsing them", () => {
  const libSrc = lib();
  assert.ok(libSrc.includes("oversizedBodyResponse"), "the lib must offer a pre-parse body-size guard");
  assert.ok(libSrc.includes('req.headers.get("content-length")'), "the guard must read Content-Length");
  assert.ok(libSrc.includes("status: 413"), "an oversized body must answer 413");
  const cases = [
    ["src/app/api/github/commit/route.ts", "5 * 1024 * 1024"],
    ["src/app/api/github/token/route.ts", "256 * 1024"],
    ["src/app/api/github/repos/route.ts", "256 * 1024"],
    ["src/app/api/github/delete-repo/route.ts", "256 * 1024"],
  ];
  for (const [rel, ceiling] of cases) {
    const src = read(rel);
    assert.ok(src.includes("oversizedBodyResponse"), `${rel} must check the body size`);
    assert.ok(src.includes(ceiling), `${rel} must cap bodies at ${ceiling}`);
    assert.ok(
      src.indexOf("oversizedBodyResponse") < src.indexOf("await req.json()"),
      `${rel} must check the size BEFORE parsing the body`
    );
  }
});
