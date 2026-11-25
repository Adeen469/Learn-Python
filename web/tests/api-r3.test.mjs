// Round-3 non-auth API fixes (api-r3). Static checks over the
// routes + lib (the repo's test style — no TS import needed) plus
// small behavioural mirrors of the pure logic. Every test pins the
// old working behaviour AND the new secure behaviour.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(web, p), "utf8");

// ---------------------------------------------------------------------------
// Phase 3: the shared handler wrapper
// ---------------------------------------------------------------------------

test("Phase 3: lib/api-handler.ts standardises errors, limits, bodies and pagination", () => {
  const src = read("src/lib/api-handler.ts");
  for (const name of [
    "export function jsonError",
    "export function rateLimitedResponse",
    "export function perUserRateKey",
    "export async function checkIpLimit",
    "export async function checkUserLimit",
    "export async function readJsonBody",
    "export function validateBody",
    "export function parsePagination",
  ]) {
    assert.ok(src.includes(name), `api-handler must export ${name}`);
  }
  // Uniform 429 with Retry-After, same message as before.
  assert.ok(src.includes("Too many requests — please slow down and retry shortly."));
  assert.ok(src.includes('"Retry-After"'));
  // Body ceiling is checked BEFORE parsing.
  assert.ok(src.includes('req.headers.get("content-length")'));
  assert.ok(src.includes("status: 413") || src.includes("413"));
  // zod validation answers 400 with the issues (caller's own input).
  assert.ok(src.includes("safeParse"));
  assert.ok(src.includes("parsed.error.issues"));
});

test("R3-L11: per-user rate keys are a hash of the lowercased email, never the address", () => {
  const src = read("src/lib/api-handler.ts");
  assert.ok(src.includes('createHash("sha256")'), "the key must be a sha256 hash");
  assert.ok(src.includes(".toLowerCase()"), "the email must be lowercased before hashing");
  assert.ok(src.includes(".slice(0, 32)"), "the key must be the first 32 hex chars, like the AI quota");
  // Mirror of perUserRateKey: same input (any case) -> same key,
  // different input -> different key, no plaintext in the key.
  const key = (prefix, email) =>
    prefix +
    createHash("sha256").update(email.toLowerCase(), "utf8").digest("hex").slice(0, 32);
  assert.equal(key("github-read:", "User@Example.com"), key("github-read:", "user@example.com"));
  assert.notEqual(key("github-read:", "a@example.com"), key("github-read:", "b@example.com"));
  assert.ok(!key("github-read:", "user@example.com").includes("@"));
  assert.ok(!key("github-read:", "user@example.com").includes("user"));
  // Every route with a per-user bucket uses the helper now.
  for (const rel of [
    "src/app/api/github/commit/route.ts",
    "src/app/api/github/repos/route.ts",
    "src/app/api/github/repo-tree/route.ts",
    "src/app/api/github/repo-file/route.ts",
    "src/app/api/github/token/route.ts",
    "src/app/api/github/token/status/route.ts",
    "src/app/api/github/delete-repo/route.ts",
    "src/app/api/byok/save/route.ts",
    "src/app/api/byok/list/route.ts",
    "src/app/api/byok/delete/route.ts",
  ]) {
    assert.ok(read(rel).includes("checkUserLimit"), `${rel} must limit per user through the shared helper`);
    assert.ok(!read(rel).includes(":${email}") && !read(rel).includes(":{user.email}"), `${rel} must not key a limiter by raw email`);
  }
});

// ---------------------------------------------------------------------------
// R3-M2: delete-repo step-up
// ---------------------------------------------------------------------------

