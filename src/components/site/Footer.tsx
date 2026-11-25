'use client';

import { useRef } from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import Logo from './Logo';

const SECRET_TAPS = 7;

export default function Footer() {
  const taps = useRef(0);

  function onLogoTap() {
    taps.current += 1;
    if (taps.current >= SECRET_TAPS) {
      taps.current = 0;
      useProgressStore.getState().triggerSecret();
      useProgressStore.getState().pushFeed('???', 'called in a golden supply drop');
    }
  }

  return (
    <footer className="relative border-t border-line">
      <div className="hazard h-1 opacity-70" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[2fr_1fr_1fr] lg:px-8">
        <div>
          <button
            type="button"
            onClick={onLogoTap}
            className="cursor-pointer"
            aria-label="Dropzone logo"
          >
            <Logo />
          </button>
          <p className="mt-4 max-w-sm text-base font-medium tracking-normal text-text/65 normal-case">
            Drop in. Loot up. Laugh when your whole squad lands in the lake.
          </p>
          <p className="telemetry mt-4">Psst: ↑ ↑ ↓ ↓ ← → ← → B A · or poke the logo a few times</p>
        </div>

        <div>
          <p className="hud-label">Game</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold tracking-[0.15em]">
            <li>
              <a href="#modes" className="text-text/70 hover:text-amber">
                Game modes
              </a>
            </li>
            <li>
              <a href="#map" className="text-text/70 hover:text-amber">
                Drop map
              </a>
            </li>
            <li>
              <a href="#arsenal" className="text-text/70 hover:text-amber">
                Arsenal
              </a>
            </li>
            <li>
              <a href="#operators" className="text-text/70 hover:text-amber">
                Operators
              </a>
            </li>
            <li>
              <a href="#season" className="text-text/70 hover:text-amber">
                Season 01
              </a>
            </li>
            <li>
              <a href="#challenge" className="text-text/70 hover:text-amber">
                Drop challenge
              </a>
            </li>
            <li>
              <a href="#debrief" className="text-text/70 hover:text-amber">
                Debrief
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="hud-label">About</p>
          <p className="telemetry mt-3 leading-relaxed">
            A concept project
            <br />
            Next.js · Three.js · GSAP
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="telemetry">© 2026 Dropzone · Fan-made concept, not a real game or studio</p>
        </div>
      </div>
    </footer>
  );
}
