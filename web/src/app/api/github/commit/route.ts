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

const commitSchema = z.object({
  owner: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  repo: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  path: z
    .string()
    .min(1)
    .max(500)
    .refine((p) => !p.startsWith("/") && !p.includes(".."), {
      message: "Path must not start with '/' or contain '..'",
    }),
  content: z.string().max(4_000_000),
  message: z.string().min(1).max(500),
  branch: z
    .string()
    .max(100)
    .regex(/^[a-zA-Z0-9_.\-/]+$/)
    .optional(),
});

// Writes get their own bucket (github-write:), separate from the
// read routes, so opening files cannot starve commits — plus a
// per-user bucket, so one user behind a shared NAT cannot starve
// another. Bodies are capped at 5 MB before parsing.
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

  const userLimit = await checkRateLimit(`github-write:${email}`, 30, 60_000);
  if (!userLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      { status: 429, headers: { "Retry-After": String(userLimit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = commitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid commit parameters", details: parsed.error.issues }, { status: 400 });
    }

    const allowed = await assertGithubOwnerAllowed(token, parsed.data.owner);
    if (!allowed) {
      return NextResponse.json(
        { error: "You can only commit to repos owned by you or your GitHub organisations." },
        { status: 403 }
      );
    }

    const result = await commitFileToRepo(token, parsed.data);
    void logGithubTokenUse(email, "commit", `${parsed.data.owner}/${parsed.data.repo}`, getClientIp(req));
    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const mapped = mapGithubError(err);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
