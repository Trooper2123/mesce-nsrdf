const CACHE = 'mesce-poc-static-v7';
const ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/privacidade.html', '/pwa.html', '/app/privacy.js', '/app/scheduling.js', '/app/visits.js', '/app/accessibility.css'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Never intercept/cache operational HTML, JS, API or auth configuration.
  if (url.pathname === '/operacional.html' || url.pathname === '/app/operational.js' ||
      url.pathname.startsWith('/api/') || url.pathname.startsWith('/dev/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() =>
      url.pathname === '/' || url.pathname === '/index.html'
        ? caches.match('/index.html') : Response.error()));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
// POC: only static assets cached. Never cache authenticated APIs or personal data.
