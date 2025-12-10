/* ===========================
   CONFIG
   ============================ */
const CACHE_VERSION = "v1.0.0";
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const API_CACHE = `api-cache-${CACHE_VERSION}`;
const QUEUE_CACHE = `bg-queue-${CACHE_VERSION}`;
const OFFLINE_PAGE = "/offline.html";
const APP_SHELL = "/index.html";

const API_HOST = "https://prpl2025.fly.dev";

/* ===========================
   STATIC ASSETS TO PRECACHE
   ============================ */
const STATIC_ASSETS = [
  "/",               
  APP_SHELL,
  OFFLINE_PAGE,
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
  "/assets/hero1.jpg",
  "/assets/hero2.jpg",
  "/assets/hero3.jpg",

];


self.addEventListener("install", (event) => {
  console.log("[SW] install");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(STATIC_ASSETS);
      await cache.add(APP_SHELL).catch(() => {});
      await cache.add(OFFLINE_PAGE).catch(() => {});
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] activate");
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE && k !== QUEUE_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/* ===========================
   UTILITIES
   ============================ */
async function cachePut(cacheName, request, response) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
  } catch (err) {
    console.warn("[SW] cachePut failed:", err);
  }
}

async function cacheMatch(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    return await cache.match(request);
  } catch (err) {
    return null;
  }
}


// queue stored under key "queue" in QUEUE_CACHE as a JSON array
async function readQueue() {
  const cache = await caches.open(QUEUE_CACHE);
  const r = await cache.match("queue");
  if (!r) return [];
  try {
    const text = await r.text();
    return JSON.parse(text || "[]");
  } catch {
    return [];
  }
}

async function writeQueue(queue) {
  const cache = await caches.open(QUEUE_CACHE);
  await cache.put("queue", new Response(JSON.stringify(queue)));
}

async function enqueueRequest(entry) {
  const queue = await readQueue();
  queue.push(entry);
  await writeQueue(queue);
  console.log("[SW] queued request", entry.url);
}

async function popAllQueue() {
  const queue = await readQueue();
  await writeQueue([]); // clear
  return queue;
}

/* ===========================
   PROCESS QUEUE (called during 'sync')
   ============================ */
async function processQueue() {
  const queue = await popAllQueue();
  if (!queue || queue.length === 0) {
    console.log("[SW] queue empty");
    return;
  }

  for (const item of queue) {
    try {
      const headers = new Headers(item.headers || []);
      const res = await fetch(item.url, {
        method: item.method,
        headers: headers,
        body: item.body,
        credentials: "include",
      });

      if (!res || !res.ok) {
        // request failed — requeue
        console.warn("[SW] queued request failed, requeueing:", item.url, res && res.status);
        await enqueueRequest(item); // put it back
      } else {
        console.log("[SW] queued request succeeded:", item.url);
      }
    } catch (err) {
      // network error — requeue
      console.warn("[SW] queued request network error, requeueing:", item.url, err);
      await enqueueRequest(item);
    }
  }
}

/* ===========================
   SYNC EVENT
   ============================ */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-register") {
    event.waitUntil(
      (async () => {
        console.log("[SW] sync event triggered: processing queue");
        await processQueue();
      })()
    );
  }
});

