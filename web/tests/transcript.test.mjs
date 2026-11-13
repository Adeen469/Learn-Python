import assert from "node:assert/strict";
import test from "node:test";

// Inline pure helpers for zero-build node --test verification
// (mirrors web/src/lib/transcript.ts — YouTube transcript fetching
// via the Innertube player API, plus Devanagari → Roman Hinglish
// transliteration).

const TRANSCRIPT_MAX_CHARS = 12000;
const TRANSCRIPT_TIMEOUT_MS = 6000;
const TRANSCRIPT_CACHE_TTL_MS = 60 * 60 * 1000;
const TRANSCRIPT_CACHE_MAX = 20;
const TRANSCRIPT_NEGATIVE_CACHE_TTL_MS = 5 * 60 * 1000;
const INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/player";
const INNERTUBE_CLIENT_VERSION = "20.10.38";

// --- transliteration mirrors ---

const DEVANAGARI_VOWELS = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "uu",
  "ऋ": "ri", "ॠ": "rii", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au",
  "ऑ": "o", "ॲ": "a", "ॐ": "om",
};

const DEVANAGARI_MATRAS = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ri", "ॄ": "rii",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o",
};

const DEVANAGARI_CONSONANTS = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  "क्ष": "ksh", "त्र": "tr", "ज्ञ": "gy", "ळ": "l",
};

const DEVANAGARI_NUKTA_FORM = {
  "क": "q", "ख": "kh", "ग": "gh", "ज": "z", "फ": "f",
  "ड": "r", "ढ": "rh", "य": "y", "अ": "a",
};

const NUKTA = "़";
const HALANT = "्";
const ANUSVARA = "ं";
const CHANDRABINDU = "ँ";
const VISARGA = "ः";

function isDevanagariConsonantOrVowel(c) {
  return (
    DEVANAGARI_CONSONANTS[c] !== undefined || DEVANAGARI_VOWELS[c] !== undefined
  );
}

function transliterateDevanagariToLatin(input) {
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
        i = j;
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
          out += base;
        }
        i = j - 1;
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
    if (c === HALANT || c === NUKTA) continue;
    const code = c.codePointAt(0);
    if (code !== undefined && code >= 0x966 && code <= 0x96f) {
      out += String(code - 0x966);
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
    out += c;
  }
  return out;
}

function containsDevanagari(text) {
  return /[\u0900-\u097F]/.test(text);
}

// --- other pure helper mirrors ---

