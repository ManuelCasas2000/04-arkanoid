const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM elements
const playButton = document.getElementById('playButton');
const retryButton = document.getElementById('retryButton');
const startMenu = document.getElementById('startMenu');
const pauseMenu = document.getElementById('pauseMenu');
const retryMenu = document.getElementById('retryMenu');
const hud = document.getElementById('hud');
const escHint = document.getElementById('escHint');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const finalScoreDisplay = document.getElementById('finalScore');

// Game state
let gameState = {
    mode: 'menu', // 'menu', 'playing', 'paused', 'waiting_retry'
    score: 0,
    lives: 3,
    ball: {
        x: 400,
        y: 550,
        vx: -4,
        vy: -4,
        width: 16,
        height: 16
    },
    paddle: {
        x: 319, // centered: (800 - 162) / 2
        y: 575,
        width: 162,
        height: 14
    },
    blocks: [],
    mouseX: 400
};

// Input state
let keysPressed = {};
let soundEnabled = true;

// Initialize blocks with fixed pattern
function initializeBlocks() {
    gameState.blocks = [];
    const colors = ['red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green'];
    const blockWidth = 32;
    const blockHeight = 16;
    const startX = 80;
    const startY = 60;
    const spacingX = 64;
    const spacingY = 20;

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 10; col++) {
            const colorIndex = (row * 10 + col) % colors.length;
            gameState.blocks.push({
                x: startX + col * spacingX,
                y: startY + row * spacingY,
                color: colors[colorIndex],
                width: blockWidth,
                height: blockHeight,
                broken: false
            });
        }
    }
}

// Reset game state
function resetGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.ball = {
        x: 400,
        y: 550,
        vx: -4,
        vy: -4,
        width: 16,
        height: 16
    };
    gameState.paddle = {
        x: 319,
        y: 575,
        width: 162,
        height: 14
    };
    gameState.mode = 'menu';
    soundEnabled = true;
    initializeBlocks();
    updateHUD();
}

// Update HUD display
function updateHUD() {
    scoreDisplay.textContent = gameState.score;
    livesDisplay.textContent = gameState.lives;
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState.mode === 'playing') {
        // Update game logic
        updateBall();
        updatePaddle();
        updateBlocks();
        checkCollisions();

        // Render
        renderPaddle();
        renderBall();
        renderBlocks();
        updateHUD();

        // Check game over
        if (gameState.lives <= 0) {
            gameState.mode = 'waiting_retry';
            showRetryMenu();
        }
    } else if (gameState.mode === 'paused') {
        // Render paused state
        renderPaddle();
        renderBall();
        renderBlocks();
    }

    requestAnimationFrame(gameLoop);
}

// Update ball position
function updateBall() {
    if (gameState.mode !== 'playing') return;

    const prevX = gameState.ball.x;
    const prevY = gameState.ball.y;

    // Update position based on velocity
    gameState.ball.x += gameState.ball.vx;
    gameState.ball.y += gameState.ball.vy;

    // Left wall bounce - detect boundary crossing
    if (prevX >= 0 && gameState.ball.x < 0) {
        gameState.ball.x = 0;
        gameState.ball.vx = Math.abs(gameState.ball.vx);
        playSound('ball-bounce');
    }
    // Right wall bounce
    if (prevX + gameState.ball.width <= canvas.width && gameState.ball.x + gameState.ball.width > canvas.width) {
        gameState.ball.x = canvas.width - gameState.ball.width;
        gameState.ball.vx = -Math.abs(gameState.ball.vx);
        playSound('ball-bounce');
    }
    // Top wall bounce
    if (prevY >= 0 && gameState.ball.y < 0) {
        gameState.ball.y = 0;
        gameState.ball.vy = Math.abs(gameState.ball.vy);
        playSound('ball-bounce');
    }

    // Ball fell off bottom - lose a life
    if (gameState.ball.y > canvas.height) {
        gameState.lives--;
        if (gameState.lives > 0) {
            resetBall();
        }
    }
}

// Reset ball to starting position
function resetBall() {
    gameState.ball = {
        x: 400,
        y: 550,
        vx: -4,
        vy: -4,
        width: 16,
        height: 16
    };
}

// Update paddle position
function updatePaddle() {
    const speed = 7;
    let hasKeyboardInput = false;

    // Keyboard controls
    if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A']) {
        gameState.paddle.x -= speed;
        hasKeyboardInput = true;
    }
    if (keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D']) {
        gameState.paddle.x += speed;
        hasKeyboardInput = true;
    }

    // Mouse control: paddle follows cursor X (only if no keyboard input)
    if (!hasKeyboardInput && gameState.mouseX !== null) {
        const targetX = gameState.mouseX - gameState.paddle.width / 2;
        const diff = targetX - gameState.paddle.x;
        const smoothing = 0.12;
        gameState.paddle.x += diff * smoothing;
    }

    // Clamp paddle within bounds
    if (gameState.paddle.x < 0) gameState.paddle.x = 0;
    if (gameState.paddle.x + gameState.paddle.width > canvas.width) {
        gameState.paddle.x = canvas.width - gameState.paddle.width;
    }
}

