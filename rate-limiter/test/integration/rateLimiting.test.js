import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.RATE_LIMIT_BACKEND = 'memory';
process.env.RATE_LIMIT_CAPACITY = '3';
process.env.RATE_LIMIT_REFILL_PER_SEC = '1';

describe('rate limit middleware (integration, in-memory backend)', () => {
  let app;

  before(async () => {
    const { createServer } = await import('../../src/server.js');
    ({ app } = await createServer());
  });

  test('allows requests within capacity, then returns 429 with headers', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get('/api/hello');
      assert.equal(res.status, 200);
      assert.ok(res.headers['x-ratelimit-limit']);
      assert.ok(res.headers['x-ratelimit-remaining'] !== undefined);
    }

    const rejected = await request(app).get('/api/hello');
    assert.equal(rejected.status, 429);
    assert.ok(rejected.headers['retry-after']);
    assert.equal(rejected.body.error, 'Too Many Requests');
  });

  test('health check is not rate limited (mounted before middleware)', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  test('different identities (different API keys) get independent buckets', async () => {
    const res1 = await request(app).get('/api/hello').set('x-api-key', 'client-A');
    const res2 = await request(app).get('/api/hello').set('x-api-key', 'client-B');
    assert.equal(res1.status, 200);
    assert.equal(res2.status, 200);
  });
});
