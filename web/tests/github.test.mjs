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
const editorPage = () => read("src/app/editor/page.tsx");
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
  assert.ok(lib().includes("REPO_OPEN_MAX_BYTES = 10 * 1024 * 1024"), "a file may be up to 10 MB");
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

test("the delete-repo route steps up with an emailed code — no password, no TOTP", () => {
  const r = read("src/app/api/github/delete-repo/route.ts");
  // The schema carries the code, and it is REQUIRED (not optional).
  assert.ok(r.includes("code: z.string().min(1).max(10)"), "the body schema must require the code");
  // The code is a "delete-repo" OTP: looked up, decided, consumed.
  assert.ok(r.includes('getLatestOtp(email, "delete-repo")'), "the route must look up the emailed code");
  assert.ok(r.includes("decideOtp("), "the route must check the code through decideOtp");
  assert.ok(r.includes("consumeOtp(row.id)"), "a right code must be consumed before deleting");
  assert.ok(r.includes("bumpOtpAttempts(row.id)"), "a wrong code must bump attempts");
  // Every failure answers the same generic 400.
  assert.ok(r.includes('const GENERIC_CODE_ERROR = "The code is incorrect or has expired."'), "failures must share one generic message");
  assert.ok(!r.includes("verifyPassword"), "the route must not check a password");
  assert.ok(!r.includes("verifyTotpCodeWithStep"), "the route must not check a TOTP code");
  assert.ok(!r.includes("decryptUserTotpSecret"), "the route must not read a TOTP secret");
  assert.ok(!r.includes("findBackupCode"), "the route must not take backup codes");
  assert.ok(!r.includes("claimTotpStep"), "the route must not claim a TOTP step");
  // The send-code route exists: session-gated, verified email only.
  const send = read("src/app/api/github/delete-repo/send-code/route.ts");
  assert.ok(send.includes('issueOtpCode(sessionUser.email, "delete-repo")'), "the send route must issue a delete-repo code");
  assert.ok(send.includes("getSessionUser(req, prereqs.secret)"), "the send route must need a session");
  assert.ok(send.includes("!user.email_verified"), "the send route must need a verified email");
  assert.ok(send.includes("{ sent: true }"), "the send route must answer sent:true");
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
    "src/app/api/github/batch-commit/route.ts",
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
    "deleteRepoCodeLabel", "deleteRepoSendingCode", "deleteRepoSendCode",
  ]) {
    assert.ok(en().includes(`${key}:`), `en.ts must define ${key}`);
  }
  // The confirm label must show the EXACT repo name to type (like
  // GitHub), not a generic "owner/repo" — and the confirm box's
  // placeholder must show it too.
  assert.ok(en().includes("deleteRepoConfirmLabel: (repo) =>"), "the confirm label must be a function of the repo name");
  assert.ok(p.includes("deleteRepoConfirmLabel(deleteTarget.full_name)"), "the dialog label must show the exact repo name");
  assert.ok(p.includes("placeholder={deleteTarget.full_name}"), "the confirm box placeholder must show the exact repo name");
  // Email-code step-up: no password, no authenticator field — the
  // moment the exact owner/repo name is typed the dialog auto-sends
  // a code to the user's email and shows 6 code boxes.
  assert.ok(!p.includes('id="delete-repo-password"'), "the dialog must not have a password field");
  assert.ok(!p.includes('id="delete-repo-totp"'), "the dialog must not have an authenticator field");
  assert.ok(!p.includes("deletePassword"), "the dialog must not keep a password state");
  assert.ok(!p.includes("deleteTotpCode"), "the dialog must not keep an authenticator-code state");
  assert.ok(!p.includes('"/api/auth/2fa/status"'), "the dialog must not ask 2FA status for step-up fields");
  assert.ok(p.includes("/api/github/delete-repo/send-code"), "typing the exact name must send an email code");
  assert.ok(p.includes('import CodeSlots from "@/components/CodeSlots"'), "the dialog must use CodeSlots");
  assert.ok(p.includes("<CodeSlots"), "the dialog must render code boxes");
  assert.ok(p.includes("length={6}"), "the code boxes must take 6 digits");
  assert.ok(p.includes("t.editorPage.deleteRepoCodeLabel"), "the code boxes must be labelled");
  assert.ok(p.includes("code: codeToUse"), "the delete request must send the email code");
  assert.ok(p.includes("deleteCode.length !== 6"), "Delete must stay disabled until all 6 digits are typed");
});

