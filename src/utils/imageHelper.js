/**
 * @file imageHelper.js
 * @description Centralized image URL normalization and Google Drive proxy resolver for The-Uniques-Portal.
 * Prevents ORB/CORP blocking, re-anchors proxy URLs to active backend, and provides graceful fallbacks.
 */
import { BASE_URL } from "@/config";

export const DEFAULT_PROXY_BASE = "https://the-uniques-portal.vercel.app";

/**
 * Extracts a Google Drive file ID from an object, URL, or raw ID string.
 * Supports:
 * - Object: { fileId: "..." }, { fileUrl: "..." }, { url: "..." }, { imageUrl: "..." }
 * - Direct UC URLs: https://drive.google.com/uc?id=XYZ&export=download
 * - File URLs: https://drive.google.com/file/d/XYZ/view or /preview
 * - Open/Thumbnail URLs: https://drive.google.com/open?id=XYZ or thumbnail?id=XYZ
 * - Usercontent URLs: https://drive.usercontent.google.com/download?id=XYZ
 * - Proxy URLs/paths: /api/image-proxy/XYZ or http://.../api/image-proxy/XYZ
 * - Raw Google Drive file IDs (alphanumeric string of length >= 20 without / or ?)
 * @param {string|Object} source
 * @returns {string|null}
 */
export const extractDriveFileId = (source) => {
  if (!source) return null;

  if (typeof source === "object") {
    if (source.fileId && typeof source.fileId === "string") {
      return extractDriveFileId(source.fileId);
    }
    const candidateUrl =
      source.fileUrl || source.url || source.imageUrl || source.src || source.image;
    if (candidateUrl && typeof candidateUrl === "string") {
      return extractDriveFileId(candidateUrl);
    }
    return null;
  }

  if (typeof source !== "string") return null;

  const trimmed = source.trim();
  if (!trimmed) return null;

  // Pattern 1: id query param (e.g. ?id=XYZ, &id=XYZ)
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Pattern 2: /d/XYZ or /d/XYZ/preview or /d/XYZ=w1200
  const dPathMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (dPathMatch && dPathMatch[1]) {
    return dPathMatch[1];
  }

  // Pattern 3: Image proxy path /api/image-proxy/:fileId (matching relative or with any host)
  const proxyMatch = trimmed.match(/(?:^|\/)api\/image-proxy\/([a-zA-Z0-9_-]+)/i);
  if (proxyMatch && proxyMatch[1]) {
    return proxyMatch[1];
  }

  // Pattern 4: Raw Drive ID without slashes, queries, or whitespace, length >= 20
  if (
    !trimmed.includes("/") &&
    !trimmed.includes("?") &&
    !trimmed.includes("&") &&
    !trimmed.includes(" ") &&
    trimmed.length >= 20
  ) {
    return trimmed;
  }

  return null;
};

/**
 * Returns a safe image URL that will NOT be blocked by Google's CORP / ORB policies.
 * Automatically routes Google Drive files through the backend image proxy.
 * Re-anchors proxy URLs to the active BASE_URL so images load cleanly across localhost and production.
 * @param {string|Object} source - Image source URL, path, or object
 * @param {string} [fallback="/projects/unicare.webp"] - Fallback image if source is empty or invalid
 * @returns {string} Safe displayable image URL
 */
export const getSafeImageUrl = (source, fallback = "/projects/unicare.webp") => {
  if (!source) return fallback;
  if (typeof source === "string" && !source.trim()) return fallback;

  // 1. If it's a Drive file, contains a Drive ID, or is an image-proxy path (relative or absolute)
  const fileId = extractDriveFileId(source);
  if (fileId) {
    const rawBase = BASE_URL && typeof BASE_URL === "string" ? BASE_URL.trim() : "";
    const prefix = rawBase ? rawBase.replace(/\/+$/, "") : "";
    return `${prefix}/api/image-proxy/${fileId}`;
  }

  // 2. If it's an object with a non-drive URL
  if (typeof source === "object" && source !== null) {
    const rawUrl = source.fileUrl || source.url || source.imageUrl || source.src || source.image;
    if (
      rawUrl &&
      typeof rawUrl === "string" &&
      !rawUrl.includes("drive.google.com") &&
      !rawUrl.includes("drive.usercontent.google.com")
    ) {
      return rawUrl.trim();
    }
    return fallback;
  }

  // 3. If it's already an external non-Drive URL, data URL, or local public asset path
  if (typeof source === "string") {
    const trimmed = source.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("/") ||
      trimmed.startsWith("data:")
    ) {
      if (
        trimmed.includes("drive.google.com") ||
        trimmed.includes("drive.usercontent.google.com")
      ) {
        return fallback;
      }
      return trimmed;
    }
  }

  return fallback;
};

export default getSafeImageUrl;
