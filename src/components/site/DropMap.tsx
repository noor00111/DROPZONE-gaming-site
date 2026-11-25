'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Dices } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { findZone, ZONES, type Zone } from '@/data/zones';
import { audio } from '@/lib/audio/AudioManager';
import { useReveal } from '@/lib/animations/useReveal';
import { selectDropZone, useGameStore } from '@/store/useGameStore';
import { useProgressStore } from '@/store/useProgressStore';
import type { ZoneId } from '@/types';
import IslandMap from './map/IslandMap';
import SectionHeading from './SectionHeading';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SPIN_TICKS = 16;
const SPIN_START_DELAY = 60;
const SPIN_SLOWDOWN = 1.17;

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  const bars = [];
  for (let i = 1; i <= 5; i++) {
    bars.push(
      <span
        key={i}
        className="h-3 flex-1 -skew-x-12 transition-colors duration-300"
        style={{ background: i <= value ? color : 'var(--c-line)', transitionDelay: `${i * 40}ms` }}
      />,
    );
  }
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold tracking-[0.2em] text-text/60">
        <span>{label}</span>
        <span className="font-mono">{value}/5</span>
      </div>
      <div className="mt-1.5 flex gap-1">{bars}</div>
    </div>
  );
}

export default function DropMap() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  const selectedId = useGameStore(selectDropZone);
  const setDropZone = useGameStore((state) => state.setDropZone);

  const [hoveredId, setHoveredId] = useState<ZoneId | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [dropKey, setDropKey] = useState(0);
  const spinTimers = useRef<number[]>([]);

  const shownZone = findZone(hoveredId ?? selectedId);
  const isPicked = shownZone.id === selectedId;

  useEffect(() => {
    return () => {
      for (const timer of spinTimers.current) window.clearTimeout(timer);
    };
  }, []);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('[data-flight-line]', { strokeDashoffset: 0 });
        return;
      }
      gsap.to('[data-flight-line]', {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-island]',
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 0.6,
        },
      });
    },
    { scope: sectionRef },
  );

  function dropOn(zone: Zone) {
    if (isSpinning) return;
    audio.play('ui-click');
    setDropZone(zone.id);
    setDropKey((key) => key + 1);
  }

  function hotDrop() {
    if (isSpinning) return;
    setIsSpinning(true);
    audio.play('ui-click');
    spinTimers.current = [];

    let delay = SPIN_START_DELAY;
    let time = 0;
    let lastIndex = -1;

    for (let tick = 0; tick < SPIN_TICKS; tick++) {
      let index = Math.floor(Math.random() * ZONES.length);
      if (index === lastIndex) index = (index + 1) % ZONES.length;
      lastIndex = index;

      const zone = ZONES[index];
      const isLastTick = tick === SPIN_TICKS - 1;
      time += delay;
      delay *= SPIN_SLOWDOWN;

      const timer = window.setTimeout(() => {
        if (isLastTick) {
          setHoveredId(null);
          setIsSpinning(false);
          setDropZone(zone.id);
          setDropKey((key) => key + 1);
          audio.play('glitch');
          useProgressStore.getState().recordHotDrop();
        } else {
          setHoveredId(zone.id);
          audio.play('ui-hover');
        }
      }, time);
      spinTimers.current.push(timer);
    }
  }

  return (
    <section id="map" ref={sectionRef} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          number="02"
          kicker="Drop map"
          title="Pick your"
          highlight="landing"
          text="Six spots on one very busy island. Hover to scout, click to drop. Your pick shows up on the HUD minimap."
        />

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12">
          <div
            className="relative aspect-square overflow-hidden rounded-3xl border border-line shadow-[0_30px_60px_rgb(0_0_0/0.5)]"
            data-reveal
          >
            <IslandMap
              activeId={hoveredId}
              selectedId={selectedId}
              dropKey={dropKey}
              onHover={(id) => {
                if (!isSpinning) setHoveredId(id);
              }}
              onSelect={dropOn}
            />
            <p className="telemetry pointer-events-none absolute top-4 left-4">
              Sector 7 · Island map
            </p>
            {isSpinning && (
              <p className="danger-pulse pointer-events-none absolute top-4 right-4 rounded-full bg-amber px-3 py-1 text-xs font-bold tracking-[0.2em] text-charcoal">
                Rolling…
              </p>
            )}
          </div>

          <div className="flex flex-col gap-5" data-reveal>
            <div className="relative overflow-hidden rounded-2xl border border-line bg-text/4 p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs tracking-[0.15em] text-text/60">
                  Grid {shownZone.grid}
                </span>
                {shownZone.danger >= 4 && (
                  <span className="rounded-full bg-[#b91c1c] px-2.5 py-0.5 text-[0.65rem] font-bold tracking-[0.2em] text-text">
                    Hot zone
                  </span>
                )}
              </div>

              <h3 className="mt-2 text-3xl leading-none font-bold tracking-[0.06em] md:text-4xl">
                {shownZone.name}
              </h3>
              <p className="mt-3 text-lg font-medium tracking-normal text-amber normal-case">
                “{shownZone.tagline}”
              </p>

              <div className="mt-6 space-y-4">
                <Meter label="Loot" value={shownZone.loot} color="var(--c-amber)" />
                <Meter label="Danger" value={shownZone.danger} color="var(--c-danger)" />
              </div>

              <p className="telemetry mt-5">
                Best for: <span className="text-text">{shownZone.bestFor}</span>
              </p>

              <button
                type="button"
                onClick={() => dropOn(shownZone)}
                disabled={isPicked || isSpinning}
                className={`mt-6 w-full rounded-lg py-3 text-sm font-bold tracking-[0.3em] transition-colors ${
                  isPicked
                    ? 'cursor-default border border-amber/50 text-amber'
                    : 'cursor-pointer bg-amber text-charcoal hover:bg-text'
                }`}
              >
                {isPicked ? (
                  <span className="inline-flex items-center gap-2">
                    Drop spot set <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : (
                  `Drop at ${shownZone.name}`
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={hotDrop}
              disabled={isSpinning}
              className="glitch-on-hover group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-amber/60 px-6 py-4 text-left transition-colors hover:border-amber hover:bg-amber/10 disabled:cursor-wait"
            >
              <span>
                <span className="block text-xs font-semibold tracking-[0.2em] text-text/60">
                  Can&apos;t decide?
                </span>
                <span className="glitch-text mt-0.5 block text-2xl font-bold tracking-[0.12em] text-amber">
                  Hot drop!
                </span>
              </span>
              <Dices
                className="h-10 w-10 text-amber transition-transform duration-500 group-hover:rotate-180"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
