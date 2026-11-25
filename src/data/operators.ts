import type { OperatorId } from '@/types';

export type Gear = 'helmet' | 'cap' | 'beret' | 'hood' | 'ghillie';

export type Operator = {
  id: OperatorId;
  callsign: string;
  role: string;
  color: string;
  ability: string;
  abilityText: string;
  quote: string;
  speed: number;
  armor: number;
  utility: number;
  gear: Gear;
  skin: string;
  outfit: string;
  visor: string;
};

export const OPERATORS: Operator[] = [
  {
    id: 'viper',
    callsign: 'VIPER',
    role: 'Assault',
    color: '#ffb000',
    ability: 'Breach charge',
    abilityText: 'Opens any door. Most walls. One very surprised fridge.',
    quote: "I don't knock.",
    speed: 4,
    armor: 4,
    utility: 2,
    gear: 'helmet',
    skin: '#c99a6e',
    outfit: '#4b5320',
    visor: '#ffb000',
  },
  {
    id: 'kestrel',
    callsign: 'KESTREL',
    role: 'Scout',
    color: '#2dd4bf',
    ability: 'Drone eye',
    abilityText: "Ten seconds of bird's-eye view. Birds not included.",
    quote: 'Seen you. Seen your snacks too.',
    speed: 5,
    armor: 2,
    utility: 4,
    gear: 'cap',
    skin: '#8d5a3b',
    outfit: '#2f4a46',
    visor: '#2dd4bf',
  },
  {
    id: 'onyx',
    callsign: 'ONYX',
    role: 'Medic',
    color: '#f87171',
    ability: 'Patch up',
    abilityText: 'Revives twice as fast. Bedside manner: still loading.',
    quote: "Hold still. Or don't, I'm quick.",
    speed: 3,
    armor: 3,
    utility: 5,
    gear: 'beret',
    skin: '#e0b48c',
    outfit: '#3a3f42',
    visor: '#f87171',
  },
  {
    id: 'halcyon',
    callsign: 'HALCYON',
    role: 'Engineer',
    color: '#a3e635',
    ability: 'Pocket wall',
    abilityText: 'A full cover wall that folds into your back pocket.',
    quote: 'I build walls. Emotionally, too.',
    speed: 2,
    armor: 5,
    utility: 4,
    gear: 'hood',
    skin: '#b07a52',
    outfit: '#4a4030',
    visor: '#a3e635',
  },
  {
    id: 'bramble',
    callsign: 'BRAMBLE',
    role: 'Recon',
    color: '#c084fc',
    ability: 'Bush mode',
    abilityText: 'Become a very convincing shrub. Do not water.',
    quote: 'I am the bush. The bush is me.',
    speed: 3,
    armor: 2,
    utility: 5,
    gear: 'ghillie',
    skin: '#d9a77c',
    outfit: '#3c4a1f',
    visor: '#c084fc',
  },
];

export function findOperator(id: OperatorId): Operator {
  return OPERATORS.find((operator) => operator.id === id) ?? OPERATORS[0];
}
