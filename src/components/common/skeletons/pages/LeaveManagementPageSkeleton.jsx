/**
 * @file LeaveManagementPageSkeleton.jsx
 * @description Pixel-accurate skeleton for the Admin/Coordinator Leave Management page.
 */

import React from "react";
import { Box, Container, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import TableSkeleton from "../TableSkeleton";

const LeaveManagementPageSkeleton = () => {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 }, boxSizing: "border-box" }}>
      {/* ModernHeader Skeleton */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <BaseSkeleton variant="text" width={260} height={38} />
          <BaseSkeleton variant="text" width={400} height={20} />
        </Box>
        <BaseSkeleton variant="rounded" width={110} height={40} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* SearchFilterBar with Status Tabs */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: "12px", border: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <BaseSkeleton variant="rounded" width={280} height={40} sx={{ borderRadius: "8px" }} />
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <BaseSkeleton variant="rounded" width={90} height={36} sx={{ borderRadius: "8px" }} />
          <BaseSkeleton variant="rounded" width={90} height={36} sx={{ borderRadius: "8px" }} />
          <BaseSkeleton variant="rounded" width={90} height={36} sx={{ borderRadius: "8px" }} />
        </Box>
      </Paper>

      {/* ModernTable (8 columns) */}
      <TableSkeleton rows={6} columns={8} />
    </Container>
  );
};

export default LeaveManagementPageSkeleton;
