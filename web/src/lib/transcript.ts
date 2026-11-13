// Server-only transcript fetching for the AI tutor — grounds answers in
// what the lesson video actually says, not just its title and notes.
//
// Why Innertube: plain https://www.youtube.com/api/timedtext requests
// and plain yt-dlp both get HTTP 429 / "Sign in to confirm you're not a
// bot" from datacenter IPs. The working path is YouTube's Innertube
// player API with an ANDROID client context (the same path yt-dlp's
// android player client uses): it returns the caption track list, and
// each track's baseUrl can be fetched with fmt=json3. No API key, no
// yt-dlp, plain fetch only.
//
// Fail-soft by design: fetchTranscript returns null on ANY failure
// (network error, no usable tracks, empty text, bad JSON, timeout) and
// NEVER throws — the tutor falls back to title+notes grounding and
// answers normally. The transcript text is never logged.

export interface Transcript {
  text: string;
  language: string;
  /** True when the text was capped at TRANSCRIPT_MAX_CHARS. */
  truncated: boolean;
}

/** Max transcript characters sent to the model (one named constant). */
export const TRANSCRIPT_MAX_CHARS = 12000;
/** Total budget for the two YouTube calls (player + captions). */
export const TRANSCRIPT_TIMEOUT_MS = 6000;
const TRANSCRIPT_CACHE_TTL_MS = 60 * 60 * 1000; // 1h
const TRANSCRIPT_CACHE_MAX = 20;
const TRANSCRIPT_NEGATIVE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

const INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/player";
const INNERTUBE_CLIENT_VERSION = "20.10.38";
const INNERTUBE_UA =
  "com.google.android.youtube/20.10.38 (Linux; U; Android 14; en_IN)";

// ---------------------------------------------------------------------------
// Devanagari → Roman (Hinglish) transliteration — dependency-free.
//
// The course is taught in Hindi, but the user reads/writes Hinglish:
// Hindi in Roman (Latin) script. YouTube has no native Hinglish
// (hi-Latn) track for these videos, so the Devanagari auto-captions
// are transliterated to phonetic Roman before they reach the model.
// The mapping follows common Hinglish texting: आ→aa but ा→a (आप→aap,
// करना→karna), ई→ee but ी→i (मेरी→meri), ऊ→uu but ू→u (तू→tu),
// and word-final schwa deletion (वेलकम→velkam, कोड→kod).
// ---------------------------------------------------------------------------

const DEVANAGARI_VOWELS: Record<string, string> = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "uu",
  "ऋ": "ri", "ॠ": "rii", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au",
  "ऑ": "o", "ॲ": "a", "ॐ": "om",
};

const DEVANAGARI_MATRAS: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ri", "ॄ": "rii",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o",
};

const DEVANAGARI_CONSONANTS: Record<string, string> = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  "क्ष": "ksh", "त्र": "tr", "ज्ञ": "gy", "ळ": "l",
};

// Nukta (़) variants: क़→q, ज़→z, फ़→f, ड़→r, ढ़→rh.
const DEVANAGARI_NUKTA_FORM: Record<string, string> = {
  "क": "q", "ख": "kh", "ग": "gh", "ज": "z", "फ": "f",
  "ड": "r", "ढ": "rh", "य": "y", "अ": "a",
};

const NUKTA = "़";
const HALANT = "्";
const ANUSVARA = "ं";
const CHANDRABINDU = "ँ";
const VISARGA = "ः";

function isDevanagariConsonantOrVowel(c: string): boolean {
  return (
    DEVANAGARI_CONSONANTS[c] !== undefined || DEVANAGARI_VOWELS[c] !== undefined
  );
}

