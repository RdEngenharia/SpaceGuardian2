// O nome do cache para a nossa aplicação.
// Mude este nome para forçar a atualização do cache quando você alterar os arquivos.
const CACHE_NAME = 'space-guardian-v2'; // Versão do cache atualizada

// Lista de todos os arquivos e assets que precisam ser cacheados para o jogo funcionar offline.
// Nota: Usamos caminhos relativos (sem / no início) para compatibilidade com GitHub Pages.
const urlsToCache = [
  './',
  'index.html',
  // Assets de imagem do jogo
  'assets/images/player_ship_1.png',
  'assets/images/player_ship_2.png',
  'assets/images/player_ship_3.png',
  'assets/images/shield.png',
  'assets/images/meteor.png',
  'assets/images/meteor_big.png',
  'assets/images/enemy_zangano.png',
  'assets/images/enemy_vespa.png',
  'assets/images/enemy_besouro.png',
  'assets/images/icon-192x192.png',
  'assets/images/icon-512x512.png',
  // Novos assets de fundo
  'assets/images/background_1.png',
  'assets/images/background_2.png',
  'assets/images/background_3.png',
  'assets/images/background_4.png',
  // Módulos principais do React (URLs externas permanecem iguais)
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3/client',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
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
      }
    )
  );
});

// Limpa caches antigos para evitar o uso de arquivos desatualizados
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