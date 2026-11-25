'use client';

import { useEffect, useRef } from 'react';

const PIXELS_PER_DEGREE = 3;
const START_HEADING = 210;
const MOUSE_TURN_AMOUNT = 30;
const SMOOTHING = 4;

type Tick = {
  degree: number;
  label: string;
  isBig: boolean;
};

function wrapDegrees(degree: number): number {
  return ((degree % 360) + 360) % 360;
}

function getLabel(degree: number): string {
  const d = wrapDegrees(degree);
  if (d === 0) return 'N';
  if (d === 45) return 'NE';
  if (d === 90) return 'E';
  if (d === 135) return 'SE';
  if (d === 180) return 'S';
  if (d === 225) return 'SW';
  if (d === 270) return 'W';
  if (d === 315) return 'NW';
  if (d % 15 === 0) return String(d);
  return '';
}

const TICKS: Tick[] = [];
for (let degree = -180; degree <= 540; degree += 5) {
  TICKS.push({ degree, label: getLabel(degree), isBig: degree % 15 === 0 });
}

export default function Compass() {
  const stripRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = 0;
    let smoothMouseX = 0;
    let lastTime = performance.now();
    let frameId = 0;

    function onPointerMove(event: PointerEvent) {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    }

    function update(now: number) {
      let delta = (now - lastTime) / 1000;
      lastTime = now;
      if (delta > 0.1) delta = 0.1;

      smoothMouseX += (mouseX - smoothMouseX) * Math.min(1, delta * SMOOTHING);
      const heading = wrapDegrees(START_HEADING + smoothMouseX * MOUSE_TURN_AMOUNT);

      const viewWidth = windowRef.current ? windowRef.current.clientWidth : 300;
      const offset = viewWidth / 2 - (heading + 180) * PIXELS_PER_DEGREE;
      if (stripRef.current) {
        stripRef.current.style.transform = `translateX(${offset}px)`;
      }
      if (readoutRef.current) {
        const rounded = wrapDegrees(Math.round(heading));
        readoutRef.current.textContent = String(rounded).padStart(3, '0');
      }

      frameId = requestAnimationFrame(update);
    }

    window.addEventListener('pointermove', onPointerMove);
    frameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center" data-hud="compass" aria-hidden="true">
      <div
        ref={windowRef}
        className="relative h-9 w-[200px] overflow-hidden border-b border-line sm:w-[300px]"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
        }}
      >
        <div ref={stripRef} className="absolute top-0 left-0 h-full will-change-transform">
          {TICKS.map((tick) => (
            <div
              key={tick.degree}
              className="absolute bottom-0 flex flex-col items-center"
              style={{ left: (tick.degree + 180) * PIXELS_PER_DEGREE, translate: '-50% 0' }}
            >
              {tick.label !== '' && (
                <span
                  className={
                    tick.label.length <= 2
                      ? 'mb-0.5 text-sm font-bold text-amber'
                      : 'mb-0.5 font-mono text-[0.6rem] text-text/60'
                  }
                >
                  {tick.label}
                </span>
              )}
              <span className={tick.isBig ? 'h-2.5 w-px bg-text/80' : 'h-1.5 w-px bg-text/40'} />
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-1/2 h-full w-px -translate-x-1/2 bg-amber/70" />
      </div>

      <div className="mt-1 flex items-center gap-1">
        <span className="h-0 w-0 border-x-4 border-b-[6px] border-x-transparent border-b-amber" />
        <span ref={readoutRef} className="font-mono text-sm text-amber tabular-nums">
          {String(START_HEADING).padStart(3, '0')}
        </span>
      </div>
    </div>
  );
}
