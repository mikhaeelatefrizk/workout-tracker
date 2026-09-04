/* Service worker for Rafael's tracker — registered at /workout-tracker/rafael/sw.js,
   so its scope is ONLY /workout-tracker/rafael/. It caches just this app's own shell
   so the page opens offline. It deliberately:
     - ignores cross-origin requests,
     - only ever deletes caches whose name starts with 'rafael-',
   so it can never read, evict, or interfere with the main workout app's cache or data. */
const CACHE = 'rafael-shell-v5';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('rafael-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // ignore cross-origin
  const isDoc = e.request.mode === 'navigate' || e.request.destination === 'document';
  e.respondWith(
    fetch(e.request, isDoc ? { cache: 'no-store' } : {}).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
