import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { RateLimitPolicy } from '../../src/policies/RateLimitPolicy.js';

describe('RateLimitPolicy', () => {
  const policy = new RateLimitPolicy();

  test('falls back to global default for a plain IP identity', () => {
    const resolved = policy.resolve({ identity: { type: 'ip', value: '1.2.3.4' } });
    assert.equal(resolved.scope, 'ip');
    assert.ok(resolved.capacity > 0);
    assert.ok(resolved.refillRatePerSec > 0);
  });

  test('applies tier override for api keys', () => {
    const resolved = policy.resolve({
      identity: { type: 'apiKey', value: 'key123', tier: 'pro' },
    });
    assert.equal(resolved.capacity, 200);
    assert.equal(resolved.refillRatePerSec, 50);
  });

  test('endpoint override wins over tier', () => {
    const resolved = policy.resolve({
      identity: { type: 'apiKey', value: 'key123', tier: 'enterprise' },
      endpoint: '/api/search',
    });
    assert.equal(resolved.capacity, 10);
    assert.equal(resolved.refillRatePerSec, 2);
  });

  test('unknown tier falls back to default, not a crash', () => {
    const resolved = policy.resolve({
      identity: { type: 'apiKey', value: 'key123', tier: 'nonexistent' },
    });
    assert.ok(resolved.capacity > 0);
  });
});
