/**
 * @file test_phase2a_security.js
 * @description Standalone verification test suite for Phase 2A: Fine & Event Team Route Security.
 * Inspects Express router middleware stacks to guarantee verifyToken and verifyRole RBAC enforcement.
 *
 * Execution:
 *   node server/scratch/test_phase2a_security.js
 */
import assert from 'node:assert';
import fineRouter from '../routes/admin/fineRoute.js';
import eventRouter from '../routes/admin/eventRoutes.js';
import verifyToken from '../middlewares/verifyToken.js';

// Helper to create mock Express response
function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

// Helper to run middleware handler and capture behavior
function testMiddleware(handler, req) {
  let nextCalled = false;
  let nextArg = null;
  const res = createMockRes();
  const next = (arg) => {
    nextCalled = true;
    nextArg = arg;
  };

  handler(req, res, next);
  return { res, nextCalled, nextArg };
}

console.log('====================================================');
console.log(' Phase 2A Security Verification: Route Middleware Stacks');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         Error: ${err.message}`);
    throw err;
  }
}

// =========================================================================
// TEST SUITE 1: fineRouter Router-Level Security Inspection
// =========================================================================
console.log('Checking fineRouter Middleware Stack...');

runTest('fineRouter has top-level verifyToken middleware', () => {
  const routerMiddlewares = fineRouter.stack.filter(layer => !layer.route);
  assert.ok(routerMiddlewares.length >= 2, 'fineRouter must have at least 2 router-level middlewares');
  
  const tokenLayer = routerMiddlewares[0];
  assert.strictEqual(tokenLayer.name, 'verifyToken', 'First router-level middleware must be verifyToken');
  
  // Functional check: unauthenticated request returns 401
  const authRes = testMiddleware(tokenLayer.handle, { cookies: {}, headers: {} });
  assert.strictEqual(authRes.res.statusCode, 401, 'verifyToken handler must reject requests missing tokens with 401');
});

runTest('fineRouter has top-level verifyRole(["admin", "coordinator"]) middleware', () => {
  const routerMiddlewares = fineRouter.stack.filter(layer => !layer.route);
  const rbacLayer = routerMiddlewares[1];
  assert.strictEqual(typeof rbacLayer.handle, 'function', 'Second router-level middleware must be a function');

  // Functional check: unauthenticated (no req.user) returns 401
  const unauthRes = testMiddleware(rbacLayer.handle, {});
  assert.strictEqual(unauthRes.res.statusCode, 401, 'RBAC handler must return 401 if req.user is absent');

  // Functional check: member role returns 403
  const memberRes = testMiddleware(rbacLayer.handle, { user: { role: 'member' } });
  assert.strictEqual(memberRes.res.statusCode, 403, 'RBAC handler must reject member role with 403');

  // Functional check: coordinator role allows access
  const coordRes = testMiddleware(rbacLayer.handle, { user: { role: 'coordinator' } });
  assert.strictEqual(coordRes.nextCalled, true, 'RBAC handler must allow coordinator role');

  // Functional check: admin role allows access
  const adminRes = testMiddleware(rbacLayer.handle, { user: { role: 'admin' } });
  assert.strictEqual(adminRes.nextCalled, true, 'RBAC handler must allow admin role');
});

runTest('Router-level middlewares in fineRouter precede all registered routes', () => {
  const stack = fineRouter.stack;
  let firstRouteIdx = stack.findIndex(layer => !!layer.route);
  assert.ok(firstRouteIdx >= 2, 'Routes must be registered after router-level authentication and authorization');

  const registeredRoutes = stack
    .filter(layer => !!layer.route)
    .map(layer => `${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
  
  assert.ok(registeredRoutes.length > 0, 'fineRouter should register routes');
  console.log(`         (${registeredRoutes.length} admin fine routes guarded by router-level middleware)`);
});

// =========================================================================
// TEST SUITE 2: eventRouter Team & Migration Route Security Inspection
// =========================================================================
console.log('\nChecking eventRouter Route-Level Middleware Stacks...');

const expectedEventSecurity = [
  { path: '/available-members', method: 'get', allowedRoles: ['admin', 'coordinator'] },
  { path: '/:id/members', method: 'get', allowedRoles: ['admin', 'coordinator'] },
  { path: '/:id/members', method: 'put', allowedRoles: ['admin', 'coordinator'] },
  { path: '/:id/members/team', method: 'put', allowedRoles: ['admin', 'coordinator'] },
  { path: '/:id/members/team/:teamType/add', method: 'post', allowedRoles: ['admin', 'coordinator'] },
  { path: '/:id/members/team/:teamType/members', method: 'delete', allowedRoles: ['admin', 'coordinator'] },
  { path: '/:id/migrate/event-members', method: 'put', allowedRoles: ['admin'] }
];

for (const target of expectedEventSecurity) {
  const methodUpper = target.method.toUpperCase();
  runTest(`eventRouter ${methodUpper} ${target.path} is protected by verifyToken and verifyRole(${JSON.stringify(target.allowedRoles)})`, () => {
    const routeLayer = eventRouter.stack.find(layer =>
      layer.route &&
      layer.route.path === target.path &&
      layer.route.methods[target.method] === true
    );

    assert.ok(routeLayer, `Route ${methodUpper} ${target.path} must exist on eventRouter`);
    const handlers = routeLayer.route.stack.map(s => s.handle);
    assert.ok(handlers.length >= 3, `Route must have at least 3 handlers: [verifyToken, verifyRole, controller]. Found ${handlers.length}`);

    // Handler 0: verifyToken
    const tokenHandler = handlers[0];
    const authRes = testMiddleware(tokenHandler, { cookies: {}, headers: {} });
    assert.strictEqual(authRes.res.statusCode, 401, 'Handler 0 must be verifyToken (returns 401 on missing token)');

    // Handler 1: verifyRole
    const rbacHandler = handlers[1];

    // Check unauthorized role
    const memberRes = testMiddleware(rbacHandler, { user: { role: 'member' } });
    assert.strictEqual(memberRes.res.statusCode, 403, 'Handler 1 must reject member role with 403');

    // Check coordinator role
    const coordRes = testMiddleware(rbacHandler, { user: { role: 'coordinator' } });
    if (target.allowedRoles.includes('coordinator')) {
      assert.strictEqual(coordRes.nextCalled, true, 'Handler 1 must permit coordinator role');
    } else {
      assert.strictEqual(coordRes.res.statusCode, 403, 'Handler 1 must reject coordinator role with 403 for admin-only route');
    }

    // Check admin role
    const adminRes = testMiddleware(rbacHandler, { user: { role: 'admin' } });
    assert.strictEqual(adminRes.nextCalled, true, 'Handler 1 must permit admin role');

    // Handler 2: controller function
    const controllerHandler = handlers[handlers.length - 1];
    assert.strictEqual(typeof controllerHandler, 'function', 'Final handler in route stack must be the controller function');
  });
}

console.log('\n====================================================');
console.log(` Summary: ${passedTests}/${totalTests} tests passed successfully.`);
console.log('====================================================\n');
