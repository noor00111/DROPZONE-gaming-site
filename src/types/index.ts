export type Phase = 'loading' | 'intro' | 'ready' | 'deploying' | 'game-start';
export type QualityTier = 'high' | 'low';

export interface LoadProgress {
  loaded: number;
  total: number;
  ratio: number;
  done: boolean;
  failed: string[];
}

export type SquadStatus = 'alive' | 'downed' | 'out';

export interface SquadMember {
  id: string;
  callsign: string;
  health: number;
  status: SquadStatus;
  isPlayer: boolean;
}

export interface AmmoState {
  mag: number;
  magSize: number;
  reserve: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export type MinimapMarkerKind = 'player' | 'squad' | 'drop' | 'zone';
export interface MinimapMarker {
  id: string;
  kind: MinimapMarkerKind;
  position: Vec2;
  label?: string;
}

export type GameModeId = 'solo' | 'duo' | 'squad' | 'night';
export type ZoneId = 'radar' | 'docks' | 'lodge' | 'quarry' | 'mall' | 'farms';
export type WeaponId = 'carbine' | 'smg' | 'shotgun' | 'sniper' | 'pistol' | 'flare';
export type OperatorId = 'viper' | 'kestrel' | 'onyx' | 'halcyon' | 'bramble';
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type SoundId ='ui-click' | 'ui-hover' | 'whoosh' | 'ambient-drone' | 'glitch' | 'shot' | 'unlock';
