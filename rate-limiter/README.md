# Distributed Token Bucket Rate Limiter

A production-grade, distributed rate limiter implementation using the **Token Bucket Algorithm**. Built with Node.js, Express, and Redis (via atomic Lua scripts for concurrency safety), with a zero-dependency in-memory fallback for local development.

---

## 🚀 Features

- **Token Bucket Algorithm**: Handles bursty traffic efficiently with configurable capacity and refill rates.
- **Dual Repositories**:
  - **Redis + Lua Script**: Atomic token evaluation for distributed, multi-instance deployments.
  - **In-Memory Store**: Process-local map fallback for rapid local development.
- **Express Middleware**: Seamless request filtering with `X-RateLimit-*` headers and `HTTP 429 Too Many Requests` responses with `Retry-After`.
- **Flexible Identification**: Rate limits per IP, User ID, API Key, or specific HTTP Endpoint.
- **Full Observability**: Integrated Prometheus metrics export (`/metrics`) and pre-configured Grafana dashboards.

---

## 🛠️ Architecture

```text
Client Request
      │
      ▼
Express Application Middleware (rateLimitMiddleware)
      │
      ├───────────────────────────────┐
      ▼                               ▼
RedisRepository (Lua Script)    InMemoryRepository (Dev Mode)
[Production / Distributed]        [Local Single Process]
      │
      ▼
Prometheus (/metrics) ──▶ Grafana Dashboard (Port 3002)
```

---

## 📦 Quickstart

### 1. Local Development (In-Memory Backend)

```bash
# Navigate to rate limiter directory
cd rate-limiter

# Install dependencies
npm install

# Start development server
npm run dev
```
The server will start at `http://localhost:5000`.

---

### 2. Full Observability & Redis Stack (Docker Compose)

Spin up Redis, Prometheus, and Grafana:

```bash
cd docker
docker-compose up -d
```

| Service | Host URL | Description |
|---|---|---|
| **API Server** | `http://localhost:5000` | Express Backend |
| **Prometheus** | `http://localhost:9090` | Metrics Collector |
| **Grafana** | `http://localhost:3002` | Real-time Observability Dashboard (`admin` / `admin`) |

---

## ⚙️ Environment Variables Configuration

Copy `.env.example` to `.env` to adjust default policies and backend:

```ini
NODE_ENV=development
PORT=5000

# Backend: 'memory' (dev) or 'redis' (production)
RATE_LIMIT_BACKEND=memory

# Redis Connection
REDIS_URL=redis://localhost:6379

# Token Bucket Defaults
RATE_LIMIT_CAPACITY=20
RATE_LIMIT_REFILL_PER_SEC=5
RATE_LIMIT_IDENTITY_STRATEGY=ip
```

---

## 📡 Key Endpoints

- `GET /health` — Health check & status endpoint.
- `GET /metrics` — Prometheus metrics export.
- `GET /api/hello` — Public unlimited route example.
- `GET /api/limited` — Rate-limited route example.

---

## 🧪 Running Tests

```bash
npm test
```

---

## 📂 Project Documentation

- **[`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md)** — Architectural roadmap and phase deliverable map.
- **[`docs/PROGRESS.md`](docs/PROGRESS.md)** — Active progress tracking and completed deliverables.
- **[`docs/GRAFANA_SETUP_GUIDE.md`](docs/GRAFANA_SETUP_GUIDE.md)** — Setup guide for Grafana Cloud & local monitoring.
- **[`docs/ACCOUNTS_AND_CREDENTIALS.md`](docs/ACCOUNTS_AND_CREDENTIALS.md)** — Credentials & external integration management.
