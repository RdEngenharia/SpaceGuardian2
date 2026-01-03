const CACHE_NAME = 'space-guardian-v15'; 

const urlsToCache = [
  './', 
  'index.html',
  'assets/images/player_ship_1.png',
  'assets/images/player_ship_2.png',
  'assets/images/player_ship_3.png',
  'assets/images/enemy_besouro.png',
  'assets/images/enemy_vespa.png',
  'assets/images/enemy_zangano.png',
  'assets/images/meteor.png',
  'assets/images/meteor_big.png',
  'assets/images/background_1.png',
  'assets/images/background_2.png',
  'assets/images/background_3.png',
  'assets/images/background_4.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Força a nova versão a assumir o controle na hora
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url => cache.add(url).catch(err => console.log("Erro ao cachear: ", url)))
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME && caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});