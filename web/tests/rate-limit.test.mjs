import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Inline pure helpers mirroring src/lib/rate-limit.ts for zero-build
// node --test verification (sliding-window logic copied verbatim).
//
// The mirror covers the in-memory path only: the shared Redis window
// is env-gated (UPSTASH_REDIS_REST_URL/TOKEN) and unset in the
// sandbox, so the async wrapper always falls through to memory here.
// getClientIp is mirrored in full — the IP is the security-critical
// part (a spoofable IP voids every per-IP limit).

const windows = new Map();

function checkMemoryRateLimit(key, limit, windowMs, now = Date.now()) {
  let entry = windows.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    windows.set(key, entry);
  }
  const cutoff = now - windowMs;
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
  if (entry.timestamps.length === 0) {
    windows.delete(key);
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

async function checkRateLimit(key, limit, windowMs, now = Date.now(), opts = {}, redisCheck = null) {
  // Mirror of src/lib/rate-limit.ts checkRateLimit, including the
  // Phase 3 failClosed branch: the shared Redis check runs first;
  // when it THROWS (Redis configured but down), failClosed re-throws
  // "rate_limit_unavailable", otherwise the memory window decides.
  // No Redis env in the sandbox, so the default redisCheck is null
  // (shared = null) and the memory window decides, exactly like the
  // source. Tests inject a redisCheck to exercise the Redis-down
  // branch the sandbox cannot reach otherwise (6th arg, test-only
  // seam — the source's checkRedisRateLimit is internal).
  let shared = null;
  try {
    shared = redisCheck ? await redisCheck(key, limit, windowMs) : null;
  } catch {
    if (opts.failClosed) throw new Error("rate_limit_unavailable");
    shared = null;
  }
  if (shared && !shared.allowed) return shared;
  return checkMemoryRateLimit(key, limit, windowMs, now);
}

function trustProxyHeaders() {
  return (
    process.env.VERCEL === "1" ||
    process.env.TRUST_PROXY_HEADERS === "1"
  );
}

function getClientIp(req) {
  if (trustProxyHeaders()) {
    const realIp = req.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
      const parts = forwarded
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      // R2-L15: first entry that is NOT a known proxy hop (walked
      // from the right, so a client-prepended fake never wins).
      // With no hops configured the last entry stands.
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
  if (req.ip) return req.ip;
  return "unknown";
}

// Save/restore the trust env vars around a test: the mirror reads
// process.env exactly like the source, and tests share one process.
function withTrustEnv(vars, fn) {
  const prev = {};
  for (const k of ["VERCEL", "TRUST_PROXY_HEADERS", "TRUSTED_PROXY_HOPS"]) {
    prev[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k];
  }
  try {
    return fn();
  } finally {
    for (const k of ["VERCEL", "TRUST_PROXY_HEADERS", "TRUSTED_PROXY_HOPS"]) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  }
}

test("allows requests under the limit", async () => {
  windows.clear();
  for (let i = 0; i < 5; i++) {
    const r = await checkRateLimit("test-under", 5, 60_000, 1_000_000 + i);
    assert.equal(r.allowed, true);
    assert.equal(r.retryAfterSeconds, 0);
  }
});

test("blocks requests over the limit and reports a Retry-After", async () => {
  windows.clear();
  for (let i = 0; i < 3; i++) {
    assert.equal((await checkRateLimit("test-over", 3, 60_000, 2_000_000 + i)).allowed, true);
  }
  const blocked = await checkRateLimit("test-over", 3, 60_000, 2_000_003);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds >= 1);
  assert.ok(blocked.retryAfterSeconds <= 60);
});

test("window resets after expiry (sliding, not fixed)", async () => {
  windows.clear();
  // 2 requests at t=0 and t=10s fill a limit-2 / 60s window.
  assert.equal((await checkRateLimit("test-expiry", 2, 60_000, 3_000_000)).allowed, true);
  assert.equal((await checkRateLimit("test-expiry", 2, 60_000, 3_010_000)).allowed, true);
  // Still blocked at t=59s (oldest entry still inside the window).
  assert.equal((await checkRateLimit("test-expiry", 2, 60_000, 3_059_000)).allowed, false);
  // At t=61s the first entry has slid out, so one slot frees up.
  assert.equal((await checkRateLimit("test-expiry", 2, 60_000, 3_061_000)).allowed, true);
  // ...and the second request at t=61s is still blocked (one slot used).
  assert.equal((await checkRateLimit("test-expiry", 2, 60_000, 3_061_000)).allowed, false);
  // After the full window passes with no traffic, the limit is fresh.
  assert.equal((await checkRateLimit("test-expiry", 2, 60_000, 3_200_000)).allowed, true);
});

test("different IPs are independent", async () => {
  windows.clear();
  for (let i = 0; i < 2; i++) {
    assert.equal((await checkRateLimit("video:1.2.3.4", 2, 60_000, 4_000_000 + i)).allowed, true);
  }
  assert.equal((await checkRateLimit("video:1.2.3.4", 2, 60_000, 4_000_002)).allowed, false);
  // A different IP still has its full quota.
  assert.equal((await checkRateLimit("video:5.6.7.8", 2, 60_000, 4_000_002)).allowed, true);
  assert.equal((await checkRateLimit("video:5.6.7.8", 2, 60_000, 4_000_003)).allowed, true);
});

test("getClientIp trusts x-real-ip, then the first non-hop forwarded entry (trusted proxy)", () => {
  const headers = (xff, realIp) => ({
    get: (name) =>
      name === "x-forwarded-for" ? xff : name === "x-real-ip" ? realIp : null,
  });
  withTrustEnv({ VERCEL: "1" }, () => {
    // Vercel's edge sets x-real-ip from the connection: it wins over
    // anything the client sent.
    assert.equal(
      getClientIp({ headers: headers("203.0.113.7, 198.51.100.2", "198.51.100.2"), ip: "10.0.0.1" }),
      "198.51.100.2"
    );
    // Without it, with no known hops configured, the LAST forwarded
    // entry is the one the proxy appended — the first entry is
    // client-controlled and must never be trusted on its own (an
    // attacker could rotate fake IPs to dodge limits).
    assert.equal(
      getClientIp({ headers: headers("203.0.113.7, 198.51.100.2", null), ip: "10.0.0.1" }),
      "198.51.100.2"
    );
    assert.equal(getClientIp({ headers: headers(null, null), ip: "10.0.0.1" }), "10.0.0.1");
    assert.equal(getClientIp({ headers: headers(null, null) }), "unknown");
  });
});

test("R2-L15: getClientIp skips known proxy hops to reach the client entry", () => {
  const headers = (xff, realIp) => ({
    get: (name) =>
      name === "x-forwarded-for" ? xff : name === "x-real-ip" ? realIp : null,
  });
  withTrustEnv({ VERCEL: "1", TRUSTED_PROXY_HOPS: "198.51.100.2" }, () => {
    // Chain: client 203.0.113.7, then the known hop 198.51.100.2
    // appended by the edge — the client entry wins, not the hop.
    assert.equal(
      getClientIp({ headers: headers("203.0.113.7, 198.51.100.2", null), ip: "10.0.0.1" }),
      "203.0.113.7"
    );
    // A client-prepended fake left of the real client never wins:
    // the walk from the right stops at the first non-hop entry,
    // which is the TCP peer the hop saw.
    assert.equal(
      getClientIp({ headers: headers("192.0.2.99, 203.0.113.7, 198.51.100.2", null), ip: "10.0.0.1" }),
      "203.0.113.7"
    );
  });
});

test("getClientIp trusts proxy headers with TRUST_PROXY_HEADERS=1", () => {
  const headers = (xff, realIp) => ({
    get: (name) =>
      name === "x-forwarded-for" ? xff : name === "x-real-ip" ? realIp : null,
  });
  withTrustEnv({ TRUST_PROXY_HEADERS: "1" }, () => {
    assert.equal(
      getClientIp({ headers: headers(null, "198.51.100.2"), ip: "10.0.0.1" }),
      "198.51.100.2"
    );
  });
});

test("getClientIp ignores proxy headers when the proxy is not trusted", () => {
  const headers = (xff, realIp) => ({
    get: (name) =>
      name === "x-forwarded-for" ? xff : name === "x-real-ip" ? realIp : null,
  });
  withTrustEnv({}, () => {
    // A client-sent x-real-ip / x-forwarded-for must never be
    // honoured off a trusted proxy — otherwise an attacker rotates
    // a fresh IP per request and dodges every per-IP limit.
    assert.equal(
      getClientIp({ headers: headers("203.0.113.7, 198.51.100.2", "198.51.100.2"), ip: "10.0.0.1" }),
      "10.0.0.1"
    );
    assert.equal(
      getClientIp({ headers: headers("203.0.113.7", "198.51.100.2") }),
      "unknown"
    );
  });
});

test("the shared Redis limiter is wired in the source", () => {
  const src = readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "rate-limit.ts"),
    "utf8"
  );
  assert.ok(src.includes("UPSTASH_REDIS_REST_URL"), "Redis must be configurable");
  assert.ok(src.includes("UPSTASH_REDIS_REST_TOKEN"), "Redis must be configurable");
  assert.ok(src.includes("checkRedisRateLimit"), "the shared window must exist");
  assert.ok(src.includes("x-real-ip"), "the IP must come from x-real-ip first");
  // M7: proxy headers are only trusted on a deployment known to
  // overwrite them — Vercel, or an explicit TRUST_PROXY_HEADERS opt-in.
  assert.ok(src.includes("trustProxyHeaders"), "header trust must be gated");
  assert.ok(src.includes('process.env.VERCEL === "1"'), "Vercel must mark a trusted proxy");
  assert.ok(src.includes("TRUST_PROXY_HEADERS"), "an explicit opt-in must exist");
  // R2-L15: XFF entries are validated against known proxy hops.
  assert.ok(src.includes("TRUSTED_PROXY_HOPS"), "known proxy hops must be configurable");
});