/** Convert Devanagari text to phonetic Roman (Hinglish). Pure ASCII out. */
export function transliterateDevanagariToLatin(input: string): string {
  if (!input) return "";
  const chars = Array.from(input);
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (DEVANAGARI_CONSONANTS[c] !== undefined) {
      let base = DEVANAGARI_CONSONANTS[c];
      let j = i + 1;
      if (chars[j] === NUKTA) {
        base = DEVANAGARI_NUKTA_FORM[c] ?? base;
        j++;
      }
      const after = chars[j];
      if (after === HALANT) {
        out += base;
        i = j; // the loop's i++ skips the halant
      } else {
        if (
          after !== undefined &&
          (isDevanagariConsonantOrVowel(after) ||
            after === ANUSVARA ||
            after === CHANDRABINDU ||
            after === VISARGA)
        ) {
          out += base + "a";
        } else {
          // Matra follows (it supplies the vowel), or the word ends
          // / a non-Devanagari char follows (schwa deleted).
          out += base;
        }
        i = j - 1; // the loop's i++ lands on `after`
      }
      continue;
    }
    if (DEVANAGARI_VOWELS[c] !== undefined) {
      out += DEVANAGARI_VOWELS[c];
      continue;
    }
    if (DEVANAGARI_MATRAS[c] !== undefined) {
      out += DEVANAGARI_MATRAS[c];
      continue;
    }
    if (c === ANUSVARA || c === CHANDRABINDU) {
      out += "n";
      continue;
    }
    if (c === VISARGA) {
      out += "h";
      continue;
    }
    if (c === HALANT || c === NUKTA) continue; // consumed by the consonant branch
    const code = c.codePointAt(0);
    if (code !== undefined && code >= 0x966 && code <= 0x96f) {
      out += String(code - 0x966); // Devanagari digits → ASCII digits
      continue;
    }
    if (c === "।") {
      out += ".";
      continue;
    }
    if (c === "॥") {
      out += "..";
      continue;
    }
    if (c === "ऽ") {
      out += "'";
      continue;
    }
    out += c; // Latin, digits, spaces, punctuation pass through
  }
  return out;
}

/** True when the text contains any Devanagari characters. */
export function containsDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

// ---------------------------------------------------------------------------
// Pure helpers (mirrored in tests/transcript.test.mjs)
// ---------------------------------------------------------------------------

