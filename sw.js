const SHELL_CACHE = 'lendora-shell-v2';
const RUNTIME_CACHE = 'lendora-runtime-v2';
const OFFLINE_ASSETS = [
  './',
  './index.html',
  './Lendora.html',
  './manifest.webmanifest',
  './icons/lendora-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(OFFLINE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(request, response.clone());
  return response;
};

const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || networkPromise;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match('./Lendora.html') || caches.match('./index.html'))
    );
    return;
  }

  if (isSameOrigin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (/\.(png|jpg|jpeg|svg|webp|gif)$/i.test(url.pathname) || request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => (await caches.match(request)) || caches.match('./Lendora.html'))
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data.json();
  } catch (error) {
    payload = { title: 'Lendora', body: event.data ? event.data.text() : 'You have an update' };
  }

  const title = payload.title || 'Lendora';
  const options = {
    body: payload.body || payload.message || 'You have an update',
    icon: payload.icon || './icons/lendora-icon.svg',
    data: payload.data || {},
    tag: payload.tag || undefined
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
      return undefined;
    })
  );
});
