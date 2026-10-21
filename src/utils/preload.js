/**
 * Speculative preloading utility for dynamic import functions.
 * Can be triggered on interactive element hover or focus (e.g. onMouseEnter).
 *
 * @param {Function} importFn - A function returning dynamic import(), e.g. () => import('./MyModal')
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
