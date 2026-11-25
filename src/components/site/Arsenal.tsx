'use client';

import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react';
import { RARITY_STYLES } from '@/data/rarity';
import { findWeapon, WEAPONS, type Weapon } from '@/data/weapons';
import { audio } from '@/lib/audio/AudioManager';
import { useReveal } from '@/lib/animations/useReveal';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { selectAmmo, selectWeaponId, useGameStore } from '@/store/useGameStore';
import WeaponArt, { MUZZLE } from './arsenal/WeaponArt';
import SectionHeading from './SectionHeading';

const AUTO_FIRE_SPEED = 1.3;

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pips = [];
  for (let i = 1; i <= 10; i++) {
    pips.push(
      <span
        key={i}
        className="h-2.5 flex-1 rounded-[2px] transition-colors duration-300"
        style={{ background: i <= value ? color : 'var(--c-line)', transitionDelay: `${i * 25}ms` }}
      />,
    );
  }
  return (
    <div className="grid grid-cols-[6.5rem_1fr_1.5rem] items-center gap-3">
      <span className="text-xs font-semibold tracking-[0.2em] text-text/60">{label}</span>
      <span className="flex gap-1">{pips}</span>
      <span className="text-right font-mono text-sm">{value}</span>
    </div>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="flex items-center gap-2 font-mono text-[0.55rem] tracking-[0.12em] text-text/60">
      <span className="w-7">{label}</span>
      <span className="h-1 flex-1 rounded-full bg-line">
        <span
          className="block h-full rounded-full"
          style={{ width: `${value * 10}%`, background: color }}
        />
      </span>
    </span>
  );
}

function WeaponCard({
  weapon,
  isEquipped,
  onEquip,
}: {
  weapon: Weapon;
  isEquipped: boolean;
  onEquip: () => void;
}) {
  const style = RARITY_STYLES[weapon.rarity];
  const cardStyle = { '--frame': style.frame, '--rarity': style.color } as CSSProperties;

  return (
    <button
      type="button"
      onClick={onEquip}
      aria-pressed={isEquipped}
      className={`weapon-card shrink-0 cursor-pointer text-left ${isEquipped ? 'is-equipped' : ''}`}
      style={cardStyle}>
      <span className="sr-only">Equip </span>
      <span
        className={`card-frame block rounded-2xl ${weapon.rarity === 'Legendary' ? 'holo-frame' : ''}`}>
        <span className="flex h-full flex-col rounded-[12px] bg-charcoal p-3">
          <span className="flex items-center justify-between text-[0.6rem] font-semibold tracking-[0.15em] text-text/60">
            {weapon.type}
            {isEquipped && (
              <span
                className="rounded-full px-1.5 py-0.5 text-charcoal"
                style={{ background: style.color }}>
                Equipped
              </span>
            )}
          </span>
          <WeaponArt id={weapon.id} accent={style.color} className="mt-2 h-14 w-full" />
          <span className="mt-2 text-base leading-tight font-bold tracking-[0.06em]">
            {weapon.name}
          </span>
          <span className="mt-3 flex flex-col gap-1.5">
            <MiniBar label="DMG" value={weapon.damage} color={style.color} />
            <MiniBar label="RNG" value={weapon.range} color={style.color} />
          </span>
          <span className="mt-auto flex justify-between pt-2 font-mono text-[0.6rem] tracking-[0.12em]">
            <span style={{ color: style.color }}>{weapon.rarity}</span>
            <span className="text-text/60">MAG {weapon.mag}</span>
          </span>
        </span>
      </span>
    </button>
  );
}

