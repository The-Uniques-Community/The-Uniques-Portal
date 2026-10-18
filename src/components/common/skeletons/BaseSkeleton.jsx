/**
 * @file BaseSkeleton.jsx
 * @description Foundation skeleton component wrapping MUI Skeleton with wave animation and theme awareness.
 */

import React from "react";
import { Skeleton } from "@mui/material";

/**
 * BaseSkeleton component.
 * @param {Object} props
 * @param {'text'|'circular'|'rectangular'|'rounded'} [props.variant='rounded']
 * @param {string|number} [props.width]
 * @param {string|number} [props.height]
 * @param {'wave'|'pulse'|false} [props.animation='wave']
 * @param {Object} [props.sx]
 * @param {string} [props.className]
 */
const BaseSkeleton = ({
  variant = "rounded",
  width,
  height,
  animation = "wave",
  sx = {},
  className = "",
  ...rest
}) => {
  return (
    <Skeleton
      variant={variant}
      width={width}
      height={height}
      animation={animation}
      className={className}
      sx={{
        borderRadius: variant === "rounded" ? "10px" : undefined,
        ...sx,
      }}
      {...rest}
    />
  );
};

export default BaseSkeleton;
