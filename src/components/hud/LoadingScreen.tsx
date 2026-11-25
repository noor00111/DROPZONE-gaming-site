'use client';

import { useEffect, useRef, useState } from 'react';
import { selectLoad, selectPhase, selectQuality, useGameStore } from '@/store/useGameStore';

const COUNT_UP_SPEED = 0.08;
const MIN_SHOW_TIME = 1200;
const GIVE_UP_TIME = 10000;
const HOLD_AT_100 = 900;

const STEPS = [
  { text: 'Establishing uplink', doneAt: 0.1 },
  { text: 'Loading terrain layers', doneAt: 0.4 },
  { text: 'Packing supply crate', doneAt: 0.75 },
  { text: 'Briefing squad', doneAt: 1 },
];

export default function LoadingScreen() {

  const phase = useGameStore(selectPhase);
  const load = useGameStore(selectLoad);
  const quality = useGameStore(selectQuality);
  const setPhase = useGameStore((state) => state.setPhase);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    const minTimer = setTimeout(() => setMinTimePassed(true), MIN_SHOW_TIME);
    const giveUpTimer = setTimeout(() => setGaveUp(true), GIVE_UP_TIME);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(giveUpTimer);
    };
  }, []);

  const finished = load.done || gaveUp;

  useEffect(() => {
    if (phase !== 'loading') return;
    if (!finished || !minTimePassed) return;

    const timer = setTimeout(() => setPhase('intro'), HOLD_AT_100);
    return () => clearTimeout(timer);
  }, [phase, finished, minTimePassed, setPhase]);

  const ratio = finished ? 1 : load.ratio;
  const percent = Math.round(ratio * 100);
  const isVisible = phase === 'loading';

  const numberRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const targetPercentRef = useRef(0);

  useEffect(() => {
    targetPercentRef.current = percent;
  }, [percent]);

  useEffect(() => {
    if (!isVisible) return;

    let shownPercent = 0;
    let frameId = 0;

    function update() {
      shownPercent += (targetPercentRef.current - shownPercent) * COUNT_UP_SPEED;
      if (targetPercentRef.current - shownPercent < 0.5) shownPercent = targetPercentRef.current;

      if (numberRef.current) {
        numberRef.current.textContent = String(Math.round(shownPercent)).padStart(3, '0');
      }
      if (barRef.current) {
        barRef.current.style.width = `${shownPercent}%`;
      }
      frameId = requestAnimationFrame(update);
    }

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible]);

  return (
    <div
      className="fade-panel loading-screen fixed inset-0 z-40 flex flex-col items-center justify-center bg-charcoal px-6"
      data-visible={isVisible}
      aria-hidden={!isVisible}
    >
      <div className="w-full max-w-md">
        <p className="hud-label text-amber">Operation: Dropzone</p>
        <h2 className="mt-1 text-2xl font-bold tracking-[0.15em]">
          Loading drop data<span className="blink text-amber">_</span>
        </h2>

        <p className="mt-6 font-mono text-6xl text-amber tabular-nums" aria-hidden="true">
          <span ref={numberRef}>000</span>
          <span className="text-2xl text-text/60">%</span>
        </p>

        <div
          className="brackets mt-3 h-2 w-full bg-line"
          role="progressbar"
          aria-label="Loading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div ref={barRef} className="h-full w-0 bg-amber shadow-[0_0_12px_var(--c-amber-glow)]" />
        </div>

        <ul className="mt-6 space-y-1.5 font-mono text-xs tracking-[0.12em]">
          {STEPS.map((step) => {
            const done = ratio >= step.doneAt;
            return (
              <li key={step.text} className={done ? 'text-text' : 'text-text/60'}>
                <span className={done ? 'text-amber' : ''}>{done ? '[x]' : '[ ]'}</span> {step.text}
              </li>
            );
          })}
        </ul>

        <div className="telemetry mt-8 flex flex-wrap justify-between gap-2">
          <span>
            Items {load.loaded}/{load.total} · Quality {quality}
          </span>
          {load.failed.length > 0 && <span>{load.failed.length} missing · using field spares</span>}
        </div>
      </div>

      <div className="hazard absolute bottom-0 left-0 h-1.5 w-full opacity-70" />
    </div>
  );
}
