/**
 * @file ProjectInsightsSkeleton.jsx
 * @description Pixel-accurate skeleton for Project Insights & Analytics page.
 */

import React from "react";
import { Box, Card, CardContent, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import TableSkeleton from "../TableSkeleton";

const ProjectInsightsSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, minHeight: "100vh", boxSizing: "border-box" }}>
      {/* ModernHeader Skeleton */}
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
        <BaseSkeleton variant="text" width={280} height={38} />
        <BaseSkeleton variant="text" width={380} height={20} />
      </Box>

      {/* 4 Stats Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", borderLeft: "6px solid rgba(0,0,0,0.15)" }}>
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2.5 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <BaseSkeleton variant="text" width={90} height={18} />
                  <BaseSkeleton variant="text" width={50} height={34} />
                </Box>
                <BaseSkeleton variant="circular" width={42} height={42} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid: Table (Left 8) + Team Workload (Right 4) */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <TableSkeleton rows={5} columns={6} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", p: 3, height: "100%", boxSizing: "border-box" }}>
            <BaseSkeleton variant="text" width={160} height={26} sx={{ mb: 3 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {Array.from({ length: 3 }).map((_, idx) => (
                <Box key={idx} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <BaseSkeleton variant="circular" width={36} height={36} />
                    <Box sx={{ flex: 1 }}>
                      <BaseSkeleton variant="text" width={110} height={18} />
                      <BaseSkeleton variant="text" width={70} height={14} />
                    </Box>
                  </Box>
                  <BaseSkeleton variant="rounded" width="100%" height={8} sx={{ borderRadius: "4px" }} />
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectInsightsSkeleton;
