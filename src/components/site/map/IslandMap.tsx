'use client';

import type { KeyboardEvent } from 'react';
import { MAP_SIZE, ZONES, type Zone } from '@/data/zones';
import type { ZoneId } from '@/types';

const ISLAND = 'M120 90 C220 40 380 52 480 92 C560 124 572 230 540 300 C518 360 560 430 520 500 C480 560 360 572 270 552 C170 530 92 500 70 420 C50 340 92 300 72 230 C56 160 70 116 120 90 Z';

const TREES = [
  [95, 300],
  [110, 318],
  [88, 335],
  [128, 296],
  [140, 320],
  [100, 410],
  [118, 430],
  [140, 415],
  [160, 440],
  [350, 470],
  [370, 450],
  [392, 470],
  [380, 495],
  [520, 260],
  [505, 280],
  [530, 300],
  [240, 110],
  [262, 98],
  [280, 116],
  [410, 520],
  [430, 505],
];

const ROADS = [
  'M190 175 C230 230 260 280 300 330',
  'M300 330 C360 340 420 370 470 400',
  'M300 330 C290 400 285 440 285 490',
  'M125 365 C190 350 240 340 300 330',
  'M190 175 C280 150 380 140 455 150',
];

type IslandMapProps = {
  activeId: ZoneId | null;
  selectedId: ZoneId;
  dropKey: number;
  onHover: (id: ZoneId | null) => void;
  onSelect: (zone: Zone) => void;
};

