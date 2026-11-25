'use client';

import { ArrowDown, RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { audio } from '@/lib/audio/AudioManager';
import { selectPhase, useGameStore } from '@/store/useGameStore';

export default function GameStartScreen() {

  const phase = useGameStore(selectPhase);
  const resetRun = useGameStore((state) => state.resetRun);
  const setPhase = useGameStore((state) => state.setPhase);
  const exploreRef = useRef<HTMLAnchorElement>(null);
  const isVisible = phase === 'game-start';

  useEffect(() => {
    if (isVisible && exploreRef.current) {
      exploreRef.current.focus({ preventScroll: true });
    }
  }, [isVisible]);

  function handleReplay() {
    audio.play('ui-click');
    resetRun();
    setPhase('intro');
  }

  return (
    <div
      className="fade-panel pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_55%_30%_at_center,rgb(14_17_16/0.75),transparent)] text-center"
      data-visible={isVisible}
      aria-hidden={!isVisible}
    >
      <p className="hud-label text-amber" data-anim="game-start-kicker">
        Squad deployed · Sector 7
      </p>
      <h2
        className="mt-2 text-5xl font-bold tracking-[0.12em] whitespace-nowrap drop-shadow-[0_0_24px_var(--c-amber-glow)] sm:text-6xl md:text-8xl"
        data-anim="game-start-title"
      >
        Game start
      </h2>
      <div className="hazard mt-4 h-1 w-40" data-anim="game-start-bar" />

      <div
        className="pointer-events-auto mt-8 flex flex-col items-center gap-3 sm:flex-row"
        data-anim="game-start-replay"
      >
        <a
          ref={exploreRef}
          href="#modes"
          onClick={() => audio.play('ui-click')}
          className="brackets glitch-on-hover border border-amber bg-amber/10 px-6 py-2.5 text-sm font-bold tracking-[0.3em] text-amber transition-colors hover:bg-amber hover:text-charcoal"
        >
          <span className="glitch-text inline-flex items-center gap-2">
            Explore the game <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </span>
        </a>
        <button
          type="button"
          onClick={handleReplay}
          className="hud-panel glitch-on-hover cursor-pointer px-6 py-2.5 text-sm font-semibold tracking-[0.3em] transition-colors hover:border-amber hover:text-amber"
        >
          <span className="glitch-text inline-flex items-center gap-2">
            Redeploy <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  );
}
