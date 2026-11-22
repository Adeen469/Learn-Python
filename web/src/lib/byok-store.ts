import { decryptTotpSecret, encryptTotpSecret } from "./auth-email";
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
 * encrypted under SESSION_SECRET. (The key is SHA-256-hashed
 * inside the encrypt/decrypt helpers, so any non-empty value gives
 * a full 256-bit key.)
 */
export function getByokEncryptionSecret(): string | null {
  return process.env.BYOK_ENCRYPTION_KEY ?? null;
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
  const { error } = await supabase.from("lp_byok_keys").upsert(
    {
      user_email: email,
      provider,
      key_encrypted: encryptTotpSecret(secret, key),
      base_url: baseUrl,
      model,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_email,provider" }
  );
  return !error;
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
    .eq("user_email", email)
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
  const { data, error } = await supabase
    .from("lp_byok_keys")
    .select("provider,base_url,model")
    .eq("user_email", email)
    .order("provider");
  if (error || !data) return [];
  return (data as Array<{ provider: string; base_url: string | null; model: string | null }>)
    .filter((row) => isValidByokProvider(row.provider))
    .map((row) => ({
      provider: row.provider as ByokProvider,
      baseUrl: row.base_url ?? null,
      model: row.model ?? null,
    }));
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
    .eq("user_email", email)
    .eq("provider", provider);
  return !error;
}
