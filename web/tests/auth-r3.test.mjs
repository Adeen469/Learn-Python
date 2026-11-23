import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

// Round-3 auth fixes (auth/session/cookies/OTP/rate-limit).
// Mirror assertions in the established style: the source is the
// contract, plus runtime checks where the logic is importable as
// plain JS (the fixed in-memory limiter).

// --- R3-C1: google start is main-only code again -----------------------
test("R3-C1: google route has no handoff branch or imports", () => {
  const route = read("src/app/api/auth/google/route.ts");
  assert.ok(!route.includes("isValidAppClient"), "no handoff validator");
  assert.ok(!route.includes("AppClient"), "no handoff type");
  assert.ok(!route.includes('searchParams.get("client")'), "no ?client=");
  assert.ok(!route.includes("appState:"), "no appState in signed state");
  assert.ok(
    route.includes('searchParams.get("app") === "1"'),
    "the ?app=1 / user-agent app trigger still works"
  );
});

// --- R3-H1: no mail for a pending row this request did not create -----
test("R3-H1: signup returns without mailing when the pending row exists", () => {
  const route = read("src/app/api/auth/email/signup/route.ts");
  const existsIdx = route.indexOf('stored.reason === "exists"');
  assert.ok(existsIdx > 0, "signup handles the exists case");
  // The exists branch returns {sent:true} BEFORE any mail call.
  const returnIdx = route.indexOf("return sentResponse", existsIdx);
  const mailIdx = route.indexOf('issueOtpCode(email, "signup")', existsIdx);
  assert.ok(returnIdx > 0 && mailIdx > 0, "both paths exist");
  assert.ok(returnIdx < mailIdx, "exists returns before the mail call");
  const branch = route.slice(existsIdx, returnIdx);
  assert.ok(!branch.includes("issueOtpCode"), "the exists branch mails nothing");
});

test("R3-H1: send-otp mails nothing when a pending signup exists", () => {
  const route = read("src/app/api/auth/email/send-otp/route.ts");
  const pendingIdx = route.indexOf("const pending = await getPendingSignup(email);");
  assert.ok(pendingIdx > 0, "send-otp reads the pending row");
  const block = route.slice(pendingIdx, pendingIdx + 200);
  assert.ok(block.includes("if (pending) return silent()"), "pending => silent");
  assert.ok(!block.includes("issueOtpCode"), "pending branch mails nothing");
});

// --- R3-M1: reset never answers ok when revocation failed ------------
test("R3-M1: reset checks both revocation calls, retries once, then 503s", () => {
  const route = read("src/app/api/auth/email/reset/route.ts");
  assert.ok(route.includes("invalidateAllResetTokens"), "revokes reset tokens");
  assert.ok(route.includes("bumpSessionVersion"), "revokes sessions");
  assert.ok(route.includes("revokeWithRetry"), "retry helper exists");
  assert.ok(
    route.includes("may not have been revoked"),
    "503 says the password changed but revocation may have failed"
  );
  assert.ok(
    !route.includes("await invalidateAllResetTokens(row.user_id);\n"),
    "no unchecked invalidate call remains"
  );
  assert.ok(
    !route.includes("await bumpSessionVersion(row.user_id);\n"),
    "no unchecked bump call remains"
  );
});

// --- R3-M6: expired pending sign-ups are actually cleaned up ----------
test("R3-M6: delete_expired_pending_signups has real call sites", () => {
  const store = read("src/lib/auth-store.ts");
  assert.ok(
    store.includes("deleteExpiredPendingSignups"),
    "store exposes the cleanup"
  );
  assert.ok(
    store.includes('rpc("delete_expired_pending_signups")'),
    "cleanup calls the migration-010 function"
  );
  for (const rel of [
    "src/app/api/auth/email/signup/route.ts",
    "src/app/api/auth/email/verify-otp/route.ts",
  ]) {
    assert.ok(
      read(rel).includes("deleteExpiredPendingSignups()"),
      `${rel} calls the cleanup`
    );
  }
});

// --- R3-L1: auth GETs are never cached ---------------------------------
test("R3-L1: every auth GET stamps Cache-Control: private, no-store", () => {
  const routes = read("src/lib/auth-routes.ts");
  assert.ok(
    routes.includes('"Cache-Control", "private, no-store"'),
    "noStore helper sets private, no-store"
  );
  for (const rel of [
    "src/app/api/auth/me/route.ts",
    "src/app/api/auth/2fa/pending/route.ts",
    "src/app/api/auth/2fa/status/route.ts",
    "src/app/api/auth/email/reset/route.ts",
    "src/app/api/auth/app-exchange/route.ts",
    "src/app/api/auth/callback/google/route.ts",
  ]) {
    assert.ok(read(rel).includes("noStore("), `${rel} uses noStore`);
  }
});

