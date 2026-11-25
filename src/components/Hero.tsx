'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStoryTimelines } from '@/lib/animations/useStoryTimelines';
import type { SceneManager } from '@/lib/three/SceneManager';
import { selectPhase, useGameStore } from '@/store/useGameStore';
import GameStartScreen from './hud/GameStartScreen';
import Hud from './hud/Hud';
import { HeroOverlays } from './hud/ScreenOverlays';

const SceneCanvas = dynamic(() => import('./SceneCanvas'), { ssr: false });

export default function Hero() {
  const phase = useGameStore(selectPhase);
  const heroRef = useRef<HTMLElement>(null);

  const [scene, setScene] = useState<SceneManager | null>(null);

  useStoryTimelines(phase, scene, heroRef);

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative isolate h-svh min-h-[560px] w-full cursor-crosshair overflow-hidden bg-charcoal"
      data-phase={phase}>

      <SceneCanvas onReady={setScene} />
      <HeroOverlays />
      <Hud />
      <GameStartScreen />

      <div className="overlay z-35 bg-[radial-gradient(circle,#fff6e0_20%,var(--c-amber))] opacity-0" data-anim="dive-flash" aria-hidden="true"/>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-16 bg-linear-to-b from-transparent to-charcoal" aria-hidden="true"/>
    </section>
  );
}
