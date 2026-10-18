/**
 * @file authUtils.js
 * @description Authentication and authorization utilities for JWT inspection,
 * role normalization, permission verification, and client storage lifecycle.
 */

/**
 * Decodes base64url-encoded JWT payload without external library dependencies.
 * @param {string|null|undefined} token - JWT token string
 * @returns {Object|null} Decoded JSON payload or null if invalid
 */
export const decodeJwt = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload =
      typeof atob !== "undefined"
        ? atob(base64)
        : typeof Buffer !== "undefined"
        ? Buffer.from(base64, "base64").toString("utf-8")
        : null;

    if (!jsonPayload) return null;
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Checks whether a JWT token is expired based on its 'exp' claim.
 * @param {string|null|undefined} token - JWT token string
 * @returns {boolean} True if token is missing, malformed, or expired; false if valid
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeJwt(token);
  if (!decoded) return true;
  if (!decoded.exp) return false; // If no exp specified, consider valid
  // Exp is in seconds; Date.now() is in milliseconds
  return decoded.exp * 1000 <= Date.now();
};

/**
 * Normalizes role aliases into canonical portal role identifiers.
 * - 'superadmin' -> 'admin'
 * - 'communityadmin' -> 'coordinator'
 * @param {string|null|undefined} role - Raw role string
 * @returns {string} Canonical lowercase role
 */
export const normalizeRole = (role) => {
  if (!role || typeof role !== "string") return "";
  const r = role.toLowerCase().trim();
  if (r === "superadmin") return "admin";
  if (r === "communityadmin") return "coordinator";
  return r;
};

/**
 * Evaluates whether a user's role satisfies the required route role permission.
 * Supports single role string, array of allowed roles, and alias normalization.
 * @param {string|string[]|null|undefined} requiredRole - Role(s) permitted for access
 * @param {string|null|undefined} userRole - Current user's role
 * @returns {boolean} True if authorized, false otherwise
 */
export const isRoleAuthorized = (requiredRole, userRole) => {
  if (!requiredRole) return true; // Route permits any authenticated user
  if (!userRole) return false; // Role required but user has no role

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

/**
 * Reads and validates auth credentials from localStorage.
 * Automatically clears stale credentials if the token is expired.
 * @returns {{ token: string|null, role: string|null, user: Object|null, isAuthenticated: boolean }}
 */
export const getStoredAuth = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return { token: null, role: null, user: null, isAuthenticated: false };
  }

  try {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      if (token) {
        // Expired token detected - clean up
        clearAuthStorage();
      }
      return { token: null, role: null, user: null, isAuthenticated: false };
    }

    const role = localStorage.getItem("role") || null;
    let user = null;
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) user = JSON.parse(rawUser);
    } catch {
      user = null;
    }

    return {
      token,
      role,
      user,
      isAuthenticated: true,
    };
  } catch {
    return { token: null, role: null, user: null, isAuthenticated: false };
  }
};

/**
 * Persists verified authentication tokens, role, and profile to localStorage.
 * @param {{ token?: string, role?: string, user?: Object }} authData
 */
export const storeAuth = ({ token, role, user } = {}) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    if (token) localStorage.setItem("token", token);
    if (role) localStorage.setItem("role", role);
    if (user) {
      localStorage.setItem("user", typeof user === "string" ? user : JSON.stringify(user));
    }
  } catch (err) {
    console.error("[AuthUtils] Error persisting auth data to storage:", err);
  }
};

/**
 * Atomically flushes all client-side authentication tokens, cached roles, and session items.
 */
export const clearAuthStorage = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("activeItem");
    if (window.sessionStorage) {
      sessionStorage.clear();
    }
  } catch (err) {
    console.warn("[AuthUtils] Error clearing storage:", err);
  }
};
