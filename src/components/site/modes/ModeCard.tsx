'use client';

import { Check, Sparkle } from 'lucide-react';
import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { audio } from '@/lib/audio/AudioManager';
import { selectSelectedMode, useGameStore } from '@/store/useGameStore';
import { useProgressStore } from '@/store/useProgressStore';
import ModeArt from './ModeArt';
import type { GameMode } from './modeData';

const MAX_TILT = 14;

function ChaosPips({ amount, color }: { amount: number; color: string }) {
  const pips = [];
  for (let i = 1; i <= 5; i++) {
    pips.push(
      <span
        key={i}
        className="h-2.5 w-2 -skew-x-12"
        style={{ background: i <= amount ? color : 'var(--c-line)' }}
      />,
    );
  }
  return <span className="flex gap-0.5">{pips}</span>;
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-md bg-text/6 px-2 py-1.5">
      <dt className="text-[0.55rem] font-semibold tracking-[0.18em] text-text/60">{label}</dt>
      <dd className="mt-0.5 font-mono text-base leading-none">{children}</dd>
    </div>
  );
}

type ModeCardProps = {
  mode: GameMode;
  index: number;
  total: number;
};

export default function ModeCard({ mode, index, total }: ModeCardProps) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const selectedMode = useGameStore(selectSelectedMode);
  const setSelectedMode = useGameStore((state) => state.setSelectedMode);
  const isLocked = selectedMode === mode.id;
  const isLegendary = mode.rarity === 'Legendary';

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return;
    const card = tiltRef.current;
    if (!card) return;

    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;

    card.dataset.tilting = 'true';
    card.style.setProperty('--ry', `${(x - 0.5) * MAX_TILT * 2}deg`);
    card.style.setProperty('--rx', `${(0.5 - y) * MAX_TILT * 2}deg`);
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
  }

  function handlePointerLeave() {
    const card = tiltRef.current;
    if (!card) return;
    card.dataset.tilting = 'false';
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  }

  function flip() {
    audio.play('ui-click');
    if (!isFlipped) useProgressStore.getState().markCardFlipped(mode.id);
    setIsFlipped(!isFlipped);
  }

  function lockIn() {
    audio.play('glitch');
    setSelectedMode(mode.id);
    setIsFlipped(false);
  }

  const cardStyle = {
    '--rarity': mode.color,
    '--frame': mode.frame,
  } as CSSProperties;

  const serial = `DZ-${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;

  return (
    <div
      ref={tiltRef}
      className={`card-tilt ${isLocked ? 'is-locked' : ''}`}
      style={cardStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="card-flip" data-flipped={isFlipped}>
        <div className="card-face" inert={isFlipped}>
          <div className={`card-frame ${isLegendary ? 'holo-frame' : ''}`}>
            <div className="relative flex h-full flex-col rounded-[12px] bg-charcoal p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl leading-none font-bold tracking-[0.08em]">{mode.name}</h3>
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-[0.6rem] text-text/60">#{index + 1}</span>
                  <span className="h-3 w-3 rotate-45" style={{ background: mode.frame }} />
                </span>
              </div>

              <div
                className="relative mt-2 h-36 overflow-hidden rounded-lg"
                style={{ background: mode.sky }}>
                <ModeArt mode={mode} />
                {mode.tag && (
                  <span
                    className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[0.55rem] font-bold tracking-[0.15em] text-charcoal"
                    style={{ background: mode.color }}>
                    {mode.tag}
                  </span>
                )}
              </div>

              <p
                className="-mx-3 mt-2 px-3 py-1 text-[0.7rem] font-bold tracking-[0.14em] text-charcoal"
                style={{ background: mode.color }}>
                {mode.tagline}
              </p>

              <dl className="mt-2 grid grid-cols-2 gap-1.5">
                <Stat label="Players">{mode.players}</Stat>
                <Stat label="Squad">{mode.squadSize}</Stat>
                <Stat label="Match">{mode.matchTime}</Stat>
                <Stat label="Chaos">
                  <ChaosPips amount={mode.chaos} color={mode.color} />
                </Stat>
              </dl>

              <div className="mt-auto flex items-center justify-between pt-2 font-mono text-[0.6rem] tracking-[0.12em]">
                <span style={{ color: mode.color }}>{mode.rarity}</span>
                <span className="text-text/60">{serial}</span>
              </div>
            </div>
          </div>

          <div className="card-shine" />
          {isLegendary && <div className="card-holo" />}

          <button
            type="button"
            onClick={flip}
            className="absolute inset-0 cursor-pointer rounded-[18px]"
            aria-label={`${mode.name} card${isLocked ? ', locked in' : ''}. Flip to see perks`}
          />
        </div>

        <div className="card-face card-back" inert={!isFlipped}>
          <div className={`card-frame ${isLegendary ? 'holo-frame' : ''}`}>
            <div className="card-back-pattern relative flex h-full flex-col rounded-[12px] bg-charcoal p-4">
              <p
                className="font-mono text-[0.6rem] tracking-[0.15em]"
                style={{ color: mode.color }}>
                {mode.rarity} · {serial}
              </p>
              <h3 className="mt-1 text-2xl font-bold tracking-[0.08em]">{mode.name}</h3>
              <p className="mt-2 text-sm leading-snug font-medium tracking-normal text-text/70 normal-case">
                {mode.description}
              </p>

              <p className="hud-label mt-4">Perks</p>
              <ul className="mt-2 space-y-1.5">
                {mode.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex gap-2 text-sm leading-snug font-medium tracking-normal normal-case">
                    <Sparkle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      style={{ color: mode.color }}
                      aria-hidden="true"
                    />
                    {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-2">
                <button
                  type="button"
                  onClick={lockIn}
                  className="cursor-pointer rounded-md py-2.5 text-sm font-bold tracking-[0.25em] text-charcoal transition-transform hover:scale-[1.03] active:scale-95"
                  style={{ background: mode.color }}>
                  {isLocked ? (
                    <span className="inline-flex items-center gap-2">
                      Locked in <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                  ) : (
                    'Lock in'
                  )}
                </button>
                <button
                  type="button"
                  onClick={flip}
                  className="cursor-pointer rounded-md border border-line py-2 text-xs font-semibold tracking-[0.25em] text-text/70 hover:text-text">
                  Flip back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