test("R3-M2: delete-repo requires an emailed code step-up before deleting", () => {
  const src = read("src/app/api/github/delete-repo/route.ts");
  // The schema carries the code, and it is REQUIRED.
  assert.ok(src.includes("code: z.string().min(1).max(10)"), "the body schema must require the code");
  assert.ok(!src.includes("password: z.string()"), "the body schema must not carry a password");
  // The code is a "delete-repo" OTP: looked up, decided, consumed.
  assert.ok(src.includes('getLatestOtp(email, "delete-repo")'), "the code must be looked up by purpose");
  assert.ok(src.includes("decideOtp("), "the code must be checked through decideOtp");
  assert.ok(src.includes("consumeOtp(row.id)"), "a right code must be consumed before deleting");
  assert.ok(src.includes("bumpOtpAttempts(row.id)"), "a wrong code must bump attempts");
  // Every failure answers the same generic 400 — a wrong code
  // cannot be told apart from an expired one.
  assert.ok(src.includes('const GENERIC_CODE_ERROR = "The code is incorrect or has expired."'), "failures must share one generic message");
  // No password / TOTP step-up anywhere in the route.
  assert.ok(!src.includes("verifyPassword"), "the route must not check a password");
  assert.ok(!src.includes("verifyTotpCodeWithStep"), "the route must not check a TOTP code");
  assert.ok(!src.includes("decryptUserTotpSecret"), "the route must not read a TOTP secret");
  assert.ok(!src.includes("findBackupCode"), "the route must not take backup codes");
  // The gate runs BEFORE the owner check + delete.
  assert.ok(src.indexOf('getLatestOtp(email, "delete-repo")') < src.indexOf("await deleteUserRepo("), "the step-up must run before the delete");
  // Old behaviour still holds: slugs validated, owner checked, the
  // two user-actionable 403s kept, body-size guard before parsing.
  assert.ok(src.includes("isValidGithubSlug"), "owner/repo must still be validated");
  assert.ok(src.includes("assertGithubOwnerAllowed(token, parsed.data.owner, parsed.data.repo)"), "the owner check must still run");
  assert.ok(src.includes("deleteUserRepo"), "the delete must still go through the lib");
  assert.ok(src.includes("Resource not accessible by personal access token"), "the missing-scope hint must stay");
  assert.ok(src.includes("Only the repo owner can delete it"), "the collaborator hint must stay");
  assert.ok(src.includes("oversizedBodyResponse"), "the body-size guard must stay");
  assert.ok(src.indexOf("oversizedBodyResponse") < src.indexOf("await req.json()"), "the size check must run before parsing");
});

test("R3-M2 send-code: the delete code goes to the session user's verified email", () => {
  const send = read("src/app/api/github/delete-repo/send-code/route.ts");
  assert.ok(send.includes("getSessionUser(req, prereqs.secret)"), "the send route must need a session");
  assert.ok(send.includes('issueOtpCode(sessionUser.email, "delete-repo")'), "the code must be a delete-repo OTP");
  assert.ok(send.includes("!user.email_verified"), "the code must only go to a verified email");
  assert.ok(send.includes('rateLimit(req, "github-delete-send-code", 10, 60_000'), "the send route must be rate-limited");
  // The answer names the inbox — MASKED ("bi•••@gmail.com"), never
  // the full address — so the user knows where to look for the code.
  assert.ok(send.includes("email: maskEmail(sessionUser.email)"), "the send route must answer with the masked address");
  assert.ok(send.includes("function maskEmail"), "the masking must live in the send route");
});

test("R3-M2 client: the GitHub page collects the emailed code in the EXISTING delete dialog", () => {
  const page = read("src/app/github/page.tsx");
  assert.ok(page.includes("/api/github/delete-repo/send-code"), "the dialog must send the code to the user's email");
  assert.ok(page.includes('import CodeSlots from "@/components/CodeSlots"'), "the dialog must use CodeSlots");
  assert.ok(page.includes("<CodeSlots"), "the dialog must render code boxes");
  assert.ok(page.includes("code: codeToUse"), "the delete request must send the email code");
  // The Delete button stays armed only when the exact name is typed
  // and all 6 code digits are in.
  assert.ok(page.includes("deleteConfirmText.trim() !== deleteTarget.full_name"), "Delete must need the exact name");
  assert.ok(page.includes("deleteCode.length !== 6"), "Delete must need all 6 digits");
  // No password / authenticator field anywhere in the dialog.
  assert.ok(!page.includes('id="delete-repo-password"'), "the dialog must not have a password field");
  assert.ok(!page.includes('id="delete-repo-totp"'), "the dialog must not have an authenticator field");
  // No NEW dialog/page/element: the code boxes live inside the
  // existing deleteTarget dialog block.
  const dialog = page.slice(page.indexOf("{deleteTarget && ("), page.indexOf("{deleteTarget && (") + 8000);
  assert.ok(dialog.includes("<CodeSlots"), "the code boxes must be inside the existing dialog");
});

