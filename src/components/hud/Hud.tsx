'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { Lock } from 'lucide-react';
import { selectHasDeployed, selectPhase, useGameStore } from '@/store/useGameStore';
import AmmoCounter from './AmmoCounter';
import Compass from './Compass';
import DeployButton from './DeployButton';
import HealthBar from './HealthBar';
import Minimap from './Minimap';
import MuteToggle, { toggleMuteWithClick } from './MuteToggle';
import SquadList from './SquadList';
import Title from './Title';

function useHudKeys() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const store = useGameStore.getState();
      const key = event.key.toLowerCase();

      if (key === 'm') {
        toggleMuteWithClick();
        return;
      }

      if (store.phase !== 'ready' && store.phase !== 'game-start') return;
      if (window.scrollY > window.innerHeight * 0.5) return;

      if (event.code === 'Space') {
        if (event.target instanceof HTMLButtonElement) return;
        event.preventDefault();
        if (!event.repeat) store.takeDamage();
      } else if (key === 'f') {
        store.fire();
      } else if (key === 'r') {
        store.reload();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}

function useHitShake(hudRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const unsubscribe = useGameStore.subscribe((state, previousState) => {
      if (state.health >= previousState.health) return;
      if (!hudRef.current) return;

      hudRef.current.animate(
        [
          { translate: '0 0' },
          { translate: '-6px 3px' },
          { translate: '5px -2px' },
          { translate: '-3px 1px' },
          { translate: '0 0' },
        ],
        { duration: 280, easing: 'ease-out' },
      );
    });

    return unsubscribe;
  }, [hudRef]);
}

export default function Hud() {
  
  const phase = useGameStore(selectPhase);
  const hasDeployed = useGameStore(selectHasDeployed);
  const hudRef = useRef<HTMLDivElement>(null);
  useHudKeys();
  useHitShake(hudRef);

  const showHud = phase === 'intro' || phase === 'ready' || phase === 'game-start';
  const showBriefing = phase === 'intro' || phase === 'ready';

  return (
    <div
      ref={hudRef}
      className="fade-panel pointer-events-none absolute inset-0 z-20 select-none"
      data-visible={showHud}
      aria-hidden={!showHud}
    >
      <div className="hud-top-left pointer-events-auto flex flex-col items-start gap-3">
        <MuteToggle />
        <div className="hidden md:block">
          <SquadList />
        </div>
      </div>

      <div className="hud-top-center">
        <Compass />
      </div>

      <div className="hud-top-right hidden sm:block">
        <Minimap />
      </div>

      <div className="hud-title fade-panel" data-visible={showBriefing}>
        <Title />
      </div>

      <div className="hud-bottom-left">
        <HealthBar />
      </div>

      <div
        className="hud-bottom-center fade-panel pointer-events-auto flex flex-col items-center gap-2"
        data-visible={showBriefing}
      >
        <DeployButton />
        <p className="telemetry keyboard-only">Space hit · F fire · R reload · M mute</p>
      </div>

      <div className="hud-bottom-right">
        <AmmoCounter />
      </div>

      {hasDeployed ? (
        <a
          href="#modes"
          className="hud-right-middle pointer-events-auto hidden flex-col items-center gap-3 text-text/60 transition-colors hover:text-amber lg:flex"
          aria-label="Scroll to explore the game"
        >
          <span className="telemetry [writing-mode:vertical-rl]">Scroll to explore</span>
          <span className="relative block h-14 w-px bg-line">
            <span className="scroll-line absolute inset-0 bg-amber" />
          </span>
        </a>
      ) : (
        <p className="hud-right-middle hidden flex-col items-center gap-3 text-text/60 lg:flex">
          <span className="telemetry [writing-mode:vertical-rl]">
            Deploy to enter the drop zone
          </span>
          <Lock className="h-5 w-5 text-amber" aria-hidden="true" />
        </p>
      )}
    </div>
  );
}
