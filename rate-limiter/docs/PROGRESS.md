# Progress Tracker

Last updated: 2026-08-06 (Grafana + Prometheus Observability Stack Completed & Verified)

> Rule for future sessions: before writing any new code, read this file
> top to bottom. Only work on "Not started" or "In progress" items unless
> the user asks to revisit something marked done.

## ✅ Done
- [x] Project scaffold (`src/`, `test/`, `docker/`, `docs/`) created
- [x] `docs/IMPLEMENTATION_PLAN.md` — phase-to-deliverable map
- [x] Config loader (`src/config/index.js`) — reads all env vars, one source of truth
- [x] Core domain classes: `Bucket`, `RateLimiter`, `TokenRefillStrategy`
- [x] `InMemoryRepository` (Phase 6 prototype, process-local Map)
- [x] `RedisRepository` + `token_bucket.lua` (Phase 10, atomic, production path)
- [x] `RateLimitPolicy` (resolves capacity/refill per user/IP/API-key/endpoint)
- [x] Express middleware (`rateLimitMiddleware.js`) — headers, 429, Retry-After
- [x] Demo routes + `server.js` with health check + graceful shutdown
- [x] `src/utils/logger.js` — structured JSON logger
- [x] `src/utils/metrics.js` — in-process counters, `/metrics` in Prometheus text format
- [x] Dockerfile + docker-compose.yml (app + redis)
- [x] `.env.example`
- [x] Unit tests: bucket refill math, policy resolution
- [x] Integration test: 429 after burst exhausted (using supertest + in-memory backend)
- [x] `docs/ACCOUNTS_AND_CREDENTIALS.md` — what accounts you need, where keys go
- [x] Root `README.md` — quickstart
- [x] Prometheus scrape config (`docker/prometheus/prometheus.yml`)
- [x] Grafana provisioning (auto datasource + auto dashboard loading)
- [x] Grafana dashboard JSON with 9 panels (`docker/grafana/dashboards/rate-limiter.json`)
- [x] Updated `docker-compose.yml` with Prometheus + Grafana services + host scraping fallback (`host.docker.internal:5000`)
- [x] `docs/GRAFANA_SETUP_GUIDE.md` — full setup guide (local Docker, Grafana Cloud, self-hosted)
- [x] Observability Stack verified & running live (Redis + Prometheus + Grafana at `http://localhost:3002`)

## 🟡 In progress / stubbed (functional but minimal)
- [ ] `scripts/load-test.js` — currently a basic autocannon script; not a full k6 suite
- [ ] Tiered limits in `RateLimitPolicy` — data structure exists, only one static tier wired

## ⏳ Not started (explicitly deferred — see IMPLEMENTATION_PLAN.md)
- [ ] `docs/PHASE_NOTES/01_fundamentals.md` through `16_performance.md` — the
      narrative teaching content (problem statement → naive → better →
      trade-offs) for each algorithmic phase. Code works without these;
      they're the "mentor explains it" layer requested in the prompt.
- [ ] `docs/ARCHITECTURE.md` full diagram set (only a text diagram exists so far)
- [ ] `docs/INTERVIEW_NOTES.md` (Phase 18 Q&A)
- [ ] Kubernetes manifests (Deployment/Service/HPA) — optional per original prompt
- [ ] Redis Cluster / Sentinel config examples
- [x] ~~Prometheus scrape config + Grafana dashboard JSON~~ ✅ done
- [ ] CI workflow (GitHub Actions) running tests on push

## How to resume
Tell me: "continue the rate limiter, do X from PROGRESS.md" and I'll pick up
exactly there — no need to re-explain the project.
