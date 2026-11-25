'use client';

import { ArrowUp } from 'lucide-react';
import { useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { audio } from '@/lib/audio/AudioManager';
import { useReveal } from '@/lib/animations/useReveal';
import { selectSelectedMode, useGameStore } from '@/store/useGameStore';
import FlyBy from './FlyBy';
import ModeCard from './modes/ModeCard';
import { MODES } from './modes/modeData';
import SectionHeading from './SectionHeading';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FAN_ROTATE = [-10, -3.5, 3.5, 10];
const FAN_DROP = [26, 4, 4, 26];

const HINTS = [
  { mouse: 'Hover to inspect', touch: 'Swipe the deck' },
  { mouse: 'Click to flip', touch: 'Tap to flip' },
  { mouse: 'Lock one in', touch: 'Lock one in' },
];

export default function GameModes() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;

      gsap.from('[data-deal]', {
        scrollTrigger: { trigger: '[data-hand]', start: 'top 80%', once: true },
        y: 280,
        rotation: (i: number) => (i - 1.5) * -16,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(1.3)',
        stagger: 0.12,
      });
    },
    { scope: sectionRef },
  );

  const selectedMode = useGameStore(selectSelectedMode);
  const selectedName = MODES.find((mode) => mode.id === selectedMode)?.name ?? '';

  return (
    <section id="modes" ref={sectionRef} className="relative pb-24 md:pb-32">
      <FlyBy />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            number="01"
            kicker="Game modes"
            title="Choose your"
            highlight="drop"
            text="Four modes, four cards. Pick one up, flip it over, and lock it in. It rides along on your DEPLOY button."
          />

          <ul className="flex flex-wrap gap-2" data-reveal>
            {HINTS.map((hint, index) => (
              <li
                key={hint.mouse}
                className="flex items-center gap-2 rounded-full border border-line bg-text/4 px-3 py-1.5 text-xs font-semibold tracking-[0.15em] text-text/70"
              >
                <span className="font-mono text-amber">{index + 1}</span>
                <span className="mouse-only">{hint.mouse}</span>
                <span className="touch-only">{hint.touch}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="card-hand -mx-4 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pt-10 pb-12 lg:mx-0 lg:justify-center lg:gap-0 lg:overflow-visible lg:px-0 lg:pt-16"
          data-hand
        >
          {MODES.map((mode, index) => (
            <div
              key={mode.id}
              className="fan-slot shrink-0 snap-center"
              style={
                {
                  '--fan-rotate': `${FAN_ROTATE[index]}deg`,
                  '--fan-drop': `${FAN_DROP[index]}px`,
                } as CSSProperties
              }
              data-deal
            >
              <ModeCard mode={mode} index={index} total={MODES.length} />
            </div>
          ))}
        </div>

        <div
          className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-center"
          data-reveal
        >
          <p className="telemetry text-sm">
            Your pick: <span className="text-amber">{selectedName}</span>
          </p>
          <a
            href="#top"
            onClick={() => audio.play('ui-click')}
            className="glitch-on-hover rounded-full border border-amber px-5 py-2 text-sm font-bold tracking-[0.3em] text-amber transition-colors hover:bg-amber hover:text-charcoal"
          >
            <span className="glitch-text inline-flex items-center gap-2">
              Deploy with it <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
