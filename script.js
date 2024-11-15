if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker registrado com sucesso:', registration);
    })
    .catch(error => {
      console.error('Falha ao registrar Service Worker:', error);
    });
}
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
    somPassos.play(); // Toca o som para desbloquear o áudio
    document.body.removeChild(startButton); // Remove o botão após o clique

    // Agora, chama a função para começar o jogo
    getUserGPS();
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
    up: L.icon({ iconUrl: 'cavalo-up.png', iconSize: [15, 50], iconAnchor: [7 , 25] }),
    down: L.icon({ iconUrl: 'cavalo-down.png', iconSize: [15, 50], iconAnchor: [7 , 25] }),
    left: L.icon({ iconUrl: 'cavalo-left.png', iconSize: [50, 15], iconAnchor: [25 , 7] }),
    right: L.icon({ iconUrl: 'cavalo-right.png', iconSize: [50, 15], iconAnchor: [25 ,7] })
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
const somParabens = new Audio('corneta.mp3'); // Substitua pelo caminho correto do som de parabéns

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

// Variáveis para armazenar distância e número de passos
let totalDistance = 0;
const stepLength = 0.7; // Comprimento médio de um passo em metros
let stepCount = 0;

// Função para atualizar a posição do usuário e calcular a distância
function updateUserPosition(lat, lng) {
    const direction = calculateDirection(lat, lng);
    
    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
        userMarker.setIcon(userIcons[direction]);
    } else {
        userMarker = L.marker([lat, lng], { icon: userIcons[direction] }).addTo(map);
    }
// Calcula a distância percorrida desde a última posição
    if (lastPosition) {
        const previousPosition = L.latLng(lastPosition.lat, lastPosition.lng);
        const currentPosition = L.latLng(lat, lng);
        const distance = previousPosition.distanceTo(currentPosition); // Distância em metros
        totalDistance += distance; // Soma à distância total
        stepCount = Math.floor(totalDistance / stepLength); // Calcula o número de passos
    }
    
    // Atualiza a última posição para a próxima comparação
    lastPosition = { lat, lng };

    // Centraliza no usuário na primeira vez
    if (!zoomInicialAplicado) {
        map.setView([lat, lng], 18);
        zoomInicialAplicado = true;
    }

    collectWaypoints(lat, lng);
}
 // Exibe a distância, número de passos e cenouras restantes no popup
    userMarker.setPopupContent(`Cenouras Restantes: ${waypoints.length}<br>Distância Percorrida: ${totalDistance.toFixed(2)} m<br>Passos: ${stepCount}`);
    userMarker.openPopup();

// Função para adicionar waypoints fixos ao mapa
function addFixedWaypoints() {
        const fixedWaypoints = [
                { lat: -26.97799054, lng: -48.75139948},
                { lat: -26.97773616, lng: -48.75139492 },
                { lat: -26.97769345, lng: -48.75194658},
                { lat: -26.97699894, lng: -48.75219567 },
                { lat: -26.97686129, lng: -48.75112458 }  
                
                ];

    const waypointIcon = L.icon({ iconUrl: 'cenoura.png', iconSize: [40, 40], iconAnchor: [20, 20] });

    fixedWaypoints.forEach(waypoint => {
        const marker = L.marker([waypoint.lat, waypoint.lng], { icon: waypointIcon }).addTo(map);
        waypoint.marker = marker;
        waypoints.push(waypoint);
    });

    updateRemainingWaypoints(); // Atualiza o contador de waypoints restantes
}

// Chame addFixedWaypoints para adicionar waypoints fixos
addFixedWaypoints();

// Função para coletar waypoints próximos e narrar
function collectWaypoints(userLat, userLng) {
    let waypointCaptured = false;

    waypoints = waypoints.filter(waypoint => {
        const waypointPosition = L.latLng(waypoint.lat, waypoint.lng);
        const userPosition = L.latLng(userLat, userLng);

        const distance = userPosition.distanceTo(waypointPosition); // Distância em metros

        if (distance < 10) {  // Proximidade para capturar waypoint
            waypoint.marker.remove();
            tocarSomWaypoint();
            waypointCaptured = true;
            return false; // Remove o waypoint da lista
        }
        return true; // Mantém o waypoint na lista
    });

    // Atualiza o contador se algum waypoint foi capturado
    if (waypointCaptured) {
        updateRemainingWaypoints();
    }
}

// Função para atualizar a quantidade de cenouras e narrar as informações
function updateRemainingWaypoints() {
    if (userMarker) {
        userMarker.setPopupContent(`Cenouras Restantes: ${waypoints.length}<br>Distância Percorrida: ${totalDistance.toFixed(2)} m<br>Passos: ${stepCount}`);
    }

    if (waypoints.length > 1) {
        narrar("Restam " + waypoints.length + " Cenouras.");
    } else if (waypoints.length === 1) {
        narrar("Resta Apenas Uma Cenoura.");
    } else {
        narrar("Parabéns! Você completou o circuito e seu cavalo está alimentado!");
        tocarSomParabens();
    }
}
// Função para sintetizar fala
function narrar(mensagem) {
    const sintese = new SpeechSynthesisUtterance(mensagem);
    sintese.lang = 'pt-BR'; // Define a língua para português brasileiro
    window.speechSynthesis.speak(sintese);
}

// Função para obter a posição GPS do usuário
function getUserGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Atualiza a posição do usuário com base na direção do movimento
            const direction = calculateDirection(lat, lng);
            updateUserPosition(lat, lng, direction);  
            collectWaypoints(lat, lng);  
        }, function(error) {
            console.log("Erro ao obter a localização: ", error.message);
        }, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        });
    } else {
        alert("Geolocalização não é suportada neste navegador.");
    }
}

// Função para calcular a direção do movimento com base na posição anterior
let lastPosition = null;
function calculateDirection(lat, lng) {
    if (lastPosition) {
        const deltaLat = lat - lastPosition.lat;
        const deltaLng = lng - lastPosition.lng;

        // Determina a direção com base nos deslocamentos
        if (Math.abs(deltaLat) > Math.abs(deltaLng)) {
            return deltaLat > 0 ? 'up' : 'down';  // Norte ou Sul
        } else {
            return deltaLng > 0 ? 'right' : 'left';  // Leste ou Oeste
        }
    }
    lastPosition = { lat, lng }; // Armazena a posição atual como última posição
    return 'right'; // Direção padrão inicial
}

// Chama a função para obter a localização GPS em tempo real
getUserGPS();
