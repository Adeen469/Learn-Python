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

// Delete a repository the user owns. Destructive on purpose, so the
// limit is tighter than the commit route (10/min) and the client
// must make the user type the full owner/repo name first (the
// editor's delete dialog). Only the repo OWNER can delete it:
// GitHub answers 403 for a collaborator, and 403 with
// "Resource not accessible by personal access token" when the token
// lacks the delete_repo scope. Both are surfaced separately so the
// user knows whether to ask the owner or reconnect the token.
const deleteRepoSchema = z.object({
  owner: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  repo: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
});

const DELETE_BODY_MAX_BYTES = 256 * 1024;

export async function DELETE(req: NextRequest) {
  const limit = await checkRateLimit(`github-delete:${getClientIp(req)}`, 10, 60_000);
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

  try {
    const body = await req.json();
    const parsed = deleteRepoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid owner or repo" }, { status: 400 });
    }
    if (!isValidGithubSlug(parsed.data.owner) || !isValidGithubSlug(parsed.data.repo)) {
      return NextResponse.json({ error: "Invalid owner or repo" }, { status: 400 });
    }

    const allowed = await assertGithubOwnerAllowed(token, parsed.data.owner);
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
