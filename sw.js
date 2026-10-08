/* Aleeza Squish Club service worker. Generated into dist/sw.js by vite.config.ts.
 * It caches the app and the whole launch catalogue so the game runs offline. It never touches IndexedDB,
 * so clearing or updating these caches can never remove a player's collection. */
const VERSION = 'aab3918bea84';
const PRECACHE = ["assets/baloo-2-latin-700-normal-CqTg7A15.woff2","assets/baloo-2-latin-800-normal-BbF3Etk1.woff2","assets/clues/0c9db44c.svg","assets/clues/109c8e11.svg","assets/clues/221e03bd.svg","assets/clues/27587545.svg","assets/clues/2b7d4e32.svg","assets/clues/31806ec7.svg","assets/clues/34fca533.svg","assets/clues/3ace7762.svg","assets/clues/3bf62a2d.svg","assets/clues/4a3d35a6.svg","assets/clues/4eab5aa0.svg","assets/clues/517eb20f.svg","assets/clues/5474d01f.svg","assets/clues/60243005.svg","assets/clues/73a5a197.svg","assets/clues/77d9a49b.svg","assets/clues/9f6a81e7.svg","assets/clues/b6f214e9.svg","assets/clues/ba86f8c8.svg","assets/clues/c5bf9cc3.svg","assets/clues/c92886d2.svg","assets/clues/db0bba0d.svg","assets/clues/fa34610c.svg","assets/clues/fba41b79.svg","assets/esm-DzlRvdJX.js","assets/fraunces-latin-700-normal-CEOla-zY.woff2","assets/fraunces-latin-800-normal-5RM8DebB.woff2","assets/index-CL1OntHl.css","assets/index-hFAh5x7w.js","assets/nunito-sans-latin-400-normal-AkRraKH2.woff2","assets/nunito-sans-latin-600-normal-BtVRvDNj.woff2","assets/nunito-sans-latin-700-normal-CICRJDmU.woff2","assets/nunito-sans-latin-800-normal-MgCk9Q3Y.woff2","assets/scene/app-icon.svg","assets/scene/box-base-open.svg","assets/scene/box-closed.svg","assets/scene/box-lid.svg","assets/scene/shelf-unit.svg","assets/scene/trail-cloud-delivery.svg","assets/scene/trail-missing-cafe-order.svg","assets/toys/butter-classic/card.svg","assets/toys/butter-classic/silhouette.svg","assets/toys/butter-peach/card.svg","assets/toys/butter-peach/silhouette.svg","assets/toys/butter-pearl/card.svg","assets/toys/butter-pearl/silhouette.svg","assets/toys/butter-swirl/card.svg","assets/toys/butter-swirl/silhouette.svg","assets/toys/cloud-lavender/card.svg","assets/toys/cloud-lavender/silhouette.svg","assets/toys/cloud-mint-swirl/card.svg","assets/toys/cloud-mint-swirl/silhouette.svg","assets/toys/cloud-pearl/card.svg","assets/toys/cloud-pearl/silhouette.svg","assets/toys/cloud-twilight/card.svg","assets/toys/cloud-twilight/silhouette.svg","assets/toys/cube-frost/card.svg","assets/toys/cube-frost/silhouette.svg","assets/toys/cube-lavender/card.svg","assets/toys/cube-lavender/silhouette.svg","assets/toys/cube-swirl/card.svg","assets/toys/cube-swirl/silhouette.svg","assets/toys/cube-teal/card.svg","assets/toys/cube-teal/silhouette.svg","assets/toys/drop-lavender/card.svg","assets/toys/drop-lavender/silhouette.svg","assets/toys/drop-pink/card.svg","assets/toys/drop-pink/silhouette.svg","assets/toys/drop-rainbow/card.svg","assets/toys/drop-rainbow/silhouette.svg","assets/toys/drop-teal/card.svg","assets/toys/drop-teal/silhouette.svg","assets/toys/dumpling-celestial/card.svg","assets/toys/dumpling-celestial/silhouette.svg","assets/toys/dumpling-cream/card.svg","assets/toys/dumpling-cream/silhouette.svg","assets/toys/dumpling-lavender-swirl/card.svg","assets/toys/dumpling-lavender-swirl/silhouette.svg","assets/toys/dumpling-rainbow/card.svg","assets/toys/dumpling-rainbow/silhouette.svg","assets/toys/gumdrop-lavender/card.svg","assets/toys/gumdrop-lavender/silhouette.svg","assets/toys/gumdrop-mint-pearl/card.svg","assets/toys/gumdrop-mint-pearl/silhouette.svg","assets/toys/gumdrop-peach/card.svg","assets/toys/gumdrop-peach/silhouette.svg","assets/toys/gumdrop-rainbow/card.svg","assets/toys/gumdrop-rainbow/silhouette.svg","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","index.html","manifest.webmanifest"];
const CACHE = 'squish-precache-' + VERSION;

const broadcast = async (msg) => {
  const all = await self.clients.matchAll({ includeUncontrolled: true });
  for (const c of all) c.postMessage(msg);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      let done = 0;
      const total = PRECACHE.length;
      await broadcast({ type: 'progress', done, total });
      // A few at a time keeps the first load quick without opening hundreds of requests at once.
      const queue = [...PRECACHE];
      const worker = async () => {
        while (queue.length) {
          const url = queue.shift();
          const res = await fetch(new Request(new URL(url, self.registration.scope), { cache: 'reload' }));
          if (!res.ok) throw new Error('Could not download ' + url);
          await cache.put(new URL(url, self.registration.scope), res);
          done++;
          if (done % 4 === 0 || done === total) await broadcast({ type: 'progress', done, total });
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
      // The folder URL and index.html are the same document.
      const index = await cache.match(new URL('index.html', self.registration.scope));
      if (index) await cache.put(new URL('./', self.registration.scope), index.clone());
      // Deliberately no skipWaiting: a new version waits until the player chooses to update between rounds.
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('squish-precache-') && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
      await broadcast({ type: 'ready', version: VERSION });
    })(),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'skip') self.skipWaiting();
  if (data.type === 'status') {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        const keys = await cache.keys();
        const ready = keys.length >= PRECACHE.length;
        event.source && event.source.postMessage({ type: ready ? 'ready' : 'progress', done: keys.length, total: PRECACHE.length, version: VERSION });
      })(),
    );
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req, { ignoreSearch: true, ignoreVary: true });
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const shell = await cache.match(new URL('index.html', self.registration.scope));
        if (shell) return shell;
      }
      try {
        return await fetch(req);
      } catch (err) {
        if (req.mode === 'navigate') {
          const shell = await cache.match(new URL('index.html', self.registration.scope));
          if (shell) return shell;
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })(),
  );
});
