import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

// Round-3b: R3-H1 FULL fix — OTP↔pending-row binding.
//
// The round-3 fix closed only the resend leg (no mail when the
// pending row already exists). The first-signup leg stayed open:
// an attacker signs up with the victim's email and the attacker's
// password, a code is mailed to the victim's inbox, and the victim
// entering that code created the account with the ATTACKER's
// password — because verify-otp created the account from the
// pending row. Binding the OTP to the row id alone does NOT close
// this (the code WAS issued for the attacker's row and that row IS
// still current at verify time). The full close: the account
// password comes from the person entering the code, never from the
// pending row. The client sends the password it still holds from
// the sign-up form; the server hashes it and creates/claims the
// account with THAT hash.
//
// Mirror assertions in the established style: the source is the
// contract, plus a runtime model of the pinned rule for the attack
// sequence itself (the real route is DB-backed).

const VERIFY_OTP = "src/app/api/auth/email/verify-otp/route.ts";

// --- The schema accepts the code-enterer's password -------------------
test("R3-H1 full: verify-otp accepts an optional password for signup codes", () => {
  const route = read(VERIFY_OTP);
  assert.ok(
    route.includes("password: z.string().min(1).max(128).optional(),"),
    "schema takes an optional password (max 128, like signup)"
  );
  assert.ok(
    route.includes('from "@/lib/auth-email"'),
    "route imports from auth-email"
  );
  assert.ok(route.includes("hashPassword"), "route can hash the supplied password");
  assert.ok(route.includes("isValidPassword"), "route validates the supplied password");
});

// --- The pending row's hash is never used ------------------------------
test("R3-H1 full: the pending row's password hash is never used", () => {
  const route = read(VERIFY_OTP);
  const uses = route.match(/pending\.password_hash/g) || [];
  assert.equal(
    uses.length,
    0,
    `pending.password_hash must appear nowhere in verify-otp, found ${uses.length}`
  );
  // Every account write in the pending branch uses the hash of the
  // password the code-enterer supplied: new account, Google-only
  // claim, and the lost-the-race claim.
  const claimWrites = route.match(/password_hash: signupPasswordHash/g) || [];
  assert.equal(claimWrites.length, 2, "both updateUser claims use the supplied hash");
  assert.ok(
    route.includes("passwordHash: signupPasswordHash,"),
    "createEmailUser uses the supplied hash"
  );
  assert.ok(
    route.includes("signupPasswordHash = await hashPassword(suppliedPassword);"),
    "the supplied password is hashed server-side"
  );
});

// --- The binding check runs after the code, before the claim ----------
test("R3-H1 full: the binding check runs after code verify, before the claim", () => {
  const route = read(VERIFY_OTP);
  const decideIdx = route.indexOf("const decision = decideOtp(");
  const wrongCodeIdx = route.indexOf("if (!decision.ok) {");
  const bindingIdx = route.indexOf("let signupPasswordHash: string | null = null;");
  const claimIdx = route.indexOf("const claimed = await consumeOtp(row.id);");
  assert.ok(decideIdx > 0 && wrongCodeIdx > 0 && bindingIdx > 0 && claimIdx > 0);
  assert.ok(decideIdx < wrongCodeIdx, "the code is decided first");
  assert.ok(
    wrongCodeIdx < bindingIdx,
    "a wrong code exits before the binding check — it can never probe for a pending row"
  );
  assert.ok(bindingIdx < claimIdx, "the binding check runs before the code is claimed");
  // The binding check itself is gated on signup purpose only.
  const purposeIdx = route.indexOf('if (purpose === "signup") {', bindingIdx);
  const pendingReadIdx = route.indexOf(
    "const pendingForBinding = await getPendingSignup(email);",
    bindingIdx
  );
  assert.ok(purposeIdx > 0 && pendingReadIdx > 0, "binding reads the pending row");
  assert.ok(
    purposeIdx < pendingReadIdx && pendingReadIdx < claimIdx,
    "the pending read is inside the signup-purpose gate, before the claim"
  );
});

