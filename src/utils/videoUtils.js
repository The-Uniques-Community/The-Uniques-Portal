/**
 * @file videoUtils.js
 * @description Video URL parsers, format detectors, and secure embed URL generators supporting YouTube, Vimeo, and direct HTML5 video assets.
 * @architecture Consumed by video dialogs, learning resource previews, and multimedia portfolio players throughout the application.
 * @agent_note `getYouTubeEmbedUrl` parses short links, watch queries, and YouTube shorts into secure iframe embed URLs with `enablejsapi=1`, origin, and `rel=0` parameters to prevent Error 153.
 */

/**
 * @desc Checks if a given string is a valid YouTube URL.
 * @param {string} url - Target URL to evaluate.
 * @returns {boolean} True if the URL matches YouTube domains.
 */
export const isYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /(?:youtube\.com|youtu\.be)/i.test(url);
};

/**
 * @desc Checks if a given string is a valid Vimeo URL.
 * @param {string} url - Target URL to evaluate.
 * @returns {boolean} True if the URL matches Vimeo domain.
 */
export const isVimeoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /vimeo\.com/i.test(url);
};

/**
 * @desc Checks if a URL points to a direct video file (e.g. .mp4, .webm, .ogg, .mov).
 * @param {string} url - Target URL to evaluate.
 * @returns {boolean} True if the URL ends with a direct video extension.
 */
export const isDirectVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
};

/**
 * @desc Transforms various YouTube URL formats (watch, share, short, embed) into an embed URL with API parameters.
 * @param {string} url - Raw YouTube URL.
 * @returns {string} Sanitized embeddable YouTube URL.
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
 * @desc Transforms a Vimeo video URL into an embeddable player iframe URL.
 * @param {string} url - Raw Vimeo URL.
 * @returns {string} Player embed URL.
 */
export const getVimeoEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return url;
};
