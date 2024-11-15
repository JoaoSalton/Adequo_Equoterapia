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
startButton.style.zIndex = 1000;

// Adiciona o botão ao corpo da página
document.body.appendChild(startButton);

function iniciarJogo() {
    somPassos.play(); // Toca o som para desbloquear o áudio
    document.body.removeChild(startButton); // Remove o botão após o clique
    getUserGPS();
}

startButton.addEventListener("click", iniciarJogo);

let zoomInicialAplicado = false;
const map = L.map('map');
const imageUrl = 'area.jpg'; 

const southWest = L.latLng(-26.9794210561550436, -48.7531625172409093);
const northEast = L.latLng(-26.9763356004990413, -48.7497037682969037);
L.imageOverlay(imageUrl, [southWest, northEast]).addTo(map);
map.fitBounds([southWest, northEast]);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    minZoom: 10,
    maxZoom: 21
}).addTo(map);

const userIcons = {
    up: L.icon({ iconUrl: 'cavalo-up.png', iconSize: [15, 50], iconAnchor: [7 , 25] }),
    down: L.icon({ iconUrl: 'cavalo-down.png', iconSize: [15, 50], iconAnchor: [7 , 25] }),
    left: L.icon({ iconUrl: 'cavalo-left.png', iconSize: [50, 15], iconAnchor: [25 , 7] }),
    right: L.icon({ iconUrl: 'cavalo-right.png', iconSize: [50, 15], iconAnchor: [25 ,7] })
};

let userMarker;
let waypoints = [];
const somPassos = new Audio('horse.mp3');
let tocandoPassos = false;
const somWaypoint = new Audio('cenoura.mp3');
const somParabens = new Audio('corneta.mp3');

function tocarSomPassos() {
    if (!tocandoPassos) {
        tocandoPassos = true;
        somPassos.play();
        somPassos.onended = function() { tocandoPassos = false; };
    }
}

function pararSomPassos() {
    if (!somPassos.paused) {
        somPassos.pause();
        somPassos.currentTime = 0;
        tocandoPassos = false;
    }
}

function tocarSomWaypoint() {
    pararSomPassos();
    somWaypoint.play();
    somWaypoint.onended = function() { tocarSomPassos(); };
}

function tocarSomParabens() {
    somParabens.play();
}

// Variáveis para distância e passos
let totalDistance = 0;
const stepLength = 0.7; // Comprimento médio de um passo em metros
let stepCount = 0;
let lastPosition = null;

function calculateDirection(lat, lng) {
    if (lastPosition) {
        const deltaLat = lat - lastPosition.lat;
        const deltaLng = lng - lastPosition.lng;
        if (Math.abs(deltaLat) > Math.abs(deltaLng)) {
            return deltaLat > 0 ? 'up' : 'down';
        } else {
            return deltaLng > 0 ? 'right' : 'left';
        }
    }
    lastPosition = { lat, lng };
    return 'right';
}

function updateUserPosition(lat, lng) {
    const direction = calculateDirection(lat, lng);
    
    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
        userMarker.setIcon(userIcons[direction]);
    } else {
        userMarker = L.marker([lat, lng], { icon: userIcons[direction] }).addTo(map);
    }

    if (lastPosition) {
        const previousPosition = L.latLng(lastPosition.lat, lastPosition.lng);
        const currentPosition = L.latLng(lat, lng);
        const distance = previousPosition.distanceTo(currentPosition);
        totalDistance += distance;
        stepCount = Math.floor(totalDistance / stepLength);
    }
    lastPosition = { lat, lng };

    userMarker.setPopupContent(`Cenouras Restantes: ${waypoints.length}<br>Distância Percorrida: ${totalDistance.toFixed(2)} m<br>Passos: ${stepCount}`);
    userMarker.openPopup();

    if (!zoomInicialAplicado) {
        map.setView([lat, lng], 18);
        zoomInicialAplicado = true;
    }

    collectWaypoints(lat, lng);
}

function addFixedWaypoints() {
    const fixedWaypoints = [
        { lat: -26.97799054, lng: -48.75139948 },
        { lat: -26.97773616, lng: -48.75139492 },
        { lat: -26.97769345, lng: -48.75194658 },
        { lat: -26.97699894, lng: -48.75219567 },
        { lat: -26.97686129, lng: -48.75112458 }
    ];

    const waypointIcon = L.icon({ iconUrl: 'cenoura.png', iconSize: [40, 40], iconAnchor: [20, 20] });
    fixedWaypoints.forEach(waypoint => {
        const marker = L.marker([waypoint.lat, waypoint.lng], { icon: waypointIcon }).addTo(map);
        waypoint.marker = marker;
        waypoints.push(waypoint);
    });
    updateRemainingWaypoints();
}
addFixedWaypoints();

function collectWaypoints(userLat, userLng) {
    let waypointCaptured = false;

    waypoints = waypoints.filter(waypoint => {
        const waypointPosition = L.latLng(waypoint.lat, waypoint.lng);
        const userPosition = L.latLng(userLat, userLng);
        const distance = userPosition.distanceTo(waypointPosition);

        if (distance < 10) {  
            waypoint.marker.remove();
            tocarSomWaypoint();
            waypointCaptured = true;
            return false;
        }
        return true;
    });

    if (waypointCaptured) {
        updateRemainingWaypoints();
    }
}

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

function narrar(mensagem) {
    const sintese = new SpeechSynthesisUtterance(mensagem);
    sintese.lang = 'pt-BR';
    window.speechSynthesis.speak(sintese);
}

function getUserGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
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

getUserGPS();