// --- Missing / invalid password never burns the code -------------------
test("R3-H1 full: a missing password is rejected without consuming the code", () => {
  const route = read(VERIFY_OTP);
  const claimIdx = route.indexOf("const claimed = await consumeOtp(row.id);");
  const missingIdx = route.indexOf(
    "return jsonError(SIGNUP_PASSWORD_REQUIRED, 400);"
  );
  assert.ok(missingIdx > 0, "missing password has its own error");
  assert.ok(missingIdx < claimIdx, "the code is NOT consumed on a missing password");
  assert.ok(
    route.includes("go back to the sign-up form and enter the password you chose"),
    "the error tells the user to go back and re-enter their password"
  );
  // The same code still works after that: nothing between the
  // missing-password exit and the claim deletes the pending row.
  const bindingBlock = route.slice(
    route.indexOf("let signupPasswordHash"),
    claimIdx
  );
  assert.ok(!bindingBlock.includes("deletePendingSignup"), "no row is deleted either");
});

test("R3-H1 full: an invalid password is rejected without consuming the code", () => {
  const route = read(VERIFY_OTP);
  const claimIdx = route.indexOf("const claimed = await consumeOtp(row.id);");
  const invalidIdx = route.indexOf("return jsonError(PASSWORD_REQUIREMENTS, 400);");
  assert.ok(invalidIdx > 0, "invalid password has its own error");
  assert.ok(invalidIdx < claimIdx, "the code is NOT consumed on an invalid password");
  const bindingBlock = route.slice(
    route.indexOf("let signupPasswordHash"),
    claimIdx
  );
  assert.ok(
    bindingBlock.includes("if (!isValidPassword(suppliedPassword))"),
    "the supplied password must pass the same policy signup enforces"
  );
});

// --- A pending row that appears after the binding check fails closed ---
test("R3-H1 full: a pending row that raced in after the binding check cannot complete", () => {
  const route = read(VERIFY_OTP);
  // The branch re-reads the pending row after the claim; the guard
  // sits between that re-read and any account write.
  const branchPendingIdx = route.lastIndexOf(
    "const pending = await getPendingSignup(email);"
  );
  const guardIdx = route.indexOf("if (!signupPasswordHash) {", branchPendingIdx);
  const createIdx = route.indexOf("const created = await createEmailUser({");
  assert.ok(branchPendingIdx > 0 && guardIdx > 0 && createIdx > 0);
  assert.ok(guardIdx > branchPendingIdx, "guard follows the branch re-read");
  assert.ok(guardIdx < createIdx, "guard precedes every account write");
  const guardBlock = route.slice(guardIdx, guardIdx + 400);
  assert.ok(
    guardBlock.includes('return jsonError(GENERIC_CODE_ERROR, 400);'),
    "the raced-in row fails with the generic error, never with the row's hash"
  );
});

// --- The client sends the password for signup codes only --------------
test("R3-H1 full: the code step sends the password for signup codes only", () => {
  const page = read("src/app/auth/email/page.tsx");
  const verifyIdx = page.indexOf('postJson("/api/auth/email/verify-otp"');
  assert.ok(verifyIdx > 0, "the code step posts to verify-otp");
  const call = page.slice(verifyIdx, verifyIdx + 1000);
  assert.ok(
    call.includes('...(otpPurpose === "signup" && password ? { password } : {}),'),
    "the verify payload carries the password only for signup codes with a password in state"
  );
  // No visible UI addition: the code step gains no password field —
  // the only password inputs are the two form ones (sign-in, sign-up).
  const passwordInputs = page.match(/type="password"/g) || [];
  assert.equal(passwordInputs.length, 2, "no password field is added to the code step");
});

