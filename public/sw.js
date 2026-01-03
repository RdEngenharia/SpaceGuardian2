// Atualizamos para v14 para forçar o descarte de qualquer cache "com barra /" anterior.
const CACHE_NAME = 'space-guardian-v14'; 

// Lista de arquivos com caminhos RELATIVOS (sem a barra / no início)
// Isso é essencial para o GitHub Pages localizar a pasta /SpaceGuardian2/
const urlsToCache = [
  './', // Raiz do projeto
  'index.html',
  'assets/images/player_ship_1.png',
  'assets/images/player_ship_2.png',
  'assets/images/player_ship_3.png',
  'assets/images/enemy_besouro.png',
  'assets/images/enemy_vespa.png',
  'assets/images/enemy_zangano.png',
  'assets/images/meteor.png',
  'assets/images/meteor_big.png',
  'assets/images/icon-512.png',
  'assets/images/background_1.png',
  'assets/images/background_2.png',
  'assets/images/background_3.png',
  'assets/images/background_4.png',
  // Adicionamos o favicon aqui também
  'favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Instalando Cache v14...');
        // Usamos um loop de Promises para que, se uma imagem faltar (ex: shield),
        // o restante dos arquivos (como o fundo) ainda seja salvo no cache.
        const cachePromises = urlsToCache.map(url => {
          return cache.add(url).catch(err => {
            console.warn(`Aviso: Não foi possível cachear ${url}. Verifique se o arquivo existe na pasta public/`);
          });
        });
        return Promise.all(cachePromises);
      })
  );
  // Força o Service Worker recém-instalado a se tornar ativo imediatamente
  self.skipWaiting();
});

self.addEventListener('activate', event => {
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
    }).then(() => self.clients.claim()) // Garante que o SW controle a página imediatamente
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se estiver no cache, retorna. Se não, busca na rede.
        return response || fetch(event.request);
      })
  );
});