import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { commitFileToRepo } from "@/lib/github";

const commitSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  path: z.string().min(1),
  content: z.string(),
  message: z.string().min(1),
  branch: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing GitHub Personal Access Token" }, { status: 401 });
  }
  const token = auth.slice(7).trim();

  try {
    const body = await req.json();
    const parsed = commitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid commit parameters", details: parsed.error.issues }, { status: 400 });
    }

    const result = await commitFileToRepo(token, parsed.data);
    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "GitHub commit failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