// --- R3-L2: stale pending-2FA cookie dies on every session issue ------
test("R3-L2: signin, callback and app-exchange clear pending 2FA", () => {
  for (const rel of [
    "src/app/api/auth/email/signin/route.ts",
    "src/app/api/auth/callback/google/route.ts",
    "src/app/api/auth/app-exchange/route.ts",
    "src/app/api/auth/email/verify-otp/route.ts",
  ]) {
    assert.ok(
      read(rel).includes("clearPending2fa("),
      `${rel} clears the pending cookie`
    );
  }
  // No-break: /api/auth/me 401 must NOT clear it (f323436).
  const me = read("src/app/api/auth/me/route.ts");
  assert.ok(me.includes("clearStaleSessionCookies"), "me uses the stale-only clear");
  assert.ok(!me.includes("clearPending2fa"), "me never clears pending 2FA");
  assert.ok(!me.includes("clearSessionCookies("), "me never clears all cookies");
});

// --- R3-L3: no-account path pays the same cost -------------------------
test("R3-L3: forgot and send-otp delay the no-account path", () => {
  for (const rel of [
    "src/app/api/auth/email/forgot/route.ts",
    "src/app/api/auth/email/send-otp/route.ts",
  ]) {
    const src = read(rel);
    assert.ok(src.includes("sameCostDelay"), `${rel} uses the fixed delay`);
    assert.ok(src.includes("return silent()"), `${rel} delays no-mail exits`);
  }
});

// --- R3-L4: forgot serialises per user ---------------------------------
test("R3-L4: forgot count-then-store runs serialised per email", () => {
  const route = read("src/app/api/auth/email/forgot/route.ts");
  assert.ok(route.includes("enqueuePerEmail("), "forgot serialises per email");
  assert.ok(
    route.includes("countRecentResetTokens") &&
      route.indexOf("enqueuePerEmail(") <
        route.indexOf("await countRecentResetTokens"),
    "the count runs inside the serialised section"
  );
  const routes = read("src/lib/auth-routes.ts");
  assert.ok(routes.includes("export function enqueuePerEmail"), "shared helper");
});

// --- R3-L5: 2FA setup/enable/disable have per-email buckets ------------
test("R3-L5: 2fa setup, enable and disable limit per email", () => {
  for (const [rel, key] of [
    ["src/app/api/auth/2fa/setup/route.ts", "auth-2fa-setup-email:"],
    ["src/app/api/auth/2fa/enable/route.ts", "auth-2fa-enable-email:"],
    ["src/app/api/auth/2fa/disable/route.ts", "auth-2fa-disable-email:"],
  ]) {
    const src = read(rel);
    assert.ok(src.includes(key), `${rel} has a per-email bucket`);
    assert.ok(src.includes("rateLimitKey("), `${rel} uses rateLimitKey`);
  }
});

// --- R3-L6: no session_version downgrade after the CAS bump ------------
test("R3-L6: enable/disable/backup-codes never rewrite session_version", () => {
  for (const rel of [
    "src/app/api/auth/2fa/enable/route.ts",
    "src/app/api/auth/2fa/disable/route.ts",
    "src/app/api/auth/2fa/backup-codes/route.ts",
  ]) {
    const src = read(rel);
    assert.ok(
      !/session_version:\s*newSessionVersion/.test(src),
      `${rel} must not write session_version after the bump`
    );
    assert.ok(
      src.includes("incrementSessionVersion"),
      `${rel} still bumps atomically`
    );
  }
});

// --- R3-L7: __Host- OAuth cookies at Path=/ ----------------------------
test("R3-L7: OAuth cookies are __Host- at Path=/ through the constants", () => {
  const auth = read("src/lib/auth.ts");
  assert.ok(auth.includes('"__Host-lp_oauth_state"'), "state cookie __Host-");
  assert.ok(auth.includes('"__Host-lp_oauth_verifier"'), "verifier __Host-");
  assert.ok(
    auth.includes("OAUTH_STATE_COOKIE") && auth.includes("OAUTH_VERIFIER_COOKIE"),
    "names live in constants"
  );
  const opts = auth.slice(auth.indexOf("oauthCookieOptions"));
  assert.ok(opts.includes('path: "/"'), "OAuth cookies use Path=/");
  assert.ok(
    !auth.includes('path: "/api/auth/callback/google"'),
    "no cookie option keeps the old callback path"
  );
  // Every read/write goes through the constants, never a literal.
  for (const rel of [
    "src/app/api/auth/google/route.ts",
    "src/app/api/auth/callback/google/route.ts",
    "src/lib/auth-routes.ts",
  ]) {
    const src = read(rel);
    assert.ok(!src.includes('"lp_oauth_state"'), `${rel}: no literal state name`);
    assert.ok(
      !src.includes('"lp_oauth_verifier"'),
      `${rel}: no literal verifier name`
    );
  }
});

