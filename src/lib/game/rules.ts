import {BLAST_RADIUS_FLARE, BLAST_RADIUS_SHOTGUN, ISLAND_LEFT, PERFECT_DISTANCE} from './constants';
import type { LandResult, Target } from './types';

export function targetCenterY(target: Target, groundY: number): number {
  return target.kind === 'drone' ? target.y : groundY - target.y + 25;
}

export function isInsideTarget(target: Target, x: number, y: number, groundY: number): boolean {
  if (target.kind === 'drone') return Math.hypot(target.x - x, target.y - y) < 22;
  const top = groundY - target.y;
  return Math.abs(x - target.x) < 18 && y > top && y < top + 54;
}

export function isNearTarget(
  target: Target,
  x: number,
  y: number,
  radius: number,
  groundY: number,
): boolean {
  return Math.hypot(target.x - x, targetCenterY(target, groundY) - y) < radius;
}

export function blastRadiusFor(weaponId: string): number {
  if (weaponId === 'shotgun') return BLAST_RADIUS_SHOTGUN;
  if (weaponId === 'flare') return BLAST_RADIUS_FLARE;
  return 0;
}

export function scoreLanding(
  crateX: number,
  padX: number,
  padWidth: number,
  worldWidth: number,
): LandResult {
  const islandRight = worldWidth - ISLAND_LEFT;
  const onIsland = crateX > ISLAND_LEFT && crateX < islandRight;
  const distance = Math.abs(crateX - padX);
  const halfPad = padWidth / 2;

  if (!onIsland) {
    return { points: 0, label: 'SPLASH!', isPerfect: false, isSplash: true };
  }
  if (distance <= PERFECT_DISTANCE) {
    return { points: 100, label: 'PERFECT!', isPerfect: true, isSplash: false };
  }
  if (distance <= halfPad) {
    const points = Math.round(99 - (distance / halfPad) * 59);
    const label = points >= 75 ? 'GREAT!' : 'GOOD';
    return { points, label, isPerfect: false, isSplash: false };
  }
  return { points: 10, label: 'OFF TARGET', isPerfect: false, isSplash: false };
}
