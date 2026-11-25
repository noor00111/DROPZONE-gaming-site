import {Compass, Crosshair, Dices, Footprints, Gift, HeartCrack, Leaf, Shirt, Spade, Target, Ticket, Trophy, type LucideIcon} from 'lucide-react';

export type AchievementId =
  | 'deploy'
  | 'card-shark'
  | 'tourist'
  | 'lucky'
  | 'trigger-happy'
  | 'fashion'
  | 'free-pass'
  | 'ouch'
  | 'bush'
  | 'secret'
  | 'bullseye'
  | 'ace';

export type Achievement = {
  id: AchievementId;
  name: string;
  description: string;
  icon: LucideIcon;
  xp: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'deploy',
    name: 'Boots on the ground',
    description: 'Jump out of the plane.',
    icon: Footprints,
    xp: 150,
  },
  {
    id: 'card-shark',
    name: 'Card shark',
    description: 'Flip all four mode cards.',
    icon: Spade,
    xp: 150,
  },
  {
    id: 'tourist',
    name: 'Tourist',
    description: 'Visit every section of the site.',
    icon: Compass,
    xp: 200,
  },
  {
    id: 'lucky',
    name: 'Feeling lucky',
    description: 'Let Hot drop pick your spot.',
    icon: Dices,
    xp: 100,
  },
  {
    id: 'trigger-happy',
    name: 'Trigger happy',
    description: 'Fire 50 test shots.',
    icon: Crosshair,
    xp: 150,
  },
  {
    id: 'fashion',
    name: 'Fashion week',
    description: 'Check out all five operators.',
    icon: Shirt,
    xp: 150,
  },
  {
    id: 'free-pass',
    name: 'Free pass',
    description: 'Unlock every season tier.',
    icon: Ticket,
    xp: 150,
  },
  {
    id: 'ouch',
    name: 'Ouch',
    description: 'Take 5 hits in the HUD (Space).',
    icon: HeartCrack,
    xp: 100,
  },
  { id: 'bush', name: 'One with the bush', description: 'Play as Bramble.', icon: Leaf, xp: 100 },
  {
    id: 'secret',
    name: 'Secret agent',
    description: 'Find the secret supply drop.',
    icon: Gift,
    xp: 500,
  },
  {
    id: 'bullseye',
    name: 'Bullseye',
    description: 'Land dead centre in the Drop Challenge.',
    icon: Target,
    xp: 150,
  },
  {
    id: 'ace',
    name: 'Ace pilot',
    description: 'Score 600+ in one Drop Challenge run.',
    icon: Trophy,
    xp: 200,
  },
];

export function findAchievement(id: AchievementId): Achievement {
  return ACHIEVEMENTS.find((item) => item.id === id) ?? ACHIEVEMENTS[0];
}
