// Alteramos para v13 para garantir que o navegador limpe o cache antigo e carregue as novas rotas.
const CACHE_NAME = 'space-guardian-v13'; 

// Lista de arquivos com caminhos relativos sem './' ou '/' inicial para máxima compatibilidade.
const urlsToCache = [
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
  'assets/images/background_4.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache v13 instalado');
        // Usamos cache.add em vez de addAll para evitar que um erro 404 em um arquivo (como o shield) 
        // impeça todos os outros de serem cacheados.
        urlsToCache.forEach(url => {
          cache.add(url).catch(err => console.warn(`Falha ao cachear: ${url}`, err));
        });
        return Promise.resolve();
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});