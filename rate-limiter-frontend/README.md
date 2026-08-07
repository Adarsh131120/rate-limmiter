# Token Bucket — Showcase Frontend

An interactive Next.js walkthrough of the [distributed token bucket rate
limiter](../rate-limiter) backend: the algorithm, the math, the race
condition it solves, the architecture, and a live connection to the real
API — built to explain the project, not just link to a repo.

## Quickstart

```bash
npm install
npm run dev
```

Open http://localhost:3000. (If the backend is also running on :3000,
either stop it or run this frontend on a different port:
`npm run dev -- -p 3001`.)

## Connecting to the real backend

The "Live demo" section (`#live`) calls the actual API:

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, default http://localhost:3000
```

Then, in a separate terminal, start the backend from `../rate-limiter`:
```bash
npm start                                   # in-memory backend, or
docker compose -f docker/docker-compose.yml up --build   # Redis backend
```

The backend's CORS is already configured to accept requests from this
frontend (`CORS_ORIGIN` in `../rate-limiter/.env`, defaults to `*`).

## What's on the page

- **Hero** — a live token-bucket gauge you can drain by clicking, capacity 10 / refill 2 tok/s
- **Algorithm comparison** — Fixed Window / Sliding Log / Sliding Counter / Leaky Bucket / Token Bucket, visualized side by side
- **Deep dive** — adjustable capacity/refill sliders with the exact refill equation running live
- **Architecture** — why the bucket has to live in Redis once you run more than one instance
- **Atomicity** — a click-through race-condition demo plus the Lua script that fixes it
- **Live demo** — hits the real backend, shows real `X-RateLimit-*` headers and real 429s
- **Build status** — mirrors `../rate-limiter/docs/PROGRESS.md`, honestly

## Stack

Next.js 14 (App Router) · Tailwind CSS · no UI kit — every component here is
hand-built for this content. See `../rate-limiter/docs/` for the backend's
own planning docs.
