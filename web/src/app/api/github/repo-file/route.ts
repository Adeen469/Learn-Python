import { NextRequest, NextResponse } from "next/server";
import {
  assertGithubOwnerAllowed,
  getRepoFileBytes,
  getRepoFileContent,
  isValidGithubPath,
  isValidGithubSha,
  isValidGithubSlug,
  mapGithubError,
} from "@/lib/github";
import { resolveSessionGithubToken } from "@/lib/github-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkUserLimit, rateLimitedResponse } from "@/lib/api-handler";

// One file's content for the lazily opened repo in the editor.
// Streamed, not buffered JSON: a Vercel function response caps at
// 4.5 MB, so a file bigger than that can only come through as a
// stream. Same token handling as the repos route; the read bucket
// (github-read:) is separate from the write routes. The lib verifies
// the path actually points at the given blob SHA before fetching
// it, and refuses oversize files before downloading them.
export const maxDuration = 60;

const RATE_LIMITED_RESPONSE = rateLimitedResponse;

// MIME type for a viewer file, by extension. Unknown extensions
// fall back to octet-stream (the browser then refuses to sniff it,
// per the nosniff header above).
const BINARY_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
  mkv: "video/x-matroska",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  m4v: "video/x-m4v",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  flac: "audio/flac",
  m4a: "audio/mp4",
  aac: "audio/aac",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function mimeTypeForFile(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return BINARY_MIME_TYPES[ext] ?? "application/octet-stream";
}

export async function GET(req: NextRequest) {
  const limit = await checkRateLimit(`github-read:${getClientIp(req)}`, 30, 60_000);
  if (!limit.allowed) return RATE_LIMITED_RESPONSE(limit.retryAfterSeconds);
  // The token lives on the server (migration 006) — the browser
  // never sends or sees it.
  const resolved = await resolveSessionGithubToken(req);
  if ("response" in resolved) return resolved.response;
  const { token, email } = resolved;
  // Per-user bucket alongside the per-IP one, so one user behind
  // a shared NAT cannot starve another user's file reads.
  const userBlocked = await checkUserLimit(email, "github-read", 30, 60_000);
  if (userBlocked) return userBlocked;
  const owner = req.nextUrl.searchParams.get("owner");
  const repo = req.nextUrl.searchParams.get("repo");
  const sha = req.nextUrl.searchParams.get("sha");
  const path = req.nextUrl.searchParams.get("path");
  if (
    !isValidGithubSlug(owner) ||
    !isValidGithubSlug(repo) ||
    !isValidGithubSha(sha) ||
    !isValidGithubPath(path)
  ) {
    return NextResponse.json({ error: "Invalid owner, repo, sha or path" }, { status: 400 });
  }

  try {
    const allowed = await assertGithubOwnerAllowed(token, owner, repo);
    if (!allowed) {
      return NextResponse.json(
        { error: "You can only open repos owned by you or your GitHub organisations." },
        { status: 403 }
      );
    }
    // Binary mode (?binary=1): the editor's file viewers (images,
    // video, audio, PDF, Excel, Word) need the raw bytes — the text
    // path below refuses binary files. Same token, SHA and size
    // checks; the bytes come back with the file's real MIME type so
    // <img>, <video>, <audio> and <embed> render them directly.
    if (req.nextUrl.searchParams.get("binary") === "1") {
      const { bytes } = await getRepoFileBytes(token, { owner, repo, path, sha });
      return new NextResponse(new Uint8Array(bytes), {
        headers: {
          "Content-Type": mimeTypeForFile(path),
          "X-Content-Type-Options": "nosniff",
          // The blob is immutable by SHA — safe to cache privately.
          "Cache-Control": "private, max-age=3600",
        },
      });
    }
    const { content } = await getRepoFileContent(token, { owner, repo, path, sha });    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    let offset = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (offset >= bytes.length) {
          controller.close();
          return;
        }
        const chunk = bytes.slice(offset, offset + 64 * 1024);
        offset += chunk.length;
        controller.enqueue(chunk);
      },
    });
    return new NextResponse(stream, {
      // R3-L15: nosniff, like the video route — a declared
      // text/plain type is already safe, this is defence in depth.
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    const mapped = mapGithubError(err);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
