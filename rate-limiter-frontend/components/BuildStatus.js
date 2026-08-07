const ROWS = [
  { phase: '05–07', item: 'Core domain, in-memory prototype, Express middleware', state: 'done' },
  { phase: '09–10', item: 'Redis repository + atomic Lua script', state: 'done' },
  { phase: '12', item: 'Docker, docker-compose, structured logging, graceful shutdown', state: 'done' },
  { phase: '13', item: 'Unit + integration tests (12 passing)', state: 'done' },
  { phase: '13', item: 'Load test suite — currently a fetch-based stub, not full k6', state: 'partial' },
  { phase: '14', item: 'Metrics collector + /metrics endpoint — no Grafana dashboard yet', state: 'partial' },
  { phase: '15', item: 'Identity extraction (API key / user / IP) — JWT-based limits not wired', state: 'partial' },
  { phase: '17', item: 'Tier-based policy resolver — only one static tier map, no admin overrides', state: 'partial' },
  { phase: '01–04, 08, 16', item: 'Narrative phase-note docs (fundamentals, math model, scaling problems)', state: 'pending' },
  { phase: '11', item: 'Full architecture diagram set — text diagram only so far', state: 'pending' },
  { phase: '18', item: 'Interview prep Q&A document', state: 'pending' },
  { phase: '—', item: 'Kubernetes manifests', state: 'pending' },
];

const DOT = { done: 'bg-teal', partial: 'bg-amber', pending: 'bg-line2' };
const LABEL = { done: 'done', partial: 'partial', pending: 'pending' };
const TEXT = { done: 'text-teal', partial: 'text-amber', pending: 'text-muted' };

export default function BuildStatus() {
  return (
    <section id="status" className="border-b hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow mb-3">Panel 06 — where this actually stands</p>
        <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
          Build status, not a highlight reel
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          This mirrors <code className="rounded-sm bg-panel2 px-1 py-0.5 font-mono text-[13px] text-amber">docs/PROGRESS.md</code> in
          the backend repo. Everything marked <span className="text-teal">done</span> is implemented and tested; nothing here is aspirational.
        </p>

        <div className="mt-8 overflow-hidden rounded-md border hairline">
          <div className="grid grid-cols-[70px_1fr_90px] gap-4 border-b hairline bg-panel2 px-5 py-2.5">
            <span className="eyebrow">phase</span>
            <span className="eyebrow">deliverable</span>
            <span className="eyebrow text-right">state</span>
          </div>
          {ROWS.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[70px_1fr_90px] items-center gap-4 border-b hairline bg-panel px-5 py-3 last:border-b-0"
            >
              <span className="font-mono text-xs text-muted">{row.phase}</span>
              <span className="text-[13px] leading-relaxed">{row.item}</span>
              <span className={`flex items-center justify-end gap-2 font-mono text-xs ${TEXT[row.state]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${DOT[row.state]}`} />
                {LABEL[row.state]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