function Hotspot({
  zone,
  isActive,
  isSelected,
  onHover,
  onSelect,
}: {
  zone: Zone;
  isActive: boolean;
  isSelected: boolean;
  onHover: (id: ZoneId | null) => void;
  onSelect: (zone: Zone) => void;
}) {
  function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(zone);
    }
  }

  const isHot = zone.danger >= 4;
  const dotColor = isSelected ? 'var(--c-amber)' : isHot ? 'var(--c-danger)' : 'var(--c-text)';

  return (
    <g
      transform={`translate(${zone.x} ${zone.y})`}
      role="button"
      tabIndex={0}
      aria-label={`${zone.name}: loot ${zone.loot} of 5, danger ${zone.danger} of 5`}
      aria-pressed={isSelected}
      className="map-hotspot cursor-pointer outline-none"
      onMouseEnter={() => onHover(zone.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(zone.id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(zone)}
      onKeyDown={handleKeyDown}>
      <circle
        r={52}
        fill="var(--c-amber)"
        opacity={isActive || isSelected ? 0.14 : 0}
        className="transition-opacity"
      />
      <circle r={30} fill="transparent" />
      <circle r={9} fill="none" stroke={dotColor} strokeWidth={2} className="zone-ping" />
      <circle
        r={isActive ? 9 : 7}
        fill={dotColor}
        stroke="#0e1110"
        strokeWidth={2.5}
        className="transition-all"
      />

      <g
        className="zone-label"
        data-active={isActive || isSelected}
        transform={`translate(0 ${zone.y > 450 ? -30 : 30})`}>
        <rect
          x={-zone.name.length * 4.6 - 10}
          y={-12}
          width={zone.name.length * 9.2 + 20}
          height={24}
          rx={12}
          fill={isActive || isSelected ? 'var(--c-amber)' : 'rgb(14 17 16 / 0.85)'}
        />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={700}
          letterSpacing={1.2}
          fill={isActive || isSelected ? '#0e1110' : 'var(--c-text)'}>
          {zone.name.toUpperCase()}
        </text>
      </g>
    </g>
  );
}

function DroppedCrate({ zone }: { zone: Zone }) {
  return (
    <g transform={`translate(${zone.x} ${zone.y})`} pointerEvents="none">
      <g className="map-crate-drop">
        <g className="map-crate-chute">
          <path d="M-20 -46 A20 13 0 0 1 20 -46 Z" fill="var(--c-amber)" />
          <path d="M-20 -46 L0 -16 M20 -46 L0 -16 M0 -46 L0 -16" stroke="#e8e8e8" strokeWidth={1} />
        </g>
        <rect
          x={-8}
          y={-17}
          width={16}
          height={12}
          fill="#4b5320"
          stroke="#0e1110"
          strokeWidth={2}
        />
        <rect x={-8} y={-12} width={16} height={2} fill="var(--c-amber)" />
      </g>
    </g>
  );
}

export default function IslandMap({
  activeId,
  selectedId,
  dropKey,
  onHover,
  onSelect,
}: IslandMapProps) {
  const selectedZone = ZONES.find((zone) => zone.id === selectedId) ?? ZONES[0];

  return (
    <svg viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`} className="block h-full w-full" data-island>
      <defs>
        <radialGradient id="sea" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#173236" />
          <stop offset="100%" stopColor="#0b1517" />
        </radialGradient>
        <radialGradient id="land" cx="45%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#5a6428" />
          <stop offset="100%" stopColor="#3c431c" />
        </radialGradient>
      </defs>

      <rect width={MAP_SIZE} height={MAP_SIZE} fill="url(#sea)" />

      <path d={ISLAND} fill="none" stroke="rgb(90 170 170 / 0.08)" strokeWidth={70} />
      <path d={ISLAND} fill="none" stroke="rgb(90 170 170 / 0.12)" strokeWidth={36} />

      <path d={ISLAND} fill="#b59e6a" stroke="#b59e6a" strokeWidth={10} strokeLinejoin="round" />
      <path d={ISLAND} fill="url(#land)" />

      <g fill="none" stroke="rgb(232 232 232 / 0.14)" strokeWidth={1.5}>
        <ellipse cx={190} cy={175} rx={78} ry={56} />
        <ellipse cx={190} cy={175} rx={54} ry={38} />
        <ellipse cx={190} cy={175} rx={30} ry={20} />
      </g>

      <ellipse cx={300} cy={330} rx={44} ry={30} fill="#7d6f4c" opacity={0.6} />
      <ellipse cx={300} cy={330} rx={26} ry={16} fill="#5f5338" opacity={0.7} />

      <path
        d="M360 230 C390 210 430 220 440 250 C450 280 420 300 390 295 C360 290 340 255 360 230 Z"
        fill="#2b5658"
      />
      <path
        d="M435 280 C470 320 500 330 530 330 C548 330 560 350 568 368"
        fill="none"
        stroke="#2b5658"
        strokeWidth={9}
        strokeLinecap="round"
      />

      <g fill="none" stroke="#c9b98a" strokeWidth={3} strokeDasharray="8 7" opacity={0.45}>
        {ROADS.map((road) => (
          <path key={road} d={road} />
        ))}
      </g>

      <g fill="#2a3013">
        {TREES.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={9} />
        ))}
      </g>

      <g fill="rgb(232 232 232 / 0.35)">
        {ZONES.map((zone) => (
          <g key={zone.id}>
            <rect x={zone.x - 26} y={zone.y - 10} width={12} height={9} />
            <rect x={zone.x + 14} y={zone.y - 16} width={10} height={12} />
            <rect x={zone.x + 10} y={zone.y + 8} width={14} height={8} />
          </g>
        ))}
      </g>

      <path
        d="M-10 70 L610 520"
        fill="none"
        stroke="rgb(232 232 232 / 0.25)"
        strokeWidth={2}
        strokeDasharray="10 10"
      />
      <path
        d="M-10 70 L610 520"
        fill="none"
        stroke="var(--c-amber)"
        strokeWidth={2.5}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1}
        data-flight-line
      />

      <DroppedCrate key={`${selectedId}-${dropKey}`} zone={selectedZone} />

      {ZONES.map((zone) => (
        <Hotspot
          key={zone.id}
          zone={zone}
          isActive={activeId === zone.id}
          isSelected={selectedId === zone.id}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </svg>
  );
}
