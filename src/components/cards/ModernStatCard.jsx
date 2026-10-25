import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link } from "react-router-dom";
import NorthEastIcon from "@mui/icons-material/NorthEast";

const ModernStatCard = ({
  label,
  value,
  icon,
  color = "#ca0019",
  gradient,
  link,
  onClick,
  progress = 65,
}) => {
  const isSelected = false;

  const cardContent = (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 2.25,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        borderRadius: "14px",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.06)",
          borderColor: alpha(color, 0.4),
        },
      }}
    >
      {/* Top Header Row: Icon + Label on left, tiny ↗ arrow on right */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          <Box
            sx={{
              color: color,
              background: alpha(color, 0.1),
              borderRadius: "10px",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              "& svg": {
                fontSize: "1.1rem",
              },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              fontSize: "0.86rem",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </Typography>
        </Box>

        {/* Up-Right Arrow Icon */}
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "6px",
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <NorthEastIcon sx={{ fontSize: 13 }} />
        </Box>
      </Box>

      {/* Middle Stat Value */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: "text.primary",
          my: 1,
          fontSize: { xs: "1.65rem", sm: "1.95rem" },
          lineHeight: 1.15,
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </Typography>

      {/* Bottom Horizontal Line */}
      <Box
        sx={{
          height: "3px",
          width: "100%",
          background: alpha(color, 0.1),
          borderRadius: "2px",
          mt: "auto",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${progress}%`,
            background: color,
            borderRadius: "2px",
          }}
        />
      </Box>
    </Paper>
  );

  const hasValidLink = Boolean(link && typeof link === "string" && link.trim() !== "");

  if (hasValidLink) {
    return (
      <Link
        to={link}
        style={{
          textDecoration: "none",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {cardContent}
    </Box>
  );
};

export default ModernStatCard;
