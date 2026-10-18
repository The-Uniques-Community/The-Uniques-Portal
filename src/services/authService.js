/**
 * @file authService.js
 * @description Centralized authentication and session management operations.
 * Coordinates network requests, token persistence, Redux state synchronization,
 * and session lifecycle teardown.
 */
import apiClient from "./apiClient";
import store from "@/redux/store";
import { setUser, clearUser } from "@/redux/slices/userSlice";
import { storeAuth, clearAuthStorage } from "@/utils/authUtils";

export const authService = {
  /**
   * Performs email + password login and stores session state.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<Object>} Backend login payload
   */
  async emailLogin(credentials) {
    const response = await apiClient.post("/auth/emaillogin", credentials);
    const data = response.data;

    const token = data.token;
    const role = data.role || data.member?.role;
    const member = data.member || { email: credentials.email, role };

    if (token) {
      storeAuth({ token, role, user: member });
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      apiClient.defaults.headers.common["token"] = token;
    }

    try {
      store.dispatch(setUser({ ...member, role }));
    } catch (e) {
      console.error("[authService] Failed to dispatch setUser:", e);
    }

    return data;
  },

  /**
   * Verifies current session token with the backend.
   * Syncs latest verified user and role into storage and Redux store.
   * @returns {Promise<Object|null>} Verified user document or null if unauthenticated
   */
  async verifySession() {
    try {
      const response = await apiClient.get("/auth/verify_user");
      const user = response.data?.user;
      if (user) {
        const role = user.role;
        storeAuth({ role, user });
        store.dispatch(setUser(user));
        return user;
      }
      return null;
    } catch (err) {
      // 401 or network failure - session is invalid
      if (err.status === 401 || err.response?.status === 401) {
        await this.logout();
      }
      return null;
    }
  },

  /**
   * Verifies whether the authenticated session holds a specific role.
   * @param {string} role
   * @returns {Promise<Object>}
   */
  async verifyRole(role) {
    const response = await apiClient.get("/auth/verify_role", { params: { role } });
    return response.data;
  },

  /**
   * Terminates active user session comprehensively.
   * 1. Notifies backend to invalidate HTTP-only cookie.
   * 2. Clears all browser storage (token, role, user, activeItem).
   * 3. Resets Axios authorization headers.
   * 4. Dispatches clearUser to reset Redux store in memory.
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      console.warn("[authService] Backend logout endpoint failed:", e.message);
    } finally {
      // 1. Flush localStorage and sessionStorage
      clearAuthStorage();

      // 2. Wipe Axios default headers
      delete apiClient.defaults.headers.common["Authorization"];
      delete apiClient.defaults.headers.common["token"];

      // 3. Reset Redux store
      try {
        store.dispatch(clearUser());
      } catch (e) {
        console.error("[authService] Failed to dispatch clearUser to store:", e);
      }
    }
  },

  async sendPasswordResetOtp(email) {
    const response = await apiClient.post("/auth/password-reset/send-otp", { email });
    return response.data;
  },

  async verifyPasswordResetOtp(email, otp) {
    const response = await apiClient.post("/auth/password-reset/verify-otp", { email, otp });
    return response.data;
  },

  async resetPassword(payload) {
    const response = await apiClient.post("/auth/password-reset/reset-password", payload);
    return response.data;
  },
};

export default authService;
