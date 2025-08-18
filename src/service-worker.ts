const CACHE = 'vikki-pwa-v1'

self.addEventListener('install', (e: any) => {
  e.waitUntil(self.skipWaiting())
})
self.addEventListener('activate', (e: any) => {
  e.waitUntil(self.clients.claim())
})
self.addEventListener('fetch', (e: any) => {
  // simple network-first for HTML, cache-first for static
  const req = e.request
  if (req.method !== 'GET') return
  e.respondWith(
    fetch(req).catch(() => caches.match(req))
  )
})
