/**
 * @file RouteLoader.jsx
 * @description Higher-Order Component (HOC) factory that wraps lazy-loaded route views in React Suspense with fallback skeleton loaders.
 * @architecture Used in route configuration modules (`src/routes/` or router trees) to gracefully handle code-split chunk resolution.
 * @agent_note Returns an enhanced wrapper component. Defaults fallback to `PageSkeleton` unless custom fallback component is provided.
 */

import { Suspense } from "react";
import { PageSkeleton } from "@/components/common/skeletons";

/**
 * @desc Higher-order component factory for wrapping views with Suspense boundary.
 * @param {React.ComponentType} Component - Lazy loaded component to wrap
 * @param {boolean} [hasFallback=true] - Whether to apply Suspense fallback boundary
 * @param {React.ComponentType} [FallbackComponent=PageSkeleton] - Custom fallback skeleton component
 * @returns {Function} Higher-order component accepting props and rendering within Suspense
 */
const index = (Component, hasFallback = true, FallbackComponent = PageSkeleton) => (props) =>
  hasFallback ? (
    <Suspense fallback={<FallbackComponent />}>
      <Component {...props} />
    </Suspense>
  ) : (
    <Component {...props} />
  );

export default index;
