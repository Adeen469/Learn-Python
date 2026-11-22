import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

// Map an Octokit (or lib) failure to a status + a generic message
// for the client: GitHub's own error text is never relayed — it
// leaks repo existence / permission hints and flattens every
// failure to 400. Our own validation errors (oversize / binary
// file) keep their message; everything else is a generic 502.
export function mapGithubError(err: unknown): { status: number; message: string } {
  const status = (err as { status?: unknown } | null)?.status;
  if (typeof status === "number") {
    if (status === 401)
      return { status: 401, message: "GitHub rejected the stored token — reconnect it from the GitHub page." };
    if (status === 403)
      return { status: 403, message: "GitHub refused this action — the token may lack the needed scope." };
    if (status === 404) return { status: 404, message: "Repo not found or no access" };
    if (status === 429)
      return { status: 429, message: "GitHub is rate-limiting requests — try again shortly." };
    return { status: 502, message: "GitHub is unavailable right now — try again shortly." };
  }
  if (err instanceof Error && (err.message.startsWith("File is larger than 50 MB") || err.message.startsWith("Binary file"))) {
    return { status: 400, message: err.message };
  }
  return { status: 502, message: "GitHub is unavailable right now — try again shortly." };
}

/** An error carrying an HTTP status, so mapGithubError can map it. */
export function githubHttpError(status: number, message: string): Error & { status: number } {
  return Object.assign(new Error(message), { status });
}

// Reject a request body above `maxBytes` BEFORE it is parsed:
// req.json() would otherwise parse a 50–100 MB body into memory
// first and only then let zod reject it. Only the Content-Length
// header is checked (a missing header means chunked — Vercel caps
// those at 4.5 MB anyway). Returns a 413 response, or null.
export function oversizedBodyResponse(req: Request, maxBytes: number): NextResponse | null {
  const len = Number(req.headers.get("content-length"));
  if (Number.isFinite(len) && len > maxBytes) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }
  return null;
}

// Who the stored token belongs to, cached briefly per token so the
// ownership check is not a GET /user on every request. Keyed by a
// SHA-256 of the token (never the token itself), 5-minute TTL, and
// capped so the map cannot grow without bound.
export interface GithubIdentity {
  login: string;
  orgs: string[];
}

const IDENTITY_TTL_MS = 5 * 60_000;
const IDENTITY_CACHE_MAX = 200;
const identityCache = new Map<string, { at: number; identity: GithubIdentity }>();

export async function getGithubIdentity(token: string): Promise<GithubIdentity> {
  const key = createHash("sha256").update(token).digest("hex");
  const cached = identityCache.get(key);
  if (cached && Date.now() - cached.at < IDENTITY_TTL_MS) return cached.identity;
  const octokit = getOctokit(token);
  const { data: user } = await octokit.rest.users.getAuthenticated();
  // Orgs are best-effort: a token without read:org cannot list
  // them, so an org the caller belongs to simply stays
  // unreachable through the app rather than failing the check.
  let orgs: string[] = [];
  try {
    const { data } = await octokit.rest.orgs.listForAuthenticatedUser();
    orgs = data.map((o) => o.login);
  } catch {}
  const identity: GithubIdentity = { login: user.login, orgs };
  if (identityCache.size >= IDENTITY_CACHE_MAX) {
    identityCache.delete(identityCache.keys().next().value as string);
  }
  identityCache.set(key, { at: Date.now(), identity });
  return identity;
}

// The ownership check (M11): the requested owner must be the
// token's own login or one of its orgs. A collaborator on someone
// else's repo is refused — the app proxies the user's own repos,
// not every repo their token can touch.
export async function assertGithubOwnerAllowed(token: string, owner: string): Promise<boolean> {
  const identity = await getGithubIdentity(token);
  return owner === identity.login || identity.orgs.includes(owner);
}

// Input validation for the repo routes (same shapes as the commit
// route's zod schema): owner/repo are GitHub slugs, a blob sha is 40
// hex chars, and a path never starts with / or contains ...
export const GITHUB_SLUG_RE = /^[a-zA-Z0-9_.-]{1,100}$/;
export const GITHUB_SHA_RE = /^[0-9a-f]{40}$/;

export function isValidGithubSlug(value: unknown): value is string {
  return typeof value === "string" && GITHUB_SLUG_RE.test(value);
}

export function isValidGithubSha(value: unknown): value is string {
  return typeof value === "string" && GITHUB_SHA_RE.test(value);
}

export function isValidGithubPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= 500 &&
    !value.startsWith("/") &&
    !value.includes("..")
  );
}

export function getOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}

export interface UserRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
}

export async function listUserRepos(token: string): Promise<UserRepo[]> {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 50,
  });
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    private: r.private,
    html_url: r.html_url,
    description: r.description,
    default_branch: r.default_branch,
  }));
}

