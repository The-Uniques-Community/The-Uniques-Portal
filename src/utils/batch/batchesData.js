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

const sortBatchesNaturally = (list) => {
  return [...list].sort((a, b) => {
    const numA = parseFloat(String(a).match(/(\d+(\.\d+)?)/)?.[1] || 9999);
    const numB = parseFloat(String(b).match(/(\d+(\.\d+)?)/)?.[1] || 9999);
    if (numA !== numB) return numA - numB;
    return String(a).localeCompare(String(b));
  });
};

export const getStoredBatches = () => {
  try {
    const raw = localStorage.getItem(BATCH_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(DEFAULT_BATCHES));
      return [...DEFAULT_BATCHES];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const valid = parsed.filter(
        (b) => typeof b === "string" && b.trim().length > 0 && !/-\d{10,}/.test(b)
      );
      return sortBatchesNaturally(valid.length > 0 ? Array.from(new Set(valid)) : DEFAULT_BATCHES);
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
      const valid = response.data.data.filter(
        (b) => typeof b === "string" && b.trim().length > 0 && !/-\d{10,}/.test(b)
      );
      const batches = sortBatchesNaturally(valid.length > 0 ? Array.from(new Set(valid)) : DEFAULT_BATCHES);
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
