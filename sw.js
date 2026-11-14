const CACHE_NAME = 'avia-calc-v1';
const ASSETS = [
  './',
  './index.html'
];

// Установка: кэшируем основные файлы
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Активация: удаляем старые кэши, если версия изменилась
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов: если нет сети, отдаем из кэша
self.addEventListener('fetch', (event) => {
  // Мы кэшируем только GET запросы
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Если сети нет и файла нет в кэше, возвращаем главную страницу
        return caches.match('./index.html');
      });
    })
  );
});
