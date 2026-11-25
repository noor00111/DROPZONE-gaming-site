'use client';

import { findWeapon } from '@/data/weapons';
import { selectAmmo, selectWeaponId, useGameStore } from '@/store/useGameStore';

const LOW_AMMO = 5;

export default function AmmoCounter() {
  
  const ammo = useGameStore(selectAmmo);
  const weaponName = findWeapon(useGameStore(selectWeaponId)).name;
  const isEmpty = ammo.mag === 0;
  const isLow = ammo.mag <= LOW_AMMO;

  const pips = [];
  for (let i = 0; i < ammo.magSize; i++) {
    const isLoaded = i < ammo.mag;
    pips.push(<span key={i} className={`h-3 w-[3px] ${isLoaded ? 'bg-amber' : 'bg-line'}`} />);
  }

  return (
    <div className="hud-panel brackets text-right" data-hud="ammo">
      <div className="flex items-baseline justify-end gap-3">
        <span className="hud-label">{weaponName}</span>
      </div>

      <p className="font-mono leading-none tabular-nums">
        <span className="sr-only">Ammo: </span>
        <span className={`text-4xl md:text-5xl ${isLow ? 'text-danger' : 'text-text'}`}>
          {String(ammo.mag).padStart(2, '0')}
        </span>
        <span className="text-lg text-text/60"> / {ammo.reserve}</span>
      </p>

      <div className="mt-1.5 hidden justify-end gap-0.5 sm:flex" aria-hidden="true">
        {pips}
      </div>

      {isEmpty && (
        <p className="danger-pulse mt-1 text-xs font-bold tracking-[0.2em] text-danger">
          {ammo.reserve > 0 ? 'Reload [R]' : 'No ammo'}
        </p>
      )}
    </div>
  );
}
