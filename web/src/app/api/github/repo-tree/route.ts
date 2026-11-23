import { NextRequest, NextResponse } from "next/server";
import {
  assertGithubOwnerAllowed,
  getRepoTree,
  isValidGithubSlug,
  mapGithubError,
} from "@/lib/github";
import { resolveSessionGithubToken } from "@/lib/github-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkUserLimit, rateLimitedResponse } from "@/lib/api-handler";

// A repo's file tree for opening it in the editor: paths + sizes +
// blob shas only, no contents — the tree is one small call, and each
// file's content is fetched lazily when it is opened (repo-file
// route). Same token handling as the repos route; the read bucket
// (github-read:) is separate from the write routes, and the tree
// itself is capped at 5,000 entries (truncated:true).
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
  // a shared NAT cannot starve another user's repo browsing.
  const userBlocked = await checkUserLimit(email, "github-read", 30, 60_000);
  if (userBlocked) return userBlocked;
  const owner = req.nextUrl.searchParams.get("owner");
  const repo = req.nextUrl.searchParams.get("repo");
  if (!isValidGithubSlug(owner) || !isValidGithubSlug(repo)) {
    return NextResponse.json({ error: "Invalid owner or repo" }, { status: 400 });
  }

  try {
    const allowed = await assertGithubOwnerAllowed(token, owner, repo);
    if (!allowed) {
      return NextResponse.json(
        { error: "You can only open repos owned by you or your GitHub organisations." },
        { status: 403 }
      );
    }
    const result = await getRepoTree(token, { owner, repo });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const mapped = mapGithubError(err);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
