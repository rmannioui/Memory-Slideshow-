/**
 * Service Worker for Memory Slideshow & Dynamic TV Frame
 * Ensures offline caching for uninterrupted TV photo frame display.
 */

const CACHE_NAME = 'memory-slideshow-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app-ads.txt',
  './css/style.css',
  './js/app.js',
  './js/i18n.js',
  './manifest.json',
  './assets/icons/icon.png',
  './assets/images/demo_memorial_candle.jpg',
  './assets/images/demo_serene_lake.jpg',
  './assets/images/demo_autumn_path.jpg',
  './assets/images/demo_sunset_ocean.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
