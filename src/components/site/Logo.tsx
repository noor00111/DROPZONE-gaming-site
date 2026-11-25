export default function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="h-7 w-7 text-amber" fill="none" aria-hidden="true">
        <path d="M3 14 A13 10 0 0 1 29 14 Z" fill="currentColor" />
        <path
          d="M3 14 L16 25 M29 14 L16 25 M16 14 L16 25"
          stroke="currentColor"
          strokeWidth={1.2}
        />
        <rect x={12.5} y={24} width={7} height={6} fill="var(--c-text)" />
      </svg>
      <span className="text-xl font-bold tracking-[0.12em]">
        <span className="text-amber">Dropzone</span>
      </span>
    </span>
  );
}
