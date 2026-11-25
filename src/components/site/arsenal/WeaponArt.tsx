import type { WeaponId } from '@/types';

const BODY = '#2b3014';
const PART = '#4b5320';
const METAL = '#3a3f42';
const DARK = '#1a1d1c';

export const MUZZLE: Record<WeaponId, { x: number; y: number }> = {
  carbine: { x: 97, y: 40 },
  smg: { x: 86, y: 39 },
  shotgun: { x: 97, y: 37 },
  sniper: { x: 99, y: 45 },
  pistol: { x: 74, y: 34 },
  flare: { x: 76, y: 38 },
};

function Carbine({ accent }: { accent: string }) {
  return (
    <g>
      <path d="M8 46 L58 40 L62 66 L14 76 Z" fill={BODY} />
      <rect x={58} y={38} width={110} height={26} rx={3} fill={PART} />
      <rect x={168} y={42} width={78} height={16} rx={2} fill={BODY} />
      {[178, 192, 206, 220, 234].map((x) => (
        <rect key={x} x={x} y={46} width={8} height={4} rx={1} fill={DARK} />
      ))}
      <rect x={246} y={45} width={64} height={6} fill={METAL} />
      <rect x={300} y={43} width={12} height={10} rx={2} fill={DARK} />
      <path d="M118 64 L140 64 L150 108 L126 112 Z" fill={DARK} />
      <path d="M78 64 L96 64 L90 98 L72 98 Z" fill={BODY} />
      <rect x={96} y={28} width={44} height={10} rx={3} fill={DARK} />
      <rect x={100} y={30} width={10} height={6} rx={1} fill={accent} />
      <rect x={58} y={50} width={110} height={3} fill={accent} />
    </g>
  );
}

function Smg({ accent }: { accent: string }) {
  return (
    <g>
      <path d="M20 44 L70 44 L70 50 L28 50 L28 70 L20 70 Z" fill={METAL} />
      <rect x={70} y={34} width={120} height={32} rx={4} fill={PART} />
      <rect x={190} y={40} width={50} height={14} rx={2} fill={BODY} />
      <rect x={240} y={42} width={36} height={10} rx={3} fill={DARK} />
      <rect x={140} y={66} width={20} height={50} rx={2} fill={DARK} />
      <path d="M92 66 L110 66 L104 100 L86 100 Z" fill={BODY} />
      <rect x={90} y={26} width={60} height={8} rx={2} fill={BODY} />
      <rect x={70} y={48} width={120} height={3} fill={accent} />
      <circle cx={178} cy={50} r={4} fill={accent} />
    </g>
  );
}

function Shotgun({ accent }: { accent: string }) {
  return (
    <g>
      <path d="M6 50 L70 40 L76 64 L16 82 Q4 80 6 70 Z" fill="#5a4426" />
      <rect x={70} y={36} width={70} height={28} rx={3} fill={PART} />
      <rect x={140} y={38} width={170} height={10} rx={2} fill={METAL} />
      <rect x={140} y={50} width={150} height={9} rx={2} fill={DARK} />
      <rect x={170} y={48} width={56} height={16} rx={3} fill={BODY} />
      {[176, 186, 196, 206, 216].map((x) => (
        <rect key={x} x={x} y={50} width={4} height={12} fill={DARK} />
      ))}
      <path d="M92 64 L110 64 L104 98 L86 98 Z" fill="#5a4426" />
      <rect x={70} y={46} width={70} height={3} fill={accent} />
    </g>
  );
}

function Sniper({ accent }: { accent: string }) {
  return (
    <g>
      <path d="M4 52 L60 46 L64 70 L48 70 L44 60 L30 62 L30 84 L8 84 Z" fill={BODY} />
      <rect x={60} y={44} width={90} height={24} rx={3} fill={PART} />
      <rect x={150} y={50} width={166} height={7} fill={METAL} />
      <rect x={300} y={48} width={18} height={11} rx={2} fill={DARK} />
      <rect x={78} y={22} width={84} height={14} rx={7} fill={DARK} />
      <circle cx={80} cy={29} r={10} fill={DARK} />
      <circle cx={160} cy={29} r={11} fill={DARK} />
      <circle cx={160} cy={29} r={6} fill={accent} opacity={0.8} />
      <rect x={104} y={36} width={8} height={8} fill={DARK} />
      <rect x={130} y={36} width={8} height={8} fill={DARK} />
      <path
        d="M200 57 L186 100 M206 57 L222 100"
        stroke={DARK}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path d="M84 68 L100 68 L96 100 L80 100 Z" fill={BODY} />
      <rect x={60} y={56} width={90} height={3} fill={accent} />
    </g>
  );
}

function Pistol({ accent }: { accent: string }) {
  return (
    <g>
      <rect x={110} y={30} width={130} height={24} rx={4} fill={METAL} />
      {[200, 210, 220].map((x) => (
        <rect key={x} x={x} y={34} width={4} height={16} fill={DARK} />
      ))}
      <rect x={110} y={54} width={110} height={12} fill={BODY} />
      <path d="M114 62 L150 62 L140 112 L104 108 Z" fill={DARK} />
      <path d="M150 66 Q162 82 176 66" fill="none" stroke={DARK} strokeWidth={4} />
      <rect x={112} y={40} width={128} height={3} fill={accent} />
    </g>
  );
}

function Flare({ accent }: { accent: string }) {
  return (
    <g>
      <rect x={100} y={34} width={90} height={30} rx={8} fill="#c2410c" />
      <rect x={190} y={30} width={56} height={38} rx={6} fill="#ea580c" />
      <rect x={240} y={28} width={8} height={42} rx={2} fill={DARK} />
      <path d="M110 64 L140 64 L132 112 L100 108 Z" fill={DARK} />
      <path d="M140 66 Q152 82 166 66" fill="none" stroke={DARK} strokeWidth={4} />
      <circle cx={120} cy={49} r={5} fill={accent} />
      <rect x={100} y={44} width={146} height={3} fill="rgb(255 255 255 / 0.25)" />
    </g>
  );
}

export default function WeaponArt({
  id,
  accent,
  className = '',
}: {
  id: WeaponId;
  accent: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 320 120" className={className} aria-hidden="true">
      {id === 'carbine' && <Carbine accent={accent} />}
      {id === 'smg' && <Smg accent={accent} />}
      {id === 'shotgun' && <Shotgun accent={accent} />}
      {id === 'sniper' && <Sniper accent={accent} />}
      {id === 'pistol' && <Pistol accent={accent} />}
      {id === 'flare' && <Flare accent={accent} />}
    </svg>
  );
}