function extractYouTubeId(notes) {
  if (typeof notes !== "string") return null;
  const watch = /[?&]v=([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/.exec(notes);
  if (watch) return watch[1];
  const short = /youtu\.be\/([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/.exec(notes);
  if (short) return short[1];
  return null;
}

function pickCaptionTrack(tracks) {
  if (!Array.isArray(tracks)) return null;
  const list = tracks.filter(
    (t) =>
      typeof t === "object" &&
      t !== null &&
      typeof t.baseUrl === "string" &&
      t.baseUrl.length > 0 &&
      typeof t.languageCode === "string"
  );
  const hiLatn = list.find((t) => t.languageCode === "hi-Latn");
  if (hiLatn) return hiLatn;
  const hiAsr = list.find((t) => t.languageCode === "hi" && t.kind === "asr");
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

function parseTimedtextJson3(body) {
  try {
    const events = body?.events;
    if (!Array.isArray(events)) return null;
    const text = events
      .flatMap((e) => {
        const segs = e?.segs;
        if (!Array.isArray(segs)) return [];
        return segs.map((s) => (typeof s?.utf8 === "string" ? s.utf8 : ""));
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

function truncateTranscript(text) {
  if (text.length <= TRANSCRIPT_MAX_CHARS) return { text, truncated: false };
  return { text: text.slice(0, TRANSCRIPT_MAX_CHARS), truncated: true };
}

// --- fetchTranscript mirror (cache + Innertube + transliteration) ---

const cache = new Map();
const negativeCache = new Map();

async function fetchJson(fetchImpl, url, init, signal) {
  let res;
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

async function fetchTranscriptUncached(videoId, fetchImpl, signal) {
  const player = await fetchJson(
    fetchImpl,
    INNERTUBE_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  const track = pickCaptionTrack(tracks);
  if (!track) return null;
  let url;
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

async function fetchTranscript(videoId, opts = {}) {
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
  const fetchImpl = opts.fetchImpl;
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test("extractYouTubeId handles watch, youtu.be and junk", () => {
  assert.equal(
    extractYouTubeId("Watch on YouTube: https://www.youtube.com/watch?v=7wnove7K-ZQ"),
    "7wnove7K-ZQ"
  );
  assert.equal(
    extractYouTubeId("https://youtu.be/7wnove7K-ZQ?t=10"),
    "7wnove7K-ZQ"
  );
  assert.equal(
    extractYouTubeId("https://www.youtube.com/watch?v=7wnove7K-ZQ&list=PLx"),
    "7wnove7K-ZQ"
  );
  assert.equal(extractYouTubeId("no link here"), null);
  assert.equal(extractYouTubeId("https://www.youtube.com/watch?v=short"), null);
  assert.equal(extractYouTubeId(null), null);
  assert.equal(extractYouTubeId(123), null);
});

test("pickCaptionTrack prefers hi-Latn, then hi asr, hi-orig, en-IN, en asr", () => {
  const base = "https://www.youtube.com/api/timedtext?v=x&fmt=srv3";
  const hiLatn = { baseUrl: base, languageCode: "hi-Latn" };
  const hiAsr = { baseUrl: base, languageCode: "hi", kind: "asr" };
  const hiOrig = { baseUrl: base, languageCode: "hi-orig" };
  const enIn = { baseUrl: base, languageCode: "en-IN" };
  const enAsr = { baseUrl: base, languageCode: "en", kind: "asr" };
  const arAsr = { baseUrl: base, languageCode: "ar", kind: "asr" };
  assert.equal(pickCaptionTrack([enIn, hiAsr, hiLatn]), hiLatn);
  assert.equal(pickCaptionTrack([enIn, hiOrig, hiAsr]), hiAsr);
  assert.equal(pickCaptionTrack([enIn, hiOrig]), hiOrig);
  assert.equal(pickCaptionTrack([arAsr, enIn]), enIn);
  assert.equal(pickCaptionTrack([arAsr, enAsr]), enAsr);
  assert.equal(pickCaptionTrack([arAsr]), null);
  assert.equal(pickCaptionTrack([]), null);
  assert.equal(pickCaptionTrack(null), null);
  assert.equal(pickCaptionTrack("junk"), null);
  // A track without a usable baseUrl is skipped.
  assert.equal(
    pickCaptionTrack([{ baseUrl: "", languageCode: "hi", kind: "asr" }, enIn]),
    enIn
  );
});

test("parseTimedtextJson3 joins segments and strips tags", () => {
  assert.equal(
    parseTimedtextJson3({
      events: [
        { segs: [{ utf8: "hello " }, { utf8: "world" }] },
        { segs: [{ utf8: "  second  " }] },
      ],
    }),
    "hello world second"
  );
  assert.equal(
    parseTimedtextJson3({ events: [{ segs: [{ utf8: "<b>hi</b> there" }] }] }),
    "hi there"
  );
  assert.equal(parseTimedtextJson3({}), null);
  assert.equal(parseTimedtextJson3({ events: [] }), null);
  assert.equal(parseTimedtextJson3({ events: [{ segs: [] }] }), null);
  assert.equal(parseTimedtextJson3(null), null);
  assert.equal(parseTimedtextJson3("junk"), null);
});

test("truncateTranscript caps at 12,000 chars with a marker flag", () => {
  assert.deepEqual(truncateTranscript("short"), {
    text: "short",
    truncated: false,
  });
  assert.equal(truncateTranscript("x".repeat(12000)).truncated, false);
  const long = truncateTranscript("x".repeat(12001));
  assert.equal(long.text.length, 12000);
  assert.equal(long.truncated, true);
});

test("transliterateDevanagariToLatin turns Hindi into Roman Hinglish", () => {
  // Note: YouTube's auto-captions spell "वेलकम" WITHOUT a halant
  // (U+0932 U+0915, not U+0932 U+094D U+0915), so the faithful
  // transliteration is "velakam" — the model still reads it as
  // "welcome" in context. With a halant present, it is "velkam".
  assert.equal(
    transliterateDevanagariToLatin("वेलकम टू 100 डेज ऑफ कोड"),
    "velakam tu 100 dej oph kod"
  );
  assert.equal(transliterateDevanagariToLatin("वेल\u094dकम"), "velkam");
  assert.equal(
    transliterateDevanagariToLatin("पाइथन को 1991 में बनाया था"),
    "paithan ko 1991 men banaya tha"
  );
  assert.equal(transliterateDevanagariToLatin("हैं"), "hain");
  assert.equal(transliterateDevanagariToLatin("मैं"), "main");
  assert.equal(transliterateDevanagariToLatin("कमल"), "kamal");
  assert.equal(transliterateDevanagariToLatin("किताब"), "kitab");
  assert.equal(transliterateDevanagariToLatin("ज़रूर"), "zarur");
  assert.equal(transliterateDevanagariToLatin("फ़ोन"), "fon");
  assert.equal(transliterateDevanagariToLatin("१२३"), "123");
  assert.equal(transliterateDevanagariToLatin("hello 123"), "hello 123");
  assert.equal(transliterateDevanagariToLatin(""), "");
  // Pure ASCII out — nothing Devanagari survives.
  const out = transliterateDevanagariToLatin(
    "[संगीत] वेलकम टू 100 डेज ऑफ कोड गाइज"
  );
  assert.equal(/[^\x00-\x7F]/.test(out), false);
  assert.match(out, /velakam tu 100 dej oph kod/);
});

test("fetchTranscript returns a Roman Hinglish transcript and caches it", async () => {
  let calls = 0;
  const seenUrls = [];
  const mockFetch = async (url) => {
    calls++;
    seenUrls.push(url);
    if (url === INNERTUBE_URL) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          captions: {
            playerCaptionsTracklistRenderer: {
              captionTracks: [
                {
                  baseUrl: "https://www.youtube.com/api/timedtext?v=VID&lang=en-IN&fmt=srv3",
                  languageCode: "en-IN",
                },
                {
                  baseUrl: "https://www.youtube.com/api/timedtext?v=VID&lang=hi&fmt=srv3",
                  languageCode: "hi",
                  kind: "asr",
                },
              ],
            },
          },
        }),
      };
    }
    // The timedtext fetch must ask for json3 (replacing srv3).
    assert.match(url, /fmt=json3/);
    assert.doesNotMatch(url, /fmt=srv3/);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        events: [{ segs: [{ utf8: "वेलकम " }, { utf8: "टू पाइथन" }] }],
      }),
    };
  };
  const first = await fetchTranscript("VID-cache-1", { fetchImpl: mockFetch });
  assert.deepEqual(first, {
    text: "velakam tu paithan",
    language: "hi-Latn",
    truncated: false,
  });
  assert.equal(calls, 2);
  // Second question about the same lesson: no re-fetch.
  const second = await fetchTranscript("VID-cache-1", { fetchImpl: mockFetch });
  assert.deepEqual(second, first);
  assert.equal(calls, 2);
  assert.equal(seenUrls[0], INNERTUBE_URL);
});

test("fetchTranscript keeps a hi-Latn track as-is and never throws", async () => {
  const mockFetch = async (url) => {
    if (url === INNERTUBE_URL) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          captions: {
            playerCaptionsTracklistRenderer: {
              captionTracks: [
                {
                  baseUrl: "https://www.youtube.com/api/timedtext?v=VID&lang=hi-Latn&fmt=srv3",
                  languageCode: "hi-Latn",
                },
              ],
            },
          },
        }),
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        events: [{ segs: [{ utf8: "welcome to python" }] }],
      }),
    };
  };
  const result = await fetchTranscript("VID-latn-1", { fetchImpl: mockFetch });
  assert.deepEqual(result, {
    text: "welcome to python",
    language: "hi-Latn",
    truncated: false,
  });
});

test("fetchTranscript returns null on failure and never throws", async () => {
  let calls = 0;
  const failingFetch = async () => {
    calls++;
    return { ok: false, status: 429, json: async () => ({}) };
  };
  assert.equal(
    await fetchTranscript("VID-fail-1", { fetchImpl: failingFetch }),
    null
  );
  assert.equal(calls, 1);
  // Negative cache: the retry does not hit YouTube again right away.
  assert.equal(
    await fetchTranscript("VID-fail-1", { fetchImpl: failingFetch }),
    null
  );
  assert.equal(calls, 1);

  const noTracksFetch = async (url) => {
    if (url === INNERTUBE_URL) {
      return { ok: true, status: 200, json: async () => ({}) };
    }
    throw new Error("should not be called");
  };
  assert.equal(
    await fetchTranscript("VID-notracks-1", { fetchImpl: noTracksFetch }),
    null
  );

  const throwingFetch = async () => {
    throw new Error("network down");
  };
  assert.equal(
    await fetchTranscript("VID-throw-1", { fetchImpl: throwingFetch }),
    null
  );
});