/** Pull the YouTube video ID out of a lesson's notes field. */
export function extractYouTubeId(notes: unknown): string | null {
  if (typeof notes !== "string") return null;
  const watch = /[?&]v=([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/.exec(notes);
  if (watch) return watch[1];
  const short = /youtu\.be\/([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/.exec(notes);
  if (short) return short[1];
  return null;
}

export interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  /** "asr" for auto-generated captions; absent for manual subtitles. */
  kind?: string;
}

/**
 * Pick the best caption track. Preference: a Latin-script Hindi track
 * (hi-Latn — Hinglish already, no transliteration needed), then Hindi
 * auto-captions (the course is taught in Hindi), then the original
 * Hindi track, then manual English (India) subtitles, then any
 * English auto-captions. Anything else is useless for this course,
 * so no match returns null instead of a random language.
 */
export function pickCaptionTrack(tracks: unknown): CaptionTrack | null {
  if (!Array.isArray(tracks)) return null;
  const list = tracks.filter(
    (t): t is CaptionTrack =>
      typeof t === "object" &&
      t !== null &&
      typeof (t as CaptionTrack).baseUrl === "string" &&
      (t as CaptionTrack).baseUrl.length > 0 &&
      typeof (t as CaptionTrack).languageCode === "string"
  );
  const hiLatn = list.find((t) => t.languageCode === "hi-Latn");
  if (hiLatn) return hiLatn;
  const hiAsr = list.find(
    (t) => t.languageCode === "hi" && t.kind === "asr"
  );
  if (hiAsr) return hiAsr;
  const hiOrig = list.find((t) => t.languageCode === "hi-orig");
  if (hiOrig) return hiOrig;
  const enIn = list.find((t) => t.languageCode === "en-IN");
  if (enIn) return enIn;
  const enAsr = list.find(
    (t) => t.languageCode.startsWith("en") && t.kind === "asr"
  );
  if (enAsr) return enAsr;
  return null;
}

/** Parse a timedtext json3 body into plain text. */
export function parseTimedtextJson3(body: unknown): string | null {
  try {
    const events = (body as { events?: unknown })?.events;
    if (!Array.isArray(events)) return null;
    const text = events
      .flatMap((e) => {
        const segs = (e as { segs?: unknown })?.segs;
        if (!Array.isArray(segs)) return [];
        return segs.map((s) =>
          typeof (s as { utf8?: unknown })?.utf8 === "string"
            ? (s as { utf8: string }).utf8
            : ""
        );
      })
      .join("")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return text || null;
  } catch {
    return null;
  }
}

/** Cap the transcript at TRANSCRIPT_MAX_CHARS. */
export function truncateTranscript(text: string): {
  text: string;
  truncated: boolean;
} {
  if (text.length <= TRANSCRIPT_MAX_CHARS) return { text, truncated: false };
  return { text: text.slice(0, TRANSCRIPT_MAX_CHARS), truncated: true };
}

// ---------------------------------------------------------------------------
// Fetching (fetch is injectable so tests can mock it)
// ---------------------------------------------------------------------------

type FetchImpl = (
  url: string,
  init?: Record<string, unknown>
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

const cache = new Map<string, { transcript: Transcript; fetchedAt: number }>();
const negativeCache = new Map<string, number>();

async function fetchJson(
  fetchImpl: FetchImpl,
  url: string,
  init: Record<string, unknown>,
  signal: AbortSignal
): Promise<unknown | null> {
  let res: { ok: boolean; status: number; json: () => Promise<unknown> };
  try {
    res = await fetchImpl(url, { ...init, signal });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchTranscriptUncached(
  videoId: string,
  fetchImpl: FetchImpl,
  signal: AbortSignal
): Promise<Transcript | null> {
  const player = await fetchJson(
    fetchImpl,
    INNERTUBE_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": INNERTUBE_UA,
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: INNERTUBE_CLIENT_VERSION,
            hl: "en",
            gl: "IN",
          },
        },
        videoId,
      }),
    },
    signal
  );
  if (!player) return null;
  const tracks = (
    player as {
      captions?: {
        playerCaptionsTracklistRenderer?: { captionTracks?: unknown };
      };
    }
  )?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  const track = pickCaptionTrack(tracks);
  if (!track) return null;

  // The baseUrl already carries fmt=srv3 — REPLACE it, don't append a
  // second fmt (the server answers the first one, XML, not JSON).
  let url: URL;
  try {
    url = new URL(track.baseUrl);
  } catch {
    return null;
  }
  url.searchParams.set("fmt", "json3");
  const timed = await fetchJson(fetchImpl, url.toString(), {}, signal);
  if (!timed) return null;
  const text = parseTimedtextJson3(timed);
  if (!text) return null;
  // The tutor works in Hinglish (Roman script). If the captions came
  // back in Devanagari, transliterate them — the model reads the
  // Roman text the same way the learner writes it. A hi-Latn track
  // (or an English one) is already Latin script and passes through.
  // If transliteration ever produced nothing usable, the Devanagari
  // text is kept instead — the model reads it fine, and a transcript
  // is better than none.
  let language = track.languageCode;
  let finalText = text;
  if (containsDevanagari(text)) {
    const roman = transliterateDevanagariToLatin(text);
    if (roman.trim()) {
      finalText = roman;
      language = "hi-Latn";
    }
  }
  const capped = truncateTranscript(finalText);
  return { text: capped.text, language, truncated: capped.truncated };
}

/**
 * Fetch a lesson video's transcript. Cached per videoId for 1h
 * (max 20 entries) — a second question about the same lesson does not
 * re-fetch YouTube. Failures are cached briefly (5 min) so a video
 * with no captions doesn't cost a 6s wait on every question.
 * Returns null on ANY failure and never throws.
 */
export async function fetchTranscript(
  videoId: string,
  opts: { timeoutMs?: number; fetchImpl?: FetchImpl } = {}
): Promise<Transcript | null> {
  const now = Date.now();
  const cached = cache.get(videoId);
  if (cached && now - cached.fetchedAt < TRANSCRIPT_CACHE_TTL_MS) {
    return cached.transcript;
  }
  if (cached) cache.delete(videoId);
  const negAt = negativeCache.get(videoId);
  if (negAt !== undefined && now - negAt < TRANSCRIPT_NEGATIVE_CACHE_TTL_MS) {
    return null;
  }
  if (negAt !== undefined) negativeCache.delete(videoId);

  const timeoutMs = opts.timeoutMs ?? TRANSCRIPT_TIMEOUT_MS;
  const fetchImpl = opts.fetchImpl ?? (fetch as unknown as FetchImpl);
  const ctrl = new AbortController();
  const timer = setTimeout(() => {
    try {
      ctrl.abort();
    } catch {
      // Ignore.
    }
  }, timeoutMs);
  try {
    const result = await fetchTranscriptUncached(videoId, fetchImpl, ctrl.signal);
    if (!result) {
      negativeCache.set(videoId, now);
      return null;
    }
    cache.set(videoId, { transcript: result, fetchedAt: now });
    while (cache.size > TRANSCRIPT_CACHE_MAX) {
      const oldest = cache.keys().next().value;
      if (oldest === undefined) break;
      cache.delete(oldest);
    }
    return result;
  } catch {
    negativeCache.set(videoId, now);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
