// Offline cache for the CFA guides. Bump CACHE whenever any file changes so iPads pick up the new version.
const CACHE = 'cfa-guides-v3';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'CFA-L1-Ethics-Guide.html',
  'CFA-L1-FSA-Guide.html',
  'CFA-L1-Equity-Guide.html',
  'CFA-L1-Fixed-Income-Guide.html',
  'CFA-L1-Portfolio-Management-Guide.html',
  'CFA-L1-Alternatives-Guide.html',
  'CFA-L1-Quant-Guide.html',
  'CFA-L1-Economics-Guide.html',
  'CFA-L1-Corporate-Issuers-Guide.html',
  'CFA-L1-Derivatives-Guide.html'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const sameOrigin = new URL(e.request.url).origin === location.origin;
  const save = res => { if (res.ok && sameOrigin) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; };
  // Pages: try the network first so updates show up right away; fall back to the saved copy offline.
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(fetch(e.request).then(save).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))));
    return;
  }
  // Everything else: saved copy first, network as backup.
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(save)));
});