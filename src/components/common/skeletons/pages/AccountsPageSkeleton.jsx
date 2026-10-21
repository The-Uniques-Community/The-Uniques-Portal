/**
 * @file AccountsPageSkeleton.jsx
 * @description Pixel-accurate skeleton for Accounts / Financial Management page.
 */

import React from "react";
import { Box, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import { StatCardSkeleton } from "../StatsSkeleton";
import TableSkeleton from "../TableSkeleton";

const AccountsPageSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3 }, boxSizing: "border-box" }}>
      {/* ModernHeader Skeleton */}
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
        <BaseSkeleton variant="text" width={280} height={38} />
        <BaseSkeleton variant="text" width={420} height={20} />
      </Box>

      {/* Overview Stat Cards */}
      <BaseSkeleton variant="text" width={120} height={24} sx={{ mb: 1.5 }} />
      <Box className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </Box>

      {/* Member Status Stat Cards */}
      <BaseSkeleton variant="text" width={150} height={24} sx={{ mb: 1.5 }} />
      <Box className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </Box>

      {/* Charts Section Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Bar Chart (8 cols) */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider", height: 350, boxSizing: "border-box" }}>
            <BaseSkeleton variant="text" width={220} height={26} sx={{ mb: 3 }} />
            <BaseSkeleton variant="rounded" width="100%" height={260} sx={{ borderRadius: "8px" }} />
          </Paper>
        </Grid>
        {/* Pie Chart (4 cols) */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider", height: 350, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box sx={{ width: "100%", mb: 2 }}>
              <BaseSkeleton variant="text" width={180} height={26} />
            </Box>
            <BaseSkeleton variant="circular" width={180} height={180} sx={{ my: 1 }} />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <BaseSkeleton variant="rounded" width={110} height={20} sx={{ borderRadius: "6px" }} />
              <BaseSkeleton variant="rounded" width={90} height={20} sx={{ borderRadius: "6px" }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Transaction Table Skeleton */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: "12px", border: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <BaseSkeleton variant="rounded" width={300} height={40} sx={{ borderRadius: "8px" }} />
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <BaseSkeleton variant="rounded" width={140} height={40} sx={{ borderRadius: "8px" }} />
          <BaseSkeleton variant="rounded" width={160} height={40} sx={{ borderRadius: "8px" }} />
          <BaseSkeleton variant="rounded" width={90} height={40} sx={{ borderRadius: "8px" }} />
        </Box>
      </Paper>
      <TableSkeleton rows={5} columns={6} />
    </Box>
  );
};

export default AccountsPageSkeleton;
