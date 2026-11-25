'use client';

import { useEffect, useState } from 'react';
import { useProgressStore } from '@/store/useProgressStore';

const DROP_TIME = 3200;

export default function SecretDrop() {
  const secretAt = useProgressStore((state) => state.secretAt);
  const [showing, setShowing] = useState(0);

  useEffect(() => {
    if (secretAt === 0) return;
    setShowing(secretAt);
    const timer = window.setTimeout(() => setShowing(0), DROP_TIME);
    return () => window.clearTimeout(timer);
  }, [secretAt]);

  if (showing === 0) return null;

  return (
    <div
      key={showing}
      className="pointer-events-none fixed inset-0 z-46 flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="secret-drop flex flex-col items-center">
        <svg viewBox="-60 -40 120 120" className="w-40 drop-shadow-[0_0_30px_rgb(255_200_60/0.7)]">
          <path d="M-56 0 A56 34 0 0 1 56 0 Z" fill="#ffd54a" />
          <path d="M-56 0 A56 34 0 0 1 -18 -31 L-14 0 Z" fill="#f0b400" />
          <path
            d="M-56 0 L0 50 M56 0 L0 50 M-20 0 L0 50 M20 0 L0 50"
            stroke="#fff3c4"
            strokeWidth={1.5}
          />
          <rect
            x={-22}
            y={48}
            width={44}
            height={30}
            rx={3}
            fill="#e0a100"
            stroke="#7a5200"
            strokeWidth={3}
          />
          <path d="M-22 60 H22 M0 48 V78" stroke="#7a5200" strokeWidth={3} />
        </svg>
        <p className="secret-burst mt-2 text-5xl font-bold tracking-[0.1em] text-amber drop-shadow-[0_0_20px_var(--c-amber-glow)]">
          +500 XP
        </p>
      </div>
    </div>
  );
}
