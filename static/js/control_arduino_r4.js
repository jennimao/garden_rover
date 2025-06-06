// === Game State ===
const gameState = {
    position: { x: 0, y: 0 },
    mapSize: { width: 20, height: 20 },
    tileSize: 64,
    moving: false,
    pathCoordinates: []  // Store path coordinates
};

// === DOM Elements ===
const robotCharacter = document.getElementById('robot-character');
const statusDisplay = document.getElementById('status-display');
const batteryLevel = document.getElementById('battery-level');
const gameMap = document.querySelector('.game-map');

// === Generate a winding path ===
function generatePath() {
    const path = [];
    let x = gameState.mapSize.width - 1;  // Start from right
    let y = Math.floor(gameState.mapSize.height / 2);  // Start from middle
    
    let direction = Math.random() < 0.5 ? -1 : 1;
    let directionChangeCounter = 0;
    
    path.push({x, y});
    
    while (x > 0) {
        directionChangeCounter++;
        
        if (directionChangeCounter >= 3 + Math.floor(Math.random() * 3)) {
            direction = -direction;
            directionChangeCounter = 0;
        }
        
        if (Math.random() < 0.8) {
            let newY = y + direction;
            if (newY >= 2 && newY <= gameState.mapSize.height - 3) {
                y = newY;
            } else {
                direction = -direction;
            }
        }
        
        x--;
        path.push({x, y});
        
        if (y > 0) path.push({x, y: y-1});
        if (y < gameState.mapSize.height - 1) path.push({x, y: y+1});
        
        if (Math.random() < 0.3) {
            if (y > 1) path.push({x, y: y-2});
            if (y < gameState.mapSize.height - 2) path.push({x, y: y+2});
        }
    }
    
    return path;
}

// === Check if coordinates are in path ===
function isInPath(x, y, pathCoords) {
    return pathCoords.some(coord => coord.x === x && coord.y === y);
}

// === Initialize game map ===
function initializeMap() {
    const flowerTypes = [
        'tile-flower-tulips',
        'tile-flower-patch',
        'tile-flower-sakura',
        'tile-flower-fence'
    ];

    gameState.pathCoordinates = generatePath();

    for (let y = 0; y < gameState.mapSize.height; y++) {
        for (let x = 0; x < gameState.mapSize.width; x++) {
            const tile = document.createElement('div');
            tile.className = 'map-tile';
            
            if (isInPath(x, y, gameState.pathCoordinates)) {
                tile.classList.add('tile-path');
            } else if (Math.random() < 0.15) {
                tile.classList.add('tile-flower');
                const randomFlower = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
                tile.classList.add(randomFlower);
            } else {
                tile.classList.add('tile-grass');
            }
            
            tile.style.left = `${x * gameState.tileSize}px`;
            tile.style.top = `${y * gameState.tileSize}px`;
            gameMap.appendChild(tile);
        }
    }
}

// === Update robot position on screen ===
function updateRobotPosition() {
    const x = gameState.position.x * gameState.tileSize;
    const y = gameState.position.y * gameState.tileSize;
    robotCharacter.style.left = `${x}px`;
    robotCharacter.style.top = `${y}px`;
}

// === Send move command to Arduino ===
function sendMoveCommand(direction) {
    const arduinoIP = 'http://10.0.0.200';  // Replace with your Arduino IP
    const url = `${arduinoIP}/move?direction=${direction}`;

    fetch(url)
        .then(response => response.text())
        .then(data => {
            console.log(`Arduino response: ${data}`);
            // Optionally update statusDisplay here if Arduino sends useful info
            if (statusDisplay) statusDisplay.textContent = `Last command: ${direction}`;
        })
        .catch(error => {
            console.error('Error sending move command:', error);
            if (statusDisplay) statusDisplay.textContent = 'Error communicating with Arduino';
        });
}

// === Handle keyboard movement ===
document.addEventListener('keydown', (event) => {
    // Prevent default scrolling on arrow keys
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }
    
    if (gameState.moving) return;  // Optional: You can remove this if you want continuous moves on key hold
    
    let moved = false;
    let direction = null;
    
    switch(event.key) {
        case 'ArrowUp':
            if (gameState.position.y > 0) {
                gameState.position.y--;
                moved = true;
                direction = 'up';
            }
            break;
        case 'ArrowDown':
            if (gameState.position.y < gameState.mapSize.height - 1) {
                gameState.position.y++;
                moved = true;
                direction = 'down';
            }
            break;
        case 'ArrowLeft':
            if (gameState.position.x > 0) {
                gameState.position.x--;
                moved = true;
                direction = 'left';
            }
            break;
        case 'ArrowRight':
            if (gameState.position.x < gameState.mapSize.width - 1) {
                gameState.position.x++;
                moved = true;
                direction = 'right';
            }
            break;
    }
    
    if (moved) {
        sendMoveCommand(direction);
        updateRobotPosition();
    }
});

document.addEventListener('keyup', (event) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        sendMoveCommand('stop');
    }
});

// === Initialize game ===
initializeMap();
updateRobotPosition();
