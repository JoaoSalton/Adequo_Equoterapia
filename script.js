// Função para registrar o service worker
navigator.serviceWorker.register('service-worker.js')
  .then(registration => {
    console.log('Service Worker registrado com sucesso:', registration);
  })
  .catch(error => {
    console.error('Falha ao registrar o Service Worker:', error);
  });

alert("🎉 Olá, pequeno explorador! Bem-vindo ao Circuito Adequo de Equoterapia Interativo! 🐴🥕\n\n" +
    "Aqui estão as instruções para você começar a brincadeira:\n\n" +
    "1. O seu cavalo está faminto e precisa comer muitas cenouras! 🐴🍽️\n" +
    "2. Você precisa guiar o cavalo pelo mapa e ir até as 'cenouras' (são os ícones de cenoura no mapa) 🥕\n" +
    "3. Para fazer o cavalo comer, basta chegar bem pertinho da cenoura, a menos de 8 metros! 🚶‍♂️🐴\n" +
    "4. A cada cenoura que o cavalo comer, ele ficará mais feliz e a contagem de 'cenouras restantes' vai diminuir! 🎉\n" +
    "5. Seu objetivo é fazer o cavalo comer todas as cenouras e se divertir muito na aventura! 🌟\n\n" +
    "Vamos lá, cavaleiro! Prepare-se para guiar seu cavalo e fazer ele comer todas as cenouras! 🏇\n" +
    "Está pronto para começar a brincadeira? Vamos lá! 🎮");
// Cria o botão
const startButton = document.createElement("button");
startButton.textContent = "Começar!";
startButton.style.position = "absolute";
startButton.style.top = "50%";
startButton.style.left = "50%";
startButton.style.transform = "translate(-50%, -50%)";
startButton.style.padding = "10px 20px";
startButton.style.fontSize = "16px";
startButton.style.cursor = "pointer";
startButton.style.backgroundColor = "lightblue";
startButton.style.borderRadius = "15px";
startButton.style.zIndex = 1000; // Garante que o botão apareça acima de outros elementos

// Adiciona o botão ao corpo da página
document.body.appendChild(startButton);

// Função para iniciar os áudios e remover o botão
function iniciarJogo() {
    alert("🎉 Olá, pequeno explorador! Bem-vindo ao jogo do Cavalo e as Cenouras! 🐴🥕\n\n" +
          "Aqui estão as instruções para você começar a brincadeira:\n\n" +
          "1. O seu cavalo está faminto e precisa comer muitas cenouras! 🐴🍽️\n" +
          "2. Você precisa guiar o cavalo pelo mapa e ir até as 'cenouras' (são os ícones de cenoura no mapa) 🥕\n" +
          "3. Para fazer o cavalo comer, basta chegar bem pertinho da cenoura, a menos de 8 metros! 🚶‍♂️🐴\n" +
          "4. A cada cenoura que o cavalo comer, ele ficará mais feliz e a contagem de 'cenouras restantes' vai diminuir! 🎉\n" +
          "5. Seu objetivo é fazer o cavalo comer todas as cenouras e se divertir muito na aventura! 🌟\n\n" +
          "Vamos lá, cavaleiro! Prepare-se para guiar seu cavalo e fazer ele comer todas as cenouras! 🏇\n" +
          "Está pronto para começar a brincadeira? Vamos lá! 🎮");

    somPassos.play(); // Toca o som para desbloquear o áudio
    document.body.removeChild(startButton); // Remove o botão após o clique
    getUserGPS(); // Chama a função para começar a obter o GPS
}

// Adiciona um evento de clique ao botão
startButton.addEventListener("click", iniciarJogo);

// Variável para controlar se o zoom inicial foi aplicado
let zoomInicialAplicado = false;

// Inicializa o mapa sem centralizá-lo inicialmente
const map = L.map('map');

// URL da imagem PNG
const imageUrl = 'area.jpg'; // Substitua pelo caminho correto da sua imagem PNG

// Define os limites da imagem usando suas coordenadas
const southWest = L.latLng(-26.9794210561550436, -48.7531625172409093);
const northEast = L.latLng(-26.9763356004990413, -48.7497037682969037);

// Adiciona a imagem como uma sobreposição no mapa
L.imageOverlay(imageUrl, [southWest, northEast]).addTo(map);

// Ajusta a vista do mapa para incluir a imagem
map.fitBounds([southWest, northEast]);

// Adiciona o tile layer do OpenStreetMap com zoom mínimo e máximo
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 10,
    maxZoom: 21
}).addTo(map);

// Define os ícones de cavalo para cada direção
const userIcons = {
    up: L.icon({ iconUrl: 'cavalo.png', iconSize: [200, 100], iconAnchor: [100, 0] }),
    down: L.icon({ iconUrl: 'cavalo.png', iconSize: [200, 100], iconAnchor: [100, 0] }),
    left: L.icon({ iconUrl: 'cavalo.png', iconSize: [200, 100], iconAnchor: [100, 0] }),
    right: L.icon({ iconUrl: 'cavalo.png', iconSize: [200, 100], iconAnchor: [100, 0] })
};

// Variável para armazenar o marcador do usuário
let userMarker;

// Array para armazenar os waypoints
let waypoints = [];

// Som de passos
const somPassos = new Audio('horse.mp3');
let tocandoPassos = false;

// Som de waypoint
const somWaypoint = new Audio('cenoura.mp3');

// Som de parabéns
const somParabens = new Audio('corneta.mp3');

