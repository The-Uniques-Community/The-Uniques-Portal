/**
 * @file useAuth.js
 * @description Custom React hook providing access to Redux user authentication state, token, role, and logout helper.
 * @architecture Consumes state.user from Redux store and coordinates logout with Redux actions and navigation.
 */
import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "@/redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "@/config";

/**
 * Hook providing user session information and logout dispatcher.
 * @returns {{
 *   user: Object|null,
 *   token: string|null,
 *   role: string|null,
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   logout: () => Promise<void>
 * }}
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.user);

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Backend logout failed:", err);
    } finally {
      delete axios.defaults.headers.common["Authorization"];
      dispatch(logoutAction());
      navigate("/auth/login", { replace: true });
    }
  };

  return {
    user: auth?.currentUser || null,
    token: auth?.token || null,
    role: auth?.role || null,
    isAuthenticated: Boolean(auth?.isAuthenticated),
    isLoading: Boolean(auth?.isLoading),
    logout,
  };
};

export default useAuth;
