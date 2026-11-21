import { Octokit } from "@octokit/rest";

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

// Fetch a repo's files for opening it in the code editor (like
// GitHub's code view): the recursive tree, then each blob's content.
// Caps keep it bounded — big binaries and huge repos stay out, and
// the caller reports how many files were skipped.
const REPO_OPEN_MAX_FILES = 100;
const REPO_OPEN_MAX_BYTES = 100_000;

export async function getRepoFiles(
  token: string,
  params: { owner: string; repo: string }
): Promise<{
  repo: string;
  branch: string;
  files: { path: string; content: string }[];
  skipped: number;
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
  const allBlobs = (tree.tree ?? []).filter(
    (t) => t.type === "blob" && t.path && t.sha
  );
  const smallBlobs = allBlobs.filter((t) => (t.size ?? 0) <= REPO_OPEN_MAX_BYTES);
  const truncated = smallBlobs.length > REPO_OPEN_MAX_FILES || tree.truncated === true;
  const picked = smallBlobs.slice(0, REPO_OPEN_MAX_FILES);
  let skipped = allBlobs.length - picked.length;
  const files: { path: string; content: string }[] = [];
  // Blobs in small parallel batches — 100 sequential calls would
  // take too long, 100 at once would trip GitHub's secondary limits.
  for (let i = 0; i < picked.length; i += 10) {
    const batch = picked.slice(i, i + 10);
    const results = await Promise.all(
      batch.map(async (b) => {
        try {
          const { data } = await octokit.rest.git.getBlob({
            owner: params.owner,
            repo: params.repo,
            file_sha: b.sha as string,
          });
          const content = Buffer.from(data.content, "base64").toString("utf8");
          if (content.includes("\0")) return null; // binary
          return { path: b.path as string, content };
        } catch {
          return null;
        }
      })
    );
    for (const r of results) {
      if (r) files.push(r);
      else skipped += 1;
    }
  }
  return { repo: repoData.full_name, branch, files, skipped, truncated };
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

