import assert from "node:assert/strict";
import test from "node:test";
import { webcrypto } from "node:crypto";

// Inline pure helpers for zero-build node --test verification
// (mirrors web/src/lib/auth.ts — HMAC-SHA256 stateless sessions,
// PKCE S256, and the input validators).

const crypto = webcrypto;
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function base64urlEncode(data) {
  const buf =
    typeof data === "string" ? Buffer.from(data, "utf8") : Buffer.from(data);
  return buf.toString("base64url");
}

function base64urlDecode(input) {
  if (!/^[A-Za-z0-9_-]*$/.test(input)) return null;
  try {
    const buf = Buffer.from(input, "base64url");
    if (buf.toString("base64url") !== input) return null;
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

function randomBase64url(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

async function pkceChallenge(verifier) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return base64urlEncode(new Uint8Array(digest));
}

async function hmacKey(secret, usage) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage
  );
}

async function signSession(secret, payload) {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64urlEncode(payloadJson);
  const key = await hmacKey(secret, ["sign"]);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );
  return `v1.${payloadB64}.${base64urlEncode(new Uint8Array(sig))}`;
}

async function verifySession(secret, token, nowSeconds) {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") {
    return { ok: false, reason: "malformed" };
  }
  const [, payloadB64, sigB64] = parts;
  const payloadBytes = base64urlDecode(payloadB64);
  const sigBytes = base64urlDecode(sigB64);
  if (!payloadBytes || !sigBytes) {
    return { ok: false, reason: "malformed" };
  }
  const key = await hmacKey(secret, ["verify"]);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(payloadB64)
  );
  if (!valid) return { ok: false, reason: "bad_signature" };
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, reason: "malformed" };
  }
  const p = payload;
  if (
    typeof p.email !== "string" ||
    !isValidEmail(p.email) ||
    typeof p.name !== "string" ||
    typeof p.iat !== "number" ||
    typeof p.exp !== "number" ||
    (typeof p.picture !== "string" && p.picture !== null)
  ) {
    return { ok: false, reason: "malformed" };
  }
  if (p.exp <= now) return { ok: false, reason: "expired" };
  if (p.iat > now + 60) return { ok: false, reason: "not_yet_valid" };
  return {
    ok: true,
    user: { email: p.email, name: p.name, picture: p.picture },
  };
}

