const STATIC_CACHE_NAME = 'vikki-pedia-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'vikki-pedia-dynamic-v1.0.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/vite.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
];

// Image assets to cache
const IMAGE_ASSETS = [
  '/images/vikram.jpg',
  '/images/dev-placeholder.jpg',
  '/images/tech-placeholder.jpg',
  '/images/travel-placeholder.jpg',
  '/images/personal-placeholder.jpg',
  '/images/reflection-placeholder.jpg',
  '/images/story-placeholder.jpg',
  '/images/circus-placeholder.jpg',
  '/images/summer-holidays.jpg',
  '/images/classical-music.jpg',
  '/images/cricket-energy.jpg',
  '/images/advertising-blunders.jpg',
  '/images/new-year-2010.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event: any) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll([...STATIC_ASSETS, ...IMAGE_ASSETS]).catch((error) => {
        console.warn('Some assets failed to cache during install:', error);
        // Continue installation even if some assets fail
        return Promise.resolve();
      });
    }).then(() => {
      return (self as any).skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: any) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return (self as any).clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event: any) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip cross-origin requests and non-GET requests
  if (url.origin !== self.location.origin || request.method !== 'GET') {
    return;
  }

  // Handle different request types
  if (request.destination === 'image' || url.pathname.startsWith('/images/')) {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    // Don't cache API requests, always go to network
    event.respondWith(fetch(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle image requests with cache-first strategy
async function handleImageRequest(request: Request): Promise<Response> {
  try {
    // Check static cache first
    const cachedResponse = await caches.match(request, { cacheName: STATIC_CACHE_NAME });
    if (cachedResponse) {
      return cachedResponse;
    }

    // Check dynamic cache
    const dynamicCachedResponse = await caches.match(request, { cacheName: DYNAMIC_CACHE_NAME });
    if (dynamicCachedResponse) {
      return dynamicCachedResponse;
    }

    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone()).catch((error) => {
        console.warn('Failed to cache image:', error);
      });
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Image fetch failed', error);
    // Return a fallback image if available
    const fallback = await caches.match('/images/dev-placeholder.jpg');
    if (fallback) {
      return fallback;
    }
    return new Response('Image not available', { 
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// Handle static requests with network-first strategy for HTML, cache-first for assets
async function handleStaticRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  try {
    if (request.destination === 'document' || url.pathname === '/' || url.pathname.endsWith('.html')) {
      // Network-first strategy for HTML pages
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          const cache = await caches.open(DYNAMIC_CACHE_NAME);
          cache.put(request, networkResponse.clone()).catch((error) => {
            console.warn('Failed to cache HTML:', error);
          });
        }
        return networkResponse;
      } catch (networkError) {
        // Fallback to cache if network fails
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response(`
          <html>
            <head><title>Offline - Vikki-Pedia</title></head>
            <body>
              <h1>You're offline</h1>
              <p>This page is not available offline. Please check your connection and try again.</p>
            </body>
          </html>
        `, { 
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'text/html' }
        });
      }
    } else {
      // Cache-first strategy for static assets
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fetch from network and cache
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, networkResponse.clone()).catch((error) => {
          console.warn('Failed to cache asset:', error);
        });
      }
      return networkResponse;
    }
  } catch (error) {
    console.error('Service Worker: Request failed', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Request failed', { 
      status: 500,
      statusText: 'Internal Server Error'
    });
  }
}

// Background sync for when connection is restored
self.addEventListener('sync', (event: any) => {
  console.log('Service Worker: Background sync triggered');
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any queued actions when connection is restored
      Promise.resolve().then(() => {
        console.log('Service Worker: Background sync completed');
      })
    );
  }
});

// Push notifications (if needed in future)
self.addEventListener('push', (event: any) => {
  console.log('Service Worker: Push notification received');
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New update available!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'vikki-pedia-update',
      requireInteraction: false,
    };
    
    event.waitUntil(
      (self as any).registration.showNotification(data.title || 'Vikki-Pedia Update', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event: any) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    (self as any).clients.matchAll().then((clients: any[]) => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        (self as any).clients.openWindow('/');
      }
    })
  );
});

export {};