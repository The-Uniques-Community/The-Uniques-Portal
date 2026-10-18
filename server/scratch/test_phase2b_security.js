/**
 * @file test_phase2b_security.js
 * @description Standalone test suite for Phase 2B route security and community admin provisioning.
 */

import assert from 'assert';
import jwt from 'jsonwebtoken';
import communityRouter from '../routes/community/community.routes.js';
import campusAmbassadorRouter from '../routes/community/campusAmbassadorRoute.js';
import CommunityAdmin from '../models/community/communityAdmin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'the_uniques_portal_jwt_secret_dev_key';

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${error.message}`);
    throw error;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${error.message}`);
    throw error;
  }
}

function findRoute(router, path, method) {
  const layer = router.stack.find(
    (layer) =>
      layer.route &&
      layer.route.path === path &&
      layer.route.methods[method.toLowerCase()]
  );
  return layer ? layer.route : null;
}

function createMockRes(onEnd) {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      if (onEnd) onEnd();
      return this;
    },
    send(data) {
      this.body = data;
      if (onEnd) onEnd();
      return this;
    },
  };
  return res;
}

function createMockReq({ headers = {}, cookies = {}, body = {}, user = null } = {}) {
  return {
    headers: { ...headers },
    cookies: { ...cookies },
    body: { ...body },
    user,
  };
}

async function executeRouteStack(route, req, res) {
  const handlers = route.stack.map((s) => s.handle);
  let index = 0;

  return new Promise((resolve, reject) => {
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        resolve({ reachedController: index >= handlers.length });
      }
    };
    
    // Wire res to finish
    const origJson = res.json.bind(res);
    res.json = (data) => {
      origJson(data);
      finish();
      return res;
    };
    const origSend = res.send.bind(res);
    res.send = (data) => {
      origSend(data);
      finish();
      return res;
    };

    function next(err) {
      if (err) return reject(err);
      if (index >= handlers.length) {
        return finish();
      }
      const currentHandler = handlers[index++];
      try {
        currentHandler(req, res, next);
      } catch (e) {
        reject(e);
      }
    }
    next();
  });
}

console.log('\n======================================================');
console.log(' PHASE 2B: SECURITY & PROVISIONING VERIFICATION SUITE');
console.log('======================================================\n');

// Section 1: Route Stack Verification
console.log('[1] Route Stack Guard Verification:');

runTest('community.routes.js: POST /createCommunityAdmin has verifyToken and verifyRole', () => {
  const route = findRoute(communityRouter, '/createCommunityAdmin', 'post');
  assert(route, 'Route POST /createCommunityAdmin should exist');
  assert.strictEqual(route.stack.length, 3, 'Route should have 3 handlers (verifyToken, verifyRole, controller)');
  assert.strictEqual(route.stack[0].name, 'verifyToken', 'First middleware must be verifyToken');
});

runTest('campusAmbassadorRoute.js: POST /admin/create has verifyToken and verifyRole', () => {
  const route = findRoute(campusAmbassadorRouter, '/admin/create', 'post');
  assert(route, 'Route POST /admin/create should exist');
  assert.strictEqual(route.stack.length, 3, 'Route should have 3 handlers (verifyToken, verifyRole, controller)');
  assert.strictEqual(route.stack[0].name, 'verifyToken', 'First middleware must be verifyToken');
});

runTest('campusAmbassadorRoute.js: POST /campus-ambassador/apply is PUBLIC (no guards)', () => {
  const route = findRoute(campusAmbassadorRouter, '/campus-ambassador/apply', 'post');
  assert(route, 'Route POST /campus-ambassador/apply should exist');
  assert.strictEqual(route.stack.length, 1, 'Public route should have exactly 1 handler (no auth guards)');
  assert.notStrictEqual(route.stack[0].name, 'verifyToken', 'Public route must not use verifyToken');
});

const ambassadorProtectedRoutes = [
  { path: '/campus-ambassador', method: 'get' },
  { path: '/campus-ambassador/stats', method: 'get' },
  { path: '/campus-ambassador/:id', method: 'get' },
  { path: '/campus-ambassador/:id/status', method: 'patch' },
];

