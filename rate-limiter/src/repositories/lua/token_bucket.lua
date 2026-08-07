-- token_bucket.lua
--
-- Atomic token bucket check-and-consume, executed inside Redis via EVALSHA.
--
-- WHY LUA: without this, "read tokens, compute refill, compare, write back"
-- is 3-4 separate round trips. Two concurrent requests for the same key can
-- both read the same "currentTokens=1" before either writes, and both get
-- allowed — a classic race condition (Phase 10 "race conditions" section).
-- Redis executes a Lua script as a single atomic step: no other command
-- (from any client, any process) can interleave with it. That single
-- property is what makes this correct under concurrency without any
-- distributed lock.
--
-- KEYS[1] = the bucket's Redis key, e.g. "ratelimit:ip:1.2.3.4:/api/orders"
-- ARGV[1] = capacity            (max tokens, burst size)
-- ARGV[2] = refillRatePerSec    (sustained tokens/sec)
-- ARGV[3] = cost                (tokens this request consumes, usually 1)
-- ARGV[4] = now_ms              (client-supplied timestamp, ms epoch)
--
-- Returns: { allowed(0/1), remaining_tokens(floor), retry_after_sec(ceil) }
--
-- Storage shape: a Redis HASH with fields `tokens` and `ts` (last refill ms).
-- TTL is set to roughly "time to refill from empty to full", so idle buckets
-- expire on their own instead of accumulating forever (memory efficiency —
-- Phase 16). This mirrors exactly the math in src/core/Bucket.js; the two
-- are kept in sync and unit-tested for parity.

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])
local now_ms = tonumber(ARGV[4])

local bucket = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(bucket[1])
local last_ts = tonumber(bucket[2])

if tokens == nil then
  -- First time we've seen this key: bucket starts full, exactly like
  -- src/core/Bucket.js's default `currentTokens ?? capacity`.
  tokens = capacity
  last_ts = now_ms
end

-- Lazy refill (same equation as Bucket.js#_refill)
local elapsed_sec = math.max(0, (now_ms - last_ts) / 1000)
local tokens_to_add = elapsed_sec * refill_rate
tokens = math.min(capacity, tokens + tokens_to_add)

local allowed = 0
local retry_after_sec = 0

if tokens >= cost then
  tokens = tokens - cost
  allowed = 1
else
  local deficit = cost - tokens
  retry_after_sec = math.ceil(deficit / refill_rate)
end

-- Persist new state. TTL = time to go from empty to full, +buffer, so a
-- fully-idle bucket's key disappears instead of living in Redis forever
-- (this is the "hot key never expires" memory leak the naive approach has).
local ttl_sec = math.ceil(capacity / refill_rate) + 60

redis.call('HMSET', key, 'tokens', tostring(tokens), 'ts', tostring(now_ms))
redis.call('EXPIRE', key, ttl_sec)

return { allowed, math.floor(tokens), retry_after_sec }
