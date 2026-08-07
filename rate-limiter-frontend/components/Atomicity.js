'use client';

import { useState } from 'react';

export default function Atomicity() {
  const [raced, setRaced] = useState(false);

  return (
    <section id="atomicity" className="border-b hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow mb-3">Panel 04 — atomicity</p>
        <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
          Two requests, one token, a race
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Read-then-write across separate Redis calls has a gap. Two
          concurrent requests can both read{' '}
          <code className="rounded-sm bg-panel2 px-1 py-0.5 font-mono text-[13px] text-amber">
            tokens = 1
          </code>{' '}
          before either writes back — both get allowed. Click through it:
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="panel px-6 py-6">
            <p className="eyebrow mb-4">
              {raced ? 'GET → compute → SET, two clients' : 'GET → compute → SET, one client'}
            </p>
            <div className="code-block space-y-1.5 rounded-sm bg-panel2 p-4">
              <TimelineRow t="t0" a="GET tokens → 1" b={raced ? 'GET tokens → 1' : null} />
              <TimelineRow t="t1" a="compute: 1 ≥ 1 ✓" b={raced ? 'compute: 1 ≥ 1 ✓' : null} />
              <TimelineRow t="t2" a="SET tokens = 0" b={raced ? 'SET tokens = 0' : null} />
              <div className="pt-2 font-mono text-xs">
                {raced ? (
                  <span className="text-red">
                    result: BOTH requests allowed — capacity of 1 let 2 through
                  </span>
                ) : (
                  <span className="text-teal">result: 1 request allowed, as intended</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setRaced((r) => !r)}
              className="mt-5 rounded-sm border hairline bg-panel2 px-4 py-2 font-mono text-xs transition hover:border-amber hover:text-amber"
            >
              {raced ? '← show single client' : 'add a concurrent client →'}
            </button>
          </div>

          <div className="panel px-6 py-6">
            <p className="eyebrow mb-4">the fix — src/repositories/lua/token_bucket.lua</p>
            <pre className="code-block rounded-sm bg-panel2 p-4">
{`-- Redis runs this whole script as ONE atomic step.
-- No other command, from any client, can interleave.

local bucket = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(bucket[1]) or capacity

`}<span className="tok-com">{`-- lazy refill, same equation as Bucket.js`}</span>{`
local elapsed = math.max(0, (now_ms - last_ts) / 1000)
tokens = math.min(capacity, tokens + elapsed * refill_rate)

if tokens >= cost then
  tokens = tokens - cost
  `}<span className="tok-kw">allowed</span>{` = 1
end

redis.call('HMSET', key, 'tokens', tokens, 'ts', now_ms)
`}
            </pre>
            <p className="mt-4 text-[13px] leading-relaxed text-muted">
              Loaded once via <span className="text-text">SCRIPT LOAD</span>, invoked per
              request via <span className="text-text">EVALSHA</span> — a 40-byte hash instead
              of resending the script body on every call.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineRow({ t, a, b }) {
  return (
    <div className="grid grid-cols-[32px_1fr_1fr] gap-3 text-xs">
      <span className="text-muted">{t}</span>
      <span className="text-text">{a}</span>
      <span className={b ? 'text-red' : 'text-line2'}>{b || '—'}</span>
    </div>
  );
}