// --- Sign-in and 2FA OTPs are unaffected --------------------------------
test("R3-H1 full: sign-in codes need no password and 2FA codes are untouched", () => {
  const route = read(VERIFY_OTP);
  // The only password validation in the route sits inside the
  // signup-gated binding block, before the claim.
  const validations = route.match(/isValidPassword\(suppliedPassword\)/g) || [];
  assert.equal(validations.length, 1, "exactly one password check, in the binding block");
  const bindingStart = route.indexOf("let signupPasswordHash");
  const claimIdx = route.indexOf("const claimed = await consumeOtp(row.id);");
  assert.ok(
    route.indexOf("isValidPassword(suppliedPassword)") > bindingStart &&
      route.indexOf("isValidPassword(suppliedPassword)") < claimIdx,
    "the check is inside the binding block, not on the sign-in path"
  );
  // The sign-in branch (purpose !== signup) only touches last sign-in.
  // (lastIndexOf: the legacy branch inside the signup block shares the
  // same shape but also stamps email_verified — the outer branch does not.)
  const signinBranchIdx = route.lastIndexOf("  } else if (user) {");
  assert.ok(signinBranchIdx > 0, "the sign-in branch exists");
  const signinBranch = route.slice(signinBranchIdx, signinBranchIdx + 150);
  assert.ok(signinBranch.includes("last_sign_in_at"), "sign-in only stamps last sign-in");
  assert.ok(!signinBranch.includes("email_verified"), "sign-in never verifies an email");
  assert.ok(!signinBranch.includes("password"), "sign-in never touches a password");
  // 2FA email codes never go through this binding at all.
  const sendCode = read("src/app/api/auth/2fa/send-code/route.ts");
  assert.ok(sendCode.includes('issueOtpCode(email, "2fa")'), "2FA codes still issue as 2fa");
  assert.ok(!sendCode.includes("signupPasswordHash"), "2FA send-code has no binding");
  const twoFaVerify = read("src/app/api/auth/2fa/verify/route.ts");
  assert.ok(!twoFaVerify.includes("signupPasswordHash"), "2FA verify has no binding");
});

// --- Resend after the 24h row expires still works -----------------------
test("R3-H1 full: an expired pending row stops blocking a fresh sign-up", () => {
  const store = read("src/lib/auth-store.ts");
  const getFn = store.slice(store.indexOf("export async function getPendingSignup"));
  assert.ok(
    getFn.includes("new Date(row.expires_at).getTime() < Date.now()"),
    "getPendingSignup checks expiry on access"
  );
  const expiryBlock = getFn.slice(getFn.indexOf("new Date(row.expires_at)"));
  assert.ok(expiryBlock.includes("await deletePendingSignup(email);"), "expired rows are deleted");
  assert.ok(expiryBlock.includes("return null;"), "an expired row reads as no row");
  // The exists refusal goes through that read, so an expired row
  // never blocks a fresh sign-up (and a fresh sign-up mails again).
  const storeFn = store.slice(store.indexOf("export async function storePendingSignup"));
  assert.ok(
    storeFn.includes("const existing = await getPendingSignup(args.email);"),
    "the exists check reads through getPendingSignup"
  );
  const signup = read("src/app/api/auth/email/signup/route.ts");
  assert.ok(
    signup.indexOf("storePendingSignup") <
      signup.indexOf('issueOtpCode(email, "signup")'),
    "a freshly stored row still mails its code"
  );
});

// --- No-break: session / 2FA behaviour in verify-otp is unchanged ------
test("R3-H1 full no-break: verify-otp still rotates, steps up 2FA, clears pending", () => {
  const route = read(VERIFY_OTP);
  assert.ok(route.includes("incrementSessionVersion(finalUser.id)"), "session still rotates");
  assert.ok(route.includes("setPending2fa("), "2FA users still get the step-up cookie");
  assert.ok(route.includes("issueSession("), "non-2FA users still get a session");
  assert.ok(route.includes("clearPending2fa("), "a fresh sign-in still clears stale pending 2FA");
  assert.ok(
    route.includes('if (user?.password_hash)'),
    "a pending row still never overwrites an existing password"
  );
});

// --- Runtime model: the attack sequence through the pinned rule ---------
// The real route is DB-backed (no service-role key in the sandbox),
// so this model re-implements ONLY the rule the mirrors above pin —
// a valid code + a pending row completes with the code-enterer's
// password, never the row's — and runs the R3-H1 attack through it.
// If the rule changes, the source mirrors fail first.

const hashOf = (password) => `scrypt$${password}`; // stand-in for scrypt

