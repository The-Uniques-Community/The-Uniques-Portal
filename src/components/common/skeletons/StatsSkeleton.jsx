/**
 * @file StatsSkeleton.jsx
 * @description Metric tile grid skeleton preserving numbers and card geometry on dashboards.
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import BaseSkeleton from "./BaseSkeleton";

const StatItem = () => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: "14px",
      border: "1px solid",
      borderColor: "divider",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 110,
    }}
  >
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "70%" }}>
      <BaseSkeleton variant="text" width="60%" height={18} />
      <BaseSkeleton variant="text" width="85%" height={32} />
      <BaseSkeleton variant="text" width="40%" height={16} />
    </Box>
    <BaseSkeleton variant="rounded" width={48} height={48} sx={{ borderRadius: "12px" }} />
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
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
      }
    >
      {items.map((_, idx) => (
        <StatItem key={idx} />
      ))}
    </Box>
  );
};

export default StatsSkeleton;
