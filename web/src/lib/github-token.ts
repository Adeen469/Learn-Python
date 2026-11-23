import { NextRequest, NextResponse } from "next/server";
import { decryptTotpSecret, encryptTotpSecret } from "./auth-email";
import { normalizeEmail } from "./auth-store";
import { getAuthPrereqs, getSessionUser } from "./auth-routes";
import { getSupabaseAdmin } from "./supabase-server";

// Server-held GitHub tokens (migration 006; audit + expiry in 007).
//
// The token used to live in the browser's localStorage, where any
// JavaScript on the site could read it. It now lives in
// lp_github_tokens, encrypted with AES-256-GCM, and the browser
// never sees it: routes resolve it from the session and call
// GitHub on the user's behalf. The table has RLS on with NO public
// policies, so only the service-role client reaches it.
//
// The encryption key is a DEDICATED secret (GITHUB_TOKEN_KEY,
// Vercel env var) — and nothing else. There is no SESSION_SECRET
// fallback anywhere: if the var is unset, saving and reading
// tokens fail closed ("no token") instead of silently encrypting
// under the session secret, and a row encrypted under any other
// key simply does not decrypt ("no token"). That is a hard
// cutover: tokens stored before the dedicated key existed, under
// the old SESSION_SECRET key, no longer read — the user reconnects
// the token from the GitHub page. Keeping a SESSION_SECRET read
// path would leave the split undone, since any SESSION_SECRET
// leak would still open every legacy token.
//
// Every mutating use is written to lp_github_token_audit
// (migration 007) — token saved/deleted, repo created/deleted,
// commit — so a leaked token's use shows up fast. The audit write
// is best-effort and never fails the request it records.
//
// Fail-closed everywhere: a missing service-role key, a missing
// table, or a bad ciphertext all behave as "no token", never as a
// fallback to a client-supplied token — the routes no longer accept
// an Authorization header at all.

/**
 * The key that encrypts stored GitHub tokens: the dedicated
 * GITHUB_TOKEN_KEY, or null when it is unset — in which case token
 * storage is unavailable (fail closed), never silently encrypted
 * under SESSION_SECRET.
 *
 * Fail closed (R2-L11, same ≥32 rule as TOTP L3): a dedicated key
 * shorter than 32 chars returns null. SHA-256-hashing the key
 * inside the encrypt/decrypt helpers makes the *derived* key
 * 256 bits, but adds no entropy — a short operator-set key is
 * still brute-forceable offline from a DB dump, so it must never
 * silently encrypt tokens.
 */
export const GITHUB_TOKEN_KEY_MIN_LENGTH = 32;

export function getTokenEncryptionSecret(): string | null {
  const key = process.env.GITHUB_TOKEN_KEY;
  if (!key) return null;
  if (key.length < GITHUB_TOKEN_KEY_MIN_LENGTH) return null;
  return key;
}

export async function saveGithubToken(
  email: string,
  token: string,
  expiresAt: string | null = null
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const key = getTokenEncryptionSecret();
  if (!key) return false;
  const { error } = await supabase.from("lp_github_tokens").upsert(
    {
      // R3-L11: normalised like BYOK — the session email is never
      // lowercased, so the same account signing in as User@X vs
      // user@x held two token rows and saw a token under one
      // sign-in but not the other. Rows keyed by a raw email stay
      // orphaned; a backfill is a Maalik/DB step, not code.
      user_email: normalizeEmail(email),
      token_encrypted: encryptTotpSecret(key, token),
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_email" }
  );
  return !error;
}

export async function getGithubToken(email: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lp_github_tokens")
    .select("token_encrypted")
    .eq("user_email", normalizeEmail(email))
    .maybeSingle();
  if (error || !data) return null;
  const key = getTokenEncryptionSecret();
  if (!key) return null;
  // Dedicated key only — a row encrypted under the old
  // SESSION_SECRET key (or any other key) does not decrypt and
  // reads as "no token"; the user reconnects from the GitHub page.
  return decryptTotpSecret(key, data.token_encrypted);
}

/** The stored expiry of the user's token, if GitHub reported one. */
export async function getGithubTokenExpiresAt(
  email: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lp_github_tokens")
    .select("expires_at")
    .eq("user_email", normalizeEmail(email))
    .maybeSingle();
  if (error || !data) return null;
  return (data.expires_at as string | null) ?? null;
}

/**
 * Best-effort audit record for a mutating token use. Never throws
 * and never fails the request it records — a dead audit table
 * must not break the action itself.
 */
export async function logGithubTokenUse(
  email: string,
  action: string,
  repo?: string,
  ip?: string
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;
    await supabase.from("lp_github_token_audit").insert({
      user_email: normalizeEmail(email),
      action,
      repo: repo ?? null,
      ip: ip ?? null,
    });
  } catch {}
}

/**
 * Ask GitHub whether a pasted token works, and when it expires.
 * GitHub answers a token's expiry in the
 * `github-authentication-token-expiration` header of any
 * authenticated call (tokens with no expiry send no header).
 * A 401/403 means the token is invalid. Anything else that is
 * not an explicit 2xx — a 429, a 5xx, a network failure — is
 * `unverified`, NOT valid: the caller must refuse to store the
 * token and tell the user to try again, instead of persisting a
 * token GitHub never confirmed (fail closed).
 */
export async function probeGithubToken(
  token: string
): Promise<{ valid: boolean; expiresAt: string | null; unverified?: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "Learn-Python",
        },
        signal: controller.signal,
      });
      if (res.status === 401 || res.status === 403) {
        return { valid: false, expiresAt: null };
      }
      if (!res.ok) {
        // 429 / 5xx / anything else: GitHub did not confirm the
        // token — do not treat it as valid.
        return { valid: false, expiresAt: null, unverified: true };
      }
      const raw = res.headers.get("github-authentication-token-expiration");
      if (!raw) return { valid: true, expiresAt: null };
      // Header form is "2026-12-18 12:00:00 UTC" — normalise to
      // ISO before parsing so every runtime reads it the same.
      const iso = raw.replace(" ", "T").replace(" UTC", "Z");
      const date = new Date(iso);
      return {
        valid: true,
        expiresAt: Number.isNaN(date.getTime()) ? null : date.toISOString(),
      };
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    // Network failure / timeout: cannot tell — fail closed.
    return { valid: false, expiresAt: null, unverified: true };
  }
}

export async function deleteGithubToken(email: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase
    .from("lp_github_tokens")
    .delete()
    .eq("user_email", normalizeEmail(email));
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
  | { token: string; email: string }
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
  const token = await getGithubToken(user.email);
  if (!token) {
    return {
      response: NextResponse.json(
        { error: "No GitHub token connected — connect one from the GitHub page." },
        { status: 404 }
      ),
    };
  }
  return { token, email: user.email };
}