function isValidPasswordModel(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 128 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

// Mirrors verify-otp's signup path: code first, then the binding,
// then the claim. Returns the created account, or the rejection.
function modelVerifySignupOtp({ pending, otpValid, suppliedPassword, existingUser }) {
  if (!otpValid) return { ok: false, error: "generic", codeConsumed: false };
  if (pending) {
    if (existingUser?.password_hash) {
      return { ok: false, error: "generic", codeConsumed: false };
    }
    if (typeof suppliedPassword !== "string" || suppliedPassword.length === 0) {
      return { ok: false, error: "password-required", codeConsumed: false };
    }
    if (!isValidPasswordModel(suppliedPassword)) {
      return { ok: false, error: "password-requirements", codeConsumed: false };
    }
    return {
      ok: true,
      codeConsumed: true,
      account: { password_hash: hashOf(suppliedPassword), name: pending.name },
    };
  }
  if (existingUser) return { ok: true, codeConsumed: true, account: existingUser };
  return { ok: false, error: "generic", codeConsumed: false };
}

test("R3-H1 full attack model: the attacker's code completes with the VICTIM's password", () => {
  // 1. Attacker squats the victim's email with the attacker's password.
  const attackerRow = {
    email: "victim@example.com",
    name: "Attacker",
    password_hash: hashOf("AttackerPass1"),
  };
  // 2. The code is mailed to the victim's inbox; the victim enters
  // it expecting their own sign-up, with their own password.
  const result = modelVerifySignupOtp({
    pending: attackerRow,
    otpValid: true,
    suppliedPassword: "VictimPass1",
    existingUser: null,
  });
  assert.equal(result.ok, true, "the victim's own sign-up still completes");
  assert.equal(result.codeConsumed, true, "the code is consumed on success");
  assert.equal(
    result.account.password_hash,
    hashOf("VictimPass1"),
    "the account password is the victim's, not the row's"
  );
  assert.notEqual(
    result.account.password_hash,
    attackerRow.password_hash,
    "the attacker's planted hash is never used"
  );
  // The attacker cannot sign in with the password they planted.
  assert.notEqual(result.account.password_hash, hashOf("AttackerPass1"));
});

test("R3-H1 full attack model: Google-only claim uses the code-enterer's password", () => {
  const attackerRow = {
    email: "victim@example.com",
    name: "Attacker",
    password_hash: hashOf("AttackerPass1"),
  };
  const googleOnlyUser = {
    email: "victim@example.com",
    name: "Victim",
    password_hash: null,
  };
  const result = modelVerifySignupOtp({
    pending: attackerRow,
    otpValid: true,
    suppliedPassword: "VictimPass1",
    existingUser: googleOnlyUser,
  });
  assert.equal(result.ok, true, "the claim still completes");
  assert.equal(
    result.account.password_hash,
    hashOf("VictimPass1"),
    "the Google-only account is claimed with the victim's password"
  );
});

test("R3-H1 full attack model: no password, no account — and the code survives", () => {
  // Deep link / refresh: the code step has no password in state.
  const attackerRow = {
    email: "victim@example.com",
    name: "Attacker",
    password_hash: hashOf("AttackerPass1"),
  };
  const result = modelVerifySignupOtp({
    pending: attackerRow,
    otpValid: true,
    suppliedPassword: undefined,
    existingUser: null,
  });
  assert.equal(result.ok, false, "nothing is created without the code-enterer's password");
  assert.equal(result.error, "password-required", "the error names the missing password");
  assert.equal(result.codeConsumed, false, "the code survives for the retry with a password");
  assert.equal(result.account, undefined, "no account row is produced");
});

test("R3-H1 full attack model: legitimate sign-up still works end to end", () => {
  const ownRow = {
    email: "user@example.com",
    name: "User",
    password_hash: hashOf("UserPass1"),
  };
  const result = modelVerifySignupOtp({
    pending: ownRow,
    otpValid: true,
    suppliedPassword: "UserPass1",
    existingUser: null,
  });
  assert.equal(result.ok, true, "the owner's own sign-up completes");
  assert.equal(result.account.password_hash, hashOf("UserPass1"));
});