export default function Arsenal() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);
  const reduceMotion = usePrefersReducedMotion();

  const weapon = findWeapon(useGameStore(selectWeaponId));
  const ammo = useGameStore(selectAmmo);
  const equipWeapon = useGameStore((state) => state.equipWeapon);
  const rarity = RARITY_STYLES[weapon.rarity];
  const muzzle = MUZZLE[weapon.id];

  const stageRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const fireTimerRef = useRef<number | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDown: false, startX: 0, startScroll: 0, moved: false });

  useEffect(() => {
    const timers = fireTimerRef;
    return () => {
      if (timers.current !== null) window.clearInterval(timers.current);
    };
  }, []);

  function stopFiring() {
    if (fireTimerRef.current !== null) {
      window.clearInterval(fireTimerRef.current);
      fireTimerRef.current = null;
    }
  }

  function ejectShell() {
    const stage = stageRef.current;
    if (!stage || weapon.id === 'flare') return;

    const shell = document.createElement('span');
    shell.className = weapon.id === 'shotgun' ? 'shell-casing shell-red' : 'shell-casing';
    stage.appendChild(shell);

    const drift = 40 + Math.random() * 60;
    const flight = shell.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${drift}px, -70px) rotate(260deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${drift + 40}px, 160px) rotate(720deg)`, opacity: 0 },
      ],
      { duration: 750, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)' },
    );
    flight.onfinish = () => shell.remove();
  }

  function launchFlare() {
    const stage = stageRef.current;
    if (!stage) return;

    const flare = document.createElement('span');
    flare.className = 'flare-ball';
    flare.style.left = `${muzzle.x}%`;
    flare.style.top = '35%';
    stage.appendChild(flare);

    const flight = flare.animate(
      [
        { transform: 'translate(0, 0) scale(0.6)', opacity: 1 },
        { transform: 'translate(160px, -260px) scale(1.4)', opacity: 1, offset: 0.7 },
        { transform: 'translate(200px, -300px) scale(2)', opacity: 0 },
      ],
      { duration: 1400, easing: 'ease-out' },
    );
    flight.onfinish = () => flare.remove();
  }

  function shootOnce() {
    const fired = useGameStore.getState().fire();
    if (!fired) {
      audio.play('ui-click');
      stopFiring();
      return;
    }

    audio.play('shot');

    flashRef.current?.animate(
      [
        { opacity: 1, scale: 1 },
        { opacity: 0, scale: 1.6 },
      ],
      { duration: 90 },
    );

    if (reduceMotion) return;

    artRef.current?.animate(
      [
        { translate: '0 0', rotate: '0deg' },
        { translate: `${-6 - weapon.damage}px 0`, rotate: `${-1 - weapon.damage * 0.5}deg` },
        { translate: '0 0', rotate: '0deg' },
      ],
      { duration: 90 + weapon.damage * 10, easing: 'ease-out' },
    );

    if (weapon.id === 'flare') launchFlare();
    else ejectShell();
  }

  function startFiring(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    stopFiring();
    shootOnce();
    const delay = 1000 / (weapon.fireRate * AUTO_FIRE_SPEED);
    fireTimerRef.current = window.setInterval(shootOnce, delay);
  }

  function reload() {
    stopFiring();
    audio.play('ui-click');
    useGameStore.getState().reload();
    if (!reduceMotion) {
      artRef.current?.animate(
        [
          { rotate: '0deg', translate: '0 0' },
          { rotate: '12deg', translate: '0 12px' },
          { rotate: '0deg', translate: '0 0' },
        ],
        { duration: 450, easing: 'ease-in-out' },
      );
    }
  }

  function equip(next: Weapon) {
    if (dragRef.current.moved) return;
    stopFiring();
    audio.play('ui-click');
    equipWeapon(next.id, next.mag);
  }

  function onRowPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !rowRef.current) return;
    dragRef.current = {
      isDown: true,
      startX: event.clientX,
      startScroll: rowRef.current.scrollLeft,
      moved: false,
    };
  }

  function onRowPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag.isDown || !rowRef.current) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 6) drag.moved = true;
    rowRef.current.scrollLeft = drag.startScroll - distance;
  }

  function onRowPointerUp() {
    dragRef.current.isDown = false;
    window.setTimeout(() => {
      dragRef.current.moved = false;
    }, 0);
  }

  const isEmpty = ammo.mag === 0;
  const stageStyle = { '--rarity': rarity.color } as CSSProperties;

  return (
    <section id="arsenal" ref={sectionRef} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          number="03"
          kicker="Arsenal"
          title="Pick your"
          highlight="loadout"
          text="Equip a weapon and give it a test fire. Hold to go full auto. Whatever you equip goes into your HUD and into the Drop Challenge below."
        />

        <div className="mt-12 grid overflow-hidden rounded-3xl border border-line bg-text/3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
          data-reveal>
          <div
            ref={stageRef}
            className="weapon-stage relative flex min-h-[320px] flex-col justify-center overflow-hidden p-6 md:min-h-[420px] md:p-10"
            style={stageStyle}>
            <span
              className="weapon-type-word pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center"
              aria-hidden="true">
              {weapon.type}
            </span>

            <div className="relative z-10 flex items-center gap-3">
              <span
                className="rounded-full px-3 py-1 text-[0.65rem] font-bold tracking-[0.2em] text-charcoal"
                style={{ background: rarity.color }}>
                {weapon.rarity}
              </span>
              <span className="telemetry">{weapon.type}</span>
            </div>

            <div key={weapon.id} className="weapon-in relative z-10 mx-auto mt-6 w-full max-w-xl">
              <div ref={artRef} className="relative">
                <WeaponArt
                  id={weapon.id}
                  accent={rarity.color}
                  className="w-full drop-shadow-[0_20px_25px_rgb(0_0_0/0.6)]"/>
                <div
                  ref={flashRef}
                  className="muzzle-flash"
                  style={{ left: `${muzzle.x}%`, top: `${muzzle.y}%` }}
                  aria-hidden="true"/>
              </div>
              <div className="weapon-floor mx-auto mt-2 h-6 w-3/4" aria-hidden="true" />
            </div>

            <h3 className="relative z-10 mt-6 text-3xl leading-none font-bold tracking-[0.06em] md:text-5xl">
              {weapon.name}
            </h3>
          </div>

          <div className="flex flex-col gap-6 border-t border-line p-6 md:p-10 lg:border-t-0 lg:border-l">
            <p className="text-lg font-medium tracking-normal text-amber normal-case">
              “{weapon.quote}”
            </p>

            <div className="space-y-3">
              <StatBar label="Damage" value={weapon.damage} color={rarity.color} />
              <StatBar label="Range" value={weapon.range} color={rarity.color} />
              <StatBar label="Fire rate" value={weapon.fireRate} color={rarity.color} />
              <StatBar label="Handling" value={weapon.handling} color={rarity.color} />
            </div>

            <div className="flex items-end justify-between border-t border-line pt-5">
              <div>
                <p className="hud-label">Ammo</p>
                <p className="mt-1 font-mono leading-none tabular-nums">
                  <span className={`text-5xl ${isEmpty ? 'text-danger' : 'text-text'}`}>
                    {String(ammo.mag).padStart(2, '0')}
                  </span>
                  <span className="text-xl text-text/60"> / {ammo.reserve}</span>
                </p>
              </div>
              {isEmpty && (
                <p className="danger-pulse text-sm font-bold tracking-[0.2em] text-danger">
                  {ammo.reserve > 0 ? 'Reload!' : 'Out of ammo'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <button
                type="button"
                onPointerDown={startFiring}
                onPointerUp={stopFiring}
                onPointerLeave={stopFiring}
                onPointerCancel={stopFiring}
                onKeyDown={(event) => {
                  if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
                    event.preventDefault();
                    shootOnce();
                  }
                }}
                className="glitch-on-hover cursor-pointer touch-none rounded-xl py-4 text-lg font-bold tracking-[0.3em] text-charcoal transition-transform select-none active:scale-[0.97]"
                style={{ background: rarity.color }}>
                <span className="glitch-text inline-block">Test fire</span>
              </button>
              <button
                type="button"
                onClick={reload}
                className="cursor-pointer rounded-xl border border-line px-5 text-sm font-bold tracking-[0.2em] text-text/80 transition-colors hover:border-amber hover:text-amber">
                Reload
              </button>
            </div>
            <p className="telemetry -mt-2">Hold to keep firing · your HUD counts every shot</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between" data-reveal>
          <p className="hud-label">Choose a weapon</p>
          <p className="telemetry">
            <span className="mouse-only">Drag to browse</span>
            <span className="touch-only">Swipe to browse</span>
          </p>
        </div>
        <div
          ref={rowRef}
          className="weapon-row -mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pt-2 pb-6 lg:mx-0 lg:justify-center lg:px-0"
          onPointerDown={onRowPointerDown}
          onPointerMove={onRowPointerMove}
          onPointerUp={onRowPointerUp}
          onPointerLeave={onRowPointerUp}
          data-reveal>
          {WEAPONS.map((item) => (
            <WeaponCard
              key={item.id}
              weapon={item}
              isEquipped={item.id === weapon.id}
              onEquip={() => equip(item)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
