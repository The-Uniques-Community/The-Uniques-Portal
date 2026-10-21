/**
 * @file apiClient.js
 * @description Centralized Axios HTTP client instance managing base URL resolution,
 * token injection, error normalization, and 401 unauthenticated session termination.
 * @architecture Replaces all raw axios/fetch calls and global monkey-patching in config.js.
 */
import axios from 'axios';
import { isTokenError, handleUnauthenticatedSession } from '@/utils/authUtils';

let _storeInstance = null;

/**
 * Injects active Redux store instance to break circular dependency cycles.
 * @param {Object} store
 */
export const setStoreInstance = (store) => {
  _storeInstance = store;
  if (typeof window !== 'undefined') {
    window.__REDUX_STORE__ = store;
  }
};

/**
 * Resolves the active base URL from environment variables or falls back to local dev server.
 */
export const API_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : ((typeof import.meta !== 'undefined' && import.meta.env?.DEV) ? 'http://localhost:5001' : ((typeof globalThis !== 'undefined' && globalThis.process) ? globalThis.process.env?.VITE_API_BASE_URL || 'http://localhost:5001' : ''));

/**
 * Custom application error class standardizing API failure representations.
 */
export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Primary configured Axios client instance.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor: Injects active JWT from storage and normalizes legacy paths.
 */
apiClient.interceptors.request.use(
  (config) => {
    // 1. Sanitize any legacy hardcoded URL prefixes if passed
    if (config.url) {
      config.url = config.url
        .replace(/^https?:\/\/theuniquesportal-server\.vercel\.app/, '')
        .replace(/^https?:\/\/localhost:500[01]/, '');
    }

    // 2. Safely extract signal from params if passed incorrectly
    if (config.params && config.params.signal) {
      if (!config.signal) {
        config.signal = config.params.signal;
      }
      delete config.params.signal;
    }

    // 3. Attach JWT tokens
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.token = token; // Legacy backend compatibility
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Standardizes error handling and catches 401 token expiry.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Catch cases where backend returns 200 with token error payload
    if (response?.data && isTokenError(response.status, response.data)) {
      const isAuthCall =
        response.config?.url?.includes('/auth/emaillogin') ||
        response.config?.url?.includes('/auth/login');
      if (!isAuthCall) {
        handleUnauthenticatedSession({ targetPath: '/' });
        return new Promise(() => {});
      }
    }
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const errorData = error.response ? error.response.data : null;
    const errorMessage =
      errorData?.message ||
      errorData?.error ||
      error.message ||
      'An unexpected network error occurred';

    // Global unauthenticated handling (token missing, invalid, or expired)
    if (isTokenError(status, errorData)) {
      const isAuthCall =
        error.config?.url?.includes('/auth/emaillogin') ||
        error.config?.url?.includes('/auth/login');

      // For explicit login attempts, allow rejection so the login form displays invalid credential notices
      if (isAuthCall) {
        return Promise.reject(new ApiError(errorMessage, status, errorData));
      }

      console.warn('[ApiClient] Unauthenticated token error encountered. Navigating to login:', errorMessage);
      handleUnauthenticatedSession({ targetPath: '/' });

      // Return a pending promise so calling components do not pop "No token provided" error toasts while navigating
      return new Promise(() => {});
    }

    return Promise.reject(new ApiError(errorMessage, status, errorData));
  }
);

export default apiClient;
