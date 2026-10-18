/**
 * Video utility functions for embedding YouTube, Vimeo, and direct video sources.
 */

/**
 * Checks if a URL is a YouTube URL
 * @param {string} url
 * @returns {boolean}
 */
export const isYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /(?:youtube\.com|youtu\.be)/i.test(url);
};

/**
 * Checks if a URL is a Vimeo URL
 * @param {string} url
 * @returns {boolean}
 */
export const isVimeoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /vimeo\.com/i.test(url);
};

/**
 * Checks if a URL points to a direct video file (e.g. .mp4, .webm)
 * @param {string} url
 * @returns {boolean}
 */
export const isDirectVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
};

/**
 * Transforms a YouTube watch, share, short, or embed URL into a standard secure embed URL
 * with enablejsapi, origin, and rel parameters to prevent Error 153.
 *
 * @param {string} url
 * @returns {string}
 */
export const getYouTubeEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  let videoId = null;

  // youtu.be/<id>
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch) {
    videoId = shortMatch[1];
  }

  // youtube.com/watch?v=<id>
  if (!videoId) {
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
  }

  // youtube.com/embed/<id>
  if (!videoId) {
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
  }

  // youtube.com/shorts/<id>
  if (!videoId) {
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
    if (shortsMatch) {
      videoId = shortsMatch[1];
    }
  }

  if (!videoId) {
    return url;
  }

  const origin = typeof window !== 'undefined' && window.location?.origin
    ? encodeURIComponent(window.location.origin)
    : '';
  const originParam = origin ? `&origin=${origin}` : '';

  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1${originParam}&rel=0`;
};

/**
 * Transforms a Vimeo URL into an embeddable player URL.
 * @param {string} url
 * @returns {string}
 */
export const getVimeoEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return url;
};
