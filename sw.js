const CACHE_NAME = 'sothuchi-v7-cache-v4';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/config.js',
  './js/theme.js',
  './js/voice.js',
  './js/categories.js',
  './js/promotions.js',
  './js/products.js',
  './js/plans.js',
  './js/transactions.js',
  './js/pos.js',
  './js/reports.js',
  './js/app.js',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
