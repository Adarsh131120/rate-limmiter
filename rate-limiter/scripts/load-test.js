// scripts/load-test.js
//
// STUB (see docs/PROGRESS.md — full k6 suite is a deferred item).
// Quick-and-dirty concurrency check using Node's fetch: fires N concurrent
// requests at /api/hello and reports how many were allowed vs rejected.
// Good enough to sanity-check that the Redis/Lua path is race-free under
// real concurrency. Start the server first: `npm start` (or via Docker).

const URL = process.env.LOAD_TEST_URL || 'http://localhost:3000/api/hello';
const CONCURRENCY = Number(process.env.LOAD_TEST_CONCURRENCY || 50);

async function main() {
  console.log(`Firing ${CONCURRENCY} concurrent requests at ${URL} ...`);

  const results = await Promise.all(
    Array.from({ length: CONCURRENCY }, () =>
      fetch(URL).then((r) => r.status).catch(() => 'error')
    )
  );

  const allowed = results.filter((s) => s === 200).length;
  const rejected = results.filter((s) => s === 429).length;
  const errors = results.filter((s) => s !== 200 && s !== 429).length;

  console.log({ allowed, rejected, errors, total: results.length });
  console.log(
    'Sanity check: allowed count should not exceed the bucket capacity ' +
      '(RATE_LIMIT_CAPACITY) even though requests were fully concurrent — ' +
      'that is the atomicity guarantee the Lua script provides.'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
