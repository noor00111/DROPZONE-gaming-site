'use client';

import { useEffect } from 'react';
import { audio } from '@/lib/audio/AudioManager';
import { useGameStore } from '@/store/useGameStore';
import type { Phase } from '@/types';

function playPhaseSounds(phase: Phase) {
  if (phase !== 'loading') audio.startAmbient();

  if (phase === 'intro') audio.play('glitch');
  if (phase === 'deploying') audio.play('whoosh');
  if (phase === 'game-start') audio.play('glitch');
}

export default function AudioController() {
  useEffect(() => {
    function onUserGesture() {
      audio.unlock();
      const store = useGameStore.getState();
      store.unlockAudio();
      if (store.phase !== 'loading') audio.startAmbient();
    }

    function onVisibilityChange() {
      audio.setPaused(document.hidden);
    }

    function onPointerOver(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return;
      if (!(event.target instanceof Element)) return;

      const button = event.target.closest('button');
      if (!button || button.disabled) return;

      const cameFrom = event.relatedTarget;
      if (cameFrom instanceof Node && button.contains(cameFrom)) return;

      audio.play('ui-hover');
    }

    window.addEventListener('pointerup', onUserGesture);
    window.addEventListener('keydown', onUserGesture);
    window.addEventListener('pointerover', onPointerOver);
    document.addEventListener('visibilitychange', onVisibilityChange);

    audio.setMuted(useGameStore.getState().muted);

    const unsubscribe = useGameStore.subscribe((state, previousState) => {
      if (state.muted !== previousState.muted) {
        audio.setMuted(state.muted);
      }

      if (state.phase !== previousState.phase) {
        playPhaseSounds(state.phase);
      }

      if (state.health < previousState.health) {
        audio.play('glitch');
      }

      if (state.ammo.mag !== previousState.ammo.mag) {
        audio.play('ui-click');
      }
    });

    return () => {
      window.removeEventListener('pointerup', onUserGesture);
      window.removeEventListener('keydown', onUserGesture);
      window.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      unsubscribe();
      audio.stopAmbient();
    };
  }, []);

  return null;
}
