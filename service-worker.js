// service-worker.js

// Define a cache name
const CACHE_NAME = 'pink-kitty-maze-cache-v1';
// List the files to cache initially
const urlsToCache = [
  '.', // Cache the root (index.html)
  'index.html', // Explicitly cache index.html
  // Add paths to your CSS, JS libraries if they were separate files
  // (Currently, your CSS and JS are inline, so only HTML is needed)
  // Add paths to your icons once you create them:
  'icons/icon-72x72.png',
  'icons/icon-96x96.png',
  'icons/icon-128x128.png',
  'icons/icon-144x144.png',
  'icons/icon-152x152.png',
  'icons/icon-192x192.png',
  'icons/icon-384x384.png',
  'icons/icon-512x512.png',
  // Add external libraries if needed (Tone.js is loaded via CDN, might not cache reliably this way)
  // 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js' // Example - may have cross-origin issues
];

// Install event: Cache the core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  // Prevent the worker from being killed until the cache is updated
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        // Add all URLs to the cache
        // Use { cache: 'reload' } to bypass HTTP cache for these requests
        return Promise.all(
            urlsToCache.map(url => {
                return cache.add(url).catch(err => {
                    console.warn(`[Service Worker] Failed to cache ${url}:`, err);
                });
            })
        );
      })
      .then(() => self.skipWaiting()) // Activate worker immediately
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If this cache name is not in the whitelist, delete it
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of open clients immediately
  );
});

// Fetch event: Serve cached content when offline
self.addEventListener('fetch', event => {
  console.log('[Service Worker] Fetch', event.request.url);
  // Use a cache-first strategy
  event.respondWith(
    caches.match(event.request) // Check if the request is in the cache
      .then(response => {
        // Return the cached response if found, otherwise fetch from network
        return response || fetch(event.request).then(fetchResponse => {
            // Optional: Cache dynamically fetched resources if needed
            // Be careful caching external resources like CDNs
            return fetchResponse;
        }).catch(err => {
            console.error('[Service Worker] Fetch failed:', err);
            // You could return a fallback offline page here if desired
        });
      })
  );
});

