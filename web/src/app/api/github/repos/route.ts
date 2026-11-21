import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUserRepo, listUserRepos } from "@/lib/github";
import { logGithubTokenUse, resolveSessionGithubToken } from "@/lib/github-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RATE_LIMITED_RESPONSE = (retryAfterSeconds: number) =>
  NextResponse.json(
    { error: "Too many requests — please slow down and retry shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );

async function rateLimited(req: NextRequest) {
  const limit = await checkRateLimit(`github:${getClientIp(req)}`, 30, 60_000);
  return limit.allowed ? null : RATE_LIMITED_RESPONSE(limit.retryAfterSeconds);
}

const createRepoSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  description: z.string().max(350).optional(),
  isPrivate: z.boolean().optional(),
  autoInit: z.boolean().optional(),
  gitignoreTemplate: z.string().max(100).optional(),
  licenseTemplate: z.string().max(100).optional(),
});

export async function GET(req: NextRequest) {
  const blocked = await rateLimited(req);
  if (blocked) return blocked;
  // The token lives on the server (migration 006) — the browser
  // never sends or sees it. No session or no stored token answers
  // 401/404 here instead of a GitHub call.
  const resolved = await resolveSessionGithubToken(req);
  if ("response" in resolved) return resolved.response;
  const token = resolved.token;

  try {
    const repos = await listUserRepos(token);
    return NextResponse.json({ repos });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "GitHub API error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const blocked = await rateLimited(req);
  if (blocked) return blocked;
  const resolved = await resolveSessionGithubToken(req);
  if ("response" in resolved) return resolved.response;
  const { token, email } = resolved;

  try {
    const body = await req.json();
    const parsed = createRepoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid repository parameters", details: parsed.error.issues }, { status: 400 });
    }

    const repo = await createUserRepo(token, parsed.data);
    void logGithubTokenUse(email, "repo_created", repo.full_name, getClientIp(req));
    return NextResponse.json({ repo }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Could not create repo";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

