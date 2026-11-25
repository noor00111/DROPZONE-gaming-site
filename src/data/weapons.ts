import type { Rarity, WeaponId } from '@/types';

export type Weapon = {
  id: WeaponId;
  name: string;
  type: string;
  rarity: Rarity;
  quote: string;
  damage: number;
  range: number;
  fireRate: number;
  handling: number;
  mag: number;
};

export const WEAPONS: Weapon[] = [
  {
    id: 'carbine',
    name: 'M-17 Carbine',
    type: 'Assault rifle',
    rarity: 'Rare',
    quote: 'Reliable, loud, and already on your HUD.',
    damage: 6,
    range: 7,
    fireRate: 7,
    handling: 6,
    mag: 30,
  },
  {
    id: 'smg',
    name: 'Viper SMG',
    type: 'Submachine gun',
    rarity: 'Common',
    quote: 'Sprays like a garden hose. An angry one.',
    damage: 4,
    range: 3,
    fireRate: 10,
    handling: 9,
    mag: 35,
  },
  {
    id: 'shotgun',
    name: 'Breacher 12',
    type: 'Shotgun',
    rarity: 'Epic',
    quote: 'Knock knock. Nobody is there anymore.',
    damage: 9,
    range: 2,
    fireRate: 3,
    handling: 6,
    mag: 8,
  },
  {
    id: 'sniper',
    name: 'Longshot .338',
    type: 'Sniper rifle',
    rarity: 'Legendary',
    quote: 'Patience sold separately.',
    damage: 10,
    range: 10,
    fireRate: 2,
    handling: 3,
    mag: 5,
  },
  {
    id: 'pistol',
    name: 'Sidekick P9',
    type: 'Pistol',
    rarity: 'Common',
    quote: 'Last resort. First regret.',
    damage: 3,
    range: 4,
    fireRate: 6,
    handling: 10,
    mag: 15,
  },
  {
    id: 'flare',
    name: 'Skylight Flare',
    type: 'Signal gun',
    rarity: 'Epic',
    quote: 'Lights up the sky. And, sadly, you.',
    damage: 1,
    range: 8,
    fireRate: 1,
    handling: 9,
    mag: 1,
  },
];

export function findWeapon(id: WeaponId): Weapon {
  return WEAPONS.find((weapon) => weapon.id === id) ?? WEAPONS[0];
}
