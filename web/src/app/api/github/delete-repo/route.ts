import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteUserRepo, isValidGithubSlug } from "@/lib/github";
import { resolveSessionGithubToken } from "@/lib/github-token";
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

export async function DELETE(req: NextRequest) {
  const limit = await checkRateLimit(`github-delete:${getClientIp(req)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const resolved = await resolveSessionGithubToken(req);
  if ("response" in resolved) return resolved.response;
  const token = resolved.token;

  try {
    const body = await req.json();
    const parsed = deleteRepoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid owner or repo" }, { status: 400 });
    }
    if (!isValidGithubSlug(parsed.data.owner) || !isValidGithubSlug(parsed.data.repo)) {
      return NextResponse.json({ error: "Invalid owner or repo" }, { status: 400 });
    }

    await deleteUserRepo(token, parsed.data.owner, parsed.data.repo);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "GitHub delete failed";
    if (msg.includes("Resource not accessible by personal access token")) {
      return NextResponse.json(
        { error: "Your token needs the delete_repo scope — create a new token from the GitHub page with repo + delete_repo." },
        { status: 403 }
      );
    }
    if (msg.includes("404") || msg.includes("Not Found")) {
      return NextResponse.json({ error: "Repo not found or no access" }, { status: 404 });
    }
    if (msg.includes("403")) {
      return NextResponse.json(
        { error: "Only the repo owner can delete it — collaborators cannot delete a repo they don't own." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
