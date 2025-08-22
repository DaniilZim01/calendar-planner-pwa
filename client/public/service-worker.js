const CACHE_NAME = "planner-cache-v5"; // bump to invalidate old caches
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

// Handle incoming push messages
self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'FlowDaily';
    const options = {
      body: data.body || 'Напоминание',
      icon: data.icon || '/icons/flow_daily_logo_192.png',
      badge: data.badge || '/icons/flow_daily_logo_192.png',
      data: { url: data.url || '/', ...data.data },
      actions: Array.isArray(data.actions) ? data.actions : undefined,
      tag: data.tag || undefined,
      requireInteraction: Boolean(data.requireInteraction),
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // Fallback if payload is not JSON
    event.waitUntil(self.registration.showNotification('FlowDaily', { body: event.data && event.data.text() }));
  }
});

// Focus/open app when user clicks on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = allClients.find((c) => c.url.includes(targetUrl));
      if (existing && 'focus' in existing) {
        return existing.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});