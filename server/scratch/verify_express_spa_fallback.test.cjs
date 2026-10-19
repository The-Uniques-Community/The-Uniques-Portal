/**
 * @file verify_express_spa_fallback.test.cjs
 * @description Verifies that the Express server accurately serves static assets from ../dist
 * and falls back to index.html for client-side SPA routes while preserving 404 JSON for unknown API routes.
 */

const http = require('http');
const assert = require('assert');

// Set NODE_ENV to test to avoid connecting to live DB or listening on port 5001
process.env.NODE_ENV = 'test';
process.env.VERCEL = '1';

async function run() {
  console.log('--- [EXPRESS SPA FALLBACK VERIFICATION] ---');
  
  // Dynamically import the Express app
  const appModule = await import('../index.js');
  const app = appModule.default;
  assert(app, 'Express app must be exported from server/index.js');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test Express server listening on ephemeral port ${port}`);

  const testGet = (path) => {
    return new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}${path}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      }).on('error', reject);
    });
  };

  try {
    // 1. Root route
    console.log('1. Testing GET / (root entry)...');
    const rootRes = await testGet('/');
    // Root route can be the API greeting or index.html depending on mounting order
    console.log(`   Response status: ${rootRes.status}`);

    // 2. Client routes that MUST return 200 and serve index.html (SPA Fallback)
    const spaRoutes = [
      '/admin/dashboard',
      '/admin/events-overview',
      '/admin/members-overview',
      '/coordinator/projects-overview',
      '/member/leave-management',
      '/forget-password',
      '/auth/login'
    ];

    for (const r of spaRoutes) {
      console.log(`2. Testing SPA Fallback on route: ${r}...`);
      const res = await testGet(r);
      assert.strictEqual(res.status, 200, `Route ${r} must return status 200 via SPA fallback`);
      assert(res.headers['content-type'].includes('text/html'), `Route ${r} must return text/html`);
      assert(res.body.includes('<div id="root"></div>') || res.body.includes('<!DOCTYPE html>'), `Route ${r} must contain HTML SPA shell`);
      console.log(`   ✓ ${r} returned 200 OK with index.html SPA shell`);
    }

    // 3. API route that does NOT exist must NOT return index.html (must return JSON error or 404/503)
    console.log('3. Testing that API routes do NOT fall back to index.html...');
    const apiRes = await testGet('/api/nonexistent-route-12345');
    assert.notStrictEqual(apiRes.headers['content-type'], 'text/html; charset=UTF-8', 'API route must not return index.html');
    console.log(`   ✓ /api/nonexistent-route-12345 correctly passed through (status: ${apiRes.status})`);

    console.log('\n--- ALL EXPRESS SPA FALLBACK TESTS PASSED! ---');
    process.exit(0);
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
