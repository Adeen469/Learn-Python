import { NextRequest, NextResponse } from "next/server";
import { getRepoFiles } from "@/lib/github";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Read a repo's files for opening it in the code editor: the GitHub
// page fetches them here (with the user's token) and hands them to
// the editor via sessionStorage. Same rate limit + token handling as
// the repos route.
export const maxDuration = 60;

const RATE_LIMITED_RESPONSE = (retryAfterSeconds: number) =>
  NextResponse.json(
    { error: "Too many requests — please slow down and retry shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );

function getAuthToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

export async function GET(req: NextRequest) {
  const limit = checkRateLimit(`github:${getClientIp(req)}`, 30, 60_000);
  if (!limit.allowed) return RATE_LIMITED_RESPONSE(limit.retryAfterSeconds);
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: "Missing GitHub Personal Access Token" }, { status: 401 });
  }
  const owner = req.nextUrl.searchParams.get("owner");
  const repo = req.nextUrl.searchParams.get("repo");
  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  try {
    const result = await getRepoFiles(token, { owner, repo });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "GitHub API error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
