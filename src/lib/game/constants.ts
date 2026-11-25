import type { GameWeapon } from './types';

export const ROUNDS = 5;
export const ISLAND_LEFT = 70;
export const PAD_START_WIDTH = 160;
export const PAD_SHRINK = 20;
export const FALL_TIME = 5.2;
export const FALL_TIME_STEP = 0.4;
export const STEER_FORCE = 520;
export const DRAG = 2.6;
export const WIND_MAX = 70;
export const WIND_STEP = 18;
export const COINS_PER_ROUND = 3;
export const COIN_POINTS = 15;
export const BIRD_PENALTY = 10;
export const PERFECT_DISTANCE = 8;
export const LANDED_PAUSE = 1.3;
export const CLEARED_PAUSE = 1.3;

export const DEFEND_TIME = 7;
export const SPAWN_EVERY = 0.75;
export const TARGET_HP = 10;
export const CARDBOARD_POINTS = 10;
export const DRONE_POINTS = 15;
export const SEAGULL_PENALTY = 20;
export const RELOAD_TIME = 1.3;
export const BLAST_RADIUS_SHOTGUN = 45;
export const BLAST_RADIUS_FLARE = 85;

export const STARTING_WEAPON: GameWeapon = {
  id: 'carbine',
  name: 'M-17 Carbine',
  damage: 6,
  range: 7,
  fireRate: 7,
  mag: 30,
};
