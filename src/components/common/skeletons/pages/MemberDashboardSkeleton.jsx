/**
 * @file MemberDashboardSkeleton.jsx
 * @description Pixel-accurate skeleton for the Member Dashboard page.
 */

import React from "react";
import { Box, Container, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";

const MemberDashboardSkeleton = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3, boxSizing: "border-box" }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <BaseSkeleton variant="circular" width={20} height={20} />
        <BaseSkeleton variant="text" width={110} height={20} />
      </Box>

      {/* Member Profile Header Paper */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Grid container spacing={3} alignItems="center">
          {/* Avatar (Left) */}
          <Grid item xs={12} sm={3} md={2} sx={{ display: "flex", justifyContent: "center" }}>
            <BaseSkeleton variant="circular" width={120} height={120} />
          </Grid>

          {/* Member Details (Center) */}
          <Grid item xs={12} sm={9} md={6}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <BaseSkeleton variant="text" width={220} height={34} />
                <BaseSkeleton variant="rounded" width={75} height={24} sx={{ borderRadius: "12px" }} />
              </Box>
              <BaseSkeleton variant="text" width={180} height={20} />
              <BaseSkeleton variant="text" width={240} height={18} />
              <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                <BaseSkeleton variant="circular" width={36} height={36} />
                <BaseSkeleton variant="circular" width={36} height={36} />
                <BaseSkeleton variant="circular" width={36} height={36} />
                <BaseSkeleton variant="circular" width={36} height={36} />
              </Box>
            </Box>
          </Grid>

          {/* Action Button (Right) */}
          <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
            <BaseSkeleton variant="rounded" width={140} height={42} sx={{ borderRadius: "8px" }} />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Navigation Row */}
      <Box sx={{ display: "flex", gap: 2, borderBottom: 1, borderColor: "divider", pb: 1.5, mb: 3 }}>
        <BaseSkeleton variant="rounded" width={100} height={36} sx={{ borderRadius: "8px" }} />
        <BaseSkeleton variant="rounded" width={110} height={36} sx={{ borderRadius: "8px" }} />
        <BaseSkeleton variant="rounded" width={90} height={36} sx={{ borderRadius: "8px" }} />
        <BaseSkeleton variant="rounded" width={110} height={36} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* Tab Content Panels */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 2 }}>
            <BaseSkeleton variant="text" width={160} height={24} />
            <BaseSkeleton variant="text" width="95%" height={18} />
            <BaseSkeleton variant="text" width="90%" height={18} />
            <BaseSkeleton variant="text" width="80%" height={18} />
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <BaseSkeleton variant="rounded" width="100%" height={70} sx={{ borderRadius: "10px" }} />
              <BaseSkeleton variant="rounded" width="100%" height={70} sx={{ borderRadius: "10px" }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 2 }}>
            <BaseSkeleton variant="text" width={140} height={24} />
            <BaseSkeleton variant="rounded" width="100%" height={50} sx={{ borderRadius: "8px" }} />
            <BaseSkeleton variant="rounded" width="100%" height={50} sx={{ borderRadius: "8px" }} />
            <BaseSkeleton variant="rounded" width="100%" height={50} sx={{ borderRadius: "8px" }} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MemberDashboardSkeleton;
