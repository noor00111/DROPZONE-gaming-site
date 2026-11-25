'use client';

import { selectSquad, useGameStore } from '@/store/useGameStore';
import type { SquadMember } from '@/types';

function getBarColor(member: SquadMember): string {
  if (member.status !== 'alive') return 'bg-danger';
  if (member.isPlayer) return 'bg-amber';
  return 'bg-text/80';
}

export default function SquadList() {
  const squad = useGameStore(selectSquad);

  return (
    <div className="hud-panel brackets w-52" data-hud="squad">
      <p className="hud-label mb-1.5">Squad</p>

      <ul className="space-y-1.5">
        {squad.map((member, index) => {
          const isDown = member.status !== 'alive';

          return (
            <li key={member.id} className="flex items-center gap-2">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center font-mono text-[0.6rem] ${
                  member.isPlayer ? 'bg-amber text-charcoal' : 'border border-line text-text/70'
                }`}
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className={isDown ? 'text-text/60 line-through' : 'text-text'}>
                    {member.callsign}
                  </span>
                  {isDown && <span className="text-danger">Down</span>}
                </div>

                <div className="mt-0.5 h-1 w-full bg-line">
                  <div
                    className={`h-full transition-[width] duration-300 ${getBarColor(member)}`}
                    style={{ width: `${member.health}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
