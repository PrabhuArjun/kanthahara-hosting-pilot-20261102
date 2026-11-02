/* Only this app's shell and two corpora are cached. Books remain explicit downloads. */
'use strict';

const BASE = new URL('./', self.location.href);
const CACHE_PREFIX = `sevakunj-study:${self.registration.scope}:`;
const CACHE_NAME = `${CACHE_PREFIX}v2-collections`;
const ASSETS = ['index.html', 'styles.css', 'app.js', 'corpus.json', 'kanthahara.json'].map((file) => new URL(file, BASE).href);
const ASSET_PATHS = new Map(ASSETS.map((url) => [new URL(url).pathname, url]));

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== BASE.origin) return;
  const isHome = request.mode === 'navigate' && (url.pathname === BASE.pathname || url.pathname === new URL('index.html', BASE).pathname);
  const key = isHome ? new URL('index.html', BASE).href : ASSET_PATHS.get(url.pathname);
  if (!key) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        event.waitUntil(cache.put(key, copy).catch(() => {}));
      }
      // A missing online file remains a real error, rather than an old edition.
      return response;
    } catch {
      const saved = await cache.match(key);
      return saved || new Response('Offline. Please reconnect to open the collection.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  })());
});
