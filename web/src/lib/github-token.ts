import { NextRequest, NextResponse } from "next/server";
import { decryptTotpSecret, encryptTotpSecret } from "./auth-email";
import { getAuthPrereqs, getSessionUser } from "./auth-routes";
import { getSupabaseAdmin } from "./supabase-server";

// Server-held GitHub tokens (migration 006).
//
// The token used to live in the browser's localStorage, where any
// JavaScript on the site could read it. It now lives in
// lp_github_tokens, encrypted with AES-256-GCM (key = SHA-256 of
// SESSION_SECRET — the encrypt/decrypt helpers below are named for
// their first use, TOTP secrets, but are generic), and the browser
// never sees it: routes resolve it from the session and call
// GitHub on the user's behalf. The table has RLS on with NO public
// policies, so only the service-role client reaches it.
//
// Fail-closed everywhere: a missing service-role key, a missing
// table, or a bad ciphertext all behave as "no token", never as a
// fallback to a client-supplied token — the routes no longer accept
// an Authorization header at all.

export async function saveGithubToken(
  email: string,
  token: string,
  secret: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase.from("lp_github_tokens").upsert(
    {
      user_email: email,
      token_encrypted: encryptTotpSecret(secret, token),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_email" }
  );
  return !error;
}

export async function getGithubToken(
  email: string,
  secret: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lp_github_tokens")
    .select("token_encrypted")
    .eq("user_email", email)
    .maybeSingle();
  if (error || !data) return null;
  return decryptTotpSecret(secret, data.token_encrypted);
}

export async function deleteGithubToken(email: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase
    .from("lp_github_tokens")
    .delete()
    .eq("user_email", email);
  return !error;
}

/** A GitHub PAT the user pastes in: classic (ghp_…) or fine-grained (github_pat_…). */
export function isValidGithubTokenFormat(token: unknown): token is string {
  return (
    typeof token === "string" &&
    token.length >= 20 &&
    token.length <= 255 &&
    /^(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})$/.test(token)
  );
}

export type ResolvedGithubToken =
  | { token: string }
  | { response: NextResponse };

/**
 * Resolve the caller's server-held GitHub token from their LP
 * session. Returns the token, or a response to return directly:
 * 503 when token storage is not configured (missing service-role
 * key — fail closed, never fall back), 401 when not signed in,
 * 404 when no token is connected yet.
 */
export async function resolveSessionGithubToken(
  req: NextRequest
): Promise<ResolvedGithubToken> {
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return {
      response: NextResponse.json(
        {
          error:
            "GitHub token storage is not set up yet — the server needs its Supabase service key and migration 006.",
        },
        { status: 503 }
      ),
    };
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Sign in to use GitHub" },
        { status: 401 }
      ),
    };
  }
  const token = await getGithubToken(user.email, prereqs.secret);
  if (!token) {
    return {
      response: NextResponse.json(
        { error: "No GitHub token connected — connect one from the GitHub page." },
        { status: 404 }
      ),
    };
  }
  return { token };
}