test("R3-L12: delete-repo has a per-user rate bucket after token resolution", () => {
  const src = read("src/app/api/github/delete-repo/route.ts");
  assert.ok(src.includes('checkUserLimit(email, "github-delete"'), "delete-repo must limit per user");
  assert.ok(
    src.indexOf("resolveSessionGithubToken") < src.indexOf('checkUserLimit(email, "github-delete"'),
    "the per-user bucket must come after token resolution"
  );
});

// ---------------------------------------------------------------------------
// R3-L10 / R3-L11: GitHub token store
// ---------------------------------------------------------------------------

test("R3-L10: github/token DELETE checks the delete result and 503s on failure", () => {
  const src = read("src/app/api/github/token/route.ts");
  assert.ok(src.includes("const deleted = await deleteGithubToken"), "DELETE must capture the delete result");
  assert.ok(src.includes("if (!deleted)"), "DELETE must check the result");
  assert.ok(src.includes("Could not delete the token"), "a failed delete must not claim success");
  const del = src.slice(src.indexOf("export async function DELETE"));
  assert.ok(del.includes("status: 503"), "a failed delete must answer 503");
  // POST still checks its save result (old behaviour).
  assert.ok(src.includes("const saved = await saveGithubToken"), "POST must still check the save result");
});

test("R3-L11: the GitHub token store normalises the email at every call site", () => {
  const src = read("src/lib/github-token.ts");
  const hits = (src.match(/normalizeEmail\(email\)/g) || []).length;
  // Five sites: save, get, expires-at, delete, audit. (Was six —
  // the sixth was the legacy re-encrypt write in getGithubToken,
  // removed with the SESSION_SECRET read fallback: there is no
  // legacy row left to re-encrypt.)
  assert.ok(hits >= 5, `expected normalizeEmail at every token call site, got ${hits}`);
  for (const fn of ["saveGithubToken", "getGithubToken", "getGithubTokenExpiresAt", "deleteGithubToken"]) {
    const start = src.indexOf(`export async function ${fn}`);
    const end = src.indexOf("export async function", start + 10);
    const body = src.slice(start, end === -1 ? undefined : end);
    assert.ok(body.includes("normalizeEmail(email)"), `${fn} must normalise the email`);
  }
  // The orphaned-rows caveat must be recorded in code, not just the report.
  assert.ok(src.includes("orphan"), "the code must note raw-email rows stay orphaned");
});

// ---------------------------------------------------------------------------
// R3-L13: /api/lessons pagination
// ---------------------------------------------------------------------------

test("R3-L13: /api/lessons paginates with limit/offset and returns total + the page", () => {
  const src = read("src/app/api/lessons/route.ts");
  assert.ok(src.includes("parsePagination"), "the route must parse limit/offset");
  assert.ok(src.includes("lessons.slice(offset, offset + limit)"), "the route must return only the page");
  assert.ok(src.includes("total"), "the body must carry the total");
  assert.ok(src.includes("limit"), "the body must carry the limit");
  assert.ok(src.includes("offset"), "the body must carry the offset");
  // Old behaviour: an empty list is still a 503, not seed.
  assert.ok(src.includes("status: 503"), "an empty lesson list must still answer 503");
  assert.ok(!src.includes("lessons, source"), "the public body must still not carry source");
  // The handler defaults: limit 100, offset 0; out-of-range values
  // clamp (limit 9999 -> 500, offset -5 -> 0) and bad input falls
  // back instead of 400ing (existing clients keep working).
  // Mirror of parsePagination in src/lib/api-handler.ts.
  const parse = (q) => {
    const rawLimit = Number(q.limit);
    const rawOffset = Number(q.offset);
    return {
      limit: Number.isFinite(rawLimit)
        ? Math.min(500, Math.max(1, Math.floor(rawLimit)))
        : 100,
      offset: Number.isFinite(rawOffset)
        ? Math.max(0, Math.floor(rawOffset))
        : 0,
    };
  };
  assert.deepEqual(parse({}), { limit: 100, offset: 0 });
  assert.deepEqual(parse({ limit: "50", offset: "10" }), { limit: 50, offset: 10 });
  assert.deepEqual(parse({ limit: "9999" }), { limit: 500, offset: 0 });
  assert.deepEqual(parse({ limit: "abc", offset: "-5" }), { limit: 100, offset: 0 });
  assert.deepEqual(parse({ limit: "0" }), { limit: 1, offset: 0 });
});

