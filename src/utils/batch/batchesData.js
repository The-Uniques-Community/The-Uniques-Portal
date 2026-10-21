import apiClient from "@/services/apiClient";
import { BASE_URL } from "@/config";
import { getMemberStatus } from "@/utils/memberStatus";

export const DEFAULT_BATCHES = [
  "The Uniques 1.0",
  "The Uniques 2.0",
  "The Uniques 3.0",
  "The Uniques 4.0",
  "The Uniques 5.0",
  "The Uniques 6.0",
];

const BATCH_STORAGE_KEY = "tu_community_member_batches";

export const getStoredBatches = () => {
  try {
    const raw = localStorage.getItem(BATCH_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(DEFAULT_BATCHES));
      return [...DEFAULT_BATCHES];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const merged = [...DEFAULT_BATCHES];
      parsed.forEach((b) => {
        if (b && !merged.includes(b)) {
          merged.push(b);
        }
      });
      return merged;
    }
    return [...DEFAULT_BATCHES];
  } catch (err) {
    console.error("Error reading stored batches:", err);
    return [...DEFAULT_BATCHES];
  }
};

export const fetchBatches = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/batches/all`);
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      const batches = response.data.data;
      localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(batches));
      window.dispatchEvent(new CustomEvent("batches-updated", { detail: batches }));
      return batches;
    }
  } catch (err) {
    console.warn("Could not fetch batches from backend API, using cached:", err?.message || err);
  }
  return getStoredBatches();
};

export const suggestNextBatch = (existingBatches = getStoredBatches()) => {
  let maxNum = 4.0;
  existingBatches.forEach((b) => {
    const match = String(b).match(/(\d+(\.\d+)?)/);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  const nextNum = (Math.floor(maxNum) + 1).toFixed(1);
  return `The Uniques ${nextNum}`;
};

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
 * Returns dynamic active/inactive/suspended status based on graduation cutoff:
 * Honors suspended/blocked states and calculates status on the fly.
 */
export const getBatchStatus = (batchOrUser) => {
  if (!batchOrUser) return "inactive";

  const isUserObj = typeof batchOrUser === "object" && batchOrUser !== null;
  if (isUserObj) {
    return getMemberStatus(batchOrUser);
  }

  return getMemberStatus({ batch: String(batchOrUser) });
};
