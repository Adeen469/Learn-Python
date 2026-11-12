import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pkg = searchParams.get("name")?.trim();

  if (!pkg) {
    return NextResponse.json({ error: "Missing package name" }, { status: 400 });
  }

  // Safe package name check: alphanumeric, dashes, underscores, dots
  if (!/^[a-zA-Z0-9_\-.]+$/.test(pkg)) {
    return NextResponse.json({ error: "Invalid package name format" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`, {
      headers: { "User-Agent": "LP-Learning-Platform/1.0" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: `Package '${pkg}' was not found on PyPI.` }, { status: 404 });
      }
      return NextResponse.json({ error: `PyPI returned status ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      name: data.info.name,
      version: data.info.version,
      summary: data.info.summary || "No summary available.",
      author: data.info.author || data.info.author_email || "Unknown",
      license: data.info.license || "Open Source",
      home_page: data.info.home_page || data.info.project_urls?.Homepage || `https://pypi.org/project/${pkg}/`,
      requires_python: data.info.requires_python,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to query PyPI" },
      { status: 500 }
    );
  }
}

