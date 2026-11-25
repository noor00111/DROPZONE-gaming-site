import gsap from 'gsap';
import type { SceneManager } from '@/lib/three/SceneManager';

export function createGameStartTimeline(
  scene: SceneManager | null,
  reduceMotion: boolean,
): gsap.core.Timeline {
  const timeline = gsap.timeline();

  timeline.fromTo(
    '[data-anim="dive-flash"]',
    { opacity: 1 },
    { opacity: 0, duration: 1, ease: 'power2.out' },
    0,
  );

  if (scene && !reduceMotion) {
    timeline.from(scene.cameraOffset, { y: 2, z: 5, duration: 2.2, ease: 'power3.out' }, 0);
    timeline.from(scene.lens, { fov: 60, duration: 2.2, ease: 'power3.out' }, 0);
    timeline.from(
      scene.effects,
      { zoomBlur: 0.15, aberration: 0.03, bloom: 1.2, duration: 1.6, ease: 'power2.out' },
      0,
    );
  }

  const move = reduceMotion ? 0 : 1;
  timeline.from(
    '[data-anim="game-start-kicker"]',
    { opacity: 0, y: -12 * move, duration: 0.5, ease: 'power2.out' },
    0.3,
  );
  timeline.fromTo(
    '[data-anim="game-start-title"]',
    {
      opacity: 0,
      letterSpacing: reduceMotion ? '0.12em' : '0.6em',
      scale: reduceMotion ? 1 : 1.15,
    },
    { opacity: 1, letterSpacing: '0.12em', scale: 1, duration: 0.9, ease: 'power4.out' },
    0.35,
  );
  timeline.from(
    '[data-anim="game-start-bar"]',
    { scaleX: 0, duration: 0.6, ease: 'power3.inOut' },
    0.8,
  );
  timeline.from(
    '[data-anim="game-start-replay"]',
    { opacity: 0, y: 10 * move, duration: 0.5, ease: 'power2.out' },
    1.2,
  );

  return timeline;
}

export function createReadyLoop(reduceMotion: boolean): gsap.core.Tween | null {
  if (reduceMotion) return null;

  return gsap.fromTo(
    '[data-hud="deploy"]',
    { boxShadow: '0 0 0px 0px rgb(255 176 0 / 0)' },
    {
      boxShadow: '0 0 28px 2px rgb(255 176 0 / 0.45)',
      duration: 1.1,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    },
  );
}
