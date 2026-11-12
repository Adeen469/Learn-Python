import assert from "node:assert/strict";
import test from "node:test";

// Inline pure helpers mirroring src/lib/rate-limit.ts for zero-build
// node --test verification (sliding-window logic copied verbatim).

const windows = new Map();

function checkRateLimit(key, limit, windowMs, now = Date.now()) {
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

function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  if (req.ip) return req.ip;
  return "unknown";
}

test("allows requests under the limit", () => {
  windows.clear();
  for (let i = 0; i < 5; i++) {
    const r = checkRateLimit("test-under", 5, 60_000, 1_000_000 + i);
    assert.equal(r.allowed, true);
    assert.equal(r.retryAfterSeconds, 0);
  }
});

test("blocks requests over the limit and reports a Retry-After", () => {
  windows.clear();
  for (let i = 0; i < 3; i++) {
    assert.equal(checkRateLimit("test-over", 3, 60_000, 2_000_000 + i).allowed, true);
  }
  const blocked = checkRateLimit("test-over", 3, 60_000, 2_000_003);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds >= 1);
  assert.ok(blocked.retryAfterSeconds <= 60);
});

test("window resets after expiry (sliding, not fixed)", () => {
  windows.clear();
  // 2 requests at t=0 and t=10s fill a limit-2 / 60s window.
  assert.equal(checkRateLimit("test-expiry", 2, 60_000, 3_000_000).allowed, true);
  assert.equal(checkRateLimit("test-expiry", 2, 60_000, 3_010_000).allowed, true);
  // Still blocked at t=59s (oldest entry still inside the window).
  assert.equal(checkRateLimit("test-expiry", 2, 60_000, 3_059_000).allowed, false);
  // At t=61s the first entry has slid out, so one slot frees up.
  assert.equal(checkRateLimit("test-expiry", 2, 60_000, 3_061_000).allowed, true);
  // ...and the second request at t=61s is still blocked (one slot used).
  assert.equal(checkRateLimit("test-expiry", 2, 60_000, 3_061_000).allowed, false);
  // After the full window passes with no traffic, the limit is fresh.
  assert.equal(checkRateLimit("test-expiry", 2, 60_000, 3_200_000).allowed, true);
});

test("different IPs are independent", () => {
  windows.clear();
  for (let i = 0; i < 2; i++) {
    assert.equal(checkRateLimit("video:1.2.3.4", 2, 60_000, 4_000_000 + i).allowed, true);
  }
  assert.equal(checkRateLimit("video:1.2.3.4", 2, 60_000, 4_000_002).allowed, false);
  // A different IP still has its full quota.
  assert.equal(checkRateLimit("video:5.6.7.8", 2, 60_000, 4_000_002).allowed, true);
  assert.equal(checkRateLimit("video:5.6.7.8", 2, 60_000, 4_000_003).allowed, true);
});

test("getClientIp prefers the first x-forwarded-for entry, then req.ip", () => {
  const headers = (xff) => ({
    get: (name) => (name === "x-forwarded-for" ? xff : null),
  });
  assert.equal(
    getClientIp({ headers: headers("203.0.113.7, 198.51.100.2"), ip: "10.0.0.1" }),
    "203.0.113.7"
  );
  assert.equal(getClientIp({ headers: headers(null), ip: "10.0.0.1" }), "10.0.0.1");
  assert.equal(getClientIp({ headers: headers(null) }), "unknown");
});
