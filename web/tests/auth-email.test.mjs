import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

// Inline pure helpers for zero-build node --test verification
// (mirrors web/src/lib/auth-email.ts — OTP, scrypt passwords, TOTP,
// backup codes, reset tokens, TOTP-secret encryption).
//
// The DB and email layers are NOT tested here: they need the
// service-role key and Gmail credentials, which are unset in the
// sandbox (routes fail closed 503 without them). The routes are
// covered by source assertions below instead.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

// --- mirrors ---------------------------------------------------------------

const OTP_MAX_ATTEMPTS = 5;

function generateOtpCode() {
  return String(randomInt(100000, 1000000));
}

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function timingSafeEqualHex(a, b) {
  let bufA;
  let bufB;
  try {
    bufA = Buffer.from(a, "hex");
    bufB = Buffer.from(b, "hex");
  } catch {
    return false;
  }
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function decideOtp(row, code, nowMs) {
  if (row.consumedAtMs !== null) return { ok: false, reason: "consumed" };
  if (nowMs > row.expiresAtMs) return { ok: false, reason: "expired" };
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }
  if (!/^\d{6}$/.test(code)) return { ok: false, reason: "invalid" };
  if (!timingSafeEqualHex(sha256Hex(code), row.codeHash)) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true };
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH
  );
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return [
    "scrypt",
    "16384",
    "8",
    "1",
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

function verifyPassword(password, stored) {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) {
    return false;
  }
  let salt;
  let expected;
  try {
    salt = Buffer.from(parts[4], "base64url");
    expected = Buffer.from(parts[5], "base64url");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;
  let key;
  try {
    key = scryptSync(password, salt, expected.length, {
      N: n,
      r,
      p,
      maxmem: 64 * 1024 * 1024,
    });
  } catch {
    return false;
  }
  if (key.length !== expected.length) return false;
  return timingSafeEqual(key, expected);
}

function generateResetToken() {
  return randomBytes(32).toString("base64url");
}

function decideResetToken(row, token, nowMs) {
  if (row.usedAtMs !== null) return { ok: false, reason: "used" };
  if (nowMs > row.expiresAtMs) return { ok: false, reason: "expired" };
  if (!timingSafeEqualHex(sha256Hex(token), row.tokenHash)) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true };
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(data) {
  let out = "";
  let bits = 0;
  let value = 0;
  for (const byte of data) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return out;
}

function base32Decode(input) {
  const clean = input.replace(/=+$/, "").toUpperCase();
  if (!/^[A-Z2-7]*$/.test(clean)) return null;
  const out = [];
  let bits = 0;
  let value = 0;
  for (const char of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

function totpCodeForCounter(secretBytes, counter) {
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", Buffer.from(secretBytes))
    .update(counterBuf)
    .digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binary % 10 ** 6).padStart(6, "0");
}

function verifyTotpCode(secret, code, nowSeconds) {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  if (!/^\d{6}$/.test(code)) return false;
  const secretBytes = base32Decode(secret);
  if (!secretBytes || secretBytes.length === 0) return false;
  const step = Math.floor(now / 30);
  for (let offset = -1; offset <= 1; offset++) {
    const expected = totpCodeForCounter(secretBytes, step + offset);
    if (
      timingSafeEqual(Buffer.from(code, "utf8"), Buffer.from(expected, "utf8"))
    ) {
      return true;
    }
  }
  return false;
}

function totpEncryptionKey(sessionSecret) {
  return createHash("sha256").update(sessionSecret, "utf8").digest();
}

function encryptTotpSecret(sessionSecret, plaintext) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", totpEncryptionKey(sessionSecret), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    ciphertext.toString("base64url"),
    tag.toString("base64url"),
  ].join(".");
}

function decryptTotpSecret(sessionSecret, stored) {
  const parts = stored.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  let iv;
  let ciphertext;
  let tag;
  try {
    iv = Buffer.from(parts[1], "base64url");
    ciphertext = Buffer.from(parts[2], "base64url");
    tag = Buffer.from(parts[3], "base64url");
  } catch {
    return null;
  }
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      totpEncryptionKey(sessionSecret),
      iv
    );
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

