import gsap from 'gsap';
import type { SceneManager } from '@/lib/three/SceneManager';

const LIFT_TIME = 0.45;
const DIVE_TIME = 1.6;
const DIVE_FOV = 85;
const FLASH_START = 1.5;

export function createDiveTimeline(
  scene: SceneManager | null,
  reduceMotion: boolean,
  onComplete: () => void,
): gsap.core.Timeline {
  const timeline = gsap.timeline({ onComplete });

  timeline.fromTo(
    '[data-hud="deploy"]',
    { scale: 0.94 },
    { scale: 1, duration: 0.35, ease: 'back.out(3)' },
    0,
  );

  if (scene && !reduceMotion) {
    timeline.to(scene.cameraOffset, { y: 0.8, duration: LIFT_TIME, ease: 'power2.out' }, 0);
    timeline.to(
      scene.cameraOffset,
      { z: -16, y: -1.5, duration: DIVE_TIME, ease: 'power3.in' },
      LIFT_TIME,
    );
    timeline.to(scene.lens, { fov: DIVE_FOV, duration: DIVE_TIME, ease: 'power2.in' }, LIFT_TIME);
    timeline.to(
      scene.effects,
      { zoomBlur: 0.3, aberration: 0.05, bloom: 1.8, duration: DIVE_TIME, ease: 'power2.in' },
      LIFT_TIME,
    );
  }

  timeline.to(
    '[data-anim="dive-flash"]',
    { opacity: 1, duration: reduceMotion ? 0.8 : 0.55, ease: 'power2.in' },
    reduceMotion ? 0.6 : FLASH_START,
  );

  return timeline;
}
