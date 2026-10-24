/**
 * @file SuccessStoriesSkeleton.jsx
 * @description Pixel-accurate skeleton for the Success Stories page.
 */

import React from "react";
import { Box, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";

const SuccessStoriesSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 3 }, boxSizing: "border-box" }}>
      {/* Breadcrumb & Header Skeleton */}
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="text" width={180} height={24} sx={{ mb: 1 }} />
        <BaseSkeleton variant="text" width={260} height={36} sx={{ mb: 1 }} />
        <BaseSkeleton variant="text" width="60%" height={20} />
      </Box>

      {/* Top 4 Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                height: 130,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <BaseSkeleton variant="text" width={100} height={20} />
                <BaseSkeleton variant="circular" width={40} height={40} />
              </Box>
              <BaseSkeleton variant="text" width={60} height={36} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <BaseSkeleton variant="rounded" width={320} height={42} sx={{ borderRadius: "8px" }} />
        <Box sx={{ display: "flex", gap: 1 }}>
          {[1, 2, 3, 4].map((i) => (
            <BaseSkeleton key={i} variant="rounded" width={90} height={36} sx={{ borderRadius: "20px" }} />
          ))}
        </Box>
      </Paper>

      {/* Cards Grid */}
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <Grid item xs={12} sm={6} lg={4} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.25, sm: 2.75 },
                borderRadius: "20px",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 380,
                boxSizing: "border-box",
              }}
            >
              <Box>
                {/* Top Status & Batch Row Skeleton */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.2 }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <BaseSkeleton variant="rounded" width={85} height={26} sx={{ borderRadius: "8px" }} />
                    <BaseSkeleton variant="rounded" width={65} height={26} sx={{ borderRadius: "20px" }} />
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.75 }}>
                    <BaseSkeleton variant="circular" width={32} height={32} />
                    <BaseSkeleton variant="circular" width={32} height={32} />
                  </Box>
                </Box>

                {/* Candidate Identity Skeleton */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.2 }}>
                  <BaseSkeleton variant="circular" width={62} height={62} sx={{ flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <BaseSkeleton variant="text" width="70%" height={26} sx={{ mb: 0.5 }} />
                    <BaseSkeleton variant="text" width="90%" height={18} />
                  </Box>
                </Box>

                {/* Testimonial Quote Box Skeleton */}
                <Box sx={{ p: 1.6, borderRadius: "12px", border: "1px solid", borderColor: "divider", mb: 2 }}>
                  <BaseSkeleton variant="text" width="100%" height={18} />
                  <BaseSkeleton variant="text" width="95%" height={18} />
                  <BaseSkeleton variant="text" width="60%" height={18} />
                </Box>

                {/* Skill Chips Skeleton */}
                <Box sx={{ display: "flex", gap: 0.75, mb: 2.25 }}>
                  <BaseSkeleton variant="rounded" width={65} height={25} sx={{ borderRadius: "8px" }} />
                  <BaseSkeleton variant="rounded" width={75} height={25} sx={{ borderRadius: "8px" }} />
                  <BaseSkeleton variant="rounded" width={60} height={25} sx={{ borderRadius: "8px" }} />
                  <BaseSkeleton variant="rounded" width={34} height={25} sx={{ borderRadius: "8px" }} />
                </Box>
              </Box>

              {/* View Details Button Skeleton */}
              <BaseSkeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: "12px" }} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SuccessStoriesSkeleton;
