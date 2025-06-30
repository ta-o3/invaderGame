import pygame
import random
import sys

# ゲームの初期設定
pygame.init()

# 画面設定
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("インベーダーゲーム")

# 色の定義
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)

# プレイヤー設定
class Player:
    def __init__(self):
        self.width = 50
        self.height = 50
        self.x = SCREEN_WIDTH // 2 - self.width // 2
        self.y = SCREEN_HEIGHT - self.height - 20
        self.speed = 5
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)

    def move(self, direction):
        if direction == "left" and self.x > 0:
            self.x -= self.speed
        if direction == "right" and self.x < SCREEN_WIDTH - self.width:
            self.x += self.speed
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)

    def draw(self):
        pygame.draw.rect(screen, GREEN, self.rect)

# インベーダー設定
class Invader:
    def __init__(self):
        self.width = 40
        self.height = 40
        self.x = random.randint(0, SCREEN_WIDTH - self.width)
        self.y = random.randint(0, SCREEN_HEIGHT // 4)  # より上部から生成
        self.speed = 1
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)

    def move(self):
        self.y += self.speed
        # インベーダーが画面端に到達したら反転
        if self.x <= 0 or self.x >= SCREEN_WIDTH - self.width:
            self.speed *= -1
        self.x += random.randint(-1, 1) * self.speed  # 横方向に少しずつ動く
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)

    def draw(self):
        pygame.draw.rect(screen, RED, self.rect)

# プレイヤーの弾設定
class Bullet:
    def __init__(self, x, y, screen):
        self.width = 5
        self.height = 15
        self.x = x
        self.y = y
        self.speed = -10
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        self.screen = screen

    def move(self):
        self.y += self.speed
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)

    def draw(self):
        pygame.draw.rect(self.screen, WHITE, self.rect)

# ゲームの初期化
player = Player()
invaders = [Invader() for _ in range(5)]
bullets = []
clock = pygame.time.Clock()
score = 0

# ゲームループ
running = True
while running:
    # イベント処理
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                bullet = Bullet(player.x + player.width // 2, player.y, screen)
                bullets.append(bullet)

    # キー入力処理
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]:
        player.move("left")
    if keys[pygame.K_RIGHT]:
        player.move("right")

    # インベーダーの移動
    for invader in invaders:
        invader.move()
        # インベーダーが画面下端に到達した場合
        if invader.y > SCREEN_HEIGHT:
            invaders.remove(invader)
            invaders.append(Invader())

    # 弾の移動と衝突判定
    bullets_to_remove = []
    invaders_to_remove = []
    
    for bullet in bullets:
        bullet.move()
        if bullet.y < 0:
            bullets_to_remove.append(bullet)
            continue
            
        # インベーダーとの衝突判定
        for invader in invaders:
            if bullet.rect.colliderect(invader.rect):
                bullets_to_remove.append(bullet)
                invaders_to_remove.append(invader)
                score += 10
                break
    
    # リストの更新
    for bullet in bullets_to_remove:
        if bullet in bullets:
            bullets.remove(bullet)
    
    for invader in invaders_to_remove:
        if invader in invaders:
            invaders.remove(invader)
            invaders.append(Invader())

    # 画面の描画
    screen.fill(BLACK)
    player.draw()
    for invader in invaders:
        invader.draw()
    for bullet in bullets:
        bullet.draw()
    
    # スコアの表示
    font = pygame.font.Font(None, 36)
    score_text = font.render(f'Score: {score}', True, WHITE)
    screen.blit(score_text, (10, 10))

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()
