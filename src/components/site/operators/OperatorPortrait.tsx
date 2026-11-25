import { useId } from 'react';
import type { Operator } from '@/data/operators';

const LEAVES = [
  [58, 78, -40],
  [70, 62, -25],
  [86, 54, -10],
  [100, 50, 0],
  [114, 54, 10],
  [130, 62, 25],
  [142, 78, 40],
  [52, 98, -60],
  [148, 98, 60],
  [48, 120, -75],
  [152, 120, 75],
  [40, 186, -20],
  [56, 176, -10],
  [144, 176, 10],
  [160, 186, 20],
  [30, 206, -30],
  [170, 206, 30],
  [76, 44, -18],
  [124, 44, 18],
  [100, 40, 0],
];

function Headgear({ operator }: { operator: Operator }) {
  const dark = 'rgb(0 0 0 / 0.35)';

  if (operator.gear === 'helmet') {
    return (
      <g>
        <path d="M58 92 C56 50 144 50 142 92 L150 98 L50 98 Z" fill={operator.outfit} />
        <path d="M58 92 C56 50 144 50 142 92 L150 98 L50 98 Z" fill={dark} opacity={0.4} />
        <rect x={92} y={50} width={16} height={12} rx={2} fill="#1a1d1c" />
        <path d="M60 98 L66 140 M140 98 L134 140" stroke="#1a1d1c" strokeWidth={3} />
      </g>
    );
  }
  if (operator.gear === 'cap') {
    return (
      <g>
        <path d="M62 94 C62 60 138 60 138 94 Z" fill={operator.outfit} />
        <path d="M100 92 L162 96 Q168 102 156 104 L100 100 Z" fill={operator.outfit} />
        <path d="M100 92 L162 96 Q168 102 156 104 L100 100 Z" fill={dark} />
        <path d="M64 112 Q58 140 82 146" fill="none" stroke="#1a1d1c" strokeWidth={3} />
        <circle cx={84} cy={146} r={4} fill="#1a1d1c" />
      </g>
    );
  }
  if (operator.gear === 'beret') {
    return (
      <g>
        <path d="M58 92 C50 64 118 48 148 74 C154 84 142 92 128 92 Z" fill={operator.color} />
        <path d="M58 92 C50 64 118 48 148 74 C154 84 142 92 128 92 Z" fill={dark} />
        <circle cx={78} cy={82} r={6} fill="#e8e8e8" />
        <path d="M75 82 L81 82 M78 79 L78 85" stroke={operator.color} strokeWidth={2} />
      </g>
    );
  }
  if (operator.gear === 'hood') {
    return (
      <path
        d="M56 118 C50 74 74 56 100 56 C126 56 150 74 144 118 C140 96 122 80 100 80 C78 80 60 96 56 118 Z"
        fill={operator.outfit}
      />
    );
  }
  return (
    <g>
      <path
        d="M54 104 C44 70 66 46 100 44 C134 46 156 70 146 104 C138 86 120 78 100 78 C80 78 62 86 54 104 Z"
        fill="#4a6122"
      />
      <path d="M62 92 C70 64 130 64 138 92 C126 80 74 80 62 92 Z" fill="#5d7a2c" />
      {LEAVES.map(([x, y, angle]) => (
        <path
          key={`${x}-${y}`}
          d="M0 0 C6 -8 6 -20 0 -28 C-6 -20 -6 -8 0 0 Z"
          transform={`translate(${x} ${y}) rotate(${angle})`}
          fill={y > 150 ? '#4f6127' : '#5d7a2c'}
          stroke="#2f3d15"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}

type OperatorPortraitProps = {
  operator: Operator;
  headOnly?: boolean;
  className?: string;
};

export default function OperatorPortrait({
  operator,
  headOnly = false,
  className = '',
}: OperatorPortraitProps) {
  const visorId = `visor-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const viewBox = headOnly ? '44 46 112 112' : '0 0 200 240';
  const isHooded = operator.gear === 'hood';

  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true">
      <defs>
        <clipPath id={visorId}>
          <rect x={66} y={100} width={68} height={18} rx={9} />
        </clipPath>
      </defs>

      <g className={headOnly ? '' : 'operator-breathe'}>
        {isHooded && (
          <path
            d="M48 140 C38 76 70 50 100 50 C130 50 162 76 152 140 C148 162 128 172 100 172 C72 172 52 162 48 140 Z"
            fill={operator.outfit}
          />
        )}

        <path
          d="M18 240 C22 192 60 172 100 170 C140 172 178 192 182 240 Z"
          fill={operator.outfit}
        />
        <path d="M62 240 L66 188 C80 182 120 182 134 188 L138 240 Z" fill="rgb(0 0 0 / 0.28)" />
        <rect x={74} y={200} width={20} height={16} rx={2} fill="rgb(0 0 0 / 0.3)" />
        <rect x={106} y={200} width={20} height={16} rx={2} fill="rgb(0 0 0 / 0.3)" />
        <circle cx={44} cy={204} r={10} fill={operator.color} />
        {operator.role === 'Medic' && (
          <path d="M44 198 L44 210 M38 204 L50 204" stroke="#fff" strokeWidth={3} />
        )}

        <rect x={86} y={140} width={28} height={36} fill={operator.skin} />
        <rect x={86} y={150} width={28} height={10} fill="rgb(0 0 0 / 0.15)" />
        <ellipse cx={62} cy={114} rx={6} ry={9} fill={operator.skin} />
        <ellipse cx={138} cy={114} rx={6} ry={9} fill={operator.skin} />
        <ellipse cx={100} cy={110} rx={38} ry={44} fill={operator.skin} />

        <rect x={62} y={98} width={76} height={22} rx={11} fill="#111414" />
        <rect x={66} y={100} width={68} height={18} rx={9} fill={operator.visor} opacity={0.85} />
        <g clipPath={`url(#${visorId})`}>
          <rect
            className="visor-glint"
            x={50}
            y={92}
            width={14}
            height={34}
            fill="rgb(255 255 255 / 0.55)"
            transform="skewX(-20)"
          />
        </g>

        <path
          d="M88 136 Q100 142 112 136"
          fill="none"
          stroke="rgb(0 0 0 / 0.45)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        <Headgear operator={operator} />
      </g>
    </svg>
  );
}
