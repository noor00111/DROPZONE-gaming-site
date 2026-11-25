import type { GameMode } from './modeData';

const CHUTE_SPOTS: Record<number, { x: number; y: number; size: number }[]> = {
  1: [{ x: 100, y: 26, size: 1.35 }],
  2: [
    { x: 70, y: 24, size: 1 },
    { x: 138, y: 44, size: 0.8 },
  ],
  4: [
    { x: 48, y: 30, size: 0.75 },
    { x: 100, y: 16, size: 1 },
    { x: 154, y: 28, size: 0.8 },
    { x: 118, y: 58, size: 0.6 },
  ],
};

function Chute({ color }: { color: string }) {
  return (
    <g>
      <path d="M-22 0 A22 14 0 0 1 22 0 Z" fill={color} />
      <path d="M-22 0 A22 14 0 0 1 -7 -12 L-5 0 Z" fill="rgb(0 0 0 / 0.18)" />
      <path
        d="M-22 0 L0 26 M22 0 L0 26 M-8 0 L0 26 M8 0 L0 26"
        stroke="rgb(232 232 232 / 0.55)"
        strokeWidth={0.8}
      />
      <rect x={-5} y={25} width={10} height={8} fill="#4b5320" stroke="#232810" strokeWidth={1} />
    </g>
  );
}

export default function ModeArt({ mode }: { mode: GameMode }) {
  const spots = CHUTE_SPOTS[mode.squadSize] ?? CHUTE_SPOTS[1];
  const isNight = mode.id === 'night';

  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden="true">
      {isNight && (
        <g>
          <circle cx={168} cy={22} r={10} fill="#f5f0ff" />
          <circle cx={163} cy={19} r={10} fill="#241445" />
          {[
            [20, 15],
            [45, 40],
            [80, 8],
            [130, 12],
            [185, 50],
            [25, 70],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={0.9} fill="#fff" />
          ))}
          <circle cx={60} cy={70} r={22} fill="#ff6b3d" opacity={0.18} />
          <circle cx={60} cy={70} r={3} fill="#ffb38a" />
        </g>
      )}

      <path
        d="M0 120 L0 92 L28 76 L52 90 L84 64 L112 86 L140 70 L170 88 L200 74 L200 120 Z"
        fill="rgb(0 0 0 / 0.35)"
      />
      <path
        d="M0 120 L0 104 L40 94 L80 106 L130 92 L170 104 L200 96 L200 120 Z"
        fill="rgb(0 0 0 / 0.45)"
      />

      {spots.map((spot, index) => (
        <g key={index} transform={`translate(${spot.x} ${spot.y}) scale(${spot.size})`}>
          <g className="chute-bob" style={{ animationDelay: `${index * -0.7}s` }}>
            <Chute color={mode.color} />
          </g>
        </g>
      ))}
    </svg>
  );
}