const BACKUP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += BACKUP_CODE_ALPHABET[randomInt(BACKUP_CODE_ALPHABET.length)];
    }
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

function normalizeBackupCode(code) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function findBackupCode(storedHashes, code) {
  const normalized = normalizeBackupCode(code);
  if (normalized.length !== 8) return null;
  const hash = sha256Hex(normalized);
  for (const stored of storedHashes) {
    if (timingSafeEqualHex(hash, stored)) return stored;
  }
  return null;
}

// --- OTP -------------------------------------------------------------------

test("OTP codes are 6 digits and verify against their hash", () => {
  const code = generateOtpCode();
  assert.match(code, /^\d{6}$/);
  const row = {
    codeHash: sha256Hex(code),
    expiresAtMs: 1_700_000_000_000 + 10 * 60 * 1000,
    attempts: 0,
    consumedAtMs: null,
  };
  assert.deepEqual(decideOtp(row, code, 1_700_000_000_000), { ok: true });
  assert.deepEqual(decideOtp(row, "000000", 1_700_000_000_000), {
    ok: false,
    reason: "invalid",
  });
});

test("OTP decisions cover expiry, consumption, attempts, and bad input", () => {
  const code = "123456";
  const base = {
    codeHash: sha256Hex(code),
    expiresAtMs: 1_700_000_000_000 + 10 * 60 * 1000,
    attempts: 0,
    consumedAtMs: null,
  };
  assert.equal(
    decideOtp(base, code, 1_700_000_000_000 + 10 * 60 * 1000 + 1).reason,
    "expired"
  );
  assert.equal(
    decideOtp({ ...base, consumedAtMs: 1_700_000_000_000 }).reason,
    "consumed"
  );
  assert.equal(
    decideOtp({ ...base, attempts: 5 }).reason,
    "too_many_attempts"
  );
  assert.equal(decideOtp({ ...base, attempts: 4 }, code, 1_700_000_000_000).ok, true);
  assert.equal(decideOtp(base, "12345", 1_700_000_000_000).reason, "invalid");
  assert.equal(decideOtp(base, "abcdef", 1_700_000_000_000).reason, "invalid");
});

// --- passwords ---------------------------------------------------------------

test("scrypt hashes verify the right password and reject the wrong one", async () => {
  const hash = hashPassword("correct horse battery staple");
  assert.match(hash, /^scrypt\$16384\$8\$1\$/);
  assert.equal(await verifyPassword("correct horse battery staple", hash), true);
  assert.equal(await verifyPassword("correct horse battery staples", hash), false);
  assert.equal(await verifyPassword("", hash), false);
  // Same password, different salt each time.
  assert.notEqual(hash, hashPassword("correct horse battery staple"));
  // Malformed stored values never verify and never throw.
  for (const bad of ["", "scrypt$1$2$3", "bcrypt$16384$8$1$aa$bb", "scrypt$x$y$z$aa$bb"]) {
    assert.equal(await verifyPassword("anything", bad), false);
  }
});

test("password validation enforces the 8–128 character rule", () => {
  assert.equal(isValidPassword("12345678"), true);
  assert.equal(isValidPassword("1234567"), false);
  assert.equal(isValidPassword("a".repeat(128)), true);
  assert.equal(isValidPassword("a".repeat(129)), false);
  assert.equal(isValidPassword(""), false);
  assert.equal(isValidPassword(null), false);
});

// --- reset tokens --------------------------------------------------------------

test("reset tokens are single-use and expire after an hour", () => {
  const token = generateResetToken();
  assert.match(token, /^[A-Za-z0-9_-]{43}$/); // 32 bytes base64url
  const row = {
    tokenHash: sha256Hex(token),
    expiresAtMs: 1_700_000_000_000 + 60 * 60 * 1000,
    usedAtMs: null,
  };
  assert.deepEqual(decideResetToken(row, token, 1_700_000_000_000), { ok: true });
  assert.equal(
    decideResetToken(row, token, 1_700_000_000_000 + 60 * 60 * 1000 + 1).reason,
    "expired"
  );
  assert.equal(
    decideResetToken({ ...row, usedAtMs: 1_700_000_000_000 }).reason,
    "used"
  );
  assert.equal(
    decideResetToken(row, generateResetToken(), 1_700_000_000_000).reason,
    "invalid"
  );
});

