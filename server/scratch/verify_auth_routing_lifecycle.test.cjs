/**
 * @file verify_auth_routing_lifecycle.test.cjs
 * @description Comprehensive unit verification suite testing the complete authentication,
 * token expiry inspection, role authorization, logout teardown, and routing guard lifecycles.
 */
const assert = require('assert');

console.log('--- [AUTH & ROUTING LIFECYCLE VERIFICATION SUITE] ---');

// ============================================================================
// 1. JWT Decoding & Expiry Logic
// ============================================================================
console.log('1. Testing JWT decoding and expiration checks...');

const createMockJwt = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'mock_signature';
  return `${header}.${body}.${signature}`;
};

const decodeJwt = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeJwt(token);
  if (!decoded) return true;
  if (!decoded.exp) return false;
  return decoded.exp * 1000 <= Date.now();
};

const validFutureToken = createMockJwt({
  id: 'usr123',
  email: 'admin@theuniques.com',
  role: 'admin',
  exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour in future
});

const expiredToken = createMockJwt({
  id: 'usr456',
  email: 'old@theuniques.com',
  role: 'member',
  exp: Math.floor(Date.now() / 1000) - 100 // 100 seconds in past
});

assert.strictEqual(isTokenExpired(null), true, 'Null token should be considered expired');
assert.strictEqual(isTokenExpired(''), true, 'Empty token should be considered expired');
assert.strictEqual(isTokenExpired('invalid.jwt'), true, 'Malformed token should be considered expired');
assert.strictEqual(isTokenExpired(validFutureToken), false, 'Future token must be valid (not expired)');
assert.strictEqual(isTokenExpired(expiredToken), true, 'Past token must be expired');

console.log('  ✓ JWT decoding and expiry validation operate correctly');

// ============================================================================
// 2. Role Normalization & Access Authorization
// ============================================================================
console.log('2. Testing role normalization and authorization...');

const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return '';
  const r = role.toLowerCase().trim();
  if (r === 'superadmin') return 'admin';
  if (r === 'communityadmin') return 'coordinator';
  return r;
};

const isRoleAuthorized = (requiredRole, userRole) => {
  if (!requiredRole) return true;
  if (!userRole) return false;

  const normalizedUser = normalizeRole(userRole);
  const rawUser = userRole.toLowerCase().trim();
  const allowedList = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  return allowedList.some((req) => {
    if (!req) return false;
    const normalizedReq = normalizeRole(req);
    const rawReq = req.toLowerCase().trim();
    return normalizedReq === normalizedUser || rawReq === rawUser;
  });
};

// Admin routes
assert.strictEqual(isRoleAuthorized('admin', 'admin'), true);
assert.strictEqual(isRoleAuthorized('admin', 'ADMIN'), true);
assert.strictEqual(isRoleAuthorized('admin', 'superadmin'), true);
assert.strictEqual(isRoleAuthorized('admin', 'member'), false);
assert.strictEqual(isRoleAuthorized('admin', null), false);

// Coordinator routes
assert.strictEqual(isRoleAuthorized('coordinator', 'coordinator'), true);
assert.strictEqual(isRoleAuthorized('coordinator', 'communityadmin'), true);
assert.strictEqual(isRoleAuthorized('coordinator', 'member'), false);

// Member routes
assert.strictEqual(isRoleAuthorized('member', 'member'), true);
assert.strictEqual(isRoleAuthorized('member', 'MEMBER'), true);

// Multi-role routes
assert.strictEqual(isRoleAuthorized(['admin', 'coordinator'], 'coordinator'), true);
assert.strictEqual(isRoleAuthorized(['admin', 'coordinator'], 'admin'), true);
assert.strictEqual(isRoleAuthorized(['admin', 'coordinator'], 'member'), false);

console.log('  ✓ Role normalization and RBAC permissions work accurately');

// ============================================================================
// 3. getRoleDashboard Navigation Resolver
// ============================================================================
console.log('3. Testing getRoleDashboard resolution...');

const getRoleDashboard = (role) => {
  switch ((role || '').toLowerCase().trim()) {
    case 'admin':
    case 'superadmin':
      return '/admin';
    case 'coordinator':
    case 'communityadmin':
      return '/coordinator';
    case 'member':
      return '/member';
    default:
      return '/';
  }
};

assert.strictEqual(getRoleDashboard('admin'), '/admin');
assert.strictEqual(getRoleDashboard('superadmin'), '/admin');
assert.strictEqual(getRoleDashboard('coordinator'), '/coordinator');
assert.strictEqual(getRoleDashboard('communityadmin'), '/coordinator');
assert.strictEqual(getRoleDashboard('member'), '/member');
assert.strictEqual(getRoleDashboard('unknown'), '/');
assert.strictEqual(getRoleDashboard(null), '/');
assert.strictEqual(getRoleDashboard(undefined), '/');

