import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteGithubToken,
  isValidGithubTokenFormat,
  logGithubTokenUse,
  probeGithubToken,
  saveGithubToken,
} from "@/lib/github-token";
import { getAuthPrereqs, getSessionUser } from "@/lib/auth-routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// The GitHub token, held on the server (migration 006; audit +
// expiry in 007).
//
// POST saves the token the user pastes in: it is encrypted with
// AES-256-GCM (key = the dedicated GITHUB_TOKEN_KEY when set,
// SESSION_SECRET otherwise) and stored against the signed-in
// user's email. Before saving, the token is checked live against
// GitHub: a rejected token is refused, and GitHub's expiry header
// is stored so the page can warn before it lapses. The plaintext
// token is never logged and never returned. DELETE removes it. The
// token is never sent back to the browser — not even here.
//
// Saving a token is sensitive, so the limit is tight (10/min) and
// the route fails closed: without the service-role key it answers
// 503 instead of storing anything anywhere else.
const saveTokenSchema = z.object({
  token: z.string().min(20).max(255),
});

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(`github-token:${getClientIp(req)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return NextResponse.json(
      {
        error:
          "GitHub token storage is not set up yet — the server needs its Supabase service key and migration 006.",
      },
      { status: 503 }
    );
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return NextResponse.json({ error: "Sign in to use GitHub" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = saveTokenSchema.safeParse(body);
  if (!parsed.success || !isValidGithubTokenFormat(parsed.data.token)) {
    return NextResponse.json(
      { error: "That doesn't look like a GitHub Personal Access Token (ghp_… or github_pat_…)." },
      { status: 400 }
    );
  }
  // Check the token live: GitHub must accept it, and its expiry
  // header (if any) is stored so the page can warn before it
  // lapses. A network failure does not block the save — the token
  // is stored with no expiry instead.
  const probe = await probeGithubToken(parsed.data.token);
  if (!probe.valid) {
    return NextResponse.json(
      { error: "GitHub rejected this token — check it and try again." },
      { status: 400 }
    );
  }
  const saved = await saveGithubToken(user.email, parsed.data.token, prereqs.secret, probe.expiresAt);
  if (!saved) {
    return NextResponse.json(
      { error: "Could not save the token — token storage is not set up yet." },
      { status: 503 }
    );
  }
  void logGithubTokenUse(user.email, "token_saved", undefined, getClientIp(req));
  return NextResponse.json({ connected: true });
}

export async function DELETE(req: NextRequest) {
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return NextResponse.json(
      {
        error:
          "GitHub token storage is not set up yet — the server needs its Supabase service key and migration 006.",
      },
      { status: 503 }
    );
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return NextResponse.json({ error: "Sign in to use GitHub" }, { status: 401 });
  }
  await deleteGithubToken(user.email);
  void logGithubTokenUse(user.email, "token_deleted", undefined, getClientIp(req));
  return NextResponse.json({ connected: false });
}
