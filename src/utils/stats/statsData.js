/**
 * @file statsData.js
 * @description Community impact metrics data manager providing resilient local storage caching, API synchronization, and real-time custom event broadcasts for key headline counters.
 * @architecture Supplies headline metrics (Earnings, Clients, Projects, Events) to landing page counters, member/admin dashboards, and statistical overview views.
 * @agent_note Interacts with `/api/stats` and `/api/stats/update`. Broadcasts `stats-updated` CustomEvents on the window object so all active UI widgets synchronize in real time.
 */

import apiClient from "@/services/apiClient";
import { BASE_URL } from "@/config";

/**
 * @desc Baseline fallback numbers for community headline metrics.
 * @type {{Earnings: number, Clients: number, Projects: number, Events: number}}
 */
export const DEFAULT_STATS = {
  Earnings: 0,
  Clients: 0,
  Projects: 0,
  Events: 0,
};

const STATS_STORAGE_KEY = "tu_community_stats";

/**
 * @desc Retrieves cached metrics from localStorage or initializes them with default values.
 * @returns {{Earnings: number, Clients: number, Projects: number, Events: number}} Stored statistics map.
 */
export const getStoredStats = () => {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(DEFAULT_STATS));
      return { ...DEFAULT_STATS };
    }
    const parsed = JSON.parse(raw);
    return {
      Earnings: Number(parsed.Earnings) || DEFAULT_STATS.Earnings,
      Clients: Number(parsed.Clients) || DEFAULT_STATS.Clients,
      Projects: Number(parsed.Projects) || DEFAULT_STATS.Projects,
      Events: Number(parsed.Events) || DEFAULT_STATS.Events,
    };
  } catch (err) {
    console.error("Error reading stored stats:", err);
    return { ...DEFAULT_STATS };
  }
};

/**
 * @desc Fetches current headline statistics from backend API, updates cache, and dispatches a broadcast update.
 * @returns {Promise<{Earnings: number, Clients: number, Projects: number, Events: number}>} Current stats metrics.
 */
export const fetchStats = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/stats`);
    if (response.data && response.data.success && response.data.data) {
      const stats = {
        Earnings: Number(response.data.data.Earnings) || DEFAULT_STATS.Earnings,
        Clients: Number(response.data.data.Clients) || DEFAULT_STATS.Clients,
        Projects: Number(response.data.data.Projects) || DEFAULT_STATS.Projects,
        Events: Number(response.data.data.Events) || DEFAULT_STATS.Events,
      };
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
      window.dispatchEvent(new CustomEvent("stats-updated", { detail: stats }));
      return stats;
    }
  } catch (err) {
    console.warn("Could not fetch stats from backend API, using cached:", err?.message || err);
  }
  return getStoredStats();
};

/**
 * @desc Persists modified metrics to MongoDB database first, updates local storage cache, and dispatches a window event.
 * @param {Object} newStats - Updated metrics values.
 * @returns {Promise<{Earnings: number, Clients: number, Projects: number, Events: number}>} Confirmed saved stats.
 */
export const saveStoredStats = async (newStats) => {
  const payload = {
    Earnings: Number(newStats.Earnings) || 0,
    Clients: Number(newStats.Clients) || 0,
    Projects: Number(newStats.Projects) || 0,
    Events: Number(newStats.Events) || 0,
  };

  let savedData = payload;

  // 1. Save to MongoDB database first
  try {
    const response = await apiClient.post(`${BASE_URL}/api/stats/update`, payload);
    if (response.data && response.data.success && response.data.data) {
      const data = response.data.data;
      savedData = {
        Earnings: data.Earnings != null && !isNaN(Number(data.Earnings)) ? Number(data.Earnings) : payload.Earnings,
        Clients: data.Clients != null && !isNaN(Number(data.Clients)) ? Number(data.Clients) : payload.Clients,
        Projects: data.Projects != null && !isNaN(Number(data.Projects)) ? Number(data.Projects) : payload.Projects,
        Events: data.Events != null && !isNaN(Number(data.Events)) ? Number(data.Events) : payload.Events,
      };
    }
  } catch (err) {
    console.warn("Backend save notice:", err?.message || err);
  }

  // 2. After MongoDB operation, update local storage and broadcast to main webpage
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(savedData));
  window.dispatchEvent(new CustomEvent("stats-updated", { detail: savedData }));
  return savedData;
};

/**
 * @desc Resets all metrics to default zero values across database and localStorage.
 * @returns {Promise<{Earnings: number, Clients: number, Projects: number, Events: number}>} Default stats.
 */
export const resetStoredStats = async () => {
  return await saveStoredStats(DEFAULT_STATS);
};
