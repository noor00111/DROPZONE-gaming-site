'use client';

import { selectQuality, useGameStore } from '@/store/useGameStore';

export function HeroOverlays() {
  return (
    <div aria-hidden="true">
      <div className="overlay overlay-vignette z-10" />
      <div className="overlay overlay-scanlines z-50" />
    </div>
  );
}

export function FilmGrain() {
  const quality = useGameStore(selectQuality);

  return (
    <div
      className="overlay overlay-fixed overlay-grain z-50"
      data-animated={quality === 'high'}
      aria-hidden="true"
    />
  );
}
