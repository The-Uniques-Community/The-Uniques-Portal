/**
 * @file config.js
 * @description Central configuration and backward-compatibility shim.
 * Re-exports BASE_URL and configured apiClient instance from the services layer.
 */
import axios from "axios";
import apiClient, { API_BASE_URL } from "@/services/apiClient";

export const BASE_URL = API_BASE_URL;

// Ensure default axios requests send cookies if directly called in legacy views
axios.defaults.withCredentials = true;

export { apiClient };
export default apiClient;
