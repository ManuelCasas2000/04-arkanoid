const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM elements
const playButton = document.getElementById('playButton');
const retryButton = document.getElementById('retryButton');
const startMenu = document.getElementById('startMenu');
const levelSelectMenu = document.getElementById('levelSelectMenu');
const levelButtons = document.querySelectorAll('.level-button');
const pauseMenu = document.getElementById('pauseMenu');
const changeLevelButton = document.getElementById('changeLevelButton');
const retryMenu = document.getElementById('retryMenu');
const levelCompleteMenu = document.getElementById('levelCompleteMenu');
const levelCompleteTitle = document.getElementById('levelCompleteTitle');
const levelCompleteScore = document.getElementById('levelCompleteScore');
const continueButton = document.getElementById('continueButton');
const gameCompleteMenu = document.getElementById('gameCompleteMenu');
const gameCompleteScore = document.getElementById('gameCompleteScore');
const menuButton = document.getElementById('menuButton');
const hud = document.getElementById('hud');
const escHint = document.getElementById('escHint');
const levelDisplay = document.getElementById('level');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const finalScoreDisplay = document.getElementById('finalScore');

// Game state
let gameState = {
    mode: 'menu', // 'menu', 'playing', 'paused', 'waiting_retry', 'level-select', 'level-complete', 'game-complete'
    score: 0,
    lives: 3,
    currentLevel: 1,
    levelScore: 0,
    levelLives: 3,
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

// Level definitions
const LEVELS = [
  {
    number: 1,
    name: "Grilla",
    blockPattern: [
      ['red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green', 'red', 'yellow', 'cyan', 'magenta'],
      ['yellow', 'cyan', 'magenta', 'hotpink', 'green', 'red', 'yellow', 'cyan', 'magenta', 'hotpink'],
      ['cyan', 'magenta', 'hotpink', 'green', 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green']
    ],
    ballSpeedMultiplier: 1.0
  },
  {
    number: 2,
    name: "Pirámide",
    blockPattern: [
      [null, null, null, null, 'red', 'red', null, null, null, null],
      [null, null, null, 'yellow', 'yellow', 'yellow', 'yellow', null, null, null],
      [null, null, 'cyan', 'cyan', 'cyan', 'cyan', 'cyan', 'cyan', null, null],
      [null, 'magenta', 'magenta', 'magenta', 'magenta', 'magenta', 'magenta', 'magenta', 'magenta', null],
      ['hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink']
    ],
    ballSpeedMultiplier: 1.1
  },
  {
    number: 3,
    name: "Diamante",
    blockPattern: [
      [null, null, null, null, 'red', 'red', null, null, null, null],
      [null, null, null, 'yellow', 'yellow', 'yellow', 'yellow', null, null, null],
      [null, null, 'cyan', 'cyan', 'cyan', 'cyan', 'cyan', 'cyan', null, null],
      [null, null, null, 'magenta', 'magenta', 'magenta', 'magenta', null, null, null],
      [null, null, null, null, 'green', 'green', null, null, null, null]
    ],
    ballSpeedMultiplier: 1.21
  },
  {
    number: 4,
    name: "Líneas Alternadas",
    blockPattern: [
      ['red', 'red', null, null, 'red', 'red', null, null, 'red', 'red'],
      [null, null, 'yellow', 'yellow', null, null, 'yellow', 'yellow', null, null],
      ['cyan', 'cyan', null, null, 'cyan', 'cyan', null, null, 'cyan', 'cyan'],
      [null, null, 'magenta', 'magenta', null, null, 'magenta', 'magenta', null, null],
      ['green', 'green', null, null, 'green', 'green', null, null, 'green', 'green']
    ],
    ballSpeedMultiplier: 1.331
  },
  {
    number: 5,
    name: "Caótico",
    blockPattern: [
      ['red', 'yellow', 'red', 'yellow', 'red', 'yellow', 'red', 'yellow', 'red', 'yellow'],
      ['cyan', null, 'cyan', null, 'cyan', null, 'cyan', null, 'cyan', null],
      ['magenta', 'hotpink', 'magenta', 'hotpink', 'magenta', 'hotpink', 'magenta', 'hotpink', 'magenta', 'hotpink'],
      ['green', null, 'green', null, 'green', null, 'green', null, 'green', null],
      ['red', 'cyan', 'red', 'cyan', 'red', 'cyan', 'red', 'cyan', 'red', 'cyan']
    ],
    ballSpeedMultiplier: 1.4641
  }
];

// Animation constants
const ANIMATION_DURATION = 400; // milliseconds for block destruction animation (4 frames)

// Initialize blocks from pattern
function initializeBlocksFromPattern(blockPattern) {
    gameState.blocks = [];
    const blockWidth = 32;
    const blockHeight = 16;
    const blocksPerRow = 10;
    const totalBlocksWidth = blocksPerRow * blockWidth;
    const startX = (canvas.width - totalBlocksWidth) / 2;
    const startY = 60;
    const spacingX = blockWidth;
    const spacingY = 20;

    for (let row = 0; row < blockPattern.length; row++) {
        for (let col = 0; col < blockPattern[row].length; col++) {
            const color = blockPattern[row][col];
            if (color !== null) {
                gameState.blocks.push({
                    x: startX + col * spacingX,
                    y: startY + row * spacingY,
                    color: color,
                    width: blockWidth,
                    height: blockHeight,
                    broken: false,
                    animating: false,
                    animationStartTime: null
                });
            }
        }
    }
}

// Initialize level
function initializeLevel(levelNumber) {
    const level = LEVELS[levelNumber - 1];
    if (!level) {
        console.error(`Level ${levelNumber} not found`);
        return;
    }

    gameState.currentLevel = levelNumber;
    gameState.levelScore = 0;
    gameState.levelLives = 3;
    gameState.score = 0;
    gameState.lives = 3;

    // Load blocks from level pattern
    initializeBlocksFromPattern(level.blockPattern);

    // Reset ball and paddle
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

    // Apply ball speed multiplier
    gameState.ball.vx *= level.ballSpeedMultiplier;
    gameState.ball.vy *= level.ballSpeedMultiplier;
}

// Initialize blocks with default pattern (Level 1)
function initializeBlocks() {
    initializeBlocksFromPattern(LEVELS[0].blockPattern);
}

// Reset game state
function resetGame() {
    gameState.mode = 'menu';
    soundEnabled = true;
    initializeLevel(1);
    updateHUD();
}

// Update HUD display
function updateHUD() {
    levelDisplay.textContent = gameState.currentLevel;
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

        // Check level complete
        if (gameState.blocks.length === 0) {
            gameState.mode = 'level-complete';
            showLevelCompleteMenu();
        }
    } else if (gameState.mode === 'paused' || gameState.mode === 'level-select' || gameState.mode === 'level-complete' || gameState.mode === 'game-complete') {
        // Render paused/level-select/level-complete/game-complete state
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
    const now = Date.now();

    for (let block of gameState.blocks) {
        if (block.animating) {
            const elapsed = now - block.animationStartTime;

            // Animation finished when elapsed time >= ANIMATION_DURATION
            if (elapsed >= ANIMATION_DURATION) {
                block.animating = false;
            }
        }
    }

    // Remove blocks that have finished animating (broken and not animating)
    gameState.blocks = gameState.blocks.filter(block => !(block.broken && !block.animating));
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
            // Mark block as destroyed and start animation
            block.broken = true;
            block.animating = true;
            block.animationStartTime = Date.now();

            // Award points immediately when animation starts
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
    const now = Date.now();

    for (let block of gameState.blocks) {
        if (block.animating) {
            // Render explosion animation
            const elapsed = now - block.animationStartTime;
            const frameIndex = Math.floor((elapsed / ANIMATION_DURATION) * 4);

            // Get the explosion frame for this color
            const explosionFrame = EXPLOSION_FRAMES[block.color][frameIndex];
            if (explosionFrame) {
                drawFrame(ctx, explosionFrame, block.x, block.y, block.width, block.height);
            }
        } else if (!block.broken) {
            // Render normal block sprite
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
    levelSelectMenu.classList.add('hidden');
    pauseMenu.classList.add('hidden');
    retryMenu.classList.add('hidden');
    hud.classList.add('hidden');
    escHint.classList.add('hidden');
}

function showLevelSelectMenu() {
    startMenu.classList.add('hidden');
    levelSelectMenu.classList.remove('hidden');
    pauseMenu.classList.add('hidden');
    retryMenu.classList.add('hidden');
    hud.classList.add('hidden');
    escHint.classList.add('hidden');
}

function showPlayingUI() {
    startMenu.classList.add('hidden');
    levelSelectMenu.classList.add('hidden');
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

function showLevelCompleteMenu() {
    levelCompleteTitle.textContent = `¡Nivel ${gameState.currentLevel} completado!`;
    levelCompleteScore.textContent = `Puntuación: ${gameState.score}`;
    levelCompleteMenu.classList.remove('hidden');
    hud.classList.add('hidden');
    escHint.classList.add('hidden');
}

function hideLevelCompleteMenu() {
    levelCompleteMenu.classList.add('hidden');
}

function showGameCompleteMenu() {
    gameCompleteScore.textContent = `Puntuación Total: ${gameState.score}`;
    gameCompleteMenu.classList.remove('hidden');
    hud.classList.add('hidden');
    escHint.classList.add('hidden');
}

// Event listeners
playButton.addEventListener('click', () => {
    showLevelSelectMenu();
});

levelButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const levelNumber = parseInt(e.target.getAttribute('data-level'));
        initializeLevel(levelNumber);
        gameState.mode = 'playing';
        showPlayingUI();
    });
});

retryButton.addEventListener('click', () => {
    resetGame();
    showStartMenu();
});

continueButton.addEventListener('click', () => {
    if (gameState.currentLevel < 5) {
        initializeLevel(gameState.currentLevel + 1);
        gameState.mode = 'playing';
        hideLevelCompleteMenu();
        showPlayingUI();
    } else {
        // Level 5 complete - show game complete menu
        gameState.mode = 'game-complete';
        showGameCompleteMenu();
    }
});

menuButton.addEventListener('click', () => {
    resetGame();
    showStartMenu();
});

changeLevelButton.addEventListener('click', () => {
    gameState.mode = 'level-select';
    hidePauseMenu();
    showLevelSelectMenu();
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
