import React from "react";
import { Box, Button, Typography, Stack, useTheme, Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Link } from "react-router";

export default function Banner(props) {
  const theme = useTheme();
  const brand = "#ca0019";

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        justifyContent: "space-between",
        gap: { xs: 4, lg: 6 },
        minHeight: { xs: 300, md: 328 },
        overflow: "hidden",
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, ${alpha("#111111", 0.98)} 0%, ${alpha("#29060a", 0.98)} 58%, ${alpha(brand, 0.92)} 100%)`
            : `linear-gradient(135deg, #161616 0%, #32070d 54%, ${brand} 100%)`,
        py: { xs: 4, md: 5.5 },
        px: { xs: 3, md: 6 },
        borderRadius: "18px",
        my: 2,
        border: `1px solid ${alpha(brand, 0.45)}`,
        boxShadow: `0 24px 70px ${alpha("#000", theme.palette.mode === "dark" ? 0.35 : 0.16)}`,
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 86% 16%, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at 8% 92%, rgba(255,255,255,0.1), transparent 24%)",
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: 650 }}>
        <Chip
          icon={<TrendingUpOutlinedIcon sx={{ fontSize: "16px !important" }} />}
          label="Admin Command Center"
          sx={{
            mb: 2.5,
            color: "white",
            borderRadius: "6px",
            bgcolor: alpha("#fff", 0.12),
            border: `1px solid ${alpha("#fff", 0.18)}`,
            fontWeight: 700,
            "& .MuiChip-icon": { color: "white" },
          }}
        />

        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: "2rem", md: "3.15rem" },
            color: "white",
            mb: 1.75,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: "-0.8px",
            maxWidth: 590,
          }}
        >
          Manage members through this dashboard
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: alpha("#fff", 0.82),
            fontWeight: 500,
            mb: 4,
            lineHeight: 1.7,
            maxWidth: 500,
          }}
        >
          Manage members, events, fines, campus activity, and service workflows from one polished operational workspace.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
          <Link to="members-overview" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              startIcon={<PeopleAltOutlinedIcon />}
              sx={{
                height: 48,
                backgroundColor: "white",
                color: brand,
                fontWeight: 800,
                fontSize: "14px",
                px: 3,
                borderRadius: "8px",
                textTransform: "none",
                boxShadow: `0 14px 30px ${alpha("#000", 0.22)}`,
                ":hover": { backgroundColor: alpha("#fff", 0.92), transform: "translateY(-1px)" },
              }}
            >
              Manage Students
            </Button>
          </Link>

          <Link to="events-overview" style={{ textDecoration: "none" }}>
            <Button
              variant="outlined"
              startIcon={<EventAvailableOutlinedIcon />}
              sx={{
                height: 48,
                px: 3,
                borderRadius: "8px",
                color: "white",
                borderColor: alpha("#fff", 0.34),
                bgcolor: alpha("#fff", 0.08),
                textTransform: "none",
                fontWeight: 800,
                "&:hover": {
                  borderColor: alpha("#fff", 0.65),
                  bgcolor: alpha("#fff", 0.13),
                },
              }}
            >
              Manage Events
            </Button>
          </Link>
        </Stack>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          alignSelf: { xs: "stretch", lg: "center" },
          width: { xs: "100%", lg: 340 },
          p: 2,
          borderRadius: "14px",
          border: `1px solid ${alpha("#fff", 0.18)}`,
          bgcolor: alpha("#fff", 0.09),
          backdropFilter: "blur(10px)",
        }}
      >
        {[
          ["Members", "Active records"],
          ["Events", "Calendar synced"],
          ["Finance", "Fine tracking"],
        ].map(([label, value]) => (
          <Box
            key={label}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1.4,
              borderBottom: label === "Finance" ? "none" : `1px solid ${alpha("#fff", 0.12)}`,
            }}
          >
            <Typography sx={{ color: alpha("#fff", 0.72), fontSize: 13, fontWeight: 700 }}>
              {label}
            </Typography>
            <Typography sx={{ color: "white", fontSize: 13, fontWeight: 800 }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
