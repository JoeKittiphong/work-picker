/**
 * Service Worker — Work Picker PWA
 *
 * Strategy:
 *  - App shell (HTML, CSS, JS, fonts) → Cache First
 *  - Navigation requests → Network First with cache fallback
 */

const CACHE_NAME = 'work-picker-v1'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

/* ── Install: pre-cache app shell ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

/* ── Activate: clean old caches ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

/* ── Fetch: cache-first for assets, network-first for navigation ── */
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET
  if (request.method !== 'GET') return

  // Navigation: network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // Assets: cache first, fallback to network (and cache the response)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        // Only cache same-origin & successful responses
        if (response.ok && request.url.startsWith(self.location.origin)) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})
