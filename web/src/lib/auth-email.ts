// Email-auth crypto — pure functions, no I/O, no DB.
//
// Everything here is deterministic and testable without a live
// database (the .mjs tests mirror these functions inline, the same
// convention as web/tests/auth.test.mjs for auth.ts).
//
// Storage rules, everywhere in this file:
// - OTP / reset / backup codes are SHA-256 hashed before storage —
//   the code itself only ever travels in the email or the request.
// - Passwords are scrypt (random 16-byte salt), never plain.
// - The TOTP secret is AES-256-GCM encrypted with a key derived
//   from SESSION_SECRET (SHA-256), never stored in the clear.
// - Comparisons of hashes use timingSafeEqual. Codes are never logged.
//
// This file is imported ONLY by API route handlers / server libs.

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

// promisify() picks the 3-arg scrypt overload, so the options form
// needs an explicit type.
const scryptAsync = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

// ---------------------------------------------------------------------------
// One-time codes (sign-up / sign-in / two-factor email codes)
// ---------------------------------------------------------------------------

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_SENDS_PER_HOUR = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

/** SHA-256 hex of a code/token — what is stored, never the value itself. */
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Constant-time equality for two hex digests (false on bad input). */
export function timingSafeEqualHex(a: string, b: string): boolean {
  let bufA: Buffer;
  let bufB: Buffer;
  try {
    bufA = Buffer.from(a, "hex");
    bufB = Buffer.from(b, "hex");
  } catch {
    return false;
  }
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export interface OtpRow {
  codeHash: string;
  expiresAtMs: number;
  attempts: number;
  consumedAtMs: number | null;
}

export type OtpDecision =
  | { ok: true }
  | {
      ok: false;
      reason: "expired" | "consumed" | "too_many_attempts" | "invalid";
    };

/**
 * Pure OTP check: expiry, already-used, attempt cap, then the code
 * itself (constant-time). The caller owns the side effects — bump
 * `attempts` on "invalid", mark consumed on success.
 */
export function decideOtp(row: OtpRow, code: string, nowMs: number): OtpDecision {
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

// ---------------------------------------------------------------------------
// Passwords (scrypt, no new dependency)
// ---------------------------------------------------------------------------

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const SCRYPT_N = 16384;
export const SCRYPT_R = 8;
export const SCRYPT_P = 1;
export const SCRYPT_KEY_LENGTH = 64;

export function isValidPassword(password: unknown): password is string {
  return (
    typeof password === "string" &&
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH
  );
}

/** Stored form: scrypt$N$r$p$<salt base64url>$<hash base64url>. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scryptAsync(
    password,
    salt,
    SCRYPT_KEY_LENGTH,
    { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: 64 * 1024 * 1024 }
  )) as Buffer;
  return [
    "scrypt",
    String(SCRYPT_N),
    String(SCRYPT_R),
    String(SCRYPT_P),
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) {
    return false;
  }
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[4], "base64url");
    expected = Buffer.from(parts[5], "base64url");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;
  let key: Buffer;
  try {
    key = (await scryptAsync(password, salt, expected.length, {
      N: n,
      r,
      p,
      maxmem: 64 * 1024 * 1024,
    })) as Buffer;
  } catch {
    return false;
  }
  if (key.length !== expected.length) return false;
  return timingSafeEqual(key, expected);
}

// ---------------------------------------------------------------------------
// Password-reset tokens (single-use, 1-hour expiry)
// ---------------------------------------------------------------------------

export const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function generateResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export interface ResetTokenRow {
  tokenHash: string;
  expiresAtMs: number;
  usedAtMs: number | null;
}

export type ResetTokenDecision =
  | { ok: true }
  | { ok: false; reason: "expired" | "used" | "invalid" };

export function decideResetToken(
  row: ResetTokenRow,
  token: string,
  nowMs: number
): ResetTokenDecision {
  if (row.usedAtMs !== null) return { ok: false, reason: "used" };
  if (nowMs > row.expiresAtMs) return { ok: false, reason: "expired" };
  if (!timingSafeEqualHex(sha256Hex(token), row.tokenHash)) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// TOTP (RFC 6238, HMAC-SHA1, 30-second step, ±1 window) — dependency-free
// ---------------------------------------------------------------------------

export const TOTP_STEP_SECONDS = 30;
export const TOTP_DIGITS = 6;
export const TOTP_WINDOW = 1;

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(data: Uint8Array): string {
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

export function base32Decode(input: string): Uint8Array | null {
  const clean = input.replace(/=+$/, "").toUpperCase();
  if (!/^[A-Z2-7]*$/.test(clean)) return null;
  const out: number[] = [];
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

/** 20 random bytes (160 bits) as a base32 secret for authenticator apps. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function buildOtpAuthUrl(secret: string, email: string): string {
  const label = `LP Learn Python:${email}`;
  const params = new URLSearchParams({
    secret,
    issuer: "LP Learn Python",
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS),
  });
  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

/** HOTP core: the 6-digit code for one counter value. */
export function totpCodeForCounter(
  secretBytes: Uint8Array,
  counter: number
): string {
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
  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
}

export function verifyTotpCode(
  secret: string,
  code: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const secretBytes = base32Decode(secret);
  if (!secretBytes || secretBytes.length === 0) return false;
  const step = Math.floor(nowSeconds / TOTP_STEP_SECONDS);
  for (let offset = -TOTP_WINDOW; offset <= TOTP_WINDOW; offset++) {
    const expected = totpCodeForCounter(secretBytes, step + offset);
    if (
      timingSafeEqual(Buffer.from(code, "utf8"), Buffer.from(expected, "utf8"))
    ) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// TOTP secret encryption (AES-256-GCM, key = SHA-256 of SESSION_SECRET)
// ---------------------------------------------------------------------------

function totpEncryptionKey(sessionSecret: string): Buffer {
  return createHash("sha256").update(sessionSecret, "utf8").digest();
}

/** Stored form: v1.<iv base64url>.<ciphertext base64url>.<tag base64url>. */
export function encryptTotpSecret(
  sessionSecret: string,
  plaintext: string
): string {
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

export function decryptTotpSecret(
  sessionSecret: string,
  stored: string
): string | null {
  const parts = stored.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  let iv: Buffer;
  let ciphertext: Buffer;
  let tag: Buffer;
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

// ---------------------------------------------------------------------------
// Backup codes (10 single-use codes, SHA-256 hashed, shown once)
// ---------------------------------------------------------------------------

export const BACKUP_CODE_COUNT = 10;

const BACKUP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += BACKUP_CODE_ALPHABET[randomInt(BACKUP_CODE_ALPHABET.length)];
    }
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/** Normalise a user-typed backup code (case/space/dash-insensitive). */
export function normalizeBackupCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Find a backup code in a list of stored SHA-256 hashes (constant-time
 * per entry). Returns the matched hash, or null. The caller removes
 * the matched hash from the stored list (single-use).
 */
export function findBackupCode(
  storedHashes: string[],
  code: string
): string | null {
  const normalized = normalizeBackupCode(code);
  if (normalized.length !== 8) return null;
  const hash = sha256Hex(normalized);
  for (const stored of storedHashes) {
    if (timingSafeEqualHex(hash, stored)) return stored;
  }
  return null;
}
