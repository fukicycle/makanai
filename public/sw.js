const CACHE_NAME = 'makanai-cache-v2';
const ASSETS = [
  '/makanai/',
  '/makanai/index.html',
  '/makanai/favicon.svg',
  '/makanai/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
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
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-http schemes (e.g., chrome-extension)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Only cache valid GET responses with status 200
        // Cache same-origin assets (JS, CSS, images) and Google Fonts
        const isSameOrigin = event.request.url.startsWith(self.location.origin);
        const isGoogleFont = event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('fonts.gstatic.com');

        if (!response || response.status !== 200 || (!isSameOrigin && !isGoogleFont)) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Offline fallback
      });
    })
  );
});