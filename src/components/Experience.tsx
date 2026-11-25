'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { selectHasDeployed, selectPhase, useGameStore } from '@/store/useGameStore';
import AudioController from './AudioController';
import Hero from './Hero';
import DamageFlash from './hud/DamageFlash';
import LoadingScreen from './hud/LoadingScreen';
import { FilmGrain } from './hud/ScreenOverlays';
import Footer from './site/Footer';
import AchievementToasts from './fun/AchievementToasts';
import HitMarkers from './fun/HitMarkers';
import KillFeed from './fun/KillFeed';
import ProgressTracker from './fun/ProgressTracker';
import SecretDrop from './fun/SecretDrop';
import Arsenal from './site/Arsenal';
import Debrief from './site/Debrief';
import DropChallenge from './site/DropChallenge';
import DropMap from './site/DropMap';
import GameModes from './site/GameModes';
import Navbar from './site/Navbar';
import Operators from './site/Operators';
import Season from './site/Season';

gsap.registerPlugin(ScrollToPlugin);

const SHOW_GAME_START_FOR = 1600;
const LAND_SCROLL_TIME = 1.8;

export default function Experience() {
  const phase = useGameStore(selectPhase);
  const hasDeployed = useGameStore(selectHasDeployed);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (hasDeployed) return;

    let tween: gsap.core.Tween | null = null;
    if (window.scrollY > 0) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.documentElement.style.scrollBehavior = 'auto';
      const duration = reduceMotion ? 0 : Math.min(1.6, 0.6 + window.scrollY / 4000);
      tween = gsap.to(window, { scrollTo: 0, duration, ease: 'power2.inOut' });
    }

    document.documentElement.style.overflow = 'hidden';
    return () => {
      tween?.kill();
      document.documentElement.style.overflow = '';
      document.documentElement.style.scrollBehavior = '';
    };
  }, [hasDeployed]);

  useEffect(() => {
    if (phase !== 'game-start') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const modes = document.getElementById('modes');
    if (!modes) return;

    let tween: gsap.core.Tween | null = null;
    const timer = window.setTimeout(() => {
      if (reduceMotion) {
        modes.scrollIntoView({ behavior: 'auto' });
        return;
      }
      document.documentElement.style.scrollBehavior = 'auto';
      tween = gsap.to(window, {
        scrollTo: { y: modes, autoKill: true },
        duration: LAND_SCROLL_TIME,
        ease: 'power2.inOut',
        onComplete: () => {
          document.documentElement.style.scrollBehavior = '';
        },
        onInterrupt: () => {
          document.documentElement.style.scrollBehavior = '';
        },
      });
    }, SHOW_GAME_START_FOR);

    return () => {
      window.clearTimeout(timer);
      tween?.kill();
      document.documentElement.style.scrollBehavior = '';
    };
  }, [phase]);

  return (
    <>
      <AudioController />
      <ProgressTracker />
      <HitMarkers />
      <Navbar />

      <main>
        <h1 className="sr-only">Dropzone: a fan-made battle royale game website</h1>
        <Hero />
        <div inert={!hasDeployed}>
          <GameModes />
          <DropMap />
          <Arsenal />
          <Operators />
          <Season />
          <DropChallenge />
          <Debrief />
        </div>
      </main>

      <div inert={!hasDeployed}>
        <Footer />
      </div>

      <LoadingScreen />
      <DamageFlash />
      <FilmGrain />

      <KillFeed />
      <AchievementToasts />
      <SecretDrop />
    </>
  );
}
