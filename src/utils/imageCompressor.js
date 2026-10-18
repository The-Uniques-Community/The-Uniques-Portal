/**
 * @file imageCompressor.js
 * @description Client-side image compression and resizing utility using HTML5 Canvas.
 * Reduces payload size before uploading to server/cloud storage.
 */

/**
 * Compresses and downscales an image File in browser memory.
 * 
 * @param {File} file - The raw input file from file input or drag-and-drop.
 * @param {Object} [options] - Configuration options.
 * @param {number} [options.maxWidth=1920] - Maximum width constraint.
 * @param {number} [options.maxHeight=1080] - Maximum height constraint.
 * @param {number} [options.quality=0.85] - Compression quality (0 to 1).
 * @param {number} [options.maxSizeBytes=2097152] - Files under this size without excessive dimensions won't be recompressed.
 * @returns {Promise<File>} Compressed File or original if compression is not needed/supported.
 */
export const compressImage = async (file, options = {}) => {
  if (typeof window === "undefined" || !file || !file.type.startsWith("image/")) {
    return file;
  }

  // GIFs should not be compressed with canvas (it loses frames)
  if (file.type === "image/gif") {
    return file;
  }

  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    maxSizeBytes = 2 * 1024 * 1024, // 2MB
  } = options;

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      const needsResize = width > maxWidth || height > maxHeight;
      const needsSizeReduction = file.size > maxSizeBytes;

      // If dimensions are fine and file is already under threshold, keep original
      if (!needsResize && !needsSizeReduction) {
        resolve(file);
        return;
      }

      // Calculate constrained dimensions keeping aspect ratio
      if (needsResize) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output MIME type (WebP preferred, fallback to JPEG)
      const outputMime = "image/webp";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If compression somehow produced a larger file, retain original
          if (blob.size >= file.size && !needsResize) {
            resolve(file);
            return;
          }

          const newFileName = file.name.replace(/\.[^/.]+$/, ".webp");
          const compressedFile = new File([blob], newFileName, {
            type: outputMime,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        outputMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
};
