const CACHE_NAME = 'kdi-center-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo-kdi.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
// Menangani aksi saat notifikasi diklik
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Tutup notifikasi
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // Jika aplikasi sedang terbuka, fokuskan tab-nya
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Jika belum terbuka, buka jendela baru
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
