/**
 * @file ModernButton.jsx
 * @description High-end branded Material UI button with laser flare light sweep animations, 3D lift, and dynamic icon transformations.
 * @architecture Reusable standard action button used in ModernHeader and throughout dashboard view headers for primary actions.
 * @agent_note Implements custom CSS laser sweep animations using `&::before` pseudo-element and cubic-bezier easing curves.
 */

import React from "react";
import { Button } from "@mui/material";
import { alpha } from "@mui/material/styles";

const BRAND_COLOR = "#ca0019";
const BRAND_HOVER = "#a30014";

/**
 * @component ModernButton
 * @description Branded primary action button featuring gradient borders, hover elevation, and diagonal laser flare effect.
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Button label text or content
 * @param {React.ReactNode} [props.startIcon] - Leading icon element
 * @param {Function} [props.onClick] - Click handler callback
 * @param {Object} [props.sx={}] - Material UI sx style overrides
 * @state None - Pure presentation component with CSS transition micro-interactions
 */
const ModernButton = ({ children, startIcon, onClick, sx = {}, ...props }) => {
  return (
    <Button
      variant="contained"
      startIcon={startIcon}
      onClick={onClick}
      sx={{
        textTransform: "none",
        fontWeight: 700,
        fontSize: "14px",
        letterSpacing: "0.5px",
        borderRadius: "12px",
        px: 4,
        height: "46px",
        bgcolor: BRAND_COLOR,
        color: "#ffffff",
        border: `1px solid ${alpha("#ffffff", 0.15)}`,
        boxShadow: `0 8px 24px -6px ${alpha(
          BRAND_COLOR,
          0.4
        )}, inset 0 1px 0 0 rgba(255, 255, 255, 0.25)`,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",

        // Laser flare element
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "50%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)",
          transform: "skewX(-25deg)",
          transition: "none",
        },

        "&:hover": {
          bgcolor: BRAND_HOVER,
          borderColor: alpha(BRAND_COLOR, 0.6),
          boxShadow: `0 12px 30px -4px ${alpha(
            BRAND_COLOR,
            0.6
          )}, 0 0 15px ${alpha(BRAND_COLOR, 0.3)}`,
          transform: "translateY(-3px)",

          // Trigger laser flare on hover
          "&::before": {
            left: "150%",
            transition: "left 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          },

          // Dynamic icon animation
          "& .MuiButton-startIcon": {
            transform: "rotate(90deg) scale(1.1)",
          },
        },
        "&:active": {
          transform: "translateY(-1px)",
          boxShadow: `0 6px 16px -4px ${alpha(BRAND_COLOR, 0.5)}`,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ModernButton;
