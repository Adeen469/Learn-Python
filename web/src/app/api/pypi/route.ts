import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidPackageName } from "@/lib/validation";

const RATE_LIMITED_RESPONSE = (retryAfterSeconds: number) =>
  NextResponse.json(
    { error: "Too many requests — please slow down and retry shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );

// L15: a PyPI home_page is attacker-controlled (any publisher can set
// it). Only an absolute https: URL may be handed to the client as a
// link — javascript:/data:/relative URLs fall back to the PyPI page.
// (ModulesPanel re-checks before rendering; this is the same 6-line
// check, kept local here because lib/validation.ts is out of scope
// for this track.)
function isSafeHttpsUrl(href: unknown): boolean {
  if (typeof href !== "string" || !href) return false;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

// L12: refuse to parse a giant upstream JSON body into memory.
const PYPI_MAX_JSON_BYTES = 1_048_576;

export async function GET(req: NextRequest) {
  const limit = await checkRateLimit(`pypi:${getClientIp(req)}`, 60, 60_000);
  if (!limit.allowed) {
    return RATE_LIMITED_RESPONSE(limit.retryAfterSeconds);
  }

  const { searchParams } = new URL(req.url);
  const pkg = searchParams.get("name")?.trim();

  if (!pkg) {
    return NextResponse.json({ error: "Missing package name" }, { status: 400 });
  }

  // Safe package name check: alphanumeric, dashes, underscores, dots.
  // Fetches ONLY https://pypi.org — no other host is ever contacted.
  if (!isValidPackageName(pkg)) {
    return NextResponse.json({ error: "Invalid package name format" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    let res: Response;
    try {
      res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`, {
        headers: { "User-Agent": "LP-Learning-Platform/1.0" },
        next: { revalidate: 3600 },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: `Package '${pkg}' was not found on PyPI.` }, { status: 404 });
      }
      return NextResponse.json({ error: `PyPI returned status ${res.status}` }, { status: res.status });
    }

    // L12: abort before parsing when the upstream body is huge — a
    // package with thousands of releases returns megabytes of JSON
    // and only data.info.* is ever read.
    const contentLength = res.headers.get("content-length");
    if (contentLength !== null && Number(contentLength) > PYPI_MAX_JSON_BYTES) {
      return NextResponse.json({ error: "PyPI response too large" }, { status: 502 });
    }

    const data: unknown = await res.json();
    // L12: validate the shape before dereferencing — a malformed 200
    // used to throw into the generic 500 path.
    if (
      !data ||
      typeof data !== "object" ||
      typeof (data as { info?: unknown }).info !== "object" ||
      (data as { info?: unknown }).info === null
    ) {
      return NextResponse.json({ error: "Failed to query PyPI" }, { status: 500 });
    }
    const info = (data as { info: Record<string, unknown> }).info;
    const rawHomePage = info.home_page ?? (info.project_urls as Record<string, unknown> | undefined)?.Homepage;
    const homePage = isSafeHttpsUrl(rawHomePage)
      ? (rawHomePage as string)
      : `https://pypi.org/project/${pkg}/`;
    return NextResponse.json({
      name: info.name,
      version: info.version,
      summary: info.summary || "No summary available.",
      author: info.author || info.author_email || "Unknown",
      license: info.license || "Open Source",
      home_page: homePage,
      requires_python: info.requires_python,
    });
  } catch {
    // Generic error: the raw fetch message can leak internal detail
    // (DNS, socket, upstream internals) — the caller only needs to
    // know the lookup failed.
    return NextResponse.json({ error: "Failed to query PyPI" }, { status: 500 });
  }
}

