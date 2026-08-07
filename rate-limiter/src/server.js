// src/server.js
//
// Composition root: this is the ONLY file that decides which
// BucketRepository implementation to use, based on config.backend.
// Everything else (RateLimiter, middleware, routes) is written against
// the repository interface and doesn't know or care which one it got.

import express from 'express';
import { pathToFileURL } from 'node:url';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { MetricsCollector } from './utils/metrics.js';
import { RateLimiter } from './core/RateLimiter.js';
import { RateLimitPolicy } from './policies/RateLimitPolicy.js';
import { InMemoryRepository } from './repositories/InMemoryRepository.js';
import { RedisRepository } from './repositories/RedisRepository.js';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware.js';
import { demoRoutes } from './routes/demo.routes.js';

export async function createServer() {
  const app = express();
  app.set('logger', logger);

  // CORS middleware allowing frontend showcase to connect and read headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    res.setHeader('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // trust proxy: only enable if you actually run behind a real proxy/LB
  // that sanitizes X-Forwarded-For (see docs and middleware comments).
  if (config.trustProxy) app.set('trust proxy', true);

  const repository =
    config.backend === 'redis' ? new RedisRepository() : new InMemoryRepository();

  if (repository.connect) await repository.connect();

  const policy = new RateLimitPolicy();
  const metrics = new MetricsCollector();
  const rateLimiter = new RateLimiter({ repository, policy, metrics });

  app.get('/health', (req, res) => res.json({ status: 'ok', backend: config.backend }));
  app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.send(metrics.toPrometheusText());
  });

  app.use(rateLimitMiddleware(rateLimiter));
  app.use(demoRoutes());

  app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

  return { app, repository };
}

async function main() {
  const { app, repository } = await createServer();

  const server = app.listen(config.port, () => {
    logger.info('server_started', { port: config.port, backend: config.backend, env: config.env });
  });

  // Graceful shutdown (Phase 12): stop accepting new connections, drain
  // in-flight requests, close the Redis connection cleanly.
  const shutdown = async (signal) => {
    logger.info('shutdown_initiated', { signal });
    server.close(async () => {
      if (repository.disconnect) await repository.disconnect();
      logger.info('shutdown_complete');
      process.exit(0);
    });
    // Force-exit if graceful shutdown hangs.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Only auto-start when run directly (not when imported by tests).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    logger.error('startup_failed', { message: err.message });
    process.exit(1);
  });
}
