// Rate limiting.
//
// The app runs on Vercel (serverless, many instances), so the
// in-memory limiter below is PER INSTANCE — it cannot by itself stop
// an attacker who sprays requests across instances. When the Upstash
// Redis env vars are set (UPSTASH_REDIS_REST_URL +
// UPSTASH_REDIS_REST_TOKEN, free tier), the same limits are ALSO
// enforced in the shared Redis store, which is the binding limit;
// the in-memory check still runs as a second gate. When Redis is not
// configured, or a Redis call fails or times out, the in-memory
// limiter is the only enforcement (never a 500 — availability wins,
// the limit just gets weaker).
//
// Client IP: Vercel's edge sets `x-real-ip` from the TCP connection,
// so a client-sent value is overwritten and cannot be spoofed. The
// old code read the FIRST `x-forwarded-for` entry, which the client
// controls — an attacker could rotate fake IPs and dodge every
// per-IP limit. We now read `x-real-ip` first, else the LAST
// `x-forwarded-for` entry (the one Vercel's proxy appended), else
// req.ip.

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

interface WindowEntry {
  timestamps: number[];
}

const windows = new Map<string, WindowEntry>();

/**
 * Sliding-window check: allow at most `limit` requests per `windowMs`
 * for a given key. `now` is injectable so tests can simulate expiry.
 */
export function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  let entry = windows.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    windows.set(key, entry);
  }

  const cutoff = now - windowMs;
  // Drop timestamps outside the window.
  while (entry.timestamps.length > 0 && entry.timestamps[0] <= cutoff) {
    entry.timestamps.shift();
  }

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + windowMs - now) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }

  entry.timestamps.push(now);

  // Opportunistic cleanup so idle keys don't leak memory.
  if (entry.timestamps.length === 0) {
    windows.delete(key);
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Test helper: clear all recorded windows. */
export function resetRateLimits(): void {
  windows.clear();
}

function getRedisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

const REDIS_TIMEOUT_MS = 1500;

/**
 * Shared fixed-window check in Upstash Redis (REST). Returns null
 * when Redis is not configured or the call fails — the caller then
 * falls back to the in-memory limiter. The INCR is atomic, so two
 * concurrent first hits cannot both create the window; the caller
 * that sees count 1 (or a key that lost its expiry) sets the TTL.
 */
async function checkRedisRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const cfg = getRedisConfig();
  if (!cfg) return null;
  try {
    const redisKey = `lp-rl:${key}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REDIS_TIMEOUT_MS);
    let results: { result?: unknown }[];
    try {
      const res = await fetch(`${cfg.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["PTTL", redisKey],
        ]),
        signal: controller.signal,
      });
      if (!res.ok) return null;
      results = (await res.json()) as { result?: unknown }[];
    } finally {
      clearTimeout(timer);
    }
    const count = Number(results?.[0]?.result);
    const pttl = Number(results?.[1]?.result);
    if (!Number.isFinite(count)) return null;
    if (count === 1 || pttl === -1) {
      // Best-effort expiry for the new window; a failure here only
      // shortens the window's life, it never lets a request through.
      fetch(`${cfg.url}/expire/${encodeURIComponent(redisKey)}/${Math.ceil(windowMs / 1000)}`, {
        headers: { Authorization: `Bearer ${cfg.token}` },
      }).catch(() => {});
    }
    if (count > limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((pttl > 0 ? pttl : windowMs) / 1000)
        ),
      };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  } catch {
    return null;
  }
}

/**
 * The limiter every route uses: the shared Redis window when it is
 * configured (and answers), then the per-instance memory window.
 * Either one can refuse the request.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): Promise<RateLimitResult> {
  const shared = await checkRedisRateLimit(key, limit, windowMs);
  if (shared && !shared.allowed) return shared;
  return checkMemoryRateLimit(key, limit, windowMs, now);
}

/**
 * Best-effort client IP: `x-real-ip` (set by Vercel's edge from the
 * connection, not spoofable), else the last `x-forwarded-for` entry
 * (appended by Vercel's proxy), else req.ip, then "unknown".
 */
export function getClientIp(req: Request): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }
  const ip = (req as unknown as { ip?: string }).ip;
  if (ip) return ip;
  return "unknown";
}
