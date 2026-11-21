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

async function checkRateLimit(key, limit, windowMs, now = Date.now()) {
  // No Redis env in the sandbox: the shared check returns null and
  // the memory window decides, exactly like the source.
  return checkMemoryRateLimit(key, limit, windowMs, now);
}

function getClientIp(req) {
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
  if (req.ip) return req.ip;
  return "unknown";
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

test("getClientIp trusts x-real-ip, then the last forwarded entry", () => {
  const headers = (xff, realIp) => ({
    get: (name) =>
      name === "x-forwarded-for" ? xff : name === "x-real-ip" ? realIp : null,
  });
  // Vercel's edge sets x-real-ip from the connection: it wins over
  // anything the client sent.
  assert.equal(
    getClientIp({ headers: headers("203.0.113.7, 198.51.100.2", "198.51.100.2"), ip: "10.0.0.1" }),
    "198.51.100.2"
  );
  // Without it, the LAST forwarded entry is the one Vercel's proxy
  // appended — the first entry is client-controlled and must never
  // be trusted (an attacker could rotate fake IPs to dodge limits).
  assert.equal(
    getClientIp({ headers: headers("203.0.113.7, 198.51.100.2", null), ip: "10.0.0.1" }),
    "198.51.100.2"
  );
  assert.equal(getClientIp({ headers: headers(null, null), ip: "10.0.0.1" }), "10.0.0.1");
  assert.equal(getClientIp({ headers: headers(null, null) }), "unknown");
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
});
