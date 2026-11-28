import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const web = join(repoRoot, "web");

const read = (p) => readFileSync(join(web, p), "utf8");

test("static export gets a meta-CSP fallback (R2-M15)", () => {
  const config = read("next.config.ts");
  // Next ignores headers() for output: "export", so the desktop /
  // static build shipped ZERO security headers. The same policy is
  // exported for the layout's <meta> tag.
  assert.ok(config.includes("export const cspMeta"));
  const layout = read("src/app/layout.tsx");
  assert.ok(
    layout.includes('httpEquiv="Content-Security-Policy"'),
    "layout must emit the meta CSP tag",
  );
  assert.ok(layout.includes("content={cspMeta}"));
  assert.ok(
    layout.includes('from "../../next.config"'),
    "meta CSP must come from next.config, not a duplicated string",
  );
  // The meta tag sits first in <head>, before the theme script it
  // also governs.
  const head = layout.indexOf("<head>");
  assert.ok(
    layout.indexOf("httpEquiv") < layout.indexOf("<script"),
    "meta CSP must precede the inline theme script",
  );
  assert.ok(head > -1 && head < layout.indexOf("httpEquiv"));
});

test("meta CSP carries the full policy except frame-ancestors (R2-M15 gap)", () => {
  const config = read("next.config.ts");
  // frame-ancestors cannot be expressed in a meta tag (browsers
  // ignore it there) and there is no meta equivalent of
  // X-Frame-Options — the export build still has NO framing
  // protection. The gap must be stated in the code, not just the
  // report, and the meta policy must be the header policy minus
  // exactly that one directive.
  assert.ok(config.includes("frame-ancestors"));
  const meta = config.slice(config.indexOf("export const cspMeta"));
  assert.ok(meta.includes('!d.startsWith("frame-ancestors")'));
  assert.ok(
    config.includes("NO framing") ||
      config.includes("no framing") ||
      config.includes("NO framing\n"),
    "the framing gap must be named in next.config.ts",
  );
  // The export path itself is NOT removed.
  assert.ok(config.includes('LP_DESKTOP_EXPORT === "1"'));
  assert.ok(config.includes('"export"'));
});

test("middleware mints a per-request nonce and hands it to Next + layout (R2-L17)", () => {
  const mw = read("src/middleware.ts");
  // One random nonce per authed page request.
  assert.ok(mw.includes("crypto.randomUUID()"));
  assert.ok(mw.includes("buildCspWithNonce(nonce)"));
  // Next reads the nonce from the CSP *request* header and puts it
  // on its own inline scripts (RSC streaming payloads).
  assert.ok(mw.includes('requestHeaders.set("content-security-policy"'));
  // layout.tsx reads `x-nonce` for the theme script.
  assert.ok(mw.includes('requestHeaders.set("x-nonce", nonce)'));
  // The response header makes the browser enforce the nonce policy.
  assert.ok(mw.includes('res.headers.set("Content-Security-Policy", nonceCsp)'));
  // The Origin check and the matcher are untouched by the nonce work.
  assert.ok(mw.includes("isAllowedApiOrigin"));
  // No guest bounce lives in the middleware any more (the gated
  // pages render their own sign-in gate screen instead, and courses
  // has a free preview with a per-video sign-in prompt) — the nonce
  // must still be minted for every document route, authed or not.
  assert.ok(!mw.includes("isProtectedPath"), "no guest redirect may remain in the middleware");
  assert.ok(mw.includes('"/api/:path*"'));
  // API routes get no nonce CSP (no documents there).
  const apiBranch = mw.slice(mw.indexOf('startsWith("/api/")'));
  assert.ok(!apiBranch.slice(0, 400).includes("randomUUID"));
});

test("nonce CSP drops unsafe-inline from script-src only (R2-L17)", () => {
  const config = read("next.config.ts");
  assert.ok(config.includes("export function buildCspWithNonce"));
  // The nonce replaces 'unsafe-inline' in script-src, and nowhere else.
  assert.ok(config.includes("d.replace(\"'unsafe-inline'\""));
  assert.ok(config.includes("`'nonce-${nonce}'`"));
  // Everything else the app needs stays: wasm for Pyodide, jsDelivr
  // for Monaco, and style-src keeps 'unsafe-inline' (inline
  // style={{...}} attributes cannot carry a nonce).
  assert.ok(config.includes("'wasm-unsafe-eval'"));
  assert.ok(config.includes("https://cdn.jsdelivr.net"));
  assert.ok(
    config.includes("function allowDevelopmentRefreshEval(policy: string)") &&
      config.includes('process.env.NODE_ENV === "development"'),
    "unsafe-eval must be limited to the development refresh runtime"
  );
  assert.ok(
    config.includes('policy.replace("script-src ", "script-src \'unsafe-eval\' ")') &&
      config.includes(": policy;") &&
      config.includes('const csp = allowDevelopmentRefreshEval(cspDirectives.join("; "));') &&
      config.includes("return allowDevelopmentRefreshEval(policy);"),
    "production must keep the nonce CSP without unsafe-eval"
  );
  const styleSrc = config.match(/"style-src[^\"]*"/)?.[0] ?? "";
  assert.ok(styleSrc.includes("'unsafe-inline'"), "style-src keeps unsafe-inline");
  // The header CSP still carries 'unsafe-inline' for the routes
  // middleware does not cover (landing, /auth/*, /offline,
  // /logic-builder, /modules) — the nonce only binds on matched pages.
  assert.ok(config.includes('"script-src \'self\' \'unsafe-inline\''));
});

test("layout puts the middleware nonce on the theme script (R2-L17)", () => {
  const layout = read("src/app/layout.tsx");
  assert.ok(layout.includes('(await headers()).get("x-nonce")'));
  // The theme script is the only dangerouslySetInnerHTML in src/;
  // it must carry the nonce when one exists.
  assert.ok(layout.includes("nonce={nonce}"));
  assert.ok(layout.includes("dangerouslySetInnerHTML"));
  // Outside a request scope (static export prerender) there is no
  // nonce — the script runs under the meta-CSP fallback instead,
  // which still carries 'unsafe-inline'. No crash, no missing tag.
  assert.ok(layout.includes("} catch {"));
  assert.ok(layout.includes("nonce = undefined;"));
});
