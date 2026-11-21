import { NextRequest, NextResponse } from "next/server";
import {
  getRepoFileContent,
  isValidGithubPath,
  isValidGithubSha,
  isValidGithubSlug,
} from "@/lib/github";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// One file's content for the lazily opened repo in the editor.
// Streamed, not buffered JSON: a Vercel function response caps at
// 4.5 MB, so a file bigger than that can only come through as a
// stream. Same rate limit + token handling as the repos route.
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
  const limit = await checkRateLimit(`github:${getClientIp(req)}`, 30, 60_000);
  if (!limit.allowed) return RATE_LIMITED_RESPONSE(limit.retryAfterSeconds);
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: "Missing GitHub Personal Access Token" }, { status: 401 });
  }
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
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "GitHub API error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
