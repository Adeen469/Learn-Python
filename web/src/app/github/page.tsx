"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { fetchSessionUser } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n";
import type { Strings } from "@/lib/i18n";
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

// Every classic PAT scope GitHub offers, so the token link below opens
// GitHub with all of them pre-checked (Maalik's word, 2026-11-18 —
// "sare add krna h, sab prechecked hone chahiye"). A token with these
// scopes can do anything on the account — delete repos, control orgs
// and billing included — so it must stay in this browser only
// (localStorage) and never be shared.
const GITHUB_TOKEN_SCOPES = [
  "repo", "repo:status", "repo_deployment", "public_repo", "repo:invite", "security_events",
  "workflow",
  "write:packages", "read:packages", "delete:packages",
  "admin:org", "write:org", "read:org", "manage_runners:org",
  "admin:public_key", "write:public_key", "read:public_key",
  "admin:repo_hook", "write:repo_hook", "read:repo_hook",
  "admin:org_hook",
  "gist",
  "notifications",
  "user", "read:user", "user:email", "user:follow",
  "delete_repo",
  "write:discussion", "read:discussion",
  "admin:enterprise", "manage_runners:enterprise", "manage_billing:enterprise", "read:enterprise", "scim:enterprise",
  "audit_log", "read:audit_log",
  "codespace", "codespace:secrets",
  "copilot", "manage_billing:copilot",
  "write:network_configurations", "read:network_configurations",
  "project", "read:project",
  "admin:gpg_key", "write:gpg_key", "read:gpg_key",
  "admin:ssh_signing_key", "write:ssh_signing_key", "read:ssh_signing_key",
].join(",");
const GITHUB_TOKEN_URL = `https://github.com/settings/tokens/new?scopes=${GITHUB_TOKEN_SCOPES}&description=LP+Educational+Platform`;

interface RepoItem {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
}

// GitHub's own create-repo dropdowns (the template names are
// GitHub's canonical ones, so they pass straight to the API). Empty
// string = None, the same default GitHub shows.
const GITIGNORE_TEMPLATES = [
  "Python", "Node", "Java", "C", "C++", "C#", "Go", "Ruby", "Rust",
  "Swift", "Kotlin", "PHP", "R", "Android", "Django", "Flask",
  "Laravel", "macOS", "Windows", "Linux", "VisualStudioCode",
  "JupyterNotebook",
];
const LICENSE_TEMPLATES = [
  { id: "mit", name: "MIT License" },
  { id: "apache-2.0", name: "Apache License 2.0" },
  { id: "gpl-3.0", name: "GNU General Public License v3.0" },
  { id: "gpl-2.0", name: "GNU General Public License v2.0" },
  { id: "bsd-3-clause", name: "BSD 3-Clause License" },
  { id: "bsd-2-clause", name: "BSD 2-Clause License" },
  { id: "mpl-2.0", name: "Mozilla Public License 2.0" },
  { id: "lgpl-3.0", name: "GNU Lesser General Public License v3.0" },
  { id: "agpl-3.0", name: "GNU Affero General Public License v3.0" },
  { id: "unlicense", name: "The Unlicense" },
  { id: "cc0-1.0", name: "Creative Commons Zero v1.0 Universal" },
  { id: "epl-2.0", name: "Eclipse Public License 2.0" },
  { id: "bsl-1.0", name: "Boost Software License 1.0" },
];

// The repo-name rule, kept identical to the server's
// (src/app/api/github/repos/route.ts): 1-100 chars, letters, numbers,
// hyphen, underscore and dot only — no spaces. The form checks it live
// so a bad name is caught here, not by the server's generic 400.
const REPO_NAME_RE = /^[a-zA-Z0-9_.-]+$/;
function repoNameError(name: string, t: Strings): string | null {
  const clean = name.trim();
  if (!clean) return null; // an empty name is covered by `required`
  if (clean.length > 100) return t.githubPage.repoNameTooLong;
  if (!REPO_NAME_RE.test(clean))
    return t.githubPage.repoNameInvalidChars;
  return null;
}

