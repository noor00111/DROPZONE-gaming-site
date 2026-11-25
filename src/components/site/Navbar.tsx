'use client';

import { useEffect, useState } from 'react';
import { Menu, Volume2, VolumeX, X } from 'lucide-react';
import { audio } from '@/lib/audio/AudioManager';
import { selectMuted, useGameStore } from '@/store/useGameStore';
import { levelFromXp, XP_PER_LEVEL, useProgressStore } from '@/store/useProgressStore';
import { toggleMuteWithClick } from '../hud/MuteToggle';
import Logo from './Logo';

const LINKS = [
  { label: 'Modes', href: '#modes' },
  { label: 'Map', href: '#map' },
  { label: 'Arsenal', href: '#arsenal' },
  { label: 'Operators', href: '#operators' },
  { label: 'Season', href: '#season' },
  { label: 'Challenge', href: '#challenge' },
  { label: 'Debrief', href: '#debrief' },
];

const SHOW_AFTER = 0.6;

export default function Navbar() {
  const [isShown, setIsShown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const muted = useGameStore(selectMuted);
  const xp = useProgressStore((state) => state.xp);
  const level = levelFromXp(xp);
  const levelProgress = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

  useEffect(() => {
    function onScroll() {
      const shouldShow = window.scrollY > window.innerHeight * SHOW_AFTER;
      setIsShown(shouldShow);
      if (!shouldShow) setMenuOpen(false);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  function handleLinkClick() {
    audio.play('ui-click');
    setMenuOpen(false);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 border-b border-line bg-charcoal/85 backdrop-blur-md transition-transform duration-300 ${
        isShown ? 'translate-y-0' : '-translate-y-full'
      }`}
      inert={!isShown}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        <a href="#top" onClick={handleLinkClick} aria-label="Dropzone, back to the top">
          <Logo />
        </a>

        <ul className="hidden items-center gap-6 xl:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={handleLinkClick}
                className="glitch-on-hover text-sm font-semibold tracking-[0.2em] text-text/70 transition-colors hover:text-amber"
              >
                <span className="glitch-text inline-block">{link.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#debrief"
            onClick={handleLinkClick}
            className="hidden h-10 items-center gap-2 border border-line px-3 font-mono text-xs tracking-[0.15em] text-text/80 transition-colors hover:border-amber hover:text-amber sm:flex"
          >
            <span className="text-amber">LVL {level}</span>{' '}
            <span className="text-text/60">{xp} XP</span>
            <span className="sr-only">, open the debrief</span>
          </a>
          <button
            type="button"
            onClick={toggleMuteWithClick}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            className="flex h-10 w-10 cursor-pointer items-center justify-center border border-line text-text/70 transition-colors hover:border-amber hover:text-amber"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <a
            href="#top"
            onClick={handleLinkClick}
            className="glitch-on-hover relative hidden bg-amber px-5 py-2.5 text-sm font-bold tracking-[0.25em] text-charcoal transition-colors hover:bg-text sm:block"
          >
            <span className="glitch-text inline-block">Deploy now</span>
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 cursor-pointer items-center justify-center border border-line transition-colors hover:border-amber hover:text-amber xl:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      <div className="absolute inset-x-0 bottom-0 h-0.5" aria-hidden="true">
        <div
          className="h-full bg-amber shadow-[0_0_8px_var(--c-amber-glow)] transition-[width] duration-500"
          style={{ width: `${levelProgress}%` }}
        />
      </div>

      {menuOpen && (
        <ul id="mobile-menu" className="border-t border-line bg-charcoal px-4 py-4 xl:hidden">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={handleLinkClick}
                className="block py-3 text-lg font-semibold tracking-[0.2em] text-text/80 hover:text-amber"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#top"
              onClick={handleLinkClick}
              className="mt-2 block bg-amber py-3 text-center font-bold tracking-[0.25em] text-charcoal"
            >
              Deploy now
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}
