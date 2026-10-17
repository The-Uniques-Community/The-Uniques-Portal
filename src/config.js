import axios from "axios";
export const BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.DEV ? "http://localhost:5001" : "");

axios.defaults.withCredentials = true;

// Automatically rewrite stale URLs and attach JWT token to axios requests
axios.interceptors.request.use(
  (config) => {
    if (config.url) {
      config.url = config.url
        .replace("https://theuniquesportal-server.vercel.app", BASE_URL)
        .replace("http://localhost:5000", BASE_URL);
    }
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.token = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept window.fetch so all fetch calls in legacy components also get auth header and correct BASE_URL
if (typeof window !== "undefined" && window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function (input, init = {}) {
    let url = typeof input === "string" ? input : (input instanceof Request ? input.url : input);
    if (typeof url === "string") {
      url = url
        .replace("https://theuniquesportal-server.vercel.app", BASE_URL)
        .replace("http://localhost:5000", BASE_URL);
    }

    const token = localStorage.getItem("token");
    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : {}));
    if (token) {
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      if (!headers.has("token")) {
        headers.set("token", token);
      }
    }

    const modifiedInit = {
      ...init,
      headers,
      credentials: init.credentials || "include",
    };

    return originalFetch(url, modifiedInit);
  };
}
