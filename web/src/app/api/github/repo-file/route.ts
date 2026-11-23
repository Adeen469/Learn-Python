import { NextRequest, NextResponse } from "next/server";
import {
  assertGithubOwnerAllowed,
  getRepoFileContent,
  isValidGithubPath,
  isValidGithubSha,
  isValidGithubSlug,
  mapGithubError,
} from "@/lib/github";
import { resolveSessionGithubToken } from "@/lib/github-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkUserLimit, rateLimitedResponse } from "@/lib/api-handler";

// One file's content for the lazily opened repo in the editor.
// Streamed, not buffered JSON: a Vercel function response caps at
// 4.5 MB, so a file bigger than that can only come through as a
// stream. Same token handling as the repos route; the read bucket
// (github-read:) is separate from the write routes. The lib verifies
// the path actually points at the given blob SHA before fetching
// it, and refuses oversize files before downloading them.
export const maxDuration = 60;

const RATE_LIMITED_RESPONSE = rateLimitedResponse;

export async function GET(req: NextRequest) {
  const limit = await checkRateLimit(`github-read:${getClientIp(req)}`, 30, 60_000);
  if (!limit.allowed) return RATE_LIMITED_RESPONSE(limit.retryAfterSeconds);
  // The token lives on the server (migration 006) — the browser
  // never sends or sees it.
  const resolved = await resolveSessionGithubToken(req);
  if ("response" in resolved) return resolved.response;
  const { token, email } = resolved;
  // Per-user bucket alongside the per-IP one, so one user behind
  // a shared NAT cannot starve another user's file reads.
  const userBlocked = await checkUserLimit(email, "github-read", 30, 60_000);
  if (userBlocked) return userBlocked;
  const owner = req.nextUrl.searchParams.get("owner");
  const repo = req.nextUrl.searchParams.get("repo");
  const sha = req.nextUrl.searchParams.get("sha");
  const path = req.nextUrl.searchParams.get("path");
  if (
    !isValidGithubSlug(owner) ||
    !isValidGithubSlug(repo) ||
    !isValidGithubSha(sha) ||
    !isValidGithubPath(path)
  ) {
    return NextResponse.json({ error: "Invalid owner, repo, sha or path" }, { status: 400 });
  }

  try {
    const allowed = await assertGithubOwnerAllowed(token, owner, repo);
    if (!allowed) {
      return NextResponse.json(
        { error: "You can only open repos owned by you or your GitHub organisations." },
        { status: 403 }
      );
    }
    const { content } = await getRepoFileContent(token, { owner, repo, path, sha });
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    let offset = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (offset >= bytes.length) {
          controller.close();
          return;
        }
        const chunk = bytes.slice(offset, offset + 64 * 1024);
        offset += chunk.length;
        controller.enqueue(chunk);
      },
    });
    return new NextResponse(stream, {
      // R3-L15: nosniff, like the video route — a declared
      // text/plain type is already safe, this is defence in depth.
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    const mapped = mapGithubError(err);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
