'use client';

import { RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ACHIEVEMENTS } from '@/data/achievements';
import { findOperator } from '@/data/operators';
import { findWeapon } from '@/data/weapons';
import { findZone } from '@/data/zones';
import { audio } from '@/lib/audio/AudioManager';
import { useReveal } from '@/lib/animations/useReveal';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import {selectDropZone, selectOperatorId, selectSelectedMode, selectWeaponId, useGameStore} from '@/store/useGameStore';
import { levelFromXp, SECTION_IDS, XP_PER_LEVEL, useProgressStore } from '@/store/useProgressStore';
import { AchievementBadge } from '../fun/AchievementToasts';
import OperatorPortrait from './operators/OperatorPortrait';
import SectionHeading from './SectionHeading';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const TOTAL_PLAYERS = 64;
const MVP_ACHIEVEMENTS = 6;
const RANK_TITLES = ['Fresh recruit', 'Lake lander', 'Crate hunter', 'Hot dropper', 'Sky legend'];
const MODE_NAMES: Record<string, string> = {
  solo: 'Solo',
  duo: 'Duo',
  squad: 'Squad',
  night: 'Night ops',
};

function CountUp({ value, started }: { value: number; started: boolean }) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const finished = useRef(false);

  useEffect(() => {
    const element = numberRef.current;
    if (!element) return;
    if (!started) {
      element.textContent = '0';
      return;
    }
    if (finished.current) {
      element.textContent = String(value);
      return;
    }

    const counter = { number: 0 };
    const tween = gsap.to(counter, {
      number: value,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = String(Math.round(counter.number));
      },
      onComplete: () => {
        finished.current = true;
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, started]);

  return <span ref={numberRef}>0</span>;
}

function StatBox({
  label,
  value,
  suffix,
  started,
}: {
  label: string;
  value: number;
  suffix?: string;
  started: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-text/4 p-4">
      <p className="text-[0.6rem] font-bold tracking-[0.2em] text-text/60">{label}</p>
      <p className="mt-1 font-mono text-3xl leading-none tabular-nums">
        <CountUp value={value} started={started} />
        {suffix && <span className="text-base text-text/60">{suffix}</span>}
      </p>
    </div>
  );
}

export default function Debrief() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);
  const reduceMotion = usePrefersReducedMotion();

  const operator = findOperator(useGameStore(selectOperatorId));
  const zone = findZone(useGameStore(selectDropZone));
  const weapon = findWeapon(useGameStore(selectWeaponId));
  const mode = MODE_NAMES[useGameStore(selectSelectedMode)];

  const xp = useProgressStore((state) => state.xp);
  const achievements = useProgressStore((state) => state.achievements);
  const shots = useProgressStore((state) => state.shots);
  const hits = useProgressStore((state) => state.hits);
  const sections = useProgressStore((state) => state.sectionsVisited.length);
  const challengeBest = useProgressStore((state) => state.challengeBest);

  const level = levelFromXp(xp);
  const levelProgress = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  const rankTitle = RANK_TITLES[Math.min(level, RANK_TITLES.length) - 1];
  const placement = Math.max(1, TOTAL_PLAYERS - Math.floor(xp / 40));
  const isMvp = achievements.length >= MVP_ACHIEVEMENTS;

  const [started, setStarted] = useState(false);
  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: '[data-debrief-stats]',
        start: 'top 85%',
        once: true,
        onEnter: () => setStarted(true),
      });
    },
    { scope: sectionRef },
  );

  const [copyLabel, setCopyLabel] = useState('Copy results');

  function playAgain() {
    audio.play('ui-click');
    const game = useGameStore.getState();
    if (game.phase === 'game-start') {
      game.resetRun();
      game.setPhase('intro');
    } else {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  function copyResults() {
    audio.play('ui-click');
    const summary =
      `DROPZONE debrief: #${placement} of ${TOTAL_PLAYERS} · Level ${level} ${rankTitle} · ${xp} XP · ` +
      `${achievements.length}/${ACHIEVEMENTS.length} achievements · played as ${operator.callsign}`;
    navigator.clipboard
      .writeText(summary)
      .then(() => setCopyLabel('Copied!'))
      .catch(() => setCopyLabel('Copy failed'))
      .finally(() => {
        window.setTimeout(() => setCopyLabel('Copy results'), 2000);
      });
  }

  return (
    <section id="debrief" ref={sectionRef} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          number="07"
          kicker="Debrief"
          title="Match"
          highlight="results"
          text="Everything you did on this page, scored like a real match. Go back up, explore more, and watch these numbers climb."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div
            className="relative overflow-hidden rounded-3xl border border-line bg-text/3 p-6 md:p-8"
            data-reveal>
            <p className="hud-label">Placement</p>
            <p className="mt-1 flex items-baseline gap-2 leading-none">
              <span className="chrome-text text-8xl font-bold">#{placement}</span>
              <span className="font-mono text-lg text-text/60">/ {TOTAL_PLAYERS}</span>
            </p>
            <p className="mt-3 text-2xl font-bold tracking-[0.1em] text-amber">{rankTitle}</p>

            <div className="mt-5">
              <div className="flex justify-between font-mono text-xs text-text/60">
                <span>Level {level}</span>
                <span>
                  {xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-amber transition-[width] duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>

            {isMvp ? (
              <span className="mvp-stamp absolute top-6 right-6 border-[3px] border-amber px-3 py-1 text-3xl font-bold tracking-[0.2em] text-amber">
                MVP
              </span>
            ) : (
              <p className="telemetry mt-3">
                Unlock {MVP_ACHIEVEMENTS - achievements.length} more achievements for MVP
              </p>
            )}

            <div className="mt-7 border-t border-line pt-5">
              <p className="hud-label">Your loadout</p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="block h-12 w-12 shrink-0 overflow-hidden rounded-full"
                  style={{ background: operator.color } as CSSProperties}>
                  <OperatorPortrait operator={operator} headOnly className="h-full w-full" />
                </span>
                <div>
                  <p className="text-xl leading-none font-bold tracking-[0.08em]">
                    {operator.callsign}
                  </p>
                  <p className="telemetry mt-1">{operator.role}</p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <dt className="text-[0.6rem] font-bold tracking-[0.2em] text-text/60">Mode</dt>
                  <dd className="text-sm font-bold tracking-[0.06em]">{mode}</dd>
                </div>
                <div>
                  <dt className="text-[0.6rem] font-bold tracking-[0.2em] text-text/60">Drop</dt>
                  <dd className="text-sm font-bold tracking-[0.06em]">{zone.name}</dd>
                </div>
                <div>
                  <dt className="text-[0.6rem] font-bold tracking-[0.2em] text-text/60">Weapon</dt>
                  <dd className="text-sm font-bold tracking-[0.06em]">{weapon.name}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={playAgain}
                className="glitch-on-hover cursor-pointer rounded-xl bg-amber py-3 text-sm font-bold tracking-[0.25em] text-charcoal transition-colors hover:bg-text">
                <span className="glitch-text inline-flex items-center gap-2">
                  Play again <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
              <button
                type="button"
                onClick={copyResults}
                className="cursor-pointer rounded-xl border border-line py-3 text-sm font-bold tracking-[0.2em] text-text/80 transition-colors hover:border-amber hover:text-amber"
                aria-live="polite">
                {copyLabel}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-8" data-reveal>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-debrief-stats>
              <StatBox label="XP earned" value={xp} started={started} />
              <StatBox label="Shots fired" value={shots} started={started} />
              <StatBox label="Hits taken" value={hits} started={started} />
              <StatBox
                label="Sections"
                value={sections}
                suffix={` / ${SECTION_IDS.length}`}
                started={started}
              />
              <StatBox label="Challenge best" value={challengeBest} started={started} />
              <StatBox
                label="Achievements"
                value={achievements.length}
                suffix={` / ${ACHIEVEMENTS.length}`}
                started={started}
              />
            </div>

            <div>
              <p className="hud-label">Achievements</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = achievements.includes(achievement.id);
                  return (
                    <li
                      key={achievement.id}
                      className={`flex items-center gap-3 rounded-xl border p-2.5 transition-colors ${
                        isUnlocked ? 'border-amber/40 bg-amber/8' : 'border-line'
                      }`}>
                      <AchievementBadge icon={achievement.icon} unlocked={isUnlocked} />
                      <div className="min-w-0">
                        <p
                          className={`text-sm leading-tight font-bold tracking-[0.06em] ${isUnlocked ? '' : 'text-text/60'}`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs font-medium tracking-normal text-text/60 normal-case">
                          {achievement.description}
                        </p>
                      </div>
                      <span className="ml-auto font-mono text-[0.65rem] text-text/60">
                        +{achievement.xp}
                      </span>
                      <span className="sr-only">{isUnlocked ? 'Unlocked' : 'Locked'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
