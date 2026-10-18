/**
 * @file useAuth.js
 * @description Custom React hook providing access to Redux user authentication state,
 * token validity, role, session verification, and atomic logout helper.
 */
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "@/services/authService";
import { getStoredAuth, isTokenExpired } from "@/utils/authUtils";

/**
 * Hook providing user session information, role authorization, and logout dispatcher.
 * @returns {{
 *   user: Object|null,
 *   token: string|null,
 *   role: string|null,
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   isExpired: boolean,
 *   logout: () => Promise<void>,
 *   verifySession: () => Promise<Object|null>
 * }}
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.user);

  // Read stored credentials with automatic expiry validation
  const stored = getStoredAuth();

  const token = stored.token;
  const role = auth?.role || stored.role || null;
  const user = auth?.currentUser || stored.user || null;
  const isExpired = isTokenExpired(token);
  const isAuthenticated = Boolean(auth?.isAuthenticated && token && !isExpired);
  const isLoading = Boolean(auth?.isLoading);

  const logout = useCallback(async () => {
    await authService.logout();
    navigate("/", { replace: true });
  }, [navigate]);

  const verifySession = useCallback(async () => {
    return await authService.verifySession();
  }, []);

  return useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated,
      isLoading,
      isExpired,
      logout,
      verifySession,
    }),
    [user, token, role, isAuthenticated, isLoading, isExpired, logout, verifySession]
  );
};

export default useAuth;
