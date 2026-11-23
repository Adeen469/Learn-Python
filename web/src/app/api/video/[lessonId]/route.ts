import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchLessonById } from "@/lib/lessons";
import { openMegaStream, MAX_VIDEO_CHUNK_BYTES } from "@/lib/mega";
import { openDriveStream, DriveStreamError } from "@/lib/drive";
import { getClientIp } from "@/lib/rate-limit";
import { checkIpLimit, rateLimitedResponse } from "@/lib/api-handler";

const lessonIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);

// Video streams run long on a slow upstream (MEGA/Drive), so give this
// route the full Hobby allowance — otherwise Vercel cuts playback
// mid-chunk. (On Fly this was a no-op; a persistent machine has no
// function timeout.)
export const maxDuration = 60;

const RATE_LIMITED_RESPONSE = rateLimitedResponse;

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
// of real watching stays well under 1 GB. Moving the cap to the shared
// Redis store is out of scope — per-instance is the accepted residual.
const VIDEO_DAILY_BYTE_CAP = 1_000_000_000;
// R2-L15: when the client IP is unknown every client collapses into
// one shared bucket, so an unknown IP gets a much smaller shared
// budget (100 MB/day) instead of the full 1 GB — one abuser cannot
// eat the whole shared cap, and the event is logged once.
const VIDEO_DAILY_BYTE_CAP_UNKNOWN_IP = 100_000_000;
let unknownIpLogged = false;
const dailyBytes = new Map<string, { day: string; bytes: number }>();

function secondsUntilMidnightUtc(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 1000));
}

/**
 * Charge `chunkLength` bytes to the IP's UTC-day budget, against the
 * given cap. Returns false when the day's cap would be exceeded
 * (caller answers 429).
 */
function chargeDailyBytes(ip: string, chunkLength: number, cap: number = VIDEO_DAILY_BYTE_CAP): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const entry = dailyBytes.get(ip);
  if (!entry || entry.day !== day) {
    dailyBytes.set(ip, { day, bytes: chunkLength });
  } else {
    if (entry.bytes + chunkLength > cap) return false;
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

// R2-H1: the most bytes a Range request can draw, without knowing
// the file size — used to charge the daily cap before the upstream
// fetch. Bounded ranges are exact; open-ended/suffix ranges are at
// most the 4 MiB clamp; no Range is the first 1 MiB chunk. Returns
// null for a syntactically invalid Range (it 416s downstream and is
// charged nothing).
function expectedChunkBytes(rangeHeader: string | null): number | null {
  if (!rangeHeader) return NO_RANGE_CHUNK_BYTES;
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return null;
  const [, startStr, endStr] = match;
  if (!startStr && !endStr) return null;
  if (startStr && endStr) {
    const len = Number(endStr) - Number(startStr) + 1;
    if (!Number.isFinite(len) || len <= 0) return null;
    return Math.min(len, MAX_VIDEO_CHUNK_BYTES);
  }
  if (startStr) return MAX_VIDEO_CHUNK_BYTES;
  return Math.min(Number(endStr), MAX_VIDEO_CHUNK_BYTES);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  // Video players make many Range requests, so the video limit is generous.
  const ipBlocked = await checkIpLimit(req, "video", 120, 60_000);
  if (ipBlocked) return ipBlocked;

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

  // R2-H1: charge the day's byte cap BEFORE the upstream fetch, so
  // an over-cap request costs no MEGA/Drive metadata call at all.
  // The charge is the clamped window the client will get at most:
  // a bounded range is exact, an open-ended/suffix range is at
  // most MAX_VIDEO_CHUNK_BYTES (parseHttpRange clamps it), and a
  // no-Range request is the first 1 MiB chunk. A syntactically
  // invalid Range returns null here and is charged nothing — it
  // 416s downstream.
  const rangeHeader = req.headers.get("range");
  const ip = getClientIp(req);
  if (ip === "unknown" && !unknownIpLogged) {
    unknownIpLogged = true;
    console.error(
      JSON.stringify({
        event: "video_unknown_ip",
        endpoint: "video",
        reason: "client IP could not be determined; using the smaller shared byte cap",
      })
    );
  }
  const expectedBytes = expectedChunkBytes(rangeHeader);
  if (
    expectedBytes !== null &&
    !chargeDailyBytes(
      ip,
      expectedBytes,
      ip === "unknown" ? VIDEO_DAILY_BYTE_CAP_UNKNOWN_IP : VIDEO_DAILY_BYTE_CAP
    )
  ) {
    return RATE_LIMITED_RESPONSE(secondsUntilMidnightUtc());
  }

  try {
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
    // lessonId + source + error code, then the raw error. The code
    // stays in the server log only — the client always gets the same
    // generic body AND the same status.
    const code = err instanceof DriveStreamError ? err.code : "UPSTREAM";
    console.error(
      JSON.stringify({
        lessonId: parsed.data,
        source: lesson.videoSource,
        code,
      })
    );
    console.error("Video stream error:", err);
    // R2-L26: one status (502) for every upstream Drive failure,
    // keeping the generic body — the old 404/503/422 split let
    // anyone probe whether the Drive key is configured, invalid,
    // or the lesson is missing.
    return NextResponse.json(
      { error: "Unable to load video stream" },
      { status: 502 }
    );
  }
}

