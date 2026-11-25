import { ISLAND_LEFT, TARGET_HP } from './constants';
import { random } from './random';
import type { Bird, Cloud, Coin, Target } from './types';

export function makeCloud(worldWidth: number): Cloud {
  return { x: random(0, worldWidth), y: random(30, 260), size: random(40, 90) };
}

export function makeCoin(worldWidth: number, groundY: number): Coin {
  return {
    x: random(120, worldWidth - 120),
    y: random(110, groundY - 90),
    taken: false,
  };
}

export function makeBird(worldWidth: number, groundY: number): Bird {
  const fromLeft = Math.random() < 0.5;
  return {
    x: fromLeft ? random(-300, -40) : random(worldWidth + 40, worldWidth + 300),
    y: random(120, groundY - 110),
    speed: (fromLeft ? 1 : -1) * random(60, 110),
    hit: false,
  };
}

export function makeTarget(
  round: number,
  worldWidth: number,
  groundY: number,
  crateX: number,
): Target {
  const isDrone = Math.random() < 0.35 + round * 0.05;
  if (isDrone) {
    const fromLeft = Math.random() < 0.5;
    return {
      kind: 'drone',
      x: fromLeft ? -30 : worldWidth + 30,
      y: random(90, groundY - 160),
      speed: (fromLeft ? 1 : -1) * random(80, 130 + round * 10),
      hp: TARGET_HP,
      life: 99,
      dead: false,
      fall: 0,
    };
  }

  const islandRight = worldWidth - ISLAND_LEFT;
  let x = random(ISLAND_LEFT + 30, islandRight - 30);
  if (Math.abs(x - crateX) < 60) x += x < crateX ? -70 : 70;
  return {
    kind: 'cardboard',
    x,
    y: 0,
    speed: 0,
    hp: TARGET_HP,
    life: random(1.8, 2.6) - round * 0.1,
    dead: false,
    fall: 0,
  };
}
