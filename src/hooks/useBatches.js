/**
 * @file useBatches.js
 * @description Custom React hook providing dynamic community cohort batches fetched from the backend API.
 * Subscribes to local storage cache and window broadcast events for real-time synchronization across views.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchBatches, getStoredBatches } from "@/utils/batch/batchesData";

/**
 * Normalizes any batch string to short form (e.g. "Uniques 1.0" or "Uniques 4.0")
 */
export const formatBatchLabel = (batch) => {
  if (!batch) return "";
  return String(batch)
    .replace(/^the\s*uniques\s*/i, "Uniques ")
    .replace(/^theuniques\s*/i, "Uniques ")
    .replace(/^the\s+/i, "")
    .trim();
};

/**
 * Normalizes any batch string to full canonical form (e.g. "The Uniques 1.0")
 */
export const formatFullBatchName = (batch) => {
  if (!batch) return "";
  const trimmed = String(batch).trim();
  if (trimmed.toLowerCase().startsWith("the uniques")) {
    return trimmed;
  }
  if (trimmed.toLowerCase().startsWith("uniques")) {
    return `The ${trimmed}`;
  }
  return `The Uniques ${trimmed}`;
};

export function useBatches() {
  const [batches, setBatches] = useState(() => getStoredBatches());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBatches();
      if (Array.isArray(data) && data.length > 0) {
        setBatches(data);
      }
    } catch (err) {
      console.warn("useBatches fetch failed:", err?.message || err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();

    const handleUpdate = (e) => {
      if (Array.isArray(e.detail) && e.detail.length > 0) {
        setBatches(e.detail);
      }
    };

    window.addEventListener("batches-updated", handleUpdate);
    return () => window.removeEventListener("batches-updated", handleUpdate);
  }, [loadBatches]);

  const labels = useMemo(() => {
    return batches.map(formatBatchLabel);
  }, [batches]);

  return {
    batches,
    labels,
    loading,
    error,
    refetch: loadBatches,
    formatBatchLabel,
    formatFullBatchName,
  };
}

export default useBatches;