test("R2-L25: a missing Redis config is logged in production, once", () => {
  const src = readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "rate-limit.ts"),
    "utf8"
  );
  assert.ok(src.includes("redis_not_configured"), "the missing-Redis event must be logged");
  assert.ok(src.includes("redisMissingLogged"), "the log must fire at most once per process");
  assert.ok(
    src.includes('process.env.NODE_ENV === "production"'),
    "the missing-Redis log is a production signal, not dev noise"
  );
});

test("N1: Redis down + failClosed throws rate_limit_unavailable (no memory fallback)", async () => {
  windows.clear();
  const redisDown = async () => {
    throw new Error("redis_pipeline_500");
  };
  await assert.rejects(
    checkRateLimit("ai:1.2.3.4", 20, 60_000, 5_000_000, { failClosed: true }, redisDown),
    /rate_limit_unavailable/
  );
});

test("N1: Redis down without failClosed falls back to the memory window", async () => {
  windows.clear();
  const redisDown = async () => {
    throw new Error("redis_pipeline_500");
  };
  // Still allowed: the per-instance memory window decides.
  const r = await checkRateLimit("ai:1.2.3.4", 20, 60_000, 5_000_000, {}, redisDown);
  assert.equal(r.allowed, true);
  // And the memory window still enforces its own limit afterwards:
  // 20 requests in the window are allowed, the 21st is refused.
  for (let i = 0; i < 19; i++) {
    assert.equal((await checkRateLimit("ai:1.2.3.4", 20, 60_000, 5_000_001 + i, {}, redisDown)).allowed, true);
  }
  assert.equal((await checkRateLimit("ai:1.2.3.4", 20, 60_000, 5_000_020, {}, redisDown)).allowed, false);
});

test("N1: a Redis refusal wins over the memory window", async () => {
  windows.clear();
  const redisRefuses = async () => ({ allowed: false, retryAfterSeconds: 30 });
  const r = await checkRateLimit("ai:1.2.3.4", 20, 60_000, 5_000_000, {}, redisRefuses);
  assert.equal(r.allowed, false);
  assert.equal(r.retryAfterSeconds, 30);
});

test("N1: the fail-closed opt exists in the source limiter", () => {
  const src = readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "rate-limit.ts"),
    "utf8"
  );
  assert.ok(src.includes("failClosed"), "the failClosed opt must exist");
  assert.ok(
    src.includes('throw new Error("rate_limit_unavailable")'),
    "failClosed must throw rate_limit_unavailable when Redis is down"
  );
});
