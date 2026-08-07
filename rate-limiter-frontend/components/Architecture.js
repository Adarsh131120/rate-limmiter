const NODES = [
  { label: 'Client', sub: 'browser / mobile / service' },
  { label: 'API Gateway / LB', sub: 'routes to N stateless instances' },
  { label: 'Express instance × N', sub: 'rateLimitMiddleware.js', highlight: true },
  { label: 'Redis', sub: 'shared bucket state, single source of truth', highlight: true },
  { label: 'Business services', sub: 'only reached if allowed' },
];

export default function Architecture() {
  return (
    <section id="architecture" className="border-b hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow mb-3">Panel 03 — distributed architecture</p>
        <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
          Why the bucket has to live in Redis
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          An in-memory bucket is correct on one process and wrong on two.
          Run three API instances behind a load balancer with per-process
          state, and a client can get a full quota from each instance — 3×
          the intended rate. Every instance has to check the same bucket, so
          the bucket moves to shared storage.
        </p>

        <div className="mt-12 flex flex-col items-stretch gap-0 md:flex-row md:items-center">
          {NODES.map((node, i) => (
            <div key={node.label} className="flex flex-1 items-center">
              <div
                className={`w-full rounded-md border px-5 py-4 text-center ${
                  node.highlight ? 'border-amber/50 bg-amber/[0.06]' : 'hairline bg-panel'
                }`}
              >
                <p className={`font-mono text-sm ${node.highlight ? 'text-amber' : 'text-text'}`}>
                  {node.label}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-muted">{node.sub}</p>
              </div>
              {i < NODES.length - 1 && (
                <div className="mx-2 hidden text-line2 md:block md:mx-3">→</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <FailureNote
            title="Instance dies mid-request"
            body="Stateless by design — the load balancer routes around it. No bucket state was ever local to that instance, so nothing is lost."
          />
          <FailureNote
            title="Redis is briefly unreachable"
            body="Middleware fails open (see rateLimitMiddleware.js) — requests pass through unthrottled rather than taking the whole API down for a rate-limiter outage. Logged loudly."
          />
          <FailureNote
            title="A key gets hot"
            body="One Redis key, one HASH, one Lua call per request — cheap. At extreme scale, Redis Cluster shards buckets across nodes by key hash (deferred — see build status)."
          />
        </div>
      </div>
    </section>
  );
}

function FailureNote({ title, body }) {
  return (
    <div className="panel px-5 py-5">
      <p className="font-mono text-[13px] text-amber">{title}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}
