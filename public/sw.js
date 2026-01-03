// Alteramos para v10 para garantir que o navegador perceba uma nova versão e limpe o cache antigo.
const CACHE_NAME = 'space-guardian-v10'; 

// Lista de arquivos com caminhos relativos corrigidos para GitHub Pages.
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
  'assets/images/shield.png',
  'assets/images/icon-512.png',
  'assets/images/background_1.png',
  'assets/images/background_2.png',
  'assets/images/background_3.png',
  'assets/images/background_4.png',
  // CDNs externos
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3/client',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache v10 aberto com sucesso');
        // Tentamos cachear os arquivos; o addAll falha se houver erro 404 em algum item.
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna o arquivo do cache se encontrado, caso contrário busca na rede.
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  // Remove caches antigos que não pertencem à versão atual (v10).
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});