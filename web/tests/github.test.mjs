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

test("the form and the server reject the same repo names", () => {
  const serverRegex = route().match(/name: z\.string\(\)\.min\(1\)\.max\(100\)\.regex\((\/[^/]+\/)\)/);
  assert.ok(serverRegex, "the server must validate the repo name with a regex");
  assert.ok(page().includes(`REPO_NAME_RE = ${serverRegex[1]}`), "the form must check the exact same regex as the server");
});

test("a bad name is caught on the form with a message that names the problem", () => {
  const p = page();
  assert.ok(p.includes("repoNameError"), "the form must validate the name live");
  assert.ok(p.includes("can't contain spaces or special characters"), "the error must say spaces and special characters are not allowed");
  assert.ok(p.includes("only letters, numbers, - _ . are allowed"), "the error must say what IS allowed");
  assert.ok(p.includes("aria-invalid={!!repoNameError(newRepoName)}"), "the input must be marked invalid");
  assert.ok(p.includes("disabled={creating || !!repoNameError(newRepoName)}"), "Create must stay disabled while the name is invalid");
  assert.ok(p.includes("if (repoNameError(newRepoName)) return;"), "the submit handler must refuse a bad name even if the button is forced");
});

test("both create-repo options are checked by default and the user can uncheck them", () => {
  const p = page();
  assert.ok(p.includes("const [isPublic, setIsPublic] = useState(true)"), "Public must be on by default");
  assert.ok(p.includes("const [autoInit, setAutoInit] = useState(true)"), "Initialize with README must be on by default");
  assert.ok(p.includes('id="isPublic"'), "the public option must be a checkbox the user can change");
  assert.ok(p.includes('id="autoInit"'), "the README option must be a checkbox the user can change");
  assert.ok(p.includes("isPrivate: !isPublic"), "unchecking Public must create a private repo");
  assert.ok(p.includes("autoInit,"), "the README choice must reach the server, not a hardcoded true");
  assert.ok(!p.includes("autoInit: true"), "the README must not be hardcoded on");
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
  assert.ok(p.includes("full access to your account"), "the page must say the token has full access");
  assert.ok(p.includes("keep it private"), "the page must warn the token must stay private");
});
