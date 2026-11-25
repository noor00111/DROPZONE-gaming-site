'use client';

import { useEffect } from 'react';

export default function HitMarkers() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Element && event.target.closest('input, textarea, select'))
        return;

      const marker = document.createElement('span');
      marker.className = 'hit-marker';
      marker.style.left = `${event.clientX}px`;
      marker.style.top = `${event.clientY}px`;
      document.body.appendChild(marker);

      const animation = marker.animate(
        reduceMotion
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [
              { opacity: 1, scale: '0.6', rotate: '0deg' },
              { opacity: 1, scale: '1.15', rotate: '0deg', offset: 0.25 },
              { opacity: 0, scale: '1', rotate: '0deg' },
            ],
        { duration: 380, easing: 'ease-out' },
      );
      animation.onfinish = () => marker.remove();
    }

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return null;
}
