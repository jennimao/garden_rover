// Connect to WebSocket server
const socket = io();

// Game state
const gameState = {
    position: { x: 0, y: 0 },
    mapSize: { width: 20, height: 20 },
    tileSize: 64,
    moving: false
};

// DOM Elements
const robotCharacter = document.getElementById('robot-character');
const locationDisplay = document.getElementById('location-display');
const statusDisplay = document.getElementById('status-display');
const batteryLevel = document.getElementById('battery-level');
const gameMap = document.querySelector('.game-map');

// Initialize game map
function initializeMap() {
    const flowerTypes = [
        'tile-flower-tulips',
        'tile-flower-potted',
        'tile-flower-garden',
        'tile-flower-trellis'
    ];

    for (let y = 0; y < gameState.mapSize.height; y++) {
        for (let x = 0; x < gameState.mapSize.width; x++) {
            const tile = document.createElement('div');
            tile.className = 'map-tile';
            
            // Add different tile types
            if (Math.random() < 0.15) {  // Increased chance for flowers
                tile.classList.add('tile-flower');
                // Randomly select a flower type
                const randomFlower = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
                tile.classList.add(randomFlower);
            } else if (Math.random() < 0.2) {
                tile.classList.add('tile-path');
            } else {
                tile.classList.add('tile-grass');
            }
            
            tile.style.left = `${x * gameState.tileSize}px`;
            tile.style.top = `${y * gameState.tileSize}px`;
            gameMap.appendChild(tile);
        }
    }
}

// Update robot position
function updateRobotPosition() {
    const x = gameState.position.x * gameState.tileSize;
    const y = gameState.position.y * gameState.tileSize;
    robotCharacter.style.left = `${x}px`;
    robotCharacter.style.top = `${y}px`;
    locationDisplay.textContent = `${gameState.position.x}, ${gameState.position.y}`;
}

// Handle keyboard movement
document.addEventListener('keydown', (e) => {
    if (gameState.moving) return;
    
    let moved = false;
    const oldPos = { ...gameState.position };
    
    switch(e.key) {
        case 'ArrowUp':
            if (gameState.position.y > 0) {
                gameState.position.y--;
                moved = true;
            }
            break;
        case 'ArrowDown':
            if (gameState.position.y < gameState.mapSize.height - 1) {
                gameState.position.y++;
                moved = true;
            }
            break;
        case 'ArrowLeft':
            if (gameState.position.x > 0) {
                gameState.position.x--;
                moved = true;
            }
            break;
        case 'ArrowRight':
            if (gameState.position.x < gameState.mapSize.width - 1) {
                gameState.position.x++;
                moved = true;
            }
            break;
    }
    
    if (moved) {
        // Send movement to server
        socket.emit('control_command', {
            command: 'move',
            value: {
                x: gameState.position.x,
                y: gameState.position.y,
                oldX: oldPos.x,
                oldY: oldPos.y
            }
        });
        updateRobotPosition();
    }
});

// Handle robot state updates
socket.on('robot_state', (state) => {
    statusDisplay.textContent = state.status || 'Active';
    batteryLevel.textContent = `${state.battery}%`;
    
    if (state.position) {
        gameState.position = state.position;
        updateRobotPosition();
    }
});

// Initialize the game
initializeMap();
updateRobotPosition(); 