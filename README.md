# 🚦 Token Bucket Rate Limiter

A production-ready **Token Bucket Rate Limiter** built with a
Node.js/Express backend and integrated with **Prometheus** and **Grafana
Cloud** for real-time observability.

The project demonstrates how to control request traffic, reject
excessive requests, expose application metrics, collect them with
Prometheus, and visualize them in Grafana Cloud.

------------------------------------------------------------------------

## 🌐 Live Deployments

  --------------------------------------------------------------------------------------
  Service                             Link
  ----------------------------------- --------------------------------------------------
  🌐 Frontend / Demo                  [Rate Limiter
                                      Frontend](https://rate-limiter.vercel.app)

  ⚡ Rate Limiter API                 [Rate Limiter
                                      API](https://rate-limiter.onrender.com)

  📈 Prometheus                       [Prometheus
                                      Monitoring](https://rate-limiter-1.onrender.com)

  📊 Grafana Cloud                    [Grafana
                                      Dashboard](https://goldpoplar214.grafana.net)
  --------------------------------------------------------------------------------------

> **Note:** Grafana may require authentication to access dashboards.

------------------------------------------------------------------------

## 📌 Project Overview

A rate limiter protects APIs and backend services from excessive
traffic.

This project implements the **Token Bucket algorithm**, where each
client is associated with a bucket containing a limited number of
tokens.

For every incoming request:

1.  A token is required to process the request.
2.  If a token is available, the request is **allowed** and one token is
    consumed.
3.  If no token is available, the request is **rejected**.
4.  Tokens are continuously replenished according to the configured
    refill rate.

This allows short bursts of traffic while still enforcing an average
request rate.

------------------------------------------------------------------------

## 🪣 Token Bucket Algorithm

Conceptually, every client has:

``` text
              Token Refill
                   │
                   ▼
          ┌─────────────────┐
          │   Token Bucket  │
          │                 │
          │ 🟢 🟢 🟢 🟢 🟢 │
          │                 │
          │ Capacity = N    │
          └────────┬────────┘
                   │
              Incoming Request
                   │
          ┌────────┴────────┐
          │                 │
     Token available?       │
          │                 │
       ┌──┴──┐              │
      YES    NO              │
       │      │              │
       ▼      ▼              ▼
    ALLOW   REJECT        429 Response
       │
       ▼
   Consume Token
```

### Why Token Bucket?

The algorithm provides a useful balance between:

-   **Burst handling**
-   **Average request-rate control**
-   **Low overhead**
-   **Simple implementation**
-   **Configurable capacity and refill rate**

------------------------------------------------------------------------

## 🏗️ Architecture

``` text
                         ┌──────────────────────┐
                         │       Client         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Rate Limiter API   │
                         │    Node.js/Express   │
                         └──────────┬───────────┘
                                    │
                             Rate Limit Check
                                    │
                         ┌──────────┴───────────┐
                         │                      │
                      Allowed                Rejected
                         │                      │
                         ▼                      ▼
                    API Response             HTTP 429
                         │
                         │
                         ▼
                    /metrics
                         │
                         ▼
                 ┌─────────────────┐
                 │    Prometheus   │
                 │  Hosted on      │
                 │     Render      │
                 └────────┬────────┘
                          │
                    remote_write
                          │
                          ▼
                 ┌─────────────────┐
                 │   Grafana Cloud │
                 │   Visualization │
                 └─────────────────┘
```

------------------------------------------------------------------------

## ✨ Features

### Rate Limiting

-   Token Bucket rate-limiting algorithm
-   Configurable bucket capacity
-   Configurable token refill rate
-   Request rejection when tokens are unavailable
-   HTTP `429 Too Many Requests` handling
-   Endpoint-level request tracking

### Observability

-   Prometheus metrics endpoint
-   Prometheus scraping over HTTPS
-   Grafana Cloud remote write
-   Request counters
-   Allowed request tracking
-   Rejected request tracking
-   Endpoint-level metrics
-   Service health monitoring

### Deployment

-   Frontend deployed on Vercel
-   Rate limiter API deployed on Render
-   Prometheus deployed on Render
-   Metrics stored/visualized through Grafana Cloud

------------------------------------------------------------------------

## 📊 Prometheus Metrics

The application exposes metrics through:

``` text
/metrics
```

The current monitoring setup includes metrics such as:

### Total allowed requests

``` text
ratelimiter_requests_allowed_total
```

Tracks the total number of requests successfully allowed by the rate
limiter.

### Total rejected requests

``` text
ratelimiter_requests_rejected_total
```

Tracks the total number of requests rejected because the rate limit was
exceeded.

### Allowed requests by endpoint

``` text
ratelimiter_requests_allowed_by_endpoint
```

Tracks allowed requests broken down by endpoint.

Example:

``` text
ratelimiter_requests_allowed_by_endpoint{
  endpoint="/api/hello"
}
```

### Rejected requests by endpoint

``` text
ratelimiter_requests_rejected_by_endpoint
```

Tracks rejected requests broken down by endpoint.

### Prometheus health metric

``` text
up
```

A value of:

``` text
1
```

means Prometheus can successfully scrape the rate-limiter service.

------------------------------------------------------------------------

## 📈 Grafana Queries

Some useful PromQL queries for this project are:

### Service health

``` promql
up{job="rate-limiter"}
```

Expected result:

``` text
1
```

### Total allowed requests

``` promql
ratelimiter_requests_allowed_total
```

### Total rejected requests

``` promql
ratelimiter_requests_rejected_total
```

### Allowed requests per second

``` promql
rate(ratelimiter_requests_allowed_total[1m])
```

### Rejected requests per second

``` promql
rate(ratelimiter_requests_rejected_total[1m])
```

### Rejection percentage

``` promql
100 *
rate(ratelimiter_requests_rejected_total[5m])
/
clamp_min(
  rate(ratelimiter_requests_allowed_total[5m]) +
  rate(ratelimiter_requests_rejected_total[5m]),
  1
)
```

------------------------------------------------------------------------

## 🔍 Monitoring Flow

The complete observability pipeline is:

``` text
Rate Limiter
     │
     │ GET /metrics
     ▼
Prometheus
     │
     │ remote_write
     ▼
Grafana Cloud
     │
     ▼
Dashboards / Graphs / Alerts
```

Prometheus periodically scrapes the application's `/metrics` endpoint.

The collected metrics are then forwarded to Grafana Cloud using
Prometheus `remote_write`.

------------------------------------------------------------------------

## 🧪 Example Rate-Limit Test

Send multiple requests quickly to the API:

``` bash
curl https://rate-limiter.onrender.com/api/hello
```

Run the request repeatedly to exceed the configured rate limit.

When the bucket has available tokens:

``` text
HTTP 200
```

When the bucket is exhausted:

``` text
HTTP 429 Too Many Requests
```

You can then check Grafana Cloud:

``` promql
ratelimiter_requests_allowed_total
```

and:

``` promql
ratelimiter_requests_rejected_total
```

The counters should increase as requests are processed.

------------------------------------------------------------------------

## 🛠️ Technology Stack

### Backend

-   Node.js
-   Express.js
-   JavaScript
-   REST API

### Rate Limiting

-   Token Bucket Algorithm
-   Configurable token capacity
-   Configurable refill behavior

### Monitoring

-   Prometheus
-   PromQL
-   Grafana Cloud
-   Prometheus `remote_write`

### Deployment

-   Vercel
-   Render
-   Grafana Cloud

------------------------------------------------------------------------

## 📁 Project Structure

A typical structure for the project is:

``` text
rate-limiter/
│
├── rate-limiter-frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── rate-limiter/
│   ├── src/
│   ├── docker/
│   │   └── prometheus/
│   │       └── prometheus.yml
│   ├── Dockerfile
│   ├── package.json
│   └── ...
│
└── README.md
```

 

------------------------------------------------------------------------

## 🚀 Running Locally

### 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd rate-limiter
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file if your application requires environment
variables.

Example:

``` env
PORT=5000
```

Do not commit `.env` files containing secrets.

### 4. Start the server

``` bash
npm start
```

or, depending on the project scripts:

``` bash
npm run dev
```

### 5. Check the metrics endpoint

Open:

``` text
http://localhost:5000/metrics
```

You should see Prometheus-formatted metrics.

------------------------------------------------------------------------

## 🐳 Docker

The Prometheus monitoring service uses Docker.

Example Dockerfile:

``` dockerfile
FROM prom/prometheus:v2.53.0

COPY docker/prometheus/prometheus.yml /etc/prometheus/prometheus.yml

CMD ["--config.file=/etc/prometheus/prometheus.yml"]
```

The Grafana token is intentionally not copied into the Docker image.

------------------------------------------------------------------------

## 📡 Prometheus Configuration

The Prometheus server scrapes the rate-limiter service over HTTPS.

Conceptually:

``` yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: rate-limiter
    metrics_path: /metrics
    scheme: https

    static_configs:
      - targets:
          - rate-limiter.onrender.com
        labels:
          service: rate-limiter
          environment: production
```

Grafana Cloud is configured as the remote write destination.

------------------------------------------------------------------------

## 🎯 Project Goals

This project was built to demonstrate practical implementation of:

-   API rate limiting
-   Token Bucket algorithms
-   Backend middleware design
-   HTTP status-code handling
-   Application instrumentation
-   Prometheus monitoring
-   PromQL querying
-   Grafana visualization
-   Cloud deployment
-   Production-oriented observability

------------------------------------------------------------------------

## 📌 Future Improvements

Potential extensions include:

-   Redis-backed distributed rate limiting
-   Per-user rate limits
-   API-key-based limits
-   IP-based rate limiting
-   Dynamic rate-limit configuration
-   Multiple rate-limit policies
-   Rate-limit headers such as `X-RateLimit-Limit`
-   Remaining-token headers
-   Grafana alert rules
-   Latency histograms
-   Request-duration metrics
-   Distributed deployment
-   Load testing and benchmark comparisons
-   Circuit breaker integration

------------------------------------------------------------------------

## 📊 Observability Dashboard

The Grafana setup can be extended with panels for:

``` text
┌────────────────────────────────────────────┐
│          RATE LIMITER OBSERVABILITY         │
├──────────────────────┬─────────────────────┤
│ Allowed Requests     │ Rejected Requests   │
│        📈            │        📈           │
├──────────────────────┼─────────────────────┤
│ Requests/sec         │ Rejection Rate      │
│        📊            │        📊           │
├──────────────────────┴─────────────────────┤
│              Service Health                │
│                   🟢 UP                    │
└────────────────────────────────────────────┘
```

------------------------------------------------------------------------

## 👨‍💻 Author

**Adarsh Tiwari**

GitHub: [Adarsh131120](https://github.com/Adarsh131120)

------------------------------------------------------------------------

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on
GitHub.

------------------------------------------------------------------------

## 📄 License

Add your preferred license here, for example:

``` text
MIT License
```
