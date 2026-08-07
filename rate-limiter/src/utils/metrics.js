// src/utils/metrics.js
//
// Phase 14 (observability), minimal version: no external dependency (no
// prom-client) — just enough counters to prove the concept and give you
// something to scrape. Swap for prom-client + a Grafana dashboard when you
// get to that item in docs/PROGRESS.md; the call sites stay the same.

export class MetricsCollector {
  constructor() {
    this.allowedTotal = 0;
    this.rejectedTotal = 0;
    this.byEndpoint = new Map(); // endpoint -> {allowed, rejected}
  }

  recordDecision({ allowed, endpoint = 'unknown' }) {
    if (allowed) this.allowedTotal += 1;
    else this.rejectedTotal += 1;

    const bucket = this.byEndpoint.get(endpoint) || { allowed: 0, rejected: 0 };
    if (allowed) bucket.allowed += 1;
    else bucket.rejected += 1;
    this.byEndpoint.set(endpoint, bucket);
  }

  /** Prometheus exposition format (text/plain; version=0.0.4). */
  toPrometheusText() {
    const lines = [
      '# HELP ratelimiter_requests_allowed_total Requests allowed by the rate limiter',
      '# TYPE ratelimiter_requests_allowed_total counter',
      `ratelimiter_requests_allowed_total ${this.allowedTotal}`,
      '# HELP ratelimiter_requests_rejected_total Requests rejected (HTTP 429)',
      '# TYPE ratelimiter_requests_rejected_total counter',
      `ratelimiter_requests_rejected_total ${this.rejectedTotal}`,
    ];

    for (const [endpoint, counts] of this.byEndpoint.entries()) {
      const label = endpoint.replace(/"/g, '');
      lines.push(
        `ratelimiter_requests_allowed_by_endpoint{endpoint="${label}"} ${counts.allowed}`,
        `ratelimiter_requests_rejected_by_endpoint{endpoint="${label}"} ${counts.rejected}`
      );
    }

    return lines.join('\n') + '\n';
  }
}

export default MetricsCollector;
