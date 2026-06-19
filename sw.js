/* Service worker: caches the app shell so the page opens 100% offline.
   The 23 AthleanX videos are cached separately by the app itself (IndexedDB),
   and the video CDN is cross-origin, so we deliberately don't touch it here. */
const CACHE = 'workout-shell-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // ignore cross-origin
  if (url.pathname.endsWith('.mp4')) return; // videos are cached by the app in IndexedDB — don't double-store
  // Network-first: always get the freshest app when online; fall back to cache offline.
  e.respondWith(
    fetch(e.request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
