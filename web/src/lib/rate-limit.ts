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
// Client IP: only trust `x-real-ip` / `x-forwarded-for` when the
// deployment's front proxy is known to overwrite them from the TCP
// connection (Vercel's edge does — `VERCEL=1` is set there — or an
// explicit TRUST_PROXY_HEADERS=1 for a known-proxy host). Anywhere
// else a client-sent header is honoured verbatim, so an attacker
// could rotate a fresh X-Real-IP per request and dodge every per-IP
// limit. Untrusted deployments use the connecting IP (req.ip) only.
// The old code read the FIRST `x-forwarded-for` entry, which the
// client controls; on a trusted proxy we read `x-real-ip` first,
// else the first entry that is not a known proxy hop (see
// getClientIp), else req.ip.

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
  // Drop timestamps outside the window. When every timestamp
  // expired, the entry itself goes too (R3-L19) — the old
  // `length === 0` check after the push below could never fire.
  while (entry.timestamps.length > 0 && entry.timestamps[0] <= cutoff) {
    entry.timestamps.shift();
  }
  if (entry.timestamps.length === 0) {
    windows.delete(key);
    entry = { timestamps: [] };
    windows.set(key, entry);
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

  // Cap the map (R3-L19): sweep fully-expired entries once the map
  // grows past this, so rotating keys cannot grow it without bound.
  if (windows.size > RATE_LIMIT_MAP_CAP) {
    for (const [k, e] of windows) {
      if (e.timestamps.every((t) => t <= cutoff)) windows.delete(k);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** In-memory window cap (R3-L19); the video route prunes at 5000 too. */
const RATE_LIMIT_MAP_CAP = 5000;

/** Test helper: clear all recorded windows. */
export function resetRateLimits(): void {
  windows.clear();
}

function getRedisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // R2-L25: the silent fallback to per-instance memory limits is
    // exactly what an operator needs to know about — every limit
    // (including the AI daily quota) is only per-instance until
    // Redis is configured. Log once, at first use, in production.
    logRedisMissingOnce();
    return null;
  }
  return { url: url.replace(/\/$/, ""), token };
}

// Logged at most once per process so a missing Redis config cannot
// spam the log on every request.
let redisMissingLogged = false;
function logRedisMissingOnce(): void {
  if (redisMissingLogged) return;
  redisMissingLogged = true;
  if (process.env.NODE_ENV === "production") {
    console.error(
      JSON.stringify({
        event: "redis_not_configured",
        reason:
          "UPSTASH_REDIS_REST_URL/TOKEN are unset — rate limits and the AI daily quota are per-instance memory only, not shared across instances",
      })
    );
  }
}

const REDIS_TIMEOUT_MS = 1500;

/**
 * Shared fixed-window check in Upstash Redis (REST). Returns null
 * when Redis is not configured — the caller then falls back to the
 * in-memory limiter. THROWS when Redis IS configured but the call
 * fails: the caller decides whether that is fail-open (default) or
 * fail-closed (auth routes). The INCR is atomic, so two concurrent
 * first hits cannot both create the window; the caller that sees
 * count 1 (or a key that lost its expiry) sets the TTL.
 */
async function checkRedisRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const cfg = getRedisConfig();
  if (!cfg) return null;
  const redisKey = `lp-rl:${key}`;
  const windowSeconds = Math.ceil(windowMs / 1000);
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
    if (!res.ok) throw new Error(`redis_pipeline_${res.status}`);
    results = (await res.json()) as { result?: unknown }[];
  } finally {
    clearTimeout(timer);
  }
  const count = Number(results?.[0]?.result);
  const pttl = Number(results?.[1]?.result);
  if (!Number.isFinite(count)) throw new Error("redis_pipeline_bad_result");
  if (count === 1 || pttl === -1) {
    // R3-L20: the expiry is awaited, not fire-and-forget — a key
    // must never lose its TTL silently and block forever. One
    // retry, then a loud log so the stuck key is visible.
    const setExpiry = async () => {
      const expController = new AbortController();
      const expTimer = setTimeout(
        () => expController.abort(),
        REDIS_TIMEOUT_MS
      );
      try {
        const expRes = await fetch(
          `${cfg.url}/expire/${encodeURIComponent(redisKey)}/${windowSeconds}`,
          {
            headers: { Authorization: `Bearer ${cfg.token}` },
            signal: expController.signal,
          }
        );
        if (!expRes.ok) throw new Error(`redis_expire_${expRes.status}`);
      } finally {
        clearTimeout(expTimer);
      }
    };
    try {
      await setExpiry();
    } catch {
      try {
        await setExpiry();
      } catch (e) {
        // Never log the full key: per-email buckets carry the address.
        console.error(
          JSON.stringify({
            event: "redis_rate_limit_expire_failed",
            bucket: key.split(":")[0],
            error: e instanceof Error ? e.name : "unknown",
          })
        );
      }
    }
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
}

/**
 * The limiter every route uses: the shared Redis window when it is
 * configured (and answers), then the per-instance memory window.
 * Either one can refuse the request.
 *
 * Phase 3 — failClosed (auth routes only): when Redis IS configured
 * but the Redis call errors or times out, throw instead of falling
 * back to per-instance memory — the auth helpers turn that into a
 * 503. When Redis is NOT configured, behaviour is unchanged
 * (in-memory). Default for all other callers stays fail-open.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
  opts: { failClosed?: boolean } = {}
): Promise<RateLimitResult> {
  let shared: RateLimitResult | null = null;
  try {
    shared = await checkRedisRateLimit(key, limit, windowMs);
  } catch {
    if (opts.failClosed) throw new Error("rate_limit_unavailable");
    shared = null;
  }
  if (shared && !shared.allowed) return shared;
  return checkMemoryRateLimit(key, limit, windowMs, now);
}

/**
 * True only when the front proxy overwrites the client-IP headers
 * from the TCP connection, so a client-sent value cannot survive.
 * Vercel sets VERCEL=1 in every deployment; TRUST_PROXY_HEADERS=1
 * is the explicit opt-in for any other known-proxy host. Everywhere
 * else (bare Node, Fly — which sets fly-client-ip, not x-real-ip)
 * the headers are client-controlled and must be ignored.
 */
function trustProxyHeaders(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.TRUST_PROXY_HEADERS === "1"
  );
}

/**
 * Best-effort client IP. On a trusted proxy: `x-real-ip` (set by
 * the edge from the connection, not spoofable), else the first
 * `x-forwarded-for` entry that is NOT a known proxy hop (walked
 * from the right, so a client-prepended fake entry never wins —
 * the entry a trusted hop appended is the TCP peer). Known hops
 * come from TRUSTED_PROXY_HOPS (comma-separated IPs); with none
 * configured the walk takes the last entry, which is the one the
 * edge appended. Anywhere else: the connecting IP only — proxy
 * headers are ignored outright, then "unknown".
 */
export function getClientIp(req: Request): string {
  if (trustProxyHeaders()) {
    const realIp = req.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
      const parts = forwarded
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      // R2-L15: prefer the first entry that is not a known proxy
      // hop — the client entry — rather than blindly taking the
      // last hop. Without a hop list there is nothing to validate
      // against, so the last entry (edge-appended) stands.
      const hops = new Set(
        (process.env.TRUSTED_PROXY_HOPS ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
      for (let i = parts.length - 1; i >= 0; i--) {
        if (!hops.has(parts[i])) return parts[i];
      }
    }
  }
  const ip = (req as unknown as { ip?: string }).ip;
  if (ip) return ip;
  return "unknown";
}
