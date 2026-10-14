import axios from "axios";
import { BASE_URL } from "@/config";

export const DEFAULT_BATCHES = [
  "The Uniques 1.0",
  "The Uniques 2.0",
  "The Uniques 3.0",
  "The Uniques 4.0",
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
    const response = await axios.get(`${BASE_URL}/api/batches/all`);
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
      await axios.post(`${BASE_URL}/api/batches/add`, { name: formatted });
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
 * Returns active/inactive status based on batch cohort:
 * - Batches 1.0, 2.0, 3.0 -> "inactive"
 * - Batch 4.0 (and 5.0+) -> "active"
 * - Honors suspended / blocked states if user object is provided
 */
export const getBatchStatus = (batchOrUser) => {
  if (!batchOrUser) return "inactive";

  const isUserObj = typeof batchOrUser === "object" && batchOrUser !== null;
  const batchStr = isUserObj ? (batchOrUser.batch || "") : String(batchOrUser);
  
  if (isUserObj) {
    if (batchOrUser.isSuspended) return "suspended";
    if (batchOrUser.profileStatus === "blocked") return "blocked";
  }

  const lower = batchStr.toLowerCase().trim();

  // Batches 1.0, 2.0, 3.0 are inactive (graduated batches)
  if (
    lower.includes("1.0") ||
    lower.includes("2.0") ||
    lower.includes("3.0") ||
    lower.endsWith("1.0") ||
    lower.endsWith("2.0") ||
    lower.endsWith("3.0")
  ) {
    return "inactive";
  }

  // Batch 4.0, 5.0 and newer batches are active
  if (
    lower.includes("4.0") ||
    lower.includes("5.0") ||
    lower.includes("6.0") ||
    lower.includes("7.0") ||
    lower.includes("8.0") ||
    lower.includes("9.0")
  ) {
    return "active";
  }

  if (isUserObj && batchOrUser.profileStatus) {
    return batchOrUser.profileStatus;
  }

  return "active";
};
