import { create } from 'zustand';
import type {AmmoState, GameModeId, LoadProgress, Phase, QualityTier, SquadMember, OperatorId, WeaponId, ZoneId} from '@/types';

export const MAX_HEALTH = 100;
export const MAG_SIZE = 30;
export const START_RESERVE = 90;
export const HIT_DAMAGE = 12;

const TRANSITIONS: Record<Phase, readonly Phase[]> = {
  loading: ['intro'],
  intro: ['ready'],
  ready: ['deploying'],
  deploying: ['game-start'],
  'game-start': ['intro'],
};

export function canTransition(from: Phase, to: Phase): boolean {
  return TRANSITIONS[from].includes(to);
}

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

function fullAmmo(magSize: number): AmmoState {
  return { mag: magSize, magSize, reserve: magSize * 3 };
}

export interface GameState {
  phase: Phase;
  muted: boolean;
  audioUnlocked: boolean;
  quality: QualityTier;
  health: number;
  ammo: AmmoState;
  squad: SquadMember[];
  load: LoadProgress;
  selectedMode: GameModeId;
  dropZone: ZoneId;
  weaponId: WeaponId;
  operatorId: OperatorId;
  hasDeployed: boolean;
}

export interface GameActions {
  setPhase: (next: Phase) => boolean;
  toggleMuted: () => void;
  setMuted: (muted: boolean) => void;
  unlockAudio: () => void;
  setQuality: (quality: QualityTier) => void;
  takeDamage: (amount?: number) => number;
  heal: (amount: number) => void;
  fire: () => boolean;
  reload: () => void;
  setLoadProgress: (loaded: number, total: number) => void;
  markLoadFailed: (url: string) => void;
  markLoadDone: () => void;
  resetRun: () => void;
  setSelectedMode: (mode: GameModeId) => void;
  setDropZone: (zone: ZoneId) => void;
  equipWeapon: (weapon: WeaponId, magSize: number) => void;
  setOperator: (operator: OperatorId, callsign: string) => void;
}

export type GameStore = GameState & GameActions;

const initialSquad: SquadMember[] = [
  { id: 'p1', callsign: 'VIPER', health: 100, status: 'alive', isPlayer: true },
  { id: 'p2', callsign: 'KESTREL', health: 82, status: 'alive', isPlayer: false },
  { id: 'p3', callsign: 'ONYX', health: 64, status: 'alive', isPlayer: false },
  { id: 'p4', callsign: 'HALCYON', health: 0, status: 'downed', isPlayer: false },
];

function renamePlayer(squad: SquadMember[], newCallsign: string): SquadMember[] {
  const player = squad.find((member) => member.isPlayer);
  const oldCallsign = player ? player.callsign : '';

  return squad.map((member) => {
    if (member.isPlayer) return { ...member, callsign: newCallsign };
    if (member.callsign === newCallsign) return { ...member, callsign: oldCallsign };
    return member;
  });
}

const initialLoad: LoadProgress = { loaded: 0, total: 0, ratio: 0, done: false, failed: [] };

const initialRun = (): Pick<GameState, 'phase' | 'health' | 'ammo' | 'squad' | 'load'> => ({
  phase: 'loading',
  health: MAX_HEALTH,
  ammo: { mag: MAG_SIZE, magSize: MAG_SIZE, reserve: START_RESERVE },
  squad: initialSquad.map((m) => ({ ...m })),
  load: { ...initialLoad, failed: [] },
});

export const useGameStore = create<GameStore>()((set, get) => ({
  ...initialRun(),
  muted: false,
  audioUnlocked: false,
  quality: 'high',
  selectedMode: 'squad',
  dropZone: 'radar',
  weaponId: 'carbine',
  operatorId: 'viper',
  hasDeployed: false,

  setPhase: (next) => {
    const { phase } = get();
    if (!canTransition(phase, next)) return false;
    set({ phase: next, hasDeployed: next === 'game-start' });
    return true;
  },

  toggleMuted: () => set((s) => ({ muted: !s.muted })),
  setMuted: (muted) => set({ muted }),
  unlockAudio: () => {
    if (!get().audioUnlocked) set({ audioUnlocked: true });
  },
  setQuality: (quality) => set({ quality }),
  setSelectedMode: (mode) => set({ selectedMode: mode }),

  takeDamage: (amount = HIT_DAMAGE) => {
    const health = clamp(get().health - Math.abs(amount), 0, MAX_HEALTH);
    set((s) => ({health, squad: s.squad.map((m) =>
        m.isPlayer ? { ...m, health, status: health > 0 ? 'alive' : 'downed' } : m,
      ),
    }));
    return health;
  },

  heal: (amount) => {
    const health = clamp(get().health + Math.abs(amount), 0, MAX_HEALTH);
    set((s) => ({health,
      squad: s.squad.map((m) => (m.isPlayer ? { ...m, health, status: 'alive' } : m)),
    }));
  },

  fire: () => {
    const { ammo } = get();
    if (ammo.mag <= 0) return false;
    set({ ammo: { ...ammo, mag: ammo.mag - 1 } });
    return true;
  },

  reload: () => {
    const { ammo } = get();
    const needed = ammo.magSize - ammo.mag;
    const taken = Math.min(needed, ammo.reserve);
    if (taken <= 0) return;
    set({ ammo: { ...ammo, mag: ammo.mag + taken, reserve: ammo.reserve - taken } });
  },

  setLoadProgress: (loaded, total) => set((s) => ({load: {...s.load, loaded, total,
    ratio: total > 0 ? clamp(loaded / total, 0, 1) : 0,},})),

  markLoadFailed: (url) => set((s) => s.load.failed.includes(url) ? s : { load: { ...s.load, failed: [...s.load.failed, url] } },),
  markLoadDone: () => set((s) => ({ load: { ...s.load, ratio: 1, done: true } })),

  resetRun: () => {
    const { phase, load, ammo, squad } = get();
    const player = squad.find((member) => member.isPlayer);
    const fresh = initialRun();
    set({...fresh, phase, load,
      ammo: fullAmmo(ammo.magSize),
      squad: player ? renamePlayer(fresh.squad, player.callsign) : fresh.squad,
    });
  },

  setDropZone: (zone) => set({ dropZone: zone }),
  equipWeapon: (weapon, magSize) => set({ weaponId: weapon, ammo: fullAmmo(magSize) }),
  setOperator: (operator, callsign) => set((s) => ({ operatorId: operator, squad: renamePlayer(s.squad, callsign) })),
}));

export const selectPhase = (s: GameStore): Phase => s.phase;
export const selectHealth = (s: GameStore): number => s.health;
export const selectAmmo = (s: GameStore): AmmoState => s.ammo;
export const selectSquad = (s: GameStore): SquadMember[] => s.squad;
export const selectMuted = (s: GameStore): boolean => s.muted;
export const selectLoad = (s: GameStore): LoadProgress => s.load;
export const selectQuality = (s: GameStore): QualityTier => s.quality;
export const selectSelectedMode = (s: GameStore): GameModeId => s.selectedMode;
export const selectDropZone = (s: GameStore): ZoneId => s.dropZone;
export const selectWeaponId = (s: GameStore): WeaponId => s.weaponId;
export const selectOperatorId = (s: GameStore): OperatorId => s.operatorId;
export const selectHasDeployed = (s: GameStore): boolean => s.hasDeployed;