// Variáveis para armazenar distância e número de passos
let totalDistance = 0;
const stepLength = 2.8; // Comprimento médio de um passo em metros
let stepCount = 0;
let lastPosition = null;

// Função para tocar o som de passos
function tocarSomPassos() {
    if (!tocandoPassos) {
        tocandoPassos = true;
        somPassos.play();
        somPassos.onended = function() { tocandoPassos = false; };
    }
}

// Função para parar o som de passos
function pararSomPassos() {
    if (!somPassos.paused) {
        somPassos.pause();
        somPassos.currentTime = 0;
        tocandoPassos = false;
    }
}

// Função para tocar o som do waypoint
function tocarSomWaypoint() {
    pararSomPassos();
    somWaypoint.play();
    somWaypoint.onended = function() { tocarSomPassos(); };
}

// Função para tocar o som de parabéns
function tocarSomParabens() {
    somParabens.play();
}

// Função para atualizar a posição do usuário e mudar o ícone
function updateUserPosition(lat, lng, direction) {
    if (userMarker) {
        // Calcula a distância percorrida desde a última posição
        const previousPosition = L.latLng(lastPosition.lat, lastPosition.lng);
        const currentPosition = L.latLng(lat, lng);
        const distance = previousPosition.distanceTo(currentPosition); // Distância em metros
        totalDistance += distance; // Soma à distância total
        stepCount = Math.floor(totalDistance / stepLength); // Calcula o número de passos

        // Atualiza o marcador
        userMarker.setLatLng([lat, lng]);
        userMarker.setIcon(userIcons[direction]);
    } else {
        // Cria o marcador se ele não existir
        userMarker = L.marker([lat, lng], { icon: userIcons[direction] }).addTo(map);
    }

    // Aplica o zoom apenas na primeira vez
    if (!zoomInicialAplicado) {
        map.setView([lat, lng], 18);
        zoomInicialAplicado = true;
    }

    // Atualiza o popup com a distância percorrida, passos e waypoints restantes
    userMarker.bindPopup(`Cenouras Restantes: ${waypoints.length}<br>Distância Percorrida: ${totalDistance.toFixed(2)} m<br>Passos: ${stepCount}`).openPopup();

    // Atualiza a última posição para a próxima comparação
    lastPosition = { lat, lng };

    // Função para coletar waypoints
    collectWaypoints(lat, lng);
}

// Função para adicionar waypoints fixos ao mapa
function addFixedWaypoints() {
    const fixedWaypoints = [
        { lat: -26.97799054, lng: -48.75139948},
        { lat: -26.97773616, lng: -48.75139492 },
        { lat: -26.97769345, lng: -48.75194658},
        { lat: -26.97699894, lng: -48.75219567 },
        { lat: -26.97686129, lng: -48.75112458 }
    ];

    const waypointIcon = L.icon({ iconUrl: 'cenoura.png', iconSize: [35, 35], iconAnchor: [17, 17] });

    fixedWaypoints.forEach(waypoint => {
        const marker = L.marker([waypoint.lat, waypoint.lng], { icon: waypointIcon }).addTo(map);
        waypoint.marker = marker;
        waypoints.push(waypoint);
    });

    updateRemainingWaypoints(); // Atualiza o contador de waypoints restantes
}

// Chame `addFixedWaypoints` para adicionar waypoints fixos
addFixedWaypoints();

// Variável global ou dentro do escopo apropriado
let waypointCaptured = false;

// Função para coletar waypoints próximos e narrar
function collectWaypoints(userLat, userLng) {
    waypointCaptured = false; // Reinicia para cada execução da função

    // Filtra os waypoints para verificar se estão próximos do usuário
    waypoints = waypoints.filter(waypoint => {
        const waypointPosition = L.latLng(waypoint.lat, waypoint.lng);
        const userPosition = L.latLng(userLat, userLng);

        const distance = userPosition.distanceTo(waypointPosition); // Distância em metros

        if (distance < 6) {  // Se a distância for menor que 16 metros, o waypoint é capturado
            waypoint.marker.remove(); // Remove o marcador do waypoint
            tocarSomWaypoint(); // Toca o som de captura do waypoint
            waypointCaptured = true;  // Marca que um waypoint foi capturado
            return false; // Retorna false para remover o waypoint da lista
        }
        return true; // Retorna true para manter o waypoint na lista
    });

    // Se algum waypoint foi capturado, atualize o contador
    if (waypointCaptured) {
        updateRemainingWaypoints();
    }
}

// Função para verificar e narrar a quantidade de waypoints restantes
function updateRemainingWaypoints() {
    const remaining = waypoints.length;
    if (remaining > 0) {
        alert(`Restam ${remaining} cenouras para coletar!`);
    } else {
        alert('Você coletou todas as cenouras!');
    }
}

// Função para obter a localização do usuário
function getUserGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const direction = getDirection(lat, lng); // Função para determinar a direção
            updateUserPosition(lat, lng, direction);
        }, error => {
            console.error('Erro ao obter localização:', error);
        }, {
            enableHighAccuracy: true
        });
    } else {
        console.error('Geolocalização não é suportada neste navegador.');
    }
}

// Função fictícia para determinar a direção com base na latitude e longitude
function getDirection(lat, lng) {
    // Lógica de determinação de direção (exemplo simples)
    if (lat > -26.977) return 'up';
    if (lat < -26.978) return 'down';
    if (lng < -48.751) return 'left';
    return 'right';
}

