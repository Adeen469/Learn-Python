import { Octokit } from "@octokit/rest";

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
// file endpoint, and the tree itself is capped only by GitHub
// (100k entries).
const REPO_OPEN_MAX_BYTES = 50 * 1024 * 1024;

export async function getRepoTree(
  token: string,
  params: { owner: string; repo: string }
): Promise<{
  repo: string;
  branch: string;
  files: { path: string; size: number; sha: string }[];
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
  const files = (tree.tree ?? [])
    .filter((t) => t.type === "blob" && t.path && t.sha)
    .map((t) => ({ path: t.path as string, size: t.size ?? 0, sha: t.sha as string }));
  return { repo: repoData.full_name, branch, files };
}

export async function getRepoFileContent(
  token: string,
  params: { owner: string; repo: string; path: string; sha: string }
): Promise<{ path: string; content: string }> {
  const octokit = getOctokit(token);
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

