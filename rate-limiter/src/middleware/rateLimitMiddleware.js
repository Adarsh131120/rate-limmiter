// src/middleware/rateLimitMiddleware.js
//
// The only piece of this project that knows about HTTP. Everything below
// (RateLimiter, repositories, policy) is framework-agnostic on purpose —
// you could reuse it behind Fastify or a raw http.Server.
//
// Responsibilities:
//   1. Determine request identity (API key > authenticated user > IP).
//   2. Call RateLimiter.check().
//   3. Set standard rate-limit headers on every response (allowed or not).
//   4. Short-circuit with 429 + Retry-After when rejected.
//
// Security note (Phase 15): `req.ip` is only trustworthy if you've
// correctly configured Express's `trust proxy` setting AND you actually
// sit behind a proxy/load balancer that sets X-Forwarded-For itself,
// stripping any client-supplied value first. Never trust X-Forwarded-For
// directly from an untrusted client — see config.trustProxy and the note
// in src/config/index.js.

function extractIdentity(req) {
  const apiKey = req.header('x-api-key');
  if (apiKey) {
    return { type: 'apiKey', value: apiKey, tier: req.header('x-api-tier') || 'free' };
  }

  // If you have auth middleware upstream, it would populate req.user.
  if (req.user?.id) {
    return { type: 'user', value: String(req.user.id) };
  }

  // req.ip respects Express's `trust proxy` setting, which we only enable
  // when config.trustProxy is true (see server.js).
  return { type: 'ip', value: req.ip || 'unknown' };
}

/**
 * @param {import('../core/RateLimiter.js').RateLimiter} rateLimiter
 */
export function rateLimitMiddleware(rateLimiter) {
  return async function handler(req, res, next) {
    try {
      const identity = extractIdentity(req);
      const endpoint = req.baseUrl + req.path;

      const result = await rateLimiter.check({ identity, endpoint });

      res.setHeader('X-RateLimit-Limit', result.capacity);
      res.setHeader('X-RateLimit-Remaining', result.remaining);

      if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfterSec);
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Retry after ${result.retryAfterSec}s.`,
          retryAfterSec: result.retryAfterSec,
        });
      }

      return next();
    } catch (err) {
      // Graceful degradation: if the rate limiter itself fails (e.g. Redis
      // is down), the documented, deliberate choice here is "fail open" —
      // let the request through rather than taking the whole API down
      // because of a rate-limiter outage. Log loudly so it's visible.
      req.app?.get('logger')?.error?.('rate_limit_error_fail_open', { message: err.message });
      return next();
    }
  };
}

export default rateLimitMiddleware;
