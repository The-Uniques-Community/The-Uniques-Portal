/**
 * @file EnquiryPageSkeleton.jsx
 * @description Pixel-accurate skeleton for the Enquiry Management page.
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import TableSkeleton from "../TableSkeleton";

const EnquiryPageSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3, lg: 3 }, boxSizing: "border-box" }}>
      {/* ModernHeader Skeleton */}
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
        <BaseSkeleton variant="text" width={260} height={38} />
        <BaseSkeleton variant="text" width={380} height={20} />
      </Box>

      {/* Filter and Search Section */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", lg: "center" }, mb: 4, gap: 2 }}>
        {/* Tabs Paper */}
        <Paper elevation={0} sx={{ p: 1, border: "1px solid", borderColor: "divider", display: "flex", gap: 1, overflowX: "auto" }}>
          {["All", "New", "Reviewed", "In Progress", "Resolved", "Archived"].map((_, idx) => (
            <BaseSkeleton key={idx} variant="rounded" width={85} height={38} sx={{ borderRadius: "8px", flexShrink: 0 }} />
          ))}
        </Paper>

        {/* Search & Sort Controls */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <BaseSkeleton variant="rounded" width={240} height={40} sx={{ borderRadius: "8px" }} />
          <BaseSkeleton variant="rounded" width={160} height={40} sx={{ borderRadius: "8px" }} />
        </Box>
      </Box>

      {/* ModernTable (6 columns) */}
      <TableSkeleton rows={6} columns={6} />
    </Box>
  );
};

export default EnquiryPageSkeleton;
