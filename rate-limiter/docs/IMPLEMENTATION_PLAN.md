# Implementation Plan — Distributed Token Bucket Rate Limiter

This document maps the 18-phase learning roadmap to concrete deliverables in
this repo, so you always know **what exists, what's stubbed, and what's not
started**. Pair this with `PROGRESS.md`, which is the live checklist.

## How to use these two docs
- `IMPLEMENTATION_PLAN.md` (this file) = the *map*. Rarely changes.
- `PROGRESS.md` = the *checklist*. Updated every session — check it first
  when you (or I, in a future session) come back to this project.

---

## Phase → Deliverable Mapping

| Phase | Topic | Where it lives | Status |
|---|---|---|---|
| 1 | Fundamentals (why rate limit, 429, Retry-After) | `docs/PHASE_NOTES/01_fundamentals.md` | ⏳ pending |
| 2 | Algorithm comparison (Fixed/Sliding/Leaky/Token) | `docs/PHASE_NOTES/02_algorithms.md` | ⏳ pending |
| 3 | Token Bucket deep dive + timelines | `docs/PHASE_NOTES/03_token_bucket.md` | ⏳ pending |
| 4 | Mathematical model (refill equation) | `docs/PHASE_NOTES/04_math_model.md` | ⏳ pending |
| 5 | Low-Level Design (class diagram, SOLID) | `docs/ARCHITECTURE.md` | ✅ done (design notes inline in code) |
| 6 | In-memory prototype | `src/repositories/InMemoryRepository.js`, `src/core/*` | ✅ implemented |
| 7 | Express middleware integration | `src/middleware/rateLimitMiddleware.js` | ✅ implemented |
| 8 | Scaling problems (why in-memory breaks) | `docs/PHASE_NOTES/08_scaling_problems.md` | ⏳ pending |
| 9 | Redis internals | `docs/PHASE_NOTES/09_redis_internals.md` | ⏳ pending |
| 10 | Atomic Lua script | `src/repositories/lua/token_bucket.lua` + `RedisRepository.js` | ✅ implemented |
| 11 | Distributed architecture diagrams | `docs/ARCHITECTURE.md` | 🟡 partial (text diagram only) |
| 12 | Production engineering (logging, health, Docker) | `src/utils/logger.js`, `src/server.js`, `docker/*` | ✅ implemented |
| 13 | Testing (unit/integration/load) | `test/unit/*`, `test/integration/*`, `scripts/load-test.js` | 🟡 partial (unit done, load test stub) |
| 14 | Observability (Prometheus/Grafana) | `src/utils/metrics.js`, `docker/prometheus/*`, `docker/grafana/*` | ✅ implemented |
| 15 | Security (X-Forwarded-For, JWT/API-key limits) | `src/middleware/rateLimitMiddleware.js` (key extraction) | 🟡 partial |
| 16 | Performance optimization | `docs/PHASE_NOTES/16_performance.md` | ⏳ pending |
| 17 | Production enhancements (tiers, whitelists, cost-based) | `src/policies/RateLimitPolicy.js` | 🟡 partial (structure in place, tiers not wired) |
| 18 | Interview prep notes | `docs/INTERVIEW_NOTES.md` | ⏳ pending |

Legend: ✅ done · 🟡 partial/stub · ⏳ not started yet

---

## Architecture Summary (Phase 5 / 11)

```
Client
  │
  ▼
API Gateway / Load Balancer   (nginx / cloud LB — not part of this repo)
  │
  ▼
Express instance (N replicas, stateless)
  │  uses RateLimiter (core/RateLimiter.js)
  │  which delegates to a BucketRepository:
  │      - InMemoryRepository   (single-process, dev/demo only)
  │      - RedisRepository      (production, shared state, Lua-atomic)
  ▼
Redis (single node in docker-compose; Cluster/Sentinel in real prod)
```

Key classes (SOLID):
- `RateLimiter` — orchestrates a check-and-consume call; knows nothing about storage.
- `BucketRepository` — interface (duck-typed in JS): `consume(key, cost)`.
- `InMemoryRepository` / `RedisRepository` — interchangeable implementations (Strategy pattern / Dependency Inversion).
- `RateLimitPolicy` — resolves capacity/refillRate for a given request (per-user, per-IP, per-API-key, per-endpoint, tiered).
- `rateLimitMiddleware` — Express glue: extracts identity, calls RateLimiter, sets headers, returns 429.

---

## What's built right now (this session)

1. Full project scaffold with clean module boundaries.
2. Working **in-memory** token bucket (Phase 6).
3. Working **Redis + Lua** atomic token bucket (Phase 9/10) — this is the
   production path.
4. Express middleware wired to either backend via config (Phase 7/15).
5. Dockerfile + docker-compose (app + redis) (Phase 12).
6. Unit tests for the bucket math and Lua script logic (Phase 13, partial).
7. `.env.example` documenting every configurable value.
8. `docs/ACCOUNTS_AND_CREDENTIALS.md` — exactly what external accounts you'd
   need for a *real* deployment and where each secret gets injected.

## What's intentionally left as next steps

See `PROGRESS.md` — the "Not started" section lists remaining phase notes,
Grafana dashboards, k6 load test script, Kubernetes manifests, and the
interview-prep document. These are large enough that generating them well
(not boilerplate) deserves their own focused session — say the word and weeee
pick up from `PROGRESS.md`.
