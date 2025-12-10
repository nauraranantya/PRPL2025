/* ============================================
   CONFIG
============================================ */
const CACHE_NAME = "static-v1";
const API_CACHE = "api-v1";
const QUEUE_CACHE = "register-queue-v1";

/* ============================================
   INSTALL STATIC SHELL
============================================ */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        "/",              // CRA shell
        "/index.html",
        "/offline.html",
      ])
    )
  );
  self.skipWaiting();
});

/* ============================================
   ACTIVATE
============================================ */
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* ============================================
   SIMPLE QUEUE (using Cache Storage)
============================================ */
async function queueRequest(entry) {
  const cache = await caches.open(QUEUE_CACHE);
  let list = await cache.match("queue");

  let queue = [];
  if (list) queue = JSON.parse(await list.text());

  queue.push(entry);

  await cache.put("queue", new Response(JSON.stringify(queue)));
}

async function popQueue() {
  const cache = await caches.open(QUEUE_CACHE);
  const list = await cache.match("queue");

  if (!list) return [];

  const queue = JSON.parse(await list.text());
  await cache.put("queue", new Response(JSON.stringify([]))); // clear

  return queue;
}

/* ============================================
   BACKGROUND SYNC HANDLER
============================================ */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-register") {
    event.waitUntil(processQueuedRegistrations());
  }
});

async function processQueuedRegistrations() {
  const queue = await popQueue();

  for (const r of queue) {
    try {
      const hdrs = new Headers(r.headers);
      await fetch(r.url, {
        method: r.method,
        headers: hdrs,
        body: r.body,
      });
      console.log("[SW] Background sync success:", r.url);
    } catch (err) {
      console.warn("[SW] Retry failed — requeueing:", r.url);
      await queueRequest(r); // Put back in queue
    }
  }
}

/* ============================================
   FETCH HANDLER — Background Sync for /register
============================================ */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Intercept POST register requests
  if (req.method === "POST" && url.pathname.includes("/register")) {
    event.respondWith(handleRegisterRequest(req));
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((c) => c || caches.match("/offline.html")))
  );
});

async function handleRegisterRequest(req) {
  try {
    // Try online first
    const res = await fetch(req.clone());
    return res;
  } catch (err) {
    console.warn("[SW] Offline, queueing register request");

    // Prepare serialized request
    const headers = [...req.headers.entries()];
    const body = await req.clone().text();

    await queueRequest({
      url: req.url,
      method: req.method,
      headers,
      body,
      timestamp: Date.now(),
    });

    // Ask browser to run background sync when online
    if (self.registration && self.registration.sync) {
      try {
        await self.registration.sync.register("sync-register");
      } catch (e) {
        console.warn("[SW] Could not register sync:", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        offlineSaved: true,
        message: "Anda offline — pendaftaran disimpan dan akan dikirim otomatis.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}