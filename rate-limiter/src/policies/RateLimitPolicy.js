// src/policies/RateLimitPolicy.js
//
// Decides WHICH capacity/refillRate applies to a given request. Kept
// separate from RateLimiter so new limiting strategies (tiers, endpoint
// overrides, whitelists) are additions here, not changes to the core
// consume-a-token logic (Open/Closed Principle).
//
// Resolution order (first match wins):
//   1. Explicit per-endpoint override
//   2. Per-tier override (if identity carries a tier, e.g. from an API key)
//   3. Global default (src/config/index.js `defaultBucket`)
//
// Phase 17 (tiers, whitelists, cost-based consumption) hooks in here.
// Only a single static tier map is wired right now — see docs/PROGRESS.md.

import { config } from '../config/index.js';

const TIERS = {
  free: { capacity: 20, refillRatePerSec: 5 },
  pro: { capacity: 200, refillRatePerSec: 50 },
  enterprise: { capacity: 2000, refillRatePerSec: 500 },
};

// Example endpoint-specific overrides: expensive endpoints get a tighter
// budget regardless of tier (Phase 17 "cost-based consumption" starting point).
const ENDPOINT_OVERRIDES = {
  '/api/search': { capacity: 10, refillRatePerSec: 2 },
};

export class RateLimitPolicy {
  /**
   * @param {object} params
   * @param {{value: string, type: 'ip'|'user'|'apiKey', tier?: string}} params.identity
   * @param {string} [params.endpoint]
   */
  resolve({ identity, endpoint }) {
    if (endpoint && ENDPOINT_OVERRIDES[endpoint]) {
      return { scope: identity.type, ...ENDPOINT_OVERRIDES[endpoint] };
    }

    if (identity.tier && TIERS[identity.tier]) {
      return { scope: identity.type, ...TIERS[identity.tier] };
    }

    return {
      scope: identity.type,
      capacity: config.defaultBucket.capacity,
      refillRatePerSec: config.defaultBucket.refillRatePerSec,
    };
  }
}

export default RateLimitPolicy;
