import { NextRequest, NextResponse } from "next/server";
import { getAuthPrereqs, getSessionUser } from "@/lib/auth-routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getByokEncryptionSecret,
  isValidByokProvider,
  saveByokKey,
  type ByokProvider,
} from "@/lib/byok-store";

// Save a BYOK provider key (migration 009).
//
// POST { provider, key, baseUrl?, model? } — the key is encrypted
// with AES-256-GCM (key = the dedicated BYOK_ENCRYPTION_KEY) and
// stored against the signed-in user's email. Custom needs a base
// URL (https) + model; other providers need only the key. The
// plaintext key is never logged and never returned.
//
// Saving a key is sensitive, so the limit is tight (10/min) and the
// route fails closed: without the service-role key, without
// BYOK_ENCRYPTION_KEY, or without migration 009 it answers 503
// instead of storing anything anywhere else — there is no
// localStorage fallback anymore.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(`byok:${getClientIp(req)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }
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
  if (
    typeof b.key !== "string" ||
    b.key.length < 10 ||
    b.key.length > 200
  ) {
    return NextResponse.json({ error: "key is not valid." }, { status: 400 });
  }
  let baseUrl: string | null = null;
  let model: string | null = null;
  if (provider === "custom") {
    if (
      typeof b.baseUrl !== "string" ||
      !/^https:\/\/\S{1,200}$/.test(b.baseUrl) ||
      typeof b.model !== "string" ||
      b.model.trim().length === 0 ||
      b.model.length > 100
    ) {
      return NextResponse.json(
        { error: "Custom BYOK needs an https base URL and a model." },
        { status: 400 }
      );
    }
    baseUrl = b.baseUrl;
    model = b.model.trim();
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
  const saved = await saveByokKey(user.email, provider, b.key, baseUrl, model);
  if (!saved) {
    return NextResponse.json(
      { error: "Could not save the key — BYOK storage is not set up yet." },
      { status: 503 }
    );
  }
  return NextResponse.json({ saved: true, provider });
}
