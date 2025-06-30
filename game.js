class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 5;
        this.color = '#00FF00';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    moveLeft() {
        if (this.x > 0) this.x -= 5;
    }

    moveRight() {
        if (this.x < canvas.width - this.width) this.x += 5;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// インベーダークラス
class Invader {
    constructor(x, y) {
        this.width = 40;
        this.height = 40;
        this.x = x;
        this.y = y;
        this.speed = 1;
        this.color = '#FF0000';
        this.direction = 1;
    }

    move() {
        this.x += this.speed * this.direction;
        
        // 壁に当たったら反転
        if (this.x <= 0 || this.x >= canvas.width - this.width) {
            this.direction *= -1;
            this.y += 20; // 下に移動
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// 弾クラス
class Bullet {
    constructor(x, y) {
        this.width = 2;
        this.height = 10;
        this.x = x;
        this.y = y;
        this.speed = -10;
        this.color = '#FFFFFF';
    }

    move() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.y < 0;
    }
}

// ゲームの初期設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// キャンバスサイズの設定
canvas.width = 800;
canvas.height = 600;

// イベントリスナーの設定
function setupEventListeners() {
    // キー入力イベント
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') keys.left = true;
        if (e.key === 'ArrowRight') keys.right = true;
        if (e.key === ' ') keys.space = true;
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') keys.left = false;
        if (e.key === 'ArrowRight') keys.right = false;
        if (e.key === ' ') keys.space = false;
    });

    // リスタートボタンイベント
    restartButton.addEventListener('click', () => {
        initializeGame();
    });
}

// ゲーム状態
let keys = {
    left: false,
    right: false,
    space: false
};

let gameState = {
    running: true,
    gameOver: false,
    score: 0,
    player: new Player(),
    invaders: [],
    bullets: []
};

// インベーダーの生成
function createInvaders() {
    const invaderWidth = 40;
    const invaderHeight = 40;
    const spacing = 50;
    const startX = 50;
    const startY = 50;

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
            const x = startX + col * (invaderWidth + spacing);
            const y = startY + row * (invaderHeight + spacing);
            gameState.invaders.push(new Invader(x, y));
        }
    }
}

// ゲームの初期化
function initializeGame() {
    // ゲーム状態のリセット
    gameState = {
        running: true,
        gameOver: false,
        score: 0,
        player: new Player(),
        invaders: [],
        bullets: []
    };

    // インベーダーの生成
    createInvaders();

    // スコアの更新
    scoreElement.textContent = `Score: ${gameState.score}`;

    // ゲームオーバー画面の非表示
    gameOverElement.style.display = 'none';

    // イベントリスナーの設定
    setupEventListeners();

    // ゲームループの開始
    gameLoop();
}

// ゲームループ
function gameLoop() {
    if (!gameState.running) return;

    // ゲームオーバーのチェック
    if (checkGameOver()) {
        gameState.running = false;
        gameState.gameOver = true;
        gameOverElement.style.display = 'block';
        finalScoreElement.textContent = gameState.score;
        return;
    }

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 更新処理
function update() {
    // プレイヤーの移動
    if (keys.left) gameState.player.moveLeft();
    if (keys.right) gameState.player.moveRight();

    // 弾の移動と衝突判定
    gameState.bullets.forEach((bullet, bulletIndex) => {
        bullet.y -= 5;
        if (bullet.y < 0) {
            gameState.bullets.splice(bulletIndex, 1);
        } else {
            // インベーダーとの衝突判定
            gameState.invaders.forEach((invader, invaderIndex) => {
                if (bullet.x > invader.x && bullet.x < invader.x + invader.width &&
                    bullet.y > invader.y && bullet.y < invader.y + invader.height) {
                    gameState.bullets.splice(bulletIndex, 1);
                    gameState.invaders.splice(invaderIndex, 1);
                    gameState.score += 10;
                    scoreElement.textContent = `Score: ${gameState.score}`;
                }
            });
        }
    });

    // インベーダーの移動
    gameState.invaders.forEach(invader => {
        invader.x += invader.speed * invader.direction;
        
        // 壁に当たったら反転
        if (invader.x <= 0 || invader.x >= canvas.width - invader.width) {
            invader.direction *= -1;
            invader.y += 20; // 下に移動
        }
    });

    // 弾の発射
    if (keys.space && gameState.bullets.length < 3) {
        const bullet = new Bullet(
            gameState.player.x + gameState.player.width / 2,
            gameState.player.y
        );
        gameState.bullets.push(bullet);
        keys.space = false; // 連射防止
    }
}

// 描画処理
function draw() {
    // 画面のクリア
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // インベーダーの描画
    gameState.invaders.forEach(invader => {
        ctx.fillStyle = invader.color;
        ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
    });

    // プレイヤーの描画
    ctx.fillStyle = gameState.player.color;
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);

    // 弾の描画
    gameState.bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// ゲームオーバーのチェック
function checkGameOver() {
    // インベーダーがプレイヤーに接触した場合ゲームオーバー
    return gameState.invaders.some(invader =>
        invader.y + invader.height > gameState.player.y &&
        invader.x < gameState.player.x + gameState.player.width &&
        invader.x + invader.width > gameState.player.x
    );
}

// ゲームの開始
initializeGame();
