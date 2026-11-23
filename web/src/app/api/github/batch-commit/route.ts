import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  assertGithubOwnerAllowed,
  commitFileToRepo,
  mapGithubError,
  oversizedBodyResponse,
} from "@/lib/github";
import { logGithubTokenUse, resolveSessionGithubToken } from "@/lib/github-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkUserLimit, validateBody } from "@/lib/api-handler";

// Batch commit (Phase 3): commit several files to one repo in a
// single request — one GitHub commit per file inside, exactly like
// the single-file commit route, so the one-commit-per-file behaviour
// the editor relies on is unchanged. Atomic-ish, not atomic: GitHub
// has no multi-file commit in this API, so a failure halfway leaves
// the earlier files committed — the response reports EVERY file's
// result ({ path, ok, sha? | error? }) plus committed/failed counts,
// so a partial apply is never silent. The editor pushes through
// this route (one request per push, chunked at 20 files / ~4.5 MB);
// a one-file push is just a batch of one.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const batchFileSchema = z.object({
  path: z
    .string()
    .min(1)
    .max(500)
    .refine((p) => !p.startsWith("/") && !p.includes(".."), {
      message: "Path must not start with '/' or contain '..'",
    }),
  content: z.string().max(4_000_000),
});

const batchCommitSchema = z
  .object({
    owner: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
    repo: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
    branch: z
      .string()
      .max(100)
      .regex(/^[a-zA-Z0-9_.\-/]+$/)
      .optional(),
    message: z.string().min(1).max(500),
    files: z.array(batchFileSchema).min(1).max(20),
  })
  .refine((b) => new Set(b.files.map((f) => f.path)).size === b.files.length, {
    message: "Duplicate file paths",
  });

// Same 5 MB body cap as the single-file commit route.
const WRITE_BODY_MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(`github-write:${getClientIp(req)}`, 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }
  const tooLarge = oversizedBodyResponse(req, WRITE_BODY_MAX_BYTES);
  if (tooLarge) return tooLarge;

  const resolved = await resolveSessionGithubToken(req);
  if ("response" in resolved) return resolved.response;
  const { token, email } = resolved;

  const userBlocked = await checkUserLimit(email, "github-write", 30, 60_000);
  if (userBlocked) return userBlocked;

  const body = await req.json().catch(() => null);
  const parsed = validateBody(body, batchCommitSchema, "Invalid batch commit parameters");
  if (!parsed.ok) return parsed.response;

  const allowed = await assertGithubOwnerAllowed(token, parsed.data.owner, parsed.data.repo);
  if (!allowed) {
    return NextResponse.json(
      { error: "You can only commit to repos owned by you or your GitHub organisations." },
      { status: 403 }
    );
  }

  // Sequential, one commit per file: a later file must not land
  // before an earlier one, and a failure stops nothing silently —
  // every file gets its own result entry below.
  const results: Array<
    { path: string; ok: true; sha: string | null } | { path: string; ok: false; error: string }
  > = [];
  for (const file of parsed.data.files) {
    try {
      const result = await commitFileToRepo(token, {
        owner: parsed.data.owner,
        repo: parsed.data.repo,
        path: file.path,
        content: file.content,
        message: parsed.data.message,
        branch: parsed.data.branch,
      });
      const sha =
        (result as { commit?: { sha?: string } } | null)?.commit?.sha ?? null;
      results.push({ path: file.path, ok: true, sha });
    } catch (err: unknown) {
      const mapped = mapGithubError(err);
      results.push({ path: file.path, ok: false, error: mapped.message });
    }
  }
  const committed = results.filter((r) => r.ok).length;
  void logGithubTokenUse(
    email,
    "batch_commit",
    `${parsed.data.owner}/${parsed.data.repo} (${committed}/${results.length} files)`,
    getClientIp(req)
  );
  return NextResponse.json({
    results,
    committed,
    failed: results.length - committed,
  });
}
