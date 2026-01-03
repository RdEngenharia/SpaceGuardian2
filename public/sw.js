// O nome do cache para a nossa aplicação.
const CACHE_NAME = 'space-guardian-v2'; 

// Lista de arquivos corrigida com base nos nomes reais da sua pasta assets/images
const urlsToCache = [
  './',
  'index.html',
  // Assets de imagem (Nomes exatos conforme seus prints)
  'assets/images/player_ship_1.png',
  'assets/images/player_ship_2.png',
  'assets/images/player_ship_3.png',
  'assets/images/enemy_besouro.png',
  'assets/images/inimigo_vespa.png',
  'assets/images/inimigo_zangao.png',
  'assets/images/meteoro.png',
  'assets/images/meteoro_big.png',
  'assets/images/icon-512.png',
  'assets/images/fundo_1.png',
  'assets/images/fundo_2.png',
  'assets/images/fundo_3.png',
  'assets/images/fundo_4.png',
  // Módulos principais do React
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3/client',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto com sucesso');
        // Usamos map para tentar cachear e ignorar erros individuais se necessário,
        // mas aqui a lista deve estar 100% correta agora.
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