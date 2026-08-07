# Grafana + Prometheus Setup Guide

This guide walks you through setting up observability for the Distributed Token
Bucket Rate Limiter — both locally (no accounts needed) and on Grafana Cloud
(free tier, requires registration).

---

## Option A: Local Setup (Docker) — No Accounts Needed

This is the fastest path. Everything runs on your machine via Docker.

### Prerequisites

| Tool | Why | Install |
|------|-----|---------|
| **Docker Desktop** | Runs Redis, Prometheus, Grafana as containers | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| **Node.js ≥ 20** | Runs the rate limiter app | [nodejs.org](https://nodejs.org) |

### Step-by-step

```bash
# 1. Clone the repo (if you haven't already)
git clone <your-repo-url>
cd distributed-token-bucket-rate-limiter/rate-limiter

# 2. Start the entire stack (Redis + App + Prometheus + Grafana)
docker compose -f docker/docker-compose.yml up --build -d

# 3. Verify everything is running
docker compose -f docker/docker-compose.yml ps
```

### Access the services

| Service          | URL                              | Credentials       |
|------------------|----------------------------------|--------------------|
| **Rate Limiter API** | http://localhost:5000          | —                  |
| **Prometheus**       | http://localhost:9090          | —                  |
| **Grafana**          | http://localhost:3002          | `admin` / `admin`  |

### What happens automatically

- **Prometheus** starts scraping your app's `/metrics` endpoint every 5 seconds.
- **Grafana** is pre-provisioned with:
  - A Prometheus datasource (no manual setup).
  - A full "Rate Limiter — Token Bucket Observability" dashboard (auto-loaded).
- Just open Grafana → go to **Dashboards** → look in the **Rate Limiter** folder.

### Generate traffic to see data

```bash
# Hit the API a few times to see metrics populate
for i in {1..50}; do curl -s http://localhost:5000/api/hello; done

# Or use the load test script
node scripts/load-test.js
```

### Stopping everything

```bash
docker compose -f docker/docker-compose.yml down
```

---

## Option B: Grafana Cloud (Free Tier) — Registration Required

Use this if you want a cloud-hosted Grafana dashboard (e.g., for sharing with
interviewers or team members, or if Docker isn't available).

### Step 1: Create a Grafana Cloud Account (Free)

1. Go to **https://grafana.com/auth/sign-up/create-user**
2. Sign up with **GitHub, Google, or Email** — no credit card needed.
3. You'll be assigned a free-tier stack that includes:
   - Grafana (dashboards)
   - Prometheus (metrics backend via Grafana Mimir)
   - 10,000 active series, 14-day retention — more than enough for this project.

### Step 2: Get Your Prometheus Remote-Write Credentials

1. Log in to **https://grafana.com** → navigate to your **Stack** page.
2. Click on **Prometheus** (or "Send Metrics") → you'll see:
   - **Remote Write Endpoint**: something like
     `https://prometheus-prod-XX-prod.grafana.net/api/prom/push`
   - **Username / Instance ID**: a numeric ID (e.g., `123456`)
   - **Password / API Key**: click "Generate now" to create one.
3. Save these values — you'll need them in Step 3.

### Step 3: Add Credentials to Your `.env`

Add these lines to your `.env` file (in the `rate-limiter/` root):

```env
# Grafana Cloud Prometheus remote-write (Phase 14 observability)
PROMETHEUS_REMOTE_WRITE_URL=https://prometheus-prod-XX-prod.grafana.net/api/prom/push
PROMETHEUS_REMOTE_WRITE_USER=123456
PROMETHEUS_REMOTE_WRITE_PASSWORD=your-api-key-here
```

> **⚠️ IMPORTANT:** Never commit `.env` to Git. It's already in `.gitignore`.

### Step 4: (Optional) Push Metrics from Your App

The app already exposes a `/metrics` endpoint in Prometheus text format. To push
metrics to Grafana Cloud instead of having Prometheus scrape them locally, you
have two options:

**Option A — Use Grafana Agent (recommended for production):**

1. Install Grafana Agent: https://grafana.com/docs/agent/latest/
2. Configure it to scrape `http://localhost:5000/metrics` and remote-write to
   your Grafana Cloud endpoint.

**Option B — Add remote-write to your local Prometheus:**

Add this to `docker/prometheus/prometheus.yml`:

```yaml
remote_write:
  - url: "https://prometheus-prod-XX-prod.grafana.net/api/prom/push"
    basic_auth:
      username: "123456"
      password: "your-api-key-here"
```

Then restart Prometheus:
```bash
docker compose -f docker/docker-compose.yml restart prometheus
```

### Step 5: Import the Dashboard in Grafana Cloud

1. Log in to your Grafana Cloud instance (the URL shown on your stack page).
2. Go to **Dashboards** → **New** → **Import**.
3. Upload the JSON file: `docker/grafana/dashboards/rate-limiter.json`
4. Select your Prometheus datasource when prompted.
5. Click **Import** — your dashboard is live!

---

## Option C: Self-Hosted Grafana (No Docker, No Cloud)

If you want to install Grafana + Prometheus natively on your machine:

### Prometheus

1. Download from https://prometheus.io/download/
2. Extract and run:
   ```bash
   ./prometheus --config.file=docker/prometheus/prometheus.yml
   ```
3. Edit `docker/prometheus/prometheus.yml` → change the target from `app:3000`
   to `localhost:5000` (since there's no Docker network).
4. Access Prometheus UI at http://localhost:9090

### Grafana

1. Download from https://grafana.com/grafana/download
   - **Windows**: Use the MSI installer.
   - **Mac**: `brew install grafana && brew services start grafana`
   - **Linux**: Follow the APT/YUM instructions on the download page.
2. Open http://localhost:3000 (default Grafana port).
3. Login with `admin` / `admin`.
4. Add a Prometheus datasource: **Configuration** → **Data Sources** → **Add
   data source** → **Prometheus** → URL: `http://localhost:9090` → **Save & Test**.
5. Import the dashboard JSON: **Dashboards** → **Import** → upload
   `docker/grafana/dashboards/rate-limiter.json`.

---

## Dashboard Panels Reference

The pre-built dashboard includes **9 panels**:

| Panel | Type | What it shows |
|-------|------|---------------|
| ✅ Total Allowed | Stat | Running count of allowed requests |
| 🚫 Total Rejected | Stat | Running count of 429 responses |
| ⚠️ Rejection Rate | Stat | `rejected / total` as a percentage |
| 📈 Total Requests | Stat | Combined (allowed + rejected) |
| Allowed vs Rejected — Over Time | Time Series | Line chart with smooth interpolation |
| Allowed — By Endpoint | Bar Chart | Stacked bars per-endpoint (allowed) |
| Rejected — By Endpoint | Bar Chart | Stacked bars per-endpoint (rejected) |
| Traffic Share — By Endpoint | Pie Chart | Donut chart showing endpoint distribution |
| Rejection Rate — By Endpoint | Bar Gauge | Color-coded gauge (green → orange → red) |

---

## Accounts Summary

| Service | Required? | Free Tier? | Sign Up URL |
|---------|-----------|------------|-------------|
| **Docker Desktop** | Yes (for local) | Yes | https://docker.com/products/docker-desktop |
| **Grafana Cloud** | Only for Option B | Yes (10K series, 14-day retention) | https://grafana.com/auth/sign-up/create-user |
| **Redis Cloud** | Only if not using local Redis | Yes (30MB) | https://redis.io/try-free |

---

## Troubleshooting

### Prometheus can't reach the app
- Inside Docker: the app hostname is `app`, port is `5000` (defined in
  docker-compose). Make sure `prometheus.yml` targets `app:5000`.
- Outside Docker: change the Prometheus target to `host.docker.internal:5000`
  (macOS/Windows) or `172.17.0.1:5000` (Linux).

### Grafana shows "No data"
1. Check Prometheus is scraping: go to http://localhost:9090/targets — the
   `rate-limiter` target should show **UP**.
2. Send some traffic first! Metrics only appear after requests are made.
3. Make sure the time range in Grafana covers the period when traffic was sent.

### Port conflicts
- Grafana runs on port **3002** (mapped from container's 3000) to avoid
  conflict with the Next.js frontend on port 3000.
- Change port mappings in `docker/docker-compose.yml` if needed.
