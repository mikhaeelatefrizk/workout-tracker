/* Service worker: caches the app shell so the page opens 100% offline.
   The 23 AthleanX videos are cached separately by the app itself (IndexedDB),
   and the video CDN is cross-origin, so we deliberately don't touch it here. */
const CACHE = 'workout-shell-v15';
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
  const isDoc = e.request.mode === 'navigate' || e.request.destination === 'document';
  if (isDoc) {
    // STALE-WHILE-REVALIDATE for the app shell: serve the cached page INSTANTLY (native-app feel,
    // no reload-from-scratch on reopen), then refresh the cache from the network in the background
    // so the next open has the latest. Falls back to network on a cold cache, cache when offline.
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const network = fetch(e.request, { cache: 'no-store' }).then((resp) => {
        if (resp && resp.ok) cache.put('./index.html', resp.clone());
        return resp;
      }).catch(() => null);
      const cached = await cache.match('./index.html');
      return cached || (await network) || cache.match('./');
    })());
    return;
  }
  // Other same-origin assets: cache-first with a quiet background refresh.
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request);
    const network = fetch(e.request).then((resp) => {
      if (resp && resp.ok) cache.put(e.request, resp.clone());
      return resp;
    }).catch(() => null);
    return cached || (await network);
  })());
});
