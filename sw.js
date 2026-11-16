/* English Quest service worker — caches the app so it works offline */
const CACHE = 'english-quest-v2';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/app.css', './assets/icon.svg',
  './js/data.js', './js/core.js', './js/screens.js', './js/app.js',
  './js/games/common.js', './js/games/connect.js', './js/games/match.js', './js/games/wordle.js',
  './js/games/quiz.js', './js/games/sentence.js', './js/games/circle.js', './js/games/riddle.js', './js/games/exam.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // network first for our own files (so updates show up), cache fallback offline
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok && (req.url.startsWith(self.location.origin) || req.url.includes('fonts.g'))) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
