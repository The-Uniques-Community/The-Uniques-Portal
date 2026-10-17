import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link } from "react-router-dom";

const ModernStatCard = ({
  label,
  value,
  icon,
  color,
  gradient,
  link,
  onClick,
}) => {
  const isSelected = false; // This can be controlled by a parent component if needed

  const cardContent = (
    <Paper
      onClick={onClick}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        borderRadius: "16px",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.9
          )} 50%, ${alpha(color, 0.1)} 100%), ${gradient}`,
        border: `1px solid ${alpha(color, isSelected ? 0.7 : 0.3)}`,
        boxShadow: isSelected
          ? `0 0 25px ${alpha(
              color,
              0.5
            )}, 0 4px 12px rgba(0,0,0,0.1), inset 0 0 10px ${alpha(
              color,
              0.2
            )}`
          : `0 4px 12px rgba(0,0,0,0.05)`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 20px ${alpha(
            color,
            0.3
          )}, 0 0 15px ${alpha(color, 0.1)}`,
          borderColor: alpha(color, 0.7),
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            color: color,
            background: alpha(color, 0.15),
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: "text.primary",
          mt: 2,
          mb: 1,
          fontSize: "2.5rem",
        }}
      >
        {value}
      </Typography>
      <Box
        sx={{
          height: "4px",
          width: "100%",
          background: alpha(color, 0.3),
          borderRadius: "2px",
          mt: "auto",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            background: color,
            borderRadius: "2px",
          }}
        />
      </Box>
    </Paper>
  );

  if (link) {
    return (
      <Link to={link} style={{ textDecoration: "none", width: "100%" }}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default ModernStatCard;
