/**
 * @file StatsPageSkeleton.jsx
 * @description Pixel-accurate skeleton for the Stats & Impact Management page.
 */

import React from "react";
import { Box, Card, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";

const StatsPageSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto", boxSizing: "border-box" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <BaseSkeleton variant="text" width={280} height={38} />
          <BaseSkeleton variant="text" width={440} height={20} />
        </Box>
        <BaseSkeleton variant="rounded" width={130} height={40} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* Live Preview Cards Section */}
      <BaseSkeleton variant="text" width={240} height={26} sx={{ mb: 2 }} />
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BaseSkeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "8px", mr: 2 }} />
                <BaseSkeleton variant="rounded" width="50%" height={2} />
              </Box>
              <BaseSkeleton variant="text" width="60%" height={36} />
              <BaseSkeleton variant="text" width="70%" height={18} sx={{ mt: 0.5 }} />
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Form Card */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <BaseSkeleton variant="text" width={200} height={28} sx={{ mb: 1 }} />
        <BaseSkeleton variant="text" width={380} height={20} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <BaseSkeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: "8px" }} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "space-between", pt: 2 }}>
              <BaseSkeleton variant="rounded" width={140} height={42} sx={{ borderRadius: "8px" }} />
              <BaseSkeleton variant="rounded" width={140} height={42} sx={{ borderRadius: "8px" }} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StatsPageSkeleton;
