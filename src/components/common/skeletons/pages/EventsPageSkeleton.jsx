/**
 * @file EventsPageSkeleton.jsx
 * @description Pixel-accurate skeleton for the Events Overview page.
 */

import React from "react";
import { Box, Card, CardContent, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import TableSkeleton from "../TableSkeleton";

const EventsPageSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 1.5, sm: 2, md: 3 }, boxSizing: "border-box" }}>
      {/* ModernHeader Skeleton */}
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
        <BaseSkeleton variant="text" width={260} height={38} />
        <BaseSkeleton variant="text" width={380} height={20} />
      </Box>

      {/* 4 Stats Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <BaseSkeleton variant="text" width="60%" height={18} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <BaseSkeleton variant="circular" width={36} height={36} />
                  <BaseSkeleton variant="text" width="40%" height={32} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table Header Bar: Title + Create Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <BaseSkeleton variant="text" width={140} height={32} />
        <BaseSkeleton variant="rounded" width={160} height={40} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* Events Table */}
      <TableSkeleton rows={6} columns={8} />
    </Box>
  );
};

export default EventsPageSkeleton;
