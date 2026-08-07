import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Bucket } from '../../src/core/Bucket.js';

describe('Bucket', () => {
  test('starts full and allows a burst up to capacity', () => {
    const bucket = new Bucket({ capacity: 5, refillRatePerSec: 1 });
    for (let i = 0; i < 5; i++) {
      const res = bucket.consume(1);
      assert.equal(res.allowed, true);
    }
    const sixth = bucket.consume(1);
    assert.equal(sixth.allowed, false);
  });

  test('rejects once tokens are exhausted and reports retryAfterSec', () => {
    const bucket = new Bucket({ capacity: 1, refillRatePerSec: 1 });
    assert.equal(bucket.consume(1).allowed, true);
    const rejected = bucket.consume(1);
    assert.equal(rejected.allowed, false);
    // needs 1 more token at 1/sec -> ~1s
    assert.equal(rejected.retryAfterSec, 1);
  });

  test('lazily refills based on elapsed time', () => {
    const start = 1_000_000;
    const bucket = new Bucket({
      capacity: 10,
      refillRatePerSec: 2,
      currentTokens: 0,
      lastRefillTimestamp: start,
    });

    // 3 seconds later, at 2 tokens/sec, should have ~6 tokens.
    const result = bucket.consume(5, start + 3000);
    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 1); // 6 - 5 = 1
  });

  test('never refills above capacity', () => {
    const start = 1_000_000;
    const bucket = new Bucket({
      capacity: 5,
      refillRatePerSec: 100,
      currentTokens: 0,
      lastRefillTimestamp: start,
    });
    // huge elapsed time -> would overflow without the min() cap
    const result = bucket.consume(5, start + 60_000);
    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 0);
  });

  test('rejects invalid construction', () => {
    assert.throws(() => new Bucket({ capacity: 0, refillRatePerSec: 1 }));
    assert.throws(() => new Bucket({ capacity: 1, refillRatePerSec: 0 }));
  });
});
