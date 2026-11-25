'use client';

import { Check, Star } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { findOperator, OPERATORS } from '@/data/operators';
import { audio } from '@/lib/audio/AudioManager';
import { useReveal } from '@/lib/animations/useReveal';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { selectOperatorId, useGameStore } from '@/store/useGameStore';
import { useProgressStore } from '@/store/useProgressStore';
import type { OperatorId } from '@/types';
import OperatorPortrait from './operators/OperatorPortrait';
import SectionHeading from './SectionHeading';

const TYPE_SPEED = 35;

function Pips({ label, value, color }: { label: string; value: number; color: string }) {
  const pips = [];
  for (let i = 1; i <= 5; i++) {
    pips.push(
      <span
        key={i}
        className="h-4 flex-1 -skew-x-12 transition-colors duration-300"
        style={{ background: i <= value ? color : 'var(--c-line)', transitionDelay: `${i * 40}ms` }}
      />,
    );
  }
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
      <span className="text-xs font-semibold tracking-[0.2em] text-text/60">{label}</span>
      <span className="flex gap-1.5">{pips}</span>
    </div>
  );
}

export default function Operators() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);
  const reduceMotion = usePrefersReducedMotion();

  const lockedId = useGameStore(selectOperatorId);
  const setOperator = useGameStore((state) => state.setOperator);

  const [viewedId, setViewedId] = useState<OperatorId>(lockedId);
  const operator = findOperator(viewedId);
  const index = OPERATORS.findIndex((item) => item.id === viewedId);
  const isLocked = viewedId === lockedId;

  const [typed, setTyped] = useState(operator.quote);
  useEffect(() => {
    if (reduceMotion) {
      setTyped(operator.quote);
      return;
    }
    let letters = 0;
    setTyped('');
    const timer = window.setInterval(() => {
      letters += 1;
      setTyped(operator.quote.slice(0, letters));
      if (letters >= operator.quote.length) window.clearInterval(timer);
    }, TYPE_SPEED);
    return () => window.clearInterval(timer);
  }, [operator.quote, reduceMotion]);

  function view(id: OperatorId) {
    if (id === viewedId) return;
    audio.play('ui-click');
    setViewedId(id);
    useProgressStore.getState().markOperatorViewed(id);
  }

  function lockIn() {
    audio.play('glitch');
    setOperator(operator.id, operator.callsign);
  }

  const posterStyle = { '--op': operator.color } as CSSProperties;

  return (
    <section id="operators" ref={sectionRef} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          number="04"
          kicker="Operators"
          title="Choose your"
          highlight="player"
          text="Five specialists, five very different ideas of a good plan. Lock one in and they take your spot in the HUD squad list."
        />

        <div
          className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12"
          data-reveal
        >
          <div
            className="operator-poster relative h-110 overflow-hidden rounded-3xl border border-line md:h-135"
            style={posterStyle}
          >
            <div className="operator-slab absolute inset-0" aria-hidden="true" />

            <span
              className="absolute top-4 left-6 font-mono text-[7rem] leading-none font-bold text-charcoal/80 md:text-[9rem]"
              aria-hidden="true"
            >
              0{index + 1}
            </span>

            <span
              className="operator-callsign pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2"
              aria-hidden="true"
            >
              {operator.callsign}
            </span>

            <div
              key={operator.id}
              className="operator-in absolute inset-x-0 bottom-0 mx-auto w-[78%] max-w-100"
            >
              <OperatorPortrait
                operator={operator}
                className="w-full drop-shadow-[0_20px_30px_rgb(0_0_0/0.5)]"
              />
            </div>

            <div className="speech-bubble absolute top-6 right-5 max-w-[60%] md:top-10 md:right-8">
              <p className="sr-only">
                {operator.callsign} says: {operator.quote}
              </p>
              <p
                className="text-base leading-snug font-bold tracking-normal normal-case md:text-lg"
                aria-hidden="true"
              >
                {typed}
                <span className="blink">|</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span
                className="rounded-full px-3 py-1 text-xs font-bold tracking-[0.2em] text-charcoal"
                style={{ background: operator.color }}
              >
                {operator.role}
              </span>
              {isLocked && (
                <span className="telemetry text-amber">You are playing as {operator.callsign}</span>
              )}
            </div>

            <h3 className="mt-3 text-5xl leading-none font-bold tracking-[0.06em] md:text-6xl">
              {operator.callsign}
            </h3>

            <div className="mt-6 rounded-2xl border border-line bg-text/4 p-5">
              <p className="hud-label">Ability</p>
              <p
                className="mt-1 text-2xl font-bold tracking-[0.06em]"
                style={{ color: operator.color }}
              >
                {operator.ability}
              </p>
              <p className="mt-2 text-base font-medium tracking-normal text-text/70 normal-case">
                {operator.abilityText}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Pips label="Speed" value={operator.speed} color={operator.color} />
              <Pips label="Armor" value={operator.armor} color={operator.color} />
              <Pips label="Utility" value={operator.utility} color={operator.color} />
            </div>

            <button
              type="button"
              onClick={lockIn}
              disabled={isLocked}
              className={`glitch-on-hover mt-8 rounded-xl py-4 text-lg font-bold tracking-[0.3em] transition-transform ${
                isLocked
                  ? 'cursor-default border border-line text-text/60'
                  : 'cursor-pointer text-charcoal active:scale-[0.97]'
              }`}
              style={isLocked ? undefined : { background: operator.color }}
            >
              <span className="glitch-text inline-block">
                {isLocked ? (
                  <span className="inline-flex items-center gap-2">
                    Locked in <Check className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : (
                  `Play as ${operator.callsign}`
                )}
              </span>
            </button>

            <p className="hud-label mt-8">Squad roster</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {OPERATORS.map((item) => {
                const isViewed = item.id === viewedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => view(item.id)}
                    aria-pressed={isViewed}
                    aria-label={`View ${item.callsign}, ${item.role}`}
                    className={`operator-token flex cursor-pointer flex-col items-center gap-1.5 ${isViewed ? 'is-viewed' : ''}`}
                    style={{ '--op': item.color } as CSSProperties}
                  >
                    <span className="operator-token-face block h-16 w-16 overflow-hidden rounded-full">
                      <OperatorPortrait operator={item} headOnly className="h-full w-full" />
                    </span>
                    <span className="text-[0.65rem] font-bold tracking-[0.15em] text-text/70">
                      {item.callsign}
                      {item.id === lockedId && (
                        <Star
                          className="ml-1 inline h-3 w-3 fill-amber align-[-1px] text-amber"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
