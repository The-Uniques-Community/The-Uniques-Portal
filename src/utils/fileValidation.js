import { toast } from "react-toastify";

/**
 * Standard presets for file upload validation across the frontend.
 * Each preset specifies supported file extensions, MIME types, HTML accept string,
 * relaxed maximum file size limit, and standard user-facing error messages.
 */
export const FILE_VALIDATION_PRESETS = {
  AVATAR: {
    name: "AVATAR",
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB for profile avatars / cards
    maxSizeLabel: "5 MB",
    errorMessage: "Invalid file type. Only JPG, PNG, and WEBP image files are allowed.",
  },
  IMAGE: {
    name: "IMAGE",
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB for event banners, galleries, covers
    maxSizeLabel: "10 MB",
    errorMessage: "Invalid file type. Only JPG, PNG, and WEBP image files are allowed.",
  },
  RECEIPT: {
    name: "RECEIPT",
    extensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    accept: ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp",
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB for payment proofs & financial receipts
    maxSizeLabel: "10 MB",
    errorMessage: "Invalid file type. Please upload a receipt in PDF, JPG, PNG, or WEBP format.",
  },
  CERTIFICATE: {
    name: "CERTIFICATE",
    extensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    accept: ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp",
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB for course/degree certificates
    maxSizeLabel: "10 MB",
    errorMessage: "Invalid file type. Please upload a certificate in PDF, JPG, PNG, or WEBP format.",
  },
  DOCUMENT_OR_IMAGE: {
    name: "DOCUMENT_OR_IMAGE",
    extensions: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".webp"],
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp",
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB for reports & task deliverables
    maxSizeLabel: "10 MB",
    errorMessage: "Invalid file type. Only PDF, Word documents, and images (JPG, PNG, WEBP) are allowed.",
  },
};

/**
 * Formats a byte size into a concise, human-readable string (e.g. "10 MB", "4.2 MB", "500 KB").
 * 
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (typeof bytes !== "number" || isNaN(bytes) || bytes < 0) return "0 B";
  if (bytes >= 1024 * 1024 * 1024) {
    const val = bytes / (1024 * 1024 * 1024);
    return `${Number.isInteger(val) ? val : Number(val.toFixed(1))} GB`;
  }
  if (bytes >= 1024 * 1024) {
    const val = bytes / (1024 * 1024);
    return `${Number.isInteger(val) ? val : Number(val.toFixed(1))} MB`;
  }
  if (bytes >= 1024) {
    const val = bytes / 1024;
    return `${Number.isInteger(val) ? val : Number(val.toFixed(1))} KB`;
  }
  return `${bytes} B`;
};

/**
 * Safely resets an HTML file input element value to allow re-selection of the same or corrected file.
 * Accepts an event object, a React ref, or an HTMLInputElement directly.
 * 
 * @param {Event|React.RefObject|HTMLInputElement|null} target
 */
export const resetFileInput = (target) => {
  if (!target) return;
  try {
    if (target.target && typeof target.target.value !== "undefined") {
      target.target.value = "";
    } else if (target.current && typeof target.current.value !== "undefined") {
      target.current.value = "";
    } else if (typeof target.value !== "undefined") {
      target.value = "";
    }
  } catch (err) {
    console.warn("[fileValidation] Failed to reset file input value:", err);
  }
};

/**
 * Checks whether a single file matches the allowed extensions and MIME types in a preset.
 * 
 * @param {File} file
 * @param {Object} preset - One of FILE_VALIDATION_PRESETS
 * @returns {boolean}
 */
export const isFileTypeValid = (file, preset) => {
  if (!file || !preset) return false;

  const fileName = (file.name || "").trim().toLowerCase();
  const fileType = (file.type || "").trim().toLowerCase();

  const extMatch = fileName.match(/\.[^.]+$/);
  const ext = extMatch ? extMatch[0] : "";

  // Check extension match
  const matchesExt = Boolean(ext && preset.extensions.includes(ext));

  // Check MIME type match
  const matchesMime = Boolean(fileType && preset.mimeTypes.includes(fileType));

  // If MIME is known and explicitly disallowed, fail early
  if (fileType && !matchesMime && !fileType.startsWith("application/octet-stream")) {
    return false;
  }

  // File is valid if extension matches or MIME type matches
  return matchesExt || matchesMime;
};

/**
 * Checks whether a file is within the maximum size limit defined in the preset.
 * 
 * @param {File} file
 * @param {Object} preset - One of FILE_VALIDATION_PRESETS
 * @returns {boolean}
 */
