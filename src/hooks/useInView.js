/**
 * @file useInView.js
 * @description Viewport visibility observer hook utilizing IntersectionObserver to trigger animations, speculative preloading, or lazy image loading.
 * @architecture Utility hook consumed across card components, gallery grids, and animated sections to defer expensive operations until visible.
 * @agent_note Uses a default `rootMargin` of '200px 0px' to proactively fire before an element touches the visible viewport. If IntersectionObserver is missing, immediately yields the fallback value (true).
 */

import { useEffect, useRef, useState } from "react";

/**
 * @hook useInView
 * @description Custom hook to detect when an element enters or exits the viewport using IntersectionObserver.
 * @param {Object} [options={}] - Hook configuration options.
 * @param {string} [options.rootMargin='200px 0px'] - Pre-trigger buffer margin before element enters screen.
 * @param {number|number[]} [options.threshold=0] - Intersection ratio required to trigger.
 * @param {boolean} [options.once=true] - If true, disconnects observer upon first intersection.
 * @param {boolean} [options.fallback=true] - Fallback boolean if IntersectionObserver is not supported.
 * @returns {[import('react').RefObject<HTMLElement>, boolean]} Tuple containing the targetRef and the inView boolean flag.
 * @sideeffects Attaches and tears down an IntersectionObserver lifecycle binding on targetRef.current.
 */
export function useInView({
  rootMargin = "200px 0px",
  threshold = 0,
  once = true,
  fallback = true,
} = {}) {
  const [inView, setInView] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setInView(fallback);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, once, fallback]);

  return [targetRef, inView];
}

export default useInView;
