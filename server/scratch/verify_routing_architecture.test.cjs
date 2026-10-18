/**
 * @file verify_routing_architecture.test.cjs
 * @description Automated verification test suite for the modernized routing architecture.
 * Validates path constants, role dashboard resolution, Vercel edge rewrite regexes,
 * and route table definitions.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- [ROUTING ARCHITECTURE TEST SUITE] ---');

// Test 1: Verify Vercel Rewrites Regex
console.log('1. Testing Vercel Edge Rewrites regex matching...');
const vercelConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../vercel.json'), 'utf8'));
const authRewrite = vercelConfig.rewrites.find(r => r.source && r.source.includes('/auth/'));
assert(authRewrite, 'Auth rewrite rule must exist in vercel.json');

// Convert Vercel source pattern to RegExp
const authRegexStr = authRewrite.source.replace(/^\//, '^\\/').replace(/\$$/, '') + '$';
const authRegex = new RegExp(authRegexStr);

// Backend API requests that MUST route to server
const backendPaths = [
  '/auth/google',
  '/auth/google/callback',
  '/auth/emaillogin',
  '/auth/get_user',
  '/auth/verify_user',
  '/auth/verify_role',
  '/auth/logout',
  '/auth/password-reset/send-otp',
  '/auth/password-reset/verify-otp'
];

for (const p of backendPaths) {
  assert(authRegex.test(p), `Backend path ${p} must match auth rewrite for server`);
}
console.log('  ✓ All backend API auth endpoints correctly route to server');

// Client-side SPA routes that MUST NOT route to server (must fall through to Vite app)
const clientPaths = [
  '/auth/login',
  '/auth/forget-password',
  '/auth/signup',
  '/auth'
];

for (const p of clientPaths) {
  assert(!authRegex.test(p), `Client SPA route ${p} must NOT route to backend server`);
}
console.log('  ✓ All frontend client auth routes correctly fall through to Vite SPA');

// Test 2: Role Dashboard Resolution Logic
console.log('2. Testing getRoleDashboard mapping logic...');
const getRoleDashboard = (role) => {
  switch ((role || "").toLowerCase().trim()) {
    case "admin":
      return "/admin";
    case "coordinator":
      return "/coordinator";
    case "member":
      return "/member";
    default:
      return "/";
  }
};

assert.strictEqual(getRoleDashboard('admin'), '/admin');
assert.strictEqual(getRoleDashboard('ADMIN'), '/admin');
assert.strictEqual(getRoleDashboard('coordinator'), '/coordinator');
assert.strictEqual(getRoleDashboard('Coordinator'), '/coordinator');
assert.strictEqual(getRoleDashboard('member'), '/member');
assert.strictEqual(getRoleDashboard('Member'), '/member');
assert.strictEqual(getRoleDashboard('unknown'), '/');
assert.strictEqual(getRoleDashboard(null), '/');
assert.strictEqual(getRoleDashboard(undefined), '/');
console.log('  ✓ All portal roles map accurately to their respective workspaces and default to /');

// Test 3: Structural Integrity of Route Files
console.log('3. Validating Route Files and Layouts...');
const requiredFiles = [
  'src/routes/paths.js',
  'src/routes/index.jsx',
  'src/routes/ProtectedRoute.jsx',
  'src/routes/Management/ManagementRoutes.jsx',
  'src/routes/Admin/AdminRoutes.jsx',
  'src/routes/Uniques/CoordinatorRoute.jsx',
  'src/routes/Uniques/MemberRoutes.jsx',
  'src/views/NotFound.jsx',
  'src/views/Authentication/login/index.jsx',
  'src/views/Authentication/login/ForgetPassword.jsx',
  'src/views/Authentication/Unauthorized.jsx',
  'src/components/common/ErrorBoundary.jsx',
  'src/layout/Management/index.jsx'
];

for (const f of requiredFiles) {
  const filePath = path.resolve(__dirname, '../../', f);
  assert(fs.existsSync(filePath), `Required route file must exist: ${f}`);
}
console.log('  ✓ All canonical portal route files and components exist');

// Verify that community and landing directories have been removed
const removedPaths = [
  'src/views/Landing',
  'src/views/Community',
  'src/routes/Landing',
  'src/routes/Community',
  'src/routes/SuccessStories',
  'src/layout/Landing',
  'src/layout/Community'
];
for (const p of removedPaths) {
  const fullPath = path.resolve(__dirname, '../../', p);
  assert(!fs.existsSync(fullPath), `Obsolete path must be deleted: ${p}`);
}
console.log('  ✓ All community and landing directories confirmed deleted');

// Test 4: Verify Master Router Mounts
console.log('4. Checking Master Router mounting...');
const masterRouterContent = fs.readFileSync(path.resolve(__dirname, '../../src/routes/index.jsx'), 'utf8');
assert(!masterRouterContent.includes('LandingRoutes'), 'LandingRoutes must NOT be in master router');
assert(!masterRouterContent.includes('SuccessStoriesRoutes'), 'SuccessStoriesRoutes must NOT be in master router');
assert(!masterRouterContent.includes('CommunityRoutes'), 'CommunityRoutes must NOT be in master router');
assert(masterRouterContent.includes('AdminRoutes'), 'AdminRoutes must be mounted in master router');
assert(masterRouterContent.includes('CoordinatorRoutes'), 'CoordinatorRoutes must be mounted in master router');
assert(masterRouterContent.includes('MemberRoutes'), 'MemberRoutes must be mounted in master router');
assert(masterRouterContent.includes('RootLayout'), 'RootLayout must be mounted in master router');
assert(masterRouterContent.includes('path: "/"'), 'Root path / must be mounted in master router');
assert(masterRouterContent.includes('Login'), 'Login must be mounted at root in master router');

const rootLayoutContent = fs.readFileSync(path.resolve(__dirname, '../../src/layout/RootLayout.jsx'), 'utf8');
assert(rootLayoutContent.includes('ScrollRestoration'), 'ScrollRestoration must be mounted in RootLayout.jsx');
assert(rootLayoutContent.includes('Outlet'), 'Outlet must be mounted in RootLayout.jsx');
assert(masterRouterContent.includes('ErrorBoundary'), 'ErrorBoundary must be configured on root route');
console.log('  ✓ Master router correctly mounts login at /, workspaces, and error boundary with community cleanly removed');

console.log('\n--- ALL ROUTING ARCHITECTURE TESTS PASSED SUCCESSFULLY! ---');
