'use client';

import { ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useProgressStore } from '@/store/useProgressStore';

const SHOW_FOR = 6000;

export default function KillFeed() {
  const feed = useProgressStore((state) => state.feed);
  const dismissFeed = useProgressStore((state) => state.dismissFeed);
  const scheduled = useRef(new Set<number>());

  useEffect(() => {
    for (const item of feed) {
      if (scheduled.current.has(item.id)) continue;
      scheduled.current.add(item.id);
      window.setTimeout(() => dismissFeed(item.id), SHOW_FOR);
    }
  }, [feed, dismissFeed]);

  return (
    <div
      className="pointer-events-none fixed top-20 right-4 z-46 flex w-[min(22rem,calc(100vw-2rem))] flex-col items-end gap-1.5"
      aria-live="polite"
      role="log"
      aria-label="Activity feed"
    >
      {feed.map((item) => (
        <p
          key={item.id}
          className="feed-line rounded-md bg-charcoal/85 px-3 py-1.5 text-xs font-semibold tracking-[0.08em] shadow-lg"
        >
          <span className="text-amber">{item.actor}</span>
          <ChevronRight
            className="mx-1 inline h-3 w-3 align-[-1px] text-text/60"
            aria-hidden="true"
          />
          <span className="tracking-normal text-text/85 normal-case">{item.text}</span>
        </p>
      ))}
    </div>
  );
}
