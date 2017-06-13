const CACHE = 'my-cache-v2';
const urlsToCache = [
  '/',
  'index.html',
  'inline.bundle.js',
  'polyfills.bundle.js',
  'styles.bundle.js',
  'vendor.bundle.js',
  'main.bundle.js'
];

self.addEventListener('install', function (event) {

  event.waitUntil (
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(urlsToCache);á
    })
  )
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if( response)
        return response;
      return fetch(event.request);
    })
  )
})
