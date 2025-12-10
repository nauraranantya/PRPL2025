/* ===========================
   VERSION & CACHE NAMES
=========================== */
const CACHE_VERSION = "v1.0.0";
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const API_CACHE = `api-cache-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

/* ===========================
   STATIC ASSETS TO PRE-CACHE
=========================== */
const STATIC_ASSETS = [
  "/",               // main HTML
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",

  // your images
  "/assets/hero1.jpg",
  "/assets/hero2.jpg",
  "/assets/hero3.jpg",
];

/* ===========================
   INSTALL (cache static files)
=========================== */
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

/* ===========================
   ACTIVATE (delete old caches)
=========================== */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

/* ===========================
   FETCH HANDLING
=========================== */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Return offline HTML for navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 2. Cache-first for static files
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            return caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
        );
      })
    );
    return;
  }

  // 3. API caching for GET /api/events
  if (
    event.request.method === "GET" &&
    url.pathname.startsWith("/api/events")
  ) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // 4. Background Sync for POST /register
  if (
    event.request.method === "POST" &&
    url.pathname.includes("/register")
  ) {
    event.respondWith(bgSyncRequest(event.request));
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

/* ===========================
   STRATEGY: Network First
=========================== */
async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(API_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    return caches.match(request);
  }
}

/* ===========================
   BACKGROUND SYNC QUEUE
=========================== */
const REGISTER_QUEUE = "register-queue";

// Save failed POST request for retry
async function bgSyncRequest(request) {
  try {
    return await fetch(request); // try online
  } catch (err) {
    const reqClone = {
      url: request.url,
      method: request.method,
      body: await request.clone().text(),
      headers: [...request.headers],
    };

    const queue = await openQueue();
    queue.push(reqClone);

    console.log("[SW] Queued registration for retry:", reqClone);

    return new Response(
      JSON.stringify({
        success: true,
        offlineSaved: true,
        message: "Anda sedang offline. Pendaftaran disimpan & akan dikirim otomatis.",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}

async function openQueue() {
  const cache = await caches.open(REGISTER_QUEUE);
  const stored = await cache.match("queue");
  const queue = stored ? await stored.json() : [];

  return {
    async push(entry) {
      queue.push(entry);
      await cache.put("queue", new Response(JSON.stringify(queue)));
    },
    async popAll() {
      const q = [...queue];
      queue.length = 0;
      await cache.put("queue", new Response(JSON.stringify(queue)));
      return q;
    },
  };
}

/* ===========================
   BACKGROUND SYNC EVENT
=========================== */
self.addEventListener("sync", async (event) => {
  if (event.tag === "sync-register") {
    console.log("[SW] Running background sync for registrations");
    event.waitUntil(processQueue());
  }
});

async function processQueue() {
  const queue = await openQueue();
  const entries = await queue.popAll();

  for (const req of entries) {
    try {
      await fetch(req.url, {
        method: req.method,
        body: req.body,
        headers: req.headers,
      });
      console.log("[SW] Successfully retried:", req.url);
    } catch (err) {
      console.warn("[SW] Retry failed, requeueing:", req.url);
      queue.push(req);
    }
  }
}