import type { Rarity } from '@/types';

export const RARITY_STYLES: Record<Rarity, { color: string; frame: string }> = {
  Common: {
    color: '#b8c0c4',
    frame: 'linear-gradient(145deg, #e3e8ea, #7d878c 55%, #c9d0d3)',
  },
  Rare: {
    color: '#2dd4bf',
    frame: 'linear-gradient(145deg, #7af5e4, #129c8b 55%, #49e0cc)',
  },
  Epic: {
    color: '#ffb000',
    frame: 'linear-gradient(145deg, #ffe08a, #c98400 55%, #ffc845)',
  },
  Legendary: {
    color: '#c084fc',
    frame: 'linear-gradient(120deg, #a855f7, #ec4899, #38bdf8, #a3e635, #a855f7)',
  },
};
