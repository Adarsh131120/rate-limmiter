const LINKS = [
  ['algorithms', 'Algorithms'],
  ['deep-dive', 'Token Bucket'],
  ['architecture', 'Architecture'],
  ['atomicity', 'Atomicity'],
  ['live', 'Live demo'],
  ['status', 'Build status'],
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b hairline bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <a href="#top" className="flex items-center gap-2.5 font-display text-sm font-medium tracking-tight">
          <span className="inline-block h-2 w-2 rounded-full bg-amber animate-pulseDot" />
          token-bucket / rate-limiter
        </a>
        <nav className="hidden gap-6 md:flex">
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="eyebrow hover:text-amber transition-colors">
              {label}
            </a>
          ))}
        </nav>
        <a
          href="https://github.com"
          className="eyebrow rounded-sm border hairline px-3 py-1.5 hover:border-amber hover:text-amber transition-colors"
        >
          Source
        </a>
      </div>
    </header>
  );
}
