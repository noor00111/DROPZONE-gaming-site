'use client';

export default function Title() {
  return (
    <div>
      <p className="hud-label text-amber" data-intro="title-kicker">
        <span className="mr-2 inline-block h-2 w-6 align-middle hazard" />
        Operation
      </p>

      <p
        className="text-amber mt-1 text-5xl leading-[0.9] font-bold tracking-[0.04em] md:text-7xl lg:text-8xl"
        data-intro="title-main">
        Dropzone
      </p>

      <p className="mt-3 text-sm font-medium tracking-[0.25em] text-text/70 md:text-base"
        data-intro="title-sub">
        Squad deployment // Sector 7
      </p>

      <div className="telemetry mt-4 hidden space-y-0.5 md:block" data-intro="title-telemetry">
        <p>LAT 42.1186 · LON -71.4512</p>
        <p>ALT 3,200 M · WIND 12 KT NE</p>
      </div>
    </div>
  );
}
