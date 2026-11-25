import gsap from 'gsap';
import type { SceneManager } from '@/lib/three/SceneManager';

const CAMERA_START = { x: 0, y: 4, z: 10 };
const CAMERA_TIME = 3.6;
const START_FOV = 60;

export function createIntroTimeline(
  scene: SceneManager | null,
  reduceMotion: boolean,
  onComplete: () => void,
): gsap.core.Timeline {
  const move = reduceMotion ? 0 : 1;

  const timeline = gsap.timeline({ onComplete });

  if (scene && !reduceMotion) {
    timeline.from(
      scene.cameraOffset,
      { ...CAMERA_START, duration: CAMERA_TIME, ease: 'power3.out' },
      0,
    );
    timeline.from(scene.lens, { fov: START_FOV, duration: CAMERA_TIME, ease: 'power2.out' }, 0);
    timeline.from(
      scene.effects,
      { bloom: 1.6, aberration: 0.025, duration: 2.4, ease: 'power2.out' },
      0,
    );
  }

  timeline.from(
    '[data-intro="title-kicker"]',
    { opacity: 0, x: -30 * move, duration: 0.5, ease: 'power2.out' },
    0.3,
  );
  timeline.fromTo(
    '[data-intro="title-main"]',
    { clipPath: 'inset(0% 100% 0% 0%)', opacity: reduceMotion ? 0 : 1 },
    { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.9, ease: 'power4.out' },
    0.45,
  );
  timeline.from(
    '[data-intro="title-sub"]',
    { opacity: 0, y: 12 * move, duration: 0.5, ease: 'power2.out' },
    0.9,
  );
  timeline.from('[data-intro="title-telemetry"]', { opacity: 0, duration: 0.6 }, 1.1);

  timeline.from(
    '[data-hud="compass"]',
    { opacity: 0, y: -30 * move, duration: 0.6, ease: 'power3.out' },
    1.2,
  );
  timeline.from(
    '[data-hud="minimap"]',
    { opacity: 0, x: 40 * move, duration: 0.6, ease: 'power3.out' },
    1.35,
  );
  timeline.from(
    '[data-hud="mute"], [data-hud="squad"]',
    { opacity: 0, x: -40 * move, duration: 0.6, ease: 'power3.out', stagger: 0.12 },
    1.35,
  );
  timeline.from(
    '[data-hud="health"], [data-hud="ammo"]',
    { opacity: 0, y: 30 * move, duration: 0.6, ease: 'power3.out', stagger: 0.1 },
    1.6,
  );

  timeline.from(
    '[data-hud="deploy"]',
    { opacity: 0, scale: reduceMotion ? 1 : 0.9, duration: 0.5, ease: 'back.out(2)' },
    2.1,
  );

  timeline.set({}, {}, CAMERA_TIME);

  return timeline;
}
