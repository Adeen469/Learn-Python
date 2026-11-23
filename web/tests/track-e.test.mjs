import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Track E (platform / headers / rate-limit fixes, 2026-11-22):
// grep-mirror tests for the fixes that have no pure helper to mirror
// (middleware Origin check, CSP headers, health body, Pyodide CDN
// removal, DOMPurify removal). M7 is covered in rate-limit.test.mjs,
// L10 in lessons.test.mjs, L16 in offline.test.mjs.

const webDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(webDir, rel), "utf8");

// Pure mirror of isAllowedApiOrigin in src/middleware.ts: the
// same-origin check, copied verbatim (Origin host must equal the
// request Host; absent Origin = non-browser client, allowed).
function isAllowedApiOrigin(origin, host) {
  if (!origin) return true;
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  return !!host && originHost === host;
}

test("M8: same-origin POSTs pass, cross-site POSTs fail, no-Origin passes", () => {
  assert.equal(
    isAllowedApiOrigin("https://learnpythonprogram.vercel.app", "learnpythonprogram.vercel.app"),
    true
  );
  assert.equal(isAllowedApiOrigin("http://localhost:3000", "localhost:3000"), true);
  assert.equal(isAllowedApiOrigin("https://evil.example", "learnpythonprogram.vercel.app"), false);
  assert.equal(isAllowedApiOrigin("https://learnpythonprogram.vercel.app:8443", "learnpythonprogram.vercel.app"), false);
  // Absent Origin = non-browser client (curl, the desktop app's
  // Bearer calls): allowed through.
  assert.equal(isAllowedApiOrigin(null, "learnpythonprogram.vercel.app"), true);
  assert.equal(isAllowedApiOrigin("not a url", "learnpythonprogram.vercel.app"), false);
  assert.equal(isAllowedApiOrigin("https://learnpythonprogram.vercel.app", null), false);
});

test("M8: middleware runs on /api/* and rejects cross-site state-changing calls", () => {
  const src = read("src/middleware.ts");
  assert.ok(src.includes('"/api/:path*"'), "matcher must cover /api/*");
  assert.ok(src.includes('req.headers.get("origin")'), "Origin must be checked");
  assert.ok(src.includes('req.headers.get("host")'), "Origin must be compared to the request Host");
  assert.ok(
    src.includes('new NextResponse("Forbidden", { status: 403 })'),
    "a mismatched Origin must get 403"
  );
  // Only state-changing methods are checked; GETs (incl. the
  // app-exchange GET flow and same-origin fetches) pass through.
  for (const m of ["POST", "PUT", "PATCH", "DELETE"]) {
    assert.ok(src.includes(`"${m}"`), `${m} must be checked`);
  }
  assert.ok(!src.includes('"GET"'), "GET must not be in the checked methods");
  // API routes never redirect to the landing page (the routes
  // themselves return 401 for missing/invalid sessions).
  assert.ok(src.includes('if (pathname.startsWith("/api/"))'), "API must branch before the redirect");
});

test("M19: CSP gains frame-ancestors 'none', keeps X-Frame-Options DENY", () => {
  const src = read("next.config.ts");
  assert.ok(src.includes(`"frame-ancestors 'none'"`), "frame-ancestors 'none' must be set");
  assert.ok(src.includes('key: "X-Frame-Options", value: "DENY"'), "X-Frame-Options DENY must stay");
});

test("M19: img-src keeps data: because the 2FA QR code is a data: URL", () => {
  const config = read("next.config.ts");
  assert.ok(config.includes('"img-src \'self\' data:'), "img-src must still allow data:");
  // The justification must be real, not just a comment: the 2FA
  // setup route returns a data-URL QR code rendered in an <img>.
  const setup = read("src/app/api/auth/2fa/setup/route.ts");
  assert.ok(setup.includes("QRCode.toDataURL"), "setup must mint a data-URL QR code");
  const twoFa = read("src/components/TwoFactorSettings.tsx");
  assert.ok(twoFa.includes("qrDataUrl"), "settings must read the QR data URL");
  assert.ok(twoFa.includes("<img"), "the QR code must render in an <img>");
});

test("M19: unsafe-inline stays, with the nonce follow-up spelled out", () => {
  const src = read("next.config.ts");
  assert.ok(src.includes("'unsafe-inline'"), "unsafe-inline must stay until nonces land");
  // The reason must be recorded in the file, not just the report:
  // the layout theme script needs a nonce, and layout.tsx is out
  // of this change.
  assert.ok(src.includes("layout.tsx"), "the blocker (layout theme script) must be named");
  assert.ok(src.includes("nonce"), "the nonce follow-up must be named");
});

test("M20: dompurify has no direct dep; R2-L21 pins the transitive copy to 3.4.17 via overrides", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.ok(!pkg.dependencies?.dompurify, "no direct dompurify dep may exist");
  assert.ok(!pkg.devDependencies?.dompurify, "no direct dompurify devDep may exist");
  // R2-L21: the transitive copy under monaco-editor was the
  // vulnerable 3.4.15, so the override pin is REQUIRED, not banned.
  assert.equal(pkg.overrides?.dompurify, "3.4.17", "the override must pin dompurify to 3.4.17");
  const src = read("src/lib/auth-client.ts");
  assert.ok(!src.includes("dompurify"));
  // And nothing in src imports it (verified: zero imports) — the
  // transitive copy under monaco-editor is not ours to remove.
  assert.ok(!read("src/lib/lessons.ts").includes("dompurify"));
});

test("M22: no CDN fallback remains in the Pyodide runtime sources", () => {
  const src = read("src/lib/pyodide-install.ts");
  const bases = src.match(/PYODIDE_CDN_BASES = \[([\s\S]*?)\]/);
  assert.ok(bases, "PYODIDE_CDN_BASES must exist");
  assert.ok(bases[1].includes('"/pyodide/"'), "the self-hosted base must stay");
  assert.ok(!bases[1].includes("jsdelivr"), "jsDelivr must be gone from the bases");
  assert.ok(!bases[1].includes("unpkg"), "unpkg must be gone from the bases");
  assert.ok(
    !src.includes("could not load from this site, jsDelivr"),
    "the failure message must not promise CDN fallbacks"
  );
});

test("L21: /api/health returns only { status: ok }", () => {
  const src = read("src/app/api/health/route.ts");
  assert.ok(src.includes('NextResponse.json({ status: "ok" })'), "body must be a bare ok");
  assert.ok(!src.includes("supabase"), "must not leak Supabase config state");
  assert.ok(!src.includes("lessons"), "must not leak the lesson source");
  assert.ok(!src.includes("uptime_seconds"), "must not leak uptime");
  assert.ok(!src.includes('from "@/lib/lessons"'), "must not import the lessons lib");
  assert.ok(!src.includes("await fetchLessons"), "must not call fetchLessons per probe");
});
