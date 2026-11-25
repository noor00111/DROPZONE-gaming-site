'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { findOperator } from '@/data/operators';
import { RARITY_STYLES } from '@/data/rarity';
import { findWeapon, type Weapon } from '@/data/weapons';
import { audio } from '@/lib/audio/AudioManager';
import { useReveal } from '@/lib/animations/useReveal';
import { DropChallengeGame } from '@/lib/game/DropChallengeGame';
import type { GameWeapon } from '@/lib/game/types';
import { selectWeaponId, useGameStore } from '@/store/useGameStore';
import { ACE_SCORE, useProgressStore } from '@/store/useProgressStore';
import WeaponArt from './arsenal/WeaponArt';
import SectionHeading from './SectionHeading';

const BEST_KEY = 'dropzone-challenge-best';

function loadBest(): number {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}
function saveBest(score: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {}
}

function me(): string {
  return findOperator(useGameStore.getState().operatorId).callsign;
}

function toGameWeapon(weapon: Weapon): GameWeapon {
  return {
    id: weapon.id,
    name: weapon.name,
    damage: weapon.damage,
    range: weapon.range,
    fireRate: weapon.fireRate,
    mag: weapon.mag,
  };
}

const WEAPON_TIPS: Record<string, string> = {
  carbine: 'All-rounder. Two hits per target.',
  smg: 'Hold the trigger. Sprays fast, needs 3 hits.',
  shotgun: 'Hits everything near the crosshair.',
  sniper: 'One shot, one target. Make it count.',
  pistol: 'Weak and wobbly. Good luck, hero.',
  flare: 'One shot that blows up a whole area.',
};

const SCORING = [
  ['Dead centre landing', '100'],
  ['On the pad', '40 – 99'],
  ['Coin', '+15'],
  ['Cardboard target', '+10'],
  ['Drone', '+15'],
  ['Bumping a bird', '−10'],
  ['Shooting a seagull', '−20'],
];

