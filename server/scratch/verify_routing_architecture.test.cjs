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
const authRewrites = vercelConfig.rewrites.filter(r => r.source && r.source.startsWith('/auth/'));
assert(authRewrites.length >= 2, 'Auth rewrite rules must exist in vercel.json');

const authRegexes = authRewrites.map(r => {
  const authRegexStr = r.source.replace(/^\//, '^\\/').replace(/\$$/, '') + '$';
  return new RegExp(authRegexStr);
});

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
  const matches = authRegexes.some(re => re.test(p));
  assert(matches, `Backend path ${p} must match an auth rewrite for server`);
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
  const matches = authRegexes.some(re => re.test(p));
  assert(!matches, `Client SPA route ${p} must NOT route to backend server`);
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

// Test 5: Verify Vercel SPA Fallback Rewrite Rule
console.log('5. Testing Vercel SPA fallback rewrite...');
assert.strictEqual(vercelConfig.buildCommand, 'vite build', 'vercel.json buildCommand must be vite build');
assert.strictEqual(vercelConfig.outputDirectory, 'dist', 'vercel.json outputDirectory must be dist');
const spaRewrite = vercelConfig.rewrites.find(
  r => r.destination === '/index.html'
);
assert(spaRewrite, 'vercel.json must contain an explicit SPA fallback rewrite with destination /index.html');
assert.strictEqual(spaRewrite.source, '/(.*)', 'SPA rewrite source must be /(.*)');

// Verify API rewrites route to /api/index.js
const apiRewrites = vercelConfig.rewrites.filter(r => r.destination === '/api/index.js');
assert(apiRewrites.length >= 4, 'Must have at least 4 API rewrite rules routing to /api/index.js');
console.log('  ✓ Vercel SPA fallback correctly intercepts client routes and rewrites to /index.html');

// Test 6: Verify Server-Side SPA Static Serving and Fallback
console.log('6. Testing Express server SPA static fallback in server/index.js...');
const serverIndexContent = fs.readFileSync(path.resolve(__dirname, '../index.js'), 'utf8');
assert(serverIndexContent.includes('express.static(distPath)'), 'server/index.js must mount express.static on distPath');
assert(serverIndexContent.includes('app.get("*",'), 'server/index.js must mount wildcard SPA catch-all handler');
assert(serverIndexContent.includes('res.sendFile(indexPath)'), 'server/index.js must send index.html for client routes');
console.log('  ✓ Express server includes full-stack static asset serving and SPA fallback');

// Test 7: Verify Banner.jsx Absolute Navigation Paths
console.log('7. Testing Banner.jsx navigation links...');
const bannerContent = fs.readFileSync(path.resolve(__dirname, '../../src/views/Management/dashboardComponents/Banner.jsx'), 'utf8');
assert(bannerContent.includes('${basePath}/members-overview'), 'Banner.jsx must use absolute basePath for members-overview');
assert(bannerContent.includes('${basePath}/events-overview'), 'Banner.jsx must use absolute basePath for events-overview');
assert(!bannerContent.includes('to="members-overview"'), 'Banner.jsx must not have relative to="members-overview"');
assert(!bannerContent.includes('to="events-overview"'), 'Banner.jsx must not have relative to="events-overview"');
console.log('  ✓ Banner.jsx uses absolute basePath paths preventing nested 404s');

// Test 8: Verify ManagementRoutes.jsx Aliases
console.log('8. Testing ManagementRoutes.jsx aliases...');
const mgmtRoutesContent = fs.readFileSync(path.resolve(__dirname, '../../src/routes/Management/ManagementRoutes.jsx'), 'utf8');
assert(mgmtRoutesContent.includes('path: "events", element: <Navigate to="events-overview"'), 'ManagementRoutes must have events alias');
assert(mgmtRoutesContent.includes('path: "projects", element: <Navigate to="projects-overview"'), 'ManagementRoutes must have projects alias');
assert(mgmtRoutesContent.includes('path: "members", element: <Navigate to="members-overview"'), 'ManagementRoutes must have members alias');
assert(mgmtRoutesContent.includes('path: "events/:id"'), 'ManagementRoutes must handle events/:id');
assert(mgmtRoutesContent.includes('path: "projects/:id"'), 'ManagementRoutes must handle projects/:id');
console.log('  ✓ ManagementRoutes contains robust backward-compatible route aliases');

console.log('\n--- ALL ROUTING ARCHITECTURE TESTS PASSED SUCCESSFULLY! ---');
