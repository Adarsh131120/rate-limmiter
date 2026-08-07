const ALGORITHMS = [
  {
    name: 'Fixed Window',
    pattern: [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
    verdict: 'Simple, but bursts at window edges',
    detail:
      "Counts requests in a fixed clock window (e.g. 0:00–0:59). Resetting the counter at the boundary means a client can send a full quota at 0:59 and another full quota at 1:00 — twice the intended rate in a two-second span.",
  },
  {
    name: 'Sliding Log',
    pattern: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0],
    verdict: 'Precise, but stores every timestamp',
    detail:
      'Keeps a timestamp per request and counts how many fall in the trailing window. Exact, but memory grows with request volume per key — expensive at high throughput.',
  },
  {
    name: 'Sliding Counter',
    pattern: [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
    verdict: 'Good approximation, one counter per window',
    detail:
      'Weights the previous window\u2019s count by how much it overlaps the current one. Close to sliding-log accuracy at fixed-window memory cost — what most API gateways actually run.',
  },
  {
    name: 'Leaky Bucket',
    pattern: [1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    verdict: 'Smooths output, no burst allowance',
    detail:
      'Requests queue and drain at a constant rate, like a bucket with a fixed-size hole. Great for shaping traffic to a downstream system that hates spikes — but legitimate bursts wait in line too.',
  },
  {
    name: 'Token Bucket',
    pattern: [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0],
    verdict: 'Selected — allows burst, enforces average',
    detail:
      'Tokens accumulate at a steady rate up to a cap; a request spends tokens instead of waiting. Idle time banks capacity for a burst, then the refill rate caps the sustained average. Matches how real client traffic actually behaves.',
    selected: true,
  },
];

function MiniPattern({ pattern }) {
  return (
    <div className="flex h-8 items-end gap-[3px]">
      {pattern.map((v, i) => (
        <span
          key={i}
          className={`w-[6px] rounded-[1px] ${v ? 'bg-amber/70 h-full' : 'bg-line2 h-2'}`}
        />
      ))}
    </div>
  );
}

export default function AlgorithmCompare() {
  return (
    <section id="algorithms" className="border-b hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow mb-3">Panel 01 — algorithm selection</p>
        <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
          Five ways to say &ldquo;slow down&rdquo;
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Rate limiting algorithms trade off memory, precision, and how they
          treat bursts. Each strip below is the same 12-second window of
          client traffic run through a different algorithm.
        </p>

        <div className="mt-10 grid gap-px overflow-hidden rounded-md border hairline bg-line md:grid-cols-1">
          {ALGORITHMS.map((algo) => (
            <div
              key={algo.name}
              className={`grid gap-4 bg-panel px-6 py-5 md:grid-cols-[180px_140px_1fr] md:items-center ${
                algo.selected ? 'ring-1 ring-inset ring-amber/40' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {algo.selected && <span className="h-1.5 w-1.5 rounded-full bg-amber" />}
                <span className={`font-mono text-sm ${algo.selected ? 'text-amber' : 'text-text'}`}>
                  {algo.name}
                </span>
              </div>
              <MiniPattern pattern={algo.pattern} />
              <div>
                <p className={`text-sm font-medium ${algo.selected ? 'text-amber' : 'text-text'}`}>
                  {algo.verdict}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{algo.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
