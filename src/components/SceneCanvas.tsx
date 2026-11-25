'use client';

import { useEffect, useRef } from 'react';
import { SceneManager } from '@/lib/three/SceneManager';
import { useGameStore } from '@/store/useGameStore';
import type { QualityTier } from '@/types';

type SceneCanvasProps = {
  onReady?: (scene: SceneManager | null) => void;
};

function detectQuality(): QualityTier {
  const isTouchScreen = window.matchMedia('(pointer: coarse)').matches;
  const isSmallScreen = window.innerWidth < 768;
  const cpuCores = navigator.hardwareConcurrency || 8;
  if (isTouchScreen || isSmallScreen || cpuCores <= 4) {
    return 'low';
  }
  return 'high';
}

export default function SceneCanvas({ onReady }: SceneCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const quality = detectQuality();
    useGameStore.getState().setQuality(quality);

    const scene = new SceneManager(container, { quality });
    scene.init();
    onReadyRef.current?.(scene);

    const observer = new IntersectionObserver((entries) => {
      const isOnScreen = entries[0].isIntersecting;
      scene.setRunning(isOnScreen);
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      onReadyRef.current?.(null);
      scene.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />;
}
