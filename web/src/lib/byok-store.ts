import { decryptTotpSecret, encryptTotpSecret } from "./auth-email";
import { normalizeEmail } from "./auth-store";
import { getSupabaseAdmin } from "./supabase-server";

// Server-held BYOK provider keys (migration 009).
//
// The keys used to live in the browser's localStorage, where any
// JavaScript on the site could read them, and they were shipped to
// the server in plain JSON on every AI call. They now live in
// lp_byok_keys, encrypted with AES-256-GCM, and the browser never
// sees them: routes resolve them from the session and call the
// provider on the user's behalf. The browser sends only a provider
// reference ({ provider, baseUrl?, model? }).
//
// The encryption key is a DEDICATED secret (BYOK_ENCRYPTION_KEY,
// Vercel env var) — and nothing else. There is no SESSION_SECRET
// fallback: if the var is unset, saving and reading keys fail
// closed ("no key") instead of silently encrypting under the
// session secret. Unlike the GitHub token store there is no legacy
// fallback either — no BYOK key was ever stored server-side before
// this, so nothing old exists to migrate server-side. (The editor
// migrates localStorage keys into this store on next use.)
//
// Fail-closed everywhere: a missing service-role key, a missing
// BYOK_ENCRYPTION_KEY, a missing table, or a bad ciphertext all
// behave as "no key", never as a fallback to a client-supplied key.

export const BYOK_PROVIDERS = [
  "gemini",
  "groq",
  "anthropic",
  "openai",
  "openrouter",
  "custom",
] as const;

export type ByokProvider = (typeof BYOK_PROVIDERS)[number];

/**
 * Max BYOK keys per user (Maalik 2026-11-25): 10 in total, on top of the
 * one-key-per-provider rule. With the 6 providers above the provider rule
 * binds first; this cap is the hard ceiling if more providers are added.
 */
export const MAX_BYOK_KEYS_PER_USER = 10;

export function isValidByokProvider(value: unknown): value is ByokProvider {
  return (
    typeof value === "string" &&
    (BYOK_PROVIDERS as readonly string[]).includes(value)
  );
}

/**
 * The key that encrypts stored BYOK keys: the dedicated
 * BYOK_ENCRYPTION_KEY, or null when it is unset — in which case
 * BYOK storage is unavailable (fail closed), never silently
 * encrypted under SESSION_SECRET.
 *
 * Fail closed (R2-L11, same rule as TOTP L3): a dedicated key
 * shorter than 32 chars returns null. SHA-256-hashing the secret
 * inside the encrypt/decrypt helpers makes a full 256-bit key, but
 * it adds no entropy — a short operator-set secret is still
 * brute-forceable offline from a ciphertext dump.
 */
export function getByokEncryptionSecret(): string | null {
  const dedicated = process.env.BYOK_ENCRYPTION_KEY;
  if (!dedicated) return null;
  if (dedicated.length < 32) return null;
  return dedicated;
}

export interface StoredByokKey {
  key: string;
  baseUrl: string | null;
  model: string | null;
}

export interface StoredByokMeta {
  provider: ByokProvider;
  baseUrl: string | null;
  model: string | null;
  /** Last 4 chars of the key (migration 013) — shown as ••••1234, never the key. */
  keyHint: string | null;
}

/** Last 4 chars of a secret — the masked hint shown in the UI. */
function last4(secret: string): string {
  const t = secret.trim();
  return t.length >= 4 ? t.slice(-4) : t;
}

export async function saveByokKey(
  email: string,
  provider: ByokProvider,
  key: string,
  baseUrl: string | null = null,
  model: string | null = null
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const secret = getByokEncryptionSecret();
  if (!secret) return false;
  const row = {
    user_email: normalizeEmail(email),
    provider,
    key_encrypted: encryptTotpSecret(secret, key),
    base_url: baseUrl,
    model,
    updated_at: new Date().toISOString(),
  };
  // The masked hint rides along when migration 013 has run. Before
  // that the column does not exist, so a save must not fail for it:
  // retry once without the hint and the key still saves (the hint
  // is only display, never needed to use the key).
  const { error } = await supabase.from("lp_byok_keys").upsert(
    { ...row, key_hint: last4(key) },
    { onConflict: "user_email,provider" }
  );
  if (!error) return true;
  if (!/key_hint/.test(error.message ?? "")) return false;
  const retry = await supabase
    .from("lp_byok_keys")
    .upsert(row, { onConflict: "user_email,provider" });
  return !retry.error;
}

export async function getByokKey(
  email: string,
  provider: ByokProvider
): Promise<StoredByokKey | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const secret = getByokEncryptionSecret();
  if (!secret) return null;
  const { data, error } = await supabase
    .from("lp_byok_keys")
    .select("key_encrypted,base_url,model")
    .eq("user_email", normalizeEmail(email))
    .eq("provider", provider)
    .maybeSingle();
  if (error || !data) return null;
  const plain = decryptTotpSecret(secret, data.key_encrypted as string);
  if (plain === null) return null;
  return {
    key: plain,
    baseUrl: (data.base_url as string | null) ?? null,
    model: (data.model as string | null) ?? null,
  };
}

/** Every provider the user has a stored key for — metadata only, never keys. */
export async function listByokKeys(email: string): Promise<StoredByokMeta[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const toMeta = (row: {
    provider: string;
    base_url: string | null;
    model: string | null;
    key_hint?: unknown;
  }): StoredByokMeta | null => {
    if (!isValidByokProvider(row.provider)) return null;
    return {
      provider: row.provider as ByokProvider,
      baseUrl: row.base_url ?? null,
      model: row.model ?? null,
      keyHint:
        typeof row.key_hint === "string" && row.key_hint.length > 0
          ? row.key_hint
          : null,
    };
  };
  const { data, error } = await supabase
    .from("lp_byok_keys")
    .select("provider,base_url,model,key_hint")
    .eq("user_email", normalizeEmail(email))
    .order("provider");
  if (!error && data) {
    return (data as Array<{ provider: string; base_url: string | null; model: string | null; key_hint?: unknown }>)
      .map(toMeta)
      .filter((m): m is StoredByokMeta => m !== null);
  }
  // Before migration 013 the key_hint column does not exist and the
  // select above errors — retry without it instead of reporting no
  // keys at all (the hint is only display).
  if (error && !/key_hint/.test(error.message ?? "")) return [];
  const retry = await supabase
    .from("lp_byok_keys")
    .select("provider,base_url,model")
    .eq("user_email", normalizeEmail(email))
    .order("provider");
  if (retry.error || !retry.data) return [];
  return (retry.data as Array<{ provider: string; base_url: string | null; model: string | null }>)
    .map((row) => toMeta(row))
    .filter((m): m is StoredByokMeta => m !== null);
}

export async function deleteByokKey(
  email: string,
  provider: ByokProvider
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase
    .from("lp_byok_keys")
    .delete()
    .eq("user_email", normalizeEmail(email))
    .eq("provider", provider);
  return !error;
}
