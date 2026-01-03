// O nome do cache para a nossa aplicação.
const CACHE_NAME = 'space-guardian-v3'; 

// Lista de arquivos atualizada para o padrão em INGLES
const urlsToCache = [
  './',
  './index.html',
  './assets/images/player_ship_1.png',
  './assets/images/player_ship_2.png',
  './assets/images/player_ship_3.png',
  './assets/images/enemy_besouro.png',
  './assets/images/enemy_vespa.png',
  './assets/images/enemy_zangano.png',
  './assets/images/meteor.png',
  './assets/images/meteor_big.png',
  './assets/images/shield.png',
  './assets/images/icon-512.png',
  './assets/images/background_1.png',
  './assets/images/background_2.png',
  './assets/images/background_3.png',
  './assets/images/background_4.png'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto com sucesso');
        // O método addAll falhará se qualquer um dos arquivos acima não for encontrado (Erro 404).
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});