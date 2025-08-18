const CACHE_NAME = 'vikki-pwa-v1'

self.addEventListener('install', (e: any) => {
  e.waitUntil((self as any).skipWaiting())
})
self.addEventListener('activate', (e: any) => {
  e.waitUntil((self as any).clients.claim())
})
self.addEventListener('fetch', (e: any) => {
  // simple network-first for HTML, cache-first for static
  const req = e.request
  if (req.method !== 'GET') return
  e.respondWith(
    caches.open(CACHE_NAME).then(() => 
      fetch(req).catch(() => caches.match(req))
    )
  )
})
