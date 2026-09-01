// public/sw.js
const CACHE_NAME = 'san-fermin-2027-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Evitar interceptar llamadas directas a APIs externas de tiempo real si fallan
  if (url.origin !== self.location.origin && !url.hostname.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Intentar red primero
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla la red, usar caché
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