// ---------------------------------------------------------------------------
// R3-L14 / R3-L15 / Phase 3 AI budget
// ---------------------------------------------------------------------------

test("R3-L14: the AI daily quota is charged only once the request is about to reach askAi", () => {
  const src = read("src/app/api/ai/route.ts");
  const quotaAt = src.indexOf("checkRateLimit(userKey,");
  // Still after body validation (R2-M12 holds).
  assert.ok(src.indexOf("validateAiRequest(rawBody)") < quotaAt, "the quota must still be after validation");
  // Now also after the BYOK lookup and the config check.
  assert.ok(src.indexOf("No saved key for this provider") < quotaAt, "a refused BYOK request must not burn quota");
  assert.ok(src.indexOf("hasAiConfig(config)") < quotaAt, "an unconfigured-AI request must not burn quota");
  assert.ok(src.indexOf("const result = await askAi(") - quotaAt < 3000, "the quota must sit right before askAi");
  // The key is still a hash, never the email.
  assert.ok(src.includes('perUserRateKey("ai-user:", user.email)'), "the quota key must be hashed");
});

test("R3-L15: repo-file streams with X-Content-Type-Options: nosniff", () => {
  const src = read("src/app/api/github/repo-file/route.ts");
  assert.ok(src.includes('"X-Content-Type-Options": "nosniff"'), "the streamed response must carry nosniff");
  assert.ok(src.includes('"Content-Type": "text/plain; charset=utf-8"'), "the content type must stay text/plain");
});

test("Phase 3: the AI fallback chain has one ~50s shared deadline", async () => {
  const lib = read("src/lib/ai.ts");
  assert.ok(lib.includes("AI_SHARED_BUDGET_MS = 50_000"), "the shared budget must be ~50s");
  assert.ok(lib.includes("AbortSignal.timeout(AI_SHARED_BUDGET_MS)"), "askAi must mint the deadline from request start");
  // Every leg gets the signal — 15 call sites (6 BYOK + 6 picked + 3
  // default: Gemini → Groq → OpenRouter).
  const legs = (lib.match(/signal: budget/g) || []).length;
  assert.equal(legs, 15, `expected all 15 legs to carry the shared signal, got ${legs}`);
  // The per-leg timeouts still exist (the shared deadline is the
  // backstop, not a replacement).
  for (const t of ["GEMINI_TIMEOUT_MS", "GROQ_TIMEOUT_MS", "ANTHROPIC_TIMEOUT_MS", "OPENAI_TIMEOUT_MS", "CUSTOM_TIMEOUT_MS"]) {
    assert.ok(lib.includes(t), `the per-leg timeout ${t} must stay`);
  }
  // fetchWithTimeout combines the leg timeout with the outer signal.
  assert.ok(lib.includes("AbortSignal.any([ctrl.signal, outerSignal])"), "a leg must abort when either timeout fires");
  // The custom literal-IP transport honours the signal too.
  assert.ok(lib.includes("signal?: AbortSignal"), "postToPinnedIp must accept the signal");
  // Mirror: a leg that would run 5s is cut short by a 50ms shared
  // deadline, and a fast leg still succeeds.
  const fetchWithTimeout = async (impl, ms, outer) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    const signal = outer ? AbortSignal.any([ctrl.signal, outer]) : ctrl.signal;
    try {
      return await impl({ signal });
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };
  const slowFetch = ({ signal }) =>
    new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
      setTimeout(() => resolve({ ok: true }), 5000);
    });
  const budget = AbortSignal.timeout(50);
  assert.equal(await fetchWithTimeout(slowFetch, 5000, budget), null);
  const fastFetch = async () => ({ ok: true, status: 200 });
  assert.deepEqual(await fetchWithTimeout(fastFetch, 5000, AbortSignal.timeout(50_000)), { ok: true, status: 200 });
});

// ---------------------------------------------------------------------------
// Phase 3: batch-commit endpoint
// ---------------------------------------------------------------------------

