/* Service Worker - 高三(8)班班主任工作台 */
var CACHE = 'wb-app-v2';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  // 数据/API 请求不缓存，直连网络
  if (/\/baas|\?api|\.json\?/.test(e.request.url) && e.request.url.indexOf('manifest.json') < 0) return;
  e.respondWith(
    caches.match(e.request).then(function (res) {
      return res || fetch(e.request).then(function (r) {
        if (r && r.ok) {
          var cl = r.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, cl); });
        }
        return r;
      }).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});
