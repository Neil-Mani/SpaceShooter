const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player and game variables
let player = { x: canvas.width / 2 - 15, y: canvas.height - 60, width: 30, height: 30, speed: 5, health: 3 };
let keys = {};
let bullets = [];
let enemies = [];
let bosses = [];
let score = 0;
let difficulty = 1;
let enemySpeed = 1;
let bossSpawned = false;
let enemiesDefeated = 0;
let lastEnemySpawnTime = 0;
let enemySpawnInterval = 2000;  // Initial enemy spawn time (2 seconds)
let minSpawnInterval = 1000;    // Minimum enemy spawn interval (1 second)
let pointsForDifficultyIncrease = 200;  // Points required for each difficulty increase

// Enemy and boss classes
class Enemy {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = -10;
            this.x = Math.random() * (canvas.width - this.width);
        }
        this.draw();
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Boss {
    constructor() {
        this.x = canvas.width / 2 - 50;
        this.y = -100;
        this.width = 100;
        this.height = 100;
        this.speed = 0.5;
        this.health = 10 + difficulty * 2;  // Increase boss health with difficulty
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = -100;
        }
        this.draw();
    }

    draw() {
        ctx.fillStyle = "purple";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Handle player movement
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Update game objects
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    updateBullets();
    updateEnemies();
    updateBoss();
    drawHUD();
    checkCollisions();
    checkGameOver();

    // Spawn new enemies over time based on the spawn interval
    if (Date.now() - lastEnemySpawnTime > enemySpawnInterval) {
        spawnEnemies();
        lastEnemySpawnTime = Date.now();
    }

    requestAnimationFrame(updateGame);
}

// Move player
function movePlayer() {
    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
    if (keys["ArrowDown"] && player.y < canvas.height - player.height) player.y += player.speed;
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Update bullets
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= 7;
        if (bullet.y < 0) bullets.splice(index, 1);
        ctx.fillStyle = "yellow";
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
    });
}

// Spawn and update enemies (respawn when off the screen)
function spawnEnemies() {
    let enemy = new Enemy(Math.random() * (canvas.width - 30), -30, 30, 30, enemySpeed + Math.random() * difficulty);
    enemies.push(enemy);
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.update();
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);  // Remove enemy if off screen
        }
    });

    // Increase difficulty and spawn enemies faster
    if (score % pointsForDifficultyIncrease === 0 && score !== 0) {
        difficulty++;
        enemySpawnInterval = Math.max(minSpawnInterval, enemySpawnInterval - 200);  // Decrease spawn interval but cap at 1 second
        enemySpeed += 0.1;  // Slightly increase enemy speed
        pointsForDifficultyIncrease += 200;  // Increase the points needed for the next difficulty level
    }
}

// Spawn and update boss
function updateBoss() {
    if (enemiesDefeated % 10 === 0 && enemiesDefeated !== 0 && !bossSpawned) {
        let boss = new Boss();
        bosses.push(boss);
        bossSpawned = true;
    }

    bosses.forEach((boss, index) => {
        boss.update();
        if (boss.health <= 0) {
            bosses.splice(index, 1);
            bossSpawned = false;
            score += 100;
			enemySpeed += 0.1;
			enemySpawnInterval -= 10;
        }
    });
}

// Draw HUD
function drawHUD() {
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Health: ${player.health}`, 10, 40);
}

// Fire bullets
document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y });
    }
});

// Check collisions
function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (bullet.x < enemy.x + enemy.width && bullet.x + 5 > enemy.x &&
                bullet.y < enemy.y + enemy.height && bullet.y + 10 > enemy.y) {
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);
                score += 10;
                enemiesDefeated++;
            }
        });

        bosses.forEach((boss, bossIndex) => {
            if (bullet.x < boss.x + boss.width && bullet.x + 5 > boss.x &&
                bullet.y < boss.y + boss.height && bullet.y + 10 > boss.y) {
                boss.health--;
                bullets.splice(bIndex, 1);
            }
        });
    });
}

// Check game over condition
function checkGameOver() {
    enemies.forEach((enemy) => {
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
            player.health--;
            enemy.y = -10;
            if (player.health === 0) {
                alert("Game Over!");
                document.location.reload();
            }
        }
    });
}

// Initial setup
spawnEnemies();
updateGame();
