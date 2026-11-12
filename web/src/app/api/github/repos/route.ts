import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUserRepo, listUserRepos } from "@/lib/github";

const createRepoSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  description: z.string().max(350).optional(),
  isPrivate: z.boolean().optional(),
  autoInit: z.boolean().optional(),
});

function getAuthToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

export async function GET(req: NextRequest) {
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: "Missing GitHub Personal Access Token" }, { status: 401 });
  }

  try {
    const repos = await listUserRepos(token);
    return NextResponse.json({ repos });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "GitHub API error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: "Missing GitHub Personal Access Token" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createRepoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid repository parameters", details: parsed.error.issues }, { status: 400 });
    }

    const repo = await createUserRepo(token, parsed.data);
    return NextResponse.json({ repo }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Could not create repo";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

