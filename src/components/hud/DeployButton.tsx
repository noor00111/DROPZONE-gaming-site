'use client';

import { audio } from '@/lib/audio/AudioManager';
import { selectPhase, selectSelectedMode, useGameStore } from '@/store/useGameStore';
import type { GameModeId, Phase } from '@/types';

function getButtonText(phase: Phase): string {
  if (phase === 'ready') return 'Deploy';
  if (phase === 'deploying') return 'Deploying…';
  return 'Stand by';
}

const MODE_NAMES: Record<GameModeId, string> = {
  solo: 'Solo',
  duo: 'Duo',
  squad: 'Squad',
  night: 'Night ops',
};

export default function DeployButton() {

  const phase = useGameStore(selectPhase);
  const selectedMode = useGameStore(selectSelectedMode);
  const setPhase = useGameStore((state) => state.setPhase);
  const unlockAudio = useGameStore((state) => state.unlockAudio);
  const isReady = phase === 'ready';

  function handleClick() {
    unlockAudio();
    audio.play('ui-click');
    setPhase('deploying');
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isReady}
      data-hud="deploy"
      className={`brackets glitch-on-hover group relative flex min-w-56 flex-col items-center border px-10 py-3 transition-colors duration-200 ${
        isReady
          ? 'cursor-pointer border-amber bg-amber/10 text-amber hover:bg-amber hover:text-charcoal'
          : 'cursor-not-allowed border-line bg-panel text-text/60'
      }`}
    >
      <span className="glitch-text text-2xl font-bold tracking-[0.35em]">
        {getButtonText(phase)}
      </span>
      <span className="telemetry mt-0.5 whitespace-nowrap group-hover:text-current">
        {isReady ? `${MODE_NAMES[selectedMode]} · jump in to explore` : 'Awaiting clearance'}
      </span>

      {isReady && <span className="hazard absolute right-0 bottom-0 left-0 h-1" />}
    </button>
  );
}
