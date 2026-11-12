import { Readable } from "node:stream";
import { File as MegaFile } from "megajs";

const MEGA_FILE_URL_RE = /^https:\/\/mega\.nz\/file\/([A-Za-z0-9_-]{8})#([A-Za-z0-9_-]{22,43})$/;

export function isValidMegaFileUrl(url: string): boolean {
  return MEGA_FILE_URL_RE.test(url);
}

export interface ByteRange {
  start: number;
  end: number;
}

/**
 * Parses an HTTP Range header (e.g. "bytes=0-1023" or "bytes=1024-")
 * against a known total file size. Returns null for invalid/unsatisfiable ranges.
 */
export function parseHttpRange(rangeHeader: string | null, totalSize: number): ByteRange | null {
  if (!rangeHeader || totalSize <= 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return null;

  const [, startStr, endStr] = match;
  if (!startStr && !endStr) return null;

  let start = startStr ? Number.parseInt(startStr, 10) : 0;
  let end = endStr ? Number.parseInt(endStr, 10) : totalSize - 1;

  if (!startStr && endStr) {
    // Suffix range: bytes=-500 means last 500 bytes
    const suffixLen = Number.parseInt(endStr, 10);
    start = Math.max(0, totalSize - suffixLen);
    end = totalSize - 1;
  }

  if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || start > end || start >= totalSize) {
    return null;
  }

  end = Math.min(end, totalSize - 1);
  return { start, end };
}

export function guessVideoMimeType(filename: string | null | undefined): string {
  const lower = (filename ?? "").toLowerCase();
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mkv")) return "video/x-matroska";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  return "video/mp4";
}

export async function openMegaStream(megaUrl: string, rangeHeader: string | null) {
  if (!isValidMegaFileUrl(megaUrl)) {
    throw new Error("Invalid MEGA file URL");
  }

  const file = MegaFile.fromURL(megaUrl);
  await file.loadAttributes();

  const totalSize = file.size ?? 0;
  if (totalSize <= 0) {
    throw new Error("MEGA file is empty or unavailable");
  }

  const mimeType = guessVideoMimeType(file.name);
  const parsedRange = parseHttpRange(rangeHeader, totalSize);

  if (rangeHeader && !parsedRange) {
    return { status: 416 as const, totalSize, mimeType, fileName: file.name ?? "video.mp4" };
  }

  const start = parsedRange ? parsedRange.start : 0;
  const end = parsedRange ? parsedRange.end : totalSize - 1;
  const chunkLength = end - start + 1;

  const nodeStream = file.download({ start, end });
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return {
    status: parsedRange ? (206 as const) : (200 as const),
    stream: webStream,
    start,
    end,
    chunkLength,
    totalSize,
    mimeType,
    fileName: file.name ?? "video.mp4",
  };
}

