const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreboard = document.getElementById('scoreboard');
const levelDisplay = document.getElementById('level');
const highScoreDisplay = document.getElementById('highScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalLevelDisplay = document.getElementById('finalLevel');
const retryButton = document.getElementById('retryButton');

const playerSpriteRight = new Image();
const playerSpriteLeft = new Image();
playerSpriteRight.src = 'assets/player_right.png';
playerSpriteLeft.src = 'assets/player_left.png';

const platformImage = new Image();
platformImage.src = 'assets/platform.png';

const spikeImage = new Image();
spikeImage.src = 'assets/spike.png';

const backgroundImage = new Image();
backgroundImage.src = 'assets/background.png';

const player = {
    x: canvas.width / 2 - 15,
    y: 50,
    width: 30,
    height: 30,
    speed: 1,
    dx: 0,
    dy: 2,
    direction: 'right'
};

let platforms = [];
const platformWidth = canvas.width / 4;
const platformHeight = 10;

let level = 1;
let highScore = localStorage.getItem('highScore') || 0;
let score = 0;
let isGameOver = false;
let isGameStarted = false;

const spike = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: 20
};

const keys = {
    right: false,
    left: false
};

const sounds = {
    start: new Audio('assets/start.mp3'),
    fall: new Audio('assets/fall.mp3'),
    gameOver: new Audio('assets/gameover.mp3'),
    background: new Audio('assets/background.mp3')
};

sounds.background.loop = true;

function drawPlayer() {
    if (player.direction === 'right') {
        ctx.drawImage(playerSpriteRight, player.x, player.y, player.width, player.height);
    } else {
        ctx.drawImage(playerSpriteLeft, player.x, player.y, player.width, player.height);
    }
}

function drawSpike() {
    ctx.drawImage(spikeImage, spike.x, spike.y, spike.width, spike.height);
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.drawImage(platformImage, platform.x, platform.y, platform.width, platform.height);
    });
}

function generatePlatform() {
    const x = Math.random() * (canvas.width - platformWidth);
    const type = Math.random() < 0.5 ? 'normal' : Math.random() < 0.5 ? 'moving' : 'jump';
    platforms.push({ x, y: canvas.height, width: platformWidth, height: platformHeight, type, dx: 2 });
}

function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    if (player.direction === 'right' && player.x + player.width < canvas.width) {
        player.dx = player.speed;
    } else if (player.direction === 'left' && player.x > 0) {
        player.dx = -player.speed;
    }

    if (player.y + player.height >= canvas.height) {
        if (sounds.fall.src) sounds.fall.play();
        isGameOver = true;
    }
}

function updatePlatforms() {
    platforms.forEach(platform => {
        platform.y -= 2;
        if (platform.type === 'moving') {
            platform.x += platform.dx;
            if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
                platform.dx *= -1;
            }
        }
    });
    platforms = platforms.filter(platform => platform.y + platform.height > 0);
}

function checkCollisions() {
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            if (platform.type === 'normal') {
                player.dy = 2;
            } else if (platform.type === 'moving') {
                player.x += platform.dx;
                player.dy = 1;
            } else if (platform.type === 'jump') {
                player.dy = -10;
            }
        }
    });

    if (player.y <= spike.height) {
        if (sounds.gameOver.src) sounds.gameOver.play();
        isGameOver = true;
    }
}

function updateScore() {
    score = Math.floor(player.y / 10);
    level = Math.floor(score / 15) + 1;
    if (level > 100) {
        level = 100;
        isGameOver = true;
    }
    levelDisplay.textContent = level;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    highScoreDisplay.textContent = highScore;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameOver() {
    finalLevelDisplay.textContent = `Level: ${level}`;
    gameOverScreen.style.display = 'flex';
    if (sounds.background.src) sounds.background.pause();
}

function resetGame() {
    player.x = canvas.width / 2 - 15;
    player.y = 50;
    player.dx = 0;
    player.dy = 2;
    platforms = [];
    level = 1;
    score = 0;
    isGameOver = false;
    isGameStarted = false;
    startScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
    clearCanvas();
    updateScore();
}

function update() {
    if (!isGameStarted) {
        return;
    }

    if (!isGameOver) {
        clearCanvas();
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        drawSpike();
        drawPlayer();
        drawPlatforms();
        movePlayer();
        updatePlatforms();
        checkCollisions();
        updateScore();

        if (Math.random() < 0.1) {
            generatePlatform();
        }

        requestAnimationFrame(update);
    } else {
        gameOver();
    }
}

document.addEventListener('keydown', (e) => {
    if (!isGameStarted) {
        isGameStarted = true;
        startScreen.style.display = 'none';
        if (sounds.start.src) sounds.start.play();
        if (sounds.background.src) sounds.background.play();
        update();
    }

    if (e.key === 'ArrowRight') {
        player.direction = 'right';
    } else if (e.key === 'ArrowLeft') {
        player.direction = 'left';
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        player.dx = 0;
    }
});

document.addEventListener('click', () => {
    if (!isGameStarted) {
        isGameStarted = true;
        startScreen.style.display = 'none';
        if (sounds.start.src) sounds.start.play();
        if (sounds.background.src) sounds.background.play();
        update();
    }
});

retryButton.addEventListener('click', resetGame);

resetGame();