export default function DropChallenge() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<DropChallengeGame | null>(null);
  const isOnScreen = useRef(false);

  const weapon = findWeapon(useGameStore(selectWeaponId));
  const rarityColor = RARITY_STYLES[weapon.rarity].color;

  const [best, setBest] = useState(0);
  const [lastRun, setLastRun] = useState<number | null>(null);

  useEffect(() => {
    setBest(loadBest());
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new DropChallengeGame(canvas, {
      onLand: (result) => {
        const progress = useProgressStore.getState();
        progress.addXp(Math.round(result.points / 4));
        if (result.isPerfect) {
          audio.play('unlock');
          progress.unlock('bullseye');
          progress.pushFeed(me(), 'stuck the landing. Perfect!');
        } else if (result.isSplash) {
          audio.play('glitch');
          progress.pushFeed(me(), 'landed in the lake. Again.');
        } else {
          audio.play('ui-click');
        }
      },
      onRoundCleared: (roundScore) => {
        useProgressStore.getState().addXp(Math.max(0, Math.round(roundScore / 5)));
      },
      onGameOver: (score) => {
        setLastRun(score);
        useProgressStore.getState().recordChallengeRun(score);
        useProgressStore.getState().pushFeed(me(), `finished a Drop Challenge run: ${score} pts`);
        if (score > loadBest()) {
          saveBest(score);
          setBest(score);
        }
      },
      onCoin: () => audio.play('ui-hover'),
      onBird: () => {
        audio.play('glitch');
        if (Math.random() < 0.4)
          useProgressStore.getState().pushFeed(me(), 'got pecked by a seagull');
      },
      onShot: () => {
        audio.play('shot');
        useProgressStore.getState().recordShot();
      },
      onEmpty: () => audio.play('ui-click'),
      onKill: () => audio.play('ui-hover'),
      onSeagullShot: () => {
        audio.play('glitch');
        useProgressStore.getState().pushFeed(me(), 'shot at a seagull. Not cool.');
      },
    });
    game.setWeapon(toGameWeapon(findWeapon(useGameStore.getState().weaponId)));
    gameRef.current = game;

    const resizeObserver = new ResizeObserver(() => game.resize());
    resizeObserver.observe(canvas);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isOnScreen.current = entry.isIntersecting;
      game.setPaused(!entry.isIntersecting);
    });
    visibilityObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      game.dispose();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    gameRef.current?.setWeapon(toGameWeapon(weapon));
  }, [weapon]);

  useEffect(() => {
    const keysDown = new Set<string>();

    function updateSteer() {
      let direction = 0;
      if (keysDown.has('left')) direction -= 1;
      if (keysDown.has('right')) direction += 1;
      gameRef.current?.setSteer(direction);
    }

    function keyName(event: KeyboardEvent): string {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') return 'left';
      if (key === 'arrowright' || key === 'd') return 'right';
      if (key === ' ') return 'space';
      if (key === 'f') return 'fire';
      if (key === 'r') return 'reload';
      return '';
    }

    function onKeyDown(event: KeyboardEvent) {
      const game = gameRef.current;
      if (!game || !isOnScreen.current) return;
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, button'))
        return;

      const name = keyName(event);
      if (name === '') return;
      event.preventDefault();

      if (name === 'space' || name === 'fire') {
        if (!game.isPlaying()) {
          if (name === 'space' && !event.repeat) {
            audio.play('ui-click');
            game.start();
          }
        } else {
          game.fireAtNearest();
        }
        return;
      }
      if (name === 'reload') {
        game.reload();
        return;
      }
      keysDown.add(name);
      updateSteer();
    }

    function onKeyUp(event: KeyboardEvent) {
      const name = keyName(event);
      if (name === 'left' || name === 'right') {
        keysDown.delete(name);
        updateSteer();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  function pointerPosition(event: PointerEvent<HTMLCanvasElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const game = gameRef.current;
    if (!game) return;
    const { x, y } = pointerPosition(event);
    game.setPointer(x, y);

    if (!game.isPlaying()) {
      audio.play('ui-click');
      game.start();
      return;
    }
    if (game.isDefending()) game.setTrigger(true);
  }

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (event.pointerType === 'mouse' || event.buttons > 0) {
      const { x, y } = pointerPosition(event);
      gameRef.current?.setPointer(x, y);
    }
  }

  function onPointerUp(event: PointerEvent<HTMLCanvasElement>) {
    const game = gameRef.current;
    if (!game) return;
    game.setTrigger(false);
    if (event.pointerType !== 'mouse') game.setPointer(null, null);
  }

  function onPointerLeave() {
    gameRef.current?.setTrigger(false);
    gameRef.current?.setPointer(null, null);
  }

  return (
    <section id="challenge" ref={sectionRef} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          number="06"
          kicker="Drop challenge"
          title="Drop in."
          highlight="Hold it."
          text="Steer your crate onto the pad, then hold the drop with the weapon you equipped in the Arsenal. Five rounds, one very busy island."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div
            className="self-start overflow-hidden rounded-3xl border border-line shadow-[0_30px_60px_rgb(0_0_0/0.5)]"
            data-reveal>
            <canvas
              ref={canvasRef}
              className="block aspect-[4/5] w-full cursor-crosshair touch-pan-y select-none sm:aspect-[16/10]"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={onPointerLeave}
              role="img"
              aria-label="Drop Challenge game. Press Space or tap to start. Steer the falling crate with the arrow keys or the pointer, then shoot targets: click or tap, or press F to shoot the nearest one, R to reload."
            />
          </div>

          <div className="flex flex-col gap-4" data-reveal>
            <div className="rounded-2xl border border-line bg-text/4 p-5">
              <p className="hud-label">Your weapon</p>
              <WeaponArt id={weapon.id} accent={rarityColor} className="mt-2 h-14 w-full" />
              <p className="mt-1 text-lg leading-tight font-bold tracking-[0.06em]">
                {weapon.name}
              </p>
              <p className="mt-1 text-sm font-medium tracking-normal text-text/65 normal-case">
                {WEAPON_TIPS[weapon.id]}
              </p>
              <a
                href="#arsenal"
                onClick={() => audio.play('ui-click')}
                className="telemetry mt-2 inline-block text-amber hover:text-text"
              >
                Change it in the Arsenal{' '}
                <ArrowUp className="inline h-3 w-3 align-[-1px]" aria-hidden="true" />
              </a>
            </div>

            <div className="rounded-2xl border border-line bg-text/4 p-5">
              <p className="hud-label">Best score</p>
              <p className="mt-1 font-mono text-5xl leading-none text-amber tabular-nums">{best}</p>
              <p className="telemetry mt-2">
                {lastRun === null ? 'No runs yet' : `Last run: ${lastRun} pts`}
              </p>
              <p className="telemetry mt-1">Ace pilot at {ACE_SCORE}+</p>
            </div>

            <div className="rounded-2xl border border-line bg-text/4 p-5">
              <p className="hud-label">Controls</p>
              <ul className="mt-2 space-y-1.5 text-sm font-medium tracking-normal text-text/75 normal-case">
                <li className="mouse-only">
                  <span className="font-bold text-text">Drop:</span> ← → / A D or move the mouse
                </li>
                <li className="mouse-only">
                  <span className="font-bold text-text">Defend:</span> aim + click (hold for auto)
                </li>
                <li className="mouse-only">
                  <span className="font-bold text-text">F</span> shoots the nearest target ·{' '}
                  <span className="font-bold text-text">R</span> reloads
                </li>
                <li className="touch-only">Drag to steer, then tap targets to shoot</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-text/4 p-5">
              <p className="hud-label">Scoring</p>
              <dl className="mt-2 space-y-1">
                {SCORING.map(([label, points]) => (
                  <div key={label} className="flex justify-between gap-2 text-sm">
                    <dt className="font-medium tracking-normal text-text/70 normal-case">
                      {label}
                    </dt>
                    <dd className="font-mono whitespace-nowrap text-amber">{points}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
