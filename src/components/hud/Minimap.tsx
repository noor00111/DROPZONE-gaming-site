'use client';

import { ArrowUp } from 'lucide-react';
import { findZone, MAP_SIZE } from '@/data/zones';
import { selectDropZone, useGameStore } from '@/store/useGameStore';
import type { MinimapMarker } from '@/types';

const SQUAD_MARKERS: MinimapMarker[] = [
  { id: 'player', kind: 'player', position: { x: 0.56, y: 0.6 } },
  { id: 'p2', kind: 'squad', position: { x: 0.63, y: 0.56 }, label: '2' },
  { id: 'p3', kind: 'squad', position: { x: 0.5, y: 0.67 }, label: '3' },
];

const ZONE = { x: 0.42, y: 0.42, radius: 0.3 };

function toMap(value: number): number {
  return value * 100;
}

function Marker({ marker }: { marker: MinimapMarker }) {
  const x = toMap(marker.position.x);
  const y = toMap(marker.position.y);

  if (marker.kind === 'player') {
    return (
      <g>
        <circle className="minimap-ping" cx={x} cy={y} r={2} fill="none" stroke="var(--c-amber)" />
        <polygon
          points={`${x},${y - 3.5} ${x + 2.6},${y + 2.5} ${x - 2.6},${y + 2.5}`}
          fill="var(--c-amber)"
        />
      </g>
    );
  }

  if (marker.kind === 'squad') {
    return (
      <g>
        <circle cx={x} cy={y} r={1.8} fill="var(--c-text)" />
        <text x={x + 2.8} y={y + 1.2} fontSize={4} fill="var(--c-text)" opacity={0.7}>
          {marker.label}
        </text>
      </g>
    );
  }

  return (
    <g stroke="var(--c-amber)" strokeWidth={1}>
      <line x1={x - 2.5} y1={y - 2.5} x2={x + 2.5} y2={y + 2.5} />
      <line x1={x + 2.5} y1={y - 2.5} x2={x - 2.5} y2={y + 2.5} />
      <text
        x={x + 4}
        y={y + 1.4}
        fontSize={4}
        fill="var(--c-amber)"
        stroke="none"
        letterSpacing={0.5}
      >
        {marker.label?.toUpperCase()}
      </text>
    </g>
  );
}

export default function Minimap() {

  const zone = findZone(useGameStore(selectDropZone));
  const dropX = zone.x / MAP_SIZE;
  const dropY = zone.y / MAP_SIZE;
  const markers: MinimapMarker[] = [...SQUAD_MARKERS,
    { id: 'drop', kind: 'drop', position: { x: dropX, y: dropY }, label: 'Drop' },
  ];
  const gridLines = [20, 40, 60, 80];

  return (
    <div className="hud-panel brackets p-1.5" data-hud="minimap">
      <svg
        viewBox="0 0 100 100"
        className="block"
        style={{
          width: 'calc(170px * var(--hud-scale))',
          height: 'calc(170px * var(--hud-scale))',
        }}
        role="img"
        aria-label={`Minimap: drop spot ${zone.name}, squad nearby`}
      >
        <rect width={100} height={100} fill="rgb(75 83 32 / 0.25)" />

        <path
          d="M70 8 C 80 14, 92 12, 96 22 C 98 32, 86 34, 78 30 C 70 26, 64 16, 70 8 Z"
          fill="rgb(120 140 140 / 0.25)"
        />
        <path
          d="M78 30 C 70 45, 82 58, 70 72 C 62 82, 66 92, 60 100"
          fill="none"
          stroke="rgb(120 140 140 / 0.35)"
          strokeWidth={2}
        />

        <g fill="none" stroke="rgb(232 232 232 / 0.12)" strokeWidth={0.5}>
          <ellipse cx={24} cy={70} rx={16} ry={10} />
          <ellipse cx={24} cy={70} rx={10} ry={6} />
          <ellipse cx={24} cy={70} rx={4} ry={2.5} />
        </g>

        <g fill="rgb(232 232 232 / 0.25)">
          <rect x={28} y={24} width={4} height={3} />
          <rect x={34} y={28} width={3} height={4} />
          <rect x={58} y={62} width={5} height={3} />
          <rect x={52} y={56} width={3} height={3} />
          <rect x={80} y={80} width={4} height={4} />
        </g>

        <g stroke="rgb(232 232 232 / 0.08)" strokeWidth={0.4}>
          {gridLines.map((value) => (
            <g key={value}>
              <line x1={value} y1={0} x2={value} y2={100} />
              <line x1={0} y1={value} x2={100} y2={value} />
            </g>
          ))}
        </g>

        <circle
          cx={toMap(ZONE.x)}
          cy={toMap(ZONE.y)}
          r={toMap(ZONE.radius)}
          fill="none"
          stroke="var(--c-amber)"
          strokeWidth={0.6}
          strokeDasharray="2 1.5"
          opacity={0.8}
        />

        <line
          x1={toMap(dropX)}
          y1={toMap(dropY)}
          x2={56}
          y2={60}
          stroke="var(--c-text)"
          strokeWidth={0.4}
          strokeDasharray="1 1.5"
          opacity={0.5}
        />

        <g className="radar-sweep">
          <path d="M50 50 L50 0 A50 50 0 0 1 79 9 Z" fill="var(--c-amber)" opacity={0.08} />
          <line
            x1={50}
            y1={50}
            x2={50}
            y2={0}
            stroke="var(--c-amber)"
            strokeWidth={0.4}
            opacity={0.5}
          />
        </g>

        {markers.map((marker) => (
          <Marker key={marker.id} marker={marker} />
        ))}
      </svg>

      <div className="telemetry mt-1 flex justify-between px-0.5">
        <span>Grid D-6</span>
        <span className="inline-flex items-center gap-0.5">
          N <ArrowUp className="h-3 w-3" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
