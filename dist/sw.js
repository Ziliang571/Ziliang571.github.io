const CACHE_NAME = 'infinity-bookmarks-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/empty-bookmarks.png',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/App.css',
  '/src/index.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions (placeholder)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
});

// Push notifications (placeholder)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '您有新的书签更新',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('无限书签', options)
  );
});

// Helper functions
async function syncBookmarks() {
  // Implementation for syncing bookmarks when back online
  console.log('Syncing bookmarks...');
}
