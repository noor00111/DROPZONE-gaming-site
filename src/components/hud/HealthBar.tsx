'use client';

import { MAX_HEALTH, selectHealth, useGameStore } from '@/store/useGameStore';

const LOW_HEALTH = 30;

export default function HealthBar() {
  
  const health = useGameStore(selectHealth);
  const percent = (health / MAX_HEALTH) * 100;
  const isLow = health <= LOW_HEALTH;

  return (
    <div className="hud-panel brackets w-44 sm:w-56 md:w-72" data-hud="health">
      <div className="flex items-baseline justify-between">
        <span className="hud-label">Health</span>
        <span className={`font-mono text-2xl tabular-nums ${isLow ? 'text-danger' : 'text-text'}`}>
          {Math.round(health)}
          <span className="text-xs text-text/60"> / {MAX_HEALTH}</span>
        </span>
      </div>

      <div
        className="relative mt-1.5 h-3 w-full bg-line"
        role="progressbar"
        aria-label="Health"
        aria-valuemin={0}
        aria-valuemax={MAX_HEALTH}
        aria-valuenow={Math.round(health)}
      >
        <div
          className="absolute inset-y-0 left-0 bg-text/50 transition-[width] delay-300 duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
        <div
          className={`absolute inset-y-0 left-0 transition-[width] duration-150 ${
            isLow ? 'danger-pulse bg-danger' : 'bg-amber'
          }`}
          style={{ width: `${percent}%` }}
        />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(10%-2px),var(--c-charcoal)_calc(10%-2px),var(--c-charcoal)_10%)]" />
      </div>
    </div>
  );
}
