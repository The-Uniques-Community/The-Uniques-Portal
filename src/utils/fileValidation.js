import { toast } from "react-toastify";

/**
 * Standard presets for file upload validation across the frontend.
 * Each preset specifies supported file extensions, MIME types, HTML accept string,
 * and a standard user-facing error message.
 */
export const FILE_VALIDATION_PRESETS = {
  IMAGE: {
    name: "IMAGE",
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
    errorMessage: "Invalid file type. Only JPG, PNG, and WEBP image files are allowed.",
  },
  RECEIPT: {
    name: "RECEIPT",
    extensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    accept: ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp",
    errorMessage: "Invalid file type. Please upload a receipt in PDF, JPG, PNG, or WEBP format.",
  },
  CERTIFICATE: {
    name: "CERTIFICATE",
    extensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    accept: ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp",
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
    errorMessage: "Invalid file type. Only PDF, Word documents, and images (JPG, PNG, WEBP) are allowed.",
  },
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
 * Validates a single file against a preset.
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

  const isValid = isFileTypeValid(file, preset);
  if (!isValid) {
    if (inputTarget) {
      resetFileInput(inputTarget);
    }
    if (showToast) {
      toast.error(customMessage || preset.errorMessage || "Invalid file type.");
    }
    return false;
  }

  return true;
};

/**
 * Validates a FileList or array of Files against a preset.
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

  for (const file of fileArray) {
    if (isFileTypeValid(file, preset)) {
      validFiles.push(file);
    } else {
      invalidFiles.push(file);
    }
  }

  const allValid = invalidFiles.length === 0;

  if (!allValid) {
    if (inputTarget) {
      resetFileInput(inputTarget);
    }
    if (showToast) {
      toast.error(
        customMessage ||
        (fileArray.length === 1
          ? preset.errorMessage
          : `${invalidFiles.length} file(s) rejected. ${preset.errorMessage}`)
      );
    }
  }

  return { validFiles, invalidFiles, allValid };
};
