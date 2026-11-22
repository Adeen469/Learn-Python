import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchLessonById } from "@/lib/lessons";
import { openMegaStream } from "@/lib/mega";
import { openDriveStream, DriveStreamError } from "@/lib/drive";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const lessonIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);

// Video streams run long on a slow upstream (MEGA/Drive), so give this
// route the full Hobby allowance — otherwise Vercel cuts playback
// mid-chunk. (On Fly this was a no-op; a persistent machine has no
// function timeout.)
export const maxDuration = 60;

const RATE_LIMITED_RESPONSE = (retryAfterSeconds: number) =>
  NextResponse.json(
    { error: "Too many requests — please slow down and retry shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );

// H7: a request with no Range header must never pull a whole ~37 MB video
// through the function. The real player always sends Range headers, but a
// browser's very first media request may not — so instead of refusing it,
// serve only the first chunk as a 206; the player then continues with
// Range requests as usual, while a plain curl gets at most 1 MiB.
const NO_RANGE_CHUNK_BYTES = 1_048_576;

/** Range header actually sent upstream: the client's, or the first chunk. */
function effectiveRangeHeader(rangeHeader: string | null): string {
  return rangeHeader ?? `bytes=0-${NO_RANGE_CHUNK_BYTES - 1}`;
}

// H7: per-IP daily byte cap (in-memory, so per Vercel instance unless a
// shared store is configured — same caveat as the rate limiter). Bounds
// bulk harvesting of the whole catalogue through the proxy; a heavy day
// of real watching stays well under 1 GB.
const VIDEO_DAILY_BYTE_CAP = 1_000_000_000;
const dailyBytes = new Map<string, { day: string; bytes: number }>();

function secondsUntilMidnightUtc(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 1000));
}

/**
 * Charge `chunkLength` bytes to the IP's UTC-day budget. Returns false
 * when the day's cap would be exceeded (caller answers 429).
 */
function chargeDailyBytes(ip: string, chunkLength: number): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const entry = dailyBytes.get(ip);
  if (!entry || entry.day !== day) {
    dailyBytes.set(ip, { day, bytes: chunkLength });
  } else {
    if (entry.bytes + chunkLength > VIDEO_DAILY_BYTE_CAP) return false;
    entry.bytes += chunkLength;
  }
  // The map is keyed by IP, so prune stale days before it grows unbounded.
  if (dailyBytes.size > 5000) {
    for (const [key, value] of dailyBytes) {
      if (value.day !== day) dailyBytes.delete(key);
    }
  }
  return true;
}

// M21: never echo an upstream-supplied MIME type as Content-Type — a
// Drive file whose mimeType is text/html would be served same-origin as
// HTML. Only video/audio pass through; anything else is video/mp4.
function sanitizeVideoMimeType(mimeType: string): string {
  return /^(video|audio)\//.test(mimeType) ? mimeType : "video/mp4";
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  // Video players make many Range requests, so the video limit is generous.
  const limit = await checkRateLimit(`video:${getClientIp(req)}`, 120, 60_000);
  if (!limit.allowed) {
    return RATE_LIMITED_RESPONSE(limit.retryAfterSeconds);
  }

  const { lessonId } = await context.params;
  const parsed = lessonIdSchema.safeParse(lessonId);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
  }

  // Lessons come from Supabase when configured, seed catalog otherwise
  // (fetchLessons caches for 60s; the video limit above still applies).
  const lesson = await fetchLessonById(parsed.data);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Lessons are added with an empty videoUrl until their MEGA link is pasted
  // in — fail cleanly instead of sending an empty URL upstream.
  if (!lesson.videoUrl) {
    return NextResponse.json(
      { error: "This video hasn't been uploaded yet" },
      { status: 503 }
    );
  }

  try {
    const rangeHeader = req.headers.get("range");
    const result =
      lesson.videoSource === "drive"
        ? await openDriveStream(lesson.videoUrl, effectiveRangeHeader(rangeHeader))
        : await openMegaStream(lesson.videoUrl, effectiveRangeHeader(rangeHeader));

    if (result.status === 416) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${result.totalSize}`,
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    if (!chargeDailyBytes(getClientIp(req), result.chunkLength)) {
      return RATE_LIMITED_RESPONSE(secondsUntilMidnightUtc());
    }

    const headers: Record<string, string> = {
      "Content-Type": sanitizeVideoMimeType(result.mimeType),
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
      "Content-Length": String(result.chunkLength),
      "Cache-Control": "private, max-age=3600",
    };

    if (result.status === 206) {
      headers["Content-Range"] = `bytes ${result.start}-${result.end}/${result.totalSize}`;
    }

    return new NextResponse(result.stream, {
      status: result.status,
      headers,
    });
  } catch (err) {
    // Structured one-line log for monitoring (no external service):
    // lessonId + source + error code + HTTP status, then the raw error.
    const code = err instanceof DriveStreamError ? err.code : "UPSTREAM";
    const status =
      err instanceof DriveStreamError
        ? err.code === "NOT_FOUND"
          ? 404
          : err.code === "NOT_CONFIGURED"
            ? 503
            : err.code === "NOT_DOWNLOADABLE"
              ? 422
              : err.code === "KEY_INVALID"
                ? 502
                : 502
        : 502;
    console.error(
      JSON.stringify({
        lessonId: parsed.data,
        source: lesson.videoSource,
        code,
        status,
      })
    );
    console.error("Video stream error:", err);
    // M13: never return the raw upstream error to the client — Drive
    // messages disclose config state ("Google Drive API key is invalid
    // or restricted"). Status codes still distinguish the cases; the
    // body is always the same generic line. The detail stays in the
    // server log above.
    if (err instanceof DriveStreamError) {
      if (err.code === "NOT_FOUND") {
        return NextResponse.json({ error: "Unable to load video stream" }, { status: 404 });
      }
      if (err.code === "NOT_CONFIGURED") {
        return NextResponse.json({ error: "Unable to load video stream" }, { status: 503 });
      }
      if (err.code === "NOT_DOWNLOADABLE") {
        return NextResponse.json({ error: "Unable to load video stream" }, { status: 422 });
      }
      if (err.code === "KEY_INVALID") {
        return NextResponse.json({ error: "Unable to load video stream" }, { status: 502 });
      }
    }
    return NextResponse.json(
      { error: "Unable to load video stream" },
      { status: 502 }
    );
  }
}

