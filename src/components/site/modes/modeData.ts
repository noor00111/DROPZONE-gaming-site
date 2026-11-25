import type { GameModeId } from '@/types';

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export type GameMode = {
  id: GameModeId;
  name: string;
  tagline: string;
  description: string;
  perks: string[];
  tag?: string;
  players: number;
  squadSize: number;
  matchTime: string;
  chaos: number;
  rarity: Rarity;
  color: string;
  frame: string;
  sky: string;
};

export const MODES: GameMode[] = [
  {
    id: 'solo',
    name: 'Solo',
    tagline: 'One chute. Zero backup.',
    description: 'Every crate is yours. So is every single mistake.',
    perks: ['All the loot, all to yourself', 'Nobody steals your kills', 'Nobody to blame either'],
    players: 60,
    squadSize: 1,
    matchTime: '20m',
    chaos: 2,
    rarity: 'Common',
    color: '#b8c0c4',
    frame: 'linear-gradient(145deg, #e3e8ea, #7d878c 55%, #c9d0d3)',
    sky: 'linear-gradient(180deg, #3b4246 0%, #6b6550 70%, #8a7a52 100%)',
  },
  {
    id: 'duo',
    name: 'Duo',
    tagline: "Watch each other's six.",
    description: 'One scouts ahead. The other carries the snacks.',
    perks: ['Revive your partner', 'Shared map pings', 'Split the snacks 50/50'],
    players: 60,
    squadSize: 2,
    matchTime: '22m',
    chaos: 3,
    rarity: 'Rare',
    color: '#2dd4bf',
    frame: 'linear-gradient(145deg, #7af5e4, #129c8b 55%, #49e0cc)',
    sky: 'linear-gradient(180deg, #103a3a 0%, #2d5f55 65%, #6b7a4a 100%)',
  },
  {
    id: 'squad',
    name: 'Squad',
    tagline: 'Revive. Regroup. Ride out.',
    description: 'Four chutes, one plan, zero chance anyone follows it.',
    perks: ['Full squad revives', 'Voice chat chaos included', 'Someone always lands in the lake'],
    tag: 'Most played',
    players: 64,
    squadSize: 4,
    matchTime: '25m',
    chaos: 5,
    rarity: 'Epic',
    color: '#ffb000',
    frame: 'linear-gradient(145deg, #ffe08a, #c98400 55%, #ffc845)',
    sky: 'linear-gradient(180deg, #3a2a10 0%, #8a5a12 60%, #d18a1a 100%)',
  },
  {
    id: 'night',
    name: 'Night ops',
    tagline: 'Lights off. Thermals on.',
    description: 'Flares light up the whole sky. And you. Mostly you.',
    perks: [
      'Thermal scopes in every crate',
      'Flares reveal the zone',
      'Footsteps are twice as loud',
    ],
    tag: 'Limited time',
    players: 40,
    squadSize: 4,
    matchTime: '18m',
    chaos: 4,
    rarity: 'Legendary',
    color: '#c084fc',
    frame: 'linear-gradient(120deg, #a855f7, #ec4899, #38bdf8, #a3e635, #a855f7)',
    sky: 'linear-gradient(180deg, #0b0820 0%, #241445 60%, #3b1f5c 100%)',
  },
];
