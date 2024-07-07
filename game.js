const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreboard = document.getElementById('scoreboard');
const levelDisplay = document.getElementById('level');
const highScoreDisplay = document.getElementById('highScore');

const player = {
    x: canvas.width / 2 - 15,
    y: 50,
    width: 30,
    height: 30,
    speed: 5,
    dx: 0,
    dy: 2
};

const platforms = [];
const platformWidth = canvas.width / 4;
const platformHeight = 10;

let level = 1;
let highScore = localStorage.getItem('highScore') || 0;
let score = 0;
let isGameOver = false;

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

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawSpike() {
    ctx.fillStyle = 'red';
    ctx.fillRect(spike.x, spike.y, spike.width, spike.height);
}

function drawPlatforms() {
    ctx.fillStyle = 'green';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
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

    if (keys.right && player.x + player.width < canvas.width) {
        player.dx = player.speed;
    } else if (keys.left && player.x > 0) {
        player.dx = -player.speed;
    } else {
        player.dx = 0;
    }

    if (player.y + player.height >= canvas.height) {
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
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
}

function update() {
    if (!isGameOver) {
        clearCanvas();
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

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
        keys.right = true;
    } else if (e.key === 'ArrowLeft') {
        keys.left = true;
    }
});

document.addEventListener('keyup', e => {
    if (e.key === 'ArrowRight') {
        keys.right = false;
    } else if (e.key === 'ArrowLeft') {
        keys.left = false;
    }
});

update();
