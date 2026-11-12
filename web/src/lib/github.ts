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
  params: { name: string; description?: string; isPrivate?: boolean; autoInit?: boolean }
): Promise<UserRepo> {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.repos.createForAuthenticatedUser({
    name: params.name,
    description: params.description ?? "",
    private: Boolean(params.isPrivate),
    auto_init: params.autoInit ?? true,
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

