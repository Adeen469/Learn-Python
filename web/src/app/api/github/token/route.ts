import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { oversizedBodyResponse } from "@/lib/github";
import {
  deleteGithubToken,
  isValidGithubTokenFormat,
  logGithubTokenUse,
  probeGithubToken,
  saveGithubToken,
} from "@/lib/github-token";
import { getAuthPrereqs, getSessionUser } from "@/lib/auth-routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkUserLimit, validateBody } from "@/lib/api-handler";

// The GitHub token, held on the server (migration 006; audit +
// expiry in 007).
//
// POST saves the token the user pastes in: it is encrypted with
// AES-256-GCM under the dedicated GITHUB_TOKEN_KEY only (saving
// fails closed with 503 when the key is unset or too short) and
// stored against the signed-in user's email. Before saving, the token is checked live against
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

// A token paste is a few hundred bytes at most.
const TOKEN_BODY_MAX_BYTES = 256 * 1024;

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(`github-token:${getClientIp(req)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }
  const tooLarge = oversizedBodyResponse(req, TOKEN_BODY_MAX_BYTES);
  if (tooLarge) return tooLarge;
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
  // Per-user bucket alongside the per-IP one, so rotating IPs
  // does not remove all friction from token overwrite/delete.
  const userBlocked = await checkUserLimit(user.email, "github-token", 10, 60_000);
  if (userBlocked) return userBlocked;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = validateBody(body, saveTokenSchema, "Invalid request");
  if (!parsed.ok) return parsed.response;
  if (!isValidGithubTokenFormat(parsed.data.token)) {
    return NextResponse.json(
      { error: "That doesn't look like a GitHub Personal Access Token (ghp_… or github_pat_…)." },
      { status: 400 }
    );
  }
  // Check the token live: GitHub must accept it, and its expiry
  // header (if any) is stored so the page can warn before it
  // lapses. If GitHub cannot be reached or does not answer, the
  // token is NOT saved — a token GitHub never confirmed must not
  // be persisted (fail closed); the user tries again instead.
  const probe = await probeGithubToken(parsed.data.token);
  if (probe.unverified) {
    return NextResponse.json(
      { error: "Could not verify the token — GitHub did not answer, try again." },
      { status: 503 }
    );
  }
  if (!probe.valid) {
    return NextResponse.json(
      { error: "GitHub rejected this token — check it and try again." },
      { status: 400 }
    );
  }
  const saved = await saveGithubToken(user.email, parsed.data.token, probe.expiresAt);
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
  // Per-user bucket alongside the per-IP one (same as POST).
  const userBlocked = await checkUserLimit(user.email, "github-token", 10, 60_000);
  if (userBlocked) return userBlocked;
  // R3-L10: check the delete actually landed before claiming
  // success — a user deleting a possibly-compromised token must
  // not be told it is gone while it is still stored and usable by
  // every GitHub route. Mirrors byok/delete (R2-L10).
  const deleted = await deleteGithubToken(user.email);
  if (!deleted) {
    return NextResponse.json(
      { error: "Could not delete the token — please try again." },
      { status: 503 }
    );
  }
  void logGithubTokenUse(user.email, "token_deleted", undefined, getClientIp(req));
  return NextResponse.json({ connected: false });
}
