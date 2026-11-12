// Google Drive video streaming (server-only).
// Mirrors lib/mega.ts: same return shape so the /api/video route stays shared.
// The Drive file must be shared as "Anyone with the link" — an API key can
// only read link-shared (public) files, it cannot open private ones.

import { parseHttpRange } from "./mega";

const DRIVE_FILE_ID_RE = /^[A-Za-z0-9_-]{10,64}$/;

export function isValidDriveFileId(fileId: string): boolean {
  return DRIVE_FILE_ID_RE.test(fileId);
}

export type DriveStreamErrorCode =
  | "NOT_CONFIGURED"
  | "NOT_FOUND"
  | "KEY_INVALID"
  | "NOT_DOWNLOADABLE"
  | "UPSTREAM";

export class DriveStreamError extends Error {
  readonly code: DriveStreamErrorCode;

  constructor(code: DriveStreamErrorCode, message: string) {
    super(message);
    this.name = "DriveStreamError";
    this.code = code;
  }
}

export interface DriveStreamResult {
  status: 200 | 206;
  stream: ReadableStream<Uint8Array>;
  start: number;
  end: number;
  chunkLength: number;
  totalSize: number;
  mimeType: string;
  fileName: string;
}

export type OpenDriveStreamResult =
  | DriveStreamResult
  | { status: 416; totalSize: number; mimeType: string; fileName: string };

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3/files";

// File metadata (size/mime/name) is stable for a given file, and the browser
// issues a Range request for every buffer/seek, so cache it in-memory for
// 10 minutes instead of calling Drive before every stream. If a cached entry
// goes stale (file replaced/unshared), the media fetch fails and we retry
// once with fresh metadata instead of failing the playback.
interface CachedDriveMeta {
  totalSize: number;
  mimeType: string;
  fileName: string;
  fetchedAt: number;
}

const META_CACHE_TTL_MS = 10 * 60 * 1000;
const metaCache = new Map<string, CachedDriveMeta>();

function getCachedMeta(fileId: string): CachedDriveMeta | null {
  const hit = metaCache.get(fileId);
  if (!hit) return null;
  if (Date.now() - hit.fetchedAt > META_CACHE_TTL_MS) {
    metaCache.delete(fileId);
    return null;
  }
  return hit;
}

interface DriveMeta {
  totalSize: number;
  mimeType: string;
  fileName: string;
}

async function fetchDriveMeta(fileId: string, apiKey: string): Promise<DriveMeta> {
  let metaRes: Response;
  try {
    metaRes = await fetch(
      `${DRIVE_API_BASE}/${encodeURIComponent(fileId)}?key=${encodeURIComponent(apiKey)}&fields=id,name,mimeType,size`,
      { headers: { "User-Agent": "LP-Learning-Platform/1.0" } }
    );
  } catch {
    throw new DriveStreamError("UPSTREAM", "Could not reach Google Drive");
  }

  if (metaRes.status === 404 || metaRes.status === 403) {
    throw new DriveStreamError(
      "NOT_FOUND",
      "Drive file not found or not shared — set sharing to 'Anyone with the link'"
    );
  }
  if (metaRes.status === 400 || metaRes.status === 401) {
    throw new DriveStreamError(
      "KEY_INVALID",
      "Google Drive API key is invalid or restricted"
    );
  }
  if (!metaRes.ok) {
    throw new DriveStreamError(
      "UPSTREAM",
      `Google Drive returned status ${metaRes.status}`
    );
  }

  const meta = (await metaRes.json()) as {
    name?: unknown;
    mimeType?: unknown;
    size?: unknown;
  };
  const totalSize = Number(meta.size ?? 0);
  if (!totalSize || totalSize <= 0) {
    throw new DriveStreamError(
      "NOT_DOWNLOADABLE",
      "This Drive file has no downloadable content (Google Docs/Sheets/Slides cannot be streamed as video)"
    );
  }
  const mimeType =
    typeof meta.mimeType === "string" && meta.mimeType
      ? meta.mimeType
      : "video/mp4";
  const fileName =
    typeof meta.name === "string" && meta.name ? meta.name : "video.mp4";
  return { totalSize, mimeType, fileName };
}

/**
 * Streams a Google Drive file with HTTP Range support.
 * One metadata call per file per 10 minutes (cached); every stream is a
 * single media download with the Range header forwarded so Drive returns 206.
 */
export async function openDriveStream(
  fileId: string,
  rangeHeader: string | null
): Promise<OpenDriveStreamResult> {
  if (!isValidDriveFileId(fileId)) {
    throw new DriveStreamError("NOT_FOUND", "Invalid Google Drive file ID");
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (!apiKey) {
    throw new DriveStreamError(
      "NOT_CONFIGURED",
      "Google Drive is not configured: GOOGLE_DRIVE_API_KEY is missing"
    );
  }

  const streamWithMeta = async (meta: DriveMeta): Promise<OpenDriveStreamResult> => {
    const parsedRange = parseHttpRange(rangeHeader, meta.totalSize);
    if (rangeHeader && !parsedRange) {
      return {
        status: 416 as const,
        totalSize: meta.totalSize,
        mimeType: meta.mimeType,
        fileName: meta.fileName,
      };
    }

    const start = parsedRange ? parsedRange.start : 0;
    const end = parsedRange ? parsedRange.end : meta.totalSize - 1;

    let mediaRes: Response;
    try {
      mediaRes = await fetch(
        `${DRIVE_API_BASE}/${encodeURIComponent(fileId)}?alt=media&key=${encodeURIComponent(apiKey)}`,
        {
          headers: {
            ...(parsedRange ? { Range: `bytes=${start}-${end}` } : {}),
            "User-Agent": "LP-Learning-Platform/1.0",
          },
        }
      );
    } catch {
      throw new DriveStreamError("UPSTREAM", "Could not reach Google Drive");
    }

    if (!mediaRes.ok || !mediaRes.body) {
      throw new DriveStreamError(
        "UPSTREAM",
        `Google Drive download failed (status ${mediaRes.status})`
      );
    }

    return {
      status: parsedRange ? (206 as const) : (200 as const),
      stream: mediaRes.body as ReadableStream<Uint8Array>,
      start,
      end,
      chunkLength: end - start + 1,
      totalSize: meta.totalSize,
      mimeType: meta.mimeType,
      fileName: meta.fileName,
    };
  };

  const cached = getCachedMeta(fileId);
  if (cached) {
    try {
      return await streamWithMeta(cached);
    } catch (err) {
      // Cached metadata may be stale (file replaced/unshared) — drop it and
      // retry once with fresh metadata instead of failing the playback.
      if (!(err instanceof DriveStreamError) || err.code !== "UPSTREAM") throw err;
      metaCache.delete(fileId);
    }
  }

  const fresh = await fetchDriveMeta(fileId, apiKey);
  metaCache.set(fileId, { ...fresh, fetchedAt: Date.now() });
  return streamWithMeta(fresh);
}