test("Phase 3: /api/github/batch-commit commits one file per commit and reports per-file results", () => {
  const rel = "src/app/api/github/batch-commit/route.ts";
  assert.ok(existsSync(join(web, rel)), "the batch-commit route must exist");
  const src = read(rel);
  // zod-validated: owner/repo/message + 1–20 files, each with a
  // safe path and bounded content.
  assert.ok(src.includes("batchCommitSchema"), "the body must be zod-validated");
  assert.ok(src.includes("z.array(batchFileSchema).min(1).max(20)"), "1–20 files per request");
  assert.ok(src.includes("Duplicate file paths"), "duplicate paths must be rejected");
  // Session + stored PAT + owner check, like the commit route.
  assert.ok(src.includes("resolveSessionGithubToken"), "the token must come from the session");
  assert.ok(src.includes("assertGithubOwnerAllowed"), "the owner check must run");
  // Per-IP + per-user rate buckets.
  assert.ok(src.includes("github-write:"), "the IP bucket must be github-write");
  assert.ok(src.includes('checkUserLimit(email, "github-write"'), "the per-user bucket must exist");
  // One commit per file inside, sequential; every file reported.
  assert.ok(src.includes("for (const file of parsed.data.files)"), "files must commit one at a time");
  assert.ok(src.includes("commitFileToRepo(token, {"), "each file must commit through the same lib call as the single-file route");
  assert.ok(src.includes("results.push({ path: file.path, ok: true"), "a success must be reported per file");
  assert.ok(src.includes("results.push({ path: file.path, ok: false"), "a failure must be reported per file");
  assert.ok(src.includes("committed"), "the response must carry the committed count");
  assert.ok(src.includes("failed"), "the response must carry the failed count");
  // Body capped before parsing, like the commit route.
  assert.ok(src.includes("oversizedBodyResponse"), "the body must be capped before parsing");
  assert.ok(src.includes("5 * 1024 * 1024"), "the cap must be 5 MB like the commit route");
  // The editor IS wired to use it (r3b): one batch-commit request
  // per push, chunked at 20 files / ~4.5 MB — see github.test.mjs.
  assert.ok(read("src/app/editor/page.tsx").includes("/api/github/batch-commit"), "the editor must push through batch-commit");
});

// ---------------------------------------------------------------------------
// Phase 3: the handler is applied to every non-auth route
// ---------------------------------------------------------------------------

test("Phase 3: every non-auth route uses the shared handler (and auth routes are untouched)", () => {
  // Rate limiting through the handler on every route that has a limit.
  for (const rel of [
    "src/app/api/ai/route.ts",
    "src/app/api/byok/save/route.ts",
    "src/app/api/byok/list/route.ts",
    "src/app/api/byok/delete/route.ts",
    "src/app/api/github/commit/route.ts",
    "src/app/api/github/repos/route.ts",
    "src/app/api/github/repo-tree/route.ts",
    "src/app/api/github/repo-file/route.ts",
    "src/app/api/github/token/route.ts",
    "src/app/api/github/token/status/route.ts",
    "src/app/api/github/delete-repo/route.ts",
    "src/app/api/github/batch-commit/route.ts",
    "src/app/api/lessons/route.ts",
    "src/app/api/video/[lessonId]/route.ts",
    "src/app/api/pypi/route.ts",
  ]) {
    const src = read(rel);
    assert.ok(
      src.includes("checkIpLimit") || src.includes("checkUserLimit") || src.includes("checkRateLimit"),
      `${rel} must rate-limit through the shared handler or the existing limiter`
    );
  }
  // No non-auth route imports the auth-only helpers.
  for (const rel of [
    "src/app/api/ai/route.ts",
    "src/app/api/github/commit/route.ts",
    "src/app/api/lessons/route.ts",
  ]) {
    assert.ok(!read(rel).includes("readJsonBody(req"), `${rel} must not use the auth readJsonBody`);
  }
  // api/auth/** is untouched by this track: no api-handler import there.
  assert.ok(!read("src/app/api/auth/2fa/disable/route.ts").includes("api-handler"), "auth routes must not import the new handler");
});

// ---------------------------------------------------------------------------
// R3-L16: nonce CSP on all document routes
// ---------------------------------------------------------------------------