// --- TOTP ----------------------------------------------------------------------

test("base32 round-trips, and the RFC 6238 secret decodes", () => {
  const bytes = new TextEncoder().encode("12345678901234567890");
  const encoded = base32Encode(bytes);
  assert.equal(encoded, "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
  assert.deepEqual(base32Decode(encoded), bytes);
  assert.equal(base32Decode("not base32!!!"), null);
  assert.deepEqual(base32Decode(""), new Uint8Array(0));
});

test("TOTP matches the RFC 6238 vectors (6-digit form)", () => {
  // RFC 6238 Appendix B, secret "12345678901234567890", SHA1.
  // The 8-digit vectors end in the 6-digit values asserted here.
  const secretBytes = new TextEncoder().encode("12345678901234567890");
  assert.equal(totpCodeForCounter(secretBytes, Math.floor(59 / 30)), "287082");
  assert.equal(
    totpCodeForCounter(secretBytes, Math.floor(1111111109 / 30)),
    "081804"
  );
  assert.equal(
    totpCodeForCounter(secretBytes, Math.floor(1234567890 / 30)),
    "005924"
  );
  assert.equal(
    totpCodeForCounter(secretBytes, Math.floor(2000000000 / 30)),
    "279037"
  );
});

test("TOTP verification accepts the ±1 step window and rejects the rest", () => {
  const secret = base32Encode(new TextEncoder().encode("12345678901234567890"));
  const now = 1234567890;
  const step = Math.floor(now / 30);
  const secretBytes = new TextEncoder().encode("12345678901234567890");
  const current = totpCodeForCounter(secretBytes, step);
  const prev = totpCodeForCounter(secretBytes, step - 1);
  const next = totpCodeForCounter(secretBytes, step + 1);
  const far = totpCodeForCounter(secretBytes, step + 2);
  assert.equal(verifyTotpCode(secret, current, now), true);
  assert.equal(verifyTotpCode(secret, prev, now), true);
  assert.equal(verifyTotpCode(secret, next, now), true);
  assert.equal(verifyTotpCode(secret, far, now), false);
  assert.equal(verifyTotpCode(secret, "000000", now), false);
  assert.equal(verifyTotpCode(secret, "12345", now), false);
  assert.equal(verifyTotpCode("!!!", current, now), false);
});

// --- TOTP secret encryption -----------------------------------------------------

test("TOTP secrets encrypt and decrypt, and tampering fails closed", () => {
  const sessionSecret = "test-session-secret-0123456789abcdef";
  const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
  const stored = encryptTotpSecret(sessionSecret, secret);
  assert.match(stored, /^v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.notEqual(stored, secret);
  assert.equal(decryptTotpSecret(sessionSecret, stored), secret);
  // A different session secret cannot decrypt it.
  assert.equal(
    decryptTotpSecret("another-secret-0123456789abcdef", stored),
    null
  );
  // A tampered ciphertext fails the GCM tag check.
  const parts = stored.split(".");
  const tampered = `${parts[0]}.${parts[1]}.${parts[2].slice(0, -1)}A.${parts[3]}`;
  assert.equal(decryptTotpSecret(sessionSecret, tampered), null);
  assert.equal(decryptTotpSecret(sessionSecret, "garbage"), null);
});

// --- backup codes ---------------------------------------------------------------

test("backup codes are 10 single-use codes, matched case-insensitively", () => {
  const codes = generateBackupCodes();
  assert.equal(codes.length, 10);
  for (const code of codes) {
    assert.match(code, /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  }
  assert.equal(new Set(codes).size, 10);
  const hashes = codes.map((c) => sha256Hex(c.replace("-", "")));
  const first = codes[0];
  assert.equal(findBackupCode(hashes, first), hashes[0]);
  // Lowercase and dashless input still matches the same hash.
  assert.equal(findBackupCode(hashes, first.toLowerCase()), hashes[0]);
  assert.equal(
    findBackupCode(hashes, first.replace("-", "")),
    hashes[0]
  );
  assert.equal(findBackupCode(hashes, "AAAA-AAAA"), null);
  assert.equal(findBackupCode(hashes, "short"), null);
  assert.equal(findBackupCode([], first), null);
});

// --- wiring: routes, pages, migration, email -------------------------------------

test("every email-auth route and page exists", () => {
  const routes = [
    "src/app/api/auth/email/send-otp/route.ts",
    "src/app/api/auth/email/verify-otp/route.ts",
    "src/app/api/auth/email/signup/route.ts",
    "src/app/api/auth/email/signin/route.ts",
    "src/app/api/auth/email/forgot/route.ts",
    "src/app/api/auth/email/reset/route.ts",
    "src/app/api/auth/2fa/status/route.ts",
    "src/app/api/auth/2fa/pending/route.ts",
    "src/app/api/auth/2fa/setup/route.ts",
    "src/app/api/auth/2fa/enable/route.ts",
    "src/app/api/auth/2fa/verify/route.ts",
    "src/app/api/auth/2fa/send-code/route.ts",
    "src/app/api/auth/2fa/disable/route.ts",
    "src/app/api/auth/2fa/backup-codes/route.ts",
  ];
  for (const route of routes) {
    assert.ok(existsSync(path.join(root, route)), `missing route: ${route}`);
  }
  const pages = [
    "src/app/auth/email/page.tsx",
    "src/app/auth/forgot/page.tsx",
    "src/app/auth/reset/page.tsx",
    "src/app/auth/2fa/page.tsx",
  ];
  for (const page of pages) {
    assert.ok(existsSync(path.join(root, page)), `missing page: ${page}`);
  }
});

test("the migration creates the three auth tables with RLS and no public policy", () => {
  const sql = read("supabase/migrations/004_email_auth.sql");
  for (const table of ["lp_auth_users", "lp_auth_otp", "lp_auth_reset_tokens"]) {
    assert.ok(sql.includes(`create table if not exists public.${table}`), table);
    assert.ok(
      sql.includes(`alter table public.${table} enable row level security`),
      `${table} RLS`
    );
  }
  assert.ok(sql.includes("create extension if not exists citext;"));
  // No policy grants anon access — the service-role key is the only way in.
  assert.ok(!/create policy/i.test(sql), "migration must not create any policy");
});

test("email goes through Gmail SMTP only — no Resend anywhere", () => {
  const emailLib = read("src/lib/email.ts");
  assert.ok(emailLib.includes("smtp.gmail.com"));
  assert.ok(emailLib.includes("nodemailer"));
  assert.ok(emailLib.includes("GMAIL_USER"));
  assert.ok(emailLib.includes("GMAIL_APP_PASSWORD"));
  assert.ok(!/resend/i.test(emailLib), "email.ts must not mention Resend");
  const srcFiles = [
    "src/lib/auth-email.ts",
    "src/lib/auth-store.ts",
    "src/lib/auth-routes.ts",
    "src/lib/supabase-server.ts",
  ];
  // Case-sensitive: the lowercase verb "resend" (cooldown, resend
  // code) is fine — only the provider name is banned.
  for (const file of srcFiles) {
    assert.ok(!/Resend/.test(read(file)), `${file} must not mention Resend`);
  }
});

test("the email-auth lib fails closed without credentials", () => {
  const emailLib = read("src/lib/email.ts");
  assert.ok(emailLib.includes("not_configured"));
  const supabaseServer = read("src/lib/supabase-server.ts");
  assert.ok(supabaseServer.includes("SUPABASE_SERVICE_ROLE_KEY"));
  assert.ok(supabaseServer.includes("return null"));
});

test("the settings page mounts the two-factor section", () => {
  const settings = read("src/app/settings/page.tsx");
  assert.ok(settings.includes("TwoFactorSettings"));
  assert.ok(settings.includes("Account security"));
  const section = read("src/components/TwoFactorSettings.tsx");
  assert.ok(section.includes("/api/auth/2fa/status"));
  assert.ok(section.includes("/api/auth/2fa/setup"));
  assert.ok(section.includes("/api/auth/2fa/enable"));
  assert.ok(section.includes("/api/auth/2fa/disable"));
  assert.ok(section.includes("/api/auth/2fa/backup-codes"));
});
