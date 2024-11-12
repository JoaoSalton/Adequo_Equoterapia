// service-worker.js

const CACHE_NAME = 'meu-cache-v1';
const URLS_TO_CACHE = [
    '/',                  // Página principal
    '/index.html',        // HTML
    '/styles.css',         // CSS
    '/script.js',         // Seu JavaScript principal
    '/area.jpg',          // Imagem de mapa PNG
    '/cenoura.png',       // Ícone de waypoint
    '/cavalo-up.png',     // Ícone de cavalo para direção para cima
    '/cavalo-down.png',   // Ícone de cavalo para direção para baixo
    '/cavalo-left.png',   // Ícone de cavalo para direção para a esquerda
    '/cavalo-right.png',  // Ícone de cavalo para direção para a direita
    '/horse.mp3',         // Som de passos
    '/cenoura.mp3',       // Som de waypoint
    '/corneta.mp3'        // Som de parabéns
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(URLS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', function(event) {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
