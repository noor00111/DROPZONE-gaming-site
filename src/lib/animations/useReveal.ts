'use client';

import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useReveal(scopeRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion || !scopeRef.current) return;

      const items = Array.from(scopeRef.current.querySelectorAll<HTMLElement>('[data-reveal]'));
      if (items.length === 0) return;

      gsap.set(items, { opacity: 0, y: 40 });

      ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (group) => {
          gsap.to(group, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 });
        },
      });
    },
    { scope: scopeRef },
  );
}
