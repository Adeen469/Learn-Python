import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthPrereqs, getSessionUser } from "@/lib/auth-routes";
import { checkIpLimit, checkUserLimit } from "@/lib/api-handler";
import {
  getByokEncryptionSecret,
  isValidByokProvider,
  listByokKeys,
  MAX_BYOK_KEYS_PER_USER,
  saveByokKey,
  type ByokProvider,
} from "@/lib/byok-store";
import { isSafeCustomBaseUrl } from "@/lib/ai";

// Save a BYOK provider key (migration 009).
//
// POST { provider, key, baseUrl?, model?, replace? } — the key is
// encrypted with AES-256-GCM (key = the dedicated
// BYOK_ENCRYPTION_KEY) and stored against the signed-in user's
// email. Custom needs a base URL (https) + model; other providers
// need only the key. The plaintext key is never logged and never
// returned.
//
// One key per provider (Maalik 2026-11-25): saving a provider that
// already has a key is rejected with 409 — a second entry for the
// same provider can never exist. Replacing the existing key is
// allowed with replace: true. Max 10 keys per user in total: any
// non-replace save past 10 is rejected with 409. Both checks run
// server-side, so no client (or second tab) can work around them.
//
// Saving a key is sensitive, so the limit is tight (10/min) and the
// route fails closed: without the service-role key, without
// BYOK_ENCRYPTION_KEY, or without migration 009 it answers 503
// instead of storing anything anywhere else — there is no
// localStorage fallback anymore.
export const dynamic = "force-dynamic";

// Request-body ceiling, checked BEFORE req.json() parses anything:
// a BYOK save body is tiny (provider + key ≤200 chars + an https
// URL + model), so anything over 64 KB is refused unparsed.
const BYOK_SAVE_MAX_BODY_BYTES = 64 * 1024;

// zod schema for the body (Phase 3): the key check the route
// used to do by hand, with the same message. Custom's base URL +
// model rule stays below — it only applies to custom, and a
// non-custom request must not be rejected for fields it ignores.
const saveByokSchema = z.object({
  key: z
    .string({ invalid_type_error: "key is not valid." })
    .min(10, "key is not valid.")
    .max(200, "key is not valid."),
  baseUrl: z
    .string({
      invalid_type_error: "Custom BYOK needs an https base URL and a model.",
    })
    .optional(),
  model: z
    .string({
      invalid_type_error: "Custom BYOK needs an https base URL and a model.",
    })
    .optional(),
  // Replace the existing key for this provider (only allowed when
  // one already exists — see the 409 checks below). Absent/false
  // means "add a new key", which must not duplicate a provider.
  replace: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  let ipBlocked;
  try {
    ipBlocked = await checkIpLimit(req, "byok-save", 10, 60_000, { failClosed: true });
  } catch {
    return NextResponse.json(
      { error: "BYOK is temporarily unavailable." },
      { status: 503 }
    );
  }
  if (ipBlocked) return ipBlocked;
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return NextResponse.json(
      {
        error:
          "BYOK storage is not set up yet — the server needs its Supabase service key and migration 009.",
      },
      { status: 503 }
    );
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return NextResponse.json({ error: "Sign in to save a key" }, { status: 401 });
  }
  // R2-L14: per-user bucket alongside the per-IP one, so listing
  // keys can no longer starve saves (each op has its own bucket).
  let userBlocked;
  try {
    userBlocked = await checkUserLimit(user.email, "byok-save", 10, 60_000, { failClosed: true });
  } catch {
    return NextResponse.json(
      { error: "BYOK is temporarily unavailable." },
      { status: 503 }
    );
  }
  if (userBlocked) return userBlocked;
  // R2-M13: Content-Length pre-check before req.json() — a huge
  // body is refused without ever being parsed into memory.
  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > BYOK_SAVE_MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413 }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  if (!isValidByokProvider(b?.provider)) {
    return NextResponse.json({ error: "provider is not valid." }, { status: 400 });
  }
  const provider = b.provider as ByokProvider;
  const parsed = saveByokSchema.safeParse(b);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
  let baseUrl: string | null = null;
  let model: string | null = null;
  if (provider === "custom") {
    if (
      typeof parsed.data.baseUrl !== "string" ||
      !/^https:\/\/\S{1,200}$/.test(parsed.data.baseUrl) ||
      typeof parsed.data.model !== "string" ||
      parsed.data.model.trim().length === 0 ||
      parsed.data.model.length > 100
    ) {
      return NextResponse.json(
        { error: "Custom BYOK needs an https base URL and a model." },
        { status: 400 }
      );
    }
    baseUrl = parsed.data.baseUrl;
    model = parsed.data.model.trim();
    // R3-C (SSRF): a stored base URL is fetched server-side by
    // /api/ai, so validate it HERE, before it reaches the store —
    // https-only, no credentials, no private/loopback/link-local/
    // reserved target, and no hostname that resolves to one. The
    // fetch-time guard in lib/ai.ts still re-checks at call time
    // (a saved answer can rebind between save and fetch), but an
    // unsafe URL must never be stored in the first place. DNS
    // failure fails closed: an unverifiable host is not saved.
    if (!(await isSafeCustomBaseUrl(baseUrl))) {
      return NextResponse.json(
        {
          error:
            "Custom base URL must be a public https endpoint — private, loopback, or unresolvable hosts are not allowed.",
        },
        { status: 400 }
      );
    }
  }
  // One key per provider + max 10 keys per user (Maalik 2026-11-25):
  // a non-replace save for a provider that already has a key is a
  // duplicate, and a non-replace save past the cap is refused — both
  // 409 with a plain message the UI can show as-is. A replace
  // (replace: true) is exempt: it overwrites the existing key for
  // that provider and never grows the count. listByokKeys returns
  // [] when the table is missing, so these checks never block the
  // 503 below — they only ever refuse a save that would break the
  // rules.
  const replace = parsed.data.replace === true;
  if (!replace) {
    const existing = await listByokKeys(user.email);
    if (existing.some((k) => k.provider === provider)) {
      return NextResponse.json(
        {
          error:
            "This provider already has a saved key — remove it or replace it instead of adding another one.",
        },
        { status: 409 }
      );
    }
    if (existing.length >= MAX_BYOK_KEYS_PER_USER) {
      return NextResponse.json(
        {
          error: `You can save up to ${MAX_BYOK_KEYS_PER_USER} BYOK keys — remove one before adding another.`,
        },
        { status: 409 }
      );
    }
  }
  if (!getByokEncryptionSecret()) {
    return NextResponse.json(
      {
        error:
          "BYOK storage is not set up yet — the server needs BYOK_ENCRYPTION_KEY and migration 009.",
      },
      { status: 503 }
    );
  }
  const saved = await saveByokKey(user.email, provider, parsed.data.key, baseUrl, model);
  if (!saved) {
    return NextResponse.json(
      { error: "Could not save the key — BYOK storage is not set up yet." },
      { status: 503 }
    );
  }
  return NextResponse.json({ saved: true, provider });
}
