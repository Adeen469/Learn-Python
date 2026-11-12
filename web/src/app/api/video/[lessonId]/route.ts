import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchLessonById } from "@/lib/lessons";
import { openMegaStream } from "@/lib/mega";
import { openDriveStream, DriveStreamError } from "@/lib/drive";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const lessonIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);

const RATE_LIMITED_RESPONSE = (retryAfterSeconds: number) =>
  NextResponse.json(
    { error: "Too many requests — please slow down and retry shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  // Video players make many Range requests, so the video limit is generous.
  const limit = checkRateLimit(`video:${getClientIp(req)}`, 120, 60_000);
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
        ? await openDriveStream(lesson.videoUrl, rangeHeader)
        : await openMegaStream(lesson.videoUrl, rangeHeader);

    if (result.status === 416) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${result.totalSize}` },
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": result.mimeType,
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
    if (err instanceof DriveStreamError) {
      if (err.code === "NOT_FOUND") {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
      if (err.code === "NOT_CONFIGURED") {
        return NextResponse.json({ error: err.message }, { status: 503 });
      }
      if (err.code === "NOT_DOWNLOADABLE") {
        return NextResponse.json({ error: err.message }, { status: 422 });
      }
      if (err.code === "KEY_INVALID") {
        return NextResponse.json({ error: err.message }, { status: 502 });
      }
    }
    return NextResponse.json(
      { error: "Unable to load video stream" },
      { status: 502 }
    );
  }
}

