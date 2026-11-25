'use client';

import { useEffect, useRef } from 'react';
import { selectHealth, useGameStore } from '@/store/useGameStore';

const FLASH_TIME = 450;
const LOW_HEALTH = 30;

export default function DamageFlash() {
  
  const flashRef = useRef<HTMLDivElement>(null);
  const health = useGameStore(selectHealth);

  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state, previousState) => {
      if (state.health >= previousState.health) return;

      const flash = flashRef.current;
      if (!flash) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const startOpacity = reduceMotion ? 0.3 : 0.7;

      flash.animate([{ opacity: startOpacity }, { opacity: 0 }], {
        duration: FLASH_TIME,
        easing: 'ease-out',
      });
    });

    return unsubscribe;
  }, []);

  return (
    <div aria-hidden="true">
      <div ref={flashRef} className="overlay overlay-fixed overlay-damage z-45" />
      <div
        className="overlay overlay-fixed overlay-low-health z-45"
        style={{ opacity: health <= LOW_HEALTH ? 1 : 0 }}
      />
    </div>
  );
}
