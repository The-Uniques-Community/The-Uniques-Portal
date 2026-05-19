import React from "react";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Add as AddIcon } from "@mui/icons-material";
import ModernButton from "../Buttons/ModernButton";

const BRAND_COLOR = "#ca0019";

const ModernHeader = ({
  title,
  highlight,
  subtitle,
  buttonText,
  onButtonClick,
  buttonIcon,
  action,
  children,
  sx,
}) => {
  const headerAction = action || (onButtonClick && buttonText ? (
    <ModernButton
      startIcon={buttonIcon || <AddIcon sx={{ fontSize: "20px !important", transition: "transform 0.3s ease" }} />}
      onClick={onButtonClick}
    >
      {buttonText}
    </ModernButton>
  ) : null);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 3,
        mb: 5,
        position: "relative",
        p: 2,
        ...sx,
      }}
    >
      {/* Left Side: Title & Subtitle with Cyber Accent Indicator */}
      <Box sx={{ display: "flex", alignItems: "stretch", gap: 2.5, minWidth: 0 }}>
        {/* Sleek Vertical Accent Bar */}
        <Box
          sx={{
            width: "4px",
            background: `linear-gradient(to bottom, ${BRAND_COLOR}, ${alpha(
              BRAND_COLOR,
              0.3
            )})`,
            borderRadius: "4px",
            boxShadow: `0 0 15px ${alpha(BRAND_COLOR, 0.6)}`,
          }}
        />

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 900,
              color: "text.primary",
              letterSpacing: "-0.5px",
              mb: 0.5,
              fontSize: { xs: "1.75rem", md: "2.25rem" },
              lineHeight: 1.12,
            }}
          >
            {title}
            {highlight ? (
              <Box component="span" sx={{ color: BRAND_COLOR }}>
                {" "}
                {highlight}
              </Box>
            ) : null}
          </Typography>
          {subtitle ? (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                letterSpacing: "0.2px",
                opacity: 0.85,
                maxWidth: 760,
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
          {children}
        </Box>
      </Box>

      {/* Right Side: High-End Interactive Deployment Button */}
      {headerAction ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
          {headerAction}
        </Box>
      ) : null}
    </Box>
  );
};

export default ModernHeader;
