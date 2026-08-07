// src/repositories/RedisRepository.js
//
// Production-correct, distributed implementation of BucketRepository.
// Every app instance (behind the load balancer) points at the SAME Redis,
// so token state is shared cluster-wide — this is what fixes the Phase 8
// scaling problem the InMemoryRepository has.
//
// Uses EVAL with script caching (Redis SCRIPT LOAD -> EVALSHA) rather than
// calling EVAL every time: EVALSHA sends only a 40-char SHA1 instead of the
// full script body over the wire on every single request, which matters at
// millions-of-requests-per-minute scale (Phase 16 optimization).

import { createClient } from 'redis';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LUA_SCRIPT = readFileSync(join(__dirname, 'lua', 'token_bucket.lua'), 'utf8');

export class RedisRepository {
  constructor({ url } = {}) {
    this.client = createClient({ url: url || config.redis.url });
    this.scriptSha = null;
    this._connected = false;

    this.client.on('error', (err) => logger.error('redis_error', { message: err.message }));
  }

  async connect() {
    if (this._connected) return;
    await this.client.connect();
    // SCRIPT LOAD caches the script server-side and returns its SHA1.
    // If Redis ever evicts it (e.g. after a restart/FLUSHALL of scripts),
    // Redis returns a NOSCRIPT error and we reload+retry once (see consume()).
    this.scriptSha = await this.client.scriptLoad(LUA_SCRIPT);
    this._connected = true;
    logger.info('redis_connected', { sha: this.scriptSha });
  }

  async disconnect() {
    if (this._connected) {
      await this.client.quit();
      this._connected = false;
    }
  }

  /**
   * @param {string} key
   * @param {number} cost
   * @param {{capacity: number, refillRatePerSec: number}} policy
   */
  async consume(key, cost, policy) {
    if (!this._connected) await this.connect();

    const now = Date.now();
    const args = [String(policy.capacity), String(policy.refillRatePerSec), String(cost), String(now)];

    let raw;
    try {
      raw = await this.client.evalSha(this.scriptSha, { keys: [key], arguments: args });
    } catch (err) {
      // NOSCRIPT: the script was evicted from Redis's cache (rare, e.g.
      // after a Redis restart). Reload once and retry rather than failing
      // the request outright.
      if (String(err.message).includes('NOSCRIPT')) {
        this.scriptSha = await this.client.scriptLoad(LUA_SCRIPT);
        raw = await this.client.evalSha(this.scriptSha, { keys: [key], arguments: args });
      } else {
        throw err;
      }
    }

    const [allowed, remaining, retryAfterSec] = raw;
    return {
      allowed: allowed === 1,
      remaining: Number(remaining),
      retryAfterSec: Number(retryAfterSec),
    };
  }
}

export default RedisRepository;
