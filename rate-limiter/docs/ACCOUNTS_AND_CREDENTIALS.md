# Accounts & Credentials — What You Actually Need

Short answer: **for local development, you need zero external accounts.**
`docker-compose up` runs Redis locally for you. Accounts only matter once
you want to *deploy* this somewhere real or add optional production
services. Below is exactly what to sign up for, per use case, and exactly
where each secret gets injected — nowhere in code, always via environment
variables.

Every secret in this project is read through `src/config/index.js`, which
pulls from `process.env`, which is populated from a `.env` file (local) or
your host's secret manager (production). **Never hardcode a secret in any
`.js` file.** `.env` is already in `.gitignore`.

---

## 1. Local development — no accounts needed
- Redis runs as a container defined in `docker/docker-compose.yml`.
- Copy `.env.example` to `.env` at the repo root; the defaults already point
  at the local Redis container (`REDIS_URL=redis://redis:6379` inside
  Docker, or `redis://localhost:6379` if you run Node directly on your host).
- Inject nothing else. Run `docker compose -f docker/docker-compose.yml up`.

## 2. If you want managed Redis instead of self-hosting (recommended before real prod traffic)
Pick one:
- **Redis Cloud** (redis.io) — free tier available, easiest to start with.
- **Upstash** — serverless Redis, pay-per-request, good fit if traffic is spiky.
- **AWS ElastiCache** — best if you're already on AWS; needs a VPC.

What to do:
1. Create the account, spin up a database, copy the connection string
   (looks like `rediss://default:<password>@<host>:<port>`).
2. Put it in `.env` as:
   ```
   REDIS_URL=rediss://default:YOUR_PASSWORD@your-host:12345
   ```
3. Nothing else changes — `RedisRepository.js` reads `config.redis.url` and
   never sees the raw string in source.
4. In real production, don't use a `.env` file on the server at all — use
   your platform's secret store (see §5) and set `REDIS_URL` as an injected
   environment variable there instead.

## 3. If you deploy the app itself (not just Redis)
Pick a host:
- **Railway / Render / Fly.io** — simplest, good for a portfolio/demo deployment.
- **AWS ECS / EKS, GCP Cloud Run/GKE, Azure Container Apps** — if you want
  the "real infra" story for interviews.

What to do:
1. Create the account.
2. Connect this repo (or push the built Docker image to their registry).
3. Set environment variables in **their dashboard's "Environment
   Variables" / "Secrets" section** — this is where `REDIS_URL`,
   `PORT`, `NODE_ENV=production`, and any rate-limit tier config go.
   Do not commit these values anywhere.
4. No code changes needed — the app already reads everything from env vars.

## 4. If you add Observability (Phase 14, optional)
- **Grafana Cloud** (or self-hosted Grafana + Prometheus) — free tier exists.
- What you'd inject: a Prometheus remote-write URL + API key, as
  `PROMETHEUS_REMOTE_WRITE_URL` and `PROMETHEUS_API_KEY` in `.env` /
  platform secrets. (Not wired up yet — see `PROGRESS.md`; the `/metrics`
  endpoint already exposes Prometheus-format text, so this is a scrape/push
  config step, not a code change.)

## 5. Where secrets go, summarized

| Environment | Where the secret lives | How the app reads it |
|---|---|---|
| Local dev | `.env` file (gitignored) | `dotenv` loads it into `process.env` |
| Docker Compose | `docker/docker-compose.yml` `environment:` block, or an `.env` next to it | Compose injects into the container's env |
| Managed hosting (Railway/Render/Fly/ECS/etc.) | The platform's "Environment Variables" / "Secrets Manager" UI | Platform injects into the container at runtime |
| CI (GitHub Actions), if you add it later | Repo → Settings → Secrets and variables → Actions | Referenced as `${{ secrets.REDIS_URL }}` in the workflow YAML |

**Never**: put a credential directly in `src/config/index.js`, in a Dockerfile
`ENV` line, or in a committed `docker-compose.yml`. Always reference
`process.env.SOMETHING` and supply the value externally.

## 6. Full list of environment variables this project reads

See `.env.example` at the repo root — it's the single source of truth and
is kept in sync with `src/config/index.js`.
