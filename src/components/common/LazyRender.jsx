/**
 * @file LazyRender.jsx
 * @description Viewport-triggered deferred component renderer using Intersection Observer and CSS content-visibility for zero layout shifts.
 * @architecture Used to wrap below-the-fold or resource-intensive sections (like complex charts, 3D orbits, tables) to maximize initial load performance.
 * @agent_note Defers child component mounting until within viewport margin (`rootMargin`). Uses `containIntrinsicSize` to reserve height and prevent CLS.
 */

import React from "react";
import PropTypes from "prop-types";
import { useInView } from "@/hooks/useInView";

/**
 * @component LazyRender
 * @description Defers mounting heavy React components until they are near or within the viewport, avoiding initial DOM pollution and layout shifts.
 * @param {Object} props - Component properties
 * @param {React.ReactNode|Function} props.children - Child elements or render function to execute when in view
 * @param {React.ReactNode} [props.placeholder=null] - Optional fallback node while off-screen
 * @param {string|number} [props.minHeight="200px"] - Minimum height reserved before mount to prevent CLS
 * @param {string} [props.rootMargin="200px 0px"] - Viewport proximity margin triggering mount early
 * @param {number} [props.threshold=0] - Visibility threshold (0-1) required to trigger in-view
 * @param {boolean} [props.once=true] - Whether to stay mounted once viewed or unmount when leaving
 * @param {string} [props.className=""] - Optional wrapper container CSS classes
 * @param {Object} [props.style={}] - Optional inline styles for wrapper container
 * @state Consumes `useInView` hook for viewport intersection tracking
 */
const LazyRender = ({
  children,
  placeholder = null,
  minHeight = "200px",
  rootMargin = "200px 0px",
  threshold = 0,
  once = true,
  className = "",
  style = {},
}) => {
  const [containerRef, inView] = useInView({ rootMargin, threshold, once });

  const containerStyle = {
    minHeight: inView ? undefined : minHeight,
    contentVisibility: "auto",
    containIntrinsicSize: `auto ${minHeight}`,
    ...style,
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      {inView ? (
        typeof children === "function" ? children() : children
      ) : (
        placeholder || <div style={{ minHeight, width: "100%" }} />
      )}
    </div>
  );
};

LazyRender.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  placeholder: PropTypes.node,
  minHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rootMargin: PropTypes.string,
  threshold: PropTypes.number,
  once: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default LazyRender;
