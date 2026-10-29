/**
 * @file batchesData.js
 * @description Cohort batches registry managing local storage caching, backend synchronization, natural sorting, automatic next-batch suggestions, and membership lifecycle statuses.
 * @architecture Data utility serving member filters, project batch selectors, coordinator dashboards, and batch management panels. Integrates with `/api/batches` endpoints.
 * @agent_note Broadcasts the `batches-updated` CustomEvent on the window object upon state modifications. Enforces standard "The Uniques X.X" batch name format.
 */

import apiClient from "@/services/apiClient";
import { BASE_URL } from "@/config";
import { getMemberStatus } from "@/utils/memberStatus";

/**
 * @desc Default initial batches fallback array.
 * @type {string[]}
 */
export const DEFAULT_BATCHES = [];

const BATCH_STORAGE_KEY = "tu_community_member_batches";

/**
 * @desc Sorts batch name strings naturally based on their numeric version (e.g. 1.0 < 2.0 < 10.0).
 * @param {string[]} list - Array of batch name strings.
 * @returns {string[]} Sorted array of batch names.
 */
const sortBatchesNaturally = (list) => {
  return [...list].sort((a, b) => {
    const numA = parseFloat(String(a).match(/(\d+(\.\d+)?)/)?.[1] || 9999);
    const numB = parseFloat(String(b).match(/(\d+(\.\d+)?)/)?.[1] || 9999);
    if (numA !== numB) return numA - numB;
    return String(a).localeCompare(String(b));
  });
};

/**
 * @desc Retrieves stored cohort batch names from localStorage.
 * @returns {string[]} Array of unique, valid batch name strings.
 */
export const getStoredBatches = () => {
  try {
    const raw = localStorage.getItem(BATCH_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const valid = parsed.filter(
        (b) => typeof b === "string" && b.trim().length > 0 && !/-\d{10,}/.test(b)
      );
      return sortBatchesNaturally(valid.length > 0 ? Array.from(new Set(valid)) : []);
    }
    return [];
  } catch (err) {
    console.error("Error reading stored batches:", err);
    return [];
  }
};

/**
 * @desc Fetches registered batches from backend MongoDB, caches them in localStorage, and triggers a broadcast event.
 * @returns {Promise<string[]>} List of batch names.
 */
export const fetchBatches = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/batches/all`);
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      const valid = response.data.data.filter(
        (b) => typeof b === "string" && b.trim().length > 0 && !/-\d{10,}/.test(b)
      );
      const batches = sortBatchesNaturally(valid.length > 0 ? Array.from(new Set(valid)) : []);
      localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(batches));
      window.dispatchEvent(new CustomEvent("batches-updated", { detail: batches }));
      return batches;
    }
  } catch (err) {
    console.warn("Could not fetch batches from backend API, using cached:", err?.message || err);
  }
  return getStoredBatches();
};

/**
 * @desc Inspects currently registered batches and calculates the next incremented batch name (e.g. "The Uniques 6.0").
 * @param {string[]} [existingBatches=getStoredBatches()] - Existing batch names.
 * @returns {string} Suggested next batch title.
 */
export const suggestNextBatch = (existingBatches = getStoredBatches()) => {
  let maxNum = 0.0;
  existingBatches.forEach((b) => {
    const match = String(b).match(/(\d+(\.\d+)?)/);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  const nextNum = maxNum > 0 ? (Math.floor(maxNum) + 1).toFixed(1) : "1.0";
  return `The Uniques ${nextNum}`;
};

/**
 * @desc Formats and adds a new cohort batch, syncing with backend MongoDB and localStorage.
 * @param {string} batchName - Name of the batch to create.
 * @returns {Promise<string|null>} Formatted batch name or null if invalid.
 */
export const addStoredBatch = async (batchName) => {
  if (!batchName || !batchName.trim()) return null;
  let formatted = batchName.trim();
  if (
    !formatted.toLowerCase().startsWith("the uniques") &&
    !formatted.toLowerCase().startsWith("uniques")
  ) {
    formatted = `The Uniques ${formatted}`;
  } else if (formatted.toLowerCase().startsWith("uniques")) {
    formatted = `The ${formatted}`;
  }

  const current = getStoredBatches();
  if (!current.includes(formatted)) {
    // 1. Save in MongoDB first
    try {
      await apiClient.post(`${BASE_URL}/api/batches/add`, { name: formatted });
    } catch (err) {
      console.warn("Backend MongoDB notice for batch add:", err?.message || err);
    }

    // 2. After MongoDB operation, update local storage and broadcast to main webpage
    const updated = [...current, formatted];
    localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("batches-updated", { detail: updated })
    );
    return formatted;
  }
  return formatted;
};

/**
 * @desc Deletes a batch from MongoDB backend and localStorage, notifying listening UI views.
 * @param {string} batchName - Name of the batch to delete.
 * @returns {Promise<boolean>} True if successfully deleted.
 */
export const deleteStoredBatch = async (batchName) => {
  if (!batchName || !batchName.trim()) return false;
  const trimmed = batchName.trim();
  const cleanLabel = trimmed.replace(/^the\s+/i, "");
  const fullTitle = trimmed.toLowerCase().startsWith("the ") ? trimmed : `The ${trimmed}`;

  // 1. Delete from Backend MongoDB
  try {
    await apiClient.delete(`${BASE_URL}/api/batches/name/${encodeURIComponent(trimmed)}`);
  } catch (err) {
    console.warn("Backend MongoDB notice for batch delete:", err?.message || err);
  }

  // 2. Update local storage and broadcast to main webpage
  const current = getStoredBatches();
  const updated = current.filter(
    (b) =>
      b.toLowerCase() !== trimmed.toLowerCase() &&
      b.toLowerCase() !== fullTitle.toLowerCase() &&
      b.replace(/^the\s+/i, "").toLowerCase() !== cleanLabel.toLowerCase()
  );

  localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("batches-updated", { detail: updated }));
  return true;
};

/**
 * @desc Returns dynamic active, inactive, or suspended status for a cohort batch or member user based on graduation cutoffs.
 * @param {string|Object} batchOrUser - Batch name string or user profile object.
 * @returns {string} Calculated status string.
 */
export const getBatchStatus = (batchOrUser) => {
  if (!batchOrUser) return "inactive";

  const isUserObj = typeof batchOrUser === "object" && batchOrUser !== null;
  if (isUserObj) {
    return getMemberStatus(batchOrUser);
  }

  return getMemberStatus({ batch: String(batchOrUser) });
};
