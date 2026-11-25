import { NextRequest, NextResponse } from "next/server";
import { checkIpLimit } from "@/lib/api-handler";

// OpenRouter model catalog for the Models search (AI Settings >
// Models): the user can add ANY free OpenRouter model. The browser
// cannot fetch the catalog itself — the CSP `connect-src` allows
// only 'self' + jsDelivr + PyPI, so a direct fetch to openrouter.ai
// is blocked in the page. This route proxies the public catalog
// server-side and returns only the free chat models. No key is
// needed (the catalog endpoint is public) and none is sent. The
// URL is fixed — no user input ever reaches the fetch — and the
// result is cached for an hour, so opening the search twice does
// not refetch the catalog.
export const dynamic = "force-dynamic";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
// The catalog is ~1MB of JSON (472 models with descriptions) —
// refuse anything far beyond that before parsing it into memory.
const MAX_CATALOG_BYTES = 4_194_304;

type FreeModel = { id: string; name: string };

// Free models only (prompt AND completion price "0") that can
// answer a chat: the catalog also lists audio models (Lyria) at $0
// and the openrouter/free router, which is not a model. The curated
// OPENROUTER_MODELS list in src/lib/ai.ts excludes the same three.
function freeChatModels(data: unknown): FreeModel[] | null {
  const list = (data as { data?: unknown })?.data;
  if (!Array.isArray(list)) return null;
  const out: FreeModel[] = [];
  for (const m of list) {
    if (!m || typeof m !== "object") continue;
    const rec = m as {
      id?: unknown;
      name?: unknown;
      pricing?: { prompt?: unknown; completion?: unknown };
      architecture?: { modality?: unknown };
    };
    if (
      typeof rec.id !== "string" ||
      rec.id === "openrouter/free" ||
      (typeof rec.architecture?.modality === "string" &&
        !rec.architecture.modality.endsWith("->text")) ||
      typeof rec.name !== "string" ||
      rec.name.trim().length === 0 ||
      rec.pricing?.prompt !== "0" ||
      rec.pricing?.completion !== "0"
    ) {
      continue;
    }
    out.push({ id: rec.id, name: rec.name });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const ipBlocked = await checkIpLimit(req, "or-models", 10, 60_000);
  if (ipBlocked) return ipBlocked;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    let res: Response;
    try {
      res = await fetch(OPENROUTER_MODELS_URL, {
        headers: { "User-Agent": "LP-Learning-Platform/1.0" },
        next: { revalidate: 3600 },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) {
      return NextResponse.json({ error: "Could not load the model list." }, { status: 502 });
    }
    // Refuse a giant upstream body before parsing it into memory —
    // count bytes while streaming instead of trusting the header
    // (chunked bodies carry none).
    if (!res.body) {
      return NextResponse.json({ error: "Could not load the model list." }, { status: 502 });
    }
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;
    for (;;) {
      const result = await reader.read();
      if (result.done) break;
      receivedBytes += result.value.byteLength;
      if (receivedBytes > MAX_CATALOG_BYTES) {
        await reader.cancel();
        return NextResponse.json({ error: "Could not load the model list." }, { status: 502 });
      }
      chunks.push(result.value);
    }
    const data: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const models = freeChatModels(data);
    if (models === null) {
      return NextResponse.json({ error: "Could not load the model list." }, { status: 502 });
    }
    return NextResponse.json({ models });
  } catch {
    // Generic error: the raw fetch message can leak internal detail
    // (DNS, socket, upstream internals) — the caller only needs to
    // know the lookup failed.
    return NextResponse.json({ error: "Could not load the model list." }, { status: 503 });
  }
}
