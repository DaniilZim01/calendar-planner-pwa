const CACHE_NAME = "planner-cache-v4"; // bump to invalidate old caches
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/flow_daily_logo_192.png",
  "/icons/flow_daily_logo_512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Network-first for navigations (index.html) to avoid stale hashed assets references
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/"))
    );
    return;
  }

  // Cache-first for other requests, fallback to network
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});