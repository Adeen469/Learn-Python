// In-memory per-IP sliding-window rate limiter.
// Single Fly machine, so in-memory state is fine — no shared store needed.

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
export function checkRateLimit(
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

/**
 * Best-effort client IP: first entry of x-forwarded-for (set by Fly's
 * proxy), falling back to req.ip, then "unknown".
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const ip = (req as unknown as { ip?: string }).ip;
  if (ip) return ip;
  return "unknown";
}
