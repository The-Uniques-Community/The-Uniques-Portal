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
    const storage = window.localStorage || (typeof localStorage !== "undefined" ? localStorage : null);
    if (storage) {
      storage.removeItem("token");
      storage.removeItem("user");
      storage.removeItem("role");
      storage.removeItem("activeItem");
    }
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }
  } catch (err) {
    console.warn("[AuthUtils] Error clearing storage:", err);
  }
};

/**
 * Checks whether an HTTP status code or response payload indicates a missing/invalid token.
 * 
 * @param {number|null|undefined} status - HTTP status code
 * @param {Object|null|undefined} data - Response payload body
 * @returns {boolean}
 */
export const isTokenError = (status, data) => {
  if (status === 401) return true;
  const msg = (data?.error || data?.message || "").toString().toLowerCase();
  return (
    msg.includes("no token provided") ||
    msg.includes("invalid token") ||
    msg.includes("jwt expired") ||
    msg.includes("token expired") ||
    msg.includes("jwt must be provided") ||
    msg.includes("jwt malformed") ||
    msg.includes("authentication required")
  );
};

let isRedirectingToLogin = false;

/**
 * Resets the redirect debounce state (useful for unit tests or re-mounting).
 */
export const resetAuthRedirectState = () => {
  isRedirectingToLogin = false;
};

/**
 * Handles an unauthenticated session state across the application.
 * Purges cached tokens, resets Redux user state, and navigates cleanly to login.
 * 
 * @param {Object} [options]
 * @param {string} [options.targetPath="/"]
 */
export const handleUnauthenticatedSession = (options = {}) => {
  const { targetPath = "/" } = options;

  // 1. Purge storage credentials immediately
  clearAuthStorage();

  // 2. Dispatch Redux logout action if store is available
  if (typeof window !== "undefined" && window.__REDUX_STORE__) {
    try {
      window.__REDUX_STORE__.dispatch({ type: "user/clearUser" });
    } catch (e) {
      console.warn("[AuthUtils] Failed to dispatch Redux clearUser:", e);
    }
  }

  // 3. Navigate to login if not already on an authentication route
  if (typeof window !== "undefined" && window.location) {
    const currentPath = window.location.pathname;
    const isAuthRoute =
      currentPath === "/" ||
      currentPath === "/login" ||
      currentPath === "/auth" ||
      currentPath === "/auth/login" ||
      currentPath === "/forget-password";

    if (!isAuthRoute && !isRedirectingToLogin) {
      isRedirectingToLogin = true;
      console.warn("[AuthUtils] Unauthenticated session detected. Redirecting to login:", targetPath);
      window.location.replace(targetPath);
      setTimeout(() => {
        isRedirectingToLogin = false;
      }, 3000);
    }
  }
};
