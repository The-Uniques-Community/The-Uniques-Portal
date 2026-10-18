/**
 * @file FeedSkeleton.jsx
 * @description Activity stream and report feed item skeleton for Uniques 360, Notices, and Blogs.
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import BaseSkeleton from "./BaseSkeleton";

const FeedItem = () => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: "14px",
      border: "1px solid",
      borderColor: "divider",
      mb: 2,
      display: "flex",
      gap: 2,
    }}
  >
    <BaseSkeleton variant="circular" width={42} height={42} />
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <BaseSkeleton variant="text" width={140} height={22} />
        <BaseSkeleton variant="text" width={80} height={16} />
      </Box>
      <BaseSkeleton variant="text" width="90%" height={18} />
      <BaseSkeleton variant="text" width="70%" height={18} />
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <BaseSkeleton variant="rounded" width={60} height={22} sx={{ borderRadius: "6px" }} />
        <BaseSkeleton variant="rounded" width={80} height={22} sx={{ borderRadius: "6px" }} />
      </Box>
    </Box>
  </Paper>
);

/**
 * FeedSkeleton
 * @param {Object} props
 * @param {number} [props.count=3]
 * @param {string} [props.className]
 */
const FeedSkeleton = ({ count = 3, className = "" }) => {
  const items = Array.from({ length: count });

  return (
    <Box className={className} sx={{ width: "100%" }}>
      {items.map((_, idx) => (
        <FeedItem key={idx} />
      ))}
    </Box>
  );
};

export default FeedSkeleton;
