/**
 * @file StatsSkeleton.jsx
 * @description Metric tile grid skeleton matching ModernStatCard layout and geometry.
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import BaseSkeleton from "./BaseSkeleton";

export const StatCardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: "16px",
      border: "1px solid",
      borderColor: "divider",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: 140,
      bgcolor: "background.paper",
      boxSizing: "border-box",
    }}
  >
    {/* Top row: Label + circular icon badge */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
      <BaseSkeleton variant="text" width="60%" height={24} />
      <BaseSkeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
    </Box>

    {/* Metric Value */}
    <BaseSkeleton variant="text" width="45%" height={48} sx={{ mt: 1, mb: 1 }} />

    {/* Bottom Accent line */}
    <BaseSkeleton variant="rounded" width="100%" height={4} sx={{ borderRadius: "2px", mt: "auto" }} />
  </Paper>
);

/**
 * StatsSkeleton
 * @param {Object} props
 * @param {number} [props.count=4]
 * @param {string} [props.className]
 */
const StatsSkeleton = ({ count = 4, className = "" }) => {
  const items = Array.from({ length: count });

  return (
    <Box
      className={
        className ||
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full"
      }
    >
      {items.map((_, idx) => (
        <StatCardSkeleton key={idx} />
      ))}
    </Box>
  );
};

export default StatsSkeleton;