test("R3-L16: the middleware mints the nonce CSP on all document routes", () => {
  const mw = read("src/middleware.ts");
  // The matcher covers API routes plus every other document route.
  assert.ok(mw.includes('"/api/:path*"'), "API routes must still match");
  assert.ok(mw.includes("/((?!api|_next/static|_next/image|favicon.ico|"), "the matcher must cover all document routes");
  // Static files and /_next/* are excluded (not documents).
  assert.ok(mw.includes("_next/static"), "static chunks must be excluded from the matcher");
  // The nonce mechanism is unchanged: one nonce per request, handed
  // to Next + layout, enforced on the response.
  assert.ok(mw.includes("crypto.randomUUID()"), "one random nonce per document request");
  assert.ok(mw.includes("buildCspWithNonce(nonce)"), "the nonce CSP must be built per request");
  assert.ok(mw.includes('requestHeaders.set("x-nonce", nonce)'), "layout must still get the nonce");
  assert.ok(mw.includes('res.headers.set("Content-Security-Policy", nonceCsp)'), "the response must enforce the nonce CSP");
  // Guests are still redirected ONLY from the protected paths —
  // the landing page and /auth/* stay public.
  for (const p of ['"/settings/:path*"', '"/editor/:path*"', '"/github/:path*"', '"/courses/:path*"', '"/learn/:path*"']) {
    assert.ok(mw.includes(p), `the protected paths must still list ${p}`);
  }
  assert.ok(mw.includes("isProtectedPath(pathname)"), "the guest redirect must check the protected paths");
  // API routes still get no nonce CSP (no documents there).
  const apiBranch = mw.slice(mw.indexOf('startsWith("/api/")'));
  assert.ok(!apiBranch.slice(0, 400).includes("randomUUID"), "API routes must not mint a nonce");
});

test("N1: the fail-closed set is scoped — AI + writes fail closed, reads stay fail-open", () => {
  // Fail-closed: the AI route (both limits) and every write route.
  // A Redis blip answers 503 there instead of letting one client
  // get N× the limit across instances.
  const aiRoute = read("src/app/api/ai/route.ts");
  assert.equal((aiRoute.match(/\{ failClosed: true \}/g) || []).length, 2, "the AI route must fail close both limits");
  for (const rel of [
    "src/app/api/github/batch-commit/route.ts",
    "src/app/api/github/commit/route.ts",
    "src/app/api/github/delete-repo/route.ts",
    "src/app/api/github/token/route.ts",
    "src/app/api/byok/save/route.ts",
    "src/app/api/byok/delete/route.ts",
  ]) {
    const src = read(rel);
    assert.ok(src.includes("{ failClosed: true }"), `${rel} must fail closed on its limit`);
    assert.ok(src.includes("temporarily unavailable."), `${rel} must answer 503 when the limiter is down`);
  }
  // The helpers pass the opt through, and default to fail-open —
  // so every route that does NOT pass it keeps the old behaviour.
  const handler = read("src/lib/api-handler.ts");
  assert.ok(handler.includes("opts: { failClosed?: boolean }"), "the helpers must accept the failClosed opt");
  assert.ok(handler.includes("failClosed"), "the helpers must pass the opt to checkRateLimit");
  // Fail-open: the read-only routes pass nothing — a Redis blip
  // must not break opening a repo, listing keys, or loading a lesson.
  for (const rel of [
    "src/app/api/github/repo-file/route.ts",
    "src/app/api/github/repo-tree/route.ts",
    "src/app/api/github/token/status/route.ts",
    "src/app/api/byok/list/route.ts",
    "src/app/api/lessons/route.ts",
    "src/app/api/pypi/route.ts",
    "src/app/api/video/[lessonId]/route.ts",
  ]) {
    const src = read(rel);
    assert.ok(!src.includes("failClosed"), `${rel} must stay fail-open (read-only)`);
  }
  const reposRoute = read("src/app/api/github/repos/route.ts");
  assert.ok(reposRoute.includes('rateLimited(req, "github-write", true)'), "repo creation must fail closed");
  assert.ok(reposRoute.includes('rateLimited(req, "github-read")'), "repo listing must stay fail-open");
});
