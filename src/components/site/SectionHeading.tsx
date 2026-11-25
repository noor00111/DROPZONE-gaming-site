type SectionHeadingProps = {
  number: string;
  kicker: string;
  title: string;
  highlight?: string;
  text?: string;
};

export default function SectionHeading({number, kicker, title, highlight, text}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl" data-reveal="heading">
      <p className="hud-label flex items-center gap-3 text-amber">
        <span className="font-mono">{number}</span>
        {kicker}
      </p>
      <h2 className="mt-3 text-4xl leading-none font-bold tracking-[0.04em] sm:text-5xl md:text-6xl">
        {highlight && (
          <span className="chrome-text">
            {title} {highlight}
          </span>
        )}
      </h2>
      {text && (
        <p className="mt-4 text-base font-medium tracking-[0.08em] text-text/60 normal-case sm:text-lg">
          {text}
        </p>
      )}
    </div>
  );
}
