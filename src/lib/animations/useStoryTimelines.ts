'use client';

import type { RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { SceneManager } from '@/lib/three/SceneManager';
import { useGameStore } from '@/store/useGameStore';
import type { Phase } from '@/types';
import { createDiveTimeline } from './diveTimeline';
import { createGameStartTimeline, createReadyLoop } from './gameStartTimeline';
import { createIntroTimeline } from './introTimeline';

gsap.registerPlugin(useGSAP);

export function useStoryTimelines(
  phase: Phase,
  scene: SceneManager | null,
  scopeRef: RefObject<HTMLElement | null>,
) {
  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const setPhase = useGameStore.getState().setPhase;

      if (phase === 'intro') {
        createIntroTimeline(scene, reduceMotion, () => setPhase('ready'));
      } else if (phase === 'ready') {
        createReadyLoop(reduceMotion);
      } else if (phase === 'deploying') {
        createDiveTimeline(scene, reduceMotion, () => setPhase('game-start'));
      } else if (phase === 'game-start') {
        createGameStartTimeline(scene, reduceMotion);
      }
    },
    {
      dependencies: [phase, scene],
      scope: scopeRef,
      revertOnUpdate: true,
    },
  );
}
