import React from "react";
import PropTypes from "prop-types";
import { useInView } from "@/hooks/useInView";

/**
 * LazyRender component for deferred viewport rendering.
 * Defers mounting heavy React components until they are near or within the viewport.
 * Avoids initial DOM pollution, unnecessary lifecycle execution, and layout shifts (zero CLS).
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
