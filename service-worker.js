const CACHE_NAME = 'meu-cache-v1';
const URLS_TO_CACHE = [
    
    'index.html',         // HTML
    'styles.css',         // CSS
    'script.js',          // Seu JavaScript principal
    'area.jpg',           // Imagem de mapa JPG
    'cenoura.png',        // Ícone de waypoint
    'cavalo.png',         // Ícone de cavalo
    'horse.mp3',          // Som de passos
    'cenoura.mp3',        // Som de waypoint
    'corneta.mp3'         // Som de parabéns
];

// Durante o evento de instalação
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use URLS_TO_CACHE diretamente para adicionar todos os recursos
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Evento de ativação (opcional, para garantir que o cache seja limpo quando uma nova versão for instalada)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]; // Adicione novos caches à lista
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            // Limpeza dos caches antigos
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições de rede e fornecimento de conteúdo em cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retorna a resposta do cache, ou faz uma requisição de rede se não encontrado
      return cachedResponse || fetch(event.request);
    })
  );
});
