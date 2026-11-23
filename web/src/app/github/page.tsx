"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { EditorContextMenu } from "@/components/EditorContextMenu";
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
  Star,
  Unlock,
} from "lucide-react";

// Every classic PAT scope GitHub offers, so the token link below opens
// GitHub with all of them pre-checked (Maalik's word, 2026-11-18 —
// "sare add krna h, sab prechecked hone chahiye"). A token with these
// scopes can do anything on the account — delete repos, control orgs
// and billing included — so it must stay in this browser only
// (localStorage) and never be shared.
// Least privilege: the app only reads/writes repositories (list,
// create, commit, read tree/blobs) — everything that needs the
// `repo` scope — plus deleting a repo, which needs `delete_repo`
// (the repos list's right-click menu; a repo-only token still works
// for everything except delete). The old list pre-checked 51 scopes,
// including admin:org/enterprise, manage_billing and admin keys:
// a leaked token would have owned the whole GitHub account. Any
// token created with the old link still carries those scopes and
// must be regenerated with repo + delete_repo.
const GITHUB_TOKEN_SCOPES = ["repo", "delete_repo"].join(",");
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
  // Whether a GitHub token is stored on the server for this user
  // (migration 006) — the browser never holds the token itself.
  // tokenConfigured false means the server storage is not set up
  // yet (missing service-role key / migration 006): the page shows
  // a setup message instead of the connect form.
  const [tokenConnected, setTokenConnected] = useState(false);

  // The token's expiry as GitHub reported it at save time (null =
  // no expiry, or unknown). The page warns when it is close.
  const [tokenExpiresAt, setTokenExpiresAt] = useState<string | null>(null);
  const tokenExpiresDaysLeft =
    tokenExpiresAt === null
      ? null
      : Math.ceil((new Date(tokenExpiresAt).getTime() - Date.now()) / 86_400_000);
  const [tokenConfigured, setTokenConfigured] = useState(true);
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

  // Repo right-click menu (PC) / long-press (mobile): Open in code
  // editor, Open in GitHub, Copy link, Fav, Delete. The menu itself
  // is the shared EditorContextMenu — the trigger is just
  // onContextMenu here, the same pattern the editor's file tree
  // uses (a long-press fires contextmenu on mobile too).
  const [repoMenu, setRepoMenu] = useState<{ repo: RepoItem; x: number; y: number } | null>(null);

  // Favourites: repo full names, kept in this browser only.
  // Favourited repos sort first in the list and carry a filled star.
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lp_github_favs");
      if (raw) setFavs(JSON.parse(raw));
    } catch {}
  }, []);
  function toggleFav(fullName: string) {
    setFavs((prev) => {
      const next = prev.includes(fullName)
        ? prev.filter((f) => f !== fullName)
        : [...prev, fullName];
      try {
        localStorage.setItem("lp_github_favs", JSON.stringify(next));
      } catch {}
      return next;
    });
  }
  const sortedRepos = [...repos].sort((a, b) => {
    const fa = favs.includes(a.full_name) ? 0 : 1;
    const fb = favs.includes(b.full_name) ? 0 : 1;
    return fa - fb;
  });

  // Delete dialog (moved here from the editor's menu bar — a
  // permanent action belongs where repos are managed, not beside
  // Push). Same GitHub-style guard: type the exact owner/repo to
  // arm the Delete button. The dialog copy is shared with the
  // editor's old dialog (t.editorPage.deleteRepo*).
  const [deleteTarget, setDeleteTarget] = useState<RepoItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingRepo, setDeletingRepo] = useState(false);
  // Step-up (R3-M2): the server requires the account password (when
  // the account has one) and a TOTP/backup code (when 2FA is on)
  // before deleting — collected in this same dialog, no new UI.
  // Which fields show comes from /api/auth/2fa/status when the
  // dialog opens; if that check fails both stay hidden and the
  // server enforces (it 400s if a password/code was needed).
  // NOTE: this extends an existing dialog (password + code fields)
  // and needs Maalik's explicit UI permission before it pushes.
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteTotpCode, setDeleteTotpCode] = useState("");
  const [deleteNeedsPassword, setDeleteNeedsPassword] = useState(false);
  const [deleteNeedsTotp, setDeleteNeedsTotp] = useState(false);
  useEffect(() => {
    if (!deleteTarget) return;
    setDeletePassword("");
    setDeleteTotpCode("");
    setDeleteNeedsPassword(false);
    setDeleteNeedsTotp(false);
    let cancelled = false;
    fetch("/api/auth/2fa/status", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json().catch(() => null) : null))
      .then((data) => {
        if (cancelled || !data || typeof data !== "object") return;
        if ((data as { hasPassword?: unknown }).hasPassword === true) {
          setDeleteNeedsPassword(true);
        }
        if ((data as { totpEnabled?: unknown }).totpEnabled === true) {
          setDeleteNeedsTotp(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [deleteTarget]);
  function closeDeleteDialog() {
    setDeleteTarget(null);
    setDeleteConfirmText("");
    setDeletePassword("");
    setDeleteTotpCode("");
    setDeleteError(null);
  }
  async function confirmDeleteRepo() {
    if (!deleteTarget || deletingRepo) return;
    const [owner, repo] = deleteTarget.full_name.split("/");
    setDeletingRepo(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/github/delete-repo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, password: deletePassword, code: deleteTotpCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not delete the repo");
      setRepos((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      if (selectedRepo?.id === deleteTarget.id) setSelectedRepo(null);
      setFavs((prev) => prev.filter((f) => f !== deleteTarget.full_name));
      setSuccessMsg(t.githubPage.repoDeleted(deleteTarget.full_name));
      closeDeleteDialog();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete the repo");
    } finally {
      setDeletingRepo(false);
    }
  }

  async function copyRepoLink(repo: RepoItem) {
    try {
      await navigator.clipboard.writeText(repo.html_url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = repo.html_url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      ta.remove();
    }
    setSuccessMsg(t.githubPage.repoLinkCopied);
  }
  const [commitFilePath, setCommitFilePath] = useState("solution.py");
  const [commitMessage, setCommitMessage] = useState("feat: Add python solution from LP");
  const [commitContent, setCommitContent] = useState("");
  const [committing, setCommitting] = useState(false);

  // One-time migration: a token saved in this browser before the
  // server move gets posted once, then deleted from localStorage.
  // The token is never written to localStorage again — and if the
  // move fails (even after one retry) the browser copy is deleted
  // anyway and the input stays empty, so a plaintext PAT never
  // lingers in this browser waiting for the next XSS. The user
  // pastes it fresh instead.
  async function migrateLocalToken(stored: string): Promise<boolean> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch("/api/github/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: stored.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          try {
            localStorage.removeItem("lp_github_token");
          } catch {}
          setTokenConnected(true);
          setSuccessMsg(t.githubPage.tokenSaved);
          fetchRepos();
          return true;
        }
        setErrorMsg(
          data.error ||
            "Could not move your saved token to the server — paste it below to connect again."
        );
      } catch {
        // Network failure: retry once, then give up below.
      }
    }
    try {
      localStorage.removeItem("lp_github_token");
    } catch {}
    return false;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/github/token/status");
        const data = await res.json();
        if (cancelled || !res.ok) return;
        setTokenConfigured(data.configured !== false);
        setTokenConnected(!!data.connected);
        setTokenExpiresAt(typeof data.expiresAt === "string" ? data.expiresAt : null);
        if (data.connected) {
          // A token already lives on the server — drop any stale
          // plaintext copy from this browser.
          try {
            localStorage.removeItem("lp_github_token");
          } catch {}
          fetchRepos();
        } else {
          let stored: string | null = null;
          try {
            stored = localStorage.getItem("lp_github_token");
          } catch {}
          if (stored) {
            // A failed migration deletes the browser copy and
            // leaves the input empty — the stored token is never
            // put back into the paste field.
            await migrateLocalToken(stored);
          }
        }
      } catch {
        // Offline: the page still renders, actions will fail loudly.
      }
    })();
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
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveToken(e: React.FormEvent) {
    e.preventDefault();
    const clean = token.trim();
    if (!clean) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: clean }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save the token");
      setToken("");
      setTokenConnected(true);
      setSuccessMsg(t.githubPage.tokenSaved);
      fetchRepos();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleRemoveToken() {
    try {
      await fetch("/api/github/token", { method: "DELETE" });
    } catch {}
    setTokenConnected(false);
    setRepos([]);
    setSelectedRepo(null);
    setSuccessMsg(t.githubPage.tokenRemoved);
  }

  // The server resolves the caller's stored token from the session
  // — no Authorization header leaves this browser.
  async function fetchRepos() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/github/repos");
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
    if (!newRepoName.trim() || !tokenConnected) return;
    if (repoNameError(newRepoName, t)) return;
    setCreating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/github/repos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      fetchRepos();
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
    if (!selectedRepo || !tokenConnected || !commitFilePath.trim()) return;
    setCommitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const [owner, repo] = selectedRepo.full_name.split("/");
    try {
      const res = await fetch("/api/github/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
  // split on that literal so the link stays clickable.
  // If a translation ever moves/drops the literal, fall back to the
  // plain translated string.
  const tokenExplainerParts =
    t.githubPage.tokenExplainer.split("github.com/settings/tokens");

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

        {/* Token storage not set up yet (missing service-role key /
            migration 006): show the setup message, not the form. */}
        {!tokenConfigured && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
            {t.githubPage.tokenStorageNotReady}
          </div>
        )}

        {/* Token Section */}
        {!tokenConnected ? (
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
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="truncate text-neutral-300">
                  {t.githubPage.connected}
                </span>
              </div>
              {/* A token that lapses soon (or already has) must not
                  fail silently on the next GitHub call — warn here
                  while there is still time to renew it. */}
              {tokenExpiresDaysLeft !== null && tokenExpiresDaysLeft <= 14 && (
                <p className="mt-1 text-[11px] text-amber-400">
                  {tokenExpiresDaysLeft <= 0
                    ? t.githubPage.tokenExpired
                    : t.githubPage.tokenExpiringSoon(tokenExpiresDaysLeft)}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => fetchRepos()}
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
        {tokenConnected && (
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
        {tokenConnected && (
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
                {sortedRepos.map((r) => (
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
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setRepoMenu({ repo: r, x: e.clientX, y: e.clientY });
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-800 bg-black p-3 text-xs hover:border-neutral-600 transition"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{r.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-neutral-800 text-neutral-400">
                          {r.private ? t.githubPage.visibilityPrivateShort : t.githubPage.visibilityPublicShort}
                        </span>
                        {favs.includes(r.full_name) && (
                          <Star className="h-3.5 w-3.5 shrink-0 text-amber-400" fill="currentColor" />
                        )}
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

        {/* Repo context menu: right-click (PC) or long-press
            (mobile) on a repo card. */}
        {repoMenu && (
          <EditorContextMenu
            x={repoMenu.x}
            y={repoMenu.y}
            onClose={() => setRepoMenu(null)}
            items={[
              {
                id: "open-editor",
                label: t.githubPage.repoMenuOpenEditor,
                action: () => openRepoInEditor(repoMenu.repo),
              },
              {
                id: "open-github",
                label: t.githubPage.repoMenuOpenGithub,
                action: () => window.open(repoMenu.repo.html_url, "_blank", "noreferrer"),
              },
              {
                id: "copy-link",
                label: t.githubPage.repoMenuCopyLink,
                action: () => void copyRepoLink(repoMenu.repo),
              },
              {
                id: "fav",
                label: favs.includes(repoMenu.repo.full_name)
                  ? t.githubPage.repoMenuUnfav
                  : t.githubPage.repoMenuFav,
                action: () => toggleFav(repoMenu.repo.full_name),
              },
              { id: "sep", label: "", separator: true },
              {
                id: "delete",
                label: t.githubPage.repoMenuDelete,
                danger: true,
                action: () => {
                  setDeleteTarget(repoMenu.repo);
                  setDeleteConfirmText("");
                  setDeleteError(null);
                },
              },
            ]}
          />
        )}

        {/* Delete-repo dialog: type the full owner/repo name to arm
            the Delete button — the same guard GitHub itself uses,
            because deleting is permanent. */}
        {deleteTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => closeDeleteDialog()}
          >
            <div
              className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-950 p-4 shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-label={t.editorPage.deleteRepoTitle}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-sm font-semibold text-white">{t.editorPage.deleteRepoTitle}</h2>
              <p className="mt-1 text-xs text-neutral-400">
                {t.editorPage.deleteRepoWarning(deleteTarget.full_name)}
              </p>
              <p className="mt-2 text-xs text-neutral-500">{t.editorPage.deleteRepoOwnerNote}</p>
              <p className="mt-1 text-xs text-neutral-500">{t.editorPage.deleteRepoScopeNote}</p>
              <label
                htmlFor="delete-repo-confirm"
                className="mt-3 block text-xs font-medium text-neutral-300"
              >
                {t.editorPage.deleteRepoConfirmLabel}
              </label>
              <input
                id="delete-repo-confirm"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={t.editorPage.deleteRepoConfirmPlaceholder}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 font-mono text-xs text-white placeholder-neutral-600 focus:border-red-500 focus:outline-none"
              />
              {deleteNeedsPassword && (
                <>
                  <label
                    htmlFor="delete-repo-password"
                    className="mt-3 block text-xs font-medium text-neutral-300"
                  >
                    Your password
                  </label>
                  <input
                    id="delete-repo-password"
                    type="password"
                    autoComplete="current-password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-red-500 focus:outline-none"
                  />
                </>
              )}
              {deleteNeedsTotp && (
                <>
                  <label
                    htmlFor="delete-repo-totp"
                    className="mt-3 block text-xs font-medium text-neutral-300"
                  >
                    Authenticator code
                  </label>
                  <input
                    id="delete-repo-totp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={deleteTotpCode}
                    onChange={(e) => setDeleteTotpCode(e.target.value)}
                    placeholder="6-digit code or backup code"
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 font-mono text-xs text-white placeholder-neutral-600 focus:border-red-500 focus:outline-none"
                  />
                </>
              )}
              {deleteError && (
                <p className="mt-2 text-xs text-red-400">{deleteError}</p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => closeDeleteDialog()}
                  className="rounded-md border border-neutral-800 bg-black px-3 py-1.5 text-xs text-neutral-300 hover:text-white"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => void confirmDeleteRepo()}
                  disabled={
                    deletingRepo ||
                    deleteConfirmText.trim() !== deleteTarget.full_name ||
                    (deleteNeedsPassword && deletePassword.length === 0) ||
                    (deleteNeedsTotp && deleteTotpCode.length === 0)
                  }
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:bg-neutral-800 disabled:text-neutral-600"
                >
                  {deletingRepo ? t.editorPage.deleteRepoDeleting : t.editorPage.deleteRepoButton}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

