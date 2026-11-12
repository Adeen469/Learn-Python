import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLessonById } from "@/lib/catalog";
import { openMegaStream } from "@/lib/mega";

const lessonIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;
  const parsed = lessonIdSchema.safeParse(lessonId);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
  }

  const lesson = getLessonById(parsed.data);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  try {
    const rangeHeader = req.headers.get("range");
    const result = await openMegaStream(lesson.videoUrl, rangeHeader);

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
    console.error("MEGA stream error:", err);
    return NextResponse.json(
      { error: "Unable to load video stream" },
      { status: 502 }
    );
  }
}