function buildSessionPayload(user, nowSeconds) {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  return {
    email: user.email,
    name: user.name,
    picture: user.picture,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  if (email.length < 3 || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidState(state) {
  return (
    typeof state === "string" &&
    state.length >= 1 &&
    state.length <= 256 &&
    /^[A-Za-z0-9_-]+$/.test(state)
  );
}

function isValidCode(code) {
  return (
    typeof code === "string" &&
    code.length >= 1 &&
    code.length <= 1024 &&
    !/[\s\x00-\x1f\x7f]/.test(code)
  );
}

function sanitizePictureUrl(picture) {
  if (typeof picture !== "string" || picture.length === 0) return null;
  try {
    const url = new URL(picture);
    if (url.protocol !== "https:") return null;
    return picture;
  } catch {
    return null;
  }
}

function buildGoogleAuthUrl({ clientId, redirectUri, state, codeChallenge }) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

function sessionCookieOptions(isSecure) {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

const SECRET = "test-session-secret-0123456789abcdef";
const USER = {
  email: "test@example.com",
  name: "Test User",
  picture: "https://lh3.googleusercontent.com/a-/photo",
};

test("base64url round-trips and rejects non-canonical input", () => {
  const encoded = base64urlEncode("hello world");
  assert.equal(new TextDecoder().decode(base64urlDecode(encoded)), "hello world");
  assert.equal(base64urlDecode("!!!"), null);
  assert.equal(base64urlDecode("aGVsbG8="), null); // padding is not base64url
  assert.deepEqual(base64urlDecode(""), new Uint8Array(0));
});

test("PKCE challenge matches the RFC 7636 Appendix B test vector", async () => {
  // RFC 7636: verifier dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
  // -> challenge E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
  const challenge = await pkceChallenge(
    "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
  );
  assert.equal(challenge, "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
});

test("a signed session verifies and returns the user", async () => {
  const token = await signSession(SECRET, buildSessionPayload(USER, 1_700_000_000));
  const result = await verifySession(SECRET, token, 1_700_000_100);
  assert.equal(result.ok, true);
  assert.deepEqual(result.user, USER);
});

test("a tampered payload is rejected", async () => {
  const token = await signSession(SECRET, buildSessionPayload(USER, 1_700_000_000));
  const [v, payloadB64, sigB64] = token.split(".");
  const tampered = JSON.parse(
    new TextDecoder().decode(base64urlDecode(payloadB64))
  );
  tampered.email = "attacker@example.com";
  const tamperedToken = `v1.${base64urlEncode(JSON.stringify(tampered))}.${sigB64}`;
  assert.equal(v, "v1");
  const result = await verifySession(SECRET, tamperedToken, 1_700_000_100);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "bad_signature");
});

test("a tampered signature is rejected", async () => {
  const token = await signSession(SECRET, buildSessionPayload(USER, 1_700_000_000));
  const [v, payloadB64, sigB64] = token.split(".");
  const badSig = (sigB64[0] === "A" ? "B" : "A") + sigB64.slice(1);
  const result = await verifySession(
    SECRET,
    `${v}.${payloadB64}.${badSig}`,
    1_700_000_100
  );
  assert.equal(result.ok, false);
  assert.equal(result.reason, "bad_signature");
});

test("a token signed with another secret is rejected", async () => {
  const token = await signSession(
    "different-secret-0123456789abcdef",
    buildSessionPayload(USER, 1_700_000_000)
  );
  const result = await verifySession(SECRET, token, 1_700_000_100);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "bad_signature");
});

test("an expired session is rejected", async () => {
  const token = await signSession(SECRET, buildSessionPayload(USER, 1_700_000_000));
  const result = await verifySession(
    SECRET,
    token,
    1_700_000_000 + SESSION_MAX_AGE_SECONDS + 1
  );
  assert.equal(result.ok, false);
  assert.equal(result.reason, "expired");
});

test("malformed tokens are rejected, never throw", async () => {
  for (const bad of ["", "v1", "v1.abc", "v2.abc.def", "v1.!!!.def", "v1.abc.!!!"]) {
    const result = await verifySession(SECRET, bad, 1_700_000_100);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "malformed");
  }
  // Valid signature but garbage JSON payload.
  const garbage = `v1.${base64urlEncode("not json")}.${base64urlEncode("x")}`;
  const result = await verifySession(SECRET, garbage, 1_700_000_100);
  assert.equal(result.ok, false);
});

test("state and code validators accept the real shapes and reject junk", () => {
  assert.equal(isValidState(randomBase64url(32)), true);
  assert.equal(isValidState(""), false);
  assert.equal(isValidState("has space"), false);
  assert.equal(isValidState("a".repeat(257)), false);
  assert.equal(isValidState(null), false);
  assert.equal(isValidCode("4/0AX4XfWh1234567890abcdefgh"), true);
  assert.equal(isValidCode(""), false);
  assert.equal(isValidCode("has space"), false);
  assert.equal(isValidCode("a".repeat(1025)), false);
  assert.equal(isValidCode("bad\ncode"), false);
});

test("email validator accepts real addresses and rejects junk", () => {
  assert.equal(isValidEmail("adeen@example.com"), true);
  assert.equal(isValidEmail("a@b.co"), true);
  assert.equal(isValidEmail("no-at-sign"), false);
  assert.equal(isValidEmail("a@b"), false);
  assert.equal(isValidEmail("a b@c.com"), false);
  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail(null), false);
});

test("picture URLs must be https", () => {
  assert.equal(
    sanitizePictureUrl("https://lh3.googleusercontent.com/a-/photo"),
    "https://lh3.googleusercontent.com/a-/photo"
  );
  assert.equal(sanitizePictureUrl("http://evil.example.com/x.png"), null);
  assert.equal(sanitizePictureUrl("javascript:alert(1)"), null);
  assert.equal(sanitizePictureUrl("not a url"), null);
  assert.equal(sanitizePictureUrl(null), null);
});

test("the Google authorization URL carries every required parameter", () => {
  const url = new URL(
    buildGoogleAuthUrl({
      clientId: "123.apps.googleusercontent.com",
      redirectUri: "https://learn-python-programming.fly.dev/api/auth/callback/google",
      state: "state-value",
      codeChallenge: "challenge-value",
    })
  );
  assert.equal(url.origin + url.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
  assert.equal(url.searchParams.get("client_id"), "123.apps.googleusercontent.com");
  assert.equal(
    url.searchParams.get("redirect_uri"),
    "https://learn-python-programming.fly.dev/api/auth/callback/google"
  );
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("scope"), "openid email profile");
  assert.equal(url.searchParams.get("state"), "state-value");
  assert.equal(url.searchParams.get("code_challenge"), "challenge-value");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
});

test("session cookies are HttpOnly, SameSite=Lax, and Secure only on https", () => {
  const https = sessionCookieOptions(true);
  assert.equal(https.httpOnly, true);
  assert.equal(https.secure, true);
  assert.equal(https.sameSite, "lax");
  assert.equal(https.path, "/");
  assert.equal(https.maxAge, SESSION_MAX_AGE_SECONDS);
  const http = sessionCookieOptions(false);
  assert.equal(http.secure, false);
  assert.equal(http.httpOnly, true);
});

test("random state/verifier values are unique and URL-safe", () => {
  const a = randomBase64url(32);
  const b = randomBase64url(32);
  assert.notEqual(a, b);
  assert.match(a, /^[A-Za-z0-9_-]+$/);
  assert.equal(randomBase64url(64).length > 80, true);
});
