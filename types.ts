
export enum GameState {
  Intro,
  Start,
  Playing,
  Paused,
  Shop,
  Help,
  GameOver
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  bright: number;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  fireRate: number;
  fireTimer: number;
  gunMode: number;
  hasShield: boolean;
  damage: number;
  invul: number;
}

export interface Bullet {
  x: number;
  y: number;
  damage: number;
}

export interface EnemyBullet {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  dx?: number;
  dy?: number;
}

export type PowerUpType = 'life' | 'gun' | 'freeze' | 'clone';

export interface PowerUp {
  x: number;
  y: number;
  size: number;
  type: PowerUpType;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export interface EnemyPoint {
  x: number;
  y: number;
}

export type EnemyType = 'METEOR' | 'ZANGANO' | 'VESPA' | 'BESOURO';

export interface Enemy {
  type: EnemyType;
  isBoss: boolean;
  size: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  fireRate?: number;
  fireTimer?: number;
  state?: 'ENTERING' | 'FIRING' | 'LEAVING';
  targetY?: number;
}

export interface ShopUpgrades {
  shield: boolean;
  fast: boolean;
  shipLevel: number;
  gunMode: number;
  guardianAngel: boolean;
}

export interface GameStats {
  score: number;
  level: number;
  lives: number;
  sessionCoins: number;
  shield: boolean;
}