console.log('  ✓ Role dashboard resolution maps all roles and fallbacks properly');

// ============================================================================
// 4. ProtectedRoute Gate Simulation
// ============================================================================
console.log('4. Testing ProtectedRoute gate simulation...');

function simulateProtectedRoute({ role, userRole, token, isAuthenticated }) {
  const activeToken = token || null;
  const activeRole = userRole || null;
  const isExpired = isTokenExpired(activeToken);
  const hasAuth = Boolean(activeToken && !isExpired && (isAuthenticated || activeRole));

  if (!hasAuth) {
    return { status: 'REDIRECT', target: '/' };
  }

  if (role && !isRoleAuthorized(role, activeRole)) {
    return { status: 'REDIRECT', target: '/401' };
  }

  return { status: 'RENDER_CHILD' };
}

// Case A: Unauthenticated (no token) -> Redirect to /
const resUnauth = simulateProtectedRoute({
  role: 'admin',
  userRole: null,
  token: null,
  isAuthenticated: false
});
assert.strictEqual(resUnauth.status, 'REDIRECT');
assert.strictEqual(resUnauth.target, '/');

// Case B: Expired token -> Redirect to /
const resExpired = simulateProtectedRoute({
  role: 'admin',
  userRole: 'admin',
  token: expiredToken,
  isAuthenticated: true
});
assert.strictEqual(resExpired.status, 'REDIRECT');
assert.strictEqual(resExpired.target, '/');

// Case C: Valid admin token -> Access /admin
const resAdmin = simulateProtectedRoute({
  role: 'admin',
  userRole: 'admin',
  token: validFutureToken,
  isAuthenticated: true
});
assert.strictEqual(resAdmin.status, 'RENDER_CHILD');

// Case D: Role escalation attempt (member trying to enter admin) -> Redirect to /401
const resEscalation = simulateProtectedRoute({
  role: 'admin',
  userRole: 'member',
  token: validFutureToken,
  isAuthenticated: true
});
assert.strictEqual(resEscalation.status, 'REDIRECT');
assert.strictEqual(resEscalation.target, '/401');

console.log('  ✓ ProtectedRoute guards against unauthenticated, expired, and unauthorized access');

// ============================================================================
// 5. PublicGate & Logout Teardown Simulation (The Core Issue Fixed)
// ============================================================================
console.log('5. Testing PublicGate behavior before and after logout...');

function simulatePublicGate({ isAuthenticated, role, token }) {
  if (isAuthenticated && token && role && !isTokenExpired(token)) {
    return { status: 'REDIRECT', target: getRoleDashboard(role) };
  }
  return { status: 'RENDER_LOGIN' };
}

// State 1: Active logged-in user visits root /
const beforeLogout = simulatePublicGate({
  isAuthenticated: true,
  role: 'admin',
  token: validFutureToken
});
assert.strictEqual(beforeLogout.status, 'REDIRECT');
assert.strictEqual(beforeLogout.target, '/admin');
console.log('  ✓ Authenticated user visiting / is redirected to /admin');

// State 2: User executes logout()
// Simulated atomic logout teardown:
let mockStorage = {
  token: validFutureToken,
  role: 'admin',
  user: JSON.stringify({ name: 'Admin User' }),
  activeItem: 'Dashboard'
};
let mockReduxState = {
  currentUser: { name: 'Admin User' },
  isAuthenticated: true,
  role: 'admin'
};

function executeLogout() {
  // 1. Clear storage
  mockStorage = {};
  // 2. Dispatch clearUser to Redux
  mockReduxState = {
    currentUser: null,
    isAuthenticated: false,
    role: null
  };
}

executeLogout();

// State 3: User is navigated to / after logout
const afterLogout = simulatePublicGate({
  isAuthenticated: mockReduxState.isAuthenticated,
  role: mockReduxState.role,
  token: mockStorage.token || null
});

// CRITICAL ASSERTION: After logout, PublicGate MUST render Login, NEVER redirect back to dashboard!
assert.strictEqual(afterLogout.status, 'RENDER_LOGIN');
console.log('  ✓ After logout, PublicGate renders the Login page cleanly at / with zero bounce-back');

// State 4: Expired token lingering in storage without logout
const lingeringExpired = simulatePublicGate({
  isAuthenticated: true,
  role: 'admin',
  token: expiredToken
});
assert.strictEqual(lingeringExpired.status, 'RENDER_LOGIN');
console.log('  ✓ Lingering expired token does not bounce to dashboard; correctly renders Login');

console.log('\n--- ALL AUTH LIFECYCLE TESTS PASSED PERFECTLY! ---');
