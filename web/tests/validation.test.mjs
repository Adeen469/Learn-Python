import assert from "node:assert/strict";
import test from "node:test";

// Inline pure helpers mirroring the validators in the API routes
// (src/app/api/pypi/route.ts isValidPackageName, and the zod-shaped
// commit rules in src/app/api/github/commit/route.ts) for zero-build
// node --test verification.

function isValidPackageName(name) {
  if (name.length < 1 || name.length > 100) return false;
  if (!/^[a-zA-Z0-9_.\-]+$/.test(name)) return false;
  if (/^[-._]/.test(name) || /[-._]$/.test(name)) return false;
  return true;
}

const OWNER_REPO_RE = /^[a-zA-Z0-9_.-]+$/;
const BRANCH_RE = /^[a-zA-Z0-9_.\-/]+$/;

function isValidCommitPath(path) {
  return (
    path.length >= 1 && path.length <= 500 && !path.startsWith("/") && !path.includes("..")
  );
}

test("PyPI package names: accepts normal names", () => {
  assert.equal(isValidPackageName("requests"), true);
  assert.equal(isValidPackageName("numpy"), true);
  assert.equal(isValidPackageName("django-rest-framework"), true);
  assert.equal(isValidPackageName("my_package.v2"), true);
  assert.equal(isValidPackageName("a"), true);
  assert.equal(isValidPackageName("x".repeat(100)), true);
});

test("PyPI package names: rejects leading/trailing - . _", () => {
  assert.equal(isValidPackageName("-requests"), false);
  assert.equal(isValidPackageName("requests-"), false);
  assert.equal(isValidPackageName(".requests"), false);
  assert.equal(isValidPackageName("requests."), false);
  assert.equal(isValidPackageName("_requests"), false);
  assert.equal(isValidPackageName("requests_"), false);
});

test("PyPI package names: rejects bad chars, empty, and over-long names", () => {
  assert.equal(isValidPackageName(""), false);
  assert.equal(isValidPackageName("req uests"), false);
  assert.equal(isValidPackageName("requests;rm"), false);
  assert.equal(isValidPackageName("../../etc/passwd"), false);
  assert.equal(isValidPackageName("https://pypi.org"), false);
  assert.equal(isValidPackageName("x".repeat(101)), false);
});

test("GitHub owner/repo names accept alphanumerics, -, _, . only", () => {
  assert.equal(OWNER_REPO_RE.test("Adeen469"), true);
  assert.equal(OWNER_REPO_RE.test("my-repo.v2_test"), true);
  assert.equal(OWNER_REPO_RE.test("owner/repo"), false);
  assert.equal(OWNER_REPO_RE.test("../repo"), false);
  assert.equal(OWNER_REPO_RE.test("repo name"), false);
  assert.equal(OWNER_REPO_RE.test(""), false);
});

test("GitHub commit paths reject traversal and absolute paths", () => {
  assert.equal(isValidCommitPath("solution.py"), true);
  assert.equal(isValidCommitPath("src/main.py"), true);
  assert.equal(isValidCommitPath("../secret.txt"), false);
  assert.equal(isValidCommitPath("src/../../etc/passwd"), false);
  assert.equal(isValidCommitPath("/etc/passwd"), false);
  assert.equal(isValidCommitPath(""), false);
  assert.equal(isValidCommitPath("x".repeat(501)), false);
});

test("GitHub branch names accept slashes and dots, reject spaces", () => {
  assert.equal(BRANCH_RE.test("main"), true);
  assert.equal(BRANCH_RE.test("feature/add-thing"), true);
  assert.equal(BRANCH_RE.test("release/v1.2"), true);
  assert.equal(BRANCH_RE.test("my branch"), false);
  assert.equal(BRANCH_RE.test("branch;rm"), false);
});
