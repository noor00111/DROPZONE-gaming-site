export type GameWeapon = {
  id: string;
  name: string;
  damage: number;
  range: number;
  fireRate: number;
  mag: number;
};

export type LandResult = {
  points: number;
  label: string;
  isPerfect: boolean;
  isSplash: boolean;
};

export type GameEvents = {
  onLand: (result: LandResult) => void;
  onRoundCleared: (roundScore: number) => void;
  onGameOver: (totalScore: number) => void;
  onCoin: () => void;
  onBird: () => void;
  onShot: () => void;
  onEmpty: () => void;
  onKill: () => void;
  onSeagullShot: () => void;
};

export type Phase = 'title' | 'falling' | 'landed' | 'defend' | 'cleared' | 'over';

export type Crate = { x: number; y: number; vx: number; angle: number };
export type Bird = { x: number; y: number; speed: number; hit: boolean };
export type Coin = { x: number; y: number; taken: boolean };
export type Popup = { x: number; y: number; text: string; color: string; life: number };
export type Cloud = { x: number; y: number; size: number };

export type Target = {
  kind: 'cardboard' | 'drone';
  x: number;
  y: number;
  speed: number;
  hp: number;
  life: number;
  dead: boolean;
  fall: number;
};

export type Tracer = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  life: number;
  blast: number;
};

export type HudInfo = {
  phase: Phase;
  round: number;
  totalScore: number;
  roundScore: number;
  wind: number;
  phaseTimer: number;
  weapon: GameWeapon;
  ammo: number;
  reloadTimer: number;
  lastLabel: string;
  lastLabelColor: string;
  worldWidth: number;
  height: number;
  font: string;
};
