const CACHE_NAME = 'sothuchi-v7-cache-v6';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/config.js?v=7.6',
  './js/theme.js?v=7.6',
  './js/voice.js?v=7.6',
  './js/categories.js?v=7.6',
  './js/promotions.js?v=7.6',
  './js/products.js?v=7.6',
  './js/plans.js?v=7.6',
  './js/transactions.js?v=7.6',
  './js/pos.js?v=7.6',
  './js/reports.js?v=7.6',
  './js/app.js?v=7.6',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
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
  const url = new URL(e.request.url);

  // Cache-First for static third-party CDNs (e.g. SheetJS, Tailwind, Firebase, ChartJS, Fonts)
  if (url.origin !== self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Network-First for local files (so updates are reflected instantly when online)
    e.respondWith(
      fetch(e.request)
        .then(networkResponse => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(e.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(e.request);
        })
    );
  }
});
