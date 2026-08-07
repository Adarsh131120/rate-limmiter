// src/repositories/InMemoryRepository.js
//
// Phase 6: the naive-but-honest starting point. A plain Map keyed by
// rate-limit key, holding one Bucket per key. Correct and fast for a
// SINGLE process. Breaks the moment you run more than one instance behind
// a load balancer, because each instance has its own independent Map —
// a client could get `capacity` tokens from instance A AND `capacity`
// tokens from instance B. See docs/PHASE_NOTES/08_scaling_problems.md.
//
// Kept in the codebase (not deleted after Redis was added) because:
//   1. It's genuinely useful for local dev / tests (no Redis dependency).
//   2. It's the reference implementation the Lua script's behavior is
//      unit-tested against.

import { Bucket } from '../core/Bucket.js';

export class InMemoryRepository {
  constructor() {
    /** @type {Map<string, Bucket>} */
    this.buckets = new Map();
  }

  /**
   * @param {string} key
   * @param {number} cost
   * @param {{capacity: number, refillRatePerSec: number}} policy
   */
  async consume(key, cost, policy) {
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = new Bucket(policy);
      this.buckets.set(key, bucket);
    }
    // If policy changed at runtime (e.g. tier upgrade), keep it in sync.
    bucket.capacity = policy.capacity;
    bucket.refillRatePerSec = policy.refillRatePerSec;

    return bucket.consume(cost);
  }

  /** Test/ops helper: wipe all state. */
  reset() {
    this.buckets.clear();
  }

  /** Test/ops helper: how many distinct keys are being tracked (memory pressure signal). */
  size() {
    return this.buckets.size;
  }
}

export default InMemoryRepository;
