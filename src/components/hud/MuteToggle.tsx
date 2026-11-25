'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { audio } from '@/lib/audio/AudioManager';
import { selectMuted, useGameStore } from '@/store/useGameStore';

export function toggleMuteWithClick() {
  const store = useGameStore.getState();
  store.unlockAudio();

  if (store.muted) {
    store.toggleMuted();
    audio.play('ui-click');
  } else {
    audio.play('ui-click');
    store.toggleMuted();
  }
}

export default function MuteToggle() {
  const muted = useGameStore(selectMuted);

  function handleClick() {
    toggleMuteWithClick();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={muted ? 'Muted [M]: turn sound on' : 'Sound [M]: mute'}
      data-hud="mute"
      className="hud-panel glitch-on-hover flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-[0.2em] transition-colors hover:border-amber hover:text-amber"
    >
      {muted ? (
        <VolumeX className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="glitch-text hidden sm:inline">{muted ? 'Muted' : 'Sound'}</span>
      <span className="keyboard-only hidden text-text/60 sm:inline">[M]</span>
    </button>
  );
}
