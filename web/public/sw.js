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
    Promise.all([caches.open(PAGES), caches.open(STATIC)])
      .then(([pages, statics]) =>
        Promise.all(
          PRECACHE.map((url) => precachePage(pages, statics, url)),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

// A precached page alone renders unstyled offline — cache the
// /_next/static/ chunks its HTML references, too. Asset failures
// never fail the page; images (logo, icon) have no chunks to parse.
async function precachePage(cache, statics, url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    await cache.put(url, res.clone());
    if (!(res.headers.get("content-type") || "").includes("text/html"))
      return;
    const html = await res.text();
    const assets = [
      ...new Set(html.match(/\/_next\/static\/[^\s"'\)]+/g) || []),
    ];
    const missing = [];
    for (const a of assets) {
      const hit = await statics.match(a).catch(() => null);
      if (!hit) missing.push(a);
    }
    await Promise.all(
      missing.map((a) => statics.add(a).catch(() => undefined)),
    );
  } catch {
    // Page stays uncached; the navigation fallback serves /offline.
  }
}

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

// Pages whose HTML must never be cached (R2-M16): authed /
// session-scoped pages. A cached /settings page served offline
// would render the previous user's streak/progress on a shared
// device, and /auth/*, /github, /editor pages carry session-scoped
// content. They always go to the network; offline they fall back
// to /offline instead of a stale cached copy (the guard covers
// copies an older worker cached, too).
function isNoCacheNav(pathname) {
  return (
    pathname.startsWith("/auth/") ||
    pathname === "/github" ||
    pathname.startsWith("/github/") ||
    pathname === "/editor" ||
    pathname.startsWith("/editor/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/")
  );
}

async function navigate(request) {
  const noCache = isNoCacheNav(new URL(request.url).pathname);
  try {
    const res = await fetch(request);
    if (res.ok && !noCache) {
      const cache = await caches.open(PAGES);
      cache.put(request, res.clone()).catch(() => undefined);
    }
    return res;
  } catch {
    if (!noCache) {
      const cached = await caches.match(request);
      if (cached) return cached;
    }
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
