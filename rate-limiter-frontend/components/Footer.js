export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-sm font-medium">token-bucket / rate-limiter</p>
          <p className="mt-1 text-[13px] text-muted">
            Express · Redis · Lua — backend in{' '}
            <code className="rounded-sm bg-panel2 px-1 py-0.5 font-mono text-[12px] text-amber">
              /rate-limiter
            </code>
            , this showcase in{' '}
            <code className="rounded-sm bg-panel2 px-1 py-0.5 font-mono text-[12px] text-amber">
              /rate-limiter-frontend
            </code>
          </p>
        </div>
        <p className="eyebrow">built to be read, not just run</p>
      </div>
    </footer>
  );
}