// --- R3-L8: callback 400s clear the OAuth cookies -----------------------
test("R3-L8: every callback 400 exit clears the OAuth cookies", () => {
  const route = read("src/app/api/auth/callback/google/route.ts");
  const count = (route.match(/return clearOauthCookies\(/g) || []).length;
  assert.ok(count >= 12, `expected 12+ clearOauthCookies exits, got ${count}`);
  assert.ok(
    !route.includes(
      'return NextResponse.json(\n        { error: "Invalid sign-in response." }'
    ),
    "no bare 400 return remains"
  );
});

// --- R3-L9: missing TOTP replay protection is logged --------------------
test("R3-L9: claimTotpStep logs when replay protection is unavailable", () => {
  const store = read("src/lib/auth-store.ts");
  assert.ok(
    store.includes("totp_replay_unavailable"),
    "unavailable claim logs an error event"
  );
  const idx = store.indexOf("totp_replay_unavailable");
  assert.ok(store.slice(idx - 400, idx).includes("console.error"));
});

// --- R3-L19: the in-memory limiter evicts -------------------------------
test("R3-L19: the dead cleanup branch is gone; expired entries evict", () => {
  const src = read("src/lib/rate-limit.ts");
  assert.ok(
    !src.includes("if (entry.timestamps.length === 0) {\n    windows.delete(key);\n  }\n\n  return { allowed: true"),
    "dead post-push cleanup removed"
  );
  assert.ok(src.includes("RATE_LIMIT_MAP_CAP"), "map has a size cap + sweep");
});

// --- R3-L20: Redis expiry is awaited and loud on failure ----------------
test("R3-L20: the Redis expire is awaited, retried, and logged on failure", () => {
  const src = read("src/lib/rate-limit.ts");
  assert.ok(src.includes("redis_rate_limit_expire_failed"), "expire failure logs");
  assert.ok(src.includes("await setExpiry()"), "expire is awaited, not fire-and-forget");
  assert.ok(
    !src.includes("}).catch(() => {});"),
    "no silent fire-and-forget expire remains"
  );
});

// --- Phase 3: fail-closed on auth routes only ---------------------------
test("Phase 3: checkRateLimit takes failClosed; auth routes pass it", () => {
  const src = read("src/lib/rate-limit.ts");
  assert.ok(src.includes("failClosed?: boolean"), "opt-in failClosed option");
  assert.ok(
    src.includes('throw new Error("rate_limit_unavailable")'),
    "configured-but-failed Redis throws when failClosed"
  );
  assert.ok(
    src.includes("if (!cfg) return null;"),
    "unconfigured Redis still falls back to memory"
  );
  for (const rel of [
    "src/app/api/auth/email/signup/route.ts",
    "src/app/api/auth/email/signin/route.ts",
    "src/app/api/auth/email/forgot/route.ts",
    "src/app/api/auth/email/reset/route.ts",
    "src/app/api/auth/email/send-otp/route.ts",
    "src/app/api/auth/email/verify-otp/route.ts",
    "src/app/api/auth/2fa/setup/route.ts",
    "src/app/api/auth/2fa/enable/route.ts",
    "src/app/api/auth/2fa/disable/route.ts",
    "src/app/api/auth/2fa/backup-codes/route.ts",
    "src/app/api/auth/2fa/verify/route.ts",
    "src/app/api/auth/2fa/send-code/route.ts",
    "src/app/api/auth/2fa/pending/route.ts",
    "src/app/api/auth/2fa/status/route.ts",
    "src/app/api/auth/me/route.ts",
    "src/app/api/auth/logout/route.ts",
    "src/app/api/auth/callback/google/route.ts",
    "src/app/api/auth/app-exchange/route.ts",
  ]) {
    assert.ok(
      read(rel).includes("failClosed: true"),
      `${rel} fails closed on Redis errors`
    );
  }
  // Default stays fail-open for non-auth callers.
  const routes = read("src/lib/auth-routes.ts");
  assert.ok(
    routes.includes("opts: { failClosed?: boolean } = {}"),
    "helpers default to fail-open"
  );
});

// --- Zod on every touched auth POST --------------------------------------
test("Zod: every touched auth POST validates its body with zod", () => {
  for (const [rel, schema] of [
    ["src/app/api/auth/email/signup/route.ts", "signupSchema"],
    ["src/app/api/auth/email/send-otp/route.ts", "sendOtpSchema"],
    ["src/app/api/auth/email/forgot/route.ts", "forgotSchema"],
    ["src/app/api/auth/email/reset/route.ts", "resetSchema"],
    ["src/app/api/auth/email/signin/route.ts", "signinSchema"],
    ["src/app/api/auth/email/verify-otp/route.ts", "verifyOtpSchema"],
    ["src/app/api/auth/2fa/setup/route.ts", "setupSchema"],
    ["src/app/api/auth/2fa/enable/route.ts", "enableSchema"],
    ["src/app/api/auth/2fa/disable/route.ts", "disableSchema"],
    ["src/app/api/auth/2fa/backup-codes/route.ts", "backupCodesSchema"],
    ["src/app/api/auth/2fa/verify/route.ts", "verify2faSchema"],
  ]) {
    const src = read(rel);
    assert.ok(src.includes('from "zod"'), `${rel} imports zod`);
    assert.ok(src.includes(schema), `${rel} defines ${schema}`);
    assert.ok(src.includes(".safeParse("), `${rel} safe-parses the body`);
    assert.ok(src.includes("jsonError("), `${rel} keeps the {error} 400 shape`);
  }
});

// --- Runtime: the fixed in-memory limiter (mirror of rate-limit.ts) -----
const RATE_LIMIT_MAP_CAP = 5000;
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
  if (entry.timestamps.length === 0) {
    windows.delete(key);
    entry = { timestamps: [] };
    windows.set(key, entry);
  }
  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }
  entry.timestamps.push(now);
  if (windows.size > RATE_LIMIT_MAP_CAP) {
    for (const [k, e] of windows) {
      if (e.timestamps.every((t) => t <= cutoff)) windows.delete(k);
    }
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

test("R3-L19 runtime: an expired entry is evicted, not kept forever", () => {
  windows.clear();
  assert.equal(checkMemoryRateLimit("a", 2, 1000, 1000).allowed, true);
  assert.equal(checkMemoryRateLimit("a", 2, 1000, 1100).allowed, true);
  // Both timestamps expired: the next call starts a fresh window.
  assert.equal(checkMemoryRateLimit("a", 2, 1000, 5000).allowed, true);
  assert.equal(checkMemoryRateLimit("a", 2, 1000, 5100).allowed, true);
  assert.equal(checkMemoryRateLimit("a", 2, 1000, 5200).allowed, false);
  assert.equal(windows.size, 1, "one entry per key, no leak");
});

test("R3-L19 runtime: the cap sweep drops fully-expired keys", () => {
  windows.clear();
  for (let i = 0; i < RATE_LIMIT_MAP_CAP + 10; i++) {
    checkMemoryRateLimit(`k${i}`, 10, 1000, 1000);
  }
  assert.ok(windows.size > RATE_LIMIT_MAP_CAP, "map grew past the cap first");
  // One more call with a later clock sweeps the expired entries.
  checkMemoryRateLimit("fresh", 10, 1000, 5000);
  assert.equal(windows.size, 1, "only the fresh key survives the sweep");
});

// --- No-break pins: the live login behaviour that must keep working -----
test("No-break: Google/email sign-in still issues sessions, logout revokes", () => {
  const signin = read("src/app/api/auth/email/signin/route.ts");
  assert.ok(signin.includes("issueSession("), "password sign-in issues a session");
  assert.ok(signin.includes("setPending2fa("), "2FA users still get the step-up cookie");
  const callback = read("src/app/api/auth/callback/google/route.ts");
  assert.ok(callback.includes("setPending2fa("), "Google+2FA still gets step-up");
  assert.ok(callback.includes("sessionCookieOptions"), "Google sign-in sets the session");
  const logout = read("src/app/api/auth/logout/route.ts");
  assert.ok(logout.includes("incrementSessionVersion"), "logout still revokes server-side");
  assert.ok(logout.includes("clearSessionCookies"), "logout still clears cookies");
  const verify = read("src/app/api/auth/2fa/verify/route.ts");
  assert.ok(verify.includes("issueSession("), "2FA verify still issues the session");
  assert.ok(verify.includes("clearPending2fa("), "2FA verify still consumes the step-up");
});
