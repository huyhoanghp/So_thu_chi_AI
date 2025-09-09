// Tên của bộ nhớ cache
const CACHE_NAME = 'sothuchi-pro-cache-v1';

// Danh sách các tệp cần được lưu vào bộ nhớ cache khi cài đặt
const urlsToCache = [
  './QLTC_12_AI_Chinh hien thi nut_2.html',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
];

// Sự kiện 'install': được gọi khi Service Worker được cài đặt lần đầu
self.addEventListener('install', event => {
  // Chờ cho đến khi quá trình caching hoàn tất
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Thêm tất cả các tệp trong danh sách vào cache
        return cache.addAll(urlsToCache);
      })
  );
});

// Sự kiện 'fetch': được gọi mỗi khi có một yêu cầu mạng từ ứng dụng
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Nếu tìm thấy yêu cầu trong cache, trả về phản hồi từ cache
        if (response) {
          return response;
        }
        // Nếu không, thực hiện yêu cầu mạng
        return fetch(event.request);
      })
  );
});

// Sự kiện 'activate': được gọi khi Service Worker được kích hoạt
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Xóa các cache cũ không còn được sử dụng
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
