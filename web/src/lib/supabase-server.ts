// Server-side Supabase client (service-role key).
//
// The anon key only ever reads public data (lessons). The auth tables
// (lp_auth_users, lp_auth_otp, lp_auth_reset_tokens) have RLS on with
// NO public policies, so they are reachable only through this client.
//
// Fail-closed: returns null when the URL or the service-role key is
// missing — routes answer 503, never a fallback and never the anon
// key for auth writes.
//
// This file is imported ONLY by API route handlers / server libs.
// The service-role key must never reach the browser.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
