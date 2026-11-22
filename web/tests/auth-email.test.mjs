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
    password.length <= PASSWORD_MAX_LENGTH &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
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
  return verifyTotpCodeWithStep(secret, code, nowSeconds) !== null;
}

function verifyTotpCodeWithStep(secret, code, nowSeconds) {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  if (!/^\d{6}$/.test(code)) return null;
  const secretBytes = base32Decode(secret);
  if (!secretBytes || secretBytes.length === 0) return null;
  const step = Math.floor(now / 30);
  for (let offset = -1; offset <= 1; offset++) {
    const expected = totpCodeForCounter(secretBytes, step + offset);
    if (
      timingSafeEqual(Buffer.from(code, "utf8"), Buffer.from(expected, "utf8"))
    ) {
      return { step: step + offset };
    }
  }
  return null;
}

function totpEncryptionKey(sessionSecret) {
  return createHash("sha256").update(sessionSecret, "utf8").digest();
}

// Mirror of totpSecretEncryptionKey: the dedicated key must be at
// least 32 chars, else null (fail closed); unset means the legacy
// session-secret derivation. `dedicated` stands in for
// process.env.TOTP_ENCRYPTION_KEY, which the test controls.
const TOTP_ENCRYPTION_KEY_MIN_LENGTH = 32;

