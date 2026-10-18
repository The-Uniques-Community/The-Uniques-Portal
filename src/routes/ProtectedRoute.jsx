/**
 * @file ProtectedRoute.jsx
 * @description Role-based access control guard synchronizing Redux authentication state
 * with server token verification. Prevents unauthenticated access, role escalation,
 * and eliminates layout shift/waterfalls during client-side navigation.
 */
/* eslint-disable no-unused-vars */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/routes/paths";
import { isRoleAuthorized, isTokenExpired } from "@/utils/authUtils";

/**
 * Route protection gate ensuring user authentication and matching authorization role.
 * @param {Object} props
 * @param {string|string[]} [props.role] - Required role (or array of permitted roles) for access
 * @param {React.ReactElement} [props.element] - Child element to render if authorized
 * @param {string} [props.redirectPath] - Target path if unauthorized (defaults to PATHS.FORBIDDEN)
 * @returns {React.ReactElement}
 */
const ProtectedRoute = ({ role, element, redirectPath = PATHS.FORBIDDEN }) => {
  const { isAuthenticated, role: userRole, token } = useAuth();
  const location = useLocation();

  const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  const activeRole = userRole || (typeof window !== "undefined" ? localStorage.getItem("role") : null);
  const isExpired = isTokenExpired(activeToken);
  const hasAuth = Boolean(activeToken && !isExpired && (isAuthenticated || activeRole));

  // 1. Unauthenticated or expired gate: Redirect to login with source location state
  if (!hasAuth) {
    return <Navigate to={PATHS.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // 2. Role authorization gate: Verify role permissions
  if (role && !isRoleAuthorized(role, activeRole)) {
    console.warn(`[ProtectedRoute] Role mismatch: required "${role}", found "${activeRole}". Redirecting.`);
    return <Navigate to={redirectPath} replace />;
  }

  // 3. Authorized: Render element or Outlet
  return element ? element : <Outlet />;
};

export default ProtectedRoute;
