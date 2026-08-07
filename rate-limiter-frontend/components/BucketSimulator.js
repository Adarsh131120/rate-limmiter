'use client';

import { useState } from 'react';
import { useTokenBucket } from '../lib/useTokenBucket';
import BucketGauge from './BucketGauge';

export default function BucketSimulator() {
  const [capacity, setCapacity] = useState(15);
  const [refillRate, setRefillRate] = useState(3);
  const bucket = useTokenBucket({ capacity, refillRatePerSec: refillRate });
  const [flash, setFlash] = useState(null);
  const [last, setLast] = useState(null);

  const send = (cost = 1) => {
    const result = bucket.consume(cost);
    setLast(result);
    setFlash(result.allowed ? 'allowed' : 'rejected');
    setTimeout(() => setFlash(null), 250);
  };

  return (
    <section id="deep-dive" className="border-b hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow mb-3">Panel 02 — the algorithm, live</p>
        <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
          Capacity is your burst. Refill rate is your average.
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Move the sliders, then send requests. The bucket refills lazily —
          it only computes elapsed time when a request actually arrives, so
          idle buckets cost nothing to track. That&rsquo;s the same equation
          running in{' '}
          <code className="rounded-sm bg-panel2 px-1 py-0.5 font-mono text-[13px] text-amber">
            src/core/Bucket.js
          </code>{' '}
          on the backend.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-[1fr_auto_1fr]">
          {/* controls */}
          <div className="panel space-y-7 px-7 py-7">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="eyebrow">capacity (burst size)</label>
                <span className="font-mono text-sm text-amber">{capacity}</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full accent-amber"
              />
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Max tokens the bucket can hold — how many requests a client
                can fire back-to-back before waiting.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="eyebrow">refill rate (tokens / sec)</label>
                <span className="font-mono text-sm text-amber">{refillRate}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={refillRate}
                onChange={(e) => setRefillRate(Number(e.target.value))}
                className="w-full accent-amber"
              />
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Sustained rate a client can maintain forever once burst
                capacity is spent.
              </p>
            </div>

            <div className="border-t hairline pt-5">
              <div className="flex gap-3">
                <button
                  onClick={() => send(1)}
                  className="flex-1 rounded-sm border hairline bg-panel2 px-4 py-2.5 font-mono text-sm transition hover:border-amber hover:text-amber"
                >
                  consume(1)
                </button>
                <button
                  onClick={() => send(5)}
                  className="flex-1 rounded-sm border hairline bg-panel2 px-4 py-2.5 font-mono text-sm transition hover:border-amber hover:text-amber"
                >
                  consume(5)
                </button>
                <button
                  onClick={bucket.reset}
                  className="rounded-sm border hairline px-4 py-2.5 font-mono text-sm text-muted transition hover:border-line2 hover:text-text"
                >
                  reset
                </button>
              </div>
            </div>
          </div>

          {/* gauge */}
          <div className="flex flex-col items-center justify-center gap-4">
            <BucketGauge tokens={bucket.tokens} capacity={capacity} size={180} flash={flash} />
          </div>

          {/* live math */}
          <div className="panel px-7 py-7">
            <p className="eyebrow mb-4">refill equation</p>
            <div className="code-block space-y-1 rounded-sm bg-panel2 p-4">
              <div><span className="tok-com">// on every consume() call</span></div>
              <div><span className="tok-kw">elapsed</span> = now - lastRefillTs</div>
              <div><span className="tok-kw">toAdd</span> = elapsed * refillRate</div>
              <div><span className="tok-kw">tokens</span> = min(capacity, tokens + toAdd)</div>
            </div>

            <p className="eyebrow mb-3 mt-6">last event</p>
            {last ? (
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">result</span>
                  <span className={last.allowed ? 'text-teal' : 'text-red'}>
                    {last.allowed ? '200 allowed' : '429 rejected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">remaining</span>
                  <span>{Math.floor(last.remaining)}</span>
                </div>
                {!last.allowed && (
                  <div className="flex justify-between">
                    <span className="text-muted">retry-after</span>
                    <span className="text-red">{last.retryAfterSec}s</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-mono text-xs text-muted">no requests sent yet</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
