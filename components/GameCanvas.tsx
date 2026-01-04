
import React, { useRef, useEffect, useCallback } from 'react';
import type { Star, Player, Bullet, PowerUp, Enemy, GameStats, ShopUpgrades, PowerUpType, EnemyType, EnemyBullet } from '../types';
import audioService from '../services/audioService';
import assetService from '../services/assetService';
import { PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, BASE_FIRE_RATE, FAST_FIRE_RATE, BOSS_VICTORY_QUOTES } from '../constants';

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
    let localGameOver = false;

    if (player.hasShield) {
        player.hasShield = false;
        player.invul = 60;
        shakeAmount.current = 15;
    } else {
        stats.lives--;
        player.invul = 120;
        shakeAmount.current = 25;
        if (playerRef.current.gunMode > shopUpgrades.gunMode) {
            playerRef.current.gunMode--;
        }
        if (stats.lives <= 0) {
            if (shopUpgrades.guardianAngel && !guardianAngelUsed.current) {
                guardianAngelUsed.current = true;
                stats.lives = 1;
                player.invul = 180;
                victoryFlash.current = 30;
                audioService.play(800, 0.3, 'sine');
            } else {
                localGameOver = true;
            }
        }
    }
    return localGameOver;
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

    if (keysRef.current['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keysRef.current['ArrowRight'] && player.x < canvas.width - player.w) player.x += player.speed;
    if (keysRef.current['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keysRef.current['ArrowDown'] && player.y < canvas.height - player.h) player.y += player.speed;

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

    const is_invasion_level = stats.level % 4 === 0;

    if (frameCount.current % (is_invasion_level ? 40 : 60) === 0 && freezeTimer.current <= 0 && !enemiesRef.current.some(e => e.isBoss)) {
        let enemyType: EnemyType = 'METEOR';
        if (is_invasion_level) {
          const rand = Math.random();
          if (stats.level >= 8 && rand > 0.6) {
            enemyType = 'VESPA';
          } else {
            enemyType = 'ZANGANO';
          }
        }
        enemiesRef.current.push(createEnemy(enemyType));
    }
    
    enemiesRef.current = enemiesRef.current.filter(e => {
        if (freezeTimer.current <= 0) {
          if (e.type === 'VESPA') {
            switch(e.state) {
              case 'ENTERING':
                if (e.y < e.targetY!) e.y += e.speed; else e.state = 'FIRING';
                break;
              case 'FIRING':
                e.fireTimer!--;
                if (e.fireTimer! <= 0) {
                  const dx = player.x + player.w/2 - (e.x + e.size/2);
                  const dy = player.y + player.h/2 - (e.y + e.size/2);
                  const dist = Math.sqrt(dx*dx + dy*dy);
                  enemyBulletsRef.current.push({ x: e.x + e.size/2, y: e.y + e.size/2, w: 6, h: 6, speed: 8, dx: (dx/dist)*8, dy: (dy/dist)*8});
                  audioService.play(300, 0.1, 'sawtooth');
                  e.state = 'LEAVING';
                }
                break;
              case 'LEAVING':
                e.y -= e.speed * 0.7;
                break;
            }
          } else {
             e.y += e.speed; e.rotation += e.rotSpeed; 
          }
        }
        
        if(e.type === 'ZANGANO' && e.fireTimer && e.fireRate) {
          e.fireTimer--;
          if(e.fireTimer <= 0) {
            enemyBulletsRef.current.push({ x: e.x + e.size/2, y: e.y + e.size, w: 5, h: 15, speed: 5, dy: 5, dx: 0});
            e.fireTimer = e.fireRate;
            audioService.play(250, 0.08, 'square');
          }
        } else if (e.type === 'BESOURO' && e.fireTimer && e.fireRate) {
          e.fireTimer--;
          if (e.fireTimer <= 0) {
            enemyBulletsRef.current.push({ x: e.x + e.size/2, y: e.y + e.size/2, w: 8, h: 8, speed: 3, dy: 3, dx: -0.5});
            enemyBulletsRef.current.push({ x: e.x + e.size/2, y: e.y + e.size/2, w: 8, h: 8, speed: 3, dy: 3, dx: 0});
            enemyBulletsRef.current.push({ x: e.x + e.size/2, y: e.y + e.size/2, w: 8, h: 8, speed: 3, dy: 3, dx: 0.5});
            e.fireTimer = e.fireRate;
            audioService.play(180, 0.2, 'square');
          }
        }

        if (e.y > canvas.height || e.y < -e.size * 2) {
            if (e.isBoss) { onGameOver(stats.score, "O Meteoro Gigante destruiu o planeta!"); localGameOver = true; }
            return false;
        }

        bulletsRef.current = bulletsRef.current.filter(b => {
            if (b.x > e.x && b.x < e.x + e.size && b.y > e.y && b.y < e.y + e.size) {
                e.hp -= b.damage;
                if (e.isBoss) onBossUpdate({current: e.hp, max: e.maxHp});
                
                if (e.hp <= 0) {
                    audioService.play(120, 0.2, 'sawtooth');
                    if (e.isBoss) {
                        const quote = BOSS_VICTORY_QUOTES[Math.floor(Math.random() * BOSS_VICTORY_QUOTES.length)];
                        audioService.speak(quote);
                        onVictory(quote); victoryFlash.current = 20; onBossUpdate(null);
                    }
                    stats.sessionCoins += e.isBoss ? 50 : (e.type === 'ZANGANO' ? 5 : (e.type === 'VESPA' ? 8 : 2));
                    stats.score += e.isBoss ? 500 : (e.type === 'ZANGANO' ? 20 : (e.type === 'VESPA' ? 35 : 10));
                    
                    let r = Math.random();
                    if (r > 0.95) powerupsRef.current.push(createPowerUp(e.x, e.y, 'life'));
                    else if (r > 0.9) powerupsRef.current.push(createPowerUp(e.x, e.y, 'gun'));
                    else if (r > 0.85) powerupsRef.current.push(createPowerUp(e.x, e.y, 'freeze'));
                    else if (r > 0.8) powerupsRef.current.push(createPowerUp(e.x, e.y, 'clone'));
                }
                return false; 
            }
            return true;
        });

        if (e.hp <= 0) return false;

        if (player.invul <= 0 && player.x < e.x + e.size && player.x + player.w > e.x && player.y < e.y + e.size && player.y + player.h > e.y) {
            if(handlePlayerHit()) {
                const message = e.isBoss ? "Destruído pelo chefão!" : (e.type !== 'METEOR' ? 'Abatido por uma nave alienígena!' : 'Sua nave foi destruída!');
                onGameOver(stats.score, message);
                localGameOver = true;
            }
            if (e.isBoss) {
                e.hp = e.maxHp; e.y = -e.size;
                onBossUpdate({ current: e.maxHp, max: e.maxHp });
            } else {
                return false;
            }
        }
        return true;
    });

    enemyBulletsRef.current = enemyBulletsRef.current.filter(b => {
      if (freezeTimer.current <= 0) {
        b.x += b.dx || 0;
        b.y += b.dy || b.speed;
      }
      if (player.invul <= 0 && b.x < player.x + player.w && b.x + b.w > player.x && b.y < player.y + player.h && b.y + b.h > player.y) {
          if(handlePlayerHit()) {
              onGameOver(stats.score, "Sua nave foi abatida!");
              localGameOver = true;
          }
          return false;
      }
      return b.y < canvas.height && b.y > -20 && b.x > -20 && b.x < canvas.width + 20;
    });

    powerupsRef.current = powerupsRef.current.filter(p => {
        p.update();
        if (player.x < p.x + p.size && player.x + player.w > p.x && player.y < p.y + p.size && player.y + player.h > p.y) {
            if (p.type === 'life') stats.lives++;
            if (p.type === 'gun' && playerRef.current.gunMode < 4) playerRef.current.gunMode++;
            if (p.type === 'freeze') onFreezeCharge(true);
            if (p.type === 'clone') cloneTimer.current = 600;
            audioService.play(600, 0.2, 'sine'); return false;
        }
        return p.y < canvas.height;
    });

    bulletsRef.current = bulletsRef.current.filter(b => { b.y -= 12; return b.y > -50 });
    
    if (frameCount.current % 1200 === 0 && frameCount.current > 0 && !enemiesRef.current.some(e => e.isBoss)) {
        stats.level++;
        if (stats.level % 4 === 0) {
          onAlert("INVASÃO ALIENÍGENA!");
        }
    }

    onStatsUpdate({ ...stats, shield: player.hasShield });
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas, mas não desenha fundo
    
    enemiesRef.current.forEach(e => {
        let enemyImage: HTMLImageElement | null = null;
        switch(e.type) {
            case 'METEOR': enemyImage = e.isBoss ? assetService.assets.meteorBig : assetService.assets.meteor; break;
            case 'ZANGANO': enemyImage = assetService.assets.enemyZangano; break;
            case 'VESPA': enemyImage = assetService.assets.enemyVespa; break;
            case 'BESOURO': enemyImage = assetService.assets.enemyBesouro; break;
        }

        if (enemyImage) {
            ctx.save();
            ctx.translate(e.x + e.size / 2, e.y + e.size / 2);
            if(e.type === 'METEOR') ctx.rotate(e.rotation);
            if(freezeTimer.current > 0) ctx.filter = 'grayscale(1) brightness(1.5) sepia(1) hue-rotate(180deg)';
            ctx.drawImage(enemyImage, -e.size / 2, -e.size / 2, e.size, e.size);
            ctx.restore();
        }
    });

    powerupsRef.current.forEach(p => p.draw(ctx));
    drawPlayer(ctx, player);
    
    ctx.fillStyle = cloneTimer.current > 0 ? "#ff0" : "#fff";
    bulletsRef.current.forEach(b => ctx.fillRect(b.x-2, b.y, 4, 15));
    
    ctx.fillStyle = "#f00";
    enemyBulletsRef.current.forEach(b => ctx.fillRect(b.x - b.w/2, b.y, b.w, b.h));

    if (freezeTimer.current > 0) { ctx.fillStyle = "rgba(0,255,255,0.15)"; ctx.fillRect(0,0,canvas.width,canvas.height); }
    if (victoryFlash.current > 0) { ctx.fillStyle = `rgba(255,255,255,${victoryFlash.current/40})`; ctx.fillRect(0,0,canvas.width,canvas.height); }
    if (!localGameOver) gameLoopId.current = requestAnimationFrame(gameLoop);
  }, [isPaused, onGameOver, onStatsUpdate, onVictory, onFreezeCharge, onAlert, onBossUpdate, createEnemy, handlePlayerHit, shopUpgrades]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches[0]) {
          playerRef.current.x = e.touches[0].clientX - playerRef.current.w / 2;
          playerRef.current.y = e.touches[0].clientY - playerRef.current.h / 2;
        }
        e.preventDefault();
    };
    const handleFreeze = () => { freezeTimer.current = 240; audioService.play(200, 0.5, 'sine'); };
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('activateFreeze', handleFreeze);
    gameLoopId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('activateFreeze', handleFreeze);
    };
  }, [gameLoop]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 block z-10" />;
};

export default GameCanvas;