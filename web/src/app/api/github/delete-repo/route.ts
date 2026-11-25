import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  assertGithubOwnerAllowed,
  deleteUserRepo,
  isValidGithubSlug,
  mapGithubError,
  oversizedBodyResponse,
} from "@/lib/github";
import { logGithubTokenUse, resolveSessionGithubToken } from "@/lib/github-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkUserLimit, validateBody } from "@/lib/api-handler";
import { decideOtp } from "@/lib/auth-email";
import {
  bumpOtpAttempts,
  consumeOtp,
  getLatestOtp,
} from "@/lib/auth-store";

// Delete a repository the user owns. Destructive on purpose, so the
// limit is tighter than the commit route (10/min) and the client
// must make the user type the full owner/repo name first (the
// editor's delete dialog). Only the repo OWNER can delete it:
// GitHub answers 403 for a collaborator, and 403 with
// "Resource not accessible by personal access token" when the token
// lacks the delete_repo scope. Both are surfaced separately so the
// user knows whether to ask the owner or reconnect the token.
//
// Step-up: a 6-digit code emailed to the session user's address.
// The delete dialog sends it the moment the exact owner/repo name
// is typed, so the code boxes are already waiting by the time the
// user opens their inbox. No password, no authenticator app — the
// code IS the step-up, and it is required for EVERYONE, including
// Google-only accounts (who previously had no step-up at all). The
// code is single-use: consumed on success, attempts bumped on a
// wrong guess, and every failure answers the same generic 400, so
// a wrong code cannot be told apart from an expired one.
// The client collects the code in the same delete-confirmation
// dialog (GitHub page); the server enforces it — the typed
// owner/repo confirmation is client-side only and is never
// trusted here.
const GENERIC_CODE_ERROR = "The code is incorrect or has expired.";

const deleteRepoSchema = z.object({
  owner: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  repo: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  code: z.string().min(1).max(10),
});

const DELETE_BODY_MAX_BYTES = 256 * 1024;

export async function DELETE(req: NextRequest) {
  let limit;
  try {
    limit = await checkRateLimit(`github-delete:${getClientIp(req)}`, 10, 60_000, Date.now(), { failClosed: true });
  } catch {
    return NextResponse.json(
      { error: "GitHub is temporarily unavailable." },
      { status: 503 }
    );
  }
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }
  const tooLarge = oversizedBodyResponse(req, DELETE_BODY_MAX_BYTES);
  if (tooLarge) return tooLarge;

  const resolved = await resolveSessionGithubToken(req);
  if ("response" in resolved) return resolved.response;
  const { token, email } = resolved;

  // Per-user bucket alongside the per-IP one (R3-L12), so one user
  // behind a shared NAT cannot starve another user's deletes — and
  // rotating IPs does not remove all friction from step-up guessing.
  const userBlocked = await checkUserLimit(email, "github-delete", 10, 60_000);
  if (userBlocked) return userBlocked;

  try {
    const body = await req.json();
    const parsed = validateBody(body, deleteRepoSchema, "Invalid owner or repo");
    if (!parsed.ok) return parsed.response;
    if (!isValidGithubSlug(parsed.data.owner) || !isValidGithubSlug(parsed.data.repo)) {
      return NextResponse.json({ error: "Invalid owner or repo" }, { status: 400 });
    }

    // Step-up gate: the emailed code, checked exactly like the
    // 2FA email code — a wrong guess bumps attempts (the cap lives
    // in decideOtp), a right one is consumed atomically before the
    // delete runs, so the same code cannot delete twice.
    const row = await getLatestOtp(email, "delete-repo");
    if (!row) {
      return NextResponse.json({ error: GENERIC_CODE_ERROR }, { status: 400 });
    }
    const decision = decideOtp(
      {
        codeHash: row.code_hash,
        expiresAtMs: new Date(row.expires_at).getTime(),
        attempts: row.attempts,
        consumedAtMs: row.consumed_at
          ? new Date(row.consumed_at).getTime()
          : null,
      },
      parsed.data.code,
      Date.now()
    );
    if (!decision.ok) {
      if (decision.reason === "invalid") await bumpOtpAttempts(row.id);
      return NextResponse.json({ error: GENERIC_CODE_ERROR }, { status: 400 });
    }
    if (!(await consumeOtp(row.id))) {
      return NextResponse.json({ error: GENERIC_CODE_ERROR }, { status: 400 });
    }

    const allowed = await assertGithubOwnerAllowed(token, parsed.data.owner, parsed.data.repo);
    if (!allowed) {
      return NextResponse.json(
        { error: "You can only delete repos owned by you or your GitHub organisations." },
        { status: 403 }
      );
    }

    await deleteUserRepo(token, parsed.data.owner, parsed.data.repo);
    void logGithubTokenUse(email, "repo_deleted", `${parsed.data.owner}/${parsed.data.repo}`, getClientIp(req));
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Resource not accessible by personal access token")) {
      return NextResponse.json(
        { error: "Your token needs the delete_repo scope — create a new token from the GitHub page with repo + delete_repo." },
        { status: 403 }
      );
    }
    const mapped = mapGithubError(err);
    if (mapped.status === 403) {
      return NextResponse.json(
        { error: "Only the repo owner can delete it — collaborators cannot delete a repo they don't own." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
