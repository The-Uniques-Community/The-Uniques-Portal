/**
 * @file apiClient.js
 * @description Centralized Axios HTTP client instance managing base URL resolution,
 * token injection, error normalization, and 401 unauthenticated session termination.
 * @architecture Replaces all raw axios/fetch calls and global monkey-patching in config.js.
 */
import axios from 'axios';
import { clearAuthStorage } from '@/utils/authUtils';

let _storeInstance = null;

/**
 * Injects active Redux store instance to break circular dependency cycles.
 * @param {Object} store
 */
export const setStoreInstance = (store) => {
  _storeInstance = store;
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

    // 2. Attach JWT tokens
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

    // Global 401 Unauthorized handling (token expired or invalidated)
    if (status === 401) {
      console.warn('[ApiClient] 401 Unauthorized received - resetting session');
      clearAuthStorage();

      if (_storeInstance) {
        try {
          _storeInstance.dispatch({ type: 'user/clearUser' });
        } catch (e) {
          console.error('Failed to dispatch Redux logout action:', e);
        }
      }

      // Avoid infinite redirects if already on auth routes
      if (typeof window !== 'undefined' && window.location.pathname !== '/' && !window.location.pathname.startsWith('/auth') && window.location.pathname !== '/forget-password') {
        window.location.replace('/');
      }
    }

    return Promise.reject(new ApiError(errorMessage, status, errorData));
  }
);

export default apiClient;
