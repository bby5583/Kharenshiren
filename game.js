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

const platformNormalImage = new Image();
platformNormalImage.src = 'assets/platform_normal.png';
const platformMovingImage = new Image();
platformMovingImage.src = 'assets/platform_moving.png';
const platformJumpImage = new Image();
platformJumpImage.src = 'assets/platform_jump.png';

const spikeImage = new Image();
spikeImage.src = 'assets/spike.png';

const backgroundImage = new Image();
backgroundImage.src = 'assets/background.png';

const player = {
    x: canvas.width / 2 - 22.5,
    y: 50,
    width: 45,
    height: 45,
    speed: 4,
    dx: 0,
    dy: 4,
    direction: 'right',
    onPlatform: false
};

let platforms = [];
const platformWidth = canvas.width / 4;
const platformHeight = 25; // 고정 높이

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
        if (platform.type === 'normal') {
            ctx.drawImage(platformNormalImage, platform.x, platform.y, platform.width, platform.height);
        } else if (platform.type === 'moving') {
            ctx.drawImage(platformMovingImage, platform.x, platform.y, platform.width, platform.height);
        } else if (platform.type === 'jump') {
            ctx.drawImage(platformJumpImage, platform.x, platform.y, platform.width, platform.height);
        }
    });
}

function generatePlatform() {
    let x, y, type, direction;
    let validPlatform = false;

    while (!validPlatform) {
        x = Math.floor(Math.random() * (canvas.width / 50)) * 50;
        y = Math.random() * (canvas.height - platformHeight);
        const rand = Math.random();

        if (rand < 0.7) {
            type = 'normal';
        } else if (rand < 0.85) {
            type = 'moving';
            direction = Math.random() < 0.5 ? 'left' : 'right';
        } else {
            type = 'jump';
        }

        if (x + platformWidth <= canvas.width && x >= 0 &&
            !(x < player.x + player.width && x + platformWidth > player.x &&
            y < player.y + player.height && y + platformHeight > player.y)) {
            validPlatform = true;
        }

        if (validPlatform && platforms.every(platform => Math.abs(platform.y - y) >= 50)) {
            validPlatform = true;
        } else {
            validPlatform = false;
        }
    }

    platforms.push({ x, y, width: platformWidth, height: platformHeight, type, dx: 2, direction });
}

function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    if (player.direction === 'right') {
        if (player.x + player.width < canvas.width) {
            player.dx = player.speed;
        } else {
            player.dx = 0;
        }
    } else if (player.direction === 'left') {
        if (player.x > 0) {
            player.dx = -player.speed;
        } else {
            player.dx = 0;
        }
    }

    if (player.y + player.height >= canvas.height) {
        if (sounds.fall.src) sounds.fall.play();
        isGameOver = true;
    }
}

function updatePlatforms() {
    platforms.forEach(platform => {
        platform.y -= 2;
    });
    platforms = platforms.filter(platform => platform.y + platform.height > 0);
}

function checkCollisions() {
    player.onPlatform = false;

    platforms.forEach(platform => {
        if (player.y + player.height <= platform.y && player.y + player.height + player.dy >= platform.y) {
            if (player.x < platform.x + platform.width && player.x + player.width > platform.x) {
                player.dy = 0;
                player.onPlatform = true;
                player.y = platform.y - player.height;
                
                if (platform.type === 'moving') {
                    if (platform.direction === 'right') {
                        player.dx += platform.dx;
                    } else {
                        player.dx -= platform.dx;
                    }
                } else if (platform.type === 'jump') {
                    player.dy = -5; // 점프력 감소
                }
            }
        }
    });

    if (!player.onPlatform) {
        player.dy = 4; // 낙하 속도 증가
    }

    if (player.y <= spike.height) {
        if (sounds.gameOver.src) sounds.gameOver.play();
        isGameOver = true;
    }

    platforms = platforms.filter(platform => platform.y + platform.height > spike.height);
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
    player.x = canvas.width / 2 - 22.5;
    player.y = 50;
    player.dx = 0;
    player.dy = 4; // 낙하 속도 증가
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
        drawPlatforms();
        drawPlayer();
        movePlayer();
        updatePlatforms();
        checkCollisions();
        updateScore();

        if (Math.random() < 0.15) {
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

    if (e.key.toLowerCase() === 'd') {
        player.direction = 'right';
    } else if (e.key.toLowerCase() === 'a') {
        player.direction = 'left';
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'd' || e.key.toLowerCase() === 'a') {
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
