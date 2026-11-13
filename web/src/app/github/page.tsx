"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { isEntered } from "@/lib/entered";
import {
  Check,
  Code2,
  ExternalLink,
  GitBranch,
  Github,
  KeyRound,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Send,
  Unlock,
} from "lucide-react";

interface RepoItem {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
}

export default function GitHubPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  // Entry gate: guests see only the landing page (route /).
  const [enteredChecked, setEnteredChecked] = useState(false);
  useEffect(() => {
    if (!isEntered((key) => localStorage.getItem(key))) {
      router.replace("/");
      return;
    }
    setEnteredChecked(true);
  }, [router]);
  const [savedToken, setSavedToken] = useState("");
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Repo Form
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Commit File Form
  const [selectedRepo, setSelectedRepo] = useState<RepoItem | null>(null);
  const [commitFilePath, setCommitFilePath] = useState("solution.py");
  const [commitMessage, setCommitMessage] = useState("feat: Add python solution from LP");
  const [commitContent, setCommitContent] = useState("");
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lp_github_token");
    if (stored) {
      setSavedToken(stored);
      fetchRepos(stored);
    }
    const virtualFiles = localStorage.getItem("lp_virtual_files");
    if (virtualFiles) {
      try {
        const parsed = JSON.parse(virtualFiles);
        if (parsed[0]?.content) {
          setCommitContent(parsed[0].content);
          setCommitFilePath(parsed[0].name || "solution.py");
        }
      } catch {}
    }
  }, []);

  function handleSaveToken(e: React.FormEvent) {
    e.preventDefault();
    const clean = token.trim();
    if (!clean) return;
    localStorage.setItem("lp_github_token", clean);
    setSavedToken(clean);
    setToken("");
    setSuccessMsg("Token saved in this browser only.");
    fetchRepos(clean);
  }

  function handleRemoveToken() {
    localStorage.removeItem("lp_github_token");
    setSavedToken("");
    setRepos([]);
    setSelectedRepo(null);
    setSuccessMsg("Disconnected GitHub token.");
  }

  async function fetchRepos(tok: string) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/github/repos", {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load repositories");
      setRepos(data.repos || []);
      if (data.repos?.length > 0 && !selectedRepo) {
        setSelectedRepo(data.repos[0]);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRepo(e: React.FormEvent) {
    e.preventDefault();
    if (!newRepoName.trim() || !savedToken) return;
    setCreating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/github/repos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({
          name: newRepoName.trim(),
          description: newRepoDesc.trim(),
          isPrivate,
          autoInit: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create repository");

      setSuccessMsg(`✓ Successfully created repo: ${data.repo.full_name}`);
      setNewRepoName("");
      setNewRepoDesc("");
      fetchRepos(savedToken);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleCommitFile(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRepo || !savedToken || !commitFilePath.trim()) return;
    setCommitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const [owner, repo] = selectedRepo.full_name.split("/");
    try {
      const res = await fetch("/api/github/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({
          owner,
          repo,
          path: commitFilePath.trim(),
          content: commitContent,
          message: commitMessage.trim(),
          branch: selectedRepo.default_branch,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to push file");
      setSuccessMsg(`✓ Pushed '${commitFilePath}' to ${selectedRepo.full_name}!`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setCommitting(false);
    }
  }

  // Guests never see this page — the gate effect above redirects to /.
  if (!enteredChecked) return null;

  return (
    // pb-20 clears the mobile bottom nav bar (md:pb-0: PC has no bottom bar).
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0">
      <AppNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Github className="h-5 w-5" /> GitHub Integration
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Connect your GitHub account using a Personal Access Token (PAT) with <code className="text-neutral-200">repo</code> scope to create repositories and commit code directly from LP.
          </p>
        </div>

        {/* Feedback banners */}
        {errorMsg && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs text-red-200">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-200">
            {successMsg}
          </div>
        )}

        {/* Token Section */}
        {!savedToken ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-white" /> Connect GitHub Personal Access Token
            </h2>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Create a token on{" "}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=LP+Educational+Platform"
                target="_blank"
                rel="noreferrer"
                className="underline text-white font-medium"
              >
                github.com/settings/tokens
              </a>{" "}
              with the <span className="font-mono bg-neutral-800 px-1 py-0.5 rounded text-white">repo</span> scope, then paste it below. Your token lives only in this browser (localStorage). It is sent to the LP server only to call GitHub on your behalf, is never stored on the server, and Disconnect removes it from this browser.
            </p>

            <form onSubmit={handleSaveToken} className="mt-4 flex gap-2">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition"
              >
                Connect Token
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <Check className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="truncate text-neutral-300">
                Connected to GitHub • <span className="font-mono text-neutral-400">{savedToken.slice(0, 7)}...</span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => fetchRepos(savedToken)}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-black px-2.5 py-1 text-xs text-neutral-300 hover:text-white"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <button
                type="button"
                onClick={handleRemoveToken}
                className="rounded-lg border border-neutral-800 bg-black px-2.5 py-1 text-xs text-neutral-400 hover:text-red-400 transition"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Main Grid: Create Repo + Commit/Alter Repo */}
        {savedToken && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Create Repository */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create New GitHub Repository
              </h2>
              <form onSubmit={handleCreateRepo} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Repository Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="my-python-learning"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Description (optional)</label>
                  <input
                    type="text"
                    placeholder="Practice solutions and notes from LP"
                    value={newRepoDesc}
                    onChange={(e) => setNewRepoDesc(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-neutral-800 bg-black"
                  />
                  <label htmlFor="isPrivate" className="text-xs text-neutral-300 flex items-center gap-1 cursor-pointer">
                    {isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5 text-neutral-400" />}
                    {isPrivate ? "Private repository" : "Public repository"}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full mt-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Create Repository on GitHub
                </button>
              </form>
            </div>

            {/* Commit / Alter Repository */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Send className="h-4 w-4" /> Push / Commit Code from Workspace
              </h2>
              <form onSubmit={handleCommitFile} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Target Repository *</label>
                  <select
                    value={selectedRepo?.full_name ?? ""}
                    onChange={(e) => {
                      const found = repos.find((r) => r.full_name === e.target.value);
                      setSelectedRepo(found ?? null);
                    }}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                  >
                    {repos.map((r) => (
                      <option key={r.id} value={r.full_name}>
                        {r.full_name} ({r.private ? "Private" : "Public"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">File Path in Repo *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. main.py"
                      value={commitFilePath}
                      onChange={(e) => setCommitFilePath(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Commit Message *</label>
                    <input
                      type="text"
                      required
                      placeholder="Commit message"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">File Content</label>
                  <textarea
                    rows={6}
                    value={commitContent}
                    onChange={(e) => setCommitContent(e.target.value)}
                    placeholder="# Python code to commit"
                    className="w-full rounded-lg border border-neutral-800 bg-black p-3 font-mono text-xs text-neutral-200 resize-none focus:border-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={committing || !selectedRepo}
                  className="w-full rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {committing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitBranch className="h-3.5 w-3.5" />}
                  Commit & Push to {selectedRepo?.name ?? "Repo"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Existing Repositories List */}
        {savedToken && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <GitBranch className="h-4 w-4" /> Your Repositories ({repos.length})
            </h2>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-neutral-400 py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Fetching your repositories...
              </div>
            ) : repos.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">No repositories found or access restricted.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {repos.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-800 bg-black p-3 text-xs hover:border-neutral-700 transition"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{r.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-neutral-800 text-neutral-400">
                          {r.private ? "private" : "public"}
                        </span>
                      </div>
                      <p className="text-neutral-500 text-[11px] truncate mt-0.5">
                        {r.description || "No description"}
                      </p>
                    </div>
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-400 hover:text-white shrink-0 p-1"
                      title="Open on GitHub"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

