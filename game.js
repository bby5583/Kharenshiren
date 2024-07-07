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

const groundNormalImage = new Image();
groundNormalImage.src = 'assets/ground_normal.png';
const groundMovingImage = new Image();
groundMovingImage.src = 'assets/ground_moving.png';
const groundJumpImage = new Image();
groundJumpImage.src = 'assets/ground_jump.png';

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
    onGround: false
};

let grounds = [];
const groundWidth = canvas.width / 4;
const groundHeight = 25; // 고정 높이

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

function drawGrounds() {
    grounds.forEach(ground => {
        if (ground.type === 'normal') {
            ctx.drawImage(groundNormalImage, ground.x, ground.y, ground.width, ground.height);
        } else if (ground.type === 'moving') {
            ctx.drawImage(groundMovingImage, ground.x, ground.y, ground.width, ground.height);
        } else if (ground.type === 'jump') {
            ctx.drawImage(groundJumpImage, ground.x, ground.y, ground.width, ground.height);
        }
    });
}

function generateGround() {
    let x, y, type, direction;
    let validGround = false;

    while (!validGround) {
        x = Math.floor(Math.random() * (canvas.width / 50)) * 50;
        y = Math.random() * (canvas.height - groundHeight);
        const rand = Math.random();

        if (rand < 0.7) {
            type = 'normal';
        } else if (rand < 0.85) {
            type = 'moving';
            direction = Math.random() < 0.5 ? 'left' : 'right';
        } else {
            type = 'jump';
        }

        if (x + groundWidth <= canvas.width && x >= 0 &&
            !(x < player.x + player.width && x + groundWidth > player.x &&
            y < player.y + player.height && y + groundHeight > player.y)) {
            validGround = true;
        }

        if (validGround && grounds.every(ground => Math.abs(ground.y - y) >= 50)) {
            validGround = true;
        } else {
            validGround = false;
        }
    }

    grounds.push({ x, y, width: groundWidth, height: groundHeight, type, dx: 2, direction });
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

function updateGrounds() {
    grounds.forEach(ground => {
        ground.y -= 2;
    });
    grounds = grounds.filter(ground => ground.y + ground.height > 0);
}

function checkCollisions() {
    player.onGround = false;

    grounds.forEach(ground => {
        if (player.y + player.height <= ground.y && player.y + player.height + player.dy >= ground.y) {
            if (player.x < ground.x + ground.width && player.x + player.width > ground.x) {
                player.dy = 0;
                player.onGround = true;
                player.y = ground.y - player.height;
                
                if (ground.type === 'moving') {
                    if (ground.direction === 'right') {
                        player.dx += ground.dx;
                    } else {
                        player.dx -= ground.dx;
                    }
                } else if (ground.type === 'jump') {
                    player.dy = -5; // 점프력 감소
                }
            }
        }
    });

    if (!player.onGround) {
        player.dy = 4; // 낙하 속도 증가
    }

    if (player.y <= spike.height) {
        if (sounds.gameOver.src) sounds.gameOver.play();
        isGameOver = true;
    }

    grounds = grounds.filter(ground => ground.y + ground.height > spike.height);
}

function updateScore() {
    score = Math.floor(player.y / 10);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    highScoreDisplay.textContent = highScore;
}

function updateLevel() {
    if (!isGameOver) {
        level++;
        levelDisplay.textContent = level;
        if (level <= 100) {
            setTimeout(updateLevel, 15000);
        } else {
            isGameOver = true;
        }
    }
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
    grounds = [];
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
        drawGrounds();
        drawPlayer();
        movePlayer();
        updateGrounds();
        checkCollisions();
        updateScore();

        if (Math.random() < 0.6) {
            generateGround();
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
        setTimeout(updateLevel, 15000);
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
        setTimeout(updateLevel, 15000);
        update();
    }
});

retryButton.addEventListener('click', resetGame);

resetGame();
