// Lightweight Service Worker for offline caching (HTML, CSS, JS, JSON, images)
const CACHE_NAME = 'swadist-cache-v1';
const OFFLINE_ASSETS = [
  '/',
  'index.html',
  'menu-data.json',
  'images/logo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // only cache GET requests for HTML/JSON/images
  if (req.method !== 'GET') return;
  if (req.url.match(/\.(mp4|webm)$/i)) return; // skip videos
  e.respondWith(
    caches.match(req).then(cacheRes =>
      cacheRes ||
      fetch(req).then(networkRes => {
        if (networkRes.ok && req.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then(c => c.put(req, networkRes.clone()));
        }
        return networkRes;
      }).catch(() => caches.match('index.html'))
    )
  );
});