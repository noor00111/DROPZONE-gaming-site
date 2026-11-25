'use client';

import { useEffect } from 'react';
import { findOperator } from '@/data/operators';
import { findWeapon } from '@/data/weapons';
import { findZone } from '@/data/zones';
import { useGameStore } from '@/store/useGameStore';
import { SECTION_IDS, useProgressStore } from '@/store/useProgressStore';

const MODE_NAMES: Record<string, string> = {
  solo: 'Solo',
  duo: 'Duo',
  squad: 'Squad',
  night: 'Night ops',
};
const HIT_CAUSES = [
  'gravity',
  'a very rude door',
  'friendly fire (allegedly)',
  'a falling crate',
  'their own shoelaces',
];
const IDLE_JOKES = [
  ['KESTREL', 'spotted a suspicious chicken'],
  ['ONYX', 'revived a houseplant'],
  ['HALCYON', 'built a wall around the snack bar'],
  ['BRAMBLE', 'was mistaken for a bush. Correctly.'],
  ['VIPER', 'knocked. Then remembered she doesn’t knock.'],
  ['KESTREL', 'lost the drone in a tree. Again.'],
  ['ONYX', 'says hold still'],
  ['HALCYON', 'is emotionally walled off'],
];
const IDLE_JOKE_EVERY = 28000;
const MAX_IDLE_JOKES = 8;

const SECRET_CODE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
];

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export default function ProgressTracker() {
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state, previous) => {
      const progress = useProgressStore.getState();
      const me = findOperator(state.operatorId).callsign;

      if (state.weaponId === previous.weaponId && state.ammo.mag < previous.ammo.mag) {
        progress.recordShot();
        if (state.ammo.mag === 0) progress.pushFeed(me, 'ran dry. Classic.');
      }

      if (state.health < previous.health) {
        progress.recordHit();
        if (Math.random() < 0.5) progress.pushFeed(me, `got hit by ${pickRandom(HIT_CAUSES)}`);
      }

      if (state.phase === 'deploying' && previous.phase !== 'deploying') {
        progress.unlock('deploy');
        progress.pushFeed(me, 'jumped out of the plane. Brave.');
      }

      if (state.selectedMode !== previous.selectedMode) {
        progress.addXpOnce(`mode:${state.selectedMode}`, 40);
        progress.pushFeed(me, `locked in ${MODE_NAMES[state.selectedMode]}`);
      }

      if (state.dropZone !== previous.dropZone) {
        const zone = findZone(state.dropZone);
        progress.addXpOnce(`zone:${zone.id}`, 40);
        progress.pushFeed(
          me,
          `marked ${zone.name}. ${zone.danger >= 4 ? 'Bold choice.' : 'Cozy choice.'}`,
        );
      }

      if (state.weaponId !== previous.weaponId) {
        progress.addXpOnce(`weapon:${state.weaponId}`, 30);
        progress.pushFeed(me, `picked up the ${findWeapon(state.weaponId).name}`);
      }

      if (state.operatorId !== previous.operatorId) {
        progress.addXpOnce(`operator:${state.operatorId}`, 60);
        progress.pushFeed(me, 'is now you. Hi!');
        if (state.operatorId === 'bramble') progress.unlock('bush');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const progress = useProgressStore.getState();
          progress.markSectionVisited(entry.target.id);
          if (entry.target.id === 'operators') {
            progress.markOperatorViewed(useGameStore.getState().operatorId);
          }
        }
      },
      { threshold: 0.3 },
    );
    for (const id of SECTION_IDS) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let jokesTold = 0;
    const timer = window.setInterval(() => {
      if (document.hidden || jokesTold >= MAX_IDLE_JOKES) return;
      if (useGameStore.getState().phase === 'loading') return;
      const [actor, text] = pickRandom(IDLE_JOKES);
      useProgressStore.getState().pushFeed(actor, text);
      jokesTold += 1;
    }, IDLE_JOKE_EVERY);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let position = 0;

    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (key === SECRET_CODE[position]) {
        position += 1;
        if (position === SECRET_CODE.length) {
          position = 0;
          useProgressStore.getState().triggerSecret();
          useProgressStore.getState().pushFeed('???', 'called in a golden supply drop');
        }
      } else {
        position = key === SECRET_CODE[0] ? 1 : 0;
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return null;
}