export default function GitHubPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [token, setToken] = useState("");

  // Auth gate: guests see only the landing page (route /). Renders
  // nothing until the session check resolves — no app UI flash.
  const [enteredChecked, setEnteredChecked] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetchSessionUser().then((user) => {
      if (cancelled) return;
      if (!user) {
        router.replace("/");
        return;
      }
      setEnteredChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);
  const [savedToken, setSavedToken] = useState("");
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Repo Form — both options are OFF by default (the way GitHub
  // shows them: Public is a choice, README is unchecked). The user
  // opts in to a public repo or a README instead of opting out.
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [autoInit, setAutoInit] = useState(false);
  const [gitignoreTemplate, setGitignoreTemplate] = useState("");
  const [licenseTemplate, setLicenseTemplate] = useState("");
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
    setSuccessMsg(t.githubPage.tokenSaved);
    fetchRepos(clean);
  }

  function handleRemoveToken() {
    localStorage.removeItem("lp_github_token");
    setSavedToken("");
    setRepos([]);
    setSelectedRepo(null);
    setSuccessMsg(t.githubPage.tokenRemoved);
  }

  async function fetchRepos(tok: string) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/github/repos", {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.githubPage.loadReposFailed);
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
    if (repoNameError(newRepoName, t)) return;
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
          isPrivate: !isPublic,
          autoInit,
          gitignoreTemplate: gitignoreTemplate || undefined,
          licenseTemplate: licenseTemplate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.githubPage.createRepoFailed);

      setSuccessMsg(t.githubPage.repoCreated(data.repo.full_name));
      setNewRepoName("");
      setNewRepoDesc("");
      setGitignoreTemplate("");
      setLicenseTemplate("");
      fetchRepos(savedToken);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  // Open a repo in the code editor, like GitHub's code view: hand
  // the editor just the repo's name — it fetches the file tree
  // itself and loads each file's content lazily when it is opened
  // (fetching every file up front cannot work: Learn-Python alone
  // is 357 files / ~17 MB, past Vercel's 4.5 MB response cap and the
  // browser's ~5 MB storage). The repo card itself is the button;
  // the small external link still opens github.com.
  function openRepoInEditor(repo: RepoItem) {
    sessionStorage.setItem("lp_open_repo", JSON.stringify({ repo: repo.full_name }));
    router.push("/editor");
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
      if (!res.ok) throw new Error(data.error || t.githubPage.pushFailed);
      setSuccessMsg(t.githubPage.pushed(commitFilePath, selectedRepo.full_name));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setCommitting(false);
    }
  }

  // The translated `tokenExplainer` contains the literal link text
  // "github.com/settings/tokens" (kept untranslated in every language),
  // and `connected` embeds the masked token prefix — split on those
  // literals so the link stays clickable and the prefix stays monospaced.
  // If a translation ever moves/drops the literal, fall back to the
  // plain translated string.
  const tokenExplainerParts =
    t.githubPage.tokenExplainer.split("github.com/settings/tokens");
  const tokenPrefix = savedToken.slice(0, 7);
  const connectedParts = t.githubPage.connected(tokenPrefix).split(tokenPrefix);

  // Guests never see this page — the gate effect above redirects to /.
  if (!enteredChecked) return null;

  return (
    // pb-20 clears the mobile bottom nav bar (md:pb-0: PC has no bottom bar).
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0">
      <AppNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Github className="h-5 w-5" /> {t.githubPage.title}
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            {t.githubPage.intro}
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
              <KeyRound className="h-4 w-4 text-white" /> {t.githubPage.connectHeading}
            </h2>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              {tokenExplainerParts.length === 2 ? (
                <>
                  {tokenExplainerParts[0]}
                  <a
                    href={GITHUB_TOKEN_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-white font-medium"
                  >
                    github.com/settings/tokens
                  </a>
                  {tokenExplainerParts[1]}
                </>
              ) : (
                t.githubPage.tokenExplainer
              )}
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
                {t.githubPage.connectToken}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <Check className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="truncate text-neutral-300">
                {connectedParts.length === 2 ? (
                  <>
                    {connectedParts[0]}
                    <span className="font-mono text-neutral-400">
                      {tokenPrefix}...
                    </span>
                    {connectedParts[1].replace(/^\.\.\./, "")}
                  </>
                ) : (
                  t.githubPage.connected(tokenPrefix)
                )}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => fetchRepos(savedToken)}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-black px-2.5 py-1 text-xs text-neutral-300 hover:text-white"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> {t.githubPage.refresh}
              </button>
              <button
                type="button"
                onClick={handleRemoveToken}
                className="rounded-lg border border-neutral-800 bg-black px-2.5 py-1 text-xs text-neutral-400 hover:text-red-400 transition"
              >
                {t.githubPage.disconnect}
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
                <Plus className="h-4 w-4" /> {t.githubPage.createHeading}
              </h2>
              <form onSubmit={handleCreateRepo} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">{t.githubPage.repoNameLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder="my-python-learning"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    aria-invalid={!!repoNameError(newRepoName, t)}
                    className={`w-full rounded-lg border bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none ${repoNameError(newRepoName, t) ? "border-red-500 focus:border-red-400" : "border-neutral-800 focus:border-white"}`}
                  />
                  {repoNameError(newRepoName, t) && (
                    <p className="mt-1 text-[11px] text-red-400">{repoNameError(newRepoName, t)}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">{t.githubPage.descriptionLabel}</label>
                  <input
                    type="text"
                    placeholder={t.githubPage.descriptionPlaceholder}
                    value={newRepoDesc}
                    onChange={(e) => setNewRepoDesc(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-neutral-800 bg-black"
                  />
                  <label htmlFor="isPublic" className="text-xs text-neutral-300 flex items-center gap-1 cursor-pointer">
                    {isPublic ? <Unlock className="h-3.5 w-3.5 text-neutral-400" /> : <Lock className="h-3.5 w-3.5" />}
                    {isPublic ? t.githubPage.publicRepo : t.githubPage.privateRepo}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoInit"
                    checked={autoInit}
                    onChange={(e) => setAutoInit(e.target.checked)}
                    className="rounded border-neutral-800 bg-black"
                  />
                  <label htmlFor="autoInit" className="text-xs text-neutral-300 cursor-pointer">
                    {t.githubPage.initReadme}
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">{t.githubPage.gitignoreLabel}</label>
                    <select
                      value={gitignoreTemplate}
                      onChange={(e) => setGitignoreTemplate(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    >
                      <option value="">{t.githubPage.noneOption}</option>
                      {GITIGNORE_TEMPLATES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">{t.githubPage.licenseLabel}</label>
                    <select
                      value={licenseTemplate}
                      onChange={(e) => setLicenseTemplate(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    >
                      <option value="">{t.githubPage.noneOption}</option>
                      {LICENSE_TEMPLATES.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating || !!repoNameError(newRepoName, t)}
                  className="w-full mt-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  {t.githubPage.createButton}
                </button>
              </form>
            </div>

            {/* Commit / Alter Repository */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Send className="h-4 w-4" /> {t.githubPage.commitHeading}
              </h2>
              <form onSubmit={handleCommitFile} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">{t.githubPage.targetRepoLabel}</label>
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
                        {r.private
                          ? t.githubPage.visibilityPrivate(r.full_name)
                          : t.githubPage.visibilityPublic(r.full_name)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">{t.githubPage.filePathLabel}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.githubPage.filePathPlaceholder}
                      value={commitFilePath}
                      onChange={(e) => setCommitFilePath(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">{t.githubPage.commitMessageLabel}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.githubPage.commitMessagePlaceholder}
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">{t.githubPage.fileContentLabel}</label>
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
                  {t.githubPage.commitButton(selectedRepo?.name ?? t.githubPage.repoFallback)}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Existing Repositories List */}
        {savedToken && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <GitBranch className="h-4 w-4" /> {t.githubPage.yourRepos(repos.length)}
            </h2>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-neutral-400 py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> {t.githubPage.fetchingRepos}
              </div>
            ) : repos.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">{t.githubPage.noRepos}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {repos.map((r) => (
                  <div
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    title={t.githubPage.openInEditor}
                    onClick={() => openRepoInEditor(r)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openRepoInEditor(r);
                      }
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-800 bg-black p-3 text-xs hover:border-neutral-600 transition"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{r.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-neutral-800 text-neutral-400">
                          {r.private ? t.githubPage.visibilityPrivateShort : t.githubPage.visibilityPublicShort}
                        </span>
                      </div>
                      <p className="text-neutral-500 text-[11px] truncate mt-0.5">
                        {r.description || t.githubPage.noDescription}
                      </p>
                    </div>
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-neutral-400 hover:text-white shrink-0 p-1"
                      title={t.githubPage.openOnGitHub}
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

