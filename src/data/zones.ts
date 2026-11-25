import type { ZoneId } from '@/types';

export type Zone = {
  id: ZoneId;
  name: string;
  grid: string;
  x: number;
  y: number;
  loot: number;
  danger: number;
  tagline: string;
  bestFor: string;
};

export const MAP_SIZE = 600;

export const ZONES: Zone[] = [
  {
    id: 'radar',
    name: 'Radar Hill',
    grid: 'B-2',
    x: 190,
    y: 175,
    loot: 5,
    danger: 4,
    tagline: 'Everyone sees you land. Everyone.',
    bestFor: 'Squad',
  },
  {
    id: 'docks',
    name: 'Rustwater Docks',
    grid: 'E-2',
    x: 455,
    y: 150,
    loot: 4,
    danger: 5,
    tagline: 'Great loot. Terrible neighbours.',
    bestFor: 'Duo',
  },
  {
    id: 'lodge',
    name: 'Pinecrest Lodge',
    grid: 'A-4',
    x: 125,
    y: 365,
    loot: 2,
    danger: 1,
    tagline: 'Quiet. Cozy. Suspiciously quiet.',
    bestFor: 'Solo',
  },
  {
    id: 'quarry',
    name: 'Old Quarry',
    grid: 'C-4',
    x: 300,
    y: 330,
    loot: 3,
    danger: 3,
    tagline: 'Rocks, crates, and more rocks.',
    bestFor: 'Squad',
  },
  {
    id: 'mall',
    name: 'Ghost Mall',
    grid: 'E-4',
    x: 470,
    y: 400,
    loot: 4,
    danger: 3,
    tagline: 'Closed for years. Still has a sale on.',
    bestFor: 'Night ops',
  },
  {
    id: 'farms',
    name: 'Sunny Farms',
    grid: 'C-5',
    x: 285,
    y: 490,
    loot: 2,
    danger: 2,
    tagline: 'The chickens have seen things.',
    bestFor: 'Solo',
  },
];

export function findZone(id: ZoneId): Zone {
  return ZONES.find((zone) => zone.id === id) ?? ZONES[0];
}
