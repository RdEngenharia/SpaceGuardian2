import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Star, Player, Bullet, PowerUp, Enemy, GameStats, ShopUpgrades, PowerUpType, EnemyType, EnemyBullet } from '../types';
import audioService from '../services/audioService';
import assetService from '../services/assetService';
import { PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, BASE_FIRE_RATE, FAST_FIRE_RATE, BOSS_VICTORY_QUOTES } from '../constants';
import VirtualJoystick from './VirtualJoystick';

interface GameCanvasProps {
  isPaused: boolean;
  onStatsUpdate: (newStats: Partial<GameStats>) => void;
  onGameOver: (score: number, msg: string) => void;
  onFreezeCharge: (hasCharge: boolean) => void;
  onVictory: (message: string) => void;
  onAlert: (message: string) => void;
  onBossUpdate: (hpState: {current: number, max: number} | null) => void;
  shopUpgrades: ShopUpgrades;
  initialShield: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ isPaused, onStatsUpdate, onGameOver, onFreezeCharge, onVictory, onAlert, onBossUpdate, shopUpgrades, initialShield }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopId = useRef<number | undefined>(undefined);
  
  const playerRef = useRef<Player>({
    x: window.innerWidth / 2 - PLAYER_WIDTH / 2, y: window.innerHeight - 120,
    w: PLAYER_WIDTH, h: PLAYER_HEIGHT, speed: PLAYER_SPEED,
    fireRate: shopUpgrades.fast ? FAST_FIRE_RATE : BASE_FIRE_RATE, fireTimer: 0,
    gunMode: shopUpgrades.gunMode, hasShield: initialShield,
    damage: shopUpgrades.shipLevel * 3,
    invul: 0
  });
  
  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<EnemyBullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const powerupsRef = useRef<PowerUp[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const joystickRef = useRef({ dx: 0, dy: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const frameCount = useRef(0);
  const shakeAmount = useRef(0);
  const victoryFlash = useRef(0);
  const freezeTimer = useRef(0);
  const cloneTimer = useRef(0);
  const guardianAngelUsed = useRef(false);

  const gameStatsRef = useRef<GameStats>({
    score: 0, level: 1, lives: 3, sessionCoins: 0, shield: initialShield
  });

  const createPowerUp = useCallback((x: number, y: number, type: PowerUpType): PowerUp => ({
    x, y, type, size: 30,
    update: function() { this.y += 2.5; },
    draw: function(ctx: CanvasRenderingContext2D) {
      const colors: Record<PowerUpType, string> = { life: '#f00', gun: '#f0f', clone: '#ff0', freeze: '#0ff' };
      const emojis: Record<PowerUpType, string> = { life: '❤️', gun: '🚀', clone: '💥', freeze: '❄️' };
      ctx.fillStyle = colors[this.type]; ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.strokeStyle = "#fff"; ctx.strokeRect(this.x, this.y, this.size, this.size);
      ctx.fillStyle = "#fff"; ctx.font = "18px Arial"; ctx.textAlign = "center";
      ctx.fillText(emojis[this.type], this.x + 15, this.y + 22);
    }
  }), []);

  const createEnemy = useCallback((type: EnemyType, isBoss = false): Enemy => {
    const level = gameStatsRef.current.level;
    const base = {
      isBoss, x: Math.random() * (window.innerWidth - 80), y: -80,
      rotation: 0, rotSpeed: 0,
    };

    switch (type) {
      case 'VESPA':
        return {
          ...base, type, size: 45, hp: level * 1.5, maxHp: level * 1.5,
          speed: 8, color: '#0f0',
          fireTimer: 60, state: 'ENTERING', targetY: 100 + Math.random() * 200,
        };
      case 'BESOURO':
        return {
          ...base, type, size: 70, hp: level * 5, maxHp: level * 5,
          speed: 0.8, color: '#f90',
          fireRate: 150, fireTimer: Math.random() * 150,
        };
      case 'ZANGANO':
        return {
          ...base, type, size: 55, hp: level * 2, maxHp: level * 2,
          speed: 1.5 + (level * 0.1), color: '#90f',
          fireRate: 120, fireTimer: Math.random() * 120,
        };
      case 'METEOR':
      default:
        const size = isBoss ? 160 : (35 + Math.random() * 40);
        return {
          ...base, type, size, x: Math.random() * (window.innerWidth - size),
          hp: isBoss ? (level * 80) : Math.ceil(level * 0.6 + 2),
          maxHp: isBoss ? (level * 80) : Math.ceil(level * 0.6 + 2),
          speed: isBoss ? 0.7 : (1.4 + (level * 0.35)),
          rotSpeed: (Math.random() - 0.5) * 0.04, color: isBoss ? "#a0f" : "#643",
        };
    }
  }, []);
  
  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
      ctx.save();
      if (shakeAmount.current > 0) { 
          ctx.translate(Math.random()*shakeAmount.current - shakeAmount.current/2, Math.random()*shakeAmount.current - shakeAmount.current/2); 
          shakeAmount.current *= 0.9; 
      }
      if(player.invul > 0 && player.invul % 10 < 5) {
          ctx.restore();
          return;
      }
      let playerImage = assetService.assets.playerShip1;
      if(shopUpgrades.shipLevel === 2) playerImage = assetService.assets.playerShip2;
      if(shopUpgrades.shipLevel === 3) playerImage = assetService.assets.playerShip3;
      if (playerImage) {
        ctx.drawImage(playerImage, player.x, player.y, player.w, player.h);
      }
      if (player.hasShield) {
        const shieldImage = assetService.assets.shield;
        if (shieldImage) {
          ctx.drawImage(shieldImage, player.x - 20, player.y - 20, player.w + 40, player.h + 40);
        }
      }
      ctx.restore();
  };

  const handlePlayerHit = useCallback(() => {
    const player = playerRef.current;
    const stats = gameStatsRef.current;
    if (player.hasShield) {
        player.hasShield = false;
        player.invul = 60;
        shakeAmount.current = 15;
    } else {
        stats.lives--;
        player.invul = 120;
        shakeAmount.current = 25;
        if (playerRef.current.gunMode > shopUpgrades.gunMode) playerRef.current.gunMode--;
        if (stats.lives <= 0) {
            if (shopUpgrades.guardianAngel && !guardianAngelUsed.current) {
                guardianAngelUsed.current = true;
                stats.lives = 1;
                player.invul = 180;
                victoryFlash.current = 30;
                audioService.play(800, 0.3, 'sine');
            } else return true;
        }
    }
    return false;
  }, [shopUpgrades]);

  const gameLoop = useCallback(() => {
    if (isPaused || !assetService.isLoaded()) {
      gameLoopId.current = requestAnimationFrame(gameLoop);
      return;
    }
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const player = playerRef.current; const stats = gameStatsRef.current;
    let localGameOver = false;

    frameCount.current++;
    if (player.invul > 0) player.invul--;
    if (freezeTimer.current > 0) freezeTimer.current--;
    if (victoryFlash.current > 0) victoryFlash.current--;
    if (cloneTimer.current > 0) cloneTimer.current--;

    // MOVIMENTAÇÃO
    if (keysRef.current['ArrowLeft']) player.x -= player.speed;
    if (keysRef.current['ArrowRight']) player.x += player.speed;
    if (keysRef.current['ArrowUp']) player.y -= player.speed;
    if (keysRef.current['ArrowDown']) player.y += player.speed;
    player.x += joystickRef.current.dx * player.speed;
    player.y += joystickRef.current.dy * player.speed;

    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.w) player.x = canvas.width - player.w;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - player.h) player.y = canvas.height - player.h;

    // TIRO
    if (player.fireTimer <= 0) {
      const currentGunMode = player.gunMode;
      const fireDamage = cloneTimer.current > 0 ? player.damage * 2 : player.damage;
      const fire = (offsetX: number) => bulletsRef.current.push({ x: player.x + player.w/2 + offsetX, y: player.y, damage: fireDamage });
      if (currentGunMode === 1) fire(0);
      else if (currentGunMode === 2) { fire(-25); fire(25); }
      else if (currentGunMode === 3) { fire(-30); fire(0); fire(30); }
      else if (currentGunMode >= 4) { fire(-40); fire(-15); fire(15); fire(40); }
      player.fireTimer = player.fireRate;
      audioService.play(400, 0.1);
    }
    player.fireTimer--;

    // INIMIGOS E COLISÕES (Lógica original preservada)
    const is_invasion_level = stats.level % 4 === 0;
    if (frameCount.current % (is_invasion_level ? 40 : 60) === 0 && freezeTimer.current <= 0 && !enemiesRef.current.some(e => e.isBoss)) {
        enemiesRef.current.push(createEnemy(is_invasion_level ? (Math.random() > 0.6 && stats.level >= 8 ? 'VESPA' : 'ZANGANO') : 'METEOR'));
    }

    enemiesRef.current = enemiesRef.current.filter(e => {
        if (freezeTimer.current <= 0) {
          if (e.type === 'VESPA') {
             if (e.state === 'ENTERING') { if (e.y < e.targetY!) e.y += e.speed; else e.state = 'FIRING'; }
             else if (e.state === 'FIRING') { e.fireTimer!--; if (e.fireTimer! <= 0) { 
                const dx = player.x + player.w/2 - (e.x + e.size/2); const dy = player.y + player.h/2 - (e.y + e.size/2); const dist = Math.sqrt(dx*dx + dy*dy);
                enemyBulletsRef.current.push({ x: e.x + e.size/2, y: e.y + e.size/2, w: 6, h: 6, speed: 8, dx: (dx/dist)*8, dy: (dy/dist)*8});
                audioService.play(300, 0.1, 'sawtooth'); e.state = 'LEAVING';
             }}
             else if (e.state === 'LEAVING') e.y -= e.speed * 0.7;
          } else { e.y += e.speed; e.rotation += e.rotSpeed; }
        }

        // Colisão Bala Jogador -> Inimigo
        bulletsRef.current = bulletsRef.current.filter(b => {
            if (e.y > 0 && b.x > e.x && b.x < e.x + e.size && b.y > e.y && b.y < e.y + e.size) {
                e.hp -= b.damage;
                if (e.isBoss) onBossUpdate({current: e.hp, max: e.maxHp});
                if (e.hp <= 0) {
                    audioService.play(120, 0.2, 'sawtooth');
                    if (e.isBoss) { onVictory(BOSS_VICTORY_QUOTES[0]); onBossUpdate(null); }
                    stats.sessionCoins += e.isBoss ? 50 : 2;
                    stats.score += e.isBoss ? 500 : 10;
                }
                return false;
            }
            return true;
        });

        if (e.hp <= 0) return false;
        if (player.invul <= 0 && player.x < e.x + e.size && player.x + player.w > e.x && player.y < e.y + e.size && player.y + player.h > e.y) {
            if(handlePlayerHit()) { onGameOver(stats.score, "Nave destruída!"); localGameOver = true; }
            return false;
        }
        return e.y < canvas.height;
    });

    bulletsRef.current = bulletsRef.current.filter(b => { b.y -= 12; return b.y > -50 });
    enemyBulletsRef.current = enemyBulletsRef.current.filter(b => { 
        if (freezeTimer.current <= 0) { b.x += b.dx || 0; b.y += b.dy || b.speed; }
        if (player.invul <= 0 && b.x < player.x + player.w && b.x + b.w > player.x && b.y < player.y + player.h && b.y + b.h > player.y) {
            if(handlePlayerHit()) { onGameOver(stats.score, "Abatido!"); localGameOver = true; }
            return false;
        }
        return b.y < canvas.height;
    });

    onStatsUpdate({ ...stats, shield: player.hasShield });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    enemiesRef.current.forEach(e => {
        let img = assetService.assets.meteor;
        if (e.type === 'ZANGANO') img = assetService.assets.enemyZangano;
        if (e.type === 'VESPA') img = assetService.assets.enemyVespa;
        if (img) {
            ctx.save(); ctx.translate(e.x + e.size/2, e.y + e.size/2);
            if(e.type === 'METEOR') ctx.rotate(e.rotation);
            ctx.drawImage(img, -e.size/2, -e.size/2, e.size, e.size); ctx.restore();
        }
    });

    drawPlayer(ctx, player);
    ctx.fillStyle = "#fff"; bulletsRef.current.forEach(b => ctx.fillRect(b.x-2, b.y, 4, 15));
    ctx.fillStyle = "#f00"; enemyBulletsRef.current.forEach(b => ctx.fillRect(b.x-2, b.y, 4, 10));

    if (!localGameOver) gameLoopId.current = requestAnimationFrame(gameLoop);
  }, [isPaused, onGameOver, onStatsUpdate, onVictory, createEnemy, handlePlayerHit, shopUpgrades]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', (e) => keysRef.current[e.code] = true);
    window.addEventListener('keyup', (e) => keysRef.current[e.code] = false);
    gameLoopId.current = requestAnimationFrame(gameLoop);
    return () => { if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current); };
  }, [gameLoop]);

  const handleJoystickMove = useCallback((dx: number, dy: number) => {
    const sensitivity = 1.2;
    joystickRef.current = { dx: Math.abs(dx) < 0.1 ? 0 : dx * sensitivity, dy: Math.abs(dy) < 0.1 ? 0 : dy * sensitivity };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute top-0 left-0 block z-10 w-full h-full" />
      {isTouchDevice && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="pointer-events-auto">
            <VirtualJoystick onMove={handleJoystickMove} />
          </div>
        </div>
      )}
    </>
  );
};

export default GameCanvas;