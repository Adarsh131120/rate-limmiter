// src/config/index.js
//
// Single source of truth for configuration. Every other module imports
// FROM here, never reads process.env directly. This makes it trivial to
// see every secret/tunable in one place (matches docs/ACCOUNTS_AND_CREDENTIALS.md).

import 'dotenv/config';

function toInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 3000),

  // Which storage backend the RateLimiter uses.
  // 'memory' -> single-process only, for local dev/demo (Phase 6)
  // 'redis'  -> distributed, production-correct (Phase 9/10)
  backend: process.env.RATE_LIMIT_BACKEND || 'memory',

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    connectTimeoutMs: toInt(process.env.REDIS_CONNECT_TIMEOUT_MS, 5000),
  },

  // Default token bucket policy, used when no more specific policy matches.
  // Overridable per-route/per-tier via RateLimitPolicy.
  defaultBucket: {
    capacity: toInt(process.env.RATE_LIMIT_CAPACITY, 20), // max burst
    refillRatePerSec: toInt(process.env.RATE_LIMIT_REFILL_PER_SEC, 5), // sustained rate
  },

  // How to identify a client when no API key / auth is present.
  // 'ip' | 'user' | 'apiKey'
  identityStrategy: process.env.RATE_LIMIT_IDENTITY_STRATEGY || 'ip',

  // Trust X-Forwarded-For only if you actually sit behind a known proxy/LB.
  // Blindly trusting it lets clients spoof their rate-limit identity (Phase 15).
  trustProxy: process.env.TRUST_PROXY === 'true',

  logLevel: process.env.LOG_LEVEL || 'info',
};

export default config;