export async function createUserRepo(
  token: string,
  params: { name: string; description?: string; isPrivate?: boolean; autoInit?: boolean; gitignoreTemplate?: string; licenseTemplate?: string }
): Promise<UserRepo> {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.repos.createForAuthenticatedUser({
    name: params.name,
    description: params.description ?? "",
    private: Boolean(params.isPrivate),
    auto_init: params.autoInit ?? true,
    // GitHub's own create form offers these two dropdowns (None by
    // default); only send a template when the user picked one.
    gitignore_template: params.gitignoreTemplate || undefined,
    license_template: params.licenseTemplate || undefined,
  });
  return {
    id: data.id,
    name: data.name,
    full_name: data.full_name,
    private: data.private,
    html_url: data.html_url,
    description: data.description,
    default_branch: data.default_branch,
  };
}

// Opening a repo in the editor is lazy (Maalik's word 2026-11-21 —
// no file-count limit, 50 MB per file): the tree arrives first and
// each file's content is fetched only when it is opened. Fetching
// every file up front cannot work — Learn-Python alone is 357 files
// / ~17 MB, while a Vercel function response caps at 4.5 MB and the
// browser's storage at ~5 MB. The tree is one call; a single file's
// content stays under the caps (the biggest file in his repos is
// ~1.2 MB). Files over 50 MB or binary files are refused by the
// file endpoint, and the tree itself is capped at 5,000 entries
// (truncated:true) — GitHub allows up to 100k, which would be a
// multi-MB response.
const REPO_OPEN_MAX_BYTES = 50 * 1024 * 1024;
const REPO_TREE_MAX_ENTRIES = 5_000;

export async function getRepoTree(
  token: string,
  params: { owner: string; repo: string }
): Promise<{
  repo: string;
  branch: string;
  files: { path: string; size: number; sha: string }[];
  truncated: boolean;
}> {
  const octokit = getOctokit(token);
  const { data: repoData } = await octokit.rest.repos.get({
    owner: params.owner,
    repo: params.repo,
  });
  const branch = repoData.default_branch;
  const { data: tree } = await octokit.rest.git.getTree({
    owner: params.owner,
    repo: params.repo,
    tree_sha: branch,
    recursive: "true",
  });
  const allFiles = (tree.tree ?? [])
    .filter((t) => t.type === "blob" && t.path && t.sha)
    .map((t) => ({ path: t.path as string, size: t.size ?? 0, sha: t.sha as string }));
  const files = allFiles.slice(0, REPO_TREE_MAX_ENTRIES);
  return { repo: repoData.full_name, branch, files, truncated: allFiles.length > REPO_TREE_MAX_ENTRIES };
}

export async function getRepoFileContent(
  token: string,
  params: { owner: string; repo: string; path: string; sha: string }
): Promise<{ path: string; content: string }> {
  const octokit = getOctokit(token);
  // A blob SHA alone proves nothing about the path: verify first
  // that the path in this repo actually points at this blob, or
  // any blob in the repo's history (a deleted .env included) could
  // be read by SHA. getContent also reports the size, so an
  // oversize file is refused BEFORE the blob is downloaded.
  const { data: meta } = await octokit.rest.repos.getContent({
    owner: params.owner,
    repo: params.repo,
    path: params.path,
  });
  if (Array.isArray(meta)) {
    throw githubHttpError(404, "File not found or no access");
  }
  if (meta.sha !== params.sha) {
    throw githubHttpError(404, "File not found or no access");
  }
  if ((meta.size ?? 0) > REPO_OPEN_MAX_BYTES) {
    throw new Error(`File is larger than 50 MB (${params.path})`);
  }
  const { data } = await octokit.rest.git.getBlob({
    owner: params.owner,
    repo: params.repo,
    file_sha: params.sha,
  });
  if ((data.size ?? 0) > REPO_OPEN_MAX_BYTES) {
    throw new Error(`File is larger than 50 MB (${params.path})`);
  }
  const content = Buffer.from(data.content, "base64").toString("utf8");
  if (content.includes("\0")) {
    throw new Error(`Binary file — cannot open as code (${params.path})`);
  }
  return { path: params.path, content };
}

export async function commitFileToRepo(
  token: string,
  params: {
    owner: string;
    repo: string;
    path: string;
    content: string;
    message: string;
    branch?: string;
  }
) {
  const octokit = getOctokit(token);
  let sha: string | undefined;

  try {
    const existing = await octokit.rest.repos.getContent({
      owner: params.owner,
      repo: params.repo,
      path: params.path,
      ref: params.branch,
    });
    if ("sha" in existing.data) {
      sha = existing.data.sha;
    }
  } catch {
    // File doesn't exist yet, which is expected for new files
  }

  const { data } = await octokit.rest.repos.createOrUpdateFileContents({
    owner: params.owner,
    repo: params.repo,
    path: params.path,
    message: params.message,
    content: Buffer.from(params.content, "utf8").toString("base64"),
    sha,
    branch: params.branch,
  });

  return data;
}

export async function deleteUserRepo(token: string, owner: string, repo: string): Promise<void> {
  const octokit = getOctokit(token);
  await octokit.rest.repos.delete({ owner, repo });
}