export const isFileSizeValid = (file, preset) => {
  if (!file || !preset) return false;
  if (typeof file.size !== "number") return true; // Can't determine size in mock/env, defer to server
  const maxBytes = preset.maxSizeBytes || 10 * 1024 * 1024;
  return file.size <= maxBytes;
};

/**
 * Validates a single file against both type restrictions and file size limits.
 * If invalid, displays a toast error, optionally resets the input, and returns false.
 * 
 * @param {File} file
 * @param {Object} preset - One of FILE_VALIDATION_PRESETS
 * @param {Object} [options]
 * @param {boolean} [options.showToast=true]
 * @param {string} [options.customMessage]
 * @param {Event|React.RefObject|HTMLInputElement} [options.inputTarget]
 * @returns {boolean}
 */
export const validateFile = (file, preset, options = {}) => {
  const { showToast = true, customMessage = "", inputTarget = null } = options;

  if (!file) return false;

  const isTypeValid = isFileTypeValid(file, preset);
  if (!isTypeValid) {
    if (inputTarget) {
      resetFileInput(inputTarget);
    }
    if (showToast) {
      toast.error(customMessage || preset.errorMessage || "Invalid file type.");
    }
    return false;
  }

  const isSizeValid = isFileSizeValid(file, preset);
  if (!isSizeValid) {
    if (inputTarget) {
      resetFileInput(inputTarget);
    }
    if (showToast) {
      const maxLabel = preset.maxSizeLabel || formatFileSize(preset.maxSizeBytes || 10 * 1024 * 1024);
      const actualSize = formatFileSize(file.size);
      const fileName = file.name ? `"${file.name}" ` : "File ";
      toast.error(customMessage || `${fileName}exceeds the ${maxLabel} limit (${actualSize}). Please select a smaller file.`);
    }
    return false;
  }

  return true;
};

/**
 * Validates a FileList or array of Files against both type restrictions and file size limits.
 * 
 * @param {FileList|File[]} files
 * @param {Object} preset - One of FILE_VALIDATION_PRESETS
 * @param {Object} [options]
 * @param {boolean} [options.showToast=true]
 * @param {string} [options.customMessage]
 * @param {Event|React.RefObject|HTMLInputElement} [options.inputTarget]
 * @returns {{ validFiles: File[], invalidFiles: File[], allValid: boolean }}
 */
export const validateFiles = (files, preset, options = {}) => {
  const { showToast = true, customMessage = "", inputTarget = null } = options;
  const fileArray = Array.from(files || []);

  if (fileArray.length === 0) {
    return { validFiles: [], invalidFiles: [], allValid: true };
  }

  const validFiles = [];
  const invalidFiles = [];
  let sizeRejectedCount = 0;
  let typeRejectedCount = 0;

  for (const file of fileArray) {
    if (!isFileTypeValid(file, preset)) {
      invalidFiles.push(file);
      typeRejectedCount++;
    } else if (!isFileSizeValid(file, preset)) {
      invalidFiles.push(file);
      sizeRejectedCount++;
    } else {
      validFiles.push(file);
    }
  }

  const allValid = invalidFiles.length === 0;

  if (!allValid) {
    if (inputTarget) {
      resetFileInput(inputTarget);
    }
    if (showToast) {
      if (customMessage) {
        toast.error(customMessage);
      } else if (fileArray.length === 1) {
        const file = invalidFiles[0];
        if (!isFileTypeValid(file, preset)) {
          toast.error(preset.errorMessage);
        } else {
          const maxLabel = preset.maxSizeLabel || formatFileSize(preset.maxSizeBytes || 10 * 1024 * 1024);
          const actualSize = formatFileSize(file.size);
          const fileName = file.name ? `"${file.name}" ` : "File ";
          toast.error(`${fileName}exceeds the ${maxLabel} limit (${actualSize}). Please select a smaller file.`);
        }
      } else {
        const maxLabel = preset.maxSizeLabel || formatFileSize(preset.maxSizeBytes || 10 * 1024 * 1024);
        const details = [];
        if (sizeRejectedCount > 0) details.push(`${sizeRejectedCount} exceeded ${maxLabel}`);
        if (typeRejectedCount > 0) details.push(`${typeRejectedCount} invalid type`);
        toast.error(`${invalidFiles.length} file(s) rejected (${details.join(", ")}).`);
      }
    }
  }

  return { validFiles, invalidFiles, allValid };
};
