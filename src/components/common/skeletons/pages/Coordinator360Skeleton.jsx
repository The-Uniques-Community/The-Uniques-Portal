/**
 * @file Coordinator360Skeleton.jsx
 * @description Pixel-accurate skeleton for Uniques 360 Coordinator workspace.
 */

import React from "react";
import { Box, Card, CardContent, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import TableSkeleton from "../TableSkeleton";

const Coordinator360Skeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, minHeight: "100vh", boxSizing: "border-box" }}>
      {/* ModernHeader Skeleton */}
      <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <BaseSkeleton variant="text" width={280} height={38} />
          <BaseSkeleton variant="text" width={440} height={20} />
        </Box>
        <BaseSkeleton variant="rounded" width={160} height={42} sx={{ borderRadius: "10px" }} />
      </Box>

      {/* 4 Status Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "14px",
                border: "1px solid",
                borderColor: "divider",
                height: "110px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                <BaseSkeleton variant="text" width={110} height={16} />
                <BaseSkeleton variant="text" width={60} height={32} />
              </Box>
              <BaseSkeleton variant="circular" width={40} height={40} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Control Filters Bar Card */}
      <Card elevation={0} sx={{ mb: 4, borderRadius: "16px", border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <BaseSkeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: "10px" }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <BaseSkeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: "10px" }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <BaseSkeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: "10px" }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Task Table */}
      <TableSkeleton rows={6} columns={7} />
    </Box>
  );
};

export default Coordinator360Skeleton;