function totpSecretEncryptionKey(sessionSecret, dedicated) {
  if (dedicated !== undefined) {
    if (dedicated.length < TOTP_ENCRYPTION_KEY_MIN_LENGTH) return null;
    return dedicated;
  }
  return sessionSecret;
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

async function hashBackupCodes(codes) {
  return Promise.all(
    codes.map((c) => hashPassword(normalizeBackupCode(c)))
  );
}

async function findBackupCode(storedHashes, code) {
  const normalized = normalizeBackupCode(code);
  if (normalized.length !== 8) return null;
  const hash = sha256Hex(normalized);
  for (const stored of storedHashes) {
    if (stored.startsWith("scrypt$")) {
      if (await verifyPassword(normalized, stored)) return stored;
    } else if (timingSafeEqualHex(hash, stored)) {
      return stored;
    }
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

test("password validation enforces length plus upper/lower/digit", () => {
  assert.equal(isValidPassword("Abcdef12"), true);
  assert.equal(isValidPassword("aB1" + "x".repeat(125)), true); // 128
  assert.equal(isValidPassword("aB1" + "x".repeat(126)), false); // 129
  // Length alone is not enough anymore (M5).
  assert.equal(isValidPassword("12345678"), false); // no letters
  assert.equal(isValidPassword("abcdefgh"), false); // no upper/digit
  assert.equal(isValidPassword("ABCDEFGH"), false); // no lower/digit
  assert.equal(isValidPassword("Abcdefgh"), false); // no digit
  assert.equal(isValidPassword("Abcdef1"), false); // 7 chars
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
  // A tampered ciphertext fails the GCM tag check. Tamper with the
  // FIRST character, not the last: the last base64 char can carry
  // padding bits, so swapping it sometimes leaves the decoded bytes
  // unchanged and the tamper silently passes. The first char's bits
  // are all significant, so any change there alters the ciphertext.
  const parts = stored.split(".");
  const firstChar = parts[2][0];
  const replacement = firstChar === "A" ? "B" : "A";
  const tampered = `${parts[0]}.${parts[1]}.${replacement}${parts[2].slice(1)}.${parts[3]}`;
  assert.equal(decryptTotpSecret(sessionSecret, tampered), null);
  assert.equal(decryptTotpSecret(sessionSecret, "garbage"), null);
});

// --- backup codes ---------------------------------------------------------------

test("backup codes are 10 single-use codes, matched case-insensitively", async () => {
  const codes = generateBackupCodes();
  assert.equal(codes.length, 10);
  for (const code of codes) {
    assert.match(code, /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  }
  assert.equal(new Set(codes).size, 10);
  const hashes = codes.map((c) => sha256Hex(c.replace("-", "")));
  const first = codes[0];
  assert.equal(await findBackupCode(hashes, first), hashes[0]);
  // Lowercase and dashless input still matches the same hash.
  assert.equal(await findBackupCode(hashes, first.toLowerCase()), hashes[0]);
  assert.equal(
    await findBackupCode(hashes, first.replace("-", "")),
    hashes[0]
  );
  assert.equal(await findBackupCode(hashes, "AAAA-AAAA"), null);
  assert.equal(await findBackupCode(hashes, "short"), null);
  assert.equal(await findBackupCode([], first), null);
});

test("backup codes are scrypt-hashed now, legacy SHA-256 still verifies", async () => {
  const codes = generateBackupCodes();
  const stored = await hashBackupCodes(codes);
  for (const hash of stored) {
    assert.match(hash, /^scrypt\$16384\$8\$1\$/);
  }
  // Same code, different salt each time.
  assert.equal(new Set(stored).size, 10);
  const first = codes[0];
  assert.equal(await findBackupCode(stored, first), stored[0]);
  assert.equal(await findBackupCode(stored, first.toLowerCase()), stored[0]);
  assert.equal(await findBackupCode(stored, "AAAA-AAAA"), null);
  // Legacy SHA-256 entries keep working until the user regenerates.
  const legacy = codes.map((c) => sha256Hex(c.replace("-", "")));
  assert.equal(await findBackupCode(legacy, first), legacy[0]);
  // Mixed lists (some regenerated, some legacy) work too.
  const mixed = [stored[0], ...legacy.slice(1)];
  assert.equal(await findBackupCode(mixed, codes[0]), stored[0]);
  assert.equal(await findBackupCode(mixed, codes[1]), legacy[1]);
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
  const en = read("src/lib/i18n/en.ts");
  assert.ok(settings.includes("TwoFactorSettings"));
  // The section heading moved to i18n (en.ts settingsPage.accountSecurity);
  // the page must render that key and the English value must read
  // "Account security".
  assert.ok(settings.includes("t.settingsPage.accountSecurity"), "settings must render the Account security heading");
  assert.ok(en.includes('accountSecurity: "Account security"'), "the heading must read Account security");
  const section = read("src/components/TwoFactorSettings.tsx");
  assert.ok(section.includes("/api/auth/2fa/status"));
  assert.ok(section.includes("/api/auth/2fa/setup"));
  assert.ok(section.includes("/api/auth/2fa/enable"));
  assert.ok(section.includes("/api/auth/2fa/disable"));
  assert.ok(section.includes("/api/auth/2fa/backup-codes"));
});

// --- Security hardening (audit 2026-11-21) ------------------------------
// Route-level protections are covered by source assertions (the DB
// layer needs the service-role key, unset in the sandbox).

test("sessions carry a version and password reset revokes old ones", () => {
  const authRoutes = read("src/lib/auth-routes.ts");
  assert.ok(authRoutes.includes("session_version"), "getSessionUser must check the stored version");
  assert.ok(authRoutes.includes("verified.sv"), "the signed version must be compared");
  const reset = read("src/app/api/auth/email/reset/route.ts");
  assert.ok(reset.includes("bumpSessionVersion"), "a reset must bump the session version");
  assert.ok(reset.includes("markResetTokenUsed"), "a reset must claim the token");
  const store = read("src/lib/auth-store.ts");
  assert.ok(store.includes("bumpSessionVersion"), "the store must bump the version");
  assert.ok(store.includes("session_version"), "the user row must carry the version");
});

test("OTP codes and reset tokens are claimed atomically", () => {
  const store = read("src/lib/auth-store.ts");
  // consumeOtp / markResetTokenUsed only mark when still unused and
  // report whether this caller won the claim.
  assert.ok(store.includes('.is("consumed_at", null)'), "consumeOtp must be conditional");
  assert.ok(store.includes('.is("used_at", null)'), "markResetTokenUsed must be conditional");
  assert.ok(store.includes("consumeOtp(otpId: string): Promise<boolean>"), "consumeOtp must report the claim");
  assert.ok(store.includes("markResetTokenUsed(tokenId: string): Promise<boolean>"), "markResetTokenUsed must report the claim");
  const verifyOtp = read("src/app/api/auth/email/verify-otp/route.ts");
  assert.ok(verifyOtp.includes("claimed = await consumeOtp"), "verify-otp must check the claim");
  const twoFaVerify = read("src/app/api/auth/2fa/verify/route.ts");
  assert.ok(twoFaVerify.includes("verified = await consumeOtp"), "2fa email codes must check the claim");
});

test("TOTP verification has a per-account attempt cap", () => {
  const lib = read("src/lib/auth-email.ts");
  assert.ok(lib.includes("TOTP_MAX_FAILED_ATTEMPTS = 5"), "the cap must be 5");
  const verify = read("src/app/api/auth/2fa/verify/route.ts");
  assert.ok(verify.includes("TOTP_MAX_FAILED_ATTEMPTS"), "verify must enforce the cap");
  assert.ok(verify.includes("totp_failed_attempts"), "failures must be counted on the user row");
});

test("TOTP failure counters increment atomically (CAS, not read-then-write)", () => {
  const store = read("src/lib/auth-store.ts");
  assert.ok(store.includes("bumpTotpFailedAttempts"), "the counter bump must live in the store");
  assert.ok(
    store.includes('.eq("totp_failed_attempts", current)'),
    "the bump must only land when the counter is still the value read"
  );
  assert.ok(
    !store.includes("attempts: attempts + 1"),
    "no read-then-write fallback may remain in the OTP bump"
  );
  const verify = read("src/app/api/auth/2fa/verify/route.ts");
  assert.ok(verify.includes("bumpTotpFailedAttempts(user.id)"), "verify must use the atomic bump");
  assert.ok(
    !verify.includes("totp_failed_attempts: (user.totp_failed_attempts ?? 0) + 1"),
    "verify must not increment the counter from a stale read"
  );
});

test("single-use bearer tokens cannot be replayed in their window", () => {
  const store = read("src/lib/auth-store.ts");
  assert.ok(store.includes("claimUsedToken"), "the store must claim used tokens");
  assert.ok(store.includes("lp_auth_used_tokens"), "used tokens must be recorded");
  const appExchange = read("src/app/api/auth/app-exchange/route.ts");
  assert.ok(appExchange.includes("claimUsedToken"), "the exchange code must be single-use");
  const callback = read("src/app/api/auth/callback/google/route.ts");
  assert.ok(callback.includes("claimUsedToken"), "the app state token must be single-use");
  const twoFaVerify = read("src/app/api/auth/2fa/verify/route.ts");
  assert.ok(twoFaVerify.includes("claimUsedToken"), "the step-up cookie must be single-use");
});

test("Google sign-in with 2FA on stops at the step-up page, never a session", () => {
  const callback = read("src/app/api/auth/callback/google/route.ts");
  assert.ok(callback.includes("totp_enabled"), "the callback must check the user's 2FA flag");
  assert.ok(
    callback.includes('new URL("/auth/2fa", origin)'),
    "a 2FA user must be sent to the step-up page instead of a session"
  );
  assert.ok(
    callback.includes('setPending2fa(res, secret, email, isSecure, "google")'),
    "the step-up cookie must record the Google first factor"
  );
  assert.ok(
    callback.includes("if (needs2fa)"),
    "the 2FA gate must run before any session is minted"
  );
  const appExchange = read("src/app/api/auth/app-exchange/route.ts");
  assert.ok(appExchange.includes("totp_enabled"), "the exchange must check the user's 2FA flag");
  assert.ok(
    appExchange.includes('new URL("/auth/2fa", origin)'),
    "a 2FA user must finish 2FA inside the WebView instead of a session"
  );
  const verify = read("src/app/api/auth/2fa/verify/route.ts");
  assert.ok(
    verify.includes("pending.auth"),
    "verify must issue the session with the recorded first factor, not hardcoded email"
  );
});

test("session checks fail closed and logout revokes server-side", () => {
  const store = read("src/lib/auth-store.ts");
  assert.ok(
    store.includes("getSessionVersionByEmail"),
    "the version check must distinguish a DB error from no row"
  );
  const claimStart = store.indexOf("export async function claimUsedToken");
  const claimEnd = store.indexOf("export async function", claimStart + 10);
  const claim = store.slice(claimStart, claimEnd === -1 ? undefined : claimEnd);
  assert.ok(
    claim.includes("if (!supabase) return false"),
    "a claim that cannot be recorded must not grant first-use"
  );
  assert.ok(
    claim.includes('if ((error as { code?: string }).code === "23505") return false'),
    "an already-claimed token must not grant first-use"
  );
  assert.ok(
    claim.includes("  return false;\n}"),
    "any other claim error must fail closed, not grant first-use"
  );
  assert.equal(
    claim.match(/return true/g)?.length ?? 0,
    1,
    "first-use is granted only on the recorded insert"
  );
  const routes = read("src/lib/auth-routes.ts");
  assert.ok(
    routes.includes("if (!check.ok) return null"),
    "an unreadable version check must reject the session"
  );
  const logout = read("src/app/api/auth/logout/route.ts");
  assert.ok(
    logout.includes("updateUser(row.id, {"),
    "logout must bump the stored session version"
  );
  assert.ok(
    logout.includes("session_version: (row.session_version ?? 0) + 1"),
    "logout must invalidate the current token server-side"
  );
});

test("TOTP and GitHub tokens use dedicated keys, with a legacy read fallback", () => {
  const lib = read("src/lib/auth-email.ts");
  assert.ok(lib.includes("TOTP_ENCRYPTION_KEY"), "new TOTP secrets must use the dedicated key");
  assert.ok(lib.includes("totpSecretEncryptionKey"), "the key choice must live in one place");
  assert.ok(lib.includes("decryptUserTotpSecret"), "old TOTP secrets must still decrypt under the legacy key");
  const setup = read("src/app/api/auth/2fa/setup/route.ts");
  assert.ok(
    setup.includes("totpSecretEncryptionKey(prereqs.secret)"),
    "new secrets must be written under the dedicated key"
  );
  const verify = read("src/app/api/auth/2fa/verify/route.ts");
  assert.ok(
    verify.includes("decryptUserTotpSecret(prereqs.secret, user.totp_secret_enc)"),
    "verify must try the dedicated key, then the legacy one"
  );
  const gh = read("src/lib/github-token.ts");
  assert.ok(
    gh.includes("return process.env.GITHUB_TOKEN_KEY ?? null"),
    "no dedicated key must mean no token storage"
  );
  assert.ok(
    !gh.includes("return dedicated ? dedicated : sessionSecret"),
    "the SESSION_SECRET fallback for GitHub tokens must be gone"
  );
  assert.ok(gh.includes("if (!key) return false"), "saving without the key must fail closed");
  assert.ok(gh.includes("if (!key) return null"), "reading without the key must fail closed");
  assert.ok(
    gh.includes("decryptTotpSecret(secret, data.token_encrypted)"),
    "tokens encrypted under the old key must still read once, then re-encrypt"
  );
});

test("password sign-in costs the same for missing accounts", () => {
  const signin = read("src/app/api/auth/email/signin/route.ts");
  assert.ok(signin.includes("DUMMY_PASSWORD_HASH"), "a dummy hash must exist");
  assert.ok(
    signin.includes("await verifyPassword(password, DUMMY_PASSWORD_HASH)"),
    "a missing account must still run scrypt"
  );
});

test("migration 005 adds revocation, the TOTP cap and used tokens", () => {
  const migration = read("supabase/migrations/005_security_hardening.sql");
  assert.ok(migration.includes("session_version"), "005 must add the session version");
  assert.ok(migration.includes("totp_failed_attempts"), "005 must add the TOTP counter");
  assert.ok(migration.includes("lp_auth_used_tokens"), "005 must add the used-tokens table");
  assert.ok(migration.includes("bump_otp_attempts"), "005 must add the atomic OTP bump");
  assert.ok(migration.includes("row level security"), "the used-tokens table must have RLS");
});

test("PyPI errors are generic and the fetch has a timeout", () => {
  const pypi = read("src/app/api/pypi/route.ts");
  assert.ok(!pypi.includes("err.message"), "the raw fetch error must not leak");
  assert.ok(pypi.includes("Failed to query PyPI"), "the error must be generic");
  assert.ok(pypi.includes("AbortController"), "the fetch must time out");
});

// --- Security hardening (audit 2026-11-22, Track A) ------------------
// Pure-function mirrors above, route wiring below (source
// assertions — the DB layer needs the service-role key, unset in
// the sandbox).

test("TOTP verification reports the matched step, for replay protection", () => {
  const secret = base32Encode(new TextEncoder().encode("12345678901234567890"));
  const now = 1234567890;
  const step = Math.floor(now / 30);
  const secretBytes = new TextEncoder().encode("12345678901234567890");
  const current = totpCodeForCounter(secretBytes, step);
  const prev = totpCodeForCounter(secretBytes, step - 1);
  const far = totpCodeForCounter(secretBytes, step + 2);
  // The step a code was accepted for is what the server records —
  // a second sign-in presenting the same code in the same step is
  // a replay, even though the code itself is still "valid".
  assert.deepEqual(verifyTotpCodeWithStep(secret, current, now), { step });
  assert.deepEqual(verifyTotpCodeWithStep(secret, prev, now), { step: step - 1 });
  assert.equal(verifyTotpCodeWithStep(secret, far, now), null);
  assert.equal(verifyTotpCodeWithStep(secret, "000000", now), null);
  assert.equal(verifyTotpCode(secret, current, now), true);
  assert.equal(verifyTotpCode(secret, far, now), false);
});

test("a short TOTP_ENCRYPTION_KEY fails closed", () => {
  const sessionSecret = "test-session-secret-0123456789abcdef";
  assert.equal(totpSecretEncryptionKey(sessionSecret, undefined), sessionSecret);
  assert.equal(
    totpSecretEncryptionKey(sessionSecret, "a".repeat(64)),
    "a".repeat(64)
  );
  assert.equal(totpSecretEncryptionKey(sessionSecret, "a".repeat(32)), "a".repeat(32));
  assert.equal(totpSecretEncryptionKey(sessionSecret, "short"), null);
  assert.equal(totpSecretEncryptionKey(sessionSecret, ""), null);
  const lib = read("src/lib/auth-email.ts");
  assert.ok(lib.includes("TOTP_ENCRYPTION_KEY_MIN_LENGTH = 32"));
  assert.ok(lib.includes("totpSecretEncryptionKey(\n  sessionSecret: string\n): string | null"));
  const setup = read("src/app/api/auth/2fa/setup/route.ts");
  assert.ok(setup.includes("if (!key) return serviceUnavailable"), "setup must fail closed on a short key");
});

test("H1: the origin is allowlisted, never taken from request headers", () => {
  const auth = read("src/lib/auth.ts");
  assert.ok(auth.includes("APP_URL"), "APP_URL must configure the origin");
  assert.ok(auth.includes("getAllowedOrigins"), "an allowlist must exist");
  assert.ok(auth.includes("learnpythonprogram.vercel.app"), "the known Vercel domain must be the fallback");
  assert.ok(auth.includes("getConfiguredAppOrigin"), "a non-allowlisted host must fall back to the configured origin");
  assert.ok(!auth.includes("return `${proto}://${host}`;"), "the raw header-derived origin must never be returned");
  const forgot = read("src/app/api/auth/email/forgot/route.ts");
  assert.ok(forgot.includes("prereqs.origin"), "the reset link must use the allowlisted origin");
});

test("H2: 2FA enable/disable revokes old sessions and mfa is enforced", () => {
  const routes = read("src/lib/auth-routes.ts");
  assert.ok(routes.includes("totpEnabled"), "getSessionUser must read the 2FA flag");
  assert.ok(routes.includes("verified.mfa !== true"), "a session without mfa must fail once TOTP is on");
  const enable = read("src/app/api/auth/2fa/enable/route.ts");
  assert.ok(enable.includes("session_version: newSessionVersion"), "enable must bump the version");
  assert.ok(enable.includes("mfa: true"), "enable must re-issue the session with mfa:true");
  const disable = read("src/app/api/auth/2fa/disable/route.ts");
  assert.ok(disable.includes("session_version: newSessionVersion"), "disable must bump the version");
  assert.ok(disable.includes("mfa: false"), "disable must re-issue the session with mfa:false");
});

test("H3: a Google sign-in creates a row, so logout can revoke it", () => {
  const store = read("src/lib/auth-store.ts");
  assert.ok(store.includes("createGoogleUser"), "the store must create Google rows");
  assert.ok(store.includes("password_hash: null"), "a Google row carries no password");
  assert.ok(store.includes("email_verified: true"), "a Google row is verified by Google");
  const callback = read("src/app/api/auth/callback/google/route.ts");
  assert.ok(callback.includes("createGoogleUser({ email, name })"), "the callback must create the row on first sign-in");
});

test("H4: 2FA setup/enable need the password, backup regen needs a TOTP code", () => {
  const setup = read("src/app/api/auth/2fa/setup/route.ts");
  assert.ok(setup.includes("verifyPassword(password, user.password_hash)"), "setup must re-check the password");
  const enable = read("src/app/api/auth/2fa/enable/route.ts");
  assert.ok(enable.includes("verifyPassword(password, user.password_hash)"), "enable must re-check the password");
  const backup = read("src/app/api/auth/2fa/backup-codes/route.ts");
  assert.ok(backup.includes("verifyTotpCodeWithStep(secret, code)"), "backup regen must check a TOTP code");
  assert.ok(backup.includes("session_version: newSessionVersion"), "backup regen must bump the version");
  const section = read("src/components/TwoFactorSettings.tsx");
  assert.ok(section.includes("password: setupPassword"), "the settings page must send the password at setup/enable");
  assert.ok(section.includes("code: regenCode"), "the settings page must send a TOTP code for backup regen");
});

test("H5: a successful reset retires every reset token for the user", () => {
  const store = read("src/lib/auth-store.ts");
  assert.ok(store.includes("invalidateAllResetTokens"), "the store must retire all of a user's tokens");
  assert.ok(store.includes('.eq("user_id", userId)'), "retirement must be scoped to the user");
  const reset = read("src/app/api/auth/email/reset/route.ts");
  assert.ok(reset.includes("invalidateAllResetTokens(row.user_id)"), "reset must retire all tokens, not just the presented one");
});

test("H10: disabling 2FA needs a TOTP (or backup) code", () => {
  const disable = read("src/app/api/auth/2fa/disable/route.ts");
  assert.ok(disable.includes("verifyTotpCodeWithStep(secret, code)"), "disable must check a TOTP code");
  assert.ok(disable.includes("findBackupCode(user.backup_codes, code)"), "disable must also accept a backup code");
  assert.ok(disable.includes("session_version: newSessionVersion"), "disable must bump the version");
  const section = read("src/components/TwoFactorSettings.tsx");
  assert.ok(section.includes("code: disableCode"), "the settings page must send the code when disabling");
});

test("M1: no endpoint reveals whether an email has an account", () => {
  const signup = read("src/app/api/auth/email/signup/route.ts");
  assert.ok(!signup.includes("An account with this email already exists"), "signup must not say the account exists");
  assert.ok(signup.includes("NextResponse.json({ sent: true, email })"), "signup must answer success-shaped");
  const signin = read("src/app/api/auth/email/signin/route.ts");
  assert.ok(!signin.includes("needsVerification"), "signin must not flag unverified accounts");
  assert.ok(signin.includes("GENERIC_CREDENTIALS_ERROR, 401"), "an unverified sign-in must get the generic 401");
  const sendOtp = read("src/app/api/auth/email/send-otp/route.ts");
  assert.ok(!sendOtp.includes("status: 429"), "send-otp must not 429 only when an account exists");
  assert.ok(!sendOtp.includes("Could not send the email"), "send-otp must not 502 only when an account exists");
  const forgot = read("src/app/api/auth/email/forgot/route.ts");
  assert.ok(!forgot.includes("Could not send the email"), "forgot must not 502 only when an account exists");
  const page = read("src/app/auth/email/page.tsx");
  assert.ok(!page.includes("needsVerification"), "the sign-in page must not read the removed flag");
  assert.ok(page.includes("handleResendVerification"), "the page must still offer a verification-code resend");
});

test("M2: 2FA enable has the same 5-failure cap as verify", () => {
  const enable = read("src/app/api/auth/2fa/enable/route.ts");
  assert.ok(enable.includes("TOTP_MAX_FAILED_ATTEMPTS"), "enable must enforce the cap");
  assert.ok(enable.includes("bumpTotpFailedAttempts(user.id)"), "enable failures must count");
  assert.ok(enable.includes("totp_pending_enc: null"), "the pending secret must die at the cap");
});

test("M3: backup codes are claimed atomically", () => {
  const store = read("src/lib/auth-store.ts");
  assert.ok(store.includes("claimBackupCode"), "the store must claim backup codes");
  assert.ok(store.includes('.contains("backup_codes", [matchedHash])'), "the claim must only land while the hash is still stored");
  const verify = read("src/app/api/auth/2fa/verify/route.ts");
  assert.ok(verify.includes("verified = await claimBackupCode"), "verify must check the claim");
  assert.ok(!verify.includes("backup_codes: remaining });\n      verified = saved;"), "verify must not use the old read-then-write claim");
});

test("M4: backup attempts are capped and TOTP codes cannot be replayed", () => {
  const verify = read("src/app/api/auth/2fa/verify/route.ts");
  assert.ok(verify.includes("totp_last_step"), "verify must record and check the last-used step");
  assert.ok(verify.includes("recordTotpStep(user.id, matchedStep)"), "a successful TOTP code must record its step");
  assert.ok(verify.includes("replay"), "a reused code in the same step must be rejected");
  const lib = read("src/lib/auth-email.ts");
  assert.ok(lib.includes("verifyTotpCodeWithStep"), "the TOTP check must report the matched step");
  const migration = read("supabase/migrations/008_auth_hardening.sql");
  assert.ok(migration.includes("totp_last_step"), "008 must add the last-step column");
});

test("M5: passwords need complexity and sign-in locks out progressively", () => {
  const lib = read("src/lib/auth-email.ts");
  assert.ok(lib.includes("/[a-z]/"), "a lowercase letter must be required");
  assert.ok(lib.includes("/[A-Z]/"), "an uppercase letter must be required");
  assert.ok(lib.includes("/[0-9]/"), "a digit must be required");
  assert.ok(lib.includes("SIGNIN_LOCKOUT_THRESHOLD = 10"), "the lockout threshold must be 10");
  assert.ok(lib.includes("SIGNIN_LOCKOUT_MS = 15 * 60 * 1000"), "the lockout must last 15 minutes");
  const signin = read("src/app/api/auth/email/signin/route.ts");
  assert.ok(signin.includes("signin_locked_until"), "signin must refuse a locked account");
  assert.ok(signin.includes("recordSigninFailure(user.id)"), "a failed password must count");
  assert.ok(signin.includes("clearSigninFailures(user.id)"), "a good password must clear the counter");
  assert.ok(signin.includes("30,\n      60_000"), "the per-email throttle must be generous, not a login-DoS");
  const store = read("src/lib/auth-store.ts");
  assert.ok(store.includes("recordSigninFailure"), "the failure counter must live in the store");
  const migration = read("supabase/migrations/008_auth_hardening.sql");
  assert.ok(migration.includes("signin_failed_attempts"), "008 must add the failure counter");
  assert.ok(migration.includes("signin_locked_until"), "008 must add the lock timestamp");
});

test("M6: a fresh password sign-in invalidates older tokens", () => {
  const signin = read("src/app/api/auth/email/signin/route.ts");
  assert.ok(signin.includes("newSessionVersion"), "signin must bump the version");
  assert.ok(signin.includes("sv: newSessionVersion"), "the new session must carry the bumped version");
});

test("M7 (auth half): verify/reset routes have per-account limits, not just per-IP", () => {
  const routes = read("src/lib/auth-routes.ts");
  assert.ok(routes.includes("rateLimitKey"), "a per-key limiter must exist");
  const verifyOtp = read("src/app/api/auth/email/verify-otp/route.ts");
  assert.ok(verifyOtp.includes("auth-email-verify-otp-email:"), "verify-otp must limit per email");
  const reset = read("src/app/api/auth/email/reset/route.ts");
  assert.ok(reset.includes("auth-email-reset-token:"), "reset must limit per token");
  const twoFaVerify = read("src/app/api/auth/2fa/verify/route.ts");
  assert.ok(twoFaVerify.includes("auth-2fa-verify-email:"), "2fa verify must limit per email");
});

test("M9: logout revokes from the raw token and surfaces failure", () => {
  const logout = read("src/app/api/auth/logout/route.ts");
  assert.ok(logout.includes("getSessionUserRaw"), "logout must verify the raw token, not the version-checked session");
  assert.ok(logout.includes("status: 503"), "a failed revocation must surface, not return ok:true");
  assert.ok(logout.includes("clearSessionCookies"), "logout must clear the pending-2FA and OAuth cookies too");
  const routes = read("src/lib/auth-routes.ts");
  assert.ok(routes.includes("clearSessionCookies"), "the cookie clearing must live in one place");
  assert.ok(routes.includes("PENDING_2FA_COOKIE"), "the pending-2FA cookie must be cleared");
  assert.ok(routes.includes("OAUTH_STATE_COOKIE"), "the OAuth state cookie must be cleared");
});

test("L1: the OAuth state compare is constant-time", () => {
  const callback = read("src/app/api/auth/callback/google/route.ts");
  assert.ok(callback.includes("timingSafeEqual"), "the callback must compare state in constant time");
  assert.ok(callback.includes("statesEqual(stateCookie, state)"), "the state check must use the constant-time helper");
  assert.ok(!callback.includes("stateCookie !== state"), "no plain === on the state may remain");
});

test("L2: backup codes are stored scrypt-hashed", () => {
  const lib = read("src/lib/auth-email.ts");
  assert.ok(lib.includes("hashBackupCodes"), "fresh codes must be scrypt-hashed");
  assert.ok(lib.includes('stored.startsWith("scrypt$")'), "verification must handle scrypt entries");
  const enable = read("src/app/api/auth/2fa/enable/route.ts");
  assert.ok(enable.includes("hashBackupCodes(backupCodes)"), "enable must store scrypt hashes");
  assert.ok(!enable.includes("sha256Hex(c)"), "enable must not store plain SHA-256 hashes");
  const backup = read("src/app/api/auth/2fa/backup-codes/route.ts");
  assert.ok(backup.includes("hashBackupCodes(backupCodes)"), "regen must store scrypt hashes");
});

test("L4: the session cookie is __Host- prefixed and Secure from deployment", () => {
  const auth = read("src/lib/auth.ts");
  assert.ok(auth.includes("__Host-lp_session"), "the secure cookie name must carry the __Host- prefix");
  assert.ok(auth.includes("isSecureDeployment"), "Secure must come from the deployment, not headers");
  assert.ok(auth.includes("sameSite: \"lax\""), "SameSite must stay Lax");
  const routes = read("src/lib/auth-routes.ts");
  assert.ok(routes.includes("isSecure: isSecureDeployment()"), "prereqs must use the deployment-derived flag");
  assert.ok(!routes.includes("isSecureOrigin(origin)"), "no route helper may derive Secure from the origin anymore");
});

test("L5: the reset page sends no referrer", () => {
  const page = read("src/app/auth/reset/page.tsx");
  assert.ok(page.includes('name="referrer"'), "the reset page must set a referrer policy");
  assert.ok(page.includes('content="no-referrer"'), "the policy must be no-referrer");
  const reset = read("src/app/api/auth/email/reset/route.ts");
  assert.ok(reset.includes("body?.token"), "the token must travel in the POST body");
});

test("L6: OTP caps and cooldowns are per email across purposes", () => {
  const routes = read("src/lib/auth-routes.ts");
  assert.ok(routes.includes("countRecentOtps(\n    normalized,\n    null,"), "the hourly cap must count all purposes");
  assert.ok(routes.includes("getLatestOtp(normalized, null)"), "the cooldown must look at the latest code of any purpose");
  const store = read("src/lib/auth-store.ts");
  assert.ok(store.includes("purpose: string | null"), "the store must support a cross-purpose count");
});

test("L8: sign-up reserves nothing until the code is verified", () => {
  const store = read("src/lib/auth-store.ts");
  assert.ok(store.includes("storePendingSignup"), "pending sign-ups must be stored");
  assert.ok(store.includes("lp_auth_pending_signups"), "pending sign-ups need their own table");
  assert.ok(store.includes("getPendingSignup"), "verify must read the pending sign-up");
  assert.ok(store.includes("deletePendingSignup"), "verify must clear the pending sign-up");
  const signup = read("src/app/api/auth/email/signup/route.ts");
  assert.ok(signup.includes("storePendingSignup"), "signup must hold the account pending");
  const verifyOtp = read("src/app/api/auth/email/verify-otp/route.ts");
  assert.ok(verifyOtp.includes("createEmailUser({"), "verify must create the account after the code");
  const migration = read("supabase/migrations/008_auth_hardening.sql");
  assert.ok(migration.includes("lp_auth_pending_signups"), "008 must create the pending-signups table");
  assert.ok(migration.includes("enable row level security"), "the pending table must have RLS");
});

test("L22: OTP codes are out of email subjects", () => {
  const email = read("src/lib/email.ts");
  assert.ok(email.includes('subject: "Your Learn Python verification code"'), "the OTP subject must be fixed");
  assert.ok(email.includes('subject: "Your Learn Python sign-in code"'), "the 2FA subject must be fixed");
  assert.ok(!email.includes("Your Learn Python code: ${code}"), "no code may ride in a subject");
  assert.ok(!email.includes("Your Learn Python sign-in code: ${code}"), "no 2FA code may ride in a subject");
  assert.ok(email.includes("Your Learn Python verification code is ${code}"), "the code must still be in the body");
});

test("L23: sign-in logs carry a hash, never the email address", () => {
  const callback = read("src/app/api/auth/callback/google/route.ts");
  assert.ok(callback.includes("emailHash: sha256Hex(email)"), "callback logins must log a hash");
  assert.ok(!callback.includes('endpoint: "callback", email }'), "no callback login log may carry the address");
  const exchange = read("src/app/api/auth/app-exchange/route.ts");
  assert.ok(exchange.includes("emailHash: sha256Hex(p.email)"), "exchange logins must log a hash");
  assert.ok(!exchange.includes("email: p.email,"), "no exchange login log may carry the address");
});

test("L24: migration 008 revokes anon EXECUTE on the OTP bump", () => {
  const migration = read("supabase/migrations/008_auth_hardening.sql");
  assert.ok(
    migration.includes("revoke execute on function public.bump_otp_attempts(uuid) from public;"),
    "008 must revoke the anon EXECUTE grant"
  );
  assert.ok(migration.includes("is_admin()"), "008 must record the is_admin() audit");
  assert.ok(migration.includes("handle_new_user()"), "008 must record the handle_new_user() audit");
});

test("migration 008 follows the 005 pattern (idempotent, RLS, no policies)", () => {
  const migration = read("supabase/migrations/008_auth_hardening.sql");
  assert.ok(migration.includes("add column if not exists totp_last_step"), "columns must be added idempotently");
  assert.ok(migration.includes("create table if not exists public.lp_auth_pending_signups"), "the table must be created idempotently");
  assert.ok(migration.includes("alter table public.lp_auth_pending_signups enable row level security"), "the table must have RLS");
  assert.ok(!/create policy/i.test(migration), "the migration must not create any policy");
});
