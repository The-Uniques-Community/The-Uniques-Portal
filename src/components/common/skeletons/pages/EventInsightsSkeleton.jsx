/**
 * @file EventInsightsSkeleton.jsx
 * @description Pixel-accurate skeleton for Event Insights & Analytics page.
 */

import React from "react";
import { Box, Card, CardContent, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import TableSkeleton from "../TableSkeleton";

const EventInsightsSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, minHeight: "100vh", boxSizing: "border-box" }}>
      {/* ModernHeader Skeleton */}
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
        <BaseSkeleton variant="text" width={280} height={38} />
        <BaseSkeleton variant="text" width={460} height={20} />
      </Box>

      {/* 4 Stats Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Grid item xs={6} md={3} key={idx}>
            <Card elevation={0} sx={{ borderRadius: "12px", border: "1px solid", borderColor: "divider", borderLeft: "5px solid rgba(0,0,0,0.15)" }}>
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <BaseSkeleton variant="text" width={90} height={16} />
                  <BaseSkeleton variant="text" width={50} height={34} />
                </Box>
                <BaseSkeleton variant="rounded" width={38} height={38} sx={{ borderRadius: "8px" }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid: Table (Left 7) + Live Stream Manifest (Right 5) */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <TableSkeleton rows={5} columns={6} />
        </Grid>
        <Grid item xs={12} lg={5}>
          <Card elevation={0} sx={{ borderRadius: "14px", border: "1px solid", borderColor: "divider", overflow: "hidden", height: "100%", boxSizing: "border-box" }}>
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <BaseSkeleton variant="text" width={180} height={24} />
            </Box>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <BaseSkeleton variant="circular" width={36} height={36} sx={{ flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <BaseSkeleton variant="text" width="70%" height={18} />
                    <BaseSkeleton variant="text" width="90%" height={14} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventInsightsSkeleton;
