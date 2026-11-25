import { create } from 'zustand';
import { findAchievement, type AchievementId } from '@/data/achievements';

export const XP_PER_LEVEL = 400;
export const SECTION_IDS = ['modes', 'map', 'arsenal', 'operators',  'season', 'challenge', 'debrief'];
export const ACE_SCORE = 600;

const SHOTS_NEEDED = 50;
const HITS_NEEDED = 5;
const MODES_COUNT = 4;
const OPERATORS_COUNT = 5;
const SHOT_XP = 2;
const HIT_XP = 5;

export type FeedItem = { id: number; actor: string; text: string };
export type Toast = { id: number; achievementId: AchievementId };

type ProgressState = {
  xp: number;
  achievements: AchievementId[];
  xpKeys: string[];
  shots: number;
  hits: number;
  hotDrops: number;
  sectionsVisited: string[];
  cardsFlipped: string[];
  operatorsViewed: string[];
  feed: FeedItem[];
  toasts: Toast[];
  secretAt: number;
  challengeBest: number;
  challengeRuns: number;
};

type ProgressActions = {
  addXp: (amount: number) => void;
  addXpOnce: (key: string, amount: number) => void;
  unlock: (id: AchievementId) => void;
  pushFeed: (actor: string, text: string) => void;
  dismissFeed: (id: number) => void;
  dismissToast: (id: number) => void;
  recordShot: () => void;
  recordHit: () => void;
  recordHotDrop: () => void;
  markSectionVisited: (id: string) => void;
  markCardFlipped: (id: string) => void;
  markOperatorViewed: (id: string) => void;
  markSeasonComplete: () => void;
  triggerSecret: () => void;
  recordChallengeRun: (score: number) => void;
};

let nextId = 1;

function addUnique(list: string[], item: string): string[] {
  return list.includes(item) ? list : [...list, item];
}

export const useProgressStore = create<ProgressState & ProgressActions>()((set, get) => ({
  xp: 0,
  achievements: [],
  xpKeys: [],
  shots: 0,
  hits: 0,
  hotDrops: 0,
  sectionsVisited: [],
  cardsFlipped: [],
  operatorsViewed: [],
  feed: [],
  toasts: [],
  secretAt: 0,
  challengeBest: 0,
  challengeRuns: 0,

  addXp: (amount) => set((s) => ({ xp: s.xp + amount })),

  addXpOnce: (key, amount) => {
    if (get().xpKeys.includes(key)) return;
    set((s) => ({ xpKeys: [...s.xpKeys, key], xp: s.xp + amount }));
  },

  unlock: (id) => {
    if (get().achievements.includes(id)) return;
    const achievement = findAchievement(id);
    set((s) => ({
      achievements: [...s.achievements, id],
      xp: s.xp + achievement.xp,
      toasts: [...s.toasts, { id: nextId++, achievementId: id }],
    }));
  },

  pushFeed: (actor, text) =>
    set((s) => ({ feed: [...s.feed, { id: nextId++, actor, text }].slice(-4) })),

  dismissFeed: (id) => set((s) => ({ feed: s.feed.filter((item) => item.id !== id) })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((toast) => toast.id !== id) })),

  recordShot: () => {
    const shots = get().shots + 1;
    set((s) => ({ shots, xp: s.xp + SHOT_XP }));
    if (shots >= SHOTS_NEEDED) get().unlock('trigger-happy');
  },

  recordHit: () => {
    const hits = get().hits + 1;
    set((s) => ({ hits, xp: s.xp + HIT_XP }));
    if (hits >= HITS_NEEDED) get().unlock('ouch');
  },

  recordHotDrop: () => {
    set((s) => ({ hotDrops: s.hotDrops + 1 }));
    get().unlock('lucky');
  },

  markSectionVisited: (id) => {
    if (get().sectionsVisited.includes(id)) return;
    const sectionsVisited = addUnique(get().sectionsVisited, id);
    set({ sectionsVisited });
    get().addXpOnce(`visit:${id}`, 50);
    if (sectionsVisited.length >= SECTION_IDS.length) get().unlock('tourist');
  },

  markCardFlipped: (id) => {
    const cardsFlipped = addUnique(get().cardsFlipped, id);
    set({ cardsFlipped });
    if (cardsFlipped.length >= MODES_COUNT) get().unlock('card-shark');
  },

  markOperatorViewed: (id) => {
    const operatorsViewed = addUnique(get().operatorsViewed, id);
    set({ operatorsViewed });
    if (operatorsViewed.length >= OPERATORS_COUNT) get().unlock('fashion');
  },

  markSeasonComplete: () => get().unlock('free-pass'),

  triggerSecret: () => {
    set({ secretAt: Date.now() });
    get().unlock('secret');
  },

  recordChallengeRun: (score) => {
    set((s) => ({
      challengeRuns: s.challengeRuns + 1,
      challengeBest: Math.max(s.challengeBest, score),
    }));
    if (score >= ACE_SCORE) get().unlock('ace');
  },
}));

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}
