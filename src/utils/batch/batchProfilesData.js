import apiClient from "@/services/apiClient";
import { BASE_URL } from "@/config";
import uniques1 from "@/assets/img/About/uniques1.webp";
import uniques2 from "@/assets/img/About/uniques2.webp";
import uniques3 from "@/assets/img/About/uniques3.webp";
import uniques4 from "@/assets/img/About/uniques4.webp";
import { getStoredBatches } from "./batchesData";
import { getSafeImageUrl } from "../imageHelper";

export const DEFAULT_BATCH_PROFILES = [];

const PROFILES_STORAGE_KEY = "tu_community_batch_profiles";

const sortProfilesNaturally = (list) => {
  return [...list].sort((a, b) => {
    const nameA = a.label || a.title || "";
    const nameB = b.label || b.title || "";
    const numA = parseFloat(String(nameA).match(/(\d+(\.\d+)?)/)?.[1] || 9999);
    const numB = parseFloat(String(nameB).match(/(\d+(\.\d+)?)/)?.[1] || 9999);
    if (numA !== numB) return numA - numB;
    return String(nameA).localeCompare(String(nameB));
  });
};

export const getStoredBatchProfiles = () => {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    let profiles = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        profiles = parsed.map((p) => {
          return {
            ...p,
            image: getSafeImageUrl(p.image, uniques4),
          };
        });
      }
    }

    const memberBatches = getStoredBatches();
    if (profiles.length === 0 && memberBatches.length === 0) {
      return [];
    }

    memberBatches.forEach((batchName) => {
      const label = batchName.replace(/^The\s+/i, "");
      const exists = profiles.some(
        (p) => p.label?.toLowerCase() === label.toLowerCase() || p.title?.toLowerCase() === batchName.toLowerCase()
      );
      if (!exists) {
        profiles.push({
          id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          label: label,
          title: batchName,
          description: `${batchName} is actively engaged in advanced skills training, projects, and innovation within The Uniques Community.`,
          image: uniques4,
          customImage: false,
        });
      }
    });

    const validProfiles = profiles.filter(
      (p) => !/-\d{10,}/.test(p.title || "") && !/-\d{10,}/.test(p.label || "")
    );
    return sortProfilesNaturally(validProfiles);
  } catch (err) {
    console.error("Error reading stored batch profiles:", err);
    return [];
  }
};

export const fetchBatchProfiles = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/batches/profiles`);
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      const remoteProfiles = response.data.data.map((p) => {
        return {
          ...p,
          image: getSafeImageUrl(p.image, uniques4),
        };
      });
      const validProfiles = remoteProfiles.filter(
        (p) => !/-\d{10,}/.test(p.title || "") && !/-\d{10,}/.test(p.label || "")
      );
      const sorted = sortProfilesNaturally(validProfiles);
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(sorted));
      window.dispatchEvent(new CustomEvent("batch-profiles-updated", { detail: sorted }));
      return sorted;
    }
  } catch (err) {
    console.warn("Could not fetch batch profiles from server, using cached:", err?.message || err);
  }
  return getStoredBatchProfiles();
};

/**
 * Uploads a cohort batch profile picture to Google Drive via backend multipart endpoint.
 * Returns { fileId, fileUrl, fileName, proxyUrl } so only the 40-byte URL is stored in database.
 * @param {File} file - Image file to upload
 * @param {string} [batchName] - Name of the cohort batch
 * @param {string} [batchId] - Optional existing batch ID to link directly
 * @returns {Promise<{fileId: string, fileUrl: string, fileName: string, proxyUrl: string}>}
 */
export const uploadBatchImage = async (file, batchName = "General Batches", batchId = null) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("batch", batchName);
  formData.append("batchName", batchName);
  if (batchId) formData.append("batchId", batchId);

  const response = await apiClient.post(`${BASE_URL}/upload/batch_file_upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data?.file;
};

export const saveStoredBatchProfiles = async (profiles) => {
  try {
    const toSave = profiles.map((p) => {
      const isCustom = Boolean(
        p.image &&
        (typeof p.image === "string") &&
        (p.image.startsWith("data:") || p.image.startsWith("http://") || p.image.startsWith("https://") || p.image.startsWith("/api/"))
      );
      return {
        id: p.id,
        label: p.label,
        title: p.title,
        description: p.description,
        image: isCustom ? p.image : "",
        customImage: isCustom,
      };
    });

    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(toSave));
    window.dispatchEvent(new CustomEvent("batch-profiles-updated", { detail: profiles }));
    const response = await apiClient.post(`${BASE_URL}/api/batches/profiles/update`, { profiles: toSave });
    if (response?.data?.data && Array.isArray(response.data.data)) {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(response.data.data));
    }
    return true;
  } catch (err) {
    console.error("Error saving batch profiles:", err);
    return false;
  }
};

export const updateSingleBatchProfile = async (updatedProfile) => {
  const current = getStoredBatchProfiles();
  const index = current.findIndex(
    (p) => (updatedProfile.id && p.id === updatedProfile.id) || p.label === updatedProfile.label
  );

  let updatedList;
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = { ...updatedList[index], ...updatedProfile };
  } else {
    updatedList = [...current, updatedProfile];
  }

  // Update local cache immediately for zero-latency UI
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("batch-profiles-updated", { detail: updatedList }));

  // Send ONLY the single modified profile to backend (< 1 KB payload!)
  try {
    const isCustom = Boolean(
      updatedProfile.image &&
      (typeof updatedProfile.image === "string") &&
      (updatedProfile.image.startsWith("data:") ||
        updatedProfile.image.startsWith("http://") ||
        updatedProfile.image.startsWith("https://") ||
        updatedProfile.image.startsWith("/api/"))
    );

    const singlePayload = {
      id: updatedProfile.id,
      label: updatedProfile.label,
      title: updatedProfile.title,
      description: updatedProfile.description,
      image: isCustom ? updatedProfile.image : "",
      customImage: isCustom,
    };

    const response = await apiClient.post(`${BASE_URL}/api/batches/profiles/update`, {
      profile: singlePayload,
    });

    if (response?.data?.data && Array.isArray(response.data.data)) {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(response.data.data));
    }
    return true;
  } catch (err) {
    console.error("Error saving single batch profile:", err);
    return false;
  }
};

export const deleteStoredBatchProfile = async (identifier) => {
  if (!identifier) return getStoredBatchProfiles();
  const cleanId = String(identifier).trim().toLowerCase();
  const cleanLabel = cleanId.replace(/^the\s+/i, "").replace(/^uniques\s*/i, "").trim();

  // 1. Delete from Backend MongoDB
  try {
    await apiClient.delete(`${BASE_URL}/api/batches/name/${encodeURIComponent(identifier)}`);
  } catch (err) {
    console.warn("Backend notice for batch profile delete:", err?.message || err);
  }

  // 2. Update local profiles
  const current = getStoredBatchProfiles();
  const updated = current.filter(
    (p) =>
      p.id?.toLowerCase() !== cleanId &&
      p.label?.toLowerCase() !== cleanId &&
      p.label?.toLowerCase() !== `uniques ${cleanLabel}` &&
      p.title?.toLowerCase() !== cleanId
  );

  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("batch-profiles-updated", { detail: updated }));
  return updated;
};

export const resetStoredBatchProfiles = () => {
  try {
    localStorage.removeItem(PROFILES_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("batch-profiles-updated", { detail: [] })
    );
    return [];
  } catch (err) {
    console.error("Error resetting batch profiles:", err);
    return [];
  }
};
