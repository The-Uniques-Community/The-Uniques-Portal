/**
 * @file preload.js
 * @description Speculative component chunk preloader enabling proactive lazy-loading upon interactive UI events (hover, focus).
 * @architecture Invoked by buttons, navigation menu items, and modals to download async JavaScript chunks before user activation.
 * @agent_note Silently catches and absorbs both synchronous exceptions and asynchronous network failures so prefetch errors never bubble to error boundaries.
 */

/**
 * @desc Speculatively triggers a dynamic import promise to cache code-split bundles ahead of user navigation.
 * @param {Function} importFn - Function returning a dynamic import call, e.g. () => import('./TargetComponent').
 * @returns {void}
 */
export const preloadComponent = (importFn) => {
  if (typeof importFn !== "function") return;
  try {
    const promise = importFn();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        // Silently swallow prefetch network failures
      });
    }
  } catch {
    // Ignore synchronous exceptions
  }
};

export default preloadComponent;