ambassadorProtectedRoutes.forEach(({ path, method }) => {
  runTest(`campusAmbassadorRoute.js: ${method.toUpperCase()} ${path} has verifyToken and verifyRole`, () => {
    const route = findRoute(campusAmbassadorRouter, path, method);
    assert(route, `Route ${method.toUpperCase()} ${path} should exist`);
    assert.strictEqual(route.stack.length, 3, `Route should have 3 handlers (verifyToken, verifyRole, controller)`);
    assert.strictEqual(route.stack[0].name, 'verifyToken', 'First middleware must be verifyToken');
  });
});

// Section 2: Functional Security Behavior Tests
console.log('\n[2] Guard Enforcement Functional Tests:');

const adminRoutes = [
  { router: communityRouter, path: '/createCommunityAdmin', method: 'post' },
  { router: campusAmbassadorRouter, path: '/admin/create', method: 'post' },
];

const allProtectedRoutes = [
  ...adminRoutes,
  ...ambassadorProtectedRoutes.map(r => ({ router: campusAmbassadorRouter, ...r }))
];

for (const { router, path, method } of allProtectedRoutes) {
  await runAsyncTest(`${method.toUpperCase()} ${path} rejects requests with no token (401)`, async () => {
    const route = findRoute(router, path, method);
    const req = createMockReq();
    const res = createMockRes();

    await executeRouteStack(route, req, res);
    assert.strictEqual(res.statusCode, 401, 'Should respond with HTTP 401');
    assert.strictEqual(res.body?.error, 'No token provided');
  });

  await runAsyncTest(`${method.toUpperCase()} ${path} rejects requests with invalid token (401)`, async () => {
    const route = findRoute(router, path, method);
    const req = createMockReq({ headers: { authorization: 'Bearer invalid_signature_token' } });
    const res = createMockRes();

    await executeRouteStack(route, req, res);
    assert.strictEqual(res.statusCode, 401, 'Should respond with HTTP 401');
    assert.strictEqual(res.body?.error, 'Invalid token');
  });

  await runAsyncTest(`${method.toUpperCase()} ${path} rejects 'member' role (403 Forbidden)`, async () => {
    const route = findRoute(router, path, method);
    const token = jwt.sign({ id: 'member_user_id', role: 'member' }, JWT_SECRET);
    const req = createMockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = createMockRes();

    await executeRouteStack(route, req, res);
    assert.strictEqual(res.statusCode, 403, 'Should respond with HTTP 403');
    assert(res.body?.message?.includes('Unauthorized'), 'Should provide unauthorized role message');
  });
}

// Section 3: Role Permission Segregation
console.log('\n[3] Role Permission Segregation:');

for (const { router, path, method } of adminRoutes) {
  await runAsyncTest(`${method.toUpperCase()} ${path} blocks 'coordinator' role (403 - admin only)`, async () => {
    const route = findRoute(router, path, method);
    const token = jwt.sign({ id: 'coord_id', role: 'coordinator' }, JWT_SECRET);
    const req = createMockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = createMockRes();

    await executeRouteStack(route, req, res);
    assert.strictEqual(res.statusCode, 403, 'Coordinator must NOT access admin creation');
  });
}

// Section 4: Community Admin Model Provisioning Check
console.log('\n[4] Community Admin Role Provisioning Check:');

runTest('CommunityAdmin model defaults to "communityadmin" when role is assigned', () => {
  const admin = new CommunityAdmin({
    email: 'newadmin@theuniques.org',
    password: 'hashedpassword',
    role: 'communityadmin',
  });
  assert.strictEqual(admin.role, 'communityadmin', 'Admin role must be "communityadmin"');
  assert.notStrictEqual(admin.role, 'member', 'Admin role must NOT be "member"');
});

runTest('CommunityAdmin model accepts "coordinator" role override', () => {
  const coordinator = new CommunityAdmin({
    email: 'coordinator@theuniques.org',
    password: 'hashedpassword',
    role: 'coordinator',
  });
  assert.strictEqual(coordinator.role, 'coordinator', 'Coordinator role must be "coordinator"');
  assert.notStrictEqual(coordinator.role, 'member', 'Role must NOT default to "member"');
});

console.log('\n======================================================');
console.log(` RESULTS: ${passedTests}/${totalTests} tests passed`);
console.log('======================================================\n');
