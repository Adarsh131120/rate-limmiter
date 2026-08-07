// src/core/Bucket.js
//
// Pure domain object: the token bucket algorithm itself, with zero I/O.
// This is what Phase 3/4 (deep dive + math model) is about. Kept separate
// from storage so the exact same math is used by both the in-memory
// repository AND is mirrored line-for-line in the Lua script for Redis
// (see src/repositories/lua/token_bucket.lua) — this class is also the
// spec the Lua script must match, and unit tests assert both agree.
//
// Refill equation:
//   elapsed = now - lastRefillTimestamp
//   tokensToAdd = elapsed * refillRatePerSec
//   currentTokens = min(capacity, currentTokens + tokensToAdd)
//   lastRefillTimestamp = now
//
// "Lazy refill": we never run a background timer to top up every bucket.
// Instead we compute how many tokens *should* have accumulated only when
// a request actually arrives. This is O(1) per request and needs zero
// idle-bucket bookkeeping — critical when you have millions of distinct
// keys (users/IPs) and most are idle most of the time.

export class Bucket {
  /**
   * @param {object} opts
   * @param {number} opts.capacity - max tokens the bucket can hold (burst size)
   * @param {number} opts.refillRatePerSec - tokens added per second (sustained rate)
   * @param {number} [opts.currentTokens] - starting tokens, defaults to full
   * @param {number} [opts.lastRefillTimestamp] - ms epoch, defaults to now
   */
  constructor({ capacity, refillRatePerSec, currentTokens, lastRefillTimestamp }) {
    if (capacity <= 0) throw new Error('capacity must be > 0');
    if (refillRatePerSec <= 0) throw new Error('refillRatePerSec must be > 0');

    this.capacity = capacity;
    this.refillRatePerSec = refillRatePerSec;
    this.currentTokens = currentTokens ?? capacity;
    this.lastRefillTimestamp = lastRefillTimestamp ?? Date.now();
  }

  /** Refill based on elapsed wall-clock time. Mutates and returns this. */
  _refill(nowMs) {
    const elapsedSec = Math.max(0, (nowMs - this.lastRefillTimestamp) / 1000);
    const tokensToAdd = elapsedSec * this.refillRatePerSec;
    this.currentTokens = Math.min(this.capacity, this.currentTokens + tokensToAdd);
    this.lastRefillTimestamp = nowMs;
    return this;
  }

  /**
   * Attempt to consume `cost` tokens (default 1). Refills lazily first.
   * @returns {{allowed: boolean, remaining: number, retryAfterSec: number}}
   */
  consume(cost = 1, nowMs = Date.now()) {
    this._refill(nowMs);

    if (this.currentTokens >= cost) {
      this.currentTokens -= cost;
      return { allowed: true, remaining: Math.floor(this.currentTokens), retryAfterSec: 0 };
    }

    const deficit = cost - this.currentTokens;
    const retryAfterSec = deficit / this.refillRatePerSec;
    return {
      allowed: false,
      remaining: Math.floor(this.currentTokens),
      retryAfterSec: Math.ceil(retryAfterSec),
    };
  }

  toJSON() {
    return {
      capacity: this.capacity,
      refillRatePerSec: this.refillRatePerSec,
      currentTokens: this.currentTokens,
      lastRefillTimestamp: this.lastRefillTimestamp,
    };
  }
}

export default Bucket;
