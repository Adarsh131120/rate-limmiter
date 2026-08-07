// src/core/RateLimiter.js
//
// Orchestrates "should this request be allowed?" without knowing or caring
// whether state lives in-process (InMemoryRepository) or in Redis
// (RedisRepository). This is Dependency Inversion in practice: RateLimiter
// depends on the BucketRepository *interface* (consume(key, cost, policy)),
// not a concrete implementation. Swapping backends is a one-line config
// change (see src/config/index.js `backend`).

export class RateLimiter {
  /**
   * @param {object} deps
   * @param {{consume: Function}} deps.repository - InMemoryRepository | RedisRepository
   * @param {import('../policies/RateLimitPolicy.js').RateLimitPolicy} deps.policy
   * @param {import('../utils/metrics.js').MetricsCollector} [deps.metrics]
   */
  constructor({ repository, policy, metrics }) {
    if (!repository || typeof repository.consume !== 'function') {
      throw new Error('RateLimiter requires a repository with a consume() method');
    }
    if (!policy) throw new Error('RateLimiter requires a policy');

    this.repository = repository;
    this.policy = policy;
    this.metrics = metrics;
  }

  /**
   * @param {object} request - shape: { identity, endpoint, cost }
   * @returns {Promise<{allowed: boolean, remaining: number, retryAfterSec: number, capacity: number}>}
   */
  async check(request) {
    const { identity, endpoint, cost = 1 } = request;
    const resolved = this.policy.resolve({ identity, endpoint });
    const key = `ratelimit:${resolved.scope}:${identity.value}:${endpoint || 'global'}`;

    const result = await this.repository.consume(key, cost, {
      capacity: resolved.capacity,
      refillRatePerSec: resolved.refillRatePerSec,
    });

    this.metrics?.recordDecision({ allowed: result.allowed, endpoint });

    return { ...result, capacity: resolved.capacity };
  }
}

export default RateLimiter;
