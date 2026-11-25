'use client';

import { useRef, useState } from 'react';
import {Cloud, Flag, Hand, Leaf, Lock, Package, Paintbrush, PartyPopper, Sparkles, TriangleAlert, Waves, type LucideIcon} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { audio } from '@/lib/audio/AudioManager';
import { useReveal } from '@/lib/animations/useReveal';
import { useProgressStore } from '@/store/useProgressStore';
import SectionHeading from './SectionHeading';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const REWARDS: { name: string; kind: string; icon: LucideIcon; legendary?: boolean }[] = [
  { name: 'Rookie banner', kind: 'Banner', icon: Flag },
  { name: 'Amber smoke', kind: 'Crate smoke', icon: Cloud },
  { name: 'Salute', kind: 'Emote', icon: Hand },
  { name: 'Hazard stripes', kind: 'Parachute', icon: TriangleAlert },
  { name: 'Bramble', kind: 'Operator', icon: Leaf },
  { name: 'Tiger wrap', kind: 'Weapon skin', icon: Paintbrush },
  { name: 'Chicken dance', kind: 'Emote', icon: PartyPopper },
  { name: 'Golden crate', kind: 'Crate skin', icon: Package },
  { name: 'Lake lander', kind: 'Title', icon: Waves },
  { name: 'Aurora', kind: 'Legendary chute', icon: Sparkles, legendary: true },
];

const NOTES = [
  {
    patch: 'Patch 1.0.3',
    topic: 'Wildlife',
    lines: [
      'Chickens at Sunny Farms are now 12% more judgemental.',
      'Fixed a bug where the lake was slightly too wet.',
      'Bramble can no longer be watered by teammates.',
    ],
  },
  {
    patch: 'Patch 1.0.2',
    topic: 'Drops',
    lines: [
      'Fixed players landing ON the plane. You know who you are.',
      'Crates now fall at a polite speed.',
      'Hot drop no longer picks the ocean.',
    ],
  },
  {
    patch: 'Patch 1.0.1',
    topic: 'Weapons',
    lines: [
      "Skylight Flare damage reduced from 'some' to 'emotional'.",
      'Shotgun shells are red again. They were always red.',
      'Longshot is now 4% longer. For reasons.',
    ],
  },
];

export default function Season() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  const [unlocked, setUnlocked] = useState(0);
  const lastUnlocked = useRef(0);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        setUnlocked(REWARDS.length);
        useProgressStore.getState().markSeasonComplete();
        gsap.set('[data-pass-fill]', { scaleX: 1 });
        return;
      }

      gsap.fromTo(
        '[data-pass-fill]',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-pass]',
            start: 'top 80%',
            end: 'bottom 30%',
            scrub: 0.5,
            onUpdate: (self) => {
              const count = Math.round(self.progress * REWARDS.length);
              if (count > lastUnlocked.current) audio.play('ui-hover');
              lastUnlocked.current = count;
              setUnlocked(count);
              if (count === REWARDS.length) useProgressStore.getState().markSeasonComplete();
            },
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section id="season" ref={sectionRef} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          number="05"
          kicker="Season 01 · Sky high"
          title="The free"
          highlight="pass"
          text="Play, rank up, unlock things. Scroll down the track to see how far the free pass goes. No wallet required."
        />

        <div className="mt-12" data-pass>
          <div className="flex items-center justify-between">
            <p className="hud-label">Tier progress</p>
            <p className="font-mono text-sm">
              <span className="text-amber">{unlocked}</span>
              <span className="text-text/60"> / {REWARDS.length}</span>
            </p>
          </div>

          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-line">
            <div
              data-pass-fill
              className="absolute inset-0 origin-left scale-x-0 rounded-full bg-amber shadow-[0_0_14px_var(--c-amber-glow)]"
            />
          </div>

          <ol
            tabIndex={0}
            aria-label="Season 01 free rewards (scrolls sideways)"
            className="pass-row -mx-4 mt-6 flex gap-3 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-10 lg:overflow-visible lg:px-0"
          >
            {REWARDS.map((reward, index) => {
              const isUnlocked = index < unlocked;
              return (
                <li
                  key={reward.name}
                  className={`pass-tier relative flex w-32 shrink-0 flex-col items-center rounded-2xl border p-3 text-center lg:w-auto ${
                    isUnlocked ? 'is-unlocked' : ''
                  } ${reward.legendary ? 'is-legendary' : ''}`}
                >
                  <span className="font-mono text-[0.6rem] text-text/60">Tier {index + 1}</span>
                  <span className="pass-icon mt-2">
                    {isUnlocked ? (
                      <reward.icon className="h-9 w-9" strokeWidth={1.75} aria-hidden="true" />
                    ) : (
                      <Lock className="h-9 w-9" strokeWidth={1.75} aria-hidden="true" />
                    )}
                  </span>
                  <span className="mt-2 text-xs leading-tight font-bold tracking-[0.08em]">
                    {reward.name}
                  </span>
                  <span className="mt-1 text-[0.55rem] font-semibold tracking-[0.15em] text-text/60">
                    {reward.kind}
                  </span>
                  <span className="sr-only">{isUnlocked ? 'Unlocked' : 'Locked'}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-20">
          <p className="hud-label" data-reveal>
            Field notes
          </p>
          <div className="mt-6 grid gap-8 md:grid-cols-3 md:gap-6">
            {NOTES.map((note, index) => (
              <article
                key={note.patch}
                className="paper-note"
                style={{ rotate: `${[-2, 1.5, -1][index]}deg` }}
                data-reveal
              >
                <span className="paper-tape" aria-hidden="true" />
                <p className="font-mono text-xs tracking-[0.15em] text-charcoal/60">{note.patch}</p>
                <h3 className="mt-1 text-2xl font-bold tracking-[0.08em] text-charcoal">
                  {note.topic}
                </h3>
                <ul className="mt-4 space-y-3">
                  {note.lines.map((line) => (
                    <li
                      key={line}
                      className="flex gap-2 text-base leading-snug font-medium tracking-normal text-charcoal/80 normal-case"
                    >
                      <span className="text-[#b45309]">—</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
