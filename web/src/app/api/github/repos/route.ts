import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUserRepo, listUserRepos, mapGithubError, oversizedBodyResponse } from "@/lib/github";
import { logGithubTokenUse, resolveSessionGithubToken } from "@/lib/github-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RATE_LIMITED_RESPONSE = (retryAfterSeconds: number) =>
  NextResponse.json(
    { error: "Too many requests — please slow down and retry shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );

// Reads (list) and writes (create) get separate buckets, so
// browsing repos cannot starve creating one — and writes get a
// per-user bucket too, so one user behind a shared NAT cannot
// starve another.
async function rateLimited(req: NextRequest, bucket: string) {
  const limit = await checkRateLimit(`${bucket}:${getClientIp(req)}`, 30, 60_000);
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

const CREATE_BODY_MAX_BYTES = 256 * 1024;

export async function GET(req: NextRequest) {
  const blocked = await rateLimited(req, "github-read");
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
    const mapped = mapGithubError(err);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function POST(req: NextRequest) {
  const blocked = await rateLimited(req, "github-write");
  if (blocked) return blocked;
  const tooLarge = oversizedBodyResponse(req, CREATE_BODY_MAX_BYTES);
  if (tooLarge) return tooLarge;
  const resolved = await resolveSessionGithubToken(req);
  if ("response" in resolved) return resolved.response;
  const { token, email } = resolved;

  const userLimit = await checkRateLimit(`github-write:${email}`, 30, 60_000);
  if (!userLimit.allowed) return RATE_LIMITED_RESPONSE(userLimit.retryAfterSeconds);

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
    const mapped = mapGithubError(err);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