// Update blocks state
function updateBlocks() {
    // Blocks are updated during collision detection
}

// Collision detection
function checkCollisions() {
    // Ball-paddle collision
    if (ballRectCollision(gameState.ball, gameState.paddle)) {
        // Only bounce if ball is moving downward (vy > 0)
        if (gameState.ball.vy > 0) {
            gameState.ball.vy = -gameState.ball.vy;
            gameState.ball.y = gameState.paddle.y - gameState.ball.height;

            // Add horizontal velocity based on where ball hits paddle
            const paddleCenter = gameState.paddle.x + gameState.paddle.width / 2;
            const ballCenter = gameState.ball.x + gameState.ball.width / 2;
            const hitPos = (ballCenter - paddleCenter) / (gameState.paddle.width / 2);
            gameState.ball.vx += hitPos * 3;

            playSound('ball-bounce');
        }
    }

    // Ball-block collisions
    for (let block of gameState.blocks) {
        if (!block.broken && ballRectCollision(gameState.ball, block)) {
            block.broken = true;
            gameState.score += 10;
            playSound('break-sound');

            // Determine which side of the block was hit
            const overlapLeft = gameState.ball.x + gameState.ball.width - block.x;
            const overlapRight = block.x + block.width - gameState.ball.x;
            const overlapTop = gameState.ball.y + gameState.ball.height - block.y;
            const overlapBottom = block.y + block.height - gameState.ball.y;

            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            // Bounce based on which side was hit
            if (minOverlap === overlapTop || minOverlap === overlapBottom) {
                gameState.ball.vy = -gameState.ball.vy;
            } else {
                gameState.ball.vx = -gameState.ball.vx;
            }

            break; // Only collide with one block per frame
        }
    }
}

// Rectangle collision detection
function ballRectCollision(ball, rect) {
    return ball.x < rect.x + rect.width &&
           ball.x + ball.width > rect.x &&
           ball.y < rect.y + rect.height &&
           ball.y + ball.height > rect.y;
}

// Render paddle
function renderPaddle() {
    drawSprite(ctx, 'paddle', gameState.paddle.x, gameState.paddle.y, gameState.paddle.width, gameState.paddle.height);
}

// Render ball
function renderBall() {
    drawSprite(ctx, 'ball', gameState.ball.x, gameState.ball.y, gameState.ball.width, gameState.ball.height);
}

// Render blocks
function renderBlocks() {
    for (let block of gameState.blocks) {
        if (!block.broken) {
            drawSprite(ctx, `block_${block.color}`, block.x, block.y, block.width, block.height);
        }
    }
}

// Sound management
function playSound(soundName) {
    if (!soundEnabled) return;

    const sounds = {
        'ball-bounce': new Audio('assets/sounds/ball-bounce.mp3'),
        'break-sound': new Audio('assets/sounds/break-sound.mp3')
    };

    if (sounds[soundName]) {
        sounds[soundName].play().catch(() => {
            // Silently ignore audio errors
        });
    }
}

// UI Functions
function showStartMenu() {
    startMenu.classList.remove('hidden');
    pauseMenu.classList.add('hidden');
    retryMenu.classList.add('hidden');
    hud.classList.add('hidden');
    escHint.classList.add('hidden');
}

function showPlayingUI() {
    startMenu.classList.add('hidden');
    pauseMenu.classList.add('hidden');
    retryMenu.classList.add('hidden');
    hud.classList.remove('hidden');
    escHint.classList.remove('hidden');
}

function showPauseMenu() {
    pauseMenu.classList.remove('hidden');
}

function hidePauseMenu() {
    pauseMenu.classList.add('hidden');
}

function showRetryMenu() {
    finalScoreDisplay.textContent = `Puntuación: ${gameState.score}`;
    retryMenu.classList.remove('hidden');
    hud.classList.add('hidden');
    escHint.classList.add('hidden');
}

// Event listeners
playButton.addEventListener('click', () => {
    gameState.mode = 'playing';
    showPlayingUI();
});

retryButton.addEventListener('click', () => {
    resetGame();
    showStartMenu();
});

document.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true;

    // Pause with ESC
    if (e.key === 'Escape') {
        if (gameState.mode === 'playing') {
            gameState.mode = 'paused';
            soundEnabled = false;
            showPauseMenu();
        } else if (gameState.mode === 'paused') {
            gameState.mode = 'playing';
            soundEnabled = true;
            hidePauseMenu();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    gameState.mouseX = e.clientX - rect.left;
});

canvas.addEventListener('mouseleave', () => {
    gameState.mouseX = null;
});

// Initialize
window.addEventListener('load', () => {
    loadSpritesheet(() => {
        resetGame();
        showStartMenu();
        gameLoop();
    });
});
