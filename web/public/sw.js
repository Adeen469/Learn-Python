// Offline service worker for the Learn Python website. Hand-rolled,
// no dependency. Precaches the app shell; serves navigations
// network-first with cache fallback; static assets cache-first.
//
// Videos are NEVER cached here — they live in the separate videos
// cache owned by VideoPlayer's Save Offline flow, and /api/video/*
// requests pass straight through untouched.
// The Pyodide runtime (~90MB) is never cached here either.

const VERSION = "v1";
const PAGES = `lp-sw-${VERSION}-pages`;
const STATIC = `lp-sw-${VERSION}-static`;
const DATA = `lp-sw-${VERSION}-data`;
const CURRENT = [PAGES, STATIC, DATA];
const PREFIX = "lp-sw-";

// /learn has no page of its own — the entry point is python-home.
const PRECACHE = [
  "/",
  "/learn/python-home",
  "/courses",
  "/offline",
  "/lp-logo.png",
  "/icon.png",
];
const STATIC_EXT = /\.(png|jpg|jpeg|webp|avif|gif|svg|ico|woff2?|ttf|otf|css|js)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) =>
        Promise.all(
          PRECACHE.map((url) => cache.add(url).catch(() => undefined)),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith(PREFIX) && !CURRENT.includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin)
    return;
  // Video streams and the Pyodide runtime: never cached, pass through.
  if (
    url.pathname.startsWith("/api/video/") ||
    url.pathname.startsWith("/pyodide/")
  )
    return;
  if (request.mode === "navigate") {
    event.respondWith(navigate(request));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }
  if (url.pathname === "/api/lessons") {
    event.respondWith(networkFirstData(request));
    return;
  }
  if (STATIC_EXT.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }
  // Everything else (auth, AI, GitHub, RSC payloads, ...): network only.
});

async function navigate(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(PAGES);
      cache.put(request, res.clone()).catch(() => undefined);
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match("/offline");
    if (offline) return offline;
    throw new Error("offline");
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, res.clone()).catch(() => undefined);
  }
  return res;
}

async function networkFirstData(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(DATA);
      cache.put(request, res.clone()).catch(() => undefined);
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error("offline");
  }
}