/* ===========================
   FETCH HANDLER
   ============================ */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // NEVER intercept browser CORS preflight
  if (req.method === "OPTIONS") {
    return;
  }

  // 1) Navigation requests (SPA) -> network-first, fallback to cached app shell
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // prefer network so new updates are seen
          const networkResp = await fetch(req);
          // optionally update the static cache with the fresh index if needed
          // Note: only cache if response.ok and is same-origin
          if (networkResp && networkResp.ok && networkResp.type === "basic") {
            const clone = networkResp.clone();
            await cachePut(STATIC_CACHE, APP_SHELL, clone);
          }
          return networkResp;
        } catch (err) {
          // network failed -> serve cached app shell, else offline page
          const cachedShell = await cacheMatch(APP_SHELL, STATIC_CACHE) || await caches.match(APP_SHELL);
          if (cachedShell) return cachedShell;
          const offlineResp = await caches.match(OFFLINE_PAGE);
          if (offlineResp) return offlineResp;
          // fallback to a generic 503 Response
          return new Response("Offline", { status: 503, statusText: "Offline" });
        }
      })()
    );
    return;
  }

  // 2) Static assets -> cache-first
  const isStaticAsset = STATIC_ASSETS.includes(url.pathname);
  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        try {
          const networkResp = await fetch(req);
          if (networkResp && networkResp.ok) {
            const clone = networkResp.clone();
            await cachePut(STATIC_CACHE, req, clone);
          }
          return networkResp;
        } catch {
          // offline and no cached asset
          const fallback = await caches.match(OFFLINE_PAGE);
          return fallback || new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // 3) API caching for GET /api/events -> network-first with cache fallback

  if (req.method === "GET" && (url.origin === self.location.origin || url.origin === API_HOST) && url.pathname.startsWith("/api/events")) {
    event.respondWith(
      (async () => {
        try {
          const networkResp = await fetch(req);
          // if response is OK and not an opaque failed cors, cache it
          if (networkResp && networkResp.ok) {
            try {
              await cachePut(API_CACHE, req, networkResp.clone());
            } catch (err) {
              console.warn("[SW] failed to cache API response:", err);
            }
          }
          return networkResp;
        } catch (err) {
          // network failed -> try to return cached API response (if any)
          const cached = await caches.match(req);
          if (cached) return cached;
          // fallback to a JSON offline response (so frontend can detect)
          return new Response(JSON.stringify({ success: false, offline: true, data: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      })()
    );
    return;
  }

  // 4) Background sync: catch POST to /register (or contains '/register') and queue when offline
  if (req.method === "POST" && url.origin === self.location.origin || (req.method === "POST" && url.origin === API_HOST && url.pathname.includes("/register"))) {
    event.respondWith(
      (async () => {
        try {
          const networkResp = await fetch(req.clone());
          return networkResp;
        } catch (err) {
          // offline or network error -> queue request for later
          try {
            const bodyText = await req.clone().text();
            const headersArr = [];
            for (const pair of req.headers.entries()) headersArr.push(pair);
            const queueEntry = {
              url: req.url,
              method: req.method,
              headers: headersArr,
              body: bodyText,
              timestamp: Date.now(),
            };

            await enqueueRequest(queueEntry);

            // attempt to register a sync (if supported)
            if (self.registration && self.registration.sync) {
              try {
                await self.registration.sync.register("sync-register");
                console.log("[SW] sync registered");
              } catch (syncErr) {
                console.warn("[SW] sync registration failed:", syncErr);
              }
            }

            // return offline-saved response to client
            return new Response(JSON.stringify({
              success: true,
              offlineSaved: true,
              message: "Anda sedang offline. Pendaftaran disimpan & akan dikirim otomatis."
            }), {
              status: 200,
              headers: { "Content-Type": "application/json" }
            });
          } catch (queueErr) {
            console.error("[SW] queueing failed:", queueErr);
            return new Response(JSON.stringify({ success: false, message: "Failed to queue request" }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
      })()
    );
    return;
  }

  // 5) Default: try network, fallback to cache (for same-origin static-ish requests)
  event.respondWith(
    (async () => {
      try {
        return await fetch(req);
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        // nothing we can do
        return new Response("Offline", { status: 503 });
      }
    })()
  );
});

/* ===========================
   MESSAGE: allow clients to trigger queue processing
   ============================ */
self.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data === "process-queue") {
    event.waitUntil(processQueue());
  }
});

/* debug */
self.addEventListener("push", (e) => {
  // placeholder for push notifications if you add them later
});