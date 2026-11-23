// Shared helpers for the NON-AUTH API routes (Phase 3): uniform
// error responses, per-IP / per-user rate-limit checks, zod body
// validation, and query pagination. Auth routes have their own
// helpers in lib/auth-routes.ts (readJsonBody, rateLimit, jsonError)
// and are NOT converted here — another fixer owns them.
//
// Body-size note: routes with an existing pinned
// oversizedBodyResponse guard keep that guard (tests pin it, and it
// is the same check); readJsonBody below is for new routes and
// routes without one.
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "./rate-limit";

/** Uniform error body: { error: message }. */
export function jsonError(
  message: string,
  status: number,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(
    { error: message },
    { status, ...(headers ? { headers } : {}) }
  );
}

/** Uniform 429 with Retry-After. */
export function rateLimitedResponse(retryAfterSeconds: number): NextResponse {
  return jsonError(
    "Too many requests — please slow down and retry shortly.",
    429,
    { "Retry-After": String(retryAfterSeconds) }
  );
}

/**
 * Per-user limiter key (R3-L11): a hash of the lowercased email,
 * never the address itself — the AI quota already did this, the
 * GitHub/BYOK routes used the raw email (plaintext addresses in
 * Redis/memory limiter keys, and two buckets for one account when
 * the sign-in case differed). Same shape as the AI quota key
 * (sha256, first 32 hex chars).
 */
export function perUserRateKey(prefix: string, email: string): string {
  return (
    prefix +
    createHash("sha256")
      .update(email.toLowerCase(), "utf8")
      .digest("hex")
      .slice(0, 32)
  );
}

/** Per-IP limit; returns the 429 response, or null to continue.
 * `opts.failClosed` (Phase 3, writes only): when Redis IS
 * configured but its call errors or times out, the throw surfaces
 * instead of falling back to per-instance memory — the caller
 * turns it into a 503. Default stays fail-open (reads). */
export async function checkIpLimit(
  req: NextRequest,
  bucket: string,
  limit: number,
  windowMs: number,
  opts: { failClosed?: boolean } = {}
): Promise<NextResponse | null> {
  const result = await checkRateLimit(
    `${bucket}:${getClientIp(req)}`,
    limit,
    windowMs,
    Date.now(),
    opts
  );
  return result.allowed ? null : rateLimitedResponse(result.retryAfterSeconds);
}

/** Per-user limit (hashed key, R3-L11); returns the 429 response, or null.
 * Same `opts.failClosed` passthrough as checkIpLimit. */
export async function checkUserLimit(
  email: string,
  bucket: string,
  limit: number,
  windowMs: number,
  opts: { failClosed?: boolean } = {}
): Promise<NextResponse | null> {
  const result = await checkRateLimit(
    perUserRateKey(`${bucket}:`, email),
    limit,
    windowMs,
    Date.now(),
    opts
  );
  return result.allowed ? null : rateLimitedResponse(result.retryAfterSeconds);
}

/**
 * Read + parse a JSON body with a Content-Length ceiling checked
 * BEFORE parsing (R2-M13). Chunked bodies carry no Content-Length
 * and cannot be pre-checked — the platform caps those at 4.5 MB.
 */
export async function readJsonBody(
  req: NextRequest,
  maxBytes: number
): Promise<
  | { ok: true; body: unknown }
  | { ok: false; response: NextResponse }
> {
  const len = Number(req.headers.get("content-length"));
  if (Number.isFinite(len) && len > maxBytes) {
    return { ok: false, response: jsonError("Request body too large", 413) };
  }
  try {
    return { ok: true, body: await req.json() };
  } catch {
    return { ok: false, response: jsonError("Invalid request", 400) };
  }
}

/**
 * zod-validate an already-parsed body. A failure answers 400 with
 * the caller's message plus the zod issues (they describe the
 * caller's own input, so they are safe to echo).
 */
export function validateBody<T>(
  body: unknown,
  schema: z.ZodType<T>,
  message = "Invalid request"
):
  | { ok: true; data: T }
  | { ok: false; response: NextResponse } {
  const parsed = schema.safeParse(body);
  if (parsed.success) return { ok: true, data: parsed.data };
  return {
    ok: false,
    response: NextResponse.json(
      { error: message, details: parsed.error.issues },
      { status: 400 }
    ),
  };
}

/**
 * limit/offset pagination for list routes (R3-L13). Missing or
 * invalid values fall back to the defaults (limit 100, offset 0);
 * limit clamps to 500, offset clamps to 0 — a caller asking for
 * limit=9999 gets 500, not a 400.
 */
export function parsePagination(params: URLSearchParams): {
  limit: number;
  offset: number;
} {
  const rawLimit = Number(params.get("limit"));
  const rawOffset = Number(params.get("offset"));
  return {
    limit: Number.isFinite(rawLimit)
      ? Math.min(500, Math.max(1, Math.floor(rawLimit)))
      : 100,
    offset: Number.isFinite(rawOffset)
      ? Math.max(0, Math.floor(rawOffset))
      : 0,
  };
}
