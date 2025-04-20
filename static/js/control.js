// Game state
const gameState = {
    position: { x: 0, y: 0 },
    mapSize: { width: 20, height: 20 },
    tileSize: 64,
    moving: false,
    pathCoordinates: []  // Store path coordinates
};

// DOM Elements
const robotCharacter = document.getElementById('robot-character');
// const locationDisplay = document.getElementById('location-display');
const statusDisplay = document.getElementById('status-display');
const batteryLevel = document.getElementById('battery-level');
const gameMap = document.querySelector('.game-map');

// Generate a winding path
function generatePath() {
    const path = [];
    let x = gameState.mapSize.width - 1;  // Start from right
    let y = Math.floor(gameState.mapSize.height / 2);  // Start from middle
    
    // Direction of movement (-1 for up, 1 for down)
    let direction = Math.random() < 0.5 ? -1 : 1;
    // How many steps before considering direction change
    let directionChangeCounter = 0;
    
    path.push({x, y});
    
    while (x > 0) {
        // Increment counter
        directionChangeCounter++;
        
        // Consider changing direction every 3-5 steps
        if (directionChangeCounter >= 3 + Math.floor(Math.random() * 3)) {
            direction = -direction;  // Reverse direction
            directionChangeCounter = 0;  // Reset counter
        }
        
        // 80% chance to move diagonally (both left and up/down)
        if (Math.random() < 0.8) {
            // Check if we can move in the current direction
            let newY = y + direction;
            if (newY >= 2 && newY <= gameState.mapSize.height - 3) {
                y = newY;
            } else {
                direction = -direction;  // Reverse direction if we hit a boundary
            }
        }
        
        // Always move left
        x--;
        
        // Add new coordinate to path
        path.push({x, y});
        
        // Add height to the path
        if (y > 0) path.push({x, y: y-1});
        if (y < gameState.mapSize.height - 1) path.push({x, y: y+1});
        
        // Occasionally add extra height for more organic feel
        if (Math.random() < 0.3) {
            if (y > 1) path.push({x, y: y-2});
            if (y < gameState.mapSize.height - 2) path.push({x, y: y+2});
        }
    }
    
    return path;
}

// Check if coordinates are in path
function isInPath(x, y, pathCoords) {
    return pathCoords.some(coord => coord.x === x && coord.y === y);
}

// Initialize game map
function initializeMap() {
    const flowerTypes = [
        'tile-flower-tulips',
        'tile-flower-patch',
        'tile-flower-sakura',
        'tile-flower-fence'
    ];

    // Generate the path first
    gameState.pathCoordinates = generatePath();

    for (let y = 0; y < gameState.mapSize.height; y++) {
        for (let x = 0; x < gameState.mapSize.width; x++) {
            const tile = document.createElement('div');
            tile.className = 'map-tile';
            
            // Check if current coordinate is part of the path
            if (isInPath(x, y, gameState.pathCoordinates)) {
                tile.classList.add('tile-path');
            } else if (Math.random() < 0.15) {  // Add flowers around the path
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

// Update robot position
function updateRobotPosition() {
    const x = gameState.position.x * gameState.tileSize;
    const y = gameState.position.y * gameState.tileSize;
    robotCharacter.style.left = `${x}px`;
    robotCharacter.style.top = `${y}px`;
    //locationDisplay.textContent = `${gameState.position.x}, ${gameState.position.y}`;
}

// Handle keyboard movement
document.addEventListener('keydown', (e) => {
    if (gameState.moving) return;
    
    let moved = false;
    const oldPos = { ...gameState.position };
    
    switch(e.key) {
        case 'ArrowUp':
            console.log('up');
            if (gameState.position.y > 0) {
                gameState.position.y--;
                moved = true;
            }
            break;
        case 'ArrowDown':
            console.log('up');

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
        motorSocket.emit('control_command', {
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
motorSocket.on('robot_state', (state) => {
    statusDisplay.textContent = state.status || 'Active';
    batteryLevel.textContent = `${state.battery}%`;
    
    if (state.position) {
        gameState.position = state.position;
        updateRobotPosition();
    }
});

// Modify keyboard event handler to send commands to the Pi
document.addEventListener('keydown', (event) => {
    if (!gameState.moving) {
        switch(event.key) {
            case 'ArrowUp':
                console.log('up');
                motorSocket.emit('move', { direction: 'up' });
                break;
            case 'ArrowDown':
                console.log('down');
                motorSocket.emit('move', { direction: 'down' });
                break;
            case 'ArrowLeft':
                motorSocket.emit('move', { direction: 'left' });
                break;
            case 'ArrowRight':
                motorSocket.emit('move', { direction: 'right' });
                break;
        }
    }
});

// Add motor connection status handling
motorSocket.on('connect', () => {
    console.log('Connected to robot control server');
});

motorSocket.on('disconnect', () => {
    console.log('Disconnected from robot control server');
});

motorSocket.on('movement_status', (data) => {
    if (data.status === 'error') {
        console.error('Motor movement error:', data.message);
    }
});

// Initialize the game
initializeMap();
updateRobotPosition(); 