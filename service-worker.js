const CACHE_NAME = 'healwise-cache-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/logo.svg'
];

// On install, pre-cache the main app shell files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching App Shell');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

// On activate, clean up old caches to save space
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// On fetch, use a "network falling back to cache" strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        // Try to fetch from the network first
        const networkResponse = await fetch(event.request);
        
        // If successful, cache the new response and return it
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        // If the network fails, try to serve from the cache
        console.log('Network request failed, trying cache for:', event.request.url);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If not in cache, the request fails. A real-world app might
        // show a custom offline page here.
        return new Response("You are offline. Please check your internet connection.", {
           status: 404,
           statusText: "Offline",
           headers: {'Content-Type': 'text/plain'}
        });
      }
    })
  );
});
