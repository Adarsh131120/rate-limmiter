// src/routes/demo.routes.js
//
// Just enough routes to demonstrate and test the limiter end-to-end.

import { Router } from 'express';

export function demoRoutes() {
  const router = Router();

  router.get('/api/hello', (req, res) => {
    res.json({ message: 'hello, you are within your rate limit' });
  });

  router.get('/api/search', (req, res) => {
    // Deliberately mapped to the tighter ENDPOINT_OVERRIDES entry in
    // RateLimitPolicy.js, to demonstrate per-endpoint limits.
    res.json({ results: [] });
  });

  return router;
}

export default demoRoutes;
