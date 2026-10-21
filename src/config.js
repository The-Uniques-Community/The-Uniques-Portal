/**
 * @file config.js
 * @description Central configuration and backward-compatibility shim.
 * Re-exports BASE_URL and configured apiClient instance from the services layer.
 * Configures default Axios and window.fetch with credentials, tokens, and
 * seamless unauthenticated navigation to login.
 */
import axios from "axios";
import apiClient, { API_BASE_URL } from "@/services/apiClient";
import { isTokenError, handleUnauthenticatedSession } from "@/utils/authUtils";

export const BASE_URL = API_BASE_URL;

// Ensure default axios requests send cookies if directly called in legacy views
axios.defaults.withCredentials = true;

// 1. Request Interceptor on default axios: Inject Authorization header and token
axios.interceptors.request.use(
  (config) => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization && !config.headers.authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (!config.headers.token) {
        config.headers.token = token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor on default axios: Catch unauthenticated errors and redirect to login
axios.interceptors.response.use(
  (response) => {
    if (response?.data && isTokenError(response.status, response.data)) {
      const isAuthCall =
        response.config?.url?.includes("/auth/emaillogin") ||
        response.config?.url?.includes("/auth/login");
      if (!isAuthCall) {
        handleUnauthenticatedSession({ targetPath: "/" });
        return new Promise(() => {});
      }
    }
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const errorData = error.response ? error.response.data : null;
    const isAuthCall =
      error.config?.url?.includes("/auth/emaillogin") ||
      error.config?.url?.includes("/auth/login");

    if (isTokenError(status, errorData) && !isAuthCall) {
      handleUnauthenticatedSession({ targetPath: "/" });
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);

// 3. Wrap window.fetch for legacy views (Events/View.jsx, Budget.jsx, etc.)
if (typeof window !== "undefined" && typeof window.fetch === "function") {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    let [resource, config = {}] = args;
    config = { ...config };

    if (!config.credentials) {
      config.credentials = "include";
    }

    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      if (typeof Headers !== "undefined" && config.headers instanceof Headers) {
        if (!config.headers.has("Authorization") && !config.headers.has("authorization")) {
          config.headers.set("Authorization", `Bearer ${token}`);
        }
        if (!config.headers.has("token")) {
          config.headers.set("token", token);
        }
      } else if (Array.isArray(config.headers)) {
        const hasAuth = config.headers.some(([k]) => k.toLowerCase() === "authorization");
        if (!hasAuth) config.headers.push(["Authorization", `Bearer ${token}`]);
        const hasToken = config.headers.some(([k]) => k.toLowerCase() === "token");
        if (!hasToken) config.headers.push(["token", token]);
      } else {
        config.headers = {
          ...config.headers,
          Authorization: config.headers?.Authorization || config.headers?.authorization || `Bearer ${token}`,
          token: config.headers?.token || token,
        };
      }
    }

    try {
      const response = await originalFetch(resource, config);
      if (response.status === 401) {
        const urlStr = typeof resource === "string" ? resource : resource?.url || "";
        const isAuthCall = urlStr.includes("/auth/emaillogin") || urlStr.includes("/auth/login");
        if (!isAuthCall) {
          handleUnauthenticatedSession({ targetPath: "/" });
          return new Promise(() => {});
        }
      }
      return response;
    } catch (err) {
      throw err;
    }
  };
}

export { apiClient };
export default apiClient;
