/**
 * @file MembersPageSkeleton.jsx
 * @description Pixel-accurate skeleton for the Members Overview page.
 */

import React from "react";
import { Box, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import { MemberCardSkeleton } from "../CardSkeleton";

const MembersPageSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: 3, boxSizing: "border-box" }}>
      {/* Batch Tabs Bar */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5, pb: 1, display: "flex", gap: 1.5, overflowX: "auto" }}>
        {["All Batches", "Uniques 1.0", "Uniques 2.0", "Uniques 3.0", "Uniques 4.0", "Uniques 5.0", "Uniques 6.0"].map((_, idx) => (
          <BaseSkeleton key={idx} variant="rounded" width={110} height={36} sx={{ borderRadius: "8px", flexShrink: 0 }} />
        ))}
      </Box>

      {/* SearchFilterBar */}
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
          bgcolor: "background.paper",
        }}
      >
        <BaseSkeleton variant="rounded" width={320} height={40} sx={{ borderRadius: "8px" }} />
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <BaseSkeleton variant="rounded" width={100} height={40} sx={{ borderRadius: "8px" }} />
          <BaseSkeleton variant="rounded" width={130} height={40} sx={{ borderRadius: "8px" }} />
        </Box>
      </Paper>

      {/* Grid of Member Cards */}
      <Grid container spacing={3}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
            <MemberCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MembersPageSkeleton;
