'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BANNER_TEXT = 'SOLO  ✦  DUO  ✦  SQUAD  ✦  NIGHT OPS  ✦  DROP IN';
const WAVE_A = 'M0 60 C 160 36, 320 84, 480 60 S 800 36, 900 60';
const WAVE_B = 'M0 60 C 160 84, 320 36, 480 60 S 800 84, 900 60';
const WAVE_TIME = '1.3s';

function CargoPlane() {
  return (
    <svg viewBox="0 0 260 110" className="w-[150px] shrink-0 md:w-[210px]" aria-hidden="true">
      <path d="M22 42 L8 6 L34 6 L58 40 Z" fill="#3a4119" />
      <text x={20} y={26} fontSize={9} fontWeight={700} fill="#ffb000">
        DZ-7
      </text>
      <path
        d="M12 56 Q12 40 44 38 L196 34 Q244 36 256 54 Q244 70 196 70 L44 68 Q12 66 12 56 Z"
        fill="#4b5320"
      />
      <path d="M44 56 L230 54 L232 59 L44 61 Z" fill="#ffb000" />
      <path d="M60 42 L92 41 L92 64 L60 65 Z" fill="none" stroke="#2b3014" strokeWidth={1.5} />
      <path d="M218 40 Q238 42 246 50 L222 50 Z" fill="#1b2010" />
      <ellipse cx={34} cy={50} rx={22} ry={4} fill="#3a4119" />
      <path d="M118 54 L156 54 L132 96 L104 96 Z" fill="#3a4119" />
      <rect x={134} y={64} width={26} height={12} rx={5} fill="#2b3014" />
      <ellipse
        className="propeller"
        cx={163}
        cy={70}
        rx={2.5}
        ry={16}
        fill="rgb(232 232 232 / 0.55)"
      />
    </svg>
  );
}

function MiniChute() {
  return (
    <svg viewBox="-24 -16 48 52" className="h-8 w-8" aria-hidden="true">
      <path d="M-22 0 A22 14 0 0 1 22 0 Z" fill="#ffb000" />
      <path
        d="M-22 0 L0 26 M22 0 L0 26 M0 0 L0 26"
        stroke="rgb(232 232 232 / 0.7)"
        strokeWidth={1.2}
      />
      <rect x={-6} y={25} width={12} height={9} fill="#4b5320" />
    </svg>
  );
}

export default function FlyBy() {
  const bandRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const band = bandRef.current;
      const flight = band?.querySelector<HTMLElement>('[data-flight]');
      if (!band || !flight) return;

      if (reduceMotion) {
        gsap.set(flight, { x: (band.offsetWidth - flight.offsetWidth) / 2 });
        return;
      }

      const scroll = {
        trigger: band,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8,
        invalidateOnRefresh: true,
      };

      gsap.fromTo(
        flight,
        { x: () => -flight.offsetWidth },
        { x: () => band.offsetWidth, ease: 'none', scrollTrigger: scroll },
      );

      gsap.to('[data-cloud]', {
        x: (i: number) => -120 - i * 90,
        ease: 'none',
        scrollTrigger: scroll,
      });
    },
    { scope: bandRef, dependencies: [reduceMotion], revertOnUpdate: true },
  );

  return (
    <div
      ref={bandRef}
      className="pointer-events-none relative z-10 -mt-16 h-60 overflow-hidden md:h-72"
      aria-hidden="true"
    >
      <div data-cloud className="cloud absolute top-6 left-[12%] h-16 w-64" />
      <div data-cloud className="cloud absolute top-28 left-[55%] h-20 w-80" />
      <div data-cloud className="cloud absolute top-10 left-[85%] h-12 w-48" />

      <div data-flight className="absolute top-1/2 left-0 flex -translate-y-1/2 items-center">
        <svg viewBox="0 0 980 120" className="w-[520px] shrink-0 md:w-[760px]">
          <defs>
            <path id="banner-wave" d={WAVE_A}>
              {!reduceMotion && (
                <animate
                  attributeName="d"
                  values={`${WAVE_A};${WAVE_B};${WAVE_A}`}
                  dur={WAVE_TIME}
                  repeatCount="indefinite"
                />
              )}
            </path>
          </defs>

          <use href="#banner-wave" fill="none" stroke="#0e1110" strokeWidth={60} />
          <use href="#banner-wave" fill="none" stroke="#ffb000" strokeWidth={52} />

          <text
            fontSize={30}
            fontWeight={700}
            letterSpacing={2}
            fill="#0e1110"
            dominantBaseline="central"
          >
            <textPath href="#banner-wave" startOffset="4%">
              {BANNER_TEXT}
            </textPath>
          </text>

          <path d="M900 60 L980 48" stroke="rgb(232 232 232 / 0.6)" strokeWidth={2} />
        </svg>

        <div className="relative">
          <CargoPlane />
          <div className="drop-chute absolute top-1/2 left-[22%]">
            <MiniChute />
          </div>
          <div
            className="drop-chute absolute top-1/2 left-[22%]"
            style={{ animationDelay: '1.2s' }}
          >
            <MiniChute />
          </div>
          <div
            className="drop-chute absolute top-1/2 left-[22%]"
            style={{ animationDelay: '2.4s' }}
          >
            <MiniChute />
          </div>
        </div>
      </div>
    </div>
  );
}
