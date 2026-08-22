const CACHE_NAME = 'asnen-2026-v1';
const MAIN_URL = '/angelurlaub-schweden-2026/index.html';
const MANIFEST_URL = '/angelurlaub-schweden-2026/manifest.json';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([MAIN_URL, MANIFEST_URL]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Skip non-GET requests and external URLs
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Cache-first for our own page
  if (url.pathname.startsWith('/angelurlaub-schweden-2026/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        // Return cached version immediately, then try to update
        const fetchPromise = fetch(event.request).then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});