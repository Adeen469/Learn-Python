import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { commitFileToRepo } from "@/lib/github";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const commitSchema = z.object({
  owner: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  repo: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  path: z
    .string()
    .min(1)
    .max(500)
    .refine((p) => !p.startsWith("/") && !p.includes(".."), {
      message: "Path must not start with '/' or contain '..'",
    }),
  content: z.string().max(1_000_000),
  message: z.string().min(1).max(500),
  branch: z
    .string()
    .max(100)
    .regex(/^[a-zA-Z0-9_.\-/]+$/)
    .optional(),
});

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(`github:${getClientIp(req)}`, 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

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

