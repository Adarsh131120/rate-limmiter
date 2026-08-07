'use client';

import { useState } from 'react';
import { useTokenBucket } from '../lib/useTokenBucket';
import BucketGauge from './BucketGauge';

export default function Hero() {
  const bucket = useTokenBucket({ capacity: 10, refillRatePerSec: 2 });
  const [log, setLog] = useState([]);
  const [flash, setFlash] = useState(null);

  const send = () => {
    const result = bucket.consume(1);
    setFlash(result.allowed ? 'allowed' : 'rejected');
    setTimeout(() => setFlash(null), 250);
    setLog((prev) =>
      [
        {
          id: result.ts,
          allowed: result.allowed,
          remaining: result.remaining,
          retryAfterSec: result.retryAfterSec,
        },
        ...prev,
      ].slice(0, 6)
    );
  };

  return (
    <section id="top" className="relative overflow-hidden border-b hairline">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
        <div className="animate-rise">
          <p className="eyebrow mb-5">Distributed rate limiting · systems design walkthrough</p>
          <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-tight md:text-[3.4rem]">
            Every request spends
            <br />
            <span className="text-amber">a token.</span> The bucket
            <br />
            decides who waits.
          </h1>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted">
            This is a live walkthrough of a production-grade distributed token
            bucket rate limiter — built with Express, Redis, and an atomic Lua
            script. Scroll through the algorithm, the math, the race
            condition it solves, and the architecture that ships it. Or just
            hammer the button on the right until it says no.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#deep-dive"
              className="rounded-sm bg-amber px-5 py-2.5 font-mono text-sm font-medium text-ink transition hover:bg-amber-soft"
            >
              Walk through the algorithm →
            </a>
            <a href="#live" className="eyebrow hover:text-amber transition-colors">
              Connect to the real API
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-self-center">
          <div className="panel flex flex-col items-center gap-5 px-8 py-8">
            <p className="eyebrow self-start">PANEL — /api/hello</p>
            <BucketGauge tokens={bucket.tokens} capacity={bucket.capacity} size={200} flash={flash} />
            <button
              onClick={send}
              className="w-full rounded-sm border hairline bg-panel2 px-5 py-2.5 font-mono text-sm transition hover:border-amber hover:text-amber"
            >
              send request →
            </button>
            <p className="eyebrow self-start">capacity 10 · refill 2 tok/s</p>

            <div className="w-full space-y-1.5 border-t hairline pt-4">
              {log.length === 0 && (
                <p className="font-mono text-xs text-muted">awaiting first request…</p>
              )}
              {log.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between font-mono text-xs"
                >
                  <span className={entry.allowed ? 'text-teal' : 'text-red'}>
                    {entry.allowed ? '200 allowed' : '429 rejected'}
                  </span>
                  <span className="text-muted">
                    {entry.allowed
                      ? `remaining ${Math.floor(entry.remaining)}`
                      : `retry-after ${entry.retryAfterSec}s`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
