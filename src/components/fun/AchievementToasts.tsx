'use client';

import { useEffect, useRef } from 'react';
import { Lock, type LucideIcon } from 'lucide-react';
import { findAchievement } from '@/data/achievements';
import { audio } from '@/lib/audio/AudioManager';
import { useProgressStore } from '@/store/useProgressStore';

const SHOW_FOR = 4200;

export function AchievementBadge({
  icon: Icon,
  unlocked,
}: {
  icon: LucideIcon;
  unlocked: boolean;
}) {
  return (
    <span
      className={`achievement-hex flex h-12 w-11 shrink-0 items-center justify-center ${
        unlocked ? 'is-unlocked' : ''
      }`}
    >
      {unlocked ? (
        <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Lock className="h-4 w-4" aria-hidden="true" />
      )}
    </span>
  );
}

export default function AchievementToasts() {
  const toasts = useProgressStore((state) => state.toasts);
  const dismissToast = useProgressStore((state) => state.dismissToast);
  const scheduled = useRef(new Set<number>());

  useEffect(() => {
    for (const toast of toasts) {
      if (scheduled.current.has(toast.id)) continue;
      scheduled.current.add(toast.id);
      audio.play('unlock');
      window.setTimeout(() => dismissToast(toast.id), SHOW_FOR);
    }
  }, [toasts, dismissToast]);

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 z-46 flex flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const achievement = findAchievement(toast.achievementId);
        return (
          <div
            key={toast.id}
            className="toast-in flex items-center gap-3 rounded-xl border border-amber/50 bg-charcoal/95 py-2.5 pr-5 pl-3 shadow-[0_10px_30px_rgb(0_0_0/0.5)]"
          >
            <AchievementBadge icon={achievement.icon} unlocked />
            <div>
              <p className="text-[0.6rem] font-bold tracking-[0.25em] text-amber">
                Achievement unlocked
              </p>
              <p className="text-base leading-tight font-bold tracking-[0.06em]">
                {achievement.name}
              </p>
              <p className="font-mono text-[0.65rem] text-text/60">+{achievement.xp} XP</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