test("stored tokens use a dedicated encryption key only — no session-secret fallback", () => {
  const lib = read("src/lib/github-token.ts");
  // The key must be a dedicated GITHUB_TOKEN_KEY, so a
  // session-secret leak alone no longer opens the stored tokens —
  // and a token encrypted under the old SESSION_SECRET key no
  // longer reads at all (hard cutover, no lazy migration: keeping
  // any SESSION_SECRET read path would leave the split undone).
  assert.ok(lib.includes("process.env.GITHUB_TOKEN_KEY"), "the token key must be a dedicated GITHUB_TOKEN_KEY");
  assert.ok(lib.includes("getTokenEncryptionSecret"), "the key choice must live in one helper");
  assert.ok(
    !lib.includes("decryptTotpSecret(secret, data.token_encrypted)"),
    "the read must never fall back to the session secret for legacy rows"
  );
  assert.ok(
    !lib.includes("token_encrypted: encryptTotpSecret(key, plain)"),
    "no legacy row may be re-encrypted — there is no legacy read to migrate from"
  );
  assert.ok(
    !lib.includes("getGithubToken(user.email, prereqs.secret)"),
    "the token read must not take the session secret at all"
  );
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
  assert.ok(libSrc.includes("wanted === identity.login.toLowerCase()"), "the token owner's own login must be allowed (case-insensitively)");
  assert.ok(libSrc.includes("org.toLowerCase() === wanted"), "the token owner's orgs must be allowed (case-insensitively)");
  // Every route that takes an owner must run the check before it
  // touches the repo. The repos routes take no owner (list/create
  // are the token owner's own), so there is nothing to check there.
  for (const rel of [
    "src/app/api/github/commit/route.ts",
    "src/app/api/github/batch-commit/route.ts",
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
    "src/app/api/github/batch-commit/route.ts",
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
  assert.ok(commitRoute.includes('checkUserLimit(email, "github-write"'), "commits must also be limited per user");
  assert.ok(reposRoute.includes('checkUserLimit(email, "github-write"'), "repo creation must also be limited per user");
  // R3-L11: the per-user key is a hash of the lowercased email, never
  // the raw address — the old literal ${email} key must be gone.
  assert.ok(!commitRoute.includes("github-write:${email}"), "the commit per-user key must not embed the raw email");
  assert.ok(!reposRoute.includes("github-write:${email}"), "the repo-create per-user key must not embed the raw email");
});

test("N1: GitHub write routes fail closed on a Redis blip; read routes stay fail-open", () => {
  // Writes: the per-IP limit passes failClosed and a limiter throw
  // answers 503 ("temporarily unavailable"), never a 500 — the
  // throw must be caught, not surfaced.
  for (const rel of [
    "src/app/api/github/batch-commit/route.ts",
    "src/app/api/github/commit/route.ts",
    "src/app/api/github/delete-repo/route.ts",
    "src/app/api/github/token/route.ts",
  ]) {
    const src = read(rel);
    assert.ok(src.includes("{ failClosed: true }"), `${rel} must pass failClosed on its per-IP limit`);
    assert.ok(src.includes("GitHub is temporarily unavailable."), `${rel} must answer 503 when the limiter is down`);
    assert.ok(src.includes("status: 503"), `${rel} must answer 503, not 500, when the limiter throws`);
  }
  // repos: one helper, two behaviours — POST (create) fail-closed,
  // GET (list) fail-open.
  const reposRoute = route();
  assert.ok(reposRoute.includes('rateLimited(req, "github-write", true)'), "creating a repo must fail closed");
  assert.ok(reposRoute.includes('rateLimited(req, "github-read")'), "listing repos must stay fail-open");
  assert.ok(!reposRoute.includes('rateLimited(req, "github-read", true)'), "listing repos must not fail closed");
  // Reads: no failClosed anywhere — a Redis blip must not break
  // opening a repo in the editor.
  for (const rel of [
    "src/app/api/github/repo-tree/route.ts",
    "src/app/api/github/repo-file/route.ts",
    "src/app/api/github/token/status/route.ts",
  ]) {
    const src = read(rel);
    assert.ok(!src.includes("failClosed"), `${rel} must stay fail-open (read-only)`);
  }
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
    ["src/app/api/github/batch-commit/route.ts", "5 * 1024 * 1024"],
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

test("R2-L13: owner check falls back to a per-repo permission check", () => {
  const libSrc = lib();
  // A token without read:org gets an empty org list, and a
  // collaborator is not the owner — but GitHub knows whether this
  // token may touch that exact repo, so the repo's permissions
  // field decides instead of a flat 403.
  assert.ok(libSrc.includes("rest.repos.get({ owner, repo })"), "the fallback must ask GitHub about the exact repo");
  assert.ok(libSrc.includes("data.permissions"), "the fallback must read the repo permission field");
  assert.ok(libSrc.includes("p.admin"), "admin permission must pass the fallback");
  assert.ok(libSrc.includes("p.push"), "push permission must pass the fallback");
  assert.ok(libSrc.includes("p.pull"), "read permission must pass the fallback");
  assert.ok(libSrc.includes("catch {"), "a repo GitHub will not show must fail the check, not throw");
  // Every route that takes an owner must hand the repo over too,
  // or the fallback can never run.
  assert.ok(
    read("src/app/api/github/commit/route.ts").includes("assertGithubOwnerAllowed(token, parsed.data.owner, parsed.data.repo)"),
    "commit must pass owner + repo to the check"
  );
  assert.ok(
    read("src/app/api/github/delete-repo/route.ts").includes("assertGithubOwnerAllowed(token, parsed.data.owner, parsed.data.repo)"),
    "delete-repo must pass owner + repo to the check"
  );
  assert.ok(
    repoTreeRoute().includes("assertGithubOwnerAllowed(token, owner, repo)"),
    "repo-tree must pass owner + repo to the check"
  );
  assert.ok(
    repoFileRoute().includes("assertGithubOwnerAllowed(token, owner, repo)"),
    "repo-file must pass owner + repo to the check"
  );
});

test("R2-L14: GitHub read + token routes also limit per user, not just per IP", () => {
  // One user behind a shared NAT must not starve another user's
  // repo browsing or token checks — same pattern as the write
  // routes already use (per-user key alongside per-IP).
  assert.ok(route().includes('checkUserLimit(email, "github-read"'), "listing repos must also be limited per user");
  assert.ok(repoTreeRoute().includes('checkUserLimit(email, "github-read"'), "repo-tree must also be limited per user");
  assert.ok(repoFileRoute().includes('checkUserLimit(email, "github-read"'), "repo-file must also be limited per user");
  const tokenRoute = read("src/app/api/github/token/route.ts");
  assert.ok(tokenRoute.includes('checkUserLimit(user.email, "github-token"'), "token save/delete must also be limited per user");
  const status = read("src/app/api/github/token/status/route.ts");
  assert.ok(status.includes('checkUserLimit(user.email, "github-token"'), "token status must also be limited per user");
  // R3-L11: per-user keys are hashed (sha256 of the lowercased
  // email), never the raw address.
  const handler = read("src/lib/api-handler.ts");
  assert.ok(handler.includes('createHash("sha256")'), "the per-user key must hash the email");
  assert.ok(!route().includes("github-read:${email}"), "the repos per-user key must not embed the raw email");
  assert.ok(!tokenRoute.includes("github-token:${user.email}"), "the token per-user key must not embed the raw email");
});

test("R2-L27: editor file reads cap at 10 MB before the blob is decoded", () => {
  const libSrc = lib();
  // The blob is fully base64-decoded into memory, so a 50 MB
  // decode per request is cheap memory exhaustion for the
  // function — the cap for editor reads is 10 MB, checked on the
  // metadata size before the download and again on the blob.
  assert.ok(libSrc.includes("REPO_OPEN_MAX_BYTES = 10 * 1024 * 1024"), "an editor file read must cap at 10 MB");
  assert.ok(libSrc.includes("File is larger than 10 MB"), "an oversize file must say 10 MB");
  assert.ok(
    libSrc.includes('err.message.startsWith("File is larger than")'),
    "the error mapper must still pass the oversize message through as a 400"
  );
});

test("R2-L11: the GitHub token key needs >= 32 chars, like the TOTP key", () => {
  const libSrc = read("src/lib/github-token.ts");
  assert.ok(libSrc.includes("GITHUB_TOKEN_KEY_MIN_LENGTH = 32"), "the minimum length must be 32");
  assert.ok(libSrc.includes("key.length < GITHUB_TOKEN_KEY_MIN_LENGTH"), "a short dedicated key must be refused");
  const getterStart = libSrc.indexOf("export function getTokenEncryptionSecret");
  const getterEnd = libSrc.indexOf("export async function saveGithubToken", getterStart);
  const getter = libSrc.slice(getterStart, getterEnd);
  assert.ok(getter.includes("return null"), "the getter must return null for a short key");
  assert.ok(!getter.includes("process.env.GITHUB_TOKEN_KEY ?? null"), "the getter must not return any non-empty value");
});

test("R2-L12: migration 010 makes the BYOK email citext and adds pending-signup cleanup", () => {
  const migration = read("supabase/migrations/010_byok_citext_and_pending_cleanup.sql");
  assert.ok(migration.includes("lp_byok_keys"), "010 must touch the BYOK table");
  assert.ok(migration.includes("alter column user_email type citext"), "010 must make user_email citext");
  assert.ok(migration.includes("delete_expired_pending_signups"), "010 must add the expired pending-signup cleanup");
  assert.ok(migration.includes("expires_at < now()"), "the cleanup must delete only expired rows");
  assert.ok(
    migration.includes("revoke execute on function public.delete_expired_pending_signups() from public"),
    "only the service role may call the cleanup"
  );
  assert.ok(!migration.includes("pg_cron"), "the cleanup must not assume pg_cron exists");
});

test("R2-L21/R2-L23: dompurify is pinned by overrides and next/react ranges are tightened", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.overrides?.dompurify, "3.4.17", "dompurify must be pinned to 3.4.17 by overrides");
  assert.equal(pkg.dependencies.next, "^15.5.29", "next must be ^15.5.29");
  assert.equal(pkg.dependencies.react, "^19.3.1", "react must be ^19.3.1");
  assert.equal(pkg.dependencies["react-dom"], "^19.3.1", "react-dom must be ^19.3.1");
  const lock = JSON.parse(read("package-lock.json"));
  assert.equal(lock.packages["node_modules/dompurify"]?.version, "3.4.17", "the lockfile must resolve dompurify 3.4.17");
  assert.equal(lock.packages["node_modules/next"]?.version, "15.5.29", "the lockfile must stay on next 15.5.29");
  assert.equal(lock.packages["node_modules/react"]?.version, "19.3.1", "the lockfile must stay on react 19.3.1");
  assert.ok(
    !lock.packages["node_modules/monaco-editor/node_modules/dompurify"],
    "the vulnerable nested dompurify 3.4.15 must be gone"
  );
});

// ---------------------------------------------------------------------------
// R3b: the editor push goes through /api/github/batch-commit
// ---------------------------------------------------------------------------

test("R3b: the editor push goes through /api/github/batch-commit (one request, not one per file)", () => {
  const e = editorPage();
  assert.ok(e.includes('fetch("/api/github/batch-commit"'), "the push must POST to batch-commit");
  assert.ok(!e.includes('fetch("/api/github/commit"'), "the push must no longer fire one request per file");
  // One message for the whole push, same branch, files as an array.
  assert.ok(e.includes("files: batch"), "the batch must carry the files array");
  assert.ok(e.includes("branch: openRepoState.branch"), "the batch must push to the open repo's branch");
  // Chunking: the server caps at 20 files / 5 MB, so a big push
  // must split — and a single oversized file must not poison its batch.
  assert.ok(e.includes("BATCH_COMMIT_MAX_FILES = 20"), "batches must cap at the server's 20 files");
  assert.ok(e.includes("BATCH_COMMIT_MAX_BYTES = 4_500_000"), "batches must stay under the server's 5 MB body cap");
  assert.ok(e.includes("BATCH_COMMIT_MAX_CONTENT_CHARS = 4_000_000"), "the per-file cap must match the server's zod limit");
  assert.ok(e.includes("chunkBatchFiles"), "the push must chunk files into server-acceptable batches");
  assert.ok(e.includes("oversized"), "an oversized file must be split out of the batches");
  // A one-file push is a batch of one — the server accepts min 1,
  // and each file still commits through the same lib call as the
  // single-file route (one commit per file, behaviour unchanged).
  const batch = read("src/app/api/github/batch-commit/route.ts");
  assert.ok(batch.includes("z.array(batchFileSchema).min(1).max(20)"), "the server must accept a one-file batch");
  assert.ok(batch.includes("commitFileToRepo(token, {"), "each file must still commit through the same lib call as the single-file route");
});

test("R3b: chunking splits at 20 files and at the byte cap, and isolates oversized files", () => {
  // Behavioural mirror of chunkBatchFiles in the editor: the tests
  // are static, so the rule itself is mirrored here and the
  // constants + call sites are pinned against the real code below.
  const MAX_FILES = 20;
  const MAX_BYTES = 4_500_000;
  const MAX_CHARS = 4_000_000;
  const chunk = (files) => {
    const oversized = [];
    const batches = [];
    let current = [];
    let currentBytes = 200;
    const bytes = (s) => Buffer.byteLength(s, "utf8");
    for (const file of files) {
      if (file.content.length > MAX_CHARS) {
        oversized.push(file);
        continue;
      }
      const b = bytes(file.content) + bytes(file.path) + 64;
      if (current.length > 0 && (current.length >= MAX_FILES || currentBytes + b > MAX_BYTES)) {
        batches.push(current);
        current = [];
        currentBytes = 200;
      }
      current.push(file);
      currentBytes += b;
    }
    if (current.length > 0) batches.push(current);
    return { batches, oversized };
  };
  const file = (i, size = 10) => ({ path: `f${i}.py`, content: "x".repeat(size) });
  // 1 file → 1 batch of 1 (single-file push still works).
  assert.deepEqual(chunk([file(0)]).batches.map((b) => b.length), [1]);
  // 20 files → 1 batch; 21 → 2 batches.
  assert.deepEqual(
    chunk(Array.from({ length: 20 }, (_, i) => file(i))).batches.map((b) => b.length),
    [20]
  );
  assert.deepEqual(
    chunk(Array.from({ length: 21 }, (_, i) => file(i))).batches.map((b) => b.length),
    [20, 1]
  );
  // A file whose bytes alone pass the cap sits in its own batch and
  // does not drag the small files with it (multi-byte chars: under
  // the 4M-char cap, over the byte cap).
  const big = chunk([{ path: "big.py", content: "😀".repeat(1_200_000) }, file(1), file(2)]);
  assert.deepEqual(big.batches.map((b) => b.length), [1, 2], "a near-cap file must sit in its own batch");
  assert.equal(big.oversized.length, 0, "a big-but-legal file must not be treated as oversized");
  // A file over the per-file char cap is isolated, and the other
  // file still pushes in its own batch.
  const huge = chunk([{ path: "huge.py", content: "x".repeat(4_000_001) }, file(1)]);
  assert.equal(huge.oversized.length, 1, "a file over the per-file char cap must be isolated");
  assert.deepEqual(huge.batches.map((b) => b.length), [1], "the other file must still push");
  // The real chunker must use the same numbers.
  const e = editorPage();
  assert.ok(e.includes("current.length >= BATCH_COMMIT_MAX_FILES"), "the real chunker must cap the file count");
  assert.ok(e.includes("currentBytes + bytes > BATCH_COMMIT_MAX_BYTES"), "the real chunker must cap the byte size");
  assert.ok(e.includes("file.content.length > BATCH_COMMIT_MAX_CONTENT_CHARS"), "the real chunker must isolate oversized files");
});

test("R3b: a partial batch failure names each failed file with its reason and stays retryable", () => {
  const e = editorPage();
  const fnStart = e.indexOf("async function pushRepoChanges");
  const fnEnd = e.indexOf("// Push dialog:", fnStart);
  const fn = e.slice(fnStart, fnEnd);
  assert.ok(fn.includes("(data as { results?: unknown }).results"), "the push must read the server's per-file results");
  // Only a file the server reports ok leaves the changed set —
  // a failed file stays changed, so the next push retries just it.
  assert.ok(
    fn.indexOf("if (result.ok === true)") < fn.indexOf("changedRepoPathsRef.current.delete"),
    "only ok files must leave the changed set"
  );
  assert.ok(fn.includes("failed.push({"), "failures must be collected per file");
  assert.ok(fn.includes('typeof result.error === "string"'), "a per-file failure must carry the server's reason");
  // A whole-batch failure (429/403/400/network) fails every file
  // in that batch with the same reason — never silently, never as
  // if it had pushed.
  assert.ok(fn.includes("if (!res.ok)"), "a non-2xx batch must be handled, not read as results");
  assert.ok(fn.includes("for (const f of batch) failed.push"), "a failed batch must fail each of its files");
  // A file the server never reports is not assumed pushed.
  assert.ok(fn.includes("!seen.has(f.path)"), "an unreported file must be treated as failed, not pushed");
  // The terminal summary names the failures with their reasons.
  assert.ok(fn.includes("failed.map((f) => `${f.path} (${f.error})`)"), "the summary must show each failed file with its reason");
  assert.ok(fn.includes("Pushed ${pushed} of ${ready.length}"), "the summary must still count pushed vs ready");
  assert.ok(fn.includes("Skipped ${skipped.length} unopened file(s)."), "skipped unopened files must still be reported");
});

test("R3b: the AI-refined commit message is preserved, and the token flow is unchanged", () => {
  const e = editorPage();
  // The dialog still refines the message with AI and the confirm
  // still passes the edited-or-default message to the push.
  assert.ok(e.includes("generateCommitMessage"), "the dialog must still ask the AI for a commit message");
  assert.ok(
    e.includes("commitMessage.trim() || defaultCommitMessage(pushDialogFiles.ready)"),
    "confirm must send the edited message, or the default when the box is empty"
  );
  assert.ok(e.includes("await pushRepoChanges(message)"), "confirm must pass the message into the push");
  assert.ok(e.includes("async function pushRepoChanges(message: string)"), "the push must still take the one approved message");
  // The batch carries that one message — no per-file message is built.
  const fnStart = e.indexOf("async function pushRepoChanges");
  const fnEnd = e.indexOf("// Push dialog:", fnStart);
  const fn = e.slice(fnStart, fnEnd);
  assert.ok(fn.includes("message,"), "the batch body must carry the approved message");
  assert.ok(!fn.includes("defaultCommitMessage"), "the push itself must not rebuild the message");
  // Token flow: the editor still sends no token — the server
  // resolves the stored PAT from the session, like before.
  assert.ok(!e.includes("Authorization:"), "the editor must send no token with the push");
  const batch = read("src/app/api/github/batch-commit/route.ts");
  assert.ok(batch.includes("resolveSessionGithubToken"), "batch-commit must resolve the server-held token");
  assert.ok(batch.includes("assertGithubOwnerAllowed"), "batch-commit must check the owner");
  assert.ok(batch.includes("github-write:"), "batch-commit must keep the write rate bucket");
  assert.ok(batch.includes('checkUserLimit(email, "github-write"'), "batch-commit must keep the per-user bucket");
  assert.ok(batch.includes("logGithubTokenUse("), "batch-commit must keep auditing token use");
});
