const CACHE_VERSION = 'lendora-v1';
const RUNTIME_CACHE = 'lendora-runtime-v1';
const API_CACHE = 'lendora-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vendor/react/react.production.min.js',
  '/vendor/react-dom/react-dom.production.min.js',
  '/vendor/framer-motion/framer-motion.js',
  '/vendor/leaflet/leaflet.js',
  '/vendor/leaflet/leaflet.css',
  '/standalone/lendora-app.js',
  '/styles/lendora-tailwind.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('Cache install warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first for API, cache first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok) throw new Error(`API Error: ${response.status}`);
          
          // Cache successful API responses
          const cache = caches.open(API_CACHE);
          cache.then((c) => c.put(event.request, response.clone()));
          
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(event.request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Return offline error response
              return new Response(
                JSON.stringify({
                  error: 'Offline - content from cache',
                  cached: true
                }),
                { 
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Static assets - cache first with network fallback
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const cache = caches.open(RUNTIME_CACHE);
          cache.then((c) => c.put(event.request, response.clone()));

          return response;
        });
      })
      .catch(() => {
        // Return cached version or offline page
        return caches.match('/index.html');
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
  if (event.tag === 'sync-rentals') {
    event.waitUntil(syncRentals());
  }
});

async function syncMessages() {
  const db = await openDB();
  const messages = await db.getAll('pendingMessages');
  
  for (const msg of messages) {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      
      if (response.ok) {
        await db.delete('pendingMessages', msg.id);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }
  }
}

async function syncRentals() {
  // Similar to syncMessages
  console.log('Syncing pending rentals...');
}

// Helper to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('lendora', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingRentals')) {
        db.createObjectStore('pendingRentals', { keyPath: 'id' });
      }
    };
  });
}
