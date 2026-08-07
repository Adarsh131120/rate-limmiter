'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Mirrors src/core/Bucket.js from the backend exactly (lazy refill,
 * min-capped at capacity) so the visual demo is honest about the algorithm,
 * not just a pretty animation.
 */
export function useTokenBucket({ capacity, refillRatePerSec }) {
  const state = useRef({ tokens: capacity, lastTs: Date.now() });
  const [display, setDisplay] = useState(capacity);
  const [lastEvent, setLastEvent] = useState(null); // {allowed, retryAfterSec, ts}

  const computeCurrent = useCallback(
    (nowMs) => {
      const s = state.current;
      const elapsedSec = Math.max(0, (nowMs - s.lastTs) / 1000);
      const tokensToAdd = elapsedSec * refillRatePerSec;
      return Math.min(capacity, s.tokens + tokensToAdd);
    },
    [capacity, refillRatePerSec]
  );

  // Poll for smooth gauge animation. This is purely a rendering concern —
  // the actual algorithm is still "lazy" (computed on demand in consume()).
  useEffect(() => {
    const id = setInterval(() => {
      setDisplay(computeCurrent(Date.now()));
    }, 80);
    return () => clearInterval(id);
  }, [computeCurrent]);

  // Re-sync when capacity/refillRate change (e.g. slider moved).
  useEffect(() => {
    const now = Date.now();
    const current = Math.min(capacity, computeCurrent(now));
    state.current = { tokens: current, lastTs: now };
    setDisplay(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capacity, refillRatePerSec]);

  const consume = useCallback(
    (cost = 1) => {
      const now = Date.now();
      const current = computeCurrent(now);

      let result;
      if (current >= cost) {
        const remaining = current - cost;
        state.current = { tokens: remaining, lastTs: now };
        result = { allowed: true, remaining, retryAfterSec: 0, ts: now };
      } else {
        const deficit = cost - current;
        const retryAfterSec = Math.ceil(deficit / refillRatePerSec);
        state.current = { tokens: current, lastTs: now };
        result = { allowed: false, remaining: current, retryAfterSec, ts: now };
      }

      setDisplay(state.current.tokens);
      setLastEvent(result);
      return result;
    },
    [computeCurrent, refillRatePerSec]
  );

  const reset = useCallback(() => {
    const now = Date.now();
    state.current = { tokens: capacity, lastTs: now };
    setDisplay(capacity);
    setLastEvent(null);
  }, [capacity]);

  return { tokens: display, capacity, consume, lastEvent, reset };
}